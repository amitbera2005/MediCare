const pool = require('../config/db')


/* ============================= */
/* GET ALL DOCTORS - PUBLIC */
/* ============================= */

const getDoctors = async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT *
       FROM doctors
       ORDER BY id ASC`
    )

    res.json({
      success: true,
      doctors: result.rows,
    })

  } catch (error) {

    console.error(
      'Fetch doctors error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
    })

  }

}


/* ============================= */
/* GET SINGLE DOCTOR - PUBLIC */
/* ============================= */

const getDoctor = async (req, res) => {

  try {

    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM doctors
       WHERE id = $1`,
      [id]
    )


    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      })

    }


    res.json({
      success: true,
      doctor: result.rows[0],
    })

  } catch (error) {

    console.error(
      'Fetch doctor error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
    })

  }

}


/* ============================= */
/* CREATE DOCTOR - ADMIN */
/* ============================= */

const createDoctor = async (req, res) => {

  try {

    const {
      name,
      department,
      specialization,
      available_days,
      start_time,
      end_time,
    } = req.body


    if (
      !name ||
      !department ||
      !available_days ||
      !start_time ||
      !end_time
    ) {

      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      })

    }


    let days = available_days


    /*
      FormData থেকে available_days
      string হিসেবে আসবে।
    */

    if (typeof days === 'string') {

      try {

        days = JSON.parse(days)

      } catch (error) {

        return res.status(400).json({
          success: false,
          message: 'Invalid available days',
        })

      }

    }


    if (
      !Array.isArray(days) ||
      days.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Please select at least one available day',
      })

    }


    /*
      Photo upload হলে
      req.file পাওয়া যাবে।
    */

    const image =
      req.file
        ? `/uploads/doctors/${req.file.filename}`
        : null


    const result = await pool.query(
      `INSERT INTO doctors
      (
        name,
        department,
        specialization,
        available_days,
        start_time,
        end_time,
        image
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        name,
        department,
        specialization || null,
        days,
        start_time,
        end_time,
        image,
      ]
    )


    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctor: result.rows[0],
    })

  } catch (error) {

    console.error(
      'Create doctor error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
    })

  }

}


/* ============================= */
/* UPDATE DOCTOR - ADMIN */
/* ============================= */

const updateDoctor = async (req, res) => {

  try {

    const { id } = req.params

    const {
      name,
      department,
      specialization,
      available_days,
      start_time,
      end_time,
    } = req.body


    if (
      !name ||
      !department ||
      !available_days ||
      !start_time ||
      !end_time
    ) {

      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      })

    }


    let days = available_days


    if (typeof days === 'string') {

      try {

        days = JSON.parse(days)

      } catch (error) {

        return res.status(400).json({
          success: false,
          message: 'Invalid available days',
        })

      }

    }


    if (
      !Array.isArray(days) ||
      days.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Please select at least one available day',
      })

    }


    /*
      নতুন photo দিলে সেটাই save হবে।

      নতুন photo না দিলে আগের photo
      database-এ যেমন আছে তেমনই থাকবে।
    */

    if (req.file) {

      const image =
        `/uploads/doctors/${req.file.filename}`


      const result = await pool.query(
        `UPDATE doctors
         SET
           name = $1,
           department = $2,
           specialization = $3,
           available_days = $4,
           start_time = $5,
           end_time = $6,
           image = $7
         WHERE id = $8
         RETURNING *`,
        [
          name,
          department,
          specialization || null,
          days,
          start_time,
          end_time,
          image,
          id,
        ]
      )


      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        })

      }


      return res.json({
        success: true,
        message: 'Doctor updated successfully',
        doctor: result.rows[0],
      })

    }


    /*
      Photo change না করলে
      আগের image untouched থাকবে।
    */

    const result = await pool.query(
      `UPDATE doctors
       SET
         name = $1,
         department = $2,
         specialization = $3,
         available_days = $4,
         start_time = $5,
         end_time = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        department,
        specialization || null,
        days,
        start_time,
        end_time,
        id,
      ]
    )


    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      })

    }


    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: result.rows[0],
    })

  } catch (error) {

    console.error(
      'Update doctor error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
    })

  }

}


/* ============================= */
/* DELETE DOCTOR - ADMIN */
/* ============================= */

const deleteDoctor = async (req, res) => {

  try {

    const { id } = req.params


    const result = await pool.query(
      `DELETE FROM doctors
       WHERE id = $1
       RETURNING *`,
      [id]
    )


    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      })

    }


    res.json({
      success: true,
      message: 'Doctor deleted successfully',
      doctor: result.rows[0],
    })

  } catch (error) {

    console.error(
      'Delete doctor error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
    })

  }

}


module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
}