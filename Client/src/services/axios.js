import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://golf-charity-7ijy.onrender.com',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Request failed'
    error.message = message
    error.userMessage = message
    return Promise.reject(error)
  },
)

export default api
