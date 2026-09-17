import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import BookAppointment from './pages/BookAppointment/BookAppointment'
import ScrollToTop from './ScrollToTop'

import AdminAppointments from './pages/AdminAppointments/AdminAppointments'

import AdminLogin from './pages/AdminLogin/AdminLogin'

import DoctorManagement from './pages/DoctorManagement/DoctorManagement'

import MyAppointments from './pages/MyAppointments/MyAppointments'

import './index.css'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <BrowserRouter>

      <ScrollToTop />

      <Routes>

        <Route
          path="/"
          element={<App />}
        />

        <Route
          path="/book-appointment"
          element={<BookAppointment />}
        />

        <Route
  path="/admin/appointments"
  element={<AdminAppointments />}
/>

<Route
  path="/admin/login"
  element={<AdminLogin />}
/>

<Route
  path="/admin/doctors"
  element={<DoctorManagement />}
/>

<Route
  path="/my-appointments"
  element={<MyAppointments />}
/>

      </Routes>

    </BrowserRouter>
  </React.StrictMode>
)