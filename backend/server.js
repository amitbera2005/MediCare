require('dotenv').config()

const express = require('express')
const cors = require('cors')
const pool = require('./src/config/db')
const appointmentRoutes = require('./src/routes/appointmentRoutes')
const adminRoutes = require('./src/routes/adminRoutes')
const doctorRoutes = require('./src/routes/doctorRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Appointment routes
app.use('/api/appointments', appointmentRoutes)

app.use('/api/doctors', doctorRoutes)

app.use(
  '/uploads',
  express.static('uploads')
)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'MediCare Backend is running'
  })
})

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW()'
    )

    res.json({
      success: true,
      message: 'PostgreSQL connected',
      time: result.rows[0].now
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `MediCare backend running on port ${PORT}`
  )
})