import { createContext, useCallback, useContext, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuth } from './AuthContext.jsx'
import api from '../api/api.js'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [connection, setConnection] = useState(null)
  const [chatRoom, setChatRoom] = useState('')
  const [userChats, setUserChats] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newChatName, setNewChatName] = useState('')
  const { user, logout } = useAuth()

  const loadUserChats = useCallback(async () => {
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
      if (error.response?.status === 401) {
        logout()
        return
      }
      console.error('Error loading user chats', error)
      throw new Error('Failed to load user chats')
    }
  }, [chatRoom, logout])

  const createChat = async () => {
    try {
      if (!user) {
        throw new Error('User is not logged in')
      }

      if (!newChatName.trim()) {
        throw new Error('Chat name cannot be empty')
      }

      const response = await api.post('/chats/create', {
        name: newChatName.trim(),
      })

      await loadUserChats()
      await joinChat(user.username, response.data.name)

      setShowCreateModal(false)
      setNewChatName('')
      return response.data
    } catch (error) {
      console.error('Chat creation error:', error)
      alert(error.response?.data?.message || error.message)
      throw error
    }
  }

  const joinChat = async (chatRoom, isSwitching = false) => {
    if (!user) {
      throw new Error('User is not logged in')
    }

    if (connection) {
      try {
        connection.off('ReceiveMessage')
        connection.off('UserJoined')
        connection.off('UserLeft')
        await connection.stop()
      } catch (error) {
        console.error('Error closing previous connection:', error)
      }
    }

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
      console.log(
        `Received message: ${userName}, ${message} (id: ${messageId})`
      )
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

    newConnection.on('UpdateChatList', async () => {
      console.log('Chat list is updated')
      await loadUserChats()
    })

    if (!isSwitching) {
      newConnection.on('UserJoined', (userName) => {
        console.log(`${userName} joined`)
        setMessages((prev) => [
          ...prev,
          {
            userName: 'System',
            message: `${userName} joined the chat`,
            id: crypto.randomUUID(),
            isSystem: true,
          },
        ])
      })
    }

    newConnection.on('UserLeft', (userName) => {
      console.log(`${userName} left`)
      setMessages((prev) => [
        ...prev,
        {
          userName: 'System',
          message: `${userName} left the chat`,
          id: crypto.randomUUID(),
          isSystem: true,
        },
      ])
    })

    try {
      await newConnection.start()

      await newConnection.invoke(
        'JoinChat',
        { userName: user.username, chatRoom },
        isSwitching
      )

      await loadUserChats()

      const history = await newConnection.invoke('GetChatHistory', chatRoom)

      const formattedHistory = history.map((message) => ({
        userName: message.UserName,
        message: message.Content,
        id: crypto.randomUUID(),
        timestamp: message.SentAt,
        isSystem: false,
      }))

      setMessages(formattedHistory)
      setConnection(newConnection)
      setChatRoom(chatRoom)
    } catch (error) {
      console.error('Connection failed:', error)
      setMessages([])
      setConnection(null)
      setChatRoom('')
    }
  }

  const sendMessage = async (message) => {
    if (!connection || !message?.trim()) {
      console.error('No active connection or empty message')
      return
    }

    const messageId = crypto.randomUUID()

    try {
      setMessages((mes) => [
        ...mes,
        {
          userName: 'You',
          message: message.trim(),
          id: messageId,
          timestamp: new Date().toISOString(),
          isPending: true,
        },
      ])

      await connection.invoke('SendMessage', message.trim(), messageId)

      await connection.invoke('UpdateChatList')
      setMessages((mes) =>
        mes.map((msg) =>
          msg.id === messageId ? { ...msg, isPending: false } : msg
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)

      setMessages((msg) => msg.filter((msg) => msg.id !== messageId))
      alert('Failed to send message')
    }
  }

  const closeChat = async () => {
    if (connection) {
      try {
        await connection.stop()
      } catch (error) {
        console.error('Error stopping connection', error)
      } finally {
        setConnection(null)
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
  return useContext(ChatContext)
}
