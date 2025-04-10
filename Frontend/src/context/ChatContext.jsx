import {createContext, useCallback, useContext, useState} from 'react'
import * as signalR from "@microsoft/signalr";


const ChatContext = createContext();

export function ChatProvider({children}) {
    const [messages, setMessages] = useState([]);
    const [connection, setConnection] = useState(null);
    const [chatRoom, setChatRoom] = useState('');
    const [userChats, setUserChats] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    const loadUserChats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch("http://localhost:8080/api/chats/my", {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`)
            }
            const data = await response.json();
            setUserChats(data.map(chat => ({
                ...chat,
                lastMessage: chat.lastMessage || "Нет сообщений",
                isActive: chat.name === chatRoom
            })));
            return data;
        } catch (error) {
            console.error("Error loading user chats", error);
            throw error;
        }
    }, [chatRoom]);


    const createChat = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token is now found");

            if (!newChatName.trim()) {
                throw new Error("Chat name cannot be empty");
            }


            const response = await fetch("http://localhost:8080/api/chats/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newChatName.trim()
                }),
                credentials: "include"
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create chat");
            }
            const data = await response.json();
            await loadUserChats();
            await joinChat(localStorage.getItem("username"), data.name)
            setShowCreateModal(false);
            setNewChatName("");
            return data;
        } catch (error) {
            console.error("Chat creation error:", error);
            alert(error.message);
            throw error;
        }
    }

    const joinChat = async (userName, chatRoom) => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");


        if (connection) {
            try {
                await connection.stop();
                connection.off("ReceiveMessage");
                connection.off("UserJoined");
                connection.off("UserLeft");
            } catch (error) {
                console.error("Error closing previous connection:", error);
            }
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:8080/chat", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        newConnection.on("ReceiveMessage", (userName, message, messageId) => {
            console.log(`Received message: ${userName}, ${message} (id: ${messageId})`);
            setMessages(prev => {

                if (prev.some(msg => msg.id === messageId)) return prev;
                loadUserChats();
                return [...prev, {
                    userName,
                    message,
                    id: messageId,
                    timestamp: new Date().toISOString()
                }];
            });
        });

        newConnection.on("UpdateChatList", async () => {
            console.log("Chat list is updated");
            await loadUserChats();
        })
        newConnection.on("UserJoined", (userName) => {
            console.log(`${userName} joined`);
            setMessages(prev => [...prev, {
                userName: "System",
                message: `${userName} joined the chat`,
                id: crypto.randomUUID(),
                isSystem: true
            }]);
        });

        newConnection.on("UserLeft", (userName) => {
            console.log(`${userName} left`);
            setMessages(prev => [...prev, {
                userName: "System",
                message: `${userName} left the chat`,
                id: crypto.randomUUID(),
                isSystem: true
            }]);
        });

        try {
            await newConnection.start();
            console.log("SignalR connection established");

            await newConnection.invoke("JoinChat", {userName, chatRoom});

            await loadUserChats();


            const history = await newConnection.invoke("GetChatHistory", chatRoom);


            const uniqueHistory = history.reduce((acc, message) => {
                const exists = acc.some(m =>
                    m.userName === message.userName &&
                    m.content === message.content
                );
                if (!exists) {
                    acc.push({
                        userName: message.userName,
                        message: message.content,
                        id: crypto.randomUUID(),
                        timestamp: message.sentAt
                    });
                }
                return acc;
            }, []);

            setMessages(uniqueHistory);
            setConnection(newConnection);
            setChatRoom(chatRoom);
        } catch (error) {
            console.error("Connection failed:", error);
            setMessages([]);
            setConnection(null);
            setChatRoom('');
        }
    }

    const sendMessage = async (message) => {
        if (!connection || !message?.trim()) {
            console.error("No active connection or empty message");
            return;
        }

        const messageId = crypto.randomUUID();

        try {
            setMessages(mes => [...mes, {
                userName: "You",
                message: message.trim(),
                id: messageId,
                timestamp: new Date().toISOString(),
                isPending: true
            }])

            await connection.invoke("SendMessage", message.trim(), messageId);

            await connection.invoke("UpdateChatList");
            setMessages(mes => mes.map(msg =>
                msg.id === messageId ? {...msg, isPending: false} : msg))
        } catch (error) {
            console.error("Error sending message:", error);

            setMessages(msg => msg.filter(msg => msg.id !== messageId))
            alert("Failed to send message");
        }
    }

    const closeChat = async () => {
        if (connection) {
            try {
                await connection.stop();
            } catch (error) {
                console.error("Error stopping connection", error);
            } finally {
                setConnection(null);
            }
        }
    };
    return (
        <ChatContext.Provider value={{
            messages,
            connection,
            chatRoom,
            userChats,
            showCreateModal,
            showJoinModal,
            loadUserChats,
            createChat,
            setShowCreateModal,
            setShowJoinModal,
            setNewChatName,
            joinChat,
            sendMessage,
            closeChat
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    return useContext(ChatContext)
}