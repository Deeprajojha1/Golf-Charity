import api from '../../services/axios'

export const dashboardAPI = {
  get: async () => (await api.get('/api/user/dashboard')).data,
  addScore: async (payload) => (await api.post('/api/user/scores', payload)).data,
  updateScore: async (scoreId, payload) =>
    (await api.put(`/api/user/scores/${scoreId}`, payload)).data,
}
