import { Routes, Route } from 'react-router-dom'
import Auth from '../pages/Auth/Auth'
import Dashboard from '../pages/Dashboard/Dashboard'
import Group from '../pages/Group/Group'
import Profile from '../pages/Profile/Profile'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/group/:id" element={<Group />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default AppRoutes