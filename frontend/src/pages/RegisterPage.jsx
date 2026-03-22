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
  const [error, setError] = useState('')
  const [form, setForm] = useState({
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
    if (form.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await authService.register({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        industry: form.industry,
        companySize: form.companySize,
      })
      navigate('/login')
    } catch (error) {
      if (error.response?.status === 404) {
        setError('El registro automático estará disponible próximamente. Contacta al administrador para crear tu cuenta.')
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
            <h1 className="text-2xl font-bold text-text-primary mb-1">{t('register.title')}</h1>
            <p className="text-xs text-text-secondary">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                {t('register.companyName')}
              </label>
              <div className="relative group">
                <input name="companyName" type="text" required value={form.companyName} onChange={handleChange}
                  className="input-field pl-10 pr-4" placeholder="Acme Security Corp" disabled={isLoading} />
                <Icon name="building" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                {t('register.adminEmail')}
              </label>
              <div className="relative group">
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input-field pl-10 pr-4" placeholder="admin@empresa.com" disabled={isLoading} />
                <Icon name="at-sign" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  {t('register.password')}
                </label>
                <div className="relative group">
                  <input name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                    className="input-field pl-10 pr-4 text-xs" placeholder="Min. 8 chars" disabled={isLoading} />
                  <Icon name="lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  {t('register.confirmPassword')}
                </label>
                <div className="relative group">
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange}
                    className="input-field pl-10 pr-4 text-xs" placeholder="Confirmar" disabled={isLoading} />
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

            {/* Industry & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  {t('register.industry')}
                </label>
                <select name="industry" value={form.industry} onChange={handleChange} className="input-field py-2.5 px-3 text-xs" required disabled={isLoading}>
                  <option value="">Seleccionar...</option>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-[0.15em]">
                  {t('register.companySize')}
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
              className={`btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading ? (
                <>
                  <motion.div className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <Icon name="rocket" size={16} />
                  <span>{t('register.submit')}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-text-muted">
              {t('register.hasAccount')}{' '}
              <Link to="/login" className="text-accent-cyan hover:underline">{t('register.loginLink')}</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
