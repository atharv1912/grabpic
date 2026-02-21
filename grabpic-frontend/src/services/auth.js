// this will later be your real backend URL
const BASE_URL = 'http://localhost:8000'

export const loginUser = async (email, password) => {
  // mock response — replace this whole block with fetch() later
  return {
    success: true,
    user: {
      id: '1',
      name: 'Test User',
      email: email
    },
    token: 'mock-token-123'
  }
}

export const registerUser = async (name, email, password) => {
  // mock response
  return {
    success: true,
    user: {
      id: '2',
      name: name,
      email: email
    },
    token: 'mock-token-456'
  }
}