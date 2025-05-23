import React from 'react'
import { CloseButton } from '../../UI/CloseButton.jsx'

const Modal = ({ active, setActive, children, title }) => {
  return (
    <div className={active ? 'modal active' : 'modal'} onClick={() => setActive(false)}>
      <div
        className={active ? 'modal__wrapper active' : 'modal__wrapper'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <CloseButton onClick={() => setActive(false)} />
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
