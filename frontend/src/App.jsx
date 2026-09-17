import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import BookAppointment from './pages/BookAppointment/BookAppointment'

function AnimatedNumber({ value, suffix = '' }) {

  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  const numberRef = useRef(null)


  useEffect(() => {

    const element = numberRef.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !started) {
          setStarted(true)
        }

      },
      {
        threshold: 0.4,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()

  }, [started])


  useEffect(() => {

    if (!started) return

    let startTime = null

    const duration = 1600


    const animate = (currentTime) => {

      if (!startTime) {
        startTime = currentTime
      }

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      )

      const easedProgress =
        1 - Math.pow(1 - progress, 3)


      setCount(
        Math.floor(easedProgress * value)
      )


      if (progress < 1) {

        requestAnimationFrame(animate)

      } else {

        setCount(value)

      }

    }


    requestAnimationFrame(animate)

  }, [started, value])


  return (
    <span ref={numberRef}>
      {count}
      {suffix}
    </span>
  )
}


function App() {

  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)

  const [selectedDoctor, setSelectedDoctor] = useState(null)

  const [selectedService, setSelectedService] = useState(null)


  useEffect(() => {

    const loadDoctors = async () => {

      try {

        const response =
          await fetch('http://localhost:5000/api/doctors')

        const data =
          await response.json()


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

      } catch (error) {

        console.error(
          'Doctors loading error:',
          error
        )

        setDoctors([])

      } finally {

        setDoctorsLoading(false)

      }

    }


    loadDoctors()

  }, [])


  return (
    <div className="medicare">


      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <a
          href="#home"
          className="brand"
        >

          <div className="brand-symbol">
            <span></span>
            <span></span>
          </div>

          <div className="brand-text">
            <strong>MediCare</strong>
            <small>HEALTHCARE</small>
          </div>

        </a>


        <nav className="nav-menu">

          <a
            className="active"
            href="#home"
          >
            Home
          </a>

          <a href="#about">
            About
          </a>

          <a href="#services">
            Services
          </a>

          <a href="#doctors">
            Doctors
          </a>

          <a href="#departments">
            Departments
          </a>

          <a href="#contact">
            Contact
          </a>

        </nav>


        <div className="nav-actions">

          <Link
            to="/admin/login"
            className="admin-login-nav"
          >
            Admin
          </Link>


<Link to="/my-appointments" className="my-appointments-nav-button">
  My Appointments
</Link>

<Link to="/book-appointment" className="nav-appointment">
  Book Appointment
</Link>
        </div>

      </header>



      {/* ================= HERO ================= */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-bg-shape shape-one"></div>
        <div className="hero-bg-shape shape-two"></div>

        <div className="hero-left">

          <div className="eyebrow hero-animation">

            <span className="eyebrow-line"></span>

            YOUR HEALTH, OUR PRIORITY

          </div>


          <h1 className="hero-title hero-animation">

            Healthcare
            <br />

            <span>that cares</span>

            <br />

            about you.

          </h1>


          <p className="hero-description hero-animation">

            At MediCare, we combine experienced doctors,
            modern technology and compassionate care to
            make your healthcare journey simpler and better.

          </p>


          <div className="hero-actions hero-animation">

            <Link
              to="/book-appointment"
              className="primary-button"
            >

              Book an appointment

              <span>↗</span>

            </Link>


            <a
              href="#doctors"
              className="text-button"
            >

              Find a doctor

              <span>→</span>

            </a>

          </div>


          <div className="hero-bottom-info hero-animation">

            <div className="hero-stat">

              <strong>
                10K+
              </strong>

              <span>
                Patients cared for
              </span>

            </div>


            <div className="stat-divider"></div>


            <div className="hero-stat">

              <strong>
                50+
              </strong>

              <span>
                Expert doctors
              </span>

            </div>


            <div className="stat-divider"></div>


            <div className="hero-stat">

              <strong>
                15+
              </strong>

              <span>
                Departments
              </span>

            </div>

          </div>

        </div>



        {/* HERO IMAGE */}

        <div className="hero-right">

          <div className="hero-photo">

            <div className="photo-background-circle"></div>

            <img
              src="/images/1.jpeg"
              alt="MediCare doctor"
              className="hero-image"
            />

          </div>


          <div className="floating-card patients-card">

            <div className="avatar-row">

              <span>👨🏻</span>
              <span>👩🏻</span>
              <span>👨🏽</span>
              <span>👩🏼</span>

              <b>+</b>

            </div>


            <div>

              <div className="rating">
                ★★★★★
              </div>

              <strong>
                10k+ happy patients
              </strong>

            </div>

          </div>


          <div className="floating-card experience-card">

            <div className="experience-number">

              15<span>+</span>

            </div>

            <p>
              Years of trusted
              <br />
              healthcare
            </p>

          </div>


          <div className="floating-card care-card">

            <div className="care-icon">
              ✚
            </div>

            <div>

              <strong>
                Quality care
              </strong>

              <span>
                Available for you
              </span>

            </div>

            <div className="online-dot"></div>

          </div>


          <div className="circle-scroll">

            <span>↓</span>

            <div>
              SCROLL • SCROLL • SCROLL •
            </div>

          </div>

        </div>

      </section>



      {/* ================= TRUST STRIP ================= */}

      <section className="trust-strip">

        <div className="trust-item">

          <span>01</span>

          <div>

            <strong>
              Expert doctors
            </strong>

            <p>
              Experienced medical professionals
            </p>

          </div>

        </div>


        <div className="trust-item">

          <span>02</span>

          <div>

            <strong>
              Modern facilities
            </strong>

            <p>
              Advanced healthcare technology
            </p>

          </div>

        </div>


        <div className="trust-item">

          <span>03</span>

          <div>

            <strong>
              Patient focused
            </strong>

            <p>
              Care designed around you
            </p>

          </div>

        </div>


        <div className="trust-item">

          <span>04</span>

          <div>

            <strong>
              Easy appointments
            </strong>

            <p>
              Book your visit in minutes
            </p>

          </div>

        </div>

      </section>



      {/* ================= ABOUT ================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="section-number">
          01 / ABOUT MEDICARE
        </div>


        <div className="about-grid">

          <div className="about-image-area">

            <div className="about-image">

              <img
                src="/images/2.jpeg"
                alt="MediCare healthcare"
                className="section-image"
              />

            </div>


            <div className="about-small-card">

              <span>✚</span>

              <div>

                <strong>
                  Care with compassion
                </strong>

                <p>
                  Every patient matters
                </p>

              </div>

            </div>

          </div>


          <div className="about-content">

            <p className="section-label">
              WHO WE ARE
            </p>


            <h2>

              Healthcare should
              <br />

              feel <span>human.</span>

            </h2>


            <p className="large-copy">

              MediCare is built around one simple idea:
              healthcare should be easier to access,
              easier to understand and centred around
              the people who need it.

            </p>


            <div className="about-list">

              <div className="about-list-item">

                <span>01</span>

                <div>

                  <strong>
                    Experienced professionals
                  </strong>

                  <p>
                    Get care from qualified doctors
                    across multiple specialties.
                  </p>

                </div>

                <span className="plus">
                  +
                </span>

              </div>


              <div className="about-list-item">

                <span>02</span>

                <div>

                  <strong>
                    Modern healthcare
                  </strong>

                  <p>
                    Technology and facilities designed
                    for better patient experiences.
                  </p>

                </div>

                <span className="plus">
                  +
                </span>

              </div>


              <div className="about-list-item">

                <span>03</span>

                <div>

                  <strong>
                    Personalized attention
                  </strong>

                  <p>
                    Every treatment journey starts
                    with understanding you.
                  </p>

                </div>

                <span className="plus">
                  +
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* ================= SERVICES ================= */}

{/* ================= SERVICES ================= */}

<section
  className="services-section"
  id="services"
>

  <div className="section-heading-row">

    <div>

      <p className="section-label">
        WHAT WE OFFER
      </p>

      <h2>

        Healthcare services
        <br />

        <span>
          for every need.
        </span>

      </h2>

    </div>


    <p className="heading-description">

      From routine consultations to specialized
      medical care, our services are designed
      around your health.

    </p>

  </div>


  <div className="services-grid">


    {/* SERVICE 01 */}

    <div className="service-card">

      <div className="service-image">

        <img
          src="/images/3.jpeg"
          alt="General Medicine"
        />

      </div>


      <div className="service-content">

        <div className="service-top">

          <span>01</span>

          <div>
            ♥
          </div>

        </div>


        <h3>
          General Medicine
        </h3>


        <p>
          Comprehensive care for everyday
          health concerns and medical needs.
        </p>


        <button
          type="button"
          className="service-learn-button"
          onClick={() =>
            setSelectedService({
              number: '01',
              title: 'General Medicine',
              icon: '♥',
              image: '/images/3.jpeg',
              description:
                'Comprehensive medical care for common health concerns, routine illnesses and everyday medical needs.',
              points: [
                'General health consultation',
                'Routine medical assessment',
                'Treatment and medication guidance',
                'Follow-up care'
              ]
            })
          }
        >
          Learn more →
        </button>

      </div>

    </div>



    {/* SERVICE 02 */}

    <div className="service-card">

      <div className="service-image">

        <img
          src="/images/4.jpeg"
          alt="Specialist Care"
        />

      </div>


      <div className="service-content">

        <div className="service-top">

          <span>02</span>

          <div>
            ♡
          </div>

        </div>


        <h3>
          Specialist Care
        </h3>


        <p>
          Connect with experienced specialists
          across multiple medical fields.
        </p>


        <button
          type="button"
          className="service-learn-button"
          onClick={() =>
            setSelectedService({
              number: '02',
              title: 'Specialist Care',
              icon: '♡',
              image: '/images/4.jpeg',
              description:
                'Get access to experienced doctors and specialists across different areas of healthcare.',
              points: [
                'Specialist consultations',
                'Department-based medical care',
                'Expert medical guidance',
                'Personalized treatment planning'
              ]
            })
          }
        >
          Explore specialists →
        </button>

      </div>

    </div>



    {/* SERVICE 03 */}

    <div className="service-card">

      <div className="service-image">

        <img
          src="/images/5.jpeg"
          alt="Diagnostics"
        />

      </div>


      <div className="service-content">

        <div className="service-top">

          <span>03</span>

          <div>
            ✚
          </div>

        </div>


        <h3>
          Diagnostics
        </h3>


        <p>
          Modern diagnostic services to help
          doctors understand your health.
        </p>


        <button
          type="button"
          className="service-learn-button"
          onClick={() =>
            setSelectedService({
              number: '03',
              title: 'Diagnostics',
              icon: '✚',
              image: '/images/5.jpeg',
              description:
                'Diagnostic services that help healthcare professionals better understand your health and support accurate care.',
              points: [
                'Diagnostic evaluation',
                'Health condition assessment',
                'Medical test guidance',
                'Results-based consultation'
              ]
            })
          }
        >
          View services →
        </button>

      </div>

    </div>



    {/* SERVICE 04 */}

    <div className="service-card">

      <div className="service-image">

        <img
          src="/images/6.jpeg"
          alt="Health Checkups"
        />

      </div>


      <div className="service-content">

        <div className="service-top">

          <span>04</span>

          <div>
            ✦
          </div>

        </div>


        <h3>
          Health Checkups
        </h3>


        <p>
          Preventive health checkups designed
          to keep you one step ahead.
        </p>


        <button
          type="button"
          className="service-learn-button"
          onClick={() =>
            setSelectedService({
              number: '04',
              title: 'Health Checkups',
              icon: '✦',
              image: '/images/6.jpeg',
              description:
                'Preventive health checkups designed to help you understand your health and stay ahead of potential problems.',
              points: [
                'Routine health screening',
                'Preventive health assessment',
                'Basic health monitoring',
                'Personalized health guidance'
              ]
            })
          }
        >
          Book checkup →
        </button>

      </div>

    </div>

  </div>

</section>

{/* ================= SERVICE DETAILS MODAL ================= */}

{selectedService && (

  <div
    className="service-modal-overlay"
    onClick={() => setSelectedService(null)}
  >

    <div
      className="service-modal"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <button
        type="button"
        className="service-modal-close"
        onClick={() => setSelectedService(null)}
        aria-label="Close service details"
      >
        ×
      </button>


      {/* IMAGE */}

      <div className="service-modal-image">

        <img
          src={selectedService.image}
          alt={selectedService.title}
        />

        <div className="service-modal-number">
          {selectedService.number}
        </div>

      </div>


      {/* CONTENT */}

      <div className="service-modal-content">

        <div className="service-modal-icon">
          {selectedService.icon}
        </div>

        <p className="section-label">
          MEDICARE SERVICE
        </p>

        <h2>
          {selectedService.title}
        </h2>

        <p className="service-modal-description">
          {selectedService.description}
        </p>


        <div className="service-modal-list">

          {selectedService.points.map(
            (point, index) => (

              <div
                className="service-modal-list-item"
                key={index}
              >

                <span>
                  ✓
                </span>

                <strong>
                  {point}
                </strong>

              </div>

            )
          )}

        </div>


        <Link
          to="/book-appointment"
          className="primary-button service-modal-button"
          onClick={() => setSelectedService(null)}
        >
          Book an appointment
          <span>↗</span>
        </Link>

      </div>

    </div>

  </div>

)}



      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stats-heading">

          <p className="section-label">
            MEDICARE BY NUMBERS
          </p>


          <h2>

            Trusted by thousands.
            <br />

            <span>
              Built for better care.
            </span>

          </h2>

        </div>


        <div className="big-stats">

          <div>

            <strong>

              <AnimatedNumber
                value={10}
                suffix="K+"
              />

            </strong>

            <p>
              Patients served
            </p>

          </div>


          <div>

            <strong>

              <AnimatedNumber
                value={50}
                suffix="+"
              />

            </strong>

            <p>
              Medical professionals
            </p>

          </div>


          <div>

            <strong>

              <AnimatedNumber
                value={15}
                suffix="+"
              />

            </strong>

            <p>
              Medical departments
            </p>

          </div>


          <div>

            <strong>

              <AnimatedNumber
                value={98}
                suffix="%"
              />

            </strong>

            <p>
              Patient satisfaction
            </p>

          </div>

        </div>

      </section>



      {/* ================= DOCTORS ================= */}

      <section
        className="doctors-section"
        id="doctors"
      >

        <div className="section-heading-row">

          <div>

            <p className="section-label">
              OUR DOCTORS
            </p>

            <h2>

              Meet the people
              <br />

              <span>
                behind the care.
              </span>

            </h2>

          </div>


          <a
            className="outline-button"
            href="#doctors"
          >
            View all doctors →
          </a>

        </div>



        <div className="doctors-grid">


          {/* LOADING */}

          {doctorsLoading ? (

            <div className="doctor-card">

              <div className="doctor-card-image doctor-one">

                <div className="empty-image-placeholder">

                  <span>
                    ⏳
                  </span>

                </div>

              </div>


              <div className="doctor-info">

                <div>

                  <h3>
                    Loading doctors...
                  </h3>

                  <p>
                    Please wait
                  </p>

                </div>

              </div>

            </div>


          ) : doctors.length === 0 ? (


            /* NO DOCTORS */

            <div className="doctor-card">

              <div className="doctor-card-image doctor-one">

                <div className="empty-image-placeholder">

                  <span>
                    👨‍⚕️
                  </span>

                </div>

              </div>


              <div className="doctor-info">

                <div>

                  <h3>
                    No doctors available
                  </h3>

                  <p>
                    Add doctors from Admin → Doctors
                  </p>

                </div>

              </div>

            </div>


          ) : (


            /* DOCTOR CARDS */

            doctors.map((doctor, index) => (

              <div
                className="doctor-card"
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {

                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {

                    event.preventDefault()

                    setSelectedDoctor(doctor)

                  }

                }}
              >


                <div
                  className={`doctor-card-image doctor-${index + 1}`}
                >

                  {doctor.image ? (

                    <img
                      src={
                        doctor.image.startsWith('http')
                          ? doctor.image
                          : `http://localhost:5000${doctor.image}`
                      }
                      alt={doctor.name}
                      className="doctor-home-image"
                    />

                  ) : (

                    <div className="empty-image-placeholder">

                      <span>

                        {index % 2 === 0
                          ? '👨‍⚕️'
                          : '👩‍⚕️'}

                      </span>

                    </div>

                  )}

                </div>


                <div className="doctor-info">

                  <div>

                    <h3>
                      {doctor.name}
                    </h3>

                    <p>
                      {doctor.department}
                    </p>

                  </div>


                  <span>
                    ↗
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      </section>



      {/* ================= DOCTOR DETAILS MODAL ================= */}

      {selectedDoctor && (

        <div
          className="doctor-modal-overlay"
          onClick={() => setSelectedDoctor(null)}
        >

          <div
            className="doctor-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <button
              type="button"
              className="doctor-modal-close"
              onClick={() =>
                setSelectedDoctor(null)
              }
              aria-label="Close doctor details"
            >
              ×
            </button>



            {/* DOCTOR IMAGE */}

            <div className="doctor-modal-image">

              {selectedDoctor.image ? (

                <img
                  src={
                    selectedDoctor.image.startsWith('http')
                      ? selectedDoctor.image
                      : `http://localhost:5000${selectedDoctor.image}`
                  }
                  alt={selectedDoctor.name}
                />

              ) : (

                <div className="doctor-modal-placeholder">

                  {selectedDoctor.name
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>

              )}

            </div>



            {/* DOCTOR DETAILS */}

            <div className="doctor-modal-content">

              <p className="section-label">
                MEDICARE DOCTOR
              </p>


              <h2>
                {selectedDoctor.name}
              </h2>


              <p className="doctor-modal-department">

                {selectedDoctor.department}

              </p>



              {selectedDoctor.specialization && (

                <div className="doctor-detail-row">

                  <span>
                    Specialization
                  </span>

                  <strong>
                    {selectedDoctor.specialization}
                  </strong>

                </div>

              )}



              <div className="doctor-detail-row">

                <span>
                  Available days
                </span>

                <strong>

                  {Array.isArray(
                    selectedDoctor.available_days
                  )
                    ? selectedDoctor.available_days.join(', ')
                    : selectedDoctor.available_days ||
                      'Not specified'}

                </strong>

              </div>



              <div className="doctor-detail-row">

                <span>
                  Consultation time
                </span>

                <strong>

                  {selectedDoctor.start_time
                    ? selectedDoctor.start_time.slice(0, 5)
                    : '--'}

                  {' – '}

                  {selectedDoctor.end_time
                    ? selectedDoctor.end_time.slice(0, 5)
                    : '--'}

                </strong>

              </div>



<Link
  to={`/book-appointment?doctor=${selectedDoctor.id}`}
  className="primary-button doctor-modal-button"
  onClick={() => setSelectedDoctor(null)}
>
  Book appointment
  <span>↗</span>
</Link>

            </div>

          </div>

        </div>

      )}



      {/* ================= HEALTHCARE IMAGE ================= */}

      <section className="care-showcase">

        <div className="care-showcase-image">

          <img
            src="/images/6.jpeg"
            alt="MediCare consultation"
          />


          <div className="play-button">

            <span>
              ▶
            </span>

          </div>

        </div>


        <div className="care-showcase-content">

          <p className="section-label">
            CARE THAT CONNECTS
          </p>


          <h2>

            Better conversations.
            <br />

            <span>
              Better healthcare.
            </span>

          </h2>


          <p>

            We believe good healthcare starts with
            listening. Our doctors take the time to
            understand your concerns and create a
            treatment plan around you.

          </p>


          <a
            href="#appointment"
            className="primary-button"
          >

            Start your journey

            <span>
              ↗
            </span>

          </a>

        </div>

      </section>



      {/* ================= DEPARTMENTS ================= */}

      <section
        className="departments-section"
        id="departments"
      >

        <div className="department-intro">

          <p className="section-label">
            OUR DEPARTMENTS
          </p>


          <h2>

            Find the right
            <br />

            <span>
              care for you.
            </span>

          </h2>


          <p>

            Explore our medical departments and
            find the right specialist for your needs.

          </p>

        </div>



        <div className="department-list">

          <a href="#doctors">

            <span>
              01
            </span>

            <strong>
              Cardiology
            </strong>

            <small>
              Heart & cardiovascular care
            </small>

            <b>
              ↗
            </b>

          </a>


          <a href="#doctors">

            <span>
              02
            </span>

            <strong>
              Neurology
            </strong>

            <small>
              Brain & nervous system care
            </small>

            <b>
              ↗
            </b>

          </a>


          <a href="#doctors">

            <span>
              03
            </span>

            <strong>
              Orthopedics
            </strong>

            <small>
              Bones, joints & muscles
            </small>

            <b>
              ↗
            </b>

          </a>


          <a href="#doctors">

            <span>
              04
            </span>

            <strong>
              Pediatrics
            </strong>

            <small>
              Healthcare for children
            </small>

            <b>
              ↗
            </b>

          </a>


          <a href="#doctors">

            <span>
              05
            </span>

            <strong>
              Dermatology
            </strong>

            <small>
              Skin & hair care
            </small>

            <b>
              ↗
            </b>

          </a>

        </div>

      </section>



      {/* ================= APPOINTMENT ================= */}

      <section
        className="appointment-section"
        id="appointment"
      >

        <div className="appointment-inner">

          <div className="appointment-content">

            <p className="section-label">
              READY WHEN YOU ARE
            </p>


            <h2>

              Take the first step
              <br />

              towards <span>better health.</span>

            </h2>


            <p>

              Find a doctor, choose a convenient time
              and book your appointment with MediCare.

            </p>


            <Link
              to="/book-appointment"
              className="primary-button"
            >

              Book an appointment

              <span>
                ↗
              </span>

            </Link>

          </div>



          {/* APPOINTMENT IMAGE */}

          <div className="appointment-image">

            <img
              src="/images/7.jpeg"
              alt="MediCare appointment"
            />


            <div className="appointment-image-card">

              <span>
                ✚
              </span>

              <div>

                <strong>
                  Your health matters
                </strong>

                <small>
                  We're here for you
                </small>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* ================= FOOTER ================= */}

      <footer
        className="footer"
        id="contact"
      >

        <div className="footer-top">

          <div className="footer-brand">

            <a
              href="#home"
              className="brand footer-logo"
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

            </a>


            <p>

              Better healthcare starts with
              better access, better care and
              better experiences.

            </p>

          </div>



          <div className="footer-column">

            <h4>
              Explore
            </h4>

            <a href="#about">
              About
            </a>

            <a href="#services">
              Services
            </a>

            <a href="#doctors">
              Doctors
            </a>

            <a href="#departments">
              Departments
            </a>

          </div>



          <div className="footer-column">

            <h4>
              Patient
            </h4>

            <a href="#appointment">
              Appointment
            </a>

            <a href="#appointment">
              Patient Portal
            </a>

            <a href="#appointment">
              Health Records
            </a>

            <a href="#appointment">
              Support
            </a>

          </div>



          <div className="footer-column">

            <h4>
              Contact
            </h4>

            <a href="tel:+91629771499">
              +91 62977 16499
            </a>

            <a href="mailto:aamit61040@gmail.com">
              aamit61040@gmail.com
            </a>

            <p>

              Mon – Sat
              <br />

              9:00 AM – 8:00 PM

            </p>

          </div>

        </div>



        <div className="footer-big-text">
          MediCare
        </div>


        <div className="footer-bottom">

          <span>
            © 2026 MediCare. All rights reserved.
          </span>

          <span>
            Built with care.
          </span>

        </div>

      </footer>

    </div>
  )
}


export default App