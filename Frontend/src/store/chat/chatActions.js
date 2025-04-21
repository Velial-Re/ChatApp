import { chatSliceActions } from './chatSlice'  // Импортируем actions из chatSlice
import { createChat } from './chatThunks'  // Импортируем createChat из chatThunks.js

// Экспорируем все экшены из chatSlice
export const {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setConnection,
  setChatRoom,
  setUserChats,
  setShowCreateModal,
  setShowJoinModal,
  setNewChatName,
  setIsChatLoading,
  resetChatState,
} = chatSliceActions

// Экшен для присоединения к чату
export const joinChatAction = (chatName) => (dispatch) => {
  // Обновляем текущую комнату чата в Redux
  dispatch(setChatRoom(chatName))
}

// Экспортируем createChat
export { createChat }

// Остальные селекторы
export const selectChatState = (state) => state.chat
export const selectMessages = (state) => state.chat.messages
export const selectUserChats = (state) => state.chat.userChats
export const selectCurrentRoom = (state) => state.chat.chatRoom
export const selectChatLoading = (state) => state.chat.isChatLoading
export const selectChatConnection = (state) => state.chat.connection
export const selectShowCreateModal = (state) => state.chat.showCreateModal
export const selectShowJoinModal = (state) => state.chat.showJoinModal
export const selectNewChatName = (state) => state.chat.newChatName
