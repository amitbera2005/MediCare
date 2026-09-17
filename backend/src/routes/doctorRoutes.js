const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController')

const adminAuth = require('../middleware/adminAuth')


const router = express.Router()


/* ============================= */
/* UPLOAD DIRECTORY */
/* ============================= */

const uploadDirectory =
  path.join(
    __dirname,
    '../../uploads/doctors'
  )


if (!fs.existsSync(uploadDirectory)) {

  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  )

}


/* ============================= */
/* MULTER STORAGE */
/* ============================= */

const storage =
  multer.diskStorage({

    destination: (req, file, cb) => {

      cb(
        null,
        uploadDirectory
      )

    },

    filename: (req, file, cb) => {

      const extension =
        path.extname(
          file.originalname
        ).toLowerCase()

      const uniqueName =
        `doctor-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`

      cb(
        null,
        uniqueName
      )

    },

  })


/* ============================= */
/* FILE FILTER */
/* ============================= */

const fileFilter =
  (req, file, cb) => {

    if (
      file.mimetype &&
      file.mimetype.startsWith('image/')
    ) {

      cb(
        null,
        true
      )

    } else {

      cb(
        new Error(
          'Only image files are allowed'
        ),
        false
      )

    }

  }


/* ============================= */
/* MULTER */
/* ============================= */

const upload =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

  })


/* ============================= */
/* PUBLIC ROUTES */
/* ============================= */

router.get(
  '/',
  getDoctors
)

router.get(
  '/:id',
  getDoctor
)


/* ============================= */
/* ADMIN ROUTES */
/* ============================= */

router.post(
  '/',
  adminAuth,
  upload.single('image'),
  createDoctor
)


router.put(
  '/:id',
  adminAuth,
  upload.single('image'),
  updateDoctor
)


router.delete(
  '/:id',
  adminAuth,
  deleteDoctor
)


/* ============================= */
/* MULTER ERROR HANDLER */
/* ============================= */

router.use(
  (error, req, res, next) => {

    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code === 'LIMIT_FILE_SIZE'
      ) {

        return res.status(400).json({
          success: false,
          message:
            'Doctor image must be smaller than 5MB.',
        })

      }

      return res.status(400).json({
        success: false,
        message:
          error.message,
      })

    }


    if (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Image upload failed',
      })

    }


    next()

  }
)


module.exports = router