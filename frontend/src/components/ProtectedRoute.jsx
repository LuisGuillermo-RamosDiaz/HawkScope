import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isTokenExpired } = useAuthStore()

  // Verificar si está autenticado y el token no ha expirado
  const isUserAuthenticated = isAuthenticated && !isTokenExpired()

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
  console.log('ProtectedRoute - isTokenExpired:', isTokenExpired())
  console.log('ProtectedRoute - isUserAuthenticated:', isUserAuthenticated)

  if (!isUserAuthenticated) {
    // Redirigir a login pero guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
