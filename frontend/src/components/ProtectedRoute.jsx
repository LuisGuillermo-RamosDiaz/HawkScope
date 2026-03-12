import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()
  const { isAuthenticated, isTokenExpired, user } = useAuthStore()

  const isUserAuthenticated = isAuthenticated && !isTokenExpired()

  if (!isUserAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
