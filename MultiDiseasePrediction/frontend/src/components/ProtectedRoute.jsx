import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {Outlet} from 'react-router-dom'

export default function ProtectedRoute() {
  const { isAuth, loading } = useAuth()

  if (loading) return null

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}

