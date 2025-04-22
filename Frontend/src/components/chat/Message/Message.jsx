export const Message = ({ userName, message, isPending, isOwn }) => {
  const displayName = isOwn ? 'Вы' : userName

  return (
    <div className={`message ${isOwn ? 'message--own' : ''}`}>
      <span className="message__username">{displayName}: </span>
      <div className="message__content">
        {message}
        {isPending && <span className="message-status">(отправляется...)</span>}
      </div>
    </div>
  )
}
