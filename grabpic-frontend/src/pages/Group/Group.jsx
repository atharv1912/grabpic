import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroupById } from '../../services/groups'
import { getMyPhotosInGroup, uploadPhoto } from '../../services/photos'
import styles from './Group.module.css'

function Group() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [myPhotos, setMyPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const groupData = await getGroupById(id)
      const photosData = await getMyPhotosInGroup(id)
      setGroup(groupData)
      setMyPhotos(photosData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    const result = await uploadPhoto(id, selectedFile)
    alert(result.message)
    setSelectedFile(null)
    setUploading(false)
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading group...</div>

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className={styles.groupHeader}>
        <h1>{group.name}</h1>
        <p>👥 {group.members.join(', ')}</p>
      </div>

      <div className={styles.section}>
        <h2>Upload a Photo</h2>
        <div className={styles.uploadArea}>
          <label className={styles.fileLabel}>
            📷 Choose Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {selectedFile && (
            <span className={styles.fileName}>{selectedFile.name}</span>
          )}
          <button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Your Photos in this Group</h2>
        {myPhotos.length === 0 ? (
          <p className={styles.empty}>No photos found with your face yet.</p>
        ) : (
          <div className={styles.photosGrid}>
            {myPhotos.map((photo) => (
              <div key={photo.id} className={styles.photoCard}>
                <img src={photo.url} alt="your face in group" />
                <div className={styles.photoMeta}>Uploaded by {photo.uploadedBy}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Group