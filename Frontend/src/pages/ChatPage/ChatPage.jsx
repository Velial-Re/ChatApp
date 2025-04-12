import {useParams} from 'react-router-dom'
import {Chat} from "../Chat/Chat.jsx";
import {useChat} from "../../../context/ChatContext.jsx";
import {useEffect} from "react";

export default function ChatPage() {
    const {chatName} = useParams()
    const {joinChat, chatRoom} = useChat();
    const {user} = useAuth();
    useEffect(() => {
        if (user && chatName && chatName !== chatRoom) {
            joinChat(chatName);
        }
    }, [chatName, joinChat, chatRoom]);
    return (
        <div className="chat-page">
            {chatName === chatRoom ? (
                <Chat/>
            ) : (
                <div className="loading-chat">Загрузка чата...</div>
            )}
        </div>
    )
}