const BASE_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const saved = localStorage.getItem('grabpic_user');
  if (saved) {
    const user = JSON.parse(saved);
    if (user && user.token) {
      return { 'Authorization': `Bearer ${user.token}` };
    }
  }
  return {};
};

export const getMyPhotosInGroup = async (groupId) => {
  const response = await fetch(`${BASE_URL}/events/${groupId}/photos/my`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch your photos');
  }
  return await response.json();
};

export const uploadPhoto = async (groupId, file) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${BASE_URL}/events/${groupId}/photos`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload photo');
  }
  
  return {
    success: true,
    message: 'Photo uploaded successfully! Face recognition is processing in the background.',
    photo: data,
  };
};