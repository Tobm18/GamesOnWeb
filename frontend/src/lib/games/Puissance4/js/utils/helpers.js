// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtient une position aléatoire dans un array
 */
export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Crée une grille 2D vide
 */
export function createEmptyBoard(rows, cols, emptyValue = 0) {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(emptyValue));
}

/**
 * Clone une grille 2D
 */
export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

/**
 * Vérifie si une colonne est pleine
 */
export function isColumnFull(board, col) {
  return board[0][col] !== 0;
}

/**
 * Obtient la dernière ligne libre d'une colonne
 */
export function getDropRow(board, col) {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1; // Colonne pleine
}

/**
 * Obtient les colonnes valides (non pleines)
 */
export function getValidColumns(board) {
  const validCols = [];
  for (let col = 0; col < board[0].length; col++) {
    if (!isColumnFull(board, col)) {
      validCols.push(col);
    }
  }
  return validCols;
}

/**
 * Teste un coup sans modifier la grille
 */
export function testMove(board, col, player) {
  const testBoard = cloneBoard(board);
  const row = getDropRow(testBoard, col);

  if (row === -1) return null;

  testBoard[row][col] = player;
  return testBoard;
}

/**
 * Effectue un coup sur la grille
 */
export function makeMove(board, col, player) {
  const row = getDropRow(board, col);

  if (row === -1) return null;

  board[row][col] = player;
  return { row, col };
}

/**
 * Compte les pions alignés dans une direction
 */
function countInDirection(board, row, col, player, dRow, dCol) {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  while (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
    if (board[r][c] === player) {
      count++;
      r += dRow;
      c += dCol;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Vérifie si un coup gagne et retourne les 4 cellules gagnantes
 */
export function checkWin(board, row, col, player) {
  const directions = [
    { dr: 0, dc: 1 }, // Horizontal
    { dr: 1, dc: 0 }, // Vertical
    { dr: 1, dc: 1 }, // Diagonal \
    { dr: 1, dc: -1 }, // Diagonal /
  ];

  for (const { dr, dc } of directions) {
    const left = countInDirection(board, row, col, player, -dr, -dc);
    const right = countInDirection(board, row, col, player, dr, dc);
    const total = left + right + 1; // +1 pour le pion courant

    if (total >= 4) {
      // Récupérer les 4 cellules gagnantes
      const winningCells = [];

      for (let i = -left; i <= right; i++) {
        if (winningCells.length < 4) {
          winningCells.push({ r: row + i * dr, c: col + i * dc });
        }
      }

      return winningCells;
    }
  }

  return null;
}

/**
 * Vérifie si la grille est pleine
 */
export function isBoardFull(board) {
  return board[0].every((cell) => cell !== 0);
}

/**
 * Compte les cellules de jeu consécutives dans une direction
 */
export function evaluateLinePattern(board, row, col, player, dRow, dCol) {
  let count = 0;
  let emptyCount = 0;
  let blocked = 0;

  for (let i = 1; i < 4; i++) {
    const r = row + i * dRow;
    const c = col + i * dCol;

    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) {
      blocked++;
      continue;
    }

    if (board[r][c] === player) {
      count++;
    } else if (board[r][c] === 0) {
      emptyCount++;
    } else {
      blocked++;
    }
  }

  return { count, emptyCount, blocked };
}

/**
 * Évalue la force d'une position pour le Bot
 */
export function evaluatePosition(board, row, col, player) {
  let score = 0;
  const directions = [
    { dr: 0, dc: 1 }, // Horizontal
    { dr: 1, dc: 0 }, // Vertical
    { dr: 1, dc: 1 }, // Diagonal \
    { dr: 1, dc: -1 }, // Diagonal /
  ];

  for (const { dr, dc } of directions) {
    const eval1 = evaluateLinePattern(board, row, col, player, dr, dc);
    const eval2 = evaluateLinePattern(board, row, col, player, -dr, -dc);

    const totalPieces = eval1.count + eval2.count + 1;

    if (totalPieces >= 4) {
      return 10000; // Victoire!
    }

    if (totalPieces === 3 && (eval1.emptyCount > 0 || eval2.emptyCount > 0)) {
      score += 50;
    } else if (
      totalPieces === 2 &&
      (eval1.emptyCount > 0 || eval2.emptyCount > 0)
    ) {
      score += 10;
    }
  }

  // Bonus pour le centre (meilleure position statistique)
  const centerCol = Math.floor(board[0].length / 2);
  if (col === centerCol) score += 2;
  if (Math.abs(col - centerCol) <= 1) score += 1;

  return score;
}

/**
 * Formate un nombre en secondes pour l'affichage
 */
export function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  return Math.max(0, seconds);
}

/**
 * Format un score avec séparateurs de milliers
 */
export function formatScore(score) {
  return Math.floor(score).toLocaleString("fr-FR");
}

/**
 * Génère un ID unique
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
