const pool = require('../config/db')


/* =========================================
   CREATE APPOINTMENT
========================================= */

const createAppointment = async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      department,
      doctor,
      appointment_date,
      appointment_time,
      message,
    } = req.body


    if (
      !name ||
      !email ||
      !phone ||
      !doctor ||
      !appointment_date ||
      !appointment_time
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Please fill all required fields',
      })

    }


    /* =====================================
       CHECK SLOT
    ===================================== */

    const existingAppointment =
      await pool.query(
        `SELECT id
         FROM appointments
         WHERE doctor = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status <> 'cancelled'
         LIMIT 1`,
        [
          doctor,
          appointment_date,
          appointment_time,
        ]
      )


    if (existingAppointment.rows.length > 0) {

      return res.status(409).json({
        success: false,
        message:
          'This time slot is already booked for this doctor. Please choose another time.',
      })

    }


    /* =====================================
       INSERT
    ===================================== */

    const result = await pool.query(
      `INSERT INTO appointments
      (
        name,
        email,
        phone,
        department,
        doctor,
        appointment_date,
        appointment_time,
        message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        email,
        phone,
        department || null,
        doctor,
        appointment_date,
        appointment_time,
        message || null,
      ]
    )


    res.status(201).json({
      success: true,
      message:
        'Appointment booked successfully',
      appointment: result.rows[0],
    })


  } catch (error) {

    /* =====================================
       POSTGRES UNIQUE SLOT ERROR
    ===================================== */

    if (error.code === '23505') {

      return res.status(409).json({
        success: false,
        message:
          'This time slot was just booked by another patient. Please choose another time.',
      })

    }


    console.error(
      'Appointment error:',
      error
    )


    res.status(500).json({
      success: false,
      message:
        'Failed to book appointment',
    })

  }

}


/* =========================================
   GET APPOINTMENTS
   ADMIN
========================================= */

const getAppointments = async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT *
       FROM appointments
       ORDER BY created_at DESC`
    )


    res.json({
      success: true,
      appointments: result.rows,
    })


  } catch (error) {

    console.error(
      'Fetch appointments error:',
      error
    )


    res.status(500).json({
      success: false,
      message:
        'Failed to fetch appointments',
    })

  }

}


/* =========================================
   GET BOOKED TIMES
   PUBLIC
========================================= */

const getBookedTimes = async (req, res) => {

  try {

    const {
      doctor,
      date,
    } = req.query


    if (!doctor || !date) {

      return res.status(400).json({
        success: false,
        message:
          'Doctor and date are required',
      })

    }


    const result = await pool.query(
      `SELECT appointment_time
       FROM appointments
       WHERE doctor = $1
       AND appointment_date = $2
       AND status <> 'cancelled'
       ORDER BY appointment_time ASC`,
      [
        doctor,
        date,
      ]
    )


    const bookedTimes =
      result.rows.map(
        (row) => {

          return row.appointment_time
            .toString()
            .slice(0, 5)

        }
      )


    res.json({
      success: true,
      bookedTimes,
    })


  } catch (error) {

    console.error(
      'Availability error:',
      error
    )


    res.status(500).json({
      success: false,
      message:
        'Failed to check availability',
    })

  }

}


/* =========================================
   UPDATE STATUS
========================================= */

const updateAppointmentStatus = async (
  req,
  res
) => {

  try {

    const { id } = req.params
    const { status } = req.body


    const allowedStatuses = [
      'pending',
      'confirmed',
      'cancelled',
    ]


    if (
      !allowedStatuses.includes(status)
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Invalid appointment status',
      })

    }


    const result = await pool.query(
      `UPDATE appointments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [
        status,
        id,
      ]
    )


    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message:
          'Appointment not found',
      })

    }


    res.json({
      success: true,
      message:
        `Appointment ${status}`,
      appointment:
        result.rows[0],
    })


  } catch (error) {

    console.error(
      'Update status error:',
      error
    )


    res.status(500).json({
      success: false,
      message:
        'Failed to update appointment',
    })

  }

}


/* =========================================
   DELETE
========================================= */

const deleteAppointment = async (
  req,
  res
) => {

  try {

    const { id } = req.params


    const result = await pool.query(
      `DELETE FROM appointments
       WHERE id = $1
       RETURNING *`,
      [id]
    )


    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message:
          'Appointment not found',
      })

    }


    res.json({
      success: true,
      message:
        'Appointment deleted successfully',
      appointment:
        result.rows[0],
    })


  } catch (error) {

    console.error(
      'Delete appointment error:',
      error
    )


    res.status(500).json({
      success: false,
      message:
        'Failed to delete appointment',
    })

  }

}

// Get patient's appointments by email + phone
const getPatientAppointments = async (req, res) => {
  try {
    const { email, phone } = req.query

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required'
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        department,
        doctor,
        appointment_date,
        appointment_time,
        message,
        status,
        created_at
      FROM appointments
      WHERE LOWER(email) = LOWER($1)
        AND phone = $2
      ORDER BY appointment_date DESC, appointment_time DESC
      `,
      [email.trim(), phone.trim()]
    )

    res.json({
      success: true,
      appointments: result.rows
    })
  } catch (error) {
    console.error('Get patient appointments error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    })
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  getBookedTimes,
  updateAppointmentStatus,
  getPatientAppointments,
  deleteAppointment,
}

