import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()

  return (
    <>
      {user && <Navbar />}
      <AppRoutes />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App