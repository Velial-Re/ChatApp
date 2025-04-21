import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import Modal from '../../Modal/Modal.jsx'
import { joinChat } from '@/store/chat/chatThunks.js'  // Импортируйте joinChat из chatThunks.js
import { setShowJoinModal } from '@/store/chat/chatActions.js'


export const JoinChatModal = () => {
  const [chatName, setChatName] = useState('')
  const dispatch = useDispatch()
  const showJoinModal = useSelector((state) => state.chat.showJoinModal)

  const onJoin = () => {
    dispatch(joinChat(chatName, false))
    dispatch(setShowJoinModal(false)) // Скрыть модалку после присоединения
  }

  return (
    <Modal active={showJoinModal} setActive={(active) => dispatch(setShowJoinModal(active))} title="Присоединиться к чату">
      <input
        type="text"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        placeholder="Название чата"
        className="modal__input"
      />
      <div className="modal__actions">
        <button
          onClick={() => dispatch(setShowJoinModal(false))}
          className="modal__button modal__button--cancel"
        >
          Отмена
        </button>
        <button onClick={onJoin} className="modal__button modal__button--confirm">
          Присоединиться
        </button>
      </div>
    </Modal>
  )
}
