import { useState, useEffect } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser, registerUser } from '../../services/auth'

function Auth() {
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = isLogin
      ? await loginUser(formData.email, formData.password)
      : await registerUser(formData.name, formData.email, formData.password)

    if (result.success) {
      login(result.user)
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Soft background blooms */}
      <div
        className="absolute top-[-20%] right-[-15%] w-[55%] h-[55%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,74,247,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-[-20%] left-[-15%] w-[50%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,108,246,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[420px] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px 40px 36px',
        }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-ring)' }}
          >
            G
          </div>
          <h1
            className="font-serif text-3xl font-semibold tracking-tight mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            GrabPic
          </h1>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-lg p-1 mb-7 gap-1"
          style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}
        >
          {['Login', 'Register'].map((tab) => {
            const active = (tab === 'Login') === isLogin
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setIsLogin(tab === 'Login')}
                className="flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--accent)'
                  e.target.style.boxShadow = '0 0 0 3px var(--accent-ring)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-ring)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-ring)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-lg mt-2 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-60"
            style={{
              background: loading ? 'var(--text-muted)' : 'var(--accent)',
              boxShadow: '0 2px 10px var(--accent-ring)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
          >
            {loading
              ? (isLogin ? 'Signing in…' : 'Creating account…')
              : (isLogin ? 'Sign in' : 'Create account')
            }
          </button>
        </form>

        {/* Footer toggle */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold cursor-pointer bg-transparent border-none p-0 transition-colors duration-150"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth