import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Login failed'
        )
      }

      localStorage.setItem(
        'medicare_admin_token',
        data.token
      )

      localStorage.setItem(
        'medicare_admin',
        JSON.stringify(data.admin)
      )

      navigate('/admin/appointments')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-icon">
          🏥
        </div>

        <h1>MediCare</h1>

        <p className="admin-login-subtitle">
          Admin Dashboard
        </p>

        <form onSubmit={handleLogin}>

          <div className="admin-input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="admin-input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

        <button
          className="back-home-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>

      </div>

    </div>
  )
}

export default AdminLogin