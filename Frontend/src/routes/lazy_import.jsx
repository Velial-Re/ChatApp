import {lazy} from "react";

export const lazyImport = {
    AuthPage: lazy(() => import("../pages/AuthPage/AuthPage.jsx")),
    ChatPage: lazy(() => import("../pages/ChatPage/ChatPage.jsx")),
    MainPage: lazy(() => import("../pages/MainPage/MainPage.jsx")),
    LoginForm: lazy(() => import("../components/auth/LoginForm/LoginForm.jsx")),
    RegistrationForm: lazy(() => import("../components/auth/RegistrationForm/RegistrationForm.jsx")),
    Chat: lazy(() => import("../components/chat/Chat/Chat.jsx")),
    ChatDashboard: lazy(() => import("../components/chat/ChatDashboard/ChatDashboard.jsx")),
    ProtectedRoute: lazy(() => import("../components/ProtectedRoute/ProtectedRoute.jsx"))
};