import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './BookAppointment.css'


function BookAppointment() {

  const [searchParams] = useSearchParams()

  const doctorFromUrl = searchParams.get('doctor')


  /* ============================= */
  /* FORM DATA */
  /* ============================= */

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    doctor: doctorFromUrl || '',
    appointment_date: '',
    appointment_time: '',
    message: '',
  })


  /* ============================= */
  /* DOCTORS */
  /* ============================= */

  const [doctors, setDoctors] = useState([])

  const [doctorsLoading, setDoctorsLoading] =
    useState(true)


  /* ============================= */
  /* BOOKED TIMES */
  /* ============================= */

  const [bookedTimes, setBookedTimes] =
    useState([])

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false)


  /* ============================= */
  /* UI STATES */
  /* ============================= */

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [error, setError] =
    useState('')


  /* ============================= */
  /* LOAD DOCTORS */
  /* ============================= */

  const loadDoctors = async () => {

    try {

      setDoctorsLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/doctors'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load doctors'
        )
      }

      setDoctors(
        Array.isArray(data.doctors)
          ? data.doctors
          : Array.isArray(data.data)
            ? data.data
            : []
      )

    } catch (err) {

      console.error(
        'Doctors loading error:',
        err
      )

      setError(
        'Unable to load doctors. Please try again.'
      )

    } finally {

      setDoctorsLoading(false)

    }

  }


  /* ============================= */
  /* INITIAL LOAD */
  /* ============================= */

  useEffect(() => {

    loadDoctors()

  }, [])


  /* ============================= */
  /* AUTO SELECT DOCTOR FROM URL */
  /* ============================= */

  useEffect(() => {

    if (
      doctors.length === 0 ||
      !doctorFromUrl
    ) {
      return
    }

    const doctor = doctors.find(
      (item) =>
        String(item.id) ===
        String(doctorFromUrl)
    )

    if (!doctor) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      doctor: String(doctor.id),
      department: doctor.department || '',
      appointment_date: '',
      appointment_time: '',
    }))

  }, [
    doctors,
    doctorFromUrl,
  ])


  /* ============================= */
  /* SELECTED DOCTOR */
  /* ============================= */

  const selectedDoctor = doctors.find(
    (doctor) =>
      String(doctor.id) ===
      String(formData.doctor)
  )


  /* ============================= */
  /* DEPARTMENTS */
  /* ============================= */

  const departments = [
    ...new Set(
      doctors
        .map((doctor) => doctor.department)
        .filter(Boolean)
    ),
  ].sort()


  /* ============================= */
  /* DATE HELPERS */
  /* ============================= */

  const getToday = () => {

    return new Date()
      .toISOString()
      .split('T')[0]

  }


  const getDayName = (dateString) => {

    if (!dateString) return ''

    const date = new Date(
      `${dateString}T00:00:00`
    )

    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      }
    )

  }


  /* ============================= */
  /* DOCTOR AVAILABLE DAY */
  /* ============================= */

  const isDoctorAvailableOnDate = (
    doctor,
    dateString
  ) => {

    if (
      !doctor ||
      !dateString ||
      !Array.isArray(
        doctor.available_days
      )
    ) {
      return false
    }

    const selectedDay =
      getDayName(dateString)

    return doctor.available_days.some(
      (day) =>
        String(day).toLowerCase() ===
        selectedDay.toLowerCase()
    )

  }


  /* ============================= */
  /* TIME HELPERS */
  /* ============================= */

  const timeToMinutes = (time) => {

    if (!time) return null

    const parts =
      String(time)
        .slice(0, 5)
        .split(':')

    const hours =
      Number(parts[0])

    const minutes =
      Number(parts[1])

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null
    }

    return (
      hours * 60 +
      minutes
    )

  }


  const minutesToTime = (minutes) => {

    const hours =
      Math.floor(minutes / 60)

    const mins =
      minutes % 60

    return (
      String(hours).padStart(2, '0') +
      ':' +
      String(mins).padStart(2, '0')
    )

  }


  /* ============================= */
  /* GENERATE DOCTOR TIME SLOTS */
  /* ============================= */

  const getDoctorTimeSlots = () => {

    if (!selectedDoctor) {
      return []
    }

    const start =
      timeToMinutes(
        selectedDoctor.start_time
      )

    const end =
      timeToMinutes(
        selectedDoctor.end_time
      )

    if (
      start === null ||
      end === null ||
      start >= end
    ) {
      return []
    }

    const slots = []

    for (
      let current = start;
      current < end;
      current += 60
    ) {

      slots.push(
        minutesToTime(current)
      )

    }

    return slots

  }


  /* ============================= */
  /* FORMAT TIME */
  /* ============================= */

  const formatTime = (time) => {

    if (!time) return ''

    const [
      hoursString,
      minutesString
    ] = time.split(':')

    let hours =
      Number(hoursString)

    const minutes =
      minutesString || '00'

    const suffix =
      hours >= 12
        ? 'PM'
        : 'AM'

    hours =
      hours % 12 || 12

    return (
      `${String(hours).padStart(2, '0')}:${minutes} ${suffix}`
    )

  }


  /* ============================= */
  /* LOAD BOOKED TIMES */
  /* ============================= */

  const loadBookedTimes = async () => {

    if (
      !formData.doctor ||
      !formData.appointment_date
    ) {

      setBookedTimes([])

      return
    }


    if (
      !selectedDoctor ||
      !isDoctorAvailableOnDate(
        selectedDoctor,
        formData.appointment_date
      )
    ) {

      setBookedTimes([])

      return
    }


    try {

      setAvailabilityLoading(true)

      const params =
        new URLSearchParams({
          doctor:
            selectedDoctor.name,
          date:
            formData.appointment_date,
        })


      const response =
        await fetch(
          `http://localhost:5000/api/appointments/availability?${params.toString()}`
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to check availability'
        )

      }


      setBookedTimes(
        Array.isArray(
          data.bookedTimes
        )
          ? data.bookedTimes
          : []
      )


    } catch (err) {

      console.error(
        'Availability error:',
        err
      )

      setBookedTimes([])

    } finally {

      setAvailabilityLoading(false)

    }

  }


  /* ============================= */
  /* LOAD AVAILABILITY */
  /* ============================= */

  useEffect(() => {

    loadBookedTimes()

  }, [
    formData.doctor,
    formData.appointment_date,
  ])


  /* ============================= */
  /* AUTO REFRESH AVAILABILITY */
  /* ============================= */

  useEffect(() => {

    if (
      !formData.doctor ||
      !formData.appointment_date
    ) {
      return
    }


    const interval =
      setInterval(() => {

        loadBookedTimes()

      }, 5000)


    return () => {

      clearInterval(interval)

    }

  }, [
    formData.doctor,
    formData.appointment_date,
    selectedDoctor,
  ])


  /* ============================= */
  /* HANDLE INPUT */
  /* ============================= */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target


    /* ============================= */
    /* DEPARTMENT CHANGE */
    /* ============================= */

    if (name === 'department') {

      setFormData((prev) => ({
        ...prev,
        department: value,
        doctor: '',
        appointment_date: '',
        appointment_time: '',
      }))

      setBookedTimes([])

      setError('')

      return

    }


    /* ============================= */
    /* DOCTOR CHANGE */
    /* ============================= */

    if (name === 'doctor') {

      const doctor =
        doctors.find(
          (item) =>
            String(item.id) ===
            String(value)
        )


      setFormData((prev) => ({
        ...prev,
        doctor: value,
        department:
          doctor?.department || prev.department,
        appointment_date: '',
        appointment_time: '',
      }))

      setBookedTimes([])

      setError('')

      return

    }


    /* ============================= */
    /* DATE CHANGE */
    /* ============================= */

    if (
      name === 'appointment_date'
    ) {

      setFormData((prev) => ({
        ...prev,
        appointment_date: value,
        appointment_time: '',
      }))

      setError('')

      return

    }


    /* ============================= */
    /* NORMAL INPUT */
    /* ============================= */

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')

  }


  /* ============================= */
  /* HANDLE SUBMIT */
  /* ============================= */

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)

    setSuccess(false)

    setError('')


    try {

      /* ============================= */
      /* BASIC VALIDATION */
      /* ============================= */

      if (!selectedDoctor) {

        throw new Error(
          'Please select a doctor.'
        )

      }


      /* ============================= */
      /* DATE AVAILABILITY */
      /* ============================= */

      if (
        !isDoctorAvailableOnDate(
          selectedDoctor,
          formData.appointment_date
        )
      ) {

        throw new Error(
          `${selectedDoctor.name} is not available on ${getDayName(formData.appointment_date)}. Please choose another date.`
        )

      }


      /* ============================= */
      /* TIME VALIDATION */
      /* ============================= */

      const availableSlots =
        getDoctorTimeSlots()


      if (
        !availableSlots.includes(
          formData.appointment_time
        )
      ) {

        throw new Error(
          'Please select a valid appointment time.'
        )

      }


      /* ============================= */
      /* FINAL AVAILABILITY CHECK */
      /* ============================= */

      const availabilityParams =
        new URLSearchParams({
          doctor:
            selectedDoctor.name,
          date:
            formData.appointment_date,
        })


      const availabilityResponse =
        await fetch(
          `http://localhost:5000/api/appointments/availability?${availabilityParams.toString()}`
        )


      const availabilityData =
        await availabilityResponse.json()


      if (
        availabilityResponse.ok &&
        Array.isArray(
          availabilityData.bookedTimes
        ) &&
        availabilityData.bookedTimes.includes(
          formData.appointment_time
        )
      ) {

        throw new Error(
          'This time slot has just been booked. Please choose another time.'
        )

      }


      /* ============================= */
      /* BOOK APPOINTMENT */
      /* ============================= */

      const response =
        await fetch(
          'http://localhost:5000/api/appointments',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                ...formData,

                doctor:
                  selectedDoctor.name,
              }),
          }
        )


      const data =
        await response.json()


      /* ============================= */
      /* DOUBLE BOOKING */
      /* ============================= */

      if (
        response.status === 409
      ) {

        throw new Error(
          data.message ||
          'This slot was just booked by another patient. Please choose another time.'
        )

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to book appointment'
        )

      }


      /* ============================= */
      /* SUCCESS */
      /* ============================= */

      setSuccess(true)


      setBookedTimes((prev) => {

        if (
          prev.includes(
            formData.appointment_time
          )
        ) {
          return prev
        }

        return [
          ...prev,
          formData.appointment_time,
        ]

      })


      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        doctor: '',
        appointment_date: '',
        appointment_time: '',
        message: '',
      })


    } catch (err) {

      console.error(err)

      setError(
        err.message ||
        'Something went wrong. Please try again.'
      )

    } finally {

      setLoading(false)

    }

  }


  /* ============================= */
  /* AVAILABLE DOCTORS */
  /* ============================= */

  const departmentDoctors =
    doctors.filter(
      (doctor) =>
        !formData.department ||
        doctor.department ===
          formData.department
    )


  /* ============================= */
  /* TIME SLOTS */
  /* ============================= */

  const timeSlots =
    getDoctorTimeSlots()


  /* ============================= */
  /* SELECTED DATE AVAILABLE? */
  /* ============================= */

  const selectedDateAvailable =
    selectedDoctor &&
    formData.appointment_date
      ? isDoctorAvailableOnDate(
          selectedDoctor,
          formData.appointment_date
        )
      : false


  return (

    <div className="appointment-page">


      {/* ============================= */}
      {/* NAVBAR */}
      {/* ============================= */}

      <header className="appointment-navbar">

        <Link
          to="/"
          className="appointment-brand"
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
              HEALTHCARE
            </small>

          </div>

        </Link>


        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </header>



      {/* ============================= */}
      {/* HERO */}
      {/* ============================= */}

      <section className="appointment-hero">

        <div className="appointment-hero-content">

          <p className="appointment-eyebrow">
            MEDICARE • APPOINTMENTS
          </p>

          <h1>

            Book your
            <br />

            <span>
              appointment.
            </span>

          </h1>

          <p>

            Choose your preferred department,
            doctor and convenient time. Our team
            will take care of the rest.

          </p>

        </div>

      </section>



      {/* ============================= */}
      {/* FORM */}
      {/* ============================= */}

      <main className="appointment-main">


        <div className="appointment-form-wrapper">


          <div className="form-heading">

            <p>
              APPOINTMENT DETAILS
            </p>

            <h2>

              Tell us how
              <br />

              <span>
                we can help.
              </span>

            </h2>

          </div>



          <form
            className="appointment-form"
            onSubmit={handleSubmit}
          >


            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

            </div>



            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address *
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>



            {/* PHONE */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number *
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />

            </div>



            {/* DEPARTMENT */}

            <div className="form-group">

              <label htmlFor="department">
                Department
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >

                <option value="">
                  Select department
                </option>


                {departments.map(
                  (department) => (

                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>

                  )
                )}

              </select>

            </div>



            {/* DOCTOR */}

            <div className="form-group">

              <label htmlFor="doctor">
                Preferred Doctor *
              </label>

              <select
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
                disabled={
                  doctorsLoading ||
                  departmentDoctors.length === 0
                }
              >

                <option value="">

                  {doctorsLoading
                    ? 'Loading doctors...'
                    : departmentDoctors.length === 0
                      ? 'No doctors available'
                      : 'Select doctor'
                  }

                </option>


                {departmentDoctors.map(
                  (doctor) => (

                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >

                      {doctor.name}
                      {' — '}
                      {doctor.department}

                    </option>

                  )
                )}

              </select>

            </div>



            {/* DATE */}

            <div className="form-group">

              <label htmlFor="appointment_date">
                Appointment Date *
              </label>

              <input
                id="appointment_date"
                type="date"
                name="appointment_date"
                value={
                  formData.appointment_date
                }
                onChange={handleChange}
                min={getToday()}
                disabled={!selectedDoctor}
                required
              />


              {selectedDoctor && (

                <small
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    opacity: 0.7,
                  }}
                >

                  Available:
                  {' '}

                  {selectedDoctor.available_days?.join(
                    ', '
                  )}

                </small>

              )}


              {selectedDoctor &&
                formData.appointment_date &&
                !selectedDateAvailable && (

                  <small
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      color: '#c0392b',
                    }}
                  >

                    {selectedDoctor.name}
                    {' '}
                    is not available on this day.

                  </small>

                )}

            </div>



            {/* TIME */}

            <div className="form-group">

              <label htmlFor="appointment_time">
                Preferred Time *
              </label>

              <select
                id="appointment_time"
                name="appointment_time"
                value={
                  formData.appointment_time
                }
                onChange={handleChange}
                disabled={
                  !selectedDoctor ||
                  !formData.appointment_date ||
                  !selectedDateAvailable ||
                  timeSlots.length === 0
                }
                required
              >

                <option value="">

                  {!selectedDoctor
                    ? 'Select doctor first'
                    : !formData.appointment_date
                      ? 'Select date first'
                      : !selectedDateAvailable
                        ? 'Doctor unavailable on this day'
                        : availabilityLoading
                          ? 'Checking availability...'
                          : timeSlots.length === 0
                            ? 'No time slots available'
                            : 'Select time'
                  }

                </option>


                {timeSlots.map(
                  (time) => {

                    const isBooked =
                      bookedTimes.includes(
                        time
                      )


                    return (

                      <option
                        key={time}
                        value={time}
                        disabled={isBooked}
                      >

                        {formatTime(time)}

                        {isBooked
                          ? ' — Booked'
                          : ''
                        }

                      </option>

                    )

                  }
                )}

              </select>

            </div>



            {/* MESSAGE */}

            <div className="form-group form-full">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us anything we should know..."
                rows="5"
              ></textarea>

            </div>



            {/* SUCCESS */}

            {success && (

              <div className="form-success">

                <span>
                  ✓
                </span>

                <div>

                  <strong>
                    Appointment booked successfully!
                  </strong>

                  <p>
                    Your appointment request has been
                    saved. Our team will contact you soon.
                  </p>

                </div>

              </div>

            )}



            {/* ERROR */}

            {error && (

              <div className="form-error">

                <strong>
                  Something went wrong
                </strong>

                <p>
                  {error}
                </p>

              </div>

            )}



            {/* SUBMIT */}

            <div className="form-submit">

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >

                {loading
                  ? 'Booking...'
                  : 'Book Appointment'
                }

                {!loading && (

                  <span>
                    ↗
                  </span>

                )}

              </button>


              <p>

                By booking an appointment, you agree
                to our terms and privacy policy.

              </p>

            </div>

          </form>

        </div>



        {/* ============================= */}
        {/* SIDE INFO */}
        {/* ============================= */}

        <aside className="appointment-side">

          <div className="side-image">

            <img
              src="/images/7.jpeg"
              alt="MediCare healthcare"
            />

          </div>


          <div className="side-card">

            <div className="side-icon">
              ✚
            </div>


            <h3>

              We're here
              <br />

              when you need us.

            </h3>


            <p>

              Our healthcare team is ready to help
              you find the right care and support.

            </p>


            <div className="side-hours">

              <div>

                <span>
                  Monday – Saturday
                </span>

                <strong>
                  9:00 AM – 8:00 PM
                </strong>

              </div>


              <div>

                <span>
                  Emergency
                </span>

                <strong>
                  Available 24/7
                </strong>

              </div>

            </div>

          </div>

        </aside>

      </main>



      {/* ============================= */}
      {/* FOOTER */}
      {/* ============================= */}

      <footer className="appointment-footer">

        <Link to="/">
          MediCare
        </Link>

        <span>
          © 2026 MediCare. All rights reserved.
        </span>

      </footer>

    </div>

  )

}


export default BookAppointment