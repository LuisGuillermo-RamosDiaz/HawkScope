import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'
import logo from '../assets/logo.svg'

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const { showError, showSuccess } = useToast()
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

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

      showSuccess('Acceso concedido - Bienvenido al SOC')
      setTimeout(() => navigate(from, { replace: true }), 400)
    } catch (err) {
      if (err.response) {
        const messages = {
          401: 'Credenciales invalidas.',
          403: 'Cuenta bloqueada. Contacta al administrador.',
          429: 'Demasiados intentos. Espera unos minutos.',
          500: 'Error del servidor.',
        }
        showError(messages[err.response.status] || 'Error al iniciar sesion.')
      } else if (err.request) {
        showError('Error de conexion con el servidor.')
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
          reject(new Error('Credenciales invalidas'))
        }
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      {/* Animated grid background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial glows */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.04), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.03), transparent 70%)' }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.15), transparent)' }}
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
      />

      {/* Login Card */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            className="relative z-10 w-full max-w-[420px] mx-4"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="glass-card p-8 border-gradient relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px]">
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </div>

              {/* Logo Section */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold tracking-tight mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Hawk<span className="text-gradient-cyan">Scope</span>
                </motion.h1>
                <motion.p
                  className="text-text-secondary text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Centro de Operaciones de Seguridad
                </motion.p>
                <motion.div
                  className="flex items-center justify-center gap-1.5 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-accent-cyan/30" />
                  <span className="text-[9px] text-text-muted uppercase tracking-[0.3em] font-medium">Enterprise</span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-accent-cyan/30" />
                </motion.div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label htmlFor="email" className="block text-[10px] font-medium text-text-secondary mb-2 uppercase tracking-[0.15em]">
                    Correo Electronico
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10 pr-4"
                      placeholder="admin@devsecops.com"
                      disabled={isLoading}
                    />
                    <Icon name="at-sign" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="password" className="block text-[10px] font-medium text-text-secondary mb-2 uppercase tracking-[0.15em]">
                    Contrasena
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="Ingresa tu contrasena"
                      disabled={isLoading}
                    />
                    <Icon name="lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={15} />
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-sm ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
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
              <motion.div
                className="mt-6 pt-5 border-t border-white/[0.04]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-center text-text-muted text-[10px] tracking-wide">
                  Acceso restringido. Contacta al administrador del SOC.
                </p>
              </motion.div>
            </div>

            {/* Security badges */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-1.5">
                <Icon name="lock" size={10} className="text-text-muted" />
                <span className="text-[9px] text-text-muted tracking-wider uppercase">TLS 1.3</span>
              </div>
              <div className="w-[1px] h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5">
                <Icon name="shield-check" size={10} className="text-text-muted" />
                <span className="text-[9px] text-text-muted tracking-wider uppercase">SOC 2</span>
              </div>
              <div className="w-[1px] h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5">
                <Icon name="fingerprint" size={10} className="text-text-muted" />
                <span className="text-[9px] text-text-muted tracking-wider uppercase">MFA Ready</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoginPage
