import { createAsyncThunk } from '@reduxjs/toolkit'
import * as signalR from '@microsoft/signalr'
import api from '../../api/api'
import {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setConnection,
  setChatRoom,
  setUserChats,
  setIsChatLoading,
  resetChatState,
} from './chatActions'
import { logout } from '../auth/authSlice'

let connection = null

export const loadUserChats = createAsyncThunk('chat/loadUserChats', async (_, { dispatch, getState }) => {
  const { chatRoom } = getState().chat
  try {
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
  }
})

export const createChat = createAsyncThunk('chat/createChat', async (_, { getState, dispatch }) => {
  const { auth: { user }, chat: { newChatName } } = getState()
  if (!user) throw new Error('Вы не авторизованы')
  if (!newChatName.trim()) throw new Error('Название чата не может быть пустым')

  const response = await api.post('/chats/create', { name: newChatName.trim() })
  await dispatch(loadUserChats())
  await dispatch(joinChat({ roomName: response.data.name }))
  return response.data
})

export const joinChat = createAsyncThunk('chat/joinChat', async ({ roomName, isSwitching = false }, { dispatch, getState }) => {
  const { auth: { user } } = getState()

  if (!user) throw new Error('Вы не авторизованы')

  // Disconnect old
  if (connection) {
    try {
      connection.off('ReceiveMessage')
      connection.off('UserJoined')
      connection.off('UserLeft')
      await connection.stop()
    } catch (e) {
      console.error('Ошибка отключения соединения:', e)
    }
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

  await connection.start()

  await connection.invoke('JoinChat', {
    UserName: user.username,
    ChatRoom: roomName,
  }, isSwitching)

  const history = await connection.invoke('GetChatHistory', roomName)
  const formatted = history.map(msg => ({
    userName: msg.UserName,
    message: msg.Content,
    id: crypto.randomUUID(),
    timestamp: msg.SentAt,
    isSystem: false,
  }))

  dispatch(setMessages(formatted))
  dispatch(setConnection(connection))
  dispatch(setChatRoom(roomName))
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (text, { getState, dispatch }) => {
  const { chat: { connection } } = getState()
  if (!connection || !text?.trim()) return

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
