import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await api.post(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        )
        return api(originalRequest)
      } catch (refreshError) {
        if (refreshError.response?.status === 401) {
          window.location.href = '/auth/login'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)
export default api
