// ============================================
// CLASSE PLAYER - Joueur humain
// ============================================

import { PLAYERS } from '../utils/constants.js';

export class Player {
  constructor(name = 'Joueur', type = PLAYERS.HUMAN) {
    this.name = name;
    this.type = type;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  /**
   * Enregistre une victoire
   */
  recordWin() {
    this.wins++;
  }

  /**
   * Enregistre une défaite
   */
  recordLoss() {
    this.losses++;
  }

  /**
   * Enregistre un match nul
   */
  recordDraw() {
    this.draws++;
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats() {
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  /**
   * Obtient les stats
   */
  getStats() {
    return {
      name: this.name,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      total: this.wins + this.losses + this.draws
    };
  }

  /**
   * Obtient le taux de victoire
   */
  getWinRate() {
    const total = this.wins + this.losses + this.draws;
    if (total === 0) return 0;
    return ((this.wins / total) * 100).toFixed(1);
  }
}
