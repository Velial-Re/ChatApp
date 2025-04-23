import { createAsyncThunk } from '@reduxjs/toolkit'
import * as signalR from '@microsoft/signalr'
import api from '@/api/api'
import {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setChatRoom,
  setUserChats,
  setIsChatLoading,
  resetChatState,
  setConnectionStatus,
} from './chatSlice'
import { logout } from '../auth/authSlice'

let connection = null

export const loadUserChats = createAsyncThunk('chat/loadUserChats', async (_, { dispatch, getState }) => {
  try {
    dispatch(setIsChatLoading(true))
    const { chatRoom } = getState().chat
    const { data } = await api.get('/chats/my')
    dispatch(setUserChats(data.map(chat => ({
      ...chat,
      lastMessage: chat.lastMessage || 'Нет сообщений',
      isActive: chat.name === chatRoom,
    }))))
  } catch (e) {
    if (e.response?.status === 401) dispatch(logout())
    else console.error('Ошибка при загрузке чатов:', e)
  } finally {
    dispatch(setIsChatLoading(false))
  }
})

export const createChat = createAsyncThunk('chat/createChat', async (_, { getState, dispatch }) => {
  const { auth: { user }, chat: { newChatName } } = getState()
  if (!user) throw new Error('Вы не авторизованы')
  const name = newChatName.trim()
  if (!name) throw new Error('Название чата не может быть пустым')

  try {
    const { data } = await api.post('/chats/create', { name })
    dispatch(loadUserChats())
    dispatch(joinChat({ roomName: data.name }))
    return data
  } catch (e) {
    console.error('Ошибка при создании чата:', e)
    throw new Error('Ошибка при создании чата')
  }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (text, { getState, dispatch }) => {
  const { isConnected } = getState().chat
  if (!connection || !isConnected || !text?.trim()) return

  const trimmed = text.trim()
  const messageId = crypto.randomUUID()

  dispatch(addMessage({
    userName: 'Вы',
    message: trimmed,
    id: messageId,
    timestamp: new Date().toISOString(),
    isPending: true,
    isOwn: true,
  }))

  try {
    await connection.invoke('SendMessage', trimmed, messageId)
    dispatch(updateMessage({ id: messageId, updates: { isPending: false } }))

    // Не дожидаемся, чтобы не тормозить UI
    connection.invoke('UpdateChatList').catch(console.warn)
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
    connection = null
  }
  dispatch(resetChatState())
})

export const joinChat = createAsyncThunk('chat/joinChat', async ({ roomName, isSwitching = false }, { dispatch, getState, rejectWithValue }) => {
  const { auth: { user }, chat: { isConnected, chatRoom } } = getState()
  if (!user) throw new Error('Вы не авторизованы')
  if (isConnected && chatRoom === roomName) return

  dispatch(setIsChatLoading(true))

  try {
    if (connection) {
      connection.off('ReceiveMessage')
      connection.off('UserJoined')
      connection.off('UserLeft')
      await connection.stop()
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

    connection.on('ReceiveMessage', (userName, message, id) => {
      dispatch(addMessage({ userName, message, id, timestamp: new Date().toISOString() }))
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

    connection.on('UpdateChatList', () => dispatch(loadUserChats()))

    await connection.start()
    await connection.invoke('JoinChat', { UserName: user.username, ChatRoom: roomName }, isSwitching)

    const history = await connection.invoke('GetChatHistory', roomName)
    dispatch(setMessages(history.map(msg => ({
      userName: msg.UserName,
      message: msg.Content,
      id: crypto.randomUUID(),
      timestamp: msg.SentAt,
    }))))

    dispatch(setConnectionStatus(true))
    dispatch(setChatRoom(roomName))
    return roomName
  } catch (e) {
    console.error('Ошибка при подключении:', e)
    dispatch(setMessages([]))
    dispatch(setConnectionStatus(false))
    dispatch(setChatRoom(''))
    return rejectWithValue(e.message)
  } finally {
    dispatch(setIsChatLoading(false))
  }
})
