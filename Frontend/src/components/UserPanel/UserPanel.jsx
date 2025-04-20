import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAction } from '@/store/auth/authActions'
import { useChat } from '../../context/ChatContext.jsx' // чат пока остаётся через context

export const UserPanel = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { closeChat } = useChat()
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username)
    }
  }, [user])

  const onLogout = () => {
    closeChat()
    dispatch(logoutAction())
  }

  return (
    <div className="user-panel">
      <div className="user__info">
        <div className="user-panel__username">{username || 'Загрузка...'}</div>
      </div>

      <div className="user__actions">
        <button className="actions__settings">Настройки</button>
        <button className="actions__logout" onClick={onLogout}>
          Выход
        </button>
      </div>
    </div>
  )
}
