import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './DoctorManagement.css'


const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]


function DoctorManagement() {

  const navigate = useNavigate()


  const [doctors, setDoctors] = useState([])

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)

  const [imageFile, setImageFile] = useState(null)


  const [formData, setFormData] = useState({
    name: '',
    department: '',
    specialization: '',
    available_days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    start_time: '09:00',
    end_time: '18:00',
    image: '',
  })


  /* ============================= */
  /* GET ADMIN TOKEN */
  /* ============================= */

  const getToken = () => {

    return localStorage.getItem(
      'medicare_admin_token'
    )

  }


  /* ============================= */
  /* LOGOUT */
  /* ============================= */

  const logout = () => {

    localStorage.removeItem(
      'medicare_admin_token'
    )

    localStorage.removeItem(
      'medicare_admin'
    )

    navigate('/admin/login')

  }


  /* ============================= */
  /* FETCH DOCTORS */
  /* ============================= */

  const fetchDoctors = async () => {

    try {

      setLoading(true)
      setError('')


      const response = await fetch(
        'http://localhost:5000/api/doctors'
      )


      const data = await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to fetch doctors'
        )

      }


      setDoctors(
        data.doctors || []
      )

    } catch (err) {

      console.error(
        'Fetch doctors error:',
        err
      )

      setError(
        err.message ||
        'Failed to fetch doctors'
      )

    } finally {

      setLoading(false)

    }

  }


  /* ============================= */
  /* INITIAL LOAD */
  /* ============================= */

  useEffect(() => {

    const token = getToken()

    if (!token) {

      navigate('/admin/login')

      return

    }

    fetchDoctors()

  }, [])


  /* ============================= */
  /* INPUT CHANGE */
  /* ============================= */

  const handleInput = (e) => {

    const {
      name,
      value,
    } = e.target


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

  }


  /* ============================= */
  /* DAY SELECT */
  /* ============================= */

  const toggleDay = (day) => {

    setFormData((prev) => {

      const exists =
        prev.available_days.includes(day)


      return {
        ...prev,

        available_days: exists
          ? prev.available_days.filter(
              (item) => item !== day
            )
          : [
              ...prev.available_days,
              day,
            ],
      }

    })

  }


  /* ============================= */
  /* IMAGE CHANGE */
  /* ============================= */

  const handleImageChange = (e) => {

    const file =
      e.target.files?.[0]


    if (!file) {
      return
    }


    /* IMAGE TYPE CHECK */

    if (
      !file.type.startsWith('image/')
    ) {

      setError(
        'Please select a valid image file.'
      )

      e.target.value = ''

      return

    }


    /* FILE SIZE CHECK */

    if (
      file.size > 5 * 1024 * 1024
    ) {

      setError(
        'Doctor image must be smaller than 5MB.'
      )

      e.target.value = ''

      return

    }


    setError('')

    setImageFile(file)

  }


  /* ============================= */
  /* RESET FORM */
  /* ============================= */

  const resetForm = () => {

    setFormData({
      name: '',
      department: '',
      specialization: '',
      available_days: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      start_time: '09:00',
      end_time: '18:00',
      image: '',
    })


    setEditingId(null)

    setImageFile(null)

  }


  /* ============================= */
  /* SUBMIT */
  /* ============================= */

  const handleSubmit = async (e) => {

    e.preventDefault()


    const token = getToken()


    if (!token) {

      navigate('/admin/login')

      return

    }


    /* CHECK DAYS */

    if (
      formData.available_days.length === 0
    ) {

      alert(
        'Please select at least one available day.'
      )

      return

    }


    /* CHECK TIME */

    if (
      formData.start_time >=
      formData.end_time
    ) {

      alert(
        'End time must be later than start time.'
      )

      return

    }


    try {

      setSaving(true)

      setError('')


      const url = editingId
        ? `http://localhost:5000/api/doctors/${editingId}`
        : 'http://localhost:5000/api/doctors'


      const method = editingId
        ? 'PUT'
        : 'POST'


      /* ============================= */
      /* FORM DATA FOR MULTIPART */
      /* ============================= */

      const submitData =
        new FormData()


      submitData.append(
        'name',
        formData.name
      )


      submitData.append(
        'department',
        formData.department
      )


      submitData.append(
        'specialization',
        formData.specialization
      )


      submitData.append(
        'available_days',
        JSON.stringify(
          formData.available_days
        )
      )


      submitData.append(
        'start_time',
        formData.start_time
      )


      submitData.append(
        'end_time',
        formData.end_time
      )


      /* ADD IMAGE */

      if (imageFile) {

        submitData.append(
          'image',
          imageFile
        )

      }


      /* ============================= */
      /* API REQUEST */
      /* ============================= */

      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: submitData,
          }
        )


      const data =
        await response.json()


      /* ============================= */
      /* AUTH ERROR */
      /* ============================= */

      if (
        response.status === 401 ||
        response.status === 403
      ) {

        logout()

        return

      }


      /* ============================= */
      /* OTHER ERROR */
      /* ============================= */

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to save doctor'
        )

      }


      /* ============================= */
      /* SUCCESS */
      /* ============================= */

      resetForm()

      await fetchDoctors()

    } catch (err) {

      console.error(
        'Save doctor error:',
        err
      )

      setError(
        err.message ||
        'Failed to save doctor'
      )

    } finally {

      setSaving(false)

    }

  }


  /* ============================= */
  /* EDIT DOCTOR */
  /* ============================= */

  const editDoctor = (doctor) => {

    setEditingId(
      doctor.id
    )


    setFormData({
      name:
        doctor.name || '',

      department:
        doctor.department || '',

      specialization:
        doctor.specialization || '',

      available_days:
        doctor.available_days || [],

      start_time:
        doctor.start_time?.slice(0, 5) ||
        '09:00',

      end_time:
        doctor.end_time?.slice(0, 5) ||
        '18:00',

      image:
        doctor.image || '',
    })


    setImageFile(null)


    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }


  /* ============================= */
  /* DELETE DOCTOR */
  /* ============================= */

  const deleteDoctor = async (id) => {

    if (
      !window.confirm(
        'Are you sure you want to delete this doctor?'
      )
    ) {

      return

    }


    const token =
      getToken()


    if (!token) {

      navigate('/admin/login')

      return

    }


    try {

      const response =
        await fetch(
          `http://localhost:5000/api/doctors/${id}`,
          {
            method: 'DELETE',

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )


      const data =
        await response.json()


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        logout()

        return

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to delete doctor'
        )

      }


      setDoctors((prev) =>
        prev.filter(
          (doctor) =>
            doctor.id !== id
        )
      )

    } catch (err) {

      console.error(
        'Delete doctor error:',
        err
      )

      alert(
        err.message ||
        'Failed to delete doctor'
      )

    }

  }


  /* ============================= */
  /* IMAGE URL */
  /* ============================= */

  const getImageUrl = (image) => {

    if (!image) {
      return ''
    }


    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {

      return image

    }


    return `http://localhost:5000${image}`

  }


  return (

    <div className="doctor-management-page">


      {/* ============================= */}
      {/* NAVBAR */}
      {/* ============================= */}

      <header className="doctor-management-navbar">

        <Link
          to="/admin/appointments"
          className="doctor-admin-brand"
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


        <div className="doctor-nav-actions">

          <Link to="/admin/appointments">
            Appointments
          </Link>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </header>


      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <section className="doctor-management-header">

        <p>
          MEDICARE ADMINISTRATION
        </p>


        <h1>

          Doctor
          <br />

          <span>
            management.
          </span>

        </h1>


        <div>

          Add doctors, manage departments
          and control their appointment schedule.

        </div>

      </section>


      {/* ============================= */}
      {/* MAIN */}
      {/* ============================= */}

      <main className="doctor-management-main">


        {/* ============================= */}
        {/* FORM */}
        {/* ============================= */}

        <section className="doctor-form-card">


          <div className="doctor-form-heading">

            <p>

              {editingId
                ? 'EDIT DOCTOR'
                : 'ADD NEW DOCTOR'}

            </p>


            <h2>
              Doctor details
            </h2>

          </div>


          <form
            onSubmit={handleSubmit}
          >


            <div className="doctor-form-grid">


              {/* ============================= */}
              {/* NAME */}
              {/* ============================= */}

              <div className="doctor-form-group">

                <label>
                  Doctor Name *
                </label>


                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="Dr. John Doe"
                  required
                />

              </div>


              {/* ============================= */}
              {/* DEPARTMENT */}
              {/* ============================= */}

              <div className="doctor-form-group">

                <label>
                  Department *
                </label>


                <select
                  name="department"
                  value={
                    formData.department
                  }
                  onChange={handleInput}
                  required
                >

                  <option value="">
                    Select department
                  </option>

                  <option value="Cardiology">
                    Cardiology
                  </option>

                  <option value="Neurology">
                    Neurology
                  </option>

                  <option value="Orthopedics">
                    Orthopedics
                  </option>

                  <option value="Pediatrics">
                    Pediatrics
                  </option>

                  <option value="Dermatology">
                    Dermatology
                  </option>

                  <option value="General Medicine">
                    General Medicine
                  </option>

                </select>

              </div>


              {/* ============================= */}
              {/* SPECIALIZATION */}
              {/* ============================= */}

              <div className="doctor-form-group full">

                <label>
                  Specialization
                </label>


                <input
                  name="specialization"
                  value={
                    formData.specialization
                  }
                  onChange={handleInput}
                  placeholder="e.g. Interventional Cardiology"
                />

              </div>


              {/* ============================= */}
              {/* DOCTOR PHOTO */}
              {/* ============================= */}

              <div className="doctor-form-group full">

                <label>
                  Doctor Photo
                </label>


                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />


                {formData.image &&
                  !imageFile && (

                    <small
                      style={{
                        marginTop: '8px',
                        color: '#5f8291',
                      }}
                    >

                      Current photo is saved.
                      Select a new image to replace it.

                    </small>

                  )}


                {imageFile && (

                  <small
                    style={{
                      marginTop: '8px',
                      color: '#0b6f9f',
                    }}
                  >

                    Selected:
                    {' '}
                    {imageFile.name}

                  </small>

                )}

              </div>


              {/* ============================= */}
              {/* AVAILABLE DAYS */}
              {/* ============================= */}

              <div className="doctor-form-group full">

                <label>
                  Available Days *
                </label>


                <div className="day-selector">

                  {days.map((day) => (

                    <button
                      type="button"
                      key={day}
                      className={
                        formData.available_days.includes(
                          day
                        )
                          ? 'day active'
                          : 'day'
                      }
                      onClick={() =>
                        toggleDay(day)
                      }
                    >

                      {day.slice(0, 3)}

                    </button>

                  ))}

                </div>

              </div>


              {/* ============================= */}
              {/* START TIME */}
              {/* ============================= */}

              <div className="doctor-form-group">

                <label>
                  Start Time *
                </label>


                <input
                  type="time"
                  name="start_time"
                  value={
                    formData.start_time
                  }
                  onChange={
                    handleInput
                  }
                  required
                />

              </div>


              {/* ============================= */}
              {/* END TIME */}
              {/* ============================= */}

              <div className="doctor-form-group">

                <label>
                  End Time *
                </label>


                <input
                  type="time"
                  name="end_time"
                  value={
                    formData.end_time
                  }
                  onChange={
                    handleInput
                  }
                  required
                />

              </div>


            </div>


            {/* ============================= */}
            {/* ERROR */}
            {/* ============================= */}

            {error && (

              <div className="doctor-form-error">

                {error}

              </div>

            )}


            {/* ============================= */}
            {/* ACTIONS */}
            {/* ============================= */}

            <div className="doctor-form-actions">


              <button
                type="submit"
                className="doctor-save-button"
                disabled={saving}
              >

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Doctor'
                    : 'Add Doctor'
                }

              </button>


              {editingId && (

                <button
                  type="button"
                  className="doctor-reset-button"
                  onClick={resetForm}
                >

                  Cancel Edit

                </button>

              )}

            </div>


          </form>

        </section>


        {/* ============================= */}
        {/* DOCTOR LIST */}
        {/* ============================= */}

        <section className="doctor-list-section">


          <div className="doctor-list-heading">

            <div>

              <p>
                MEDICAL TEAM
              </p>

              <h2>
                Our doctors
              </h2>

            </div>


            <span>
              {doctors.length} doctors
            </span>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="doctor-empty">

              Loading doctors...

            </div>

          )}


          {/* EMPTY */}

          {!loading &&
            doctors.length === 0 && (

              <div className="doctor-empty">

                <strong>
                  No doctors added yet.
                </strong>

                <p>
                  Add your first doctor above.
                </p>

              </div>

            )}


          {/* LIST */}

          {!loading &&
            doctors.length > 0 && (

              <div className="doctor-management-list">


                {doctors.map((doctor) => (

                  <article
                    className="doctor-management-card"
                    key={doctor.id}
                  >


                    {/* ============================= */}
                    {/* AVATAR */}
                    {/* ============================= */}

                    <div className="doctor-avatar">


                      {doctor.image ? (

                        <img
                          src={
                            getImageUrl(
                              doctor.image
                            )
                          }
                          alt={
                            doctor.name
                          }
                        />

                      ) : (

                        doctor.name
                          ?.charAt(0)
                          ?.toUpperCase()

                      )}

                    </div>


                    {/* ============================= */}
                    {/* INFO */}
                    {/* ============================= */}

                    <div className="doctor-management-info">


                      <h3>
                        {doctor.name}
                      </h3>


                      <p>
                        {doctor.department}
                      </p>


                      {doctor.specialization && (

                        <small>
                          {
                            doctor.specialization
                          }
                        </small>

                      )}

                    </div>


                    {/* ============================= */}
                    {/* SCHEDULE */}
                    {/* ============================= */}

                    <div className="doctor-schedule">


                      <strong>
                        Schedule
                      </strong>


                      <span>

                        {doctor.available_days
                          ?.map(
                            (day) =>
                              day.slice(0, 3)
                          )
                          .join(' • ')}

                      </span>


                      <span>

                        {
                          doctor.start_time
                            ?.slice(0, 5)
                        }

                        {' – '}

                        {
                          doctor.end_time
                            ?.slice(0, 5)
                        }

                      </span>

                    </div>


                    {/* ============================= */}
                    {/* ACTIONS */}
                    {/* ============================= */}

                    <div className="doctor-management-actions">


                      <button
                        onClick={() =>
                          editDoctor(
                            doctor
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="delete"
                        onClick={() =>
                          deleteDoctor(
                            doctor.id
                          )
                        }
                      >
                        Delete
                      </button>


                    </div>


                  </article>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>

  )

}


export default DoctorManagement