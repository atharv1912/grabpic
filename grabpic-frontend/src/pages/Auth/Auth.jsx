import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser, registerUser } from '../../services/auth'
import styles from './Auth.module.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = isLogin
      ? await loginUser(formData.email, formData.password)
      : await registerUser(formData.name, formData.email, formData.password)

    if (result.success) {
      login(result.user)
      navigate('/dashboard')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>GrabPic</h1>
        <p className={styles.subtitle}>{isLogin ? 'Welcome back' : 'Create your account'}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className={styles.toggle}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button className={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth