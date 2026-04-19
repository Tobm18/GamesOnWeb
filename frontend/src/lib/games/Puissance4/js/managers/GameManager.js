// ============================================
// CLASSE GAMEMANAGER - Gestion du flux du jeu
// ============================================

import { Board } from "../entities/Board.js";
import { Player } from "../entities/Player.js";
import { Bot } from "../entities/Bot.js";
import {
  PLAYERS,
  LEVELS,
  LEVEL_INFO,
  RESULT,
  GAME_CONFIG,
} from "../utils/constants.js";
import { isBoardFull } from "../utils/helpers.js";

export class GameManager {
  constructor(uiManager, scoreManager) {
    this.ui = uiManager;
    this.scoreManager = scoreManager;

    this.board = null;
    this.human = new Player("Joueur", PLAYERS.HUMAN);
    this.bot = null;
    this.currentPlayer = PLAYERS.HUMAN;
    this.gameActive = false;
    this.currentLevel = LEVELS.BEGINNER; // Commence au niveau 1

    this.moveStartTime = null;
    this.timerInterval = null;
    this.botTimeout = null;
    this.botThinking = false;
    this.gameOverTimeout = null;
    this.lastGameResult = null;
  }

  /**
   * Démarre une nouvelle partie
   */
  startNewGame(level, resetSessionScore = true) {
    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }

    this.currentLevel = level;
    this.bot = new Bot(level);
    this.board = new Board();
    this.currentPlayer = PLAYERS.HUMAN;
    this.gameActive = true;
    this.botThinking = false;

    if (resetSessionScore) {
      this.scoreManager.resetSessionScore();
    }

    this.ui.showGameScreen();
    this.ui.resetGame();
    this.ui.updateLevelDisplay(level);

