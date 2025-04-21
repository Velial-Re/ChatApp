import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { joinChatAction } from '@/store/chat/chatActions' // экшен для присоединения к чату
import { lazyImport } from '@/routes/lazy_import.jsx'

export default function ChatPage() {
  const { chatName } = useParams()
  const dispatch = useDispatch()

  const user = useSelector((state) => state.auth.user)
  const chatRoom = useSelector((state) => state.chat.currentChatRoom) // получаем текущий чат из Redux

  useEffect(() => {
    if (user && chatName && chatName !== chatRoom) {
      dispatch(joinChatAction(chatName)) // используем экшен для присоединения к чату
    }
  }, [chatName, dispatch, chatRoom, user])

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
