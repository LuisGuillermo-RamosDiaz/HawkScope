import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import { useToast } from '../hooks/useToast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const { showError, showSuccess } = useToast()

  // Obtener la ruta a la que se quería acceder antes del login
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Intentar llamada real a la API primero
      let response
      try {
        response = await authService.login(formData)
      } catch (apiError) {
        // Si la API no está disponible, usar mock
        console.warn('API no disponible, usando mock:', apiError.message)
        response = await mockLogin(formData)
      }
      
      // Guardar en el store
      login({
        email: response.user.email,
        role: response.user.role,
        token: response.token
      })

      showSuccess('¡Inicio de sesión exitoso!')
      
      // Redirigir a la página solicitada
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
      
    } catch (err) {
      console.error('Login error:', err)
      
      // Manejo específico de errores HTTP
      if (err.response) {
        const status = err.response.status
        
        switch (status) {
          case 401:
            showError('Credenciales inválidas. Por favor, verifica tu email y contraseña.')
            break
          case 403:
            showError('Cuenta bloqueada. Contacta al administrador del sistema.')
            break
          case 429:
            showError('Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.')
            break
          case 500:
            showError('Error del servidor. Por favor, intenta más tarde.')
            break
          default:
            showError('Error al iniciar sesión. Por favor, intenta nuevamente.')
        }
      } else if (err.request) {
        // Error de red o API no disponible
        showError('Error de conexión. Verifica tu conexión a internet o que el servidor esté corriendo.')
      } else {
        // Error inesperado
        showError('Error inesperado. Por favor, intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Mock de API de login (para desarrollo)
  const mockLogin = async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular validación
        if (credentials.email === 'admin@devsecops.com' && credentials.password === 'nuevacontraseña') {
          // Crear un payload JWT válido
          const payload = {
            email: 'admin@devsecops.com',
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
          }
          
          // Crear token mock con formato JWT (header.payload.signature)
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
          const payloadStr = btoa(JSON.stringify(payload))
          const signature = 'mock-signature'
          
          resolve({
            user: {
              email: 'admin@devsecops.com',
              role: 'admin'
            },
            token: `${header}.${payloadStr}.${signature}`
          })
        } else {
          reject(new Error('Credenciales inválidas'))
        }
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-accent-cyan mb-2">DevSecOps</h1>
          <h2 className="text-2xl font-semibold text-primary">Portal de Seguridad</h2>
          <p className="text-text-secondary mt-2">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-alert-red bg-opacity-10 border border-alert-red text-alert-red p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="admin@devsecops.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="•••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full flex justify-center ${
                isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-opacity-90'
              } transition-all duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            ¿Problemas para acceder? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
