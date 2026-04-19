// ============================================
// MAIN.JS - Point d'entrée du jeu
// ============================================

import { UIManager } from "./managers/UIManager.js";
import { GameManager } from "./managers/GameManager.js";
import { ScoreManager } from "./managers/ScoreManager.js";

class Puissance4Game {
  constructor(onScoreUpdate, onGameOver) {
    this.controller = new AbortController();
    this.uiManager = new UIManager(this.controller.signal);
    this.scoreManager = new ScoreManager(onScoreUpdate, onGameOver);
    this.gameManager = new GameManager(this.uiManager, this.scoreManager);
  }

  /**
   * Initialise le jeu
   */
  init() {
    // Initialiser l'interface
    this.uiManager.init();

    // Attacher les callbacks
    this.uiManager.onColumnClick = (col) => this.handleColumnClick(col);
    this.uiManager.onPlayAgain = () => this.handlePlayAgain();
    this.uiManager.onMainMenu = () => this.handleMainMenu();

    // Ajouter un écouteur pour le bouton "Démarrer"
    const startBtn = document.querySelector("#start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => this.handleStartGame(), {
        signal: this.controller.signal,
      });
    }

    // Afficher l'écran d'accueil
    this.uiManager.showHomeScreen();

    console.log("Puissance 4 - Jeu démarré!");
  }

  /**
   * Lance une nouvelle partie au niveau 1
   */
  handleStartGame() {
    this.gameManager.startNewGame(1); // Toujours commencer au niveau 1
  }

  /**
   * Gère un clic sur une colonne
   */
  handleColumnClick(col) {
    this.gameManager.playerMove(col);
  }

  /**
   * Gère le bouton "Continuer" ou "Recommencer"
   */
  handlePlayAgain() {
    this.gameManager.handlePlayAgain();
  }

  /**
   * Gère le bouton "Menu Principal"
   */
  handleMainMenu() {
    this.gameManager.returnToHome();
  }

  /**
   * Nettoie le jeu (timers, écouteurs d'événements, etc.)
   */
  destroy() {
    this.controller.abort(); // supprime tous les addEventListener liés au signal
    this.gameManager.returnToHome();
  }
}

/**
 * Initialise Puissance4 dans le DOM courant.
 * Doit être appelé après que le composant React a monté les éléments HTML.
 * @param {function} onScoreUpdate - callback(score) appelé à chaque mise à jour de score
 * @param {function} onGameOver - callback(finalScore) appelé à la fin de chaque partie
 * @returns {{ destroy: function }} - objet avec une méthode destroy pour le cleanup
 */
export function initPuissance4(onScoreUpdate, onGameOver) {
  const game = new Puissance4Game(onScoreUpdate, onGameOver);
  game.init();
  return { destroy: () => game.destroy() };
}

// Démarrer le jeu au chargement de la page (mode standalone)
if (typeof document !== "undefined" && document.readyState !== "loading") {
  // Ne pas auto-démarrer si importé comme module par React
} else if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Mode standalone uniquement (fichier index.html ouvert directement)
    if (
      document.querySelector("#puissance4-container") &&
      !window.__puissance4React
    ) {
      const game = new Puissance4Game(null, null);
      game.init();
    }
  });
}
