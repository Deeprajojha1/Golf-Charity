import api from './axios'

export const adminAPI = {
  summary: async () => (await api.get('/api/admin/summary')).data,
  listUsers: async () => (await api.get('/api/admin/users')).data,
  updateUser: async (userId, payload) =>
    (await api.put(`/api/admin/users/${userId}`, payload)).data,
  deleteUser: async (userId) => (await api.delete(`/api/admin/users/${userId}`)).data,
  addUserScore: async (userId, payload) =>
    (await api.post(`/api/admin/users/${userId}/scores`, payload)).data,
  updateUserScore: async (userId, scoreId, payload) =>
    (await api.put(`/api/admin/users/${userId}/scores/${scoreId}`, payload)).data,
  createCharity: async (payload) => (await api.post('/api/admin/charities', payload)).data,
  updateCharity: async (charityId, payload) =>
    (await api.put(`/api/admin/charities/${charityId}`, payload)).data,
  deleteCharity: async (charityId) =>
    (await api.delete(`/api/admin/charities/${charityId}`)).data,
}
