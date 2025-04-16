import {useAuth} from '../../context/AuthContext.jsx'
import {useChat} from '../../context/ChatContext.jsx'
import {useEffect, useState} from 'react'

export const UserPanel = () => {
    const {user, logout} = useAuth()
    const {closeChat} = useChat()
    const [username, setUsername] = useState('')

    useEffect(() => {
        if (user?.username) {
            setUsername(user.username)
        }
    }, [user])
    const onLogout = () => {
        closeChat()
        logout()
    }

    return (
        <div className="user-panel">
            <div className="user__info">
                <div className="user-panel__username">{username || 'Загрузка...'}</div>
            </div>

            <div className="user__actions">
                <button className="actions__settings">Настройки</button>
                <button className="actions__logout" onClick={onLogout}>
                    Выход
                </button>
            </div>
        </div>
    )
}
