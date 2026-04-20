// ============================================================
// Game — orchestrateur principal du jeu Keep It Alive
// Possède tout l'état, coordonne les systèmes, tourne la boucle
// ============================================================

import { Ball } from "./Ball.js";
import { Obstacle } from "./Obstacle.js";
import { Powerup } from "./Powerup.js";
import { PointCollectable } from "./PointCollectable.js";
import { Particle } from "./Particle.js";
import { WindParticle } from "./WindParticle.js";
import { Starfield } from "./Starfield.js";
import { FloatingText } from "./FloatingText.js";
import { DifficultyManager } from "./DifficultyManager.js";
import { InputManager } from "./InputManager.js";

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {(score: number) => void}           onScoreUpdate
   * @param {(score: number, msg: string) => void} onGameOver
   */
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this._onScoreUpdate = onScoreUpdate;
    this._onGameOver = onGameOver;

    this._initSize();

    // ── Collections d'entités ────────────────────────────────
    this.obstacles = [];
    this.powerups = [];
    this.collectables = [];
    this.particles = [];
    this.floatingTexts = [];

    // ── État de jeu ──────────────────────────────────────────
    this.gameState = "idle";
    this.score = 0;
    this.lastSentScore = 0;
    this.doublePointsCombo = 1;

    /** Durées restantes (en frames) pour chaque powerup actif */
    this.activePowerups = { shield: 0, slowmo: 0, doublePoints: 0 };

    // ── Physique ─────────────────────────────────────────────
    this.physics = {
      baseGravity: 0.4,
      gravity: 0.4,
      impulseStrength: -10,
      friction: 0.98,
      horizontalFriction: 0.92,
      maxSpeed: 15,
      windForce: 0,
    };

    // ── Sous-systèmes ─────────────────────────────────────────
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
    this.starfield = new Starfield(this.canvas.width, this.canvas.height);
    this.windParticles = Array.from(
      { length: 30 },
      () => new WindParticle(this.canvas.width, this.canvas.height),
    );
    this.difficulty = new DifficultyManager();
    this.input = new InputManager();

    this._animationId = null;

    // Redimensionnement
    this._resizeHandler = () => this._handleResize();
    window.addEventListener("resize", this._resizeHandler);
  }

  // ── Initialisation ──────────────────────────────────────────

  _initSize() {
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;
  }

  _handleResize() {
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;
  }

  // ── API publique ────────────────────────────────────────────

  start() {
    this.gameState = "playing";
    this.score = 0;
    this.lastSentScore = 0;
    this.doublePointsCombo = 1;

    this._handleResize();

    this.ball.reset(this.canvas.width / 2, this.canvas.height / 2);
    this.physics.gravity = this.physics.baseGravity;
    this.physics.windForce = 0;

    this.obstacles.length = 0;
    this.powerups.length = 0;
    this.collectables.length = 0;
    this.particles.length = 0;
    this.floatingTexts.length = 0;

    this.activePowerups = { shield: 0, slowmo: 0, doublePoints: 0 };
    this.input.reset();
    this.difficulty.reset();

    this._loop();
  }

  applyImpulse() {
    this.ball.vy = this.physics.impulseStrength;
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(this.ball.x, this.ball.y));
    }
  }

  cleanup() {
    cancelAnimationFrame(this._animationId);
    window.removeEventListener("resize", this._resizeHandler);
  }

  handleKeyDown(code) {
    if (this.gameState === "playing") {
      if (code === "Space") {
        this.applyImpulse();
      } else {
        this.input.handleKeyDown(code);
      }
    }
  }

  handleKeyUp(code) {
    this.input.handleKeyUp(code);
  }

  // ── Boucle principale ───────────────────────────────────────

  _loop() {
    if (this.gameState !== "playing") return;

    this._updatePhysics();
    this._updateDifficulty();
    this._updateObstacles();
    this._updatePowerups();
    this._updateCollectables();
    this._updateFloatingTexts();
    this._checkCollisions();
    this._updateParticles();
    this._draw();
    this._notifyScore();

    this._animationId = requestAnimationFrame(() => this._loop());
  }

  // ── Mises à jour ────────────────────────────────────────────

  _updatePhysics() {
    this.ball.update(this.physics, this.input, this.activePowerups);
  }

  _updateDifficulty() {
    const { spawnObstacle, spawnPowerup, spawnCollectable } =
      this.difficulty.update(this.physics);

    if (spawnObstacle) {
      this.obstacles.push(
        new Obstacle(
          this.canvas.width,
          this.canvas.height,
          this.difficulty.obstacleSpeedMultiplier,
        ),
      );
    }
    if (spawnPowerup) {
      this.powerups.push(new Powerup(this.canvas.width));
    }
    if (spawnCollectable) {
      this.collectables.push(new PointCollectable(this.canvas.width));
    }

    // Décompte des timers de powerups actifs
    for (const key of Object.keys(this.activePowerups)) {
      if (this.activePowerups[key] > 0) {
        this.activePowerups[key]--;
        if (key === "doublePoints" && this.activePowerups[key] === 0) {
          this.doublePointsCombo = 1;
        }
      }
    }
  }

  _updateObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].update(this.activePowerups);
      if (this.obstacles[i].isOffScreen(this.canvas.height)) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  _updatePowerups() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.update(this.activePowerups);

      if (pu.isOffScreen(this.canvas.height)) {
        this.powerups.splice(i, 1);
      } else if (pu.collidesWith(this.ball)) {
        this._applyPowerup(pu);
        this.powerups.splice(i, 1);
      }
    }
  }

  _applyPowerup(pu) {
    if (pu.type === "shield") {
      this.activePowerups.shield = 600;
    } else if (pu.type === "slowmo") {
      this.activePowerups.slowmo = 600;
    } else if (pu.type === "doublePoints") {
      if (this.activePowerups.doublePoints > 0) {
        this.doublePointsCombo++;
        this._spawnFloatingText(
          `COMBO x${this.doublePointsCombo}!`,
          pu.x,
          pu.y,
          "#FFD700",
        );
      } else {
        this.doublePointsCombo = 2;
        this._spawnFloatingText("x2 Points!", pu.x, pu.y, "#FFD700");
      }
      this.activePowerups.doublePoints = 600;
    }

    for (let j = 0; j < 15; j++) {
      const p = new Particle(pu.x, pu.y);
      p.color = pu.color;
      this.particles.push(p);
    }
  }

  _updateCollectables() {
    for (let i = this.collectables.length - 1; i >= 0; i--) {
      const c = this.collectables[i];
      c.update(this.activePowerups);

      if (c.isOffScreen(this.canvas.height)) {
        this.collectables.splice(i, 1);
      } else if (c.collidesWith(this.ball)) {
        const multiplier =
          this.activePowerups.doublePoints > 0 ? this.doublePointsCombo : 1;
        const pointsGained = c.value * multiplier;
        this.score += pointsGained;

        for (let j = 0; j < 10; j++) {
          const p = new Particle(c.x, c.y);
          p.color = c.color;
          this.particles.push(p);
        }

        this._spawnFloatingText(`+${pointsGained}`, c.x, c.y, c.color);
        this.collectables.splice(i, 1);
      }
    }
  }

  _updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update();
      if (this.floatingTexts[i].isDead()) this.floatingTexts.splice(i, 1);
    }
  }

  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) this.particles.splice(i, 1);
    }
  }

  _spawnFloatingText(text, x, y, color) {
    this.floatingTexts.push(new FloatingText(text, x, y, color));
  }

  // ── Collisions ───────────────────────────────────────────────

  _checkCollisions() {
    const { ball, activePowerups } = this;

    // Murs
    if (ball.x - ball.radius < 0) {
      if (activePowerups.shield > 0) {
        ball.x = ball.radius;
        ball.vx = 0;
      } else {
        this._triggerGameOver();
        return;
      }
    }
    if (ball.x + ball.radius > this.canvas.width) {
      if (activePowerups.shield > 0) {
        ball.x = this.canvas.width - ball.radius;
        ball.vx = 0;
      } else {
        this._triggerGameOver();
        return;
      }
    }
    if (ball.y - ball.radius < 0) {
      if (activePowerups.shield > 0) {
        ball.y = ball.radius;
        ball.vy = 0;
      } else {
        this._triggerGameOver();
        return;
      }
    }
    if (ball.y + ball.radius > this.canvas.height) {
      if (activePowerups.shield > 0) {
        ball.y = this.canvas.height - ball.radius;
        ball.vy = 0;
      } else {
        this._triggerGameOver();
        return;
      }
    }

    // Obstacles
    for (const obs of this.obstacles) {
      if (obs.collidesWith(ball, activePowerups)) {
        this._triggerGameOver();
        return;
      }
    }
  }

  _triggerGameOver() {
    this.gameState = "gameOver";
    cancelAnimationFrame(this._animationId);

    const finalScore = Math.floor(this.score);
    const message = `Tu as survécu ${this.difficulty.currentTime.toFixed(1)}s`;
    this._onGameOver(finalScore, message);

    for (let i = 0; i < 30; i++) {
      this.particles.push(new Particle(this.ball.x, this.ball.y));
    }
  }

  // ── Notification score ───────────────────────────────────────

  _notifyScore() {
    const floored = Math.floor(this.score);
    if (floored !== this.lastSentScore) {
      this._onScoreUpdate(floored);
      this.lastSentScore = floored;
    }
  }

  // ── Rendu ────────────────────────────────────────────────────

  _draw() {
    const { ctx, canvas, activePowerups, physics } = this;

    ctx.fillStyle = activePowerups.slowmo > 0 ? "#0a0f1e" : "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.starfield.draw(ctx, canvas.width, canvas.height);

    if (Math.abs(physics.windForce) > 0.01) {
      this.windParticles.forEach((wp) => {
        wp.update(physics.windForce, canvas.width);
        wp.draw(ctx, physics.windForce);
      });
    }

    this.obstacles.forEach((o) => o.draw(ctx));
    this.powerups.forEach((p) => p.draw(ctx));
    this.collectables.forEach((c) => c.draw(ctx));
    this.particles.forEach((p) => p.draw(ctx));

    this.ball.draw(ctx, activePowerups);

    this.floatingTexts.forEach((ft) => ft.draw(ctx));
    this._drawPowerupTimers();
  }

  /** Affiche les icônes + compte à rebours des powerups actifs en haut au centre */
  _drawPowerupTimers() {
    const { ctx, canvas, activePowerups, doublePointsCombo } = this;
    const centerX = canvas.width / 2;

    const timers = [
      activePowerups.shield > 0 && {
        color: "#00BFFF",
        symbol: "\uf132",
        text: `${(activePowerups.shield / 60).toFixed(1)}s`,
      },
      activePowerups.slowmo > 0 && {
        color: "#32CD32",
        symbol: "\uf017",
        text: `${(activePowerups.slowmo / 60).toFixed(1)}s`,
      },
      activePowerups.doublePoints > 0 && {
        color: "#FFD700",
        symbol: "\uf005",
        text: `${(activePowerups.doublePoints / 60).toFixed(1)}s${doublePointsCombo > 1 ? ` x${doublePointsCombo}` : ""}`,
      },
    ].filter(Boolean);

    timers.forEach((timer, index) => {
      const yPos = 100 + index * 50;
      const circleRadius = 18;
      const gap = 12;

      ctx.save();
      ctx.font = "bold 28px Arial";
      const textWidth = Math.ceil(ctx.measureText(timer.text).width);
      const totalWidth = circleRadius * 2 + gap + textWidth;
      const startX = centerX - totalWidth / 2;
      const circleX = startX + circleRadius;
      const textX = startX + circleRadius * 2 + gap;

      ctx.shadowBlur = 20;
      ctx.shadowColor = timer.color;

      ctx.beginPath();
      ctx.arc(circleX, yPos, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = timer.color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = timer.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '900 20px "Font Awesome 6 Free"';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = timer.color;
      ctx.fillText(timer.symbol, circleX, yPos);

      ctx.font = "bold 28px Arial";
      ctx.textAlign = "left";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;
      ctx.strokeText(timer.text, textX, yPos + 2);
      ctx.fillText(timer.text, textX, yPos + 2);

      ctx.restore();
    });
  }
}
