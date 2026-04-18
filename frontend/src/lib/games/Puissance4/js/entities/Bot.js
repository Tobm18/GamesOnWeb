// ===========
// CLASSE Bot
// ===========

import { PLAYERS, LEVELS } from '../utils/constants.js';
import {
  getRandomElement,
  testMove,
  checkWin,
  getValidColumns,
  evaluatePosition,
  cloneBoard
} from '../utils/helpers.js';

export class Bot {
  constructor(level = LEVELS.CONFIRMED) {
    this.level = level;
    this.type = PLAYERS.Bot;
    this.name = 'Bot';
  }

  /**
   * Obtient le coup suivant selon le niveau
   */
  getMove(board) {
    switch (this.level) {
      case LEVELS.BEGINNER:
        return this.randomMove(board);
      case LEVELS.AMATEUR:
        return this.defensiveMove(board);
      case LEVELS.CONFIRMED:
        return this.strategicMove(board);
      case LEVELS.EXPERT:
        return this.minimaxMove(board, 4); // Augmenté à 4
      case LEVELS.MASTER:
        return this.minimaxMove(board, 6); // Augmenté à 6
      default:
        return this.randomMove(board);
    }
  }

  /**
   * Niveau 1: Coups aléatoires
   */
  randomMove(board) {
    const validCols = getValidColumns(board);
    return getRandomElement(validCols);
  }

  /**
   * Niveau 2: Défense avancée (bloque et crée des menaces)
   */
  defensiveMove(board) {
    // 1. Gagner si possible
    const winCol = this.findWinningMove(board);
    if (winCol !== null) return winCol;

    // 2. Bloquer une attaque imminente
    const blockCol = this.findBlockingMove(board);
    if (blockCol !== null) return blockCol;

    // 3. Créer une menace (3 alignés)
    const threatCol = this.findThreatMove(board);
    if (threatCol !== null) return threatCol;

    // 4. Sinon coup aléatoire
    return this.randomMove(board);
  }

  /**
   * Niveau 3: Stratégie offensivo-défensive avancée
   */
  strategicMove(board) {
    // 1. Gagner si possible
    const winCol = this.findWinningMove(board);
    if (winCol !== null) return winCol;

    // 2. Créer un fork (2 menaces à la fois)
    const forkCol = this.findForkMove(board);
    if (forkCol !== null) return forkCol;

    // 3. Bloquer un fork ennemi
    const blockForkCol = this.findBlockFork(board);
    if (blockForkCol !== null) return blockForkCol;

    // 4. Bloquer une attaque simple
    const blockCol = this.findBlockingMove(board);
    if (blockCol !== null) return blockCol;

    // 5. Créer une menace
    const threatCol = this.findThreatMove(board);
    if (threatCol !== null) return threatCol;

    // 6. Jouer au centre (position forte)
    const validCols = getValidColumns(board);
    const centerCol = Math.floor(board[0].length / 2);
    if (validCols.includes(centerCol)) return centerCol;

    // 7. Sinon coup aléatoire
    return getRandomElement(validCols);
  }

  /**
   * Niveaux 4-5: Minimax avec élagage alpha-beta
   */
  minimaxMove(board, depth) {
    const validCols = getValidColumns(board);
    let bestCol = validCols[0];
    let bestScore = -Infinity;

    for (const col of validCols) {
      const testBoard = cloneBoard(board);
      const row = testBoard.length - 1 - (testBoard[0].length - 1 - testBoard.map((_, i) => i).filter(i => testBoard[i][col] === 0).length);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === 0) {
          testBoard[r][col] = PLAYERS.Bot;
          break;
        }
      }

      const score = this.minimax(testBoard, depth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }

