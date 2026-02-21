import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      borderBottom: '1px solid #ddd',
      backgroundColor: '#fff'
    }}>
      <span
        onClick={() => navigate('/dashboard')}
        style={{ fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}
      >
        GrabPic
      </span>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>Hi, {user?.name}</span>
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar