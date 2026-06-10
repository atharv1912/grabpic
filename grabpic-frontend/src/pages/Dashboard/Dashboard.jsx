import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserGroups, createGroup, joinGroup } from '../../services/groups'
import { Folder, Users, Image as ImageIcon, ArrowUpRight } from 'lucide-react'

// Color map for avatar background variations
const AVATAR_COLORS = [
  'linear-gradient(135deg, #FF6B6B, #FF8E53)',
  'linear-gradient(135deg, #4E65FF, #92EFFD)',
  'linear-gradient(135deg, #5B4AF7, #8B6CF6)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #FC466B, #3F5EFB)',
]

function GroupCard({ group, onClick }) {
  const [hovered, setHovered] = useState(false)

  // Generate distinct initials and colors based on group name
  const getInitialsForGroup = (name) => {
    if (name.includes('Goa')) return ['AY', 'RH', 'DE', 'SN', 'AP']
    if (name.includes('Reunion')) return ['AL', 'BE', 'CH', 'DA', 'EM']
    return ['OP', 'HR', 'MA', 'KA', 'VI']
  }

  const initials = getInitialsForGroup(group.name)
  const displayAvatars = initials.slice(0, 3)
  const extraCount = Math.max(0, group.memberCount - displayAvatars.length)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 ease-out overflow-hidden select-none"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        minHeight: '170px',
      }}
    >
      {/* Dynamic light accent gradient background blur */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full pointer-events-none transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(91,74,247,0.06) 0%, transparent 70%)',
          transform: hovered ? 'scale(1.4)' : 'scale(1)',
          filter: 'blur(10px)',
        }}
      />

      <div className="flex flex-col gap-4">
        {/* Top bar with icon and navigation indicator */}
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: hovered ? 'var(--accent-soft)' : 'var(--surface-alt)',
              border: `1px solid ${hovered ? 'rgba(91,74,247,0.15)' : 'var(--border-light)'}`,
            }}
          >
            <Folder
              size={16}
              className="transition-colors duration-300"
              style={{ color: hovered ? 'var(--accent)' : 'var(--text-secondary)' }}
            />
          </div>
          
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: hovered ? 'var(--accent)' : 'transparent',
              color: hovered ? '#fff' : 'var(--text-muted)',
              transform: hovered ? 'rotate(0deg)' : 'rotate(-45deg)',
            }}
          >
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3
            className="text-lg font-bold leading-tight tracking-tight transition-colors duration-200"
            style={{ color: hovered ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {group.name}
          </h3>
        </div>
      </div>

      {/* Footer statistics & avatars */}
      <div className="flex items-end justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        {/* Photo count with icon */}
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <ImageIcon size={13} className="text-stone-400" />
          <span>{group.photoCount} photos</span>
        </div>

        {/* Avatar Stack */}
        <div className="flex items-center">
          {displayAvatars.map((initial, i) => (
            <div
              key={initial}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 select-none transition-transform duration-300"
              style={{
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                borderColor: 'var(--surface)',
                marginLeft: i > 0 ? '-8px' : '0px',
                transform: hovered ? `translateX(${i * -2}px)` : 'translateX(0)',
              }}
            >
              {initial}
            </div>
          ))}
          {extraCount > 0 && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-stone-600 border-2 select-none transition-transform duration-300"
              style={{
                background: 'var(--surface-alt)',
                borderColor: 'var(--surface)',
                marginLeft: '-8px',
                transform: hovered ? `translateX(${displayAvatars.length * -2}px)` : 'translateX(0)',
              }}
            >
              +{extraCount}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    getUserGroups().then(data => { setGroups(data); setLoading(false) })
  }, [])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setActionLoading(true)
    try {
      const res = await createGroup(groupName)
      if (res.success) {
        const data = await getUserGroups()
        setGroups(data)
        setShowCreateModal(false)
        setGroupName('')
        navigate(`/group/${res.group.id}`)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinGroup = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setActionLoading(true)
    try {
      const res = await joinGroup(joinCode)
      if (res.success) {
        const data = await getUserGroups()
        setGroups(data)
        setShowJoinModal(false)
        setJoinCode('')
        navigate(`/group/${res.group.id}`)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading your groups…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-57px)]">
      <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Your Groups</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Select a group to browse and upload photos</p>
        </div>
        {groups.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-ring)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              + Create Group
            </button>
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl flex-1"
          style={{ border: '2px dashed var(--border)', background: 'var(--surface)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5"
            style={{ background: 'var(--accent-soft)' }}>📷</div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>No groups yet</h3>
          <p className="text-sm mb-7 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Create or join a group to start finding your photos from events.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-alt)'}>
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--accent)', boxShadow: '0 2px 10px var(--accent-ring)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              Create your first group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} onClick={() => navigate(`/group/${group.id}`)} />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md p-6 rounded-2xl flex flex-col gap-4 animate-scale-up"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Create New Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Give your event group a name. Guests will be able to upload photos and find themselves!
            </p>
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kokan Trip 2026"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  disabled={actionLoading}
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
              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
                  style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-60"
                  style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-ring)' }}
                >
                  {actionLoading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md p-6 rounded-2xl flex flex-col gap-4 animate-scale-up"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Join Group</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Enter the unique 6-character code shared by the group organizer.
            </p>
            <form onSubmit={handleJoinGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Join Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8bc460"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                  disabled={actionLoading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200 font-mono tracking-widest text-center text-lg uppercase"
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
              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer"
                  style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-60"
                  style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-ring)' }}
                >
                  {actionLoading ? 'Joining...' : 'Join Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard