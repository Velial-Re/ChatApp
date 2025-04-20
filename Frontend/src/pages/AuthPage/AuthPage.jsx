import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LazyLoader } from '../../routes/lazy_loading'
import { lazyImport } from '../../routes/lazy_import'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('login')

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    if (path === 'login' || path === 'registration') {
      setActiveTab(path)
    }
  }, [location])

  const tabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/auth/${tab}`)
  }

  const renderForm = () => {
    switch (activeTab) {
      case 'login':
        return (
          <LazyLoader>
            <lazyImport.LoginForm />
          </LazyLoader>
        )
      case 'registration':
        return (
          <LazyLoader>
            <lazyImport.RegistrationForm />
          </LazyLoader>
        )
      default:
        return <Navigate to="login" replace />
    }
  }

  return (
    <div className="auth__container">
      <div className="auth__tabs">
        <button
          className={`auth__tab auth__tab--login ${activeTab === 'login' ? 'auth__tab--active' : ''}`}
          onClick={() => tabChange('login')}
        >
          Вход
        </button>
        <button
          className={`auth__tab auth__tab--registration ${activeTab === 'registration' ? 'auth__tab--active' : ''}`}
          onClick={() => tabChange('registration')}
        >
          Регистрация
        </button>
        <span className="auth__tabs-indicator" data-active-tab={activeTab} />
      </div>
      <div className="auth__form-container">{renderForm()}</div>
    </div>
  )
}
