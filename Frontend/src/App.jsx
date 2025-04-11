import {AuthProvider, useAuth} from "./context/AuthContext.jsx";
import {ChatProvider} from "./context/ChatContext.jsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import ChatPage from "./components/chat/ChatPage/ChatPage.jsx";
import {MainPage} from "./pages/MainPage/MainPage.jsx";

function AppWrapper() {
    return (
        <AuthProvider>
            <ChatProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </ChatProvider>
        </AuthProvider>
    );
}

function AppContent() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/auth/*" element={<AuthPage/>}/>
            <Route path="/" element={
                <ProtectedRoute>
                    <MainPage/>
                </ProtectedRoute>
            }>
                <Route index element={
                    <div className="welcome-screen">
                        <h2 className="welcome-screen__title">Добро пожаловать в Web Chat</h2>
                        <p>Выберите чат из списка</p>
                    </div>
                }/>
                <Route path="chat/:chatName" element={<ChatPage/>}/>
            </Route>
            <Route path="/login" element={<Navigate to="/auth/login" replace/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default AppWrapper;