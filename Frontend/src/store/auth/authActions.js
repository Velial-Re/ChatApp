import { setUser, setLoading, setError } from './authSlice'
import api from '../../api/api'

// Экшены
export const loginAction = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(false))
    const response = await api.post('auth/login', {
      username: userData.username,
      password: userData.password,
    })
    dispatch(setUser({ username: response.data.Username }))
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    dispatch(setError(error.response?.data?.message || 'Login failed'))
    console.error('Login failed', error)
  }
}

export const logoutAction = () => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    await api.post('auth/logout')
    dispatch(setUser(null))
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    dispatch(setError(error.message))
    console.error('Logout failed', error)
  }
}

export const fetchUserAction = () => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const response = await api.get('auth/user')
    dispatch(setUser(response.data))
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    dispatch(setError(error.message))
    console.error('Fetch user failed', error)
  }
}

export const refreshAuthAction = () => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    await api.post('auth/refresh')
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    dispatch(setError(error.message))
    console.error('Refresh failed', error)
  }
}
