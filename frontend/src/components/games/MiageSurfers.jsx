import React, { useEffect, useRef, useState, forwardRef } from "react";
import StartScreen from "../StartScreen";
import GameOver from "../GameOver";
import { Game } from "../../lib/games/MiageSurfers/src/Game";

const MiageSurfers = forwardRef(
  ({ onScoreUpdate, onGameOver, isFullscreen }, ref) => {
    const gameContainerRef = ref || useRef(null);
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const [gameState, setGameState] = useState("start");
    const [score, setScore] = useState(0);
    const [hudData, setHudData] = useState({
      score: 0,
      speedPct: 0,
      speedColor: "#00ffcc",
    });
    const [activePowerUp, setActivePowerUp] = useState(null);

    // Stable refs for callbacks
    const onScoreUpdateRef = useRef(onScoreUpdate);
    const onGameOverRef = useRef(onGameOver);
    useEffect(() => {
      onScoreUpdateRef.current = onScoreUpdate;
    });
    useEffect(() => {
      onGameOverRef.current = onGameOver;
    });

    // Track last sent score to avoid calling onScoreUpdate every single frame
    const lastSentScoreRef = useRef(0);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy();
          gameRef.current = null;
        }
      };
    }, []);

    // Initialize game when entering "playing" state
    useEffect(() => {
      if (gameState === "playing" && canvasRef.current && !gameRef.current) {
        gameRef.current = new Game(canvasRef.current, {
          onHudUpdate: (newScore, speedPct, speedColor) => {
            const floored = Math.floor(newScore);
            setHudData({ score: floored, speedPct, speedColor });
            // Only propagate when score actually changes (like keep-it-alive)
            if (floored !== lastSentScoreRef.current) {
              lastSentScoreRef.current = floored;
              if (onScoreUpdateRef.current) onScoreUpdateRef.current(floored);
            }
          },
          onGameOver: (finalScore) => {
            const floored = Math.floor(finalScore);
            setScore(floored);
            setGameState("gameOver");
            // Score final → DB uniquement ici
            if (onGameOverRef.current) onGameOverRef.current(floored);
          },
          onPowerUpChange: (type, active) => {
            setActivePowerUp(active ? type : null);
          },
        });
        gameRef.current.start();
      }
    }, [gameState]); // onScoreUpdate intentionally excluded — using ref instead

    const startGame = () => {
      setGameState("playing");
    };

    const restartGame = () => {
      // Détruire l'instance existante pour forcer le useEffect à en créer une propre
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      setHudData({ score: 0, speedPct: 0, speedColor: "#00ffcc" });
      setActivePowerUp(null);
      setScore(0);
      lastSentScoreRef.current = 0;
      setGameState("playing");
    };

    const powerUpLabels = {
      magnet: "🧲 Aimant",
      shield: "🛡️ Bouclier",
      speed: "⚡ Vitesse",
    };

    const gameInfo = {
      title: "Miage Surfers",
      subtitle: "Courez le plus loin possible !",
      controls: [
        { keys: ["←", "→"], description: "changer de lane" },
        { keys: ["↑", "ESPACE"], description: "sauter (double saut possible)" },
        { keys: ["↓"], description: "slider sous les tunnels" },
      ],
      objectives: [
        "Ramassez les pièces dorées",
        "Évitez les obstacles",
        "Collectez les power-ups",
        "Battez votre record de distance",
      ],
    };

    return (
      <div className="keep-it-alive-frame-container" ref={gameContainerRef}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#03030d",
            borderRadius: isFullscreen ? "0" : "15px",
          }}
        />

        {gameState === "playing" && (
          <>
            <div className="game-score-overlay">{hudData.score} pts</div>

            <div className="game-legend-overlay">
              <h4>VITESSE</h4>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${hudData.speedPct}%`,
                    background: hudData.speedColor,
                    transition: "width 0.3s, background 0.3s",
                    borderRadius: "4px",
                  }}
                />
              </div>
              {activePowerUp && (
                <div className="legend-item" style={{ marginTop: "10px" }}>
                  <span className="legend-text">
                    {powerUpLabels[activePowerUp]}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {gameState === "start" && (
          <StartScreen
            title={gameInfo.title}
            subtitle={gameInfo.subtitle}
            controls={gameInfo.controls}
            objectives={gameInfo.objectives}
            onStart={startGame}
          />
        )}

        {gameState === "gameOver" && (
          <GameOver score={score} onRestart={restartGame} />
        )}
      </div>
    );
  },
);

MiageSurfers.displayName = "MiageSurfers";
export default MiageSurfers;
