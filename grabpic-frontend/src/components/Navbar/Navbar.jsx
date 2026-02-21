import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={styles.navbar}>
      <span className={styles.logo} onClick={() => navigate('/dashboard')}>
        GrabPic
      </span>
      <div className={styles.right}>
        <span className={styles.greeting}>Hi, {user?.name}</span>
        <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar