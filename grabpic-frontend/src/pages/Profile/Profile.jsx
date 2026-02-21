import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Profile.module.css'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {getInitial(user?.name)}
          </div>
          <div className={styles.avatarInfo}>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <h3>Your Stats</h3>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>3</div>
            <div className={styles.statLabel}>Groups</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>35</div>
            <div className={styles.statLabel}>Photos of you</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Account</h3>
        <button className={styles.dangerBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile