import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import Modal from '../../Modal/Modal.jsx'
import { joinChat } from '@/store/chat/chatThunks.js'
import { setShowJoinModal } from '@/store/chat/chatActions.js'
import { useNavigate } from 'react-router-dom'
import { selectChatConnection, selectCurrentRoom } from '@/store/chat/chatSelectors.js'

export const JoinChatModal = () => {
  const [chatName, setChatName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const showJoinModal = useSelector((state) => state.chat.showJoinModal)
  const isConnected = useSelector(selectChatConnection)
  const currentRoom = useSelector(selectCurrentRoom)
  const navigate = useNavigate()

  const onJoin = async () => {
    const trimmedName = chatName.trim()
    if (!trimmedName || isJoining) return

    setIsJoining(true)
    setError(null) // Сброс ошибки перед новым запросом

    try {
      await dispatch(joinChat({ roomName: trimmedName, isSwitching: false })).unwrap()
      dispatch(setShowJoinModal(false))
      setChatName('')
    } catch (error) {
      console.error('Ошибка при подключении к чату:', error)
      setError(error || 'Не удалось подключиться к чату')
    } finally {
      setIsJoining(false)
    }
  }

  useEffect(() => {
    if (isConnected && currentRoom) {
      navigate(`/chat/${currentRoom}`)
    }
  }, [isConnected, currentRoom, navigate])

  return (
    <Modal
      active={showJoinModal}
      setActive={(active) => {
        if (!active) {
          setChatName('')
          setError(null)
        }
        dispatch(setShowJoinModal(active))
      }}
      title="Присоединиться к чату"
    >
      <input
        type="text"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        placeholder="Название чата"
        className="modal__input"
        onKeyDown={(e) => e.key === 'Enter' && onJoin()}
      />
      {error && <div className="modal__error">{error}</div>}
      <div className="modal__actions">
        <button
          onClick={() => dispatch(setShowJoinModal(false))}
          className="modal__button modal__button--cancel"
          disabled={isJoining}
        >
          Отмена
        </button>
        <button
          onClick={onJoin}
          className="modal__button modal__button--confirm"
          disabled={!chatName.trim() || isJoining}
        >
          {isJoining ? 'Подключение...' : 'Присоединиться'}
        </button>
      </div>
    </Modal>
  )
}
