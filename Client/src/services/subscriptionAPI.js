import api from './axios'

export const subscriptionAPI = {
  status: async () => (await api.get('/api/subscription/status')).data,
  start: async (plan) => (await api.post('/api/subscription/start', { plan })).data,
  renew: async (plan) => (await api.put('/api/subscription/renew', { plan })).data,
  cancel: async () => (await api.put('/api/subscription/cancel')).data,
}
