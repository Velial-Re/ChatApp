import { memo } from 'react'

export const Message = memo(({ userName, message, isOwn }) => {
  const displayName = isOwn ? 'Вы' : userName
  return (
    <div className={`message ${isOwn ? 'message--own' : ''}`}>
      <span className="message__username">{displayName}:</span>
      <div className="message__content">
        {message}
      </div>
    </div>
  )
})
