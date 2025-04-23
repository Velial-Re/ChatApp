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
    addMessage: (state, { payload }) => {
      if (!state.messages.find(msg => msg.id === payload.id)) {
        state.messages.push(payload)
      }
    },
    setMessages: (state, { payload }) => {
      state.messages = payload
    },
    updateMessage: (state, { payload }) => {
      const msg = state.messages.find(m => m.id === payload.id)
      if (msg) Object.assign(msg, payload.updates)
    },
    removeMessage: (state, { payload }) => {
      state.messages = state.messages.filter(m => m.id !== payload)
    },
    setConnectionStatus: (state, { payload }) => {
      state.isConnected = payload
    },
    setChatRoom: (state, { payload }) => {
      state.chatRoom = payload
    },
    setUserChats: (state, { payload }) => {
      state.userChats = payload
    },
    setShowCreateModal: (state, { payload }) => {
      state.showCreateModal = payload
    },
    setShowJoinModal: (state, { payload }) => {
      state.showJoinModal = payload
    },
    setNewChatName: (state, { payload }) => {
      state.newChatName = payload
    },
    setIsChatLoading: (state, { payload }) => {
      state.isChatLoading = payload
    },
    resetChatState: () => initialState,
  },
})

export const chatReducer = chatSlice.reducer
export const chatSliceActions = chatSlice.actions
export const {
  addMessage,
  setMessages,
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
} = chatSlice.actions
