import React, { useEffect, useRef, useState, forwardRef } from "react";
import StartScreen from "../StartScreen";
import GameOver from "../GameOver";
import { initKeepItAlive } from "../../lib/games/keep-it-alive";

const KeepItAlive = forwardRef(
  ({ onScoreUpdate, onGameOver, isFullscreen }, ref) => {
    const gameContainerRef = ref || useRef(null);
    const canvasRef = useRef(null);
    const gameEngineRef = useRef(null);
    const isGameRunningRef = useRef(false);
    const [gameState, setGameState] = useState("start");
    const [currentScore, setCurrentScore] = useState(0);
    const [survivalMessage, setSurvivalMessage] = useState("");

    const onScoreUpdateRef = useRef(onScoreUpdate);
    const onGameOverRef = useRef(onGameOver);
    useEffect(() => {
      onScoreUpdateRef.current = onScoreUpdate;
    });
    useEffect(() => {
      onGameOverRef.current = onGameOver;
    });

    useEffect(() => {
      return () => {
        if (gameEngineRef.current) {
          gameEngineRef.current.cleanup();
          isGameRunningRef.current = false;
        }
        if (gameContainerRef.current) {
          gameContainerRef.current.classList.remove("hide-cursor");
        }
      };
    }, []);

    useEffect(() => {
      if (gameState === "playing" && canvasRef.current) {
        if (!gameEngineRef.current) {
          gameEngineRef.current = initKeepItAlive(
            canvasRef.current,
            (score) => {
              setCurrentScore(score);
              if (onScoreUpdateRef.current) onScoreUpdateRef.current(score);
            },
            (score, message) => {
              setSurvivalMessage(message);
              setGameState("gameOver");
              isGameRunningRef.current = false;
              if (gameContainerRef.current) {
                gameContainerRef.current.classList.remove("hide-cursor");
              }
              // Score final → DB uniquement ici
              if (onGameOverRef.current) onGameOverRef.current(score);
            },
          );
        }
        // Ne démarrer le jeu que s'il n'est pas déjà en cours
        if (!isGameRunningRef.current) {
          gameEngineRef.current.start();
          isGameRunningRef.current = true;
          if (gameContainerRef.current) {
            gameContainerRef.current.classList.add("hide-cursor");
          }
        }
      } else if (gameState !== "playing") {
        isGameRunningRef.current = false;
      }
    }, [gameState]); // callbacks via refs — no need in deps

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (gameState === "playing") {
          if (gameEngineRef.current) {
            gameEngineRef.current.handleKeyDown(e.code);
            if (
              [
                "Space",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
              ].includes(e.code)
            ) {
              e.preventDefault();
            }
          }
        } else if (gameState === "gameOver") {
          if (e.code === "Enter" || e.key === "Enter") {
            e.preventDefault();
            restartGame();
          }
        }
      };

      const handleKeyUp = (e) => {
        if (gameState === "playing" && gameEngineRef.current) {
          gameEngineRef.current.handleKeyUp(e.code);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [gameState]);

    const startGame = () => {
      setGameState("playing");
    };

    const restartGame = () => {
      isGameRunningRef.current = false;
      setCurrentScore(0);
      setGameState("playing");
    };

    const gameInfo = {
      title: "Keep It Alive",
      subtitle: "Survivez le plus longtemps possible !",
      controls: [
        { keys: ["ESPACE", "CLIC"], description: "pour sauter" },
        { keys: ["←", "→"], description: "pour se déplacer" },
      ],
      objectives: [
        "Collectez des points",
        "Évitez les obstacles",
        "Ne sortez pas de l'écran",
        "Attrapez les bonus",
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
            background: "linear-gradient(180deg, #0a0a1e 0%, #000000 100%)",
            borderRadius: isFullscreen ? "0" : "15px",
          }}
          onClick={() => gameEngineRef.current?.applyImpulse()}
        />

        {/* Game UI Overlays managed by React */}
        {gameState === "playing" && (
          <>
            <div className="game-score-overlay">{currentScore} pts</div>

            <div className="game-legend-overlay">
              <h4>BONUS</h4>
              <div className="legend-item">
                <span className="legend-icon shield">
                  <i className="fa-solid fa-shield"></i>
                </span>
                <span className="legend-text">Bouclier</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon slowmo">
                  <i className="fa-solid fa-clock"></i>
                </span>
                <span className="legend-text">Ralenti</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon doublepoints">
                  <i className="fa-solid fa-star"></i>
                </span>
                <span className="legend-text">Points x2</span>
              </div>
            </div>
          </>
        )}

        {gameState === "start" && (
          <StartScreen {...gameInfo} onStart={startGame} />
        )}

        {gameState === "gameOver" && (
          <GameOver
            score={currentScore}
            message={survivalMessage}
            onRestart={restartGame}
          />
        )}
      </div>
    );
  },
);

KeepItAlive.displayName = "KeepItAlive";

export default KeepItAlive;
