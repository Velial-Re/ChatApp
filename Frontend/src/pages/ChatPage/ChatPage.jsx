import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { joinChatAction } from '@/store/chat/chatActions'
import { lazyImport } from '@/routes/lazy_import.jsx'

export default function ChatPage() {
  const { chatName } = useParams()
  const dispatch = useDispatch()

  const user = useSelector((state) => state.auth.user)
  const chatRoom = useSelector((state) => state.chat.chatRoom)
  const isConnected = useSelector((state) => state.chat.isConnected)
  const isChatLoading = useSelector((state) => state.chat.isChatLoading)

  useEffect(() => {
    if (user && chatName && chatName !== chatRoom && !isConnected && !isChatLoading) {
      dispatch(joinChatAction({ roomName: chatName, isSwitching: true }))
    }
  }, [chatName, chatRoom, user, isConnected, isChatLoading, dispatch])

  return (
    <div className="chat-page">
      {isChatLoading ? (
        <div className="loading-chat">Загрузка чата...</div>
      ) : (
        chatRoom === chatName && isConnected ? (
          <lazyImport.Chat />
        ) : (
          <div className="loading-chat">Ошибка подключения...</div>
        )
      )}
    </div>
  )
}
