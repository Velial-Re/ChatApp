import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [],
  isConnected: false,
  chatRoom: '',
  userChats: [],
  showCreateModal: false,
  showJoinModal: false,
  newChatName: '',
  isChatLoading: true,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload
    },
    addMessage(state, action) {
      state.messages.push(action.payload)
    },
    updateMessage(state, action) {
      const index = state.messages.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload.updates }
      }
    },
    removeMessage(state, action) {
      state.messages = state.messages.filter(m => m.id !== action.payload)
    },
    setConnectionStatus(state, action) {
      state.isConnected = action.payload
    },
    setChatRoom(state, action) {
      state.chatRoom = action.payload
    },
    setUserChats(state, action) {
      state.userChats = action.payload
    },
    setShowCreateModal(state, action) {
      state.showCreateModal = action.payload
    },
    setShowJoinModal(state, action) {
      state.showJoinModal = action.payload
    },
    setNewChatName(state, action) {
      state.newChatName = action.payload
    },
    setIsChatLoading(state, action) {
      state.isChatLoading = action.payload
    },
    resetChatState() {
      return initialState
    },
  },
})

export const chatReducer = chatSlice.reducer
export const chatSliceActions = chatSlice.actions

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
  resetChatState
} = chatSlice.actions
