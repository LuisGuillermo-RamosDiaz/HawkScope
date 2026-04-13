import api from '../utils/api'

const usersService = {
  // Obtener todos los usuarios de la organización
  getUsers: async () => {
    const response = await api.get('/api/v1/users')
    return response.data
  },

  // Invitar a un nuevo usuario
  inviteUser: async (userData) => {
    const response = await api.post('/api/v1/users/invite', userData)
    return response.data // { inviteToken: "..." }
  },

  // Eliminar a un usuario
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/v1/users/${userId}`)
    return response.data
  },

  acceptInvite: async (data) => {
    const response = await api.post('/api/v1/auth/accept-invite', data)
    return response.data
  },

  // Subir foto de perfil a S3
  uploadProfilePicture: async (userId, file, controller = null) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    if (controller) {
      config.signal = controller.signal
    }
    
    const response = await api.post(`/api/v1/users/${userId}/profile-picture`, formData, config)
    return response.data
  },

  // Regenerar enlace de invitación
  regenerateInvite: async (userId) => {
    const response = await api.post(`/api/v1/users/${userId}/regenerate-invite`)
    return response.data
  },

  // Actualizar nombre y rol de un usuario (CRUD - Update)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/v1/users/${userId}`, userData)
    return response.data
  }
}

export default usersService
