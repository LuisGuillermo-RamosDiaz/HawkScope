import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Toast from './Toast'
import { useToast } from '../hooks/useToast'
import Icon from './icons/Icon'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clock, setClock] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toasts, removeToast } = useToast()

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { path: '/resources', label: 'Recursos', icon: 'server' },
    { path: '/kpis', label: 'KPIs', icon: 'bar-chart' },
    { path: '/audit', label: 'Auditoría', icon: 'file-search' },
    { path: '/security', label: 'Seguridad', icon: 'shield' },
    { path: '/settings', label: 'Configuración', icon: 'settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentPage = menuItems.find(item => item.path === location.pathname)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      {/* ========== SIDEBAR ========== */}
      <motion.aside
        animate={{ width: sidebarOpen ? '15rem' : '4.5rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full border-r border-border-subtle relative z-20"
        style={{ background: 'var(--color-surface-1)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-subtle flex-shrink-0">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                className="flex items-center gap-2.5 overflow-hidden"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-xl">🦅</span>
                <span className="font-bold text-base tracking-tight text-text-primary whitespace-nowrap">
                  Hawk<span className="text-accent-cyan">Scope</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors flex-shrink-0"
          >
            <Icon name={sidebarOpen ? 'chevron-left' : 'menu'} size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? 'text-accent-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'rgba(0, 240, 255, 0.06)',
                      border: '1px solid rgba(0, 240, 255, 0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon
                  name={item.icon}
                  size={18}
                  className={`relative z-10 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`}
                />

                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      className="text-sm font-medium whitespace-nowrap relative z-10"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-2.5 py-3 border-t border-border-subtle flex-shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded"
                className="flex items-center justify-between gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-bold flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {user?.email || 'Usuario'}
                    </p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">
                      {user?.role || 'guest'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-text-secondary hover:text-status-critical hover:bg-status-critical/10 transition-colors flex-shrink-0"
                  title="Cerrar sesión"
                >
                  <Icon name="log-out" size={15} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-text-secondary hover:text-status-critical hover:bg-status-critical/10 transition-colors"
                  title="Cerrar sesión"
                >
                  <Icon name="log-out" size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-16 px-6 flex items-center justify-between border-b border-border-subtle flex-shrink-0"
          style={{ background: 'var(--color-surface-1)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-text-primary">
              {currentPage?.label || 'Dashboard'}
            </h2>
            <span className="text-text-muted text-xs">|</span>
            <span className="text-text-secondary text-xs">HawkScope SOC</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Buscar..."
                className="input-field w-52 pl-9 py-2 text-xs"
              />
              <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>

            {/* System status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-healthy/5 border border-status-healthy/15">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-status-healthy"
                style={{ boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-[11px] text-status-healthy font-medium">Operativo</span>
            </div>

            {/* Clock */}
            <span className="text-xs text-text-secondary font-mono tracking-wider hidden lg:block">
              {clock}
            </span>

            {/* Notifications */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded-lg transition-colors">
              <Icon name="bell" size={17} />
              <motion.span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-critical rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </button>

            {/* User role badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                {user?.role}
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-3 border border-border-subtle flex items-center justify-center">
                <Icon name="user" size={14} className="text-text-secondary" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ========== TOASTS ========== */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast, idx) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 300, damping: 22, delay: idx * 0.05 },
              }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.15 } }}
            >
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
                duration={toast.duration}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Layout
