import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const { showError, showSuccess } = useToast()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let response
      try {
        response = await authService.login(formData)
      } catch (_apiError) {
        console.warn('API no disponible, usando mock')
        response = await mockLogin(formData)
      }

      login({
        email: response.user.email,
        role: response.user.role,
        token: response.token,
      })

      showSuccess('¡Acceso concedido!')
      setTimeout(() => navigate(from, { replace: true }), 400)
    } catch (err) {
      if (err.response) {
        const messages = {
          401: 'Credenciales inválidas.',
          403: 'Cuenta bloqueada. Contacta al administrador.',
          429: 'Demasiados intentos. Espera unos minutos.',
          500: 'Error del servidor.',
        }
        showError(messages[err.response.status] || 'Error al iniciar sesión.')
      } else if (err.request) {
        showError('Error de conexión con el servidor.')
      } else {
        showError('Error inesperado.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const mockLogin = async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@devsecops.com' && credentials.password === 'nuevacontraseña') {
          const payload = {
            email: 'admin@devsecops.com',
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + 3600,
          }
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
          const payloadStr = btoa(JSON.stringify(payload))
          resolve({
            user: { email: 'admin@devsecops.com', role: 'admin' },
            token: `${header}.${payloadStr}.mock-signature`,
          })
        } else {
          reject(new Error('Credenciales inválidas'))
        }
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08), transparent 70%)' }}
      />

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="glass-card p-8 glow-cyan">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-4xl">🦅</span>
              <h1 className="text-3xl font-bold tracking-tight">
                Hawk<span className="text-accent-cyan">Scope</span>
              </h1>
            </motion.div>
            <motion.p
              className="text-text-secondary text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Centro de Operaciones de Seguridad
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="admin@devsecops.com"
                  disabled={isLoading}
                />
                <Icon name="user" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <Icon name="lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                    <span>Verificando acceso...</span>
                  </>
                ) : (
                  <>
                    <Icon name="shield-check" size={16} />
                    <span>Acceder al Sistema</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            className="text-center text-text-muted text-xs mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Acceso restringido. Contacta al administrador del SOC.
          </motion.p>
        </div>

        {/* Security badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Icon name="lock" size={12} className="text-text-muted" />
          <span className="text-[10px] text-text-muted tracking-wider uppercase">Conexión cifrada TLS 1.3</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
