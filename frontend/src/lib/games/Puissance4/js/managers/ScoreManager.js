// ============================================
// CLASSE SCOREMANAGER - Gestion du scoring
// ============================================

import { GAME_CONFIG, LEVEL_INFO, RESULT } from "../utils/constants.js";

export class ScoreManager {
  constructor(onScoreUpdate, onGameOver) {
    this._onScoreUpdate = onScoreUpdate || null;
    this._onGameOver = onGameOver || null;
    this.currentScore = 0;
  }

  /**
   * Réinitialise le score de la session courante et notifie React
   */
  resetSessionScore() {
    this.currentScore = 0;
    if (this._onScoreUpdate) this._onScoreUpdate(0);
  }

  /**
   * Calcule le score final d'une partie
   */
  calculateScore(level, timeTaken, result) {
    if (result === RESULT.HUMAN_WIN) {
      const baseScore = GAME_CONFIG.BASE_SCORE;
      const timeBonus = Math.max(
        0,
        (GAME_CONFIG.TIMER_DURATION - timeTaken) / 100,
      );
      const multiplier = LEVEL_INFO[level].multiplier;

      return Math.floor((baseScore + timeBonus) * multiplier);
    } else if (result === RESULT.DRAW) {
      const baseScore = GAME_CONFIG.DRAW_SCORE;
      const timeBonus = Math.max(
        0,
        (GAME_CONFIG.TIMER_DURATION - timeTaken) / 100,
      );
      const multiplier = LEVEL_INFO[level].multiplier;

      return Math.floor((baseScore + timeBonus) * multiplier * 0.5);
    }

    return 0; // Pas de points si défaite
  }

  /**
   * Ajoute des points et notifie le callback React
   */
  addScore(level, timeTaken, result) {
    const points = this.calculateScore(level, timeTaken, result);
    this.currentScore += points;
    // Affichage live
    if (this._onScoreUpdate) this._onScoreUpdate(this.currentScore);
    // Sauvegarde en DB à chaque fin de partie
    if (this._onGameOver) this._onGameOver(this.currentScore);
    return points;
  }

  /**
   * Obtient le score courant
   */
  getCurrentScore() {
    return this.currentScore;
  }
}
