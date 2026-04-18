// ============================================
// CLASSE UIMANAGER - Gestion de l'interface
// ============================================

import {
  GAME_CONFIG,
  PLAYERS,
  LEVELS,
  LEVEL_INFO,
  RESULT,
  DOM_SELECTORS,
  CSS_CLASSES,
  GAME_STATES
} from '../utils/constants.js';
import { formatTime, formatScore } from '../utils/helpers.js';

export class UIManager {
  constructor() {
    this.container = document.querySelector(DOM_SELECTORS.container);
    this.homeScreen = document.querySelector(DOM_SELECTORS.homeScreen);
    this.gameScreen = document.querySelector(DOM_SELECTORS.gameScreen);
    this.gameOverScreen = document.querySelector(DOM_SELECTORS.gameOverScreen);
    this.board = document.querySelector(DOM_SELECTORS.board);
    this.columnButtons = document.querySelector(DOM_SELECTORS.columnButtons);
    this.levelSelector = document.querySelector(DOM_SELECTORS.levelSelector);

    this.currentState = GAME_STATES.HOME;
    this.onColumnClick = null;
    this.onLevelSelect = null;
    this.onPlayAgain = null;
    this.onMainMenu = null;
  }

  /**
   * Initialise l'interface
   */
  init() {
    this.createBoard();
    this.createColumnButtons();
    this.createLevelSelector();
    this.attachEventListeners();
  }

