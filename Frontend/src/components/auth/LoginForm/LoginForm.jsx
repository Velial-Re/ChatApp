import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginAction } from '@/store/auth/authActions'

export default function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.auth.user)
  const isLoading = useSelector((state) => state.auth.isLoading)
  const error = useSelector((state) => state.auth.error)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((val) => ({
      ...val,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((er) => ({
        ...er,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно'
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязательно'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await dispatch(
        loginAction({
          username: formData.username,
          password: formData.password,
        })
      )
    } catch (err) {
      // Здесь ошибка уже в Redux `error`, но можно дополнительно показать локальную ошибку
      setErrors({
        form: err.message || 'Ошибка авторизации',
      })
    }
  }

  return (
    <div className="login__container">
      <h2 className="login__title">Войти</h2>
      {errors.form && <div className="error-message form__error">{errors.form}</div>}
      <form className="login__form" onSubmit={onLogin}>
        <div className="form__group">
          <label className="form__label">Имя пользователя</label>
          <input
            className={`form__input ${errors.username ? 'input-error' : ''}`}
            type="text"
            value={formData.username}
            name="username"
            onChange={onChange}
            placeholder="Введите ваше имя"
            disabled={isLoading}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>
        <div className="form__group">
          <label className="form__label">Пароль</label>
          <input
            className={`form__input ${errors.password ? 'input-error' : ''}`}
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Введите ваш пароль"
            disabled={isLoading}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        <button type="submit" className="form__button" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
