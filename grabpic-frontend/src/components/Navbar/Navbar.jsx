import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? '1px solid var(--border)'
          : '1px solid var(--border-light)',
        boxShadow: scrolled ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none"
      >
        {/* Icon mark */}
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold select-none"
          style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-ring)' }}
        >
          G
        </span>
        <span
          className="font-serif text-xl font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-75"
          style={{ color: 'var(--text-primary)' }}
        >
          GrabPic
        </span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Profile Button (Name + Avatar) */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer border select-none hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--surface-alt)'
            e.currentTarget.style.borderColor = 'var(--border-light)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <div
            className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-[11px] font-bold text-white shadow-xs"
            style={{ background: 'linear-gradient(135deg, var(--accent), #8B6CF6)' }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitial(user?.name)
            )}
          </div>
          <span className="text-sm font-bold tracking-tight pr-1" style={{ color: 'var(--text-secondary)' }}>
            {user?.name || 'My Profile'}
          </span>
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer text-white"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 1px 6px var(--accent-ring)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-hover)'
            e.currentTarget.style.boxShadow = '0 2px 10px var(--accent-ring)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 1px 6px var(--accent-ring)'
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

export default Navbar