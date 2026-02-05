import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AvatarPopup({ isVisible, onClose, user }) {
  const navigate = useNavigate()
  const popupRef = useRef(null)

  useEffect(() => {
    if (isVisible) {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose()
        }
      }
      const handleScroll = () => {
        onClose()
      }
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isVisible, onClose])

  return (
    <div className={`avatar-popup ${isVisible ? 'visible' : ''}`} ref={popupRef}>
      <div className="avatar-popup-content">
        {user ? (
          <p className="avatar-popup-message">
            <i className="fa-solid fa-circle-check"></i> Bienvenu <strong>{user.username}</strong>
            <br />
            <small className="popup-email">{user.email}</small>
          </p>
        ) : (
          <>
            <p className="avatar-popup-message">
              <i className="fa-solid fa-circle-xmark"></i> Vous n'êtes pas connectés
            </p>
            <button
              className="avatar-popup-btn"
              onClick={() => {
                navigate('/login')
                onClose()
              }}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Connexion
            </button>
          </>
        )}
      </div>
    </div>
  )
}