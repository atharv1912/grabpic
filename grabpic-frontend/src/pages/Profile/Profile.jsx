import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserGroups } from '../../services/groups'

function StatCard({ value, label }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center p-6 rounded-xl gap-1"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-light)',
      }}
    >
      <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

function Profile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [profileUser, setProfileUser] = useState(user)
  const [stats, setStats] = useState({ groups: 0, photos: 0 })
  const [uploadingSelfie, setUploadingSelfie] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const saved = localStorage.getItem('grabpic_user')
        if (!saved) return
        const parsed = JSON.parse(saved)
        
        // 1. Fetch live user details
        const res = await fetch('http://localhost:3000/api/users/me', {
          headers: { 'Authorization': `Bearer ${parsed.token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const updatedUser = { ...parsed, ...data }
          setProfileUser(updatedUser)
          login(updatedUser)
        }
        
        // 2. Fetch groups to calculate stats
        const groupsData = await getUserGroups()
        setStats({
          groups: groupsData.length,
          photos: groupsData.reduce((sum, g) => sum + (g.photoCount || 0), 0)
        })
      } catch (err) {
        console.error('Error fetching profile stats:', err)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleUploadSelfie = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingSelfie(true)
    try {
      const saved = localStorage.getItem('grabpic_user')
      if (!saved) return
      const parsed = JSON.parse(saved)
      
      const formData = new FormData()
      formData.append('photo', file)
      
      const res = await fetch('http://localhost:3000/api/users/selfie', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${parsed.token}` },
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed')
      }
      
      alert('Selfie uploaded successfully! Face embedding will be used to automatically find your photos in all groups.')
      const updatedUser = { ...parsed, ...data.user }
      setProfileUser(updatedUser)
      login(updatedUser)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploadingSelfie(false)
    }
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-5 min-h-[calc(100vh-57px)]">

      {/* Back nav */}
      <button
        onClick={() => navigate('/dashboard')}
        className="self-start flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <span>←</span> Back to Dashboard
      </button>

      {/* Profile card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
      >
        {/* Header band */}
        <div
          className="h-24 w-full"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #8B6CF6 60%, #C084FC 100%)', opacity: 0.12 }}
        />
        <div className="px-7 pb-7" style={{ marginTop: '-40px' }}>
          
          {/* Avatar / Selfie Upload Slot */}
          <div className="relative group/avatar w-20 h-20 mb-4">
            <div
              className="w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #8B6CF6 100%)',
                boxShadow: '0 8px 24px var(--accent-ring)',
                border: '3px solid var(--surface)',
              }}
            >
              {profileUser?.avatar_url ? (
                <img
                  src={profileUser.avatar_url}
                  alt="Selfie"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitial(profileUser?.name)
              )}
              
              {uploadingSelfie && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            
            {/* Hover overlay to change selfie */}
            <label
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-semibold cursor-pointer transition-opacity duration-200 text-center"
              style={{ border: '3px solid transparent' }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadSelfie}
                disabled={uploadingSelfie}
                className="hidden"
              />
              <span className="text-base mb-0.5">📸</span>
              <span>{profileUser?.avatar_url ? 'Change' : 'Upload'}</span>
            </label>
          </div>

          <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{profileUser?.name}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profileUser?.email}</p>

          {/* Stats */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Your Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={stats.groups} label="Groups Joined" />
              <StatCard value={stats.photos} label="Photos Matched" />
            </div>
          </div>
        </div>
      </div>

      {/* Account card */}
      <div
        className="p-6 rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account</h2>
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'var(--danger-soft)', border: '1px solid rgba(220,38,38,0.12)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Sign out</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>You will be returned to the login screen</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
            style={{
              background: 'var(--danger)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--danger)'}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile