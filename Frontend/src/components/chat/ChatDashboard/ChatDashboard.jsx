import {useChat} from "../../../context/ChatContext";
import {useCallback, useEffect, useState} from "react";
import {CreateChatModal} from "../../modals/chatModal/CreateChatModal/CreateChatModal";
import {JoinChatModal} from "../../modals/chatModal/JoinChatModal/JoinChatModal";
import {useNavigate} from "react-router-dom";
import {UserPanel} from "../../UserPanel/UserPanel.jsx";


export default function ChatDashboard() {
    const {
        userChats,
        loadUserChats,
        showCreateModal,
        setShowCreateModal,
        showJoinModal,
        setShowJoinModal,
        joinChat
    } = useChat();

    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchUserChats = useCallback(async () => {
        setLoadingError(null);
        setIsLoading(true);
        try {
            await loadUserChats();
        } catch (e) {
            setLoadingError("Не удалось загрузить чаты. Попробуйте позже.");
            console.error("Failed to load user chats", e);
        } finally {
            setIsLoading(false);
        }
    }, [loadUserChats]);
    useEffect(() => {
        fetchUserChats();
    }, [fetchUserChats]);

    const onJoinChat = (chatName) => {
        joinChat(chatName, true);
        navigate(`/chat/${chatName}`);
    };

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h2 className="dashboard__title">Чаты</h2>
            </div>

            <div className="dashboard__actions">
                <button
                    className="dashboard__action"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="">Создать чат</i>
                </button>
                <button
                    className="dashboard__action"
                    onClick={() => setShowJoinModal(true)}
                >
                    <i className="">Присоединиться</i>
                </button>
            </div>

            <div className="dashboard__chats-list">
                {isLoading && <p className="loading-message">Загрузка чатов...</p>}
                {loadingError && <p className="error-message">{loadingError}</p>}
                {!isLoading && !loadingError && userChats.map(chat => (
                    <div
                        key={chat.id}
                        className={`chat-item ${chat.isActive ? "active" : ""}`}
                        onClick={() => onJoinChat(chat.name)}
                    >
                        <h3># {chat.name}</h3>
                        <p>{chat.lastMessage || "Нет сообщений"}</p>
                    </div>
                ))}
            </div>
            <UserPanel/>
            {showCreateModal && <CreateChatModal/>}
            {showJoinModal && <JoinChatModal/>}
        </div>
    );
};