import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import { useDispatch, useSelector } from 'react-redux'
import { logout as logoutAction } from '../store/auth/authSlice'
import api from '../api/api'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [messages, setMessages] = useState([])
  const [connection, setConnection] = useState(null)
  const [chatRoom, setChatRoom] = useState('')
  const [userChats, setUserChats] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newChatName, setNewChatName] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(true)

  // Загрузка чатов пользователя
  const loadUserChats = async () => {
    try {
      const response = await api.get('/chats/my')
      setUserChats(
        response.data.map((chat) => ({
          ...chat,
          lastMessage: chat.lastMessage || 'Нет сообщений',
          isActive: chat.name === chatRoom,
        }))
      )
      return response.data
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error)
      if (error.response?.status === 401) {
        dispatch(logoutAction())
        return
      }
      throw new Error('Не удалось загрузить чаты')
    }
  }

  useEffect(() => {
    const fetchChats = async () => {
      if (user) {
        try {
          await loadUserChats()
        } catch (e) {
          console.error('Ошибка при загрузке чатов внутри useEffect:', e)
        }
      }
      setIsChatLoading(false)
    }

    fetchChats()
  }, [user])

  const createChat = async () => {
    try {
      if (!user) throw new Error('Вы не авторизованы')
      if (!newChatName.trim()) throw new Error('Название чата не может быть пустым')

      const response = await api.post('/chats/create', {
        name: newChatName.trim(),
      })

      await loadUserChats()
      await joinChat(response.data.name)

      setShowCreateModal(false)
      setNewChatName('')
      return response.data
    } catch (error) {
      console.error('Ошибка создания чата:', error, error?.response?.data)
      alert(error?.response?.data?.message || error.message)
      throw error
    }
  }

  const joinChat = async (roomName, isSwitching = false) => {
    if (!user) throw new Error('Вы не авторизованы')

    if (connection) {
      try {
        connection.off('ReceiveMessage')
        connection.off('UserJoined')
        connection.off('UserLeft')
        await connection.stop()
      } catch (error) {
        console.error('Ошибка при отключении предыдущего соединения:', error)
      }
    }

    try {
      const tokenResponse = await api.get('/auth/token')
      const token = tokenResponse.data.token

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:8080/chat', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      newConnection.on('ReceiveMessage', (userName, message, messageId) => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === messageId)) return prev
          loadUserChats()
          return [
            ...prev,
            {
              userName,
              message,
              id: messageId,
              timestamp: new Date().toISOString(),
            },
          ]
        })
      })

      newConnection.on('UpdateChatList', loadUserChats)

      if (!isSwitching) {
        newConnection.on('UserJoined', (userName) => {
          setMessages((prev) => [
            ...prev,
            {
              userName: 'System',
              message: `${userName} присоединился к чату`,
              id: crypto.randomUUID(),
              isSystem: true,
            },
          ])
        })
      }

      newConnection.on('UserLeft', (userName) => {
        setMessages((prev) => [
          ...prev,
          {
            userName: 'System',
            message: `${userName} покинул чат`,
            id: crypto.randomUUID(),
            isSystem: true,
          },
        ])
      })

      await newConnection.start()

      await newConnection.invoke('JoinChat', {
        UserName: user.username,
        ChatRoom: roomName,
      }, isSwitching)

      await loadUserChats()

      const history = await newConnection.invoke('GetChatHistory', roomName)

      const formattedHistory = history.map((msg) => ({
        userName: msg.UserName,
        message: msg.Content,
        id: crypto.randomUUID(),
        timestamp: msg.SentAt,
        isSystem: false,
      }))

      setMessages(formattedHistory)
      setConnection(newConnection)
      setChatRoom(roomName)
    } catch (error) {
      console.error('Ошибка подключения к чату:', error)
      setMessages([])
      setConnection(null)
      setChatRoom('')
      alert('Не удалось подключиться к чату')
    }
  }

  const sendMessage = async (message) => {
    if (!connection || !message?.trim()) {
      console.warn('Нет соединения или сообщение пустое')
      return
    }

    const messageId = crypto.randomUUID()
    const trimmed = message.trim()

    setMessages((prev) => [
      ...prev,
      {
        userName: 'Вы',
        message: trimmed,
        id: messageId,
        timestamp: new Date().toISOString(),
        isPending: true,
      },
    ])

    try {
      await connection.invoke('SendMessage', trimmed, messageId)
      await connection.invoke('UpdateChatList')

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isPending: false } : msg))
      )
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      alert('Не удалось отправить сообщение')
    }
  }

  const closeChat = async () => {
    if (connection) {
      try {
        await connection.stop()
      } catch (error) {
        console.error('Ошибка при остановке соединения:', error)
      } finally {
        setConnection(null)
        setChatRoom('')
        setMessages([])
      }
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        connection,
        chatRoom,
        userChats,
        showCreateModal,
        showJoinModal,
        isChatLoading,
        loadUserChats,
        createChat,
        setShowCreateModal,
        setShowJoinModal,
        setNewChatName,
        joinChat,
        sendMessage,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat должен использоваться внутри ChatProvider')
  }
  return context
}
