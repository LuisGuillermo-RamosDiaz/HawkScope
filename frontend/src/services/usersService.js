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

  // Aceptar invitacion (esto en realidad llama a authController /accept-invite)
  acceptInvite: async (data) => {
    const response = await api.post('/api/v1/auth/accept-invite', data)
    return response.data
  }
}

export default usersService
