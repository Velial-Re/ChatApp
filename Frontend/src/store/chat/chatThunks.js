import { createAsyncThunk } from '@reduxjs/toolkit'
import * as signalR from '@microsoft/signalr'
import api from '../../api/api'
import {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setChatRoom,
  setUserChats,
  setIsChatLoading,
  resetChatState,
} from './chatActions'
import { logout } from '../auth/authSlice'
import { chatSliceActions } from './chatSlice'

const { setConnectionStatus } = chatSliceActions

// Локальное подключение, не хранится в state
let connection = null

export const loadUserChats = createAsyncThunk('chat/loadUserChats', async (_, { dispatch, getState }) => {
  const { chatRoom } = getState().chat
  try {
    dispatch(setIsChatLoading(true))
    const response = await api.get('/chats/my')
    dispatch(setUserChats(
      response.data.map(chat => ({
        ...chat,
        lastMessage: chat.lastMessage || 'Нет сообщений',
        isActive: chat.name === chatRoom,
      }))
    ))
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    } else {
      console.error('Ошибка при загрузке чатов:', e)
    }
  } finally {
    dispatch(setIsChatLoading(false))
  }
})

export const createChat = createAsyncThunk('chat/createChat', async (_, { getState, dispatch }) => {
  const { auth: { user }, chat: { newChatName } } = getState()
  if (!user) throw new Error('Вы не авторизованы')
  if (!newChatName.trim()) throw new Error('Название чата не может быть пустым')

  try {
    const response = await api.post('/chats/create', { name: newChatName.trim() })
    await dispatch(loadUserChats())  
    await dispatch(joinChat({ roomName: response.data.name })) 
    return response.data
  } catch (e) {
    console.error('Ошибка при создании чата:', e)
    throw new Error('Ошибка при создании чата')
  }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (text, { getState, dispatch }) => {
  // Вместо state.chat.connection берём нашу внешнюю переменную
  const { isConnected } = getState().chat
  if (!connection || !isConnected || !text?.trim()) return

  const messageId = crypto.randomUUID()
  const trimmed = text.trim()

  dispatch(addMessage({
    userName: 'Вы',
    message: trimmed,
    id: messageId,
    timestamp: new Date().toISOString(),
    isPending: true,
  }))

  try {
    await connection.invoke('SendMessage', trimmed, messageId)
    await connection.invoke('UpdateChatList')
    dispatch(updateMessage({ id: messageId, updates: { isPending: false } }))
  } catch (e) {
    dispatch(removeMessage(messageId))
    alert('Не удалось отправить сообщение')
  }
})

export const closeChat = createAsyncThunk('chat/closeChat', async (_, { dispatch }) => {
  if (connection) {
    try {
      await connection.stop()
    } catch (e) {
      console.error('Ошибка остановки соединения:', e)
    }
  }
  connection = null
  dispatch(resetChatState())
})

export const joinChat = createAsyncThunk('chat/joinChat', async ({ roomName, isSwitching = false }, { dispatch, getState }) => {
  const { auth: { user }, chat: { isConnected } } = getState()

  if (!user) throw new Error('Вы не авторизованы')
  if (isConnected) return

  dispatch(setIsChatLoading(true))

  // При повторном подключении «чистим» старое подключение
  if (connection) {
    connection.off('ReceiveMessage')
    connection.off('UserJoined')
    connection.off('UserLeft')
    await connection.stop().catch(console.error)
  }

  const { data: { token } } = await api.get('/auth/token')

  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:8080/chat', {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('ReceiveMessage', (userName, message, messageId) => {
    dispatch(addMessage({
      userName,
      message,
      id: messageId,
      timestamp: new Date().toISOString(),
    }))
  })

  connection.on('UserJoined', (userName) => {
    if (!isSwitching) {
      dispatch(addMessage({
        userName: 'System',
        message: `${userName} присоединился к чату`,
        id: crypto.randomUUID(),
        isSystem: true,
      }))
    }
  })

  connection.on('UserLeft', (userName) => {
    dispatch(addMessage({
      userName: 'System',
      message: `${userName} покинул чат`,
      id: crypto.randomUUID(),
      isSystem: true,
    }))
  })

  connection.on('UpdateChatList', () => {
    dispatch(loadUserChats())
  })

  try {
    await connection.start()
    await connection.invoke('JoinChat', {
      UserName: user.username,
      ChatRoom: roomName,
    }, isSwitching)

    const history = await connection.invoke('GetChatHistory', roomName)
    const formattedHistory = history.map(msg => ({
      userName: msg.UserName,
      message: msg.Content,
      id: crypto.randomUUID(),
      timestamp: msg.SentAt,
      isSystem: false,
    }))

    dispatch(setMessages(formattedHistory))
    dispatch(setConnectionStatus(true))
    dispatch(setChatRoom(roomName))

  } catch (e) {
    console.error('Ошибка подключения:', e)
    dispatch(setMessages([]))
    dispatch(setConnectionStatus(false))
    dispatch(setChatRoom(''))
  } finally {
    dispatch(setIsChatLoading(false))
  }
})
