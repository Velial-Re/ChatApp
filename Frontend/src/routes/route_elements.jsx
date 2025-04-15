import { lazyImport } from "./lazy_import";
import { LazyLoader } from "./lazy_loading.jsx";

export const WelcomeScreen = () => (
    <div className="welcome-screen">
        <h2 className="welcome-screen__title">Добро пожаловать в Web Chat</h2>
        <p>Выберите чат из списка</p>
    </div>
);

export const ROUTE_ELEMENTS = {
    AUTH: (
        <LazyLoader>
            <lazyImport.AuthPage />
        </LazyLoader>
    ),
    LOGIN_FORM: (
        <LazyLoader>
            <lazyImport.LoginForm />
        </LazyLoader>
    ),
    REGISTRATION_FORM: (
        <LazyLoader>
            <lazyImport.RegistrationForm />
        </LazyLoader>
    ),
    CHAT_PAGE: (
        <LazyLoader>
            <lazyImport.ChatPage />
        </LazyLoader>
    ),
    MAIN: (
        <LazyLoader>
            <lazyImport.MainPage />
        </LazyLoader>
    ),
    CHAT_DASHBOARD: (
        <LazyLoader>
            <lazyImport.ChatDashboard />
        </LazyLoader>
    ),
    CHAT: (
        <LazyLoader>
            <lazyImport.Chat />
        </LazyLoader>
    ),
    WELCOME: <WelcomeScreen />,
    PROTECTED_MAIN: (
        <LazyLoader>
            <lazyImport.ProtectedRoute>
                <lazyImport.MainPage />
            </lazyImport.ProtectedRoute>
        </LazyLoader>
    )
};