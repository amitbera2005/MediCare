const express = require('express')

const {
  createAppointment,
  getAppointments,
  getBookedTimes,
  updateAppointmentStatus,
  deleteAppointment,
  getPatientAppointments,
} = require('../controllers/appointmentController')

const adminAuth = require('../middleware/adminAuth')


const router = express.Router()


/* =========================================
   PUBLIC
========================================= */

// Patient booking
router.post(
  '/',
  createAppointment
)


// Patient can check availability
router.get(
  '/availability',
  getBookedTimes
)
router.get('/patient', getPatientAppointments)

/* =========================================
   ADMIN ONLY
========================================= */

router.get(
  '/',
  adminAuth,
  getAppointments
)


router.put(
  '/:id/status',
  adminAuth,
  updateAppointmentStatus
)


router.delete(
  '/:id',
  adminAuth,
  deleteAppointment
)


module.exports = router