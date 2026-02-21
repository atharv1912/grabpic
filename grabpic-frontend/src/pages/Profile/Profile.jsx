import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>← Back</button>

      <h1>Your Profile</h1>

      <div>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <hr />

      <h2>Your Stats</h2>
      <p>Groups joined: 3</p>
      <p>Photos you appear in: 35</p>

      <hr />

      
    </div>
  )
}

export default Profile