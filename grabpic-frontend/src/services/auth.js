const BASE_URL = 'http://localhost:3000/api';

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  return {
    success: true,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar_url: data.user.avatar_url || null,
      token: data.token,
    }
  };
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  
  return {
    success: true,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar_url: data.user.avatar_url || null,
      token: data.token,
    }
  };
};