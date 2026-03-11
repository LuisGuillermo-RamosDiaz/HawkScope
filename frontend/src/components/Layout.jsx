import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Toast from './Toast'
import { useToast } from '../hooks/useToast'
import Icon from './icons/Icon'
import { LoadingAnimation, fadeInVariants } from './animations/StaggerContainer'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toasts, removeToast } = useToast()

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

  const sidebarVariants = {
    open: {
      width: '16rem',
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    },
    closed: {
      width: '5rem',
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    }
  }

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  }

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar con animación */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        className="bg-secondary border-r border-gray-700 flex flex-col h-full relative"
      >
        {/* Logo/Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.h1
                className="font-bold text-xl text-accent-cyan"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                DevSecOps
              </motion.h1>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-tertiary transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon 
              name={sidebarOpen ? 'chevron-left' : 'menu'} 
              size={20}
              animated={false}
            />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              variants={menuItemVariants}
              initial="initial"
              animate={sidebarOpen ? "open" : "closed"}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-accent-cyan text-white shadow-lg'
                    : 'text-text-secondary hover:text-primary hover:bg-tertiary'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon 
                    name={item.icon} 
                    size={20}
                    className={location.pathname === item.path ? 'text-white' : ''}
                  />
                </motion.div>
                
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <AnimatePresence>
            {sidebarOpen ? (
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-accent-cyan rounded-full flex items-center justify-center text-white font-bold"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-primary truncate max-w-[120px]">
                      {user?.email || 'Usuario'}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">
                      {user?.role || 'guest'}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-alert-red transition-colors p-1"
                  title="Cerrar sesión"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon name="log-out" size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-alert-red transition-colors p-2"
                  title="Cerrar sesión"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon name="log-out" size={20} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <motion.header 
          className="bg-secondary border-b border-gray-700 px-6 py-4"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h2
                className="text-xl font-semibold text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </motion.h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <motion.input
                  type="text"
                  placeholder="Buscar..."
                  className="input-field w-64 pl-10"
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(54, 191, 177, 0.3)" }}
                  transition={{ type: "spring", stiffness: 400 }}
                />
                <Icon 
                  name="search" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
              </div>
              
              {/* Notifications */}
              <motion.button
                className="relative p-2 text-text-secondary hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name="bell" size={20} />
                <motion.span
                  className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <motion.span
                  className="text-sm text-text-secondary font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {user?.role?.toUpperCase()}
                </motion.span>
                <motion.button
                  className="p-2 text-text-secondary hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon name="user" size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1
                }
              }}
              exit={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.8,
                transition: { duration: 0.2 }
              }}
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
