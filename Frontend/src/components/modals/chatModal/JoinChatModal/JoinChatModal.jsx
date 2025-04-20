import { useChat } from '../../../../context/ChatContext.jsx'
import { useState } from 'react'
import Modal from '../../Modal/Modal.jsx'

export const JoinChatModal = () => {
  const [chatName, setChatName] = useState('')
  const { showJoinModal, setShowJoinModal, joinChat } = useChat()

  const onJoin = () => {
    joinChat(chatName, false)
    setShowJoinModal(false)
  }

  return (
    <Modal active={showJoinModal} setActive={setShowJoinModal} title="Присоединиться к чату">
      <input
        type="text"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        placeholder="Название чата"
        className="modal__input"
      />
      <div className="modal__actions">
        <button
          onClick={() => setShowJoinModal(false)}
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
