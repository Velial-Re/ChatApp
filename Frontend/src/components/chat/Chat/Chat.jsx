// Chat.jsx
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessage } from '@/store/chat/chatThunks.js'
import { selectMessages, selectCurrentRoom } from '@/store/chat/chatSelectors.js'
import { Message } from '../Message/Message.jsx'

export default function Chat() {
  const dispatch = useDispatch()
  const messages = useSelector(selectMessages)
  const chatRoom = useSelector(selectCurrentRoom)
  const [message, setMessage] = useState('')
  const messageEndRef = useRef(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (message.trim()) {
      dispatch(sendMessage(message))
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="chat-title">{chatRoom}</h2>
      </div>
      <div className="chat__messages-list">
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
        <span ref={messageEndRef} />
      </div>
      <div className="chat__input-container">
        <input
          className="chat__input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение"
        />
        <button className="chat__button" onClick={handleSend}>Отправить</button>
      </div>
    </div>
  )
}
