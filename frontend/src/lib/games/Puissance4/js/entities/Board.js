// ============================================
// CLASSE BOARD - Modèle de la grille
// ============================================

import { GAME_CONFIG, PLAYERS } from '../utils/constants.js';
import {
  createEmptyBoard,
  cloneBoard,
  isColumnFull,
  getDropRow,
  getValidColumns,
  makeMove,
  checkWin,
  isBoardFull
} from '../utils/helpers.js';

export class Board {
  constructor(rows = GAME_CONFIG.ROWS, cols = GAME_CONFIG.COLS) {
    this.rows = rows;
    this.cols = cols;
    this.grid = createEmptyBoard(rows, cols);
    this.moveHistory = [];
  }

  /**
   * Réinitialise la grille
   */
  reset() {
    this.grid = createEmptyBoard(this.rows, this.cols);
    this.moveHistory = [];
  }

  /**
   * Effectue un coup
   */
  dropPiece(col, player) {
    if (this.isColumnFull(col)) {
      return null;
    }

    const result = makeMove(this.grid, col, player);
    
    if (result) {
      this.moveHistory.push({ col, player, ...result });
    }

    return result;
  }

  /**
   * Vérifie si une colonne est pleine
   */
  isColumnFull(col) {
    return isColumnFull(this.grid, col);
  }

  /**
   * Obtient les colonnes valides
   */
  getValidColumns() {
    return getValidColumns(this.grid);
  }

  /**
   * Vérifie si la grille est pleine
   */
  isFull() {
    return isBoardFull(this.grid);
  }

  /**
   * Vérifie si un coup gagne
   */
  checkWin(row, col, player) {
    return checkWin(this.grid, row, col, player);
  }

  /**
   * Clone la grille
   */
  clone() {
    const clonedBoard = new Board(this.rows, this.cols);
    clonedBoard.grid = cloneBoard(this.grid);
    clonedBoard.moveHistory = [...this.moveHistory];
    return clonedBoard;
  }

  /**
   * Obtient la cellule à une position
   */
  getCell(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.grid[row][col];
  }

  /**
   * Obtient la dernière ligne libre
   */
  getDropRow(col) {
    return getDropRow(this.grid, col);
  }

  /**
   * Retourne la grille (copie)
   */
  getGrid() {
    return cloneBoard(this.grid);
  }

  /**
   * Compte le nombre de coups joués
   */
  getMoveCount() {
    return this.moveHistory.length;
  }

  /**
   * Obtient l'historique des coups
   */
  getMoveHistory() {
    return [...this.moveHistory];
  }
}
