// ============================================
// MAIN.JS - Point d'entrée du jeu
// ============================================

import { UIManager } from './managers/UIManager.js';
import { GameManager } from './managers/GameManager.js';
import { ScoreManager } from './managers/ScoreManager.js';

class Puissance4Game {
  constructor() {
    this.uiManager = new UIManager();
    this.scoreManager = new ScoreManager();
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
    const startBtn = document.querySelector('#start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStartGame());
    }

    // Afficher l'écran d'accueil
    this.uiManager.showHomeScreen();

    console.log('🎮 Puissance 4 - Jeu démarré!');
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
}

// Démarrer le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  const game = new Puissance4Game();
  game.init();
});
