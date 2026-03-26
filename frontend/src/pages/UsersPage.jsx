import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import Icon from '../components/icons/Icon'
import StatusBadge from '../components/StatusBadge'
import useAuthStore from '../store/authStore'
import { useToast } from '../hooks/useToast'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import usersService from '../services/usersService'

const roleColors = {
  admin: 'text-accent-cyan bg-accent-cyan/8 border-accent-cyan/15',
  operator: 'text-accent-purple bg-accent-purple/8 border-accent-purple/15',
  viewer: 'text-accent-amber bg-accent-amber/8 border-accent-amber/15',
}

const statusMap = {
  active: { status: 'healthy', label: 'Activo' },
  inactive: { status: 'warning', label: 'Inactivo' },
  invited: { status: 'info', label: 'Invitado' },
}

const UsersPage = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { showSuccess, showError } = useToast()
  
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  
  const fileInputRef = useRef(null)
  const [uploadingId, setUploadingId] = useState(null)

  const fetchUsers = async () => {
    try {
      const data = await usersService.getUsers()
      setUsers(data)
    } catch (error) {
      showError('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setForm({ name: '', email: '', role: 'viewer' })
    setInviteLink('')
    setShowModal(true)
  }

  const handleInvite = async () => {
    setIsSubmitting(true)
    try {
      const result = await usersService.inviteUser({
        name: form.name,
        email: form.email,
        role: form.role
      })
      
      const generatedLink = `${window.location.origin}/invite/${result.inviteToken}`
      setInviteLink(generatedLink)
      navigator.clipboard.writeText(generatedLink)
      
      showSuccess('Usuario invitado. Enlace copiado al portapapeles.')
      fetchUsers() // Refresh list
    } catch (error) {
      showError(error.response?.data?.message || 'Error al invitar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadClick = (id) => {
    setUploadingId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;

    try {
      showSuccess('Subiendo foto a S3...');
      const result = await usersService.uploadProfilePicture(uploadingId, file);
      
      setUsers(prev => prev.map(u => u.id === uploadingId ? { ...u, profilePictureUrl: result.url } : u));
      
      if (user?.id === uploadingId) {
         useAuthStore.getState().setUser({ ...user, profilePictureUrl: result.url });
      }
      
      showSuccess('Foto de perfil actualizada exitosamente');
    } catch (error) {
      showError('Error al subir la imagen');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await usersService.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setShowDeleteModal(null)
      showSuccess('Usuario eliminado')
    } catch (error) {
      showError('Error al eliminar usuario')
    }
  }

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      showSuccess('Enlace copiado al portapapeles')
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">{t('users.title')}</h1>
            <p className="text-xs text-text-secondary">{t('users.subtitle')}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs px-3 py-1.5">
                <Icon name="plus" size={13} />
                <span>{t('users.addUser')}</span>
              </button>
            </div>
          )}
        </div>
      </StaggerItem>

      {/* Users Table */}
      <StaggerItem>
        <GlassCard padding="p-0">
          <div className="overflow-x-auto min-h-[200px]">
            {isLoading ? (
               <div className="p-8 text-center text-text-muted text-xs">Cargando usuarios...</div>
            ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[t('users.name'), t('users.email'), t('users.role'), t('users.status'), t('users.lastAccess'), t('users.actions')].map(h => (
                    <th key={h} className="text-left text-[9px] text-text-muted uppercase tracking-widest font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.profilePictureUrl ? (
                          <img src={u.profilePictureUrl} alt={u.fullName} className="w-7 h-7 rounded-lg object-cover border border-white/[0.06]" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-accent-cyan uppercase">
                            {u.fullName?.charAt(0) || u.email?.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-text-primary font-medium">{u.fullName || 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-secondary font-mono">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${roleColors[u.role] || roleColors.viewer}`}>
                        {u.role === 'admin' ? t('users.admin') : u.role === 'operator' ? t('users.operator') : t('users.viewer')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={statusMap[u.status]?.status || 'warning'}
                        label={u.status === 'active' ? t('users.active') : u.status === 'inactive' ? t('users.inactive') : u.status === 'invited' ? t('users.invited') : u.status}
                        size="xs"
                      />
                    </td>
                    <td className="px-5 py-3 text-[10px] text-text-muted font-mono">{u.lastAccess}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {(isAdmin && user?.id !== u.id) && (
                          <button onClick={() => handleUploadClick(u.id)} className="p-1.5 rounded-lg text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/5 transition-all" title="Cambiar foto de este usuario (S3)">
                            <Icon name="upload-cloud" size={13} />
                          </button>
                        )}
                        {isAdmin && u.email !== user?.email && (
                          <button onClick={() => setShowDeleteModal(u.id)} className="p-1.5 rounded-lg text-text-muted hover:text-status-critical hover:bg-status-critical/5 transition-all" title="Eliminar usuario">
                            <Icon name="trash-2" size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowModal(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="glass-card w-full max-w-sm p-6"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-base font-bold text-text-primary mb-4">
                  Invitar al Equipo
                </h3>
                
                {!inviteLink ? (
                  <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.name')}</label>
                      <input name="name" value={form.name} onChange={handleChange} className="input-field text-xs" placeholder="Nombre completo" disabled={isSubmitting} />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.email')}</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field text-xs" placeholder="email@empresa.com" disabled={isSubmitting} />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.role')}</label>
                      <select name="role" value={form.role} onChange={handleChange} className="input-field text-xs py-2.5" disabled={isSubmitting}>
                        <option value="admin">{t('users.admin')}</option>
                        <option value="operator">{t('users.operator')}</option>
                        <option value="viewer">{t('users.viewer')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button disabled={isSubmitting} onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm py-2">{t('common.cancel')}</button>
                    <button disabled={isSubmitting || !form.name || !form.email} onClick={handleInvite} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
                      <Icon name={isSubmitting ? "loader" : "send"} size={13} className={isSubmitting ? "animate-spin" : ""} />
                      Invitar
                    </button>
                  </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-status-healthy/10 text-status-healthy rounded-full flex items-center justify-center mb-3">
                      <Icon name="check" size={24} />
                    </div>
                    <p className="text-sm text-text-primary mb-2">¡Invitación generada!</p>
                    <p className="text-xs text-text-secondary mb-4">Envía este enlace seguro a tu compañero para que elija su contraseña.</p>
                    
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/10 mb-5">
                      <input type="text" readOnly value={inviteLink} className="bg-transparent text-[10px] text-text-muted w-full outline-none" />
                      <button onClick={copyLink} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-accent-cyan transition-colors">
                        <Icon name="copy" size={14} />
                      </button>
                    </div>
                    
                    <button onClick={() => setShowModal(false)} className="btn-primary w-full text-sm py-2">
                      Cerrar
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(null)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="glass-card w-full max-w-xs p-6 glow-red"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-status-critical/10 border border-status-critical/20 flex items-center justify-center">
                    <Icon name="trash-2" size={22} className="text-status-critical" />
                  </div>
                </div>
                <div className="text-center mb-5">
                  <h3 className="text-sm font-bold text-text-primary mb-1">{t('users.deleteUser')}</h3>
                  <p className="text-xs text-text-secondary">{t('users.deleteConfirm')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(null)} className="btn-secondary flex-1 text-sm py-2">{t('common.cancel')}</button>
                  <motion.button
                    onClick={() => handleDelete(showDeleteModal)}
                    className="btn-danger flex-1 text-sm py-2 flex items-center justify-center gap-1.5"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="trash-2" size={13} />
                    {t('common.delete')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </StaggerContainer>
  )
}

export default UsersPage
