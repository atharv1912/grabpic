const BASE_URL = 'http://localhost:8000'

export const getMyPhotosInGroup = async (groupId) => {
  return [
    { id: '1', url: 'https://picsum.photos/seed/a/300/200', uploadedBy: 'Rahul' },
    { id: '2', url: 'https://picsum.photos/seed/b/300/200', uploadedBy: 'Ayesha' },
    { id: '3', url: 'https://picsum.photos/seed/c/300/200', uploadedBy: 'You' },
  ]
}

export const uploadPhoto = async (groupId, file) => {
  // later this will use FormData to send the actual file
  console.log(`Uploading ${file.name} to group ${groupId}`)
  return {
    success: true,
    message: 'Photo uploaded, face recognition is processing'
  }
}