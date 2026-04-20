// ============================================================
// Point d'entrée public du jeu Keep It Alive
// Même interface que l'ancien keep-it-alive.js monolithique
// ============================================================

import { Game } from "./Game.js";

/**
 * Initialise le jeu sur le canvas fourni.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {(score: number) => void}               onScoreUpdate  - appelé à chaque changement de score
 * @param {(score: number, message: string) => void} onGameOver  - appelé une fois à la mort du joueur
 * @returns {{ start, cleanup, applyImpulse, handleKeyDown, handleKeyUp }}
 */
export function initKeepItAlive(canvas, onScoreUpdate, onGameOver) {
  const game = new Game(canvas, onScoreUpdate, onGameOver);
  return {
    start: () => game.start(),
    cleanup: () => game.cleanup(),
    applyImpulse: () => game.applyImpulse(),
    handleKeyDown: (code) => game.handleKeyDown(code),
    handleKeyUp: (code) => game.handleKeyUp(code),
  };
}