    this.startMoveTimer();
  }

  /**
   * Traite un coup du joueur
   */
  async playerMove(col) {
    if (
      !this.gameActive ||
      this.currentPlayer !== PLAYERS.HUMAN ||
      this.botThinking
    ) {
      return;
    }

    // Vérifier que la colonne est valide
    if (this.board.isColumnFull(col)) {
      this.ui.showNotification("Colonne pleine!");
      return;
    }

    // Stopper le timer immédiatement dès que le coup est validé,
    // avant l'animation, pour éviter tout tir parasite.
    this.stopMoveTimer();

    // Verrouiller immédiatement les entrées pour éviter les multi-clics pendant l'animation.
    this.botThinking = true;
    this.ui.disableColumnButtons(true);

    // Effectuer le coup
    const result = this.board.dropPiece(col, PLAYERS.HUMAN);
    if (!result) {
      this.botThinking = false;
      this.ui.disableColumnButtons(false);
      this.startMoveTimer();
      return;
    }

    const { row } = result;

    // Afficher le pion
    await this.ui.addPiece(row, col, PLAYERS.HUMAN);

    // Vérifier victoire
    const winningCells = this.board.checkWin(row, col, PLAYERS.HUMAN);
    if (winningCells) {
      this.ui.highlightWinningCells(winningCells);
      this.endGame(RESULT.HUMAN_WIN);
      return;
    }

    // Vérifier match nul
    if (this.board.isFull()) {
      this.endGame(RESULT.DRAW);
      return;
    }

    // Tour du Bot
    this.currentPlayer = PLAYERS.Bot;
    this.playBot();
  }

  /**
   * Lance le tour du Bot
   */
  playBot() {
    this.botThinking = true;
    this.ui.disableColumnButtons(true);

    const reactionTime = LEVEL_INFO[this.currentLevel].reactionTime;

    this.botTimeout = setTimeout(async () => {
      this.botTimeout = null;

      // Annuler si la partie a été arrêtée pendant le délai de réaction
      if (!this.gameActive) return;

      const col = this.bot.getMove(this.board.getGrid());

      const result = this.board.dropPiece(col, PLAYERS.Bot);
      if (!result) {
        this.botThinking = false;
        this.playBot();
        return;
      }

      const { row } = result;

      await this.ui.addPiece(row, col, PLAYERS.Bot);

      // Vérifier que la partie est toujours active après l'animation
      if (!this.gameActive) return;

      // Vérifier victoire
      const winningCells = this.board.checkWin(row, col, PLAYERS.Bot);
      if (winningCells) {
        this.ui.highlightWinningCells(winningCells);
        this.endGame(RESULT.BOT_WIN);
        return;
      }

      // Vérifier match nul
      if (this.board.isFull()) {
        this.endGame(RESULT.DRAW);
        return;
      }

      // Retour au joueur
      this.currentPlayer = PLAYERS.HUMAN;
      this.botThinking = false;
      this.ui.disableColumnButtons(false);
      this.startMoveTimer();
    }, reactionTime);
  }

  /**
   * Finit la partie
   */
  endGame(result) {
    this.gameActive = false;
    this.stopMoveTimer();
    this.ui.disableColumnButtons(true);
    this.lastGameResult = result;

    let timeTaken = 0;
    if (this.moveStartTime) {
      timeTaken = Date.now() - this.moveStartTime;
    }

    // Enregistrer le score et notifier React
    this.scoreManager.addScore(this.currentLevel, timeTaken, result);

    // Mettre à jour les stats du joueur
    if (result === RESULT.HUMAN_WIN) {
      this.human.recordWin();
    } else if (result === RESULT.BOT_WIN) {
      this.human.recordLoss();
    } else {
      this.human.recordDraw();
    }

    // Laisser la grille affichée un court instant pour voir le quatuor gagnant
    this.gameOverTimeout = setTimeout(() => {
      this.ui.showGameOverScreen(this.currentLevel, result);
      this.ui.showGameOverMessage(result);

      this.gameOverTimeout = null;
    }, 1800);
  }

  /**
   * Gère le timer de coup
   */
  startMoveTimer() {
    // Sécurité : arrêter tout timer précédent avant d'en démarrer un nouveau
    this.stopMoveTimer();
    this.moveStartTime = Date.now();
    // Réinitialiser l'affichage immédiatement
    this.ui.updateTimer(GAME_CONFIG.TIMER_DURATION);

    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.moveStartTime;
      const remaining = GAME_CONFIG.TIMER_DURATION - elapsed;

      this.ui.updateTimer(remaining);

      if (remaining <= 0) {
        this.stopMoveTimer();

        if (!this.gameActive) return;

        if (this.currentPlayer === PLAYERS.HUMAN) {
          // Coup auto du joueur (aléatoire)
          const validCols = this.board.getValidColumns();
          const randomCol =
            validCols[Math.floor(Math.random() * validCols.length)];
          this.playerMove(randomCol);
        }
      }
    }, 100);
  }

  /**
   * Arrête le timer
   */
  stopMoveTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.botTimeout) {
      clearTimeout(this.botTimeout);
      this.botTimeout = null;
    }
  }

  /**
   * Obtient les stats du joueur
   */
  getPlayerStats() {
    return this.human.getStats();
  }

  /**
   * Retourne à l'écran d'accueil
   */
  returnToHome() {
    this.gameActive = false;
    this.stopMoveTimer(); // annule aussi botTimeout
    if (this.gameOverTimeout) {
      clearTimeout(this.gameOverTimeout);
      this.gameOverTimeout = null;
    }
    this.ui.disableColumnButtons(false);
    this.currentLevel = LEVELS.BEGINNER; // Réinitialiser au niveau 1
    this.ui.showHomeScreen();
  }

  /**
   * Passe au niveau suivant et recommence
   */
  playNextLevel() {
    if (this.currentLevel < LEVELS.MASTER) {
      this.currentLevel++;
    } else {
      // Si au dernier niveau, recommencer au niveau 1
      this.currentLevel = LEVELS.BEGINNER;
    }
    this.startNewGame(this.currentLevel, false);
  }

  /**
   * Relance la partie après l'écran de fin
   */
  handlePlayAgain() {
    if (this.lastGameResult === RESULT.BOT_WIN) {
      this.startNewGame(LEVELS.BEGINNER, true);
      return;
    }

    this.playNextLevel();
  }

  /**
   * Vérifie si un niveau suivant existe
   */
  hasNextLevel() {
    return this.currentLevel < LEVELS.MASTER;
  }

  /**
   * Obtient le prochain niveau
   */
  getNextLevel() {
    return this.currentLevel < LEVELS.MASTER
      ? this.currentLevel + 1
      : LEVELS.BEGINNER;
  }
}
