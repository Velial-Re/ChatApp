import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadUserChats, joinChat } from '@/store/chat/chatThunks.js'
import { setShowCreateModal, setShowJoinModal } from '@/store/chat/chatSlice.js' // Исправлен импорт
import { selectUserChats, selectShowCreateModal, selectShowJoinModal } from '@/store/chat/chatSelectors.js'
import { CreateChatModal } from '../../modals/chatModal/CreateChatModal/CreateChatModal'
import { JoinChatModal } from '../../modals/chatModal/JoinChatModal/JoinChatModal'
import { useNavigate } from 'react-router-dom'
import { UserPanel } from '../../UserPanel/UserPanel.jsx'

export default function ChatDashboard() {
  const dispatch = useDispatch()
  const userChats = useSelector(selectUserChats)
  const showCreateModal = useSelector(selectShowCreateModal)
  const showJoinModal = useSelector(selectShowJoinModal)

  const [loadingError, setLoadingError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const fetchUserChats = useCallback(async () => {
    setLoadingError(null)
    setIsLoading(true)
    try {
      await dispatch(loadUserChats())
    } catch (e) {
      setLoadingError('Не удалось загрузить чаты. Попробуйте позже.')
      console.error('Failed to load user chats', e)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchUserChats()
  }, [fetchUserChats])

  const onJoinChat = (chatName) => {
    dispatch(joinChat({ roomName: chatName, isSwitching: true }))
    navigate(`/chat/${chatName}`)
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h2 className="dashboard__title">Чаты</h2>
      </div>

      <div className="dashboard__actions">
        <button className="dashboard__action" onClick={() => dispatch(setShowCreateModal(true))}>
          <i className="">Создать чат</i>
        </button>
        <button className="dashboard__action" onClick={() => dispatch(setShowJoinModal(true))}>
          <i className="">Присоединиться</i>
        </button>
      </div>

      <div className="dashboard__chats-list">
        {isLoading && <p className="loading-message">Загрузка чатов...</p>}
        {loadingError && <p className="error-message">{loadingError}</p>}
        {!isLoading &&
          !loadingError &&
          userChats.length === 0 && <p className="no-chats-message">У вас нет чатов</p>}
        {!isLoading &&
          !loadingError &&
          userChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.isActive ? 'active' : ''}`}
              onClick={() => onJoinChat(chat.name)}
            >
              <h3># {chat.name}</h3>
              <p>{chat.lastMessage || 'Нет сообщений'}</p>
            </div>
          ))}
      </div>
      <UserPanel />
      {showCreateModal && <CreateChatModal />}
      {showJoinModal && <JoinChatModal />}
    </div>
  )
}
