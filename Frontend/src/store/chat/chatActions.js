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

export const selectChatState = (state) => state.chat
export const selectMessages = (state) => state.chat.messages
export const selectUserChats = (state) => state.chat.userChats
export const selectCurrentRoom = (state) => state.chat.chatRoom
export const selectChatLoading = (state) => state.chat.isChatLoading
export const selectChatConnection = (state) => state.chat.isConnected
export const selectShowCreateModal = (state) => state.chat.showCreateModal
export const selectShowJoinModal = (state) => state.chat.showJoinModal
export const selectNewChatName = (state) => state.chat.newChatName
