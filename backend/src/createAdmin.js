require('dotenv').config()

const bcrypt = require('bcryptjs')
const pool = require('./config/db')

const createAdmin = async () => {
  try {
    const name = 'MediCare Admin'
    const email = 'admin@medicare.com'
    const password = process.env.ADMIN_PASSWORD 

    const existingAdmin = await pool.query(
      `SELECT id
       FROM admin_users
       WHERE email = $1`,
      [email]
    )

    if (existingAdmin.rows.length > 0) {
      console.log('Admin already exists')
      process.exit(0)
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    )

    await pool.query(
      `INSERT INTO admin_users
      (name, email, password_hash)
      VALUES ($1, $2, $3)`,
      [
        name,
        email,
        passwordHash,
      ]
    )

    console.log('Admin created successfully')
    console.log('Email:', email)
    console.log('Password:', password)

    process.exit(0)
  } catch (error) {
    console.error('Admin creation error:', error)
    process.exit(1)
  }
}

createAdmin()