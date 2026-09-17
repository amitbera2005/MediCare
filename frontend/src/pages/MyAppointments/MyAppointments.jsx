import { useState } from 'react'
import { Link } from 'react-router-dom'

import './MyAppointments.css'

function MyAppointments() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const checkAppointments = async (e) => {
    e.preventDefault()

    setError('')
    setAppointments([])
    setSearched(false)

    if (!email.trim() || !phone.trim()) {
      setError('Please enter your email and phone number.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `http://localhost:5000/api/appointments/patient?email=${encodeURIComponent(
          email.trim()
        )}&phone=${encodeURIComponent(phone.trim())}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments')
      }

      setAppointments(data.appointments || [])
      setSearched(true)
    } catch (error) {
      console.error(error)
      setError(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (time) => {
    if (!time) return '—'

    const [hours, minutes] = time.split(':')

    const date = new Date()
    date.setHours(Number(hours), Number(minutes), 0, 0)

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusClass = (status) => {
    const value = String(status || '').toLowerCase()

    if (value === 'confirmed' || value === 'approved') {
      return 'status-confirmed'
    }

    if (value === 'cancelled' || value === 'canceled') {
      return 'status-cancelled'
    }

    return 'status-pending'
  }

  const getStatusText = (status) => {
    const value = String(status || '').toLowerCase()

    if (value === 'confirmed' || value === 'approved') {
      return 'Confirmed'
    }

    if (value === 'cancelled' || value === 'canceled') {
      return 'Cancelled'
    }

    return 'Pending'
  }

  return (
    <div className="my-appointments-page">

      {/* Navbar */}
      <nav className="my-appointments-nav">
        <Link to="/" className="my-appointments-logo">
          MediCare
        </Link>

        <div className="my-appointments-nav-links">
          <Link to="/">Home</Link>
          <Link to="/book-appointment">Book Appointment</Link>
        </div>
      </nav>

      {/* Main */}
      <main className="my-appointments-main">

        <div className="my-appointments-header">
          <span>MEDICARE</span>

          <h1>My Appointments</h1>

          <p>
            Check your appointment status using your email
            and phone number.
          </p>
        </div>

        {/* Search Card */}
        <div className="appointment-search-card">

          <form onSubmit={checkAppointments}>

            <div className="appointment-input-group">
              <label htmlFor="patient-email">
                Email Address
              </label>

              <input
                id="patient-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="appointment-input-group">
              <label htmlFor="patient-phone">
                Phone Number
              </label>

              <input
                id="patient-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="appointment-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="check-appointment-button"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Appointments'}
            </button>

          </form>

        </div>

        {/* Results */}
        {searched && (
          <div className="appointment-results">

            <div className="results-heading">
              <h2>Your Appointments</h2>

              <span>
                {appointments.length} appointment
                {appointments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {appointments.length === 0 ? (

              <div className="no-appointments">
                <div className="no-appointments-icon">
                  📅
                </div>

                <h3>No appointments found</h3>

                <p>
                  We couldn't find any appointment with
                  this email and phone number.
                </p>

                <Link to="/book-appointment">
                  Book an Appointment
                </Link>
              </div>

            ) : (

              <div className="appointments-list">

                {appointments.map((appointment) => (

                  <div
                    className="patient-appointment-card"
                    key={appointment.id}
                  >

                    <div className="patient-appointment-top">

                      <div>
                        <span className="appointment-number">
                          Appointment #{appointment.id}
                        </span>

                        <h3>
                          {appointment.doctor || 'Doctor not assigned'}
                        </h3>

                        <p>
                          {appointment.department || 'General'}
                        </p>
                      </div>

                      <span
                        className={`appointment-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        <span className="status-dot"></span>

                        {getStatusText(appointment.status)}
                      </span>

                    </div>

                    <div className="patient-appointment-details">

                      <div>
                        <span>Date</span>

                        <strong>
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Time</span>

                        <strong>
                          {formatTime(
                            appointment.appointment_time
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Patient</span>

                        <strong>
                          {appointment.name}
                        </strong>
                      </div>

                    </div>

                    {appointment.message && (
                      <div className="patient-message">
                        <span>Message</span>

                        <p>
                          {appointment.message}
                        </p>
                      </div>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>
        )}

      </main>

    </div>
  )
}

export default MyAppointments