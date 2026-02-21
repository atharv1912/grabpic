import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const mockGroups = [
  { id: '1', name: 'Trip to Goa', memberCount: 5, photoCount: 23 },
  { id: '2', name: 'College Reunion', memberCount: 12, photoCount: 47 },
  { id: '3', name: 'Office Party', memberCount: 8, photoCount: 15 },
]

function Dashboard() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // simulating an API call with a small delay
    setTimeout(() => {
      setGroups(mockGroups)
      setLoading(false)
    }, 800)
  }, [])

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) return <div>Loading your groups...</div>

  return (
    <div>
      <div>
        <h1>Welcome, {user?.name}</h1>
      </div>

      <h2>Your Groups</h2>

      {groups.length === 0 ? (
        <p>You have no groups yet. Create or join one!</p>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.id} onClick={() => handleGroupClick(group.id)}>
              <h3>{group.name}</h3>
              <p>{group.memberCount} members</p>
              <p>{group.photoCount} photos</p>
            </div>
          ))}
        </div>
      )}

      <button>Create Group</button>
      <button>Join Group</button>
    </div>
  )
}

export default Dashboard