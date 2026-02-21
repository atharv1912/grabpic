import { Routes, Route } from 'react-router-dom'
import Auth from '../pages/Auth/Auth'
import Dashboard from '../pages/Dashboard/Dashboard'
import Group from '../pages/Group/Group'
import Profile from '../pages/Profile/Profile'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/group/:id" element={
        <ProtectedRoute>
          <Group />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AppRoutes