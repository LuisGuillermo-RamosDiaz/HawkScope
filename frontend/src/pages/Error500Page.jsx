import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Icon from '../components/icons/Icon'

const Error500Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-surface-base)' }}>
      <div className="max-w-md w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8 relative"
        >
          {/* Animated Background Blob */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-48 h-48 bg-red-500/10 rounded-full blur-2xl"
            />
          </div>

          <motion.div
            animate={{ x: [-5, 5, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", repeatDelay: 2 }}
            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2"
          >
            500
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-text-primary mb-4"
        >
          ¡Oops! El servidor tropezó.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary text-sm mb-8"
        >
          Nuestros monos ingenieros ya fueron notificados y estan trabajando arduamente para arreglarlo. 
          Intentaremos reiniciar la maquina. ¡Por favor intentalo de nuevo mas tarde!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center bg-red-600 hover:bg-red-700 border-none"
          >
            <Icon name="refresh-cw" size={16} />
            Reintentar Conexion
          </button>
          
          <Link 
            to="/dashboard" 
            className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Icon name="home" size={16} />
            Inicio Seguro
          </Link>
        </motion.div>
      </div>

      <div className="absolute inset-0 hex-grid-bg opacity-10 pointer-events-none" />
    </div>
  )
}

export default Error500Page
