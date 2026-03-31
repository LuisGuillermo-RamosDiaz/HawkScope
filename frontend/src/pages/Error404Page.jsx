import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Icon from '../components/icons/Icon'

const Error404Page = () => {
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
                rotate: [0, 90, 0]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="w-48 h-48 bg-accent-cyan/10 rounded-full blur-2xl"
            />
          </div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-indigo-500 mb-2"
          >
            404
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-text-primary mb-4"
        >
          ¡Houston, tenemos un problema!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary text-sm mb-8"
        >
          Parece que la pagina que estas buscando se ha perdido en el ciberespacio. 
          Quizas el recurso no existe, o simplemente un servidor se comio nuestro cable de red.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Icon name="arrow-left" size={16} />
            Regresar al Pasado
          </button>
          
          <Link 
            to="/dashboard" 
            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Icon name="home" size={16} />
            Volver a la Base
          </Link>
        </motion.div>
      </div>

      <div className="absolute inset-0 hex-grid-bg opacity-20 pointer-events-none" />
    </div>
  )
}

export default Error404Page
