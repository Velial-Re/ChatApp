import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { useChat } from './ChatContext.jsx'
import * as signalR from '@microsoft/signalr'

const VoiceChatContext = createContext()

export const VoiceChatProvider = ({ children }) => {
  const [voiceConnection, setVoiceConnection] = useState(null)
  const [isInVoiceChat, setIsInVoiceChat] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [voiceParticipants, setVoiceParticipants] = useState([])
  const [remoteStreams, setRemoteStreams] = useState({})
  
  const user = useSelector((state) => state.auth.user)
  const { chatRoom } = useChat()

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
        setVoiceParticipants((prev) => [...prev, userId])
      })

      connection.on('UserLeftVoice', (userId) => {
        setVoiceParticipants((prev) => prev.filter((id) => id !== userId))
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
  }, [chatRoom, user])

  const leaveVoiceChat = useCallback(async () => {
    if (voiceConnection) {
      await voiceConnection.invoke('LeaveVoiceChat', chatRoom, user.username)
      await voiceConnection.stop()
      setVoiceConnection(null)
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    setIsInVoiceChat(false)
    setVoiceParticipants([])
    setRemoteStreams({})
  }, [voiceConnection, chatRoom, user, localStream])

  const onSignal = useCallback((userId, signal) => {
    // обработка сигнала WebRTC
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
        voiceParticipants,
        localStream,
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
