import { setUser, setLoading, setError, logout } from './authSlice'
import api from '../../api/api'

export const loginAction = (userData) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const response = await api.post('auth/login', {
      username: userData.username,
      password: userData.password,
    })
    dispatch(setUser(response.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Ошибка входа'))
    console.error('Login failed:', error)
  } finally {
    dispatch(setLoading(false))
  }
}


export const logoutAction = () => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    await api.post('auth/logout')
    dispatch(logout()) // очищаем стейт через слайс
  } catch (error) {
    dispatch(setError(error.message || 'Ошибка выхода'))
    console.error('Logout failed:', error)
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchUserAction = () => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const response = await api.get('auth/user')
    dispatch(setUser(response.data))
  } catch (error) {
    if (error.response?.status !== 401) {
      dispatch(setError(error.message || 'Ошибка получения пользователя'))
    }
    console.error('Fetch user failed:', error)
  } finally {
    dispatch(setLoading(false))
  }
}

export const refreshAuthAction = () => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    await api.post('auth/refresh')
  } catch (error) {
    dispatch(setError(error.message || 'Ошибка обновления сессии'))
    console.error('Refresh failed:', error)
  } finally {
    dispatch(setLoading(false))
  }
}
