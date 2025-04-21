import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { joinChat } from '../../../store/chat/chatThunks.js'

export const WaitingRoom = () => {
  const [userName, setUserName] = useState('')
  const [chatRoom, setChatRoom] = useState('')
  const dispatch = useDispatch()

  const onSubmit = (e) => {
    e.preventDefault()
    if (!userName.trim() || !chatRoom.trim()) {
      alert('Имя и название чата не могут быть пустыми')
      return
    }
    dispatch(joinChat({ userName: userName.trim(), chatRoom: chatRoom.trim() }))
  }

  return (
    <form className="waiting-room__form">
      <h2 className="waiting-room__title">Web chat</h2>
      <div className="form__group">
        <label className="form__label">Введите ваше имя</label>
        <input
          className="form__input"
          onChange={(e) => setUserName(e.target.value)}
          type="text"
          placeholder="Введите ваше имя"
        />
      </div>
      <div className="form__group">
        <label className="form__label">Название чата</label>
        <input
          className="form__input"
          onChange={(e) => setChatRoom(e.target.value)}
          type="text"
          placeholder="Введите название чата"
        />
      </div>
      <button onClick={onSubmit} type="submit" className="form__button">
        Присоединиться
      </button>
    </form>
  )
}
