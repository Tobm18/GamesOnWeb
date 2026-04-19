import React, { useEffect, useRef, forwardRef } from "react";
import "../../lib/games/Puissance4/css/styles.css";

const Puissance4 = forwardRef(({ onScoreUpdate, onGameOver, isFullscreen }, ref) => {
  const gameRef = useRef(null);
  // Keep a ref to the latest callback to avoid restarting the game on re-renders
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
    onGameOverRef.current = onGameOver;
  });

  useEffect(() => {
    // Marque le contexte React pour éviter le double-init en mode standalone
    window.__puissance4React = true;
    // Flag pour annuler l'init si le composant est démonté avant que
    // le dynamic import se resolve (évite le double-timer en StrictMode)
    let cancelled = false;

    import("../../lib/games/Puissance4/js/main.js").then(
      ({ initPuissance4 }) => {
        if (cancelled) return; // composant déjà démonté, on n'initialise pas
        const instance = initPuissance4(
          (score) => {
            if (onScoreUpdateRef.current) onScoreUpdateRef.current(score);
          },
          (finalScore) => {
            if (onGameOverRef.current) onGameOverRef.current(finalScore);
          },
        );
        gameRef.current = instance;
      },
    );

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      window.__puissance4React = false;
    };
  }, []); // empty deps – init once on mount only

  return (
    <div className="p4-scope">
      <div
        id="puissance4-container"
        style={{
          width: "100%",
          minHeight: isFullscreen ? "100vh" : "75vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Écran d'accueil */}
        <div id="home-screen">
          <h1>PUISSANCE 4</h1>
          <p>5 niveaux de difficulté</p>
          <p id="instructions">
            Commencez au niveau 1 et progressez à travers les 5 niveaux !
          </p>
          <div id="button-container">
            <button className="action-button" id="start-btn">
              Démarrer la Partie - Niveau 1
            </button>
          </div>
        </div>

        {/* Écran de jeu */}
        <div id="game-screen" style={{ display: "none" }}>
          <div id="game-header">
            <span id="level-display">Niveau: Débutant</span>
            <span id="timer-display">⏱️ 30s</span>
          </div>
          <div id="board"></div>
          <div id="column-buttons"></div>
          <div id="level-selector"></div>
        </div>

        {/* Écran de fin de partie */}
        <div id="game-over-screen" style={{ display: "none" }}>
          <h2 id="game-result-message">🎉 Vous avez gagné !</h2>
          <div id="challenge-message">
            <p>Prêt pour un nouveau défi ?</p>
          </div>
          <div>
            <button className="action-button" id="play-again-btn">
              Recommencer une partie au niveau 1 - Débutant
            </button>
          </div>
          <div>
            <button className="action-button" id="main-menu-btn">
              Menu Principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
},
);

Puissance4.displayName = "Puissance4";
export default Puissance4;