    return bestCol;
  }

  /**
   * Algorithme Minimax avec élagage alpha-beta
   */
  minimax(board, depth, alpha, beta, isBOT) {
    const validCols = getValidColumns(board);

    // Conditions de base
    if (depth === 0 || validCols.length === 0) {
      return this.evaluateBoard(board);
    }

    if (isBOT) {
      // Maximiser le score du Bot
      let maxEval = -Infinity;

      for (const col of validCols) {
        const testBoard = cloneBoard(board);
        
        for (let r = testBoard.length - 1; r >= 0; r--) {
          if (testBoard[r][col] === 0) {
            testBoard[r][col] = PLAYERS.Bot;
            
            // Vérifier victoire
            if (checkWin(testBoard, r, col, PLAYERS.Bot)) {
              return 10000;
            }
            
            break;
          }
        }

        const evaluation = this.minimax(testBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        
        if (beta <= alpha) break; // Élagage
      }

      return maxEval;
    } else {
      // Minimiser le score du joueur
      let minEval = Infinity;

      for (const col of validCols) {
        const testBoard = cloneBoard(board);
        
        for (let r = testBoard.length - 1; r >= 0; r--) {
          if (testBoard[r][col] === 0) {
            testBoard[r][col] = PLAYERS.HUMAN;
            
            // Vérifier victoire
            if (checkWin(testBoard, r, col, PLAYERS.HUMAN)) {
              return -10000;
            }
            
            break;
          }
        }

        const evaluation = this.minimax(testBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        
        if (beta <= alpha) break; // Élagage
      }

      return minEval;
    }
  }

  /**
   * Évalue la position de la grille (heuristique améliorée)
   */
  evaluateBoard(board) {
    let score = 0;

    // Évaluer chaque position
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === PLAYERS.Bot) {
          score += this.evaluateCellForBOT(board, row, col);
        } else if (board[row][col] === PLAYERS.HUMAN) {
          score -= this.evaluateCellForHuman(board, row, col);
        }
      }
    }

    // Bonus pour positions centrales (contrôle du centre)
    const centerCol = Math.floor(board[0].length / 2);
    for (let row = 0; row < board.length; row++) {
      if (board[row][centerCol] === PLAYERS.Bot) score += 5;
      else if (board[row][centerCol] === PLAYERS.HUMAN) score -= 3;
    }

    return score;
  }

  /**
   * Évalue une cellule pour le Bot
   */
  evaluateCellForBOT(board, row, col) {
    let score = 0;
    const directions = [
      { dr: 0, dc: 1 },  // Horizontal
      { dr: 1, dc: 0 },  // Vertical
      { dr: 1, dc: 1 },  // Diagonal \
      { dr: 1, dc: -1 }  // Diagonal /
    ];

    for (const { dr, dc } of directions) {
      // Compter les alignements
      let count = 1; // Le pion lui-même
      
      // Vérifier dans les deux directions
      for (let i = 1; i <= 3; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === PLAYERS.Bot) count++;
          else break;
        } else break;
      }
      
      for (let i = 1; i <= 3; i++) {
        const r = row - i * dr;
        const c = col - i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === PLAYERS.Bot) count++;
          else break;
        } else break;
      }

      // Attribuer des points selon les alignements
      if (count >= 4) score += 10000;
      else if (count === 3) score += 100;
      else if (count === 2) score += 10;
    }

    return score;
  }

  /**
   * Évalue une cellule pour l'humain
   */
  evaluateCellForHuman(board, row, col) {
    let score = 0;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
      let count = 1;
      
      for (let i = 1; i <= 3; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === PLAYERS.HUMAN) count++;
          else break;
        } else break;
      }
      
      for (let i = 1; i <= 3; i++) {
        const r = row - i * dr;
        const c = col - i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === PLAYERS.HUMAN) count++;
          else break;
        } else break;
      }

      if (count >= 4) score += 10000;
      else if (count === 3) score += 80; // Moins que le Bot pour être agressif
      else if (count === 2) score += 8;
    }

    return score;
  }

  /**
   * Trouve un coup gagnant
   */
  findWinningMove(board) {
    const validCols = getValidColumns(board);

    for (const col of validCols) {
      const testBoard = testMove(board, col, PLAYERS.Bot);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === PLAYERS.Bot) {
          if (checkWin(testBoard, r, col, PLAYERS.Bot)) {
            return col;
          }
          break;
        }
      }
    }

    return null;
  }

  /**
   * Trouve un coup de blocage
   */
  findBlockingMove(board) {
    const validCols = getValidColumns(board);

    for (const col of validCols) {
      const testBoard = testMove(board, col, PLAYERS.HUMAN);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === PLAYERS.HUMAN) {
          if (checkWin(testBoard, r, col, PLAYERS.HUMAN)) {
            return col;
          }
          break;
        }
      }
    }

    return null;
  }

  /**
   * Trouve un coup créant une menace (3 alignés)
   */
  findThreatMove(board) {
    const validCols = getValidColumns(board);

    for (const col of validCols) {
      const testBoard = cloneBoard(board);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === 0) {
          testBoard[r][col] = PLAYERS.Bot;
          
          // Vérifier si cela crée une menace (3 alignés avec espace)
          if (this.countThreat(testBoard, r, col, PLAYERS.Bot) >= 1) {
            return col;
          }
          
          break;
        }
      }
    }

    return null;
  }

  /**
   * Compte les menaces créées par un coup
   */
  countThreat(board, row, col, player) {
    let threats = 0;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
      let count = 1;
      let openEnds = 0;
      
      // Compter dans les deux directions
      for (let i = 1; i <= 3; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === player) count++;
          else if (board[r][c] === 0) openEnds++;
          else break;
        }
      }
      
      for (let i = 1; i <= 3; i++) {
        const r = row - i * dr;
        const c = col - i * dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (board[r][c] === player) count++;
          else if (board[r][c] === 0) openEnds++;
          else break;
        }
      }

      if (count === 3 && openEnds > 0) threats++;
    }

    return threats;
  }

  /**
   * Trouve un coup créant un fork (2 menaces)
   */
  findForkMove(board) {
    const validCols = getValidColumns(board);

    for (const col of validCols) {
      const testBoard = cloneBoard(board);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === 0) {
          testBoard[r][col] = PLAYERS.Bot;
          
          if (this.countThreat(testBoard, r, col, PLAYERS.Bot) >= 2) {
            return col;
          }
          
          break;
        }
      }
    }

    return null;
  }

  /**
   * Bloque un fork ennemi
   */
  findBlockFork(board) {
    const validCols = getValidColumns(board);

    for (const col of validCols) {
      const testBoard = cloneBoard(board);
      
      for (let r = testBoard.length - 1; r >= 0; r--) {
        if (testBoard[r][col] === 0) {
          testBoard[r][col] = PLAYERS.HUMAN;
          
          if (this.countThreat(testBoard, r, col, PLAYERS.HUMAN) >= 2) {
            return col; // Bloquer le fork
          }
          
          break;
        }
      }
    }

    return null;
  }

  /**
   * Change le niveau
   */
  setLevel(level) {
    this.level = level;
  }
}
