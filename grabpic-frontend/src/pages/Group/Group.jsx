import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const mockGroupData = {
  id: '1',
  name: 'Trip to Goa',
  members: ['Ayesha', 'Rahul', 'You', 'Sneha', 'Dev'],
}

const mockMyPhotos = [
  { id: '1', url: 'https://picsum.photos/seed/a/300/200', uploadedBy: 'Rahul' },
  { id: '2', url: 'https://picsum.photos/seed/b/300/200', uploadedBy: 'Ayesha' },
  { id: '3', url: 'https://picsum.photos/seed/c/300/200', uploadedBy: 'You' },
]

function Group() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [myPhotos, setMyPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setGroup(mockGroupData)
      setMyPhotos(mockMyPhotos)
      setLoading(false)
    }, 800)
  }, [id])

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = () => {
    if (!selectedFile) return

    setUploading(true)
    // later this will be a real API call with FormData
    console.log('Uploading file:', selectedFile.name)

    setTimeout(() => {
      alert(`"${selectedFile.name}" uploaded! Face recognition is processing...`)
      setSelectedFile(null)
      setUploading(false)
    }, 1000)
  }

  if (loading) return <div>Loading group...</div>

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>← Back</button>

      <h1>{group.name}</h1>
      <p>{group.members.length} members: {group.members.join(', ')}</p>

      <hr />

      <h2>Upload a Photo</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {selectedFile && <p>Selected: {selectedFile.name}</p>}
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      <hr />

      <h2>Your Photos in this Group</h2>
      <p>Photos where your face was recognized:</p>

      {myPhotos.length === 0 ? (
        <p>No photos found with your face yet.</p>
      ) : (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {myPhotos.map((photo) => (
            <div key={photo.id}>
              <img src={photo.url} alt="your photo" width={200} />
              <p>Uploaded by: {photo.uploadedBy}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Group