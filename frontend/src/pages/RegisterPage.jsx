import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import Icon from '../components/icons/Icon'
import logo from '../assets/logo.svg'

const industries = [
  'Tecnologia', 'Finanzas', 'Salud', 'Retail', 'Educacion', 'Gobierno', 'Manufactura', 'Otro'
]

const companySizes = [
  '1-10', '11-50', '51-200', '201-1000', '1000+'
]

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    companySize: '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      setError('La contrasena no cumple con todos los requisitos de seguridad')
      return
    }

    setIsLoading(true)
    try {
      const result = await authService.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        industry: form.industry,
        companySize: form.companySize,
      })
      // Auto-login: store token + user, redirect to setup
      login({
        token: result.token,
        email: result.user.email,
        role: result.user.role,
        apiKey: result.user.apiKey,
        name: result.user.name
      })
      navigate('/setup')
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Este email ya está registrado. Intenta iniciar sesión.')
      } else {
        setError(error.response?.data?.message || 'Error al registrar. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      <div className="absolute inset-0 hex-grid-bg opacity-30 pointer-events-none" />
      <motion.div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[480px] mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="glass-card p-8 border-gradient relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px]">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-accent-purple to-transparent"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Registrar Organización</h1>
            <p className="text-xs text-text-secondary">Crea tu cuenta de HawkScope Enterprise</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                Nombre Completo
              </label>
              <div className="relative group">
                <input name="fullName" type="text" required value={form.fullName} onChange={handleChange}
                  className="input-field pl-10 pr-4" placeholder="Ingresa tu nombre completo" disabled={isLoading} autoComplete="off" />
                <Icon name="user" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                Nombre de la Empresa
              </label>
              <div className="relative group">
                <input name="companyName" type="text" required value={form.companyName} onChange={handleChange}
                  className="input-field pl-10 pr-4" placeholder="Ej. CyberTech Security" disabled={isLoading} autoComplete="off" />
                <Icon name="building" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                Correo Electrónico Laboral
              </label>
              <div className="relative group">
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input-field pl-10 pr-4" placeholder="correo@ejemplo.com" disabled={isLoading} autoComplete="off" />
                <Icon name="at-sign" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  Contraseña
                </label>
                <div className="relative group">
                  <input name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                    onFocus={() => setPasswordFocused(true)}
                    className="input-field pl-10 pr-4 text-xs" placeholder="Contraseña segura" disabled={isLoading} autoComplete="new-password" />
                  <Icon name="lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  Confirmar
                </label>
                <div className="relative group">
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange}
                    className="input-field pl-10 pr-4 text-xs" placeholder="Repetir contraseña" disabled={isLoading} autoComplete="new-password" />
                  <Icon name="lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={12} />
                {showPassword ? 'Ocultar' : 'Mostrar'} contrasena
              </button>
            </div>

            {/* Password Validations */}
            <div className="grid grid-cols-1 gap-1.5 mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1 font-bold">Requisitos de contraseña</p>

              {/* 8 characters */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${form.password.length >= 8
                    ? 'bg-status-healthy shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : (passwordFocused || form.password.length > 0)
                      ? 'bg-status-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'bg-text-muted/30'
                  }`} />
                <span className={`text-[10px] transition-colors duration-300 ${form.password.length >= 8
                    ? 'text-status-healthy'
                    : (passwordFocused || form.password.length > 0)
                      ? 'text-status-critical opacity-90'
                      : 'text-text-muted'
                  }`}>Mínimo 8 caracteres</span>
              </div>

              {/* Uppercase */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${/[A-Z]/.test(form.password)
                    ? 'bg-status-healthy shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : (passwordFocused || form.password.length > 0)
                      ? 'bg-status-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'bg-text-muted/30'
                  }`} />
                <span className={`text-[10px] transition-colors duration-300 ${/[A-Z]/.test(form.password)
                    ? 'text-status-healthy'
                    : (passwordFocused || form.password.length > 0)
                      ? 'text-status-critical opacity-90'
                      : 'text-text-muted'
                  }`}>Al menos una mayúscula</span>
              </div>

              {/* Special character */}
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${/[^A-Za-z0-9]/.test(form.password)
                    ? 'bg-status-healthy shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : (passwordFocused || form.password.length > 0)
                      ? 'bg-status-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'bg-text-muted/30'
                  }`} />
                <span className={`text-[10px] transition-colors duration-300 ${/[^A-Za-z0-9]/.test(form.password)
                    ? 'text-status-healthy'
                    : (passwordFocused || form.password.length > 0)
                      ? 'text-status-critical opacity-90'
                      : 'text-text-muted'
                  }`}>Al menos un carácter especial</span>
              </div>
            </div>

            {/* Industry & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  Sector de la Industria
                </label>
                <select name="industry" value={form.industry} onChange={handleChange} className="input-field py-2.5 px-3 text-xs" required disabled={isLoading}>
                  <option value="">Seleccionar...</option>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  Tamaño de Empresa
                </label>
                <select name="companySize" value={form.companySize} onChange={handleChange} className="input-field py-2.5 px-3 text-xs" required disabled={isLoading}>
                  <option value="">Seleccionar...</option>
                  {companySizes.map(size => <option key={size} value={size}>{size} empleados</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-status-critical/10 border border-status-critical/20 text-xs text-status-critical flex items-center gap-2">
                <Icon name="alert-triangle" size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className={`btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-sm flex-col mt-4 sm:flex-row ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading ? (
                <>
                  <motion.div className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                  <span>Creando cuenta en plataforma...</span>
                </>
              ) : (
                <>
                  <Icon name="rocket" size={16} />
                  <span>Empezar Configuración Inicial</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-text-secondary">
              ¿Ya tienes una cuenta en HawkScope?{' '}
              <Link to="/login" className="text-accent-cyan hover:underline font-medium">Inicia Sesión aquí</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
