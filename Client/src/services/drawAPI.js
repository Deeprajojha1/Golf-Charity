import api from './axios'

export const drawAPI = {
  list: async () => (await api.get('/api/draws')).data,
  latest: async () => (await api.get('/api/draws/latest')).data,
  simulate: async (logicType) =>
    (await api.post('/api/draws/simulate', { logicType })).data,
  publish: async (logicType) =>
    (await api.post('/api/draws/publish', { logicType })).data,
  remove: async (drawId) => (await api.delete(`/api/draws/${drawId}`)).data,
}
