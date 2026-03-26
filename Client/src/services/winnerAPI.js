import api from './axios'

export const winnerAPI = {
  listMine: async () => (await api.get('/api/winners/me')).data,
  listAll: async () => (await api.get('/api/winners')).data,
  submitProof: async (winnerId, payload) =>
    (await api.post(`/api/winners/${winnerId}/proof`, payload)).data,
  decide: async (winnerId, payload) =>
    (await api.put(`/api/winners/${winnerId}/decision`, payload)).data,
  markPaid: async (winnerId) => (await api.put(`/api/winners/${winnerId}/pay`)).data,
  remove: async (winnerId) => (await api.delete(`/api/winners/${winnerId}`)).data,
  drawWinners: async (drawId) =>
    (await api.get(`/api/winners/draw/${drawId}`)).data,
}
