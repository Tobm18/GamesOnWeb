import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Game() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const gameContainerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (loading) return

    const storedGame = localStorage.getItem('selectedGame')
    if (!storedGame) {
      navigate('/')
      return
    }

    if (!user) {
      navigate('/login')
    } 
  }, [user, loading, navigate])

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return
    
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const selectedGame = localStorage.getItem('selectedGame')
  const gameNames = { 'keep-it-alive': 'Keep It Alive', fantasy: 'Fantasy Realm', space: 'Space Odyssey' }

  return (
    <div className="game-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main style={{ height: selectedGame === 'keep-it-alive' ? '85vh' : 'auto' }}>
        {selectedGame === 'keep-it-alive' ? (
          <div className="keep-it-alive-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="game-controls" style={{ padding: '0 2vw 10px 2vw', display: 'flex', gap: '15px' }}>
              <button className="control-btn" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left"></i> Retour à l'accueil
              </button>
              <button className="control-btn" onClick={toggleFullscreen}>
                <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              </button>
            </div>
            <div className="keep-it-alive-frame-container" ref={gameContainerRef} style={{ flex: 1, padding: '0 2vw 2vw 2vw', position: 'relative' }}>
              <iframe 
                src="/games/keep-it-alive/index.html" 
                title="Keep It Alive"
                allow="fullscreen"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: '2px solid rgba(0, 170, 255, 0.5)', 
                  borderRadius: '15px',
                  background: '#000',
                  boxShadow: '0 0 30px rgba(0, 170, 255, 0.2)',
                  display: 'block'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="coming-soon-container">
            <div className="game-info">
              <div className="game-icon">
                <i className="fa-solid fa-gamepad"></i>
              </div>
              <h1 className="game-title">{selectedGame ? (gameNames[selectedGame] || 'Jeu') : 'Jeu'}</h1>
              <div className="coming-soon-badge">
                <span className="badge-text">Coming Soon</span>
              </div>
              <p className="coming-soon-message">
                Ce jeu sera bientôt disponible !<br />
                Restez connecté pour ne pas manquer son lancement.
              </p>
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-home"></i> Retour à l'accueil
                </button>
                <button className="btn-secondary">
                  <i className="fa-solid fa-bell"></i> Me notifier
                </button>
              </div>
            </div>
            <div className="decoration-line"></div>
          </div>
        )}
      </main>
    </div>
  )
}