import { useChat } from '../../../../context/ChatContext.jsx'
import Modal from '../../Modal/Modal.jsx'

export const CreateChatModal = () => {
  const {
    newChatName,
    setNewChatName,
    createChat,
    showCreateModal,
    setShowCreateModal,
  } = useChat()

  return (
    <Modal
      active={showCreateModal}
      setActive={setShowCreateModal}
      title="Создать новый чат"
    >
      <input
        type="text"
        value={newChatName}
        onChange={(e) => setNewChatName(e.target.value)}
        placeholder="Название чата"
        className="modal__input"
      />
      <div className="modal__actions">
        <button
          className="modal__button modal__button--cancel"
          onClick={() => setShowCreateModal(false)}
        >
          Отмена
        </button>
        <button
          className="modal__button modal__button--confirm"
          onClick={createChat}
        >
          Создать
        </button>
      </div>
    </Modal>
  )
}
