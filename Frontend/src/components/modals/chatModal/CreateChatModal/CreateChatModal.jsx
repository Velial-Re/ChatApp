import { useDispatch, useSelector } from 'react-redux'
import Modal from '../../Modal/Modal.jsx'
import { setNewChatName, createChat } from '@/store/chat/chatActions'

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const newChatName = useSelector((state) => state.chat.newChatName)
  const showCreateModal = useSelector((state) => state.chat.showCreateModal)

  const handleChange = (e) => {
    dispatch(setNewChatName(e.target.value))
  }

  const handleCreateChat = () => {
    dispatch(createChat())
  }

  return (
    <Modal active={showCreateModal} setActive={(active) => dispatch(setShowCreateModal(active))} title="Создать новый чат">
      <input
        type="text"
        value={newChatName}
        onChange={handleChange}
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
        <button className="modal__button modal__button--confirm" onClick={handleCreateChat}>
          Создать
        </button>
      </div>
    </Modal>
  )
}
