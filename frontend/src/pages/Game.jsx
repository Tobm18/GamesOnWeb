import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Game() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

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

  const selectedGame = localStorage.getItem('selectedGame')
  const gameNames = { cyberquest: 'CyberQuest', fantasy: 'Fantasy Realm', space: 'Space Odyssey' }

  return (
    <div className="game-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main>
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
      </main>
    </div>
  )
}