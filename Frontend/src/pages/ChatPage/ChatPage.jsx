import { useParams } from 'react-router-dom'
import { useChat } from '../../context/ChatContext.jsx'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { lazyImport } from '../../routes/lazy_import.jsx'

export default function ChatPage() {
  const { chatName } = useParams()
  const { joinChat, chatRoom } = useChat()
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    if (user && chatName && chatName !== chatRoom) {
      joinChat(chatName)
    }
  }, [chatName, joinChat, chatRoom, user])

  return (
    <div className="chat-page">
      {chatName === chatRoom ? (
        <lazyImport.Chat />
      ) : (
        <div className="loading-chat">Загрузка чата...</div>
      )}
    </div>
  )
}
