import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../Modal/Modal.jsx'
import { setNewChatName, createChat } from '@/store/chat/chatActions'
import { chatSliceActions } from '@/store/chat/chatSlice'
import { useState } from 'react'

const { setShowCreateModal } = chatSliceActions

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const newChatName = useSelector((state) => state.chat.newChatName)
  const showCreateModal = useSelector((state) => state.chat.showCreateModal)
  const [isInteracting, setIsInteracting] = useState(false)

  const handleChange = (e) => {
    dispatch(setNewChatName(e.target.value))
  }

  const handleCreateChat = async () => {
    await dispatch(createChat())
    dispatch(setShowCreateModal(false))
  }

  const handleClose = () => {
    if (!isInteracting) {
      dispatch(setShowCreateModal(false))
    }
  }

  return (
    <Modal
      active={showCreateModal}
      setActive={handleClose}
      title="Создать новый чат"
    >
      <input
        type="text"
        value={newChatName}
        onChange={handleChange}
        onMouseDown={() => setIsInteracting(true)}
        onMouseUp={() => setIsInteracting(false)}
        onMouseLeave={() => setIsInteracting(false)}
        placeholder="Название чата"
        className="modal__input"
      />
      <div className="modal__actions">
        <button
          className="modal__button modal__button--cancel"
          onClick={() => dispatch(setShowCreateModal(false))}
        >
          Отмена
        </button>
        <button
          className="modal__button modal__button--confirm"
          onClick={handleCreateChat}
        >
          Создать
        </button>
      </div>
    </Modal>
  )
}