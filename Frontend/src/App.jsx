import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/routes.jsx'

const AppWrapper = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  )
}

const AppContent = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <AppRoutes />
}

export default AppWrapper