  /**
   * Crée la grille DOM
   */
  createBoard() {
    this.board.innerHTML = '';

    for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.COLS; col++) {
        const cell = document.createElement('div');
        cell.className = CSS_CLASSES.cell;
        cell.dataset.row = row;
        cell.dataset.col = col;
        this.board.appendChild(cell);
      }
    }
  }

  /**
   * Crée les boutons des colonnes
   */
  createColumnButtons() {
    this.columnButtons.innerHTML = '';

    for (let col = 0; col < GAME_CONFIG.COLS; col++) {
      const button = document.createElement('button');
      button.className = CSS_CLASSES.playColBtn;
      button.dataset.col = col;
      button.textContent = `📥 Col ${col + 1}`;
      
      button.addEventListener('click', () => {
        if (this.onColumnClick) {
          this.onColumnClick(col);
        }
      });

      this.columnButtons.appendChild(button);
    }
  }

  /**
   * Crée le sélecteur de niveaux
   */
  createLevelSelector() {
    // Pas de sélection manuelle de niveaux - progression automatique
    if (this.levelSelector) {
      this.levelSelector.innerHTML = '';
    }
  }

  /**
   * Affiche l'écran d'accueil
   */
  showHomeScreen() {
    this.homeScreen.style.display = 'block';
    this.gameScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
    this.currentState = GAME_STATES.HOME;
  }

  /**
   * Affiche l'écran de jeu
   */
  showGameScreen() {
    this.homeScreen.style.display = 'none';
    this.gameScreen.style.display = 'block';
    this.gameOverScreen.style.display = 'none';
    this.currentState = GAME_STATES.PLAYING;
  }

  /**
   * Affiche l'écran de fin de partie
   */
  showGameOverScreen(currentLevel, result) {
    this.homeScreen.style.display = 'none';
    this.gameScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'block';
    this.currentState = GAME_STATES.GAME_OVER;
    
    const playAgainBtn = document.querySelector(DOM_SELECTORS.playAgainBtn);
    if (!playAgainBtn) {
      return;
    }

    if (result === RESULT.HUMAN_WIN && currentLevel < LEVELS.MASTER) {
      const nextLevel = currentLevel + 1;
      const nextLevelName = LEVEL_INFO[nextLevel]?.name || '';
      playAgainBtn.textContent = `⬆️ Continuer vers le niveau ${nextLevel} - ${nextLevelName}`;
    } else {
      playAgainBtn.textContent = '🔄 Recommencer une partie au niveau 1 - Débutant';
    }
  }

  /**
   * Met à jour l'affichage de la grille
   */
  updateBoard(board) {
    const cells = document.querySelectorAll(`${DOM_SELECTORS.board} .${CSS_CLASSES.cell}`);

    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const value = board[row][col];

      cell.classList.remove(CSS_CLASSES.player, CSS_CLASSES.bot, CSS_CLASSES.empty);

      if (value === PLAYERS.HUMAN) {
        cell.classList.add(CSS_CLASSES.player);
      } else if (value === PLAYERS.Bot) {
        cell.classList.add(CSS_CLASSES.bot);
      } else {
        cell.classList.add(CSS_CLASSES.empty);
      }
    });
  }

  /**
   * Ajoute un pion avec animation
   */
  addPiece(row, col, player) {
    const cell = document.querySelector(
      `${DOM_SELECTORS.board} [data-row="${row}"][data-col="${col}"]`
    );

    if (!cell) return Promise.resolve();

    const className = player === PLAYERS.HUMAN ? CSS_CLASSES.player : CSS_CLASSES.bot;
    cell.classList.remove(CSS_CLASSES.empty, CSS_CLASSES.winning);
    cell.classList.add(className);

    // Animer la chute et notifier la fin pour synchroniser la logique de victoire.
    cell.style.animation = 'none';
    void cell.offsetWidth;
    cell.style.animation = 'fall 0.5s ease-in';

    return new Promise(resolve => {
      let resolved = false;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        cell.removeEventListener('animationend', onAnimationEnd);
        resolve();
      };

      const onAnimationEnd = event => {
        if (event.animationName === 'fall') {
          finish();
        }
      };

      cell.addEventListener('animationend', onAnimationEnd);
      setTimeout(finish, 550);
    });
  }

  /**
   * Souligne les 4 pions gagnants
   */
  highlightWinningCells(winningCells) {
    winningCells.forEach(({ r, c }) => {
      const cell = document.querySelector(
        `${DOM_SELECTORS.board} [data-row="${r}"][data-col="${c}"]`
      );
      if (cell) {
        // Libère l'animation inline de chute pour laisser l'animation de surbrillance s'appliquer.
        cell.style.animation = '';
        void cell.offsetWidth;
        cell.classList.add(CSS_CLASSES.winning);
      }
    });
  }

  /**
   * Met à jour le niveau affiché
   */
  updateLevelDisplay(level) {
    const display = document.querySelector(DOM_SELECTORS.levelDisplay);
    if (display) {
      display.textContent = `Niveau: ${LEVEL_INFO[level].name}`;
    }
  }

  /**
   * Met à jour le score affiché
   */
  updateScoreDisplay(score) {
    const display = document.querySelector(DOM_SELECTORS.scoreDisplay);
    if (display) {
      display.textContent = `Score: ${formatScore(score)} pts`;
    }
  }

  /**
   * Met à jour le meilleur score
   */
  updateBestScoreDisplay(bestScore) {
    const display = document.querySelector(DOM_SELECTORS.bestScoreDisplay);
    if (display) {
      display.textContent = `🏆 Meilleur: ${formatScore(bestScore)} pts`;
    }
  }

  /**
   * Met à jour le timer
   */
  updateTimer(timeLeft) {
    const display = document.querySelector(DOM_SELECTORS.timerDisplay);
    if (display) {
      const seconds = formatTime(timeLeft);
      display.textContent = `⏱️ ${seconds}s`;

      // Changer la couleur selon le temps restant
      display.style.color = '#3fb950'; // Vert
      if (seconds <= 10) display.style.color = '#d29922'; // Orange
      if (seconds <= 5) display.style.color = '#f85149'; // Rouge
    }
  }

  /**
   * Affiche le message de fin de partie
   */
  showGameOverMessage(result, finalScore, level) {
    const message = document.querySelector(DOM_SELECTORS.gameResultMessage);
    const finalScoreEl = document.querySelector(DOM_SELECTORS.finalScoreDisplay);

    if (message) {
      if (result === 'HUMAN_WIN') {
        message.textContent = '🎉 Vous avez gagné!';
        message.style.color = '#3fb950';
      } else if (result === 'BOT_WIN') {
        message.textContent = '❌ Le Bot a gagné!';
        message.style.color = '#f85149';
      } else {
        message.textContent = '🤝 Match nul!';
        message.style.color = '#58a6ff';
      }
    }

    if (finalScoreEl) {
      finalScoreEl.textContent = `+${formatScore(finalScore)} pts`;
    }
  }

  /**
   * Désactive les boutons de colonnes
   */
  disableColumnButtons(disable = true) {
    const buttons = document.querySelectorAll(`.${CSS_CLASSES.playColBtn}`);
    buttons.forEach(btn => {
      btn.disabled = disable;
    });
  }

  /**
   * Désactive une colonne spécifique (pleine)
   */
  disableColumn(col) {
    const button = document.querySelector(
      `.${CSS_CLASSES.playColBtn}[data-col="${col}"]`
    );
    if (button) {
      button.disabled = true;
      button.style.opacity = '0.5';
    }
  }

  /**
   * Réactive une colonne
   */
  enableColumn(col) {
    const button = document.querySelector(
      `.${CSS_CLASSES.playColBtn}[data-col="${col}"]`
    );
    if (button) {
      button.disabled = false;
      button.style.opacity = '1';
    }
  }

  /**
   * Réinitialise l'interface de jeu
   */
  resetGame() {
    // Réinitialiser les cellules
    const cells = document.querySelectorAll(`${DOM_SELECTORS.board} .${CSS_CLASSES.cell}`);
    cells.forEach(cell => {
      cell.classList.remove(CSS_CLASSES.player, CSS_CLASSES.bot, CSS_CLASSES.winning);
      cell.classList.add(CSS_CLASSES.empty);
      cell.style.animation = 'none';
    });

    // Réactiver tous les boutons
    const buttons = document.querySelectorAll(`.${CSS_CLASSES.playColBtn}`);
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }

  /**
   * Attache les écouteurs d'événements
   */
  attachEventListeners() {
    const playAgainBtn = document.querySelector(DOM_SELECTORS.playAgainBtn);
    const mainMenuBtn = document.querySelector(DOM_SELECTORS.mainMenuBtn);

    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        if (this.onPlayAgain) this.onPlayAgain();
      });
    }

    if (mainMenuBtn) {
      mainMenuBtn.addEventListener('click', () => {
        if (this.onMainMenu) this.onMainMenu();
      });
    }
  }

  /**
   * Affiche une notification
   */
  showNotification(message, duration = 3000) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: #161b22;
      color: #c9d1d9;
      border: 1px solid #30363d;
      border-radius: 6px;
      z-index: 1000;
      font-size: 14px;
    `;
    notif.textContent = message;

    document.body.appendChild(notif);

    setTimeout(() => {
      notif.remove();
    }, duration);
  }
}
