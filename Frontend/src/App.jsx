import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store/store.js'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/routes.jsx'
import { useEffect } from 'react'
import { fetchUserAction } from './store/auth/authActions'

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
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
