import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './icons/Icon'
import usersService from '../services/usersService'
import useAuthStore from '../store/authStore'
import { useToast } from '../hooks/useToast'

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const ProfilePictureModal = ({ isOpen, onClose, targetUserId, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMode, setSuccessMode] = useState(false)
  
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const { showSuccess } = useToast()
  
  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setPreviewUrl(null)
      setIsUploading(false)
      setError('')
      setSuccessMode(false)
      setIsDragging(false)
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isOpen])
  
  const handleClose = () => {
    if (isUploading && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setFile(null)
    setPreviewUrl(null)
    setError('')
    setSuccessMode(false)
    setIsDragging(false)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const validateAndSetFile = (selectedFile) => {
    if (isUploading || successMode) return
    setError('')
    
    if (!selectedFile) return
    
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Formato no válido. Usa JPG, PNG, GIF o WebP.')
      return
    }
    
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`El archivo es muy pesado. El máximo permitido es ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    
    setFile(selectedFile)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isUploading && !successMode) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading || successMode) return
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (isUploading || successMode) return
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!file || !targetUserId || isUploading) return
    
    setIsUploading(true)
    setError('')
    
    abortControllerRef.current = new AbortController()
    const abortTimeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }, 8000) // 8s hard kill switch
    
    try {
      const result = await usersService.uploadProfilePicture(targetUserId, file, abortControllerRef.current)
      clearTimeout(abortTimeoutId)
      
      const currentUser = useAuthStore.getState().user
      if (currentUser?.id === targetUserId) {
        useAuthStore.getState().setUser({ ...currentUser, profilePictureUrl: result.url })
      }
      
      setSuccessMode(true)
      showSuccess('Imagen procesada y subida a AWS S3 correctamente.')
      
      if (onSuccess) onSuccess(result.url)
      
      setTimeout(() => {
        onClose() // Usa onClose en lugar de handleClose para no disparar el abort
      }, 2000)
    } catch (err) {
      clearTimeout(abortTimeoutId)
      
      if (err.name === 'CanceledError') {
        setError('El proceso fue cancelado.')
      } else if (err.message === 'TIMEOUT_EXCEEDED') {
        setError('El proceso tardó demasiado (más de 8s). S3 no responde o el internet está saturado.')
      } else {
        setError(err.response?.data?.message || 'Falló la conexión con el motor en S3.')
      }
      setIsUploading(false)
    } finally {
      abortControllerRef.current = null
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          <motion.div
            className="relative w-full max-w-md bg-[#0f1117] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#14171f]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                  <Icon name="camera" size={16} className="text-accent-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Actualizar Foto de Perfil</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Cancelar y Salir"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {successMode ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-status-healthy/20 flex items-center justify-center mb-4">
                      <Icon name="check" size={32} className="text-status-healthy" />
                    </div>
                    <p className="text-text-primary font-medium text-lg">¡Actualización Exitosa!</p>
                    <p className="text-text-muted text-xs mt-1 text-center">
                      La ruta en Amazon S3 fue enlazada a este usuario.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Drag & Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                        isDragging 
                          ? 'border-accent-cyan bg-accent-cyan/5' 
                          : file 
                            ? 'border-white/20 bg-white/5' 
                            : 'border-white/10 bg-[#14171f] hover:bg-white/[0.02] hover:border-white/20'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept={ACCEPTED_TYPES.join(',')}
                        className="hidden"
                      />
                      
                      {previewUrl ? (
                        <div className="flex flex-col items-center w-full">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-surface-2 shadow-lg mb-4" 
                          />
                          <p className="text-xs font-medium text-text-primary truncate max-w-full px-4">{file.name}</p>
                          <p className="text-[10px] text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          
                          <button 
                            disabled={isUploading}
                            onClick={() => { setFile(null); setPreviewUrl(null); }}
                            className="mt-3 text-[11px] text-text-secondary hover:text-status-critical transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Eliminar selección
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                            <Icon name="upload-cloud" size={24} className="text-text-secondary" />
                          </div>
                          <p className="text-sm font-medium text-text-primary mb-1">
                            Arrastra tu imagen aquí
                          </p>
                          <p className="text-xs text-text-muted mb-4">
                            o da clic para explorar tus archivos
                          </p>
                          <button
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Examinar PC
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Guidelines and Errors */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-blue/5 border border-accent-blue/10">
                        <Icon name="info" size={14} className="text-accent-blue mt-0.5" />
                        <div className="text-[11px] text-text-secondary leading-relaxed">
                          <strong className="text-text-primary block mb-0.5">Lineamientos del archivo:</strong>
                          Formatos aceptados: JPEG, PNG, GIF, WebP.<br />
                          Tamaño máximo permitido: {MAX_FILE_SIZE_MB}MB.
                        </div>
                      </div>
                      
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="flex items-start gap-2 p-3 rounded-lg bg-status-critical/10 border border-status-critical/20"
                        >
                          <Icon name="alert-triangle" size={14} className="text-status-critical mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-status-critical">{error}</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!successMode && (
              <div className="px-6 py-4 bg-[#14171f] border-t border-white/[0.06] flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadClick}
                  disabled={!file || isUploading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    !file 
                      ? 'bg-white/5 text-text-muted cursor-not-allowed' 
                      : 'bg-accent-cyan text-[#0f1117] hover:bg-opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Icon name="refresh-cw" size={14} />
                      </motion.div>
                      <span>Subiendo a S3...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="upload" size={14} />
                      <span>Confirmar Subida</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ProfilePictureModal
