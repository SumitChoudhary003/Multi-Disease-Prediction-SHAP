import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Dashboard  from './pages/Dashboard'
import Diabetes   from './pages/Diabetes'
import Heart      from './pages/Heart'
import Kidney     from './pages/Kidney'
import Combined   from './pages/Combined'
import History    from './pages/History'
import ProtectedRoute from './components/ProtectedRoute'


function GuestRoute({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return null
  return !isAuth ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        <Route element={<ProtectedRoute/>}>
          <Route element={<Layout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict/diabetes" element={<Diabetes />} />
          <Route path="/predict/heart"    element={<Heart />} />
          <Route path="/predict/kidney"   element={<Kidney />} />
          <Route path="/predict/combined" element={<Combined />} />
          <Route path="/history"          element={<History />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
