import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import metricsService from '../services/metricsService'
import Toast from './Toast'
import { useToast } from '../hooks/useToast'
import Icon from './icons/Icon'
import logo from '../assets/logo.svg'

const notifColors = {
  critical: { dot: 'bg-status-critical', text: 'text-status-critical' },
  warning:  { dot: 'bg-status-warning',  text: 'text-status-warning' },
  success:  { dot: 'bg-status-healthy',  text: 'text-status-healthy' },
  info:     { dot: 'bg-accent-blue',     text: 'text-accent-blue' },
}

const ROLE_ACCESS = {
  admin:    ['/dashboard', '/resources', '/kpis', '/audit', '/security', '/settings', '/users', '/setup'],
  operator: ['/dashboard', '/resources', '/kpis', '/security', '/setup'],
  viewer:   ['/dashboard', '/resources', '/kpis', '/audit'],
}

const SidebarSystemStatus = ({ sidebarOpen, t }) => {
  const { data: kpis } = useQuery({
    queryKey: ['sidebar-kpis'],
    queryFn: () => metricsService.getKpis().then(r => r.data || {}),
    refetchInterval: 15000,
    retry: 1,
  })

  if (!sidebarOpen) return null

  const totalServers = kpis?.totalServers || 0
  const availability = kpis?.availability || 0

  return (
    <div className="px-3 pb-2">
      <div className="glass-card p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${totalServers > 0 ? 'bg-status-healthy' : 'bg-text-muted'}`}
            style={totalServers > 0 ? { boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' } : {}}
            animate={totalServers > 0 ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className={`text-[10px] font-medium ${totalServers > 0 ? 'text-status-healthy' : 'text-text-muted'}`}>
            {totalServers > 0 ? t('dashboard.systemOperational') : 'Sin servidores'}
          </span>
        </div>
        <div className="flex justify-between text-[9px] text-text-muted">
          <span>Uptime {availability}%</span>
          <span>{totalServers} nodos</span>
        </div>
      </div>
    </div>
  )
}

const Layout = ({ children }) => {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifExpanded, setNotifExpanded] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toasts, removeToast } = useToast()
  const { notifications, markAllRead, markAsRead } = useNotificationStore()

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
      setDateStr(now.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const allMenuItems = useMemo(() => [
    { path: '/dashboard', label: t('nav.dashboard'), icon: 'layout-dashboard', desc: t('nav.dashboardDesc') },
    { path: '/resources', label: t('nav.resources'), icon: 'server', desc: t('nav.resourcesDesc') },
    { path: '/kpis', label: t('nav.kpis'), icon: 'bar-chart', desc: t('nav.kpisDesc') },
    { path: '/audit', label: t('nav.audit'), icon: 'file-search', desc: t('nav.auditDesc') },
    { path: '/security', label: t('nav.security'), icon: 'shield', desc: t('nav.securityDesc') },
    { path: '/setup', label: 'Agregar Servidor', icon: 'terminal', desc: 'Instalar agente en un nuevo servidor' },
    { path: '/settings', label: t('nav.settings'), icon: 'settings', desc: t('nav.settingsDesc') },
    { path: '/users', label: t('nav.users'), icon: 'users', desc: t('nav.usersDesc') },
  ], [t])

  const menuItems = useMemo(() => {
    const role = user?.role || 'viewer'
    const allowed = ROLE_ACCESS[role] || ROLE_ACCESS.viewer
    return allMenuItems.filter(item => allowed.includes(item.path))
  }, [allMenuItems, user?.role])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const currentPage = allMenuItems.find(item => item.path === location.pathname)

  const NotificationList = ({ maxHeight = 'max-h-80' }) => (
    <div className={`${maxHeight} overflow-y-auto`}>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-text-muted">
          <Icon name="bell-off" size={28} className="mb-2 opacity-30" />
          <p className="text-xs">{t('notifications.empty')}</p>
        </div>
      ) : (
        notifications.map((n, i) => {
          const c = notifColors[n.type] || notifColors.info
          return (
            <motion.div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors ${!n.read ? 'bg-white/[0.015]' : ''}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => markAsRead(n.id)}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot} ${!n.read ? '' : 'opacity-30'}`}
                style={!n.read ? { boxShadow: '0 0 6px currentColor' } : {}}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium leading-tight ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {n.title}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-[9px] text-text-muted mt-1 font-mono">hace {n.time}</p>
              </div>
              {!n.read && (
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${c.dot}`} />
              )}
            </motion.div>
          )
        })
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--color-surface-base)' }}>
      <div className="absolute inset-0 hex-grid-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      {/* ========== SIDEBAR ========== */}
      <motion.aside
        animate={{ width: sidebarOpen ? '16rem' : '4.5rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full relative z-20 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-surface-1) 0%, rgba(12, 14, 20, 0.95) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.04] flex-shrink-0">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                className="flex items-center gap-2.5 overflow-hidden"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-text-primary whitespace-nowrap leading-none">
                    Hawk<span className="text-gradient-cyan">Scope</span>
                  </span>
                  <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] leading-none mt-0.5">
                    {t('common.socPlatform')}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all flex-shrink-0"
          >
            <Icon name={sidebarOpen ? 'chevron-left' : 'menu'} size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] px-3 mb-2 font-medium">
              {t('nav.navigation')}
            </p>
          )}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? 'text-accent-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(0, 240, 255, 0.02))',
                      border: '1px solid rgba(0, 240, 255, 0.1)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Active bar — full height */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-bar"
                    className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-accent-cyan"
                    style={{ boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon
                  name={item.icon}
                  size={18}
                  className={`relative z-10 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-accent-cyan' : 'group-hover:scale-110'
                  }`}
                />

                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      className="flex flex-col relative z-10 min-w-0"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                      {isActive && (
                        <span className="text-[9px] text-text-muted whitespace-nowrap">{item.desc}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* System Status Mini — real data from API */}
        <SidebarSystemStatus sidebarOpen={sidebarOpen} t={t} />

        {/* User section */}
        <div className="px-2.5 py-3 border-t border-white/[0.04] flex-shrink-0">
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/15 flex items-center justify-center text-accent-cyan text-xs font-bold flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {user?.email || 'Usuario'}
                    </p>
                    <p className="text-[9px] text-accent-cyan/70 uppercase tracking-[0.15em] font-medium">
                      {user?.role || 'guest'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-status-critical hover:bg-status-critical/10 transition-all flex-shrink-0"
                  title={t('auth.logout')}
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
                  className="p-2 rounded-lg text-text-secondary hover:text-status-critical hover:bg-status-critical/10 transition-all"
                  title={t('auth.logout')}
                >
                  <Icon name="log-out" size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header
          className="h-14 px-6 flex items-center justify-between flex-shrink-0 relative z-10"
          style={{
            background: 'rgba(9, 9, 11, 0.8)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center">
                <Icon name={currentPage?.icon || 'layout-dashboard'} size={14} className="text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary leading-none">
                  {currentPage?.label || 'Dashboard'}
                </h2>
                <p className="text-[9px] text-text-muted mt-0.5 leading-none">{currentPage?.desc || ''}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder={t('common.search')}
                className="input-field w-48 pl-8 py-1.5 text-xs rounded-lg"
              />
              <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>

            {/* System uptime */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-healthy/5 border border-status-healthy/10">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-status-healthy"
                style={{ boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-[10px] text-status-healthy font-medium tracking-wide">{t('common.live')}</span>
            </div>

            {/* DateTime */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[11px] text-text-primary font-mono tracking-wider leading-none">
                {clock}
              </span>
              <span className="text-[9px] text-text-muted leading-none mt-0.5 capitalize">
                {dateStr}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(prev => !prev); setNotifExpanded(false) }}
                className={`relative p-2 rounded-lg transition-all ${notifOpen ? 'text-text-primary bg-white/[0.06]' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'}`}
              >
                <Icon name="bell" size={16} />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-status-critical rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none px-0.5"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && !notifExpanded && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl overflow-hidden"
                      style={{
                        background: 'rgb(15, 17, 23)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      }}
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <Icon name="bell" size={14} className="text-accent-cyan" />
                          <span className="text-sm font-semibold text-text-primary">{t('notifications.title')}</span>
                          {unreadCount > 0 && (
                            <span className="text-[9px] font-mono bg-status-critical/15 text-status-critical border border-status-critical/20 px-1.5 py-0.5 rounded-full">
                              {unreadCount} {t('notifications.new')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors">
                              {t('notifications.markAll')}
                            </button>
                          )}
                          <button
                            onClick={() => setNotifExpanded(true)}
                            className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors"
                            title={t('notifications.expand')}
                          >
                            <Icon name="maximize-2" size={12} />
                          </button>
                        </div>
                      </div>

                      {NotificationList({})}

                      {/* Footer */}
                      <div className="px-4 py-2.5 border-t border-white/[0.06]">
                        <button
                          onClick={() => { setNotifOpen(false); navigate('/audit') }}
                          className="text-[10px] text-text-muted hover:text-text-primary transition-colors w-full text-center"
                        >
                          {t('notifications.viewHistory')}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
              <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider hidden sm:block">
                {user?.role}
              </span>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-surface-3 to-surface-4 border border-white/[0.06] flex items-center justify-center">
                <Icon name="user" size={13} className="text-text-secondary" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
                opacity: 1, x: 0, scale: 1,
                transition: { type: 'spring', stiffness: 300, damping: 22, delay: idx * 0.05 },
              }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.15 } }}
            >
              <Toast message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} duration={toast.duration} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========== NOTIFICATION EXPANDED MODAL ========== */}
      <AnimatePresence>
        {notifExpanded && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setNotifExpanded(false); setNotifOpen(false) }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-lg rounded-xl overflow-hidden"
                style={{
                  background: 'rgb(15, 17, 23)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Icon name="bell" size={16} className="text-accent-cyan" />
                    <span className="text-base font-semibold text-text-primary">{t('notifications.title')}</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono bg-status-critical/15 text-status-critical border border-status-critical/20 px-2 py-0.5 rounded-full">
                        {unreadCount} {t('notifications.new')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-text-muted hover:text-accent-cyan transition-colors">
                        {t('notifications.markAll')}
                      </button>
                    )}
                    <button
                      onClick={() => { setNotifExpanded(false); setNotifOpen(false) }}
                      className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                </div>

                {NotificationList({ maxHeight: "max-h-[60vh]" })}

                <div className="px-5 py-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => { setNotifExpanded(false); setNotifOpen(false); navigate('/audit') }}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors w-full text-center"
                  >
                    {t('notifications.viewHistory')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== LOGOUT MODAL ========== */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-card w-full max-w-sm p-6 glow-red"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-status-critical/10 border border-status-critical/20 flex items-center justify-center">
                    <Icon name="log-out" size={22} className="text-status-critical" />
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold text-text-primary mb-1.5">{t('auth.logoutTitle')}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {t('auth.logoutMessage')}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-text-muted">
                    <Icon name="user" size={10} />
                    <span className="font-mono">{user?.email}</span>
                    <span className="text-accent-cyan uppercase font-medium">{user?.role}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowLogoutModal(false)} className="btn-secondary flex-1 text-sm py-2.5">
                    {t('common.cancel')}
                  </button>
                  <motion.button
                    onClick={handleLogoutConfirm}
                    className="btn-danger flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="log-out" size={14} />
                    {t('auth.logout')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Layout
