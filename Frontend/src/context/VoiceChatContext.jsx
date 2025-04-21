import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as signalR from '@microsoft/signalr'
import { setVoiceParticipants } from '@/store/chat/chatActions' // экшен для обновления участников

const VoiceChatContext = createContext()

export const VoiceChatProvider = ({ children }) => {
  const [voiceConnection, setVoiceConnection] = useState(null)
  const [isInVoiceChat, setIsInVoiceChat] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})

  const user = useSelector((state) => state.auth.user)
  const chatRoom = useSelector((state) => state.chat.currentChatRoom) // получаем название текущего чата из Redux
  const dispatch = useDispatch()

  const joinVoiceChat = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setLocalStream(stream)

      const connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:8080/voiceHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build()

      connection.on('UserJoinedVoice', (userId) => {
        dispatch(setVoiceParticipants((prev) => [...prev, userId]))
      })

      connection.on('UserLeftVoice', (userId) => {
        dispatch(setVoiceParticipants((prev) => prev.filter((id) => id !== userId)))
        setRemoteStreams((prev) => {
          const newStreams = { ...prev }
          delete newStreams[userId]
          return newStreams
        })
      })

      connection.on('ReceiveVoiceSignal', (userId, signal) => {
        onSignal(userId, signal)
      })

      await connection.start()
      await connection.invoke('JoinVoiceChat', chatRoom, user.username)

      setVoiceConnection(connection)
      setIsInVoiceChat(true)
    } catch (error) {
      console.error('Error joining voice chat', error)
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
        setLocalStream(null)
      }
    }
  }, [chatRoom, user, dispatch, localStream])

  const leaveVoiceChat = useCallback(async () => {
    try {
      if (voiceConnection) {
        await voiceConnection.invoke('LeaveVoiceChat', chatRoom, user.username)
        await voiceConnection.stop()
        setVoiceConnection(null)
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
        setLocalStream(null)
      }

      setIsInVoiceChat(false)
      setRemoteStreams({})
      dispatch(setVoiceParticipants([])) // очищаем список участников через Redux
    } catch (error) {
      console.error('Error leaving voice chat', error)
    }
  }, [voiceConnection, chatRoom, user, localStream, dispatch])

  const onSignal = useCallback((userId, signal) => {
    // Обработка сигнала WebRTC
  }, [])

  useEffect(() => {
    return () => {
      if (voiceConnection) {
        leaveVoiceChat()
      }
    }
  }, [voiceConnection, leaveVoiceChat])

  return (
    <VoiceChatContext.Provider
      value={{
        joinVoiceChat,
        leaveVoiceChat,
        isInVoiceChat,
        remoteStreams,
      }}
    >
      {children}
    </VoiceChatContext.Provider>
  )
}

export function useVoiceChat() {
  return useContext(VoiceChatContext)
}
