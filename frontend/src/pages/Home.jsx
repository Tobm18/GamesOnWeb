import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)

  const games = [
    { id: 'cyberquest', title: 'CyberQuest', description: "Plongez dans un univers futuriste rempli d'aventures et de défis.", score: '15,420', img: '/assets/cyberquest.jpg' },
    { id: 'fantasy', title: 'Fantasy Realm', description: 'Explorez des royaumes magiques et combattez des créatures légendaires.', score: '23,890', img: '/assets/fantasy.jpg' },
    { id: 'space', title: 'Space Odyssey', description: 'Partez à la conquête de l\'espace et découvrez de nouvelles planètes.', score: '31,200', img: '/assets/space.jpg' }
  ]

  const rotateCarousel = (direction) => {
    setCurrentCard((prev) => (prev + direction + games.length) % games.length)
  }

  async function handlePlayClick(gameName) {
    localStorage.setItem('selectedGame', gameName)
    if (user) {
      navigate('/game')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="home-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main>
        <section className="introduction">
          <div className="welcome-content">
            <h2 className="welcome-title">Bienvenue à Games on Web</h2>
            <h1 className="welcome-year">2026</h1>
            <p className="welcome-subtitle">Découvrez les trois jeux de Tom BALLESTER pour l'édition de cette année.</p>
          </div>
          <div className="scroll-indicator" onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="arrow-down"><span></span><span></span><span></span></div>
            <p className="scroll-text">Découvrir les jeux</p>
          </div>
        </section>

        <section className="games" id="games-section">
          <h2>Les jeux de cette année</h2>
          <div className="carousel-container">
            <button className="carousel-btn prev-btn" onClick={() => rotateCarousel(-1)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="carousel-wrapper">
              <div className="carousel">
                {games.map((game, index) => {
                  const position = (index - currentCard + games.length) % games.length
                   return (
                    <div
                      key={game.id}
                      className={`game-card ${position === 0 ? 'active' : ''}`}
                      style={{ '--position': position }}
                    >
                      <div className="game-card-background" style={{ backgroundImage: `url('${game.img}')` }}></div>
                      <div className="game-card-content">
                        <div className="game-score">Meilleur Score: <span>{game.score}</span></div>
                        <h3>{game.title}</h3>
                        <p>{game.description}</p>
                        <button className="play-btn" onClick={() => handlePlayClick(game.id)}>Jouer</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button className="carousel-btn next-btn" onClick={() => rotateCarousel(1)}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>
        <Spinner show={loading} />
      </main>
    </div>
  )
}
