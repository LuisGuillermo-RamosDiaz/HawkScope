import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import Icon from '../components/icons/Icon'
import StatusBadge from '../components/StatusBadge'
import useAuthStore from '../store/authStore'
import { useToast } from '../hooks/useToast'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import usersService from '../services/usersService'
import ProfilePictureModal from '../components/ProfilePictureModal'

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
  const [linkCopied, setLinkCopied] = useState(false)
  
  const [users, setUsers] = useState([])
  
  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Buscamos copiar pero fallo el fallback:', err)
      }
      document.body.removeChild(textArea)
    }
  }
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  
  const [showPfpModal, setShowPfpModal] = useState(false)
  const [targetPfpUserId, setTargetPfpUserId] = useState(null)
  const [editUserId, setEditUserId] = useState(null)

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
    setEditUserId(null)
    setForm({ name: '', email: '', role: 'viewer' })
    setInviteLink('')
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditUserId(u.id)
    setForm({ name: u.fullName || '', email: u.email || '', role: u.role || 'viewer' })
    setInviteLink('')
    setShowModal(true)
  }

  const handleInviteOrUpdate = async () => {
    setIsSubmitting(true)
    try {
      if (editUserId) {
        // CRUD - Update
        await usersService.updateUser(editUserId, {
          name: form.name,
          email: form.email,
          role: form.role
        })
        showSuccess('Usuario actualizado correctamente')
        setShowModal(false)
      } else {
        // CRUD - Create
        const result = await usersService.inviteUser({
          name: form.name,
          email: form.email,
          role: form.role
        })
        
        const generatedLink = `${window.location.origin}/invite/${result.inviteToken}`
        setInviteLink(generatedLink)
        copyToClipboard(generatedLink)
        showSuccess('Usuario invitado. Enlace copiado al portapapeles.')
      }
      fetchUsers() // Refresh list
    } catch (error) {
      console.error('Error al invitar:', error)
      const errorMsg = error.response?.data?.message || 'Error al invitar usuario'
      showError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadClick = (id) => {
    setTargetPfpUserId(id)
    setShowPfpModal(true)
  }

  const handleResendInvite = async (u) => {
    try {
      const result = await usersService.regenerateInvite(u.id)
      const generatedLink = `${window.location.origin}/invite/${result.inviteToken}`
      setInviteLink(generatedLink)
      setForm({ name: u.fullName || '', email: u.email || '', role: u.role || 'viewer' })
      setShowModal(true)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al regenerar invitación'
      showError(errorMsg)
    }
  }

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
      copyToClipboard(inviteLink)
      setLinkCopied(true)
      showSuccess('Enlace copiado al portapapeles')
      setTimeout(() => setLinkCopied(false), 2500)
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
                      <div className="flex items-center gap-2">
                        {isAdmin && u.status === 'invited' && (
                          <button onClick={() => handleResendInvite(u)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/5 bg-white/5 hover:bg-accent-purple/10 hover:border-accent-purple/20 text-text-secondary hover:text-accent-purple transition-all text-[11px] font-medium" title="Regenerar enlace de invitación">
                            <Icon name="send" size={12} />
                            <span>Reenviar</span>
                          </button>
                        )}
                        {(isAdmin && user?.id !== u.id) && (
                          <button onClick={() => handleUploadClick(u.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/5 bg-white/5 hover:bg-accent-cyan/10 hover:border-accent-cyan/20 text-text-secondary hover:text-accent-cyan transition-all text-[11px] font-medium" title="Cambiar foto de este usuario (S3)">
                            <Icon name="camera" size={12} />
                            <span>Cambiar Foto</span>
                          </button>
                        )}
                        {isAdmin && u.email !== user?.email && (
                          <button onClick={() => setShowDeleteModal(u.id)} className="p-1.5 rounded-md border border-white/5 bg-white/5 text-text-muted hover:text-status-critical hover:bg-status-critical/10 hover:border-status-critical/20 transition-all" title="Eliminar usuario">
                            <Icon name="trash-2" size={13} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-md border border-white/5 bg-white/5 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/20 transition-all" title="Editar Nombre/Rol">
                            <Icon name="edit" size={13} />
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
                  {editUserId ? 'Editar Usuario' : 'Invitar al Equipo'}
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
                      {editUserId ? (
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-text-muted text-xs font-medium cursor-not-allowed opacity-80">
                          {form.email}
                        </div>
                      ) : (
                        <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field text-xs" placeholder="email@empresa.com" disabled={isSubmitting} />
                      )}
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
                    <button disabled={isSubmitting || !form.name || !form.email} onClick={handleInviteOrUpdate} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
                      <Icon name={isSubmitting ? "loader" : (editUserId ? "save" : "send")} size={13} className={isSubmitting ? "animate-spin" : ""} />
                      {editUserId ? 'Guardar' : 'Invitar'}
                    </button>
                  </div>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-status-healthy/15 text-status-healthy rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="check" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">¡Invitación generada!</p>
                        <p className="text-[10px] text-text-muted">El usuario aparece como &ldquo;Invitado&rdquo; hasta que acepte.</p>
                      </div>
                    </div>

                    <div className="bg-[#0a0c10] rounded-lg border border-white/[0.06] p-3 mb-4">
                      <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mb-2">Enlace de activación</p>
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/10">
                        <input type="text" readOnly value={inviteLink} className="bg-transparent text-[10px] text-accent-cyan/80 w-full outline-none font-mono" />
                        <button onClick={copyLink} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-medium transition-all flex-shrink-0 ${
                          linkCopied 
                            ? 'bg-status-healthy/15 text-status-healthy border border-status-healthy/20' 
                            : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20'
                        }`}>
                          <Icon name={linkCopied ? 'check' : 'copy'} size={12} />
                          <span>{linkCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Icon name="info" size={13} className="text-accent-blue mt-0.5 flex-shrink-0" />
                        <div className="text-[11px] text-text-secondary leading-relaxed">
                          <strong className="text-text-primary block mb-1">¿Cómo acepta la invitación?</strong>
                          <ol className="list-decimal list-inside space-y-0.5">
                            <li>Copia el enlace de arriba</li>
                            <li>Envíalo al invitado por correo, chat, etc.</li>
                            <li>El invitado abre el enlace y crea su contraseña</li>
                            <li>Su cuenta se activa automáticamente</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => { setShowModal(false); setLinkCopied(false); }} className="btn-primary w-full text-sm py-2">
                      Entendido
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

      <ProfilePictureModal 
        isOpen={showPfpModal} 
        onClose={() => { setShowPfpModal(false); setTargetPfpUserId(null); }} 
        targetUserId={targetPfpUserId} 
        onSuccess={() => fetchUsers()} 
      />
    </StaggerContainer>
  )
}

export default UsersPage
