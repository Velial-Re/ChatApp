export const Message = ({userName, message, isPending}) => {
    return (
        <div className="message">
            <span className="message__username">{userName}: </span>
            <div className="message__content">
                {message}
                {isPending && <span className="message-status">(отправляется...)</span>}
            </div>
        </div>
    )
}
