import api from '../../services/axios'

export const charityAPI = {
  list: async () => (await api.get('/api/charities')).data,
}

