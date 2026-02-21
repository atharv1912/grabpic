import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserGroups } from '../../services/groups'
import styles from './Dashboard.module.css'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Dashboard() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroups = async () => {
      const data = await getUserGroups()
      setGroups(data)
      setLoading(false)
    }
    fetchGroups()
  }, [])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your groups...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Your Groups</h2>
        <p>Click a group to view and upload photos</p>
      </div>

      {groups.length === 0 ? (
        <div className={styles.empty}>
          <p>You have no groups yet.</p>
          <button>Create your first group</button>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <div
              key={group.id}
              className={styles.groupCard}
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <h3 className={styles.groupName}>{group.name}</h3>
              <div className={styles.groupMeta}>
                <span>👥 {group.memberCount} members</span>
                <span>🖼 {group.photoCount} photos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button>Create Group</button>
        <button className={styles.joinBtn}>Join Group</button>
      </div>
    </div>
  )
}

export default Dashboard