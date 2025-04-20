import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user)
  const isLoading = useSelector((state) => state.auth.isLoading)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login')
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  return children
}
