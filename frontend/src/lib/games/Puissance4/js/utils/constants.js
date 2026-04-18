// ==================
// CONSTANTES DU JEU
// ==================

export const GAME_CONFIG = {
  ROWS: 6,
  COLS: 7,
  WIN_LENGTH: 4,
  TIMER_DURATION: 30000, // 30 secondes en ms
  BASE_SCORE: 1000,
  DRAW_SCORE: 500,
};

export const PLAYERS = {
  EMPTY: 0,
  HUMAN: 1,
  Bot: 2,
};

export const LEVELS = {
  BEGINNER: 1,
  AMATEUR: 2,
  CONFIRMED: 3,
  EXPERT: 4,
  MASTER: 5,
};

export const LEVEL_INFO = {
  [LEVELS.BEGINNER]: {
    name: "Débutant",
    difficulty: "Coups aléatoires",
    reactionTime: 500,
    multiplier: 1,
  },
  [LEVELS.AMATEUR]: {
    name: "Amateur",
    difficulty: "Défense basique",
    reactionTime: 800,
    multiplier: 1.5,
  },
  [LEVELS.CONFIRMED]: {
    name: "Confirmé",
    difficulty: "Stratégie mixte",
    reactionTime: 1000,
    multiplier: 2,
  },
  [LEVELS.EXPERT]: {
    name: "Expert",
    difficulty: "Minimax (3 coups)",
    reactionTime: 1500,
    multiplier: 3,
  },
  [LEVELS.MASTER]: {
    name: "Maître",
    difficulty: "Minimax (5 coups)",
    reactionTime: 2000,
    multiplier: 5,
  },
};

export const GAME_STATES = {
  HOME: "HOME",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
};

export const RESULT = {
  HUMAN_WIN: "HUMAN_WIN",
  BOT_WIN: "BOT_WIN",
  DRAW: "DRAW",
};

export const DOM_SELECTORS = {
  container: "#puissance4-container",
  homeScreen: "#home-screen",
  gameScreen: "#game-screen",
  gameOverScreen: "#game-over-screen",
  board: "#board",
  columnButtons: "#column-buttons",
  levelSelector: "#level-selector",
  levelDisplay: "#level-display",
  timerDisplay: "#timer-display",
  gameResultMessage: "#game-result-message",
  playAgainBtn: "#play-again-btn",
  mainMenuBtn: "#main-menu-btn",
  startBtn: "#start-btn",
  historyBtn: "#history-btn",
};

export const CSS_CLASSES = {
  cell: "cell",
  empty: "empty",
  player: "player",
  bot: "bot",
  winning: "winning",
  playColBtn: "play-col",
  levelBtn: "level-btn",
  hidden: "hidden",
  active: "active",
};
