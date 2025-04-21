import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import { chatReducer } from './chat/index'

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
})

export default store
