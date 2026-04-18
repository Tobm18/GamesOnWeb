// ============================================
// CLASSE SCOREMANAGER - Gestion du scoring
// ============================================

import { GAME_CONFIG, LEVEL_INFO, RESULT } from '../utils/constants.js';
import { saveToStorage, getFromStorage, formatScore } from '../utils/helpers.js';

export class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.bestScore = getFromStorage('puissance4_bestScore', 0);
    this.levelBestScores = getFromStorage('puissance4_levelBestScores', {});
    this.gameHistory = getFromStorage('puissance4_gameHistory', []);
    this.totalGamesPlayed = getFromStorage('puissance4_totalGames', 0);
  }

  /**
   * Réinitialise le score de la session courante
   */
  resetSessionScore() {
    this.currentScore = 0;
  }

  /**
   * Calcule le score final d'une partie
   */
  calculateScore(level, timeTaken, result) {
    if (result === RESULT.HUMAN_WIN) {
      const baseScore = GAME_CONFIG.BASE_SCORE;
      const timeBonus = Math.max(0, (GAME_CONFIG.TIMER_DURATION - timeTaken) / 100);
      const multiplier = LEVEL_INFO[level].multiplier;
      
      return Math.floor((baseScore + timeBonus) * multiplier);
    } else if (result === RESULT.DRAW) {
      const baseScore = GAME_CONFIG.DRAW_SCORE;
      const timeBonus = Math.max(0, (GAME_CONFIG.TIMER_DURATION - timeTaken) / 100);
      const multiplier = LEVEL_INFO[level].multiplier;
      
      return Math.floor((baseScore + timeBonus) * multiplier * 0.5);
    }

    return 0; // Pas de points si défaite
  }

  /**
   * Ajoute des points et met à jour les records
   */
  addScore(level, timeTaken, result) {
    const points = this.calculateScore(level, timeTaken, result);
    this.currentScore += points;

    // Mettre à jour le meilleur score global
    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
      saveToStorage('puissance4_bestScore', this.bestScore);
    }

    // Mettre à jour le meilleur score du niveau
    const levelKey = `level${level}`;
    if (!this.levelBestScores[levelKey]) {
      this.levelBestScores[levelKey] = 0;
    }
    if (this.currentScore > this.levelBestScores[levelKey]) {
      this.levelBestScores[levelKey] = this.currentScore;
      saveToStorage('puissance4_levelBestScores', this.levelBestScores);
    }

    // Ajouter à l'historique
    this.addToHistory(level, this.currentScore, result);

    return points;
  }

  /**
   * Ajoute une partie à l'historique
   */
  addToHistory(level, score, result) {
    const entry = {
      id: Date.now(),
      level,
      score,
      result,
      date: new Date().toISOString(),
      levelName: LEVEL_INFO[level].name
    };

    this.gameHistory.unshift(entry); // Ajouter au début
    this.gameHistory = this.gameHistory.slice(0, 50); // Garder les 50 derniers
    this.totalGamesPlayed++;

    saveToStorage('puissance4_gameHistory', this.gameHistory);
    saveToStorage('puissance4_totalGames', this.totalGamesPlayed);
  }

  /**
   * Obtient le score courant
   */
  getCurrentScore() {
    return this.currentScore;
  }

  /**
   * Obtient le meilleur score global
   */
  getBestScore() {
    return this.bestScore;
  }

  /**
   * Obtient le meilleur score d'un niveau
   */
  getLevelBestScore(level) {
    const levelKey = `level${level}`;
    return this.levelBestScores[levelKey] || 0;
  }

  /**
   * Obtient l'historique
   */
  getHistory() {
    return [...this.gameHistory];
  }

  /**
   * Obtient les stats globales
   */
  getStats() {
    return {
      bestScore: this.bestScore,
      totalGames: this.totalGamesPlayed,
      levelBestScores: { ...this.levelBestScores },
      recentGames: this.gameHistory.slice(0, 10)
    };
  }

  /**
   * Réinitialise tous les scores (attention!)
   */
  resetAll() {
    this.currentScore = 0;
    this.bestScore = 0;
    this.levelBestScores = {};
    this.gameHistory = [];
    this.totalGamesPlayed = 0;

    saveToStorage('puissance4_bestScore', 0);
    saveToStorage('puissance4_levelBestScores', {});
    saveToStorage('puissance4_gameHistory', []);
    saveToStorage('puissance4_totalGames', 0);
  }

  /**
   * Formate un score pour l'affichage
   */
  formatScore(score) {
    return formatScore(score);
  }
}
