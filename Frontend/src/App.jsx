import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store/store.js'
import { ChatProvider } from './context/ChatContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/routes.jsx'
import { useEffect } from 'react'
import { fetchUserAction } from './store/auth/authActions'


const AppWrapper = () => {
  return (
    <Provider store={store}>
      <ChatProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ChatProvider>
    </Provider>
  )
}

const AppContent = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.auth.isLoading)

  useEffect(() => {
    dispatch(fetchUserAction())
  }, [dispatch])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <AppRoutes />
}

export default AppWrapper
