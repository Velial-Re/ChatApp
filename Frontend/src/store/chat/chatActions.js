import { chatSliceActions } from './chatSlice'
import { createChat } from './chatThunks'

export const {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setConnectionStatus,
  setChatRoom,
  setUserChats,
  setShowCreateModal,
  setShowJoinModal,
  setNewChatName,
  setIsChatLoading,
  resetChatState,
} = chatSliceActions

export const joinChatAction = (chatName) => (dispatch) => {
  dispatch(setChatRoom(chatName))
}

export { createChat }
