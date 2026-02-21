
const BASE_URL = 'http://localhost:8000'

export const getUserGroups = async () => {
  return [
    { id: '1', name: 'Trip to Goa', memberCount: 5, photoCount: 23 },
    { id: '2', name: 'College Reunion', memberCount: 12, photoCount: 47 },
    { id: '3', name: 'Office Party', memberCount: 8, photoCount: 15 },
  ]
}

export const getGroupById = async (groupId) => {
  return {
    id: groupId,
    name: 'Trip to Goa',
    members: ['Ayesha', 'Rahul', 'You', 'Sneha', 'Dev'],
  }
}

export const createGroup = async (name) => {
  return {
    success: true,
    group: { id: '4', name: name, memberCount: 1, photoCount: 0 }
  }
}

export const joinGroup = async (groupCode) => {
  return {
    success: true,
    group: { id: '5', name: 'New Group', memberCount: 4, photoCount: 8 }
  }
}