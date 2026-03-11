import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

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

  // Obtener la ruta a la que se quería acceder antes del login
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulación de login API (reemplazar con llamada real)
      const mockResponse = await mockLogin(formData)
      
      // Guardar en el store
      login({
        email: mockResponse.user.email,
        role: mockResponse.user.role,
        token: mockResponse.token
      })

      console.log('Login successful, navigating to:', from)
      console.log('Store state after login:', { email: mockResponse.user.email, role: mockResponse.user.role })

      // Redirigir a la página solicitada
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 100)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
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
          <h2 className="text-2xl font-semibold text-primary">Iniciar Sesión</h2>
          <p className="text-text-secondary mt-2">
            Ingresa tus credenciales para acceder al dashboard
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
                Email
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
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Demo: admin@devsecops.com / nuevacontraseña
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
