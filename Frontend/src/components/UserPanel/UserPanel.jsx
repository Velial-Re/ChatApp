import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAction } from '@/store/auth/authActions'
import { closeChat } from '@/store/chat/chatThunks' 

export const UserPanel = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username)
    }
  }, [user])

  const onLogout = () => {
    dispatch(closeChat()) // Закрываем чат через Redux
    dispatch(logoutAction()) // Выполняем выход из системы
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
