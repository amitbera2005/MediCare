import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AdminAppointments.css'


function AdminAppointments() {

  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  /* =========================================
     GET ADMIN TOKEN
  ========================================= */

  const getToken = () => {
    return localStorage.getItem(
      'medicare_admin_token'
    )
  }


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    localStorage.removeItem(
      'medicare_admin_token'
    )

    localStorage.removeItem(
      'medicare_admin'
    )

    navigate('/admin/login')
  }


  /* =========================================
     HANDLE AUTH ERROR
  ========================================= */

  const handleUnauthorized = () => {

    localStorage.removeItem(
      'medicare_admin_token'
    )

    localStorage.removeItem(
      'medicare_admin'
    )

    navigate('/admin/login')
  }


  /* =========================================
     FETCH APPOINTMENTS
  ========================================= */

  const fetchAppointments = async () => {

    const token = getToken()


    // No token
    if (!token) {
      navigate('/admin/login')
      return
    }


    try {

      setLoading(true)
      setError('')


      const response = await fetch(
        'http://localhost:5000/api/appointments',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )


      const data = await response.json()


      // Token expired / invalid
      if (
        response.status === 401 ||
        response.status === 403
      ) {

        handleUnauthorized()
        return

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to fetch appointments'
        )

      }


      setAppointments(
        data.appointments || []
      )


    } catch (err) {

      console.error(err)

      setError(
        err.message ||
        'Failed to load appointments'
      )

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    fetchAppointments()

  }, [])


  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus = async (
    id,
    status
  ) => {

    const token = getToken()


    if (!token) {
      navigate('/admin/login')
      return
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/status`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      )


      const data = await response.json()


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        handleUnauthorized()
        return

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to update status'
        )

      }


      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status:
                  data.appointment.status,
              }
            : appointment
        )
      )


    } catch (err) {

      console.error(err)

      alert(
        err.message ||
        'Failed to update appointment'
      )

    }

  }


  /* =========================================
     DELETE
  ========================================= */

  const deleteAppointment = async (id) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment?'
    )


    if (!confirmed) return


    const token = getToken()


    if (!token) {
      navigate('/admin/login')
      return
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )


      const data = await response.json()


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        handleUnauthorized()
        return

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to delete appointment'
        )

      }


      setAppointments((prev) =>
        prev.filter(
          (appointment) =>
            appointment.id !== id
        )
      )


    } catch (err) {

      console.error(err)

      alert(
        err.message ||
        'Failed to delete appointment'
      )

    }

  }


  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (date) => {

    if (!date) return '-'


    const cleanDate =
      date.split('T')[0]


    const [
      year,
      month,
      day,
    ] = cleanDate.split('-')


    return `${day}/${month}/${year}`

  }


  /* =========================================
     TIME FORMAT
  ========================================= */

  const formatTime = (time) => {

    if (!time) return '-'


    const [
      hour,
      minute,
    ] = time.split(':')


    const date = new Date()


    date.setHours(
      Number(hour),
      Number(minute)
    )


    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    )

  }


  /* =========================================
     COUNTS
  ========================================= */

  const pendingCount =
    appointments.filter(
      (item) =>
        item.status === 'pending'
    ).length


  const confirmedCount =
    appointments.filter(
      (item) =>
        item.status === 'confirmed'
    ).length


  const cancelledCount =
    appointments.filter(
      (item) =>
        item.status === 'cancelled'
    ).length


  return (

    <div className="admin-page">


      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="admin-navbar">

        <Link
          to="/"
          className="admin-brand"
        >

          <div className="brand-symbol">

            <span></span>
            <span></span>

          </div>


          <div className="brand-text">

            <strong>
              MediCare
            </strong>

            <small>
              ADMIN
            </small>

          </div>

        </Link>


        <div className="admin-nav-right">

          <span>
            Admin Dashboard
          </span>

            <Link to="/admin/doctors">
    Doctors
  </Link>


          <Link to="/">
            ← Home
          </Link>


          <button
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-header">

        <div>

          <p className="admin-label">
            MEDICARE ADMINISTRATION
          </p>


          <h1>

            Appointments
            <br />

            <span>
              dashboard.
            </span>

          </h1>


          <p className="admin-description">

            Manage patient appointment requests,
            confirm bookings and handle cancellations.

          </p>

        </div>

      </section>


      {/* =====================================
          STATS
      ===================================== */}

      <section className="admin-stats">


        <div className="admin-stat-card">

          <span>
            Total
          </span>

          <strong>
            {appointments.length}
          </strong>

          <small>
            All appointments
          </small>

        </div>


        <div className="admin-stat-card pending">

          <span>
            Pending
          </span>

          <strong>
            {pendingCount}
          </strong>

          <small>
            Awaiting confirmation
          </small>

        </div>


        <div className="admin-stat-card confirmed">

          <span>
            Confirmed
          </span>

          <strong>
            {confirmedCount}
          </strong>

          <small>
            Confirmed appointments
          </small>

        </div>


        <div className="admin-stat-card cancelled">

          <span>
            Cancelled
          </span>

          <strong>
            {cancelledCount}
          </strong>

          <small>
            Cancelled appointments
          </small>

        </div>


      </section>


      {/* =====================================
          APPOINTMENTS
      ===================================== */}

      <main className="admin-main">


        <div className="admin-list-header">

          <div>

            <p>
              APPOINTMENT REQUESTS
            </p>

            <h2>
              Patient bookings
            </h2>

          </div>


          <button
            className="refresh-button"
            onClick={fetchAppointments}
          >
            ↻ Refresh
          </button>

        </div>


        {loading && (

          <div className="admin-message">
            Loading appointments...
          </div>

        )}


        {error && (

          <div className="admin-error">
            {error}
          </div>

        )}


        {!loading &&
          !error &&
          appointments.length === 0 && (

          <div className="admin-empty">

            <div>
              ✓
            </div>

            <h3>
              No appointments yet
            </h3>

            <p>
              New patient bookings will
              appear here.
            </p>

          </div>

        )}


        {!loading &&
          !error &&
          appointments.length > 0 && (

          <div className="appointment-list">


            {appointments.map(
              (appointment) => (

              <article
                className="admin-appointment-card"
                key={appointment.id}
              >


                {/* PATIENT */}

                <div className="patient-section">

                  <div className="patient-avatar">

                    {appointment.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>


                  <div>

                    <h3>
                      {appointment.name}
                    </h3>

                    <p>
                      {appointment.email}
                    </p>

                    <p>
                      {appointment.phone}
                    </p>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="appointment-details">


                  <div>

                    <span>
                      DEPARTMENT
                    </span>

                    <strong>
                      {appointment.department || '-'}
                    </strong>

                  </div>


                  <div>

                    <span>
                      DOCTOR
                    </span>

                    <strong>
                      {appointment.doctor || '-'}
                    </strong>

                  </div>


                  <div>

                    <span>
                      DATE
                    </span>

                    <strong>

                      {formatDate(
                        appointment.appointment_date
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      TIME
                    </span>

                    <strong>

                      {formatTime(
                        appointment.appointment_time
                      )}

                    </strong>

                  </div>


                </div>


                {/* MESSAGE */}

                {appointment.message && (

                  <div className="appointment-message">

                    <span>
                      MESSAGE
                    </span>

                    <p>
                      {appointment.message}
                    </p>

                  </div>

                )}


                {/* ACTIONS */}

                <div className="appointment-actions">


                  <span
                    className={`status status-${appointment.status}`}
                  >

                    {appointment.status}

                  </span>


                  <div className="action-buttons">


                    {appointment.status !==
                      'confirmed' && (

                      <button
                        className="confirm-button"
                        onClick={() =>
                          updateStatus(
                            appointment.id,
                            'confirmed'
                          )
                        }
                      >
                        ✓ Confirm
                      </button>

                    )}


                    {appointment.status !==
                      'cancelled' && (

                      <button
                        className="cancel-button"
                        onClick={() =>
                          updateStatus(
                            appointment.id,
                            'cancelled'
                          )
                        }
                      >
                        × Cancel
                      </button>

                    )}


                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteAppointment(
                          appointment.id
                        )
                      }
                    >
                      Delete
                    </button>


                  </div>


                </div>


              </article>

            ))}


          </div>

        )}


      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="admin-footer">

        <span>
          MediCare Admin
        </span>


        <Link to="/">
          Back to MediCare
        </Link>

      </footer>


    </div>

  )

}


export default AdminAppointments