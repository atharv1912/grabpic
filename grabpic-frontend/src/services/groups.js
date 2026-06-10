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

export const getUserGroups = async () => {
  const response = await fetch(`${BASE_URL}/events/my`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch groups');
  }
  return await response.json();
};

export const getGroupById = async (groupId) => {
  const response = await fetch(`${BASE_URL}/events/${groupId}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch group details');
  }
  return await response.json();
};

export const createGroup = async (name) => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ name }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create group');
  }
  
  return {
    success: true,
    group: data,
  };
};

export const joinGroup = async (groupCode) => {
  const response = await fetch(`${BASE_URL}/events/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ joinCode: groupCode }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to join group');
  }
  
  return {
    success: true,
    group: data,
  };
};