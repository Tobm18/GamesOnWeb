// ============================================================
// Obstacle — barre ennemie descendant/remontant sur l'écran
// Types : bar, wave, spinner, zigzag
// ============================================================

export class Obstacle {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} speedMultiplier - facteur de vitesse selon la difficulté
   */
  constructor(canvasWidth, canvasHeight, speedMultiplier) {
    const types = ["bar", "wave", "spinner", "zigzag"];
    this.obstacleType = types[Math.floor(Math.random() * types.length)];

    this.width = Math.random() * 120 + 100;
    this.height = Math.random() * 20 + 12;
    this.speed = (Math.random() * 2 + 2.5) * speedMultiplier;

    const side = Math.random() < 0.5 ? "top" : "bottom";
    if (side === "top") {
      this.x = Math.random() * (canvasWidth - this.width);
      this.y = -this.height;
      this.direction = 1;
    } else {
      this.x = Math.random() * (canvasWidth - this.width);
      this.y = canvasHeight;
      this.direction = -1;
    }

    this.color = `hsl(${Math.random() * 30 + 345}, 80%, 55%)`;
    this.rotation = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.initialX = this.x;
  }

  /** @param {{ slowmo: number }} powerups */
  update(powerups) {
    const slowmo = powerups.slowmo > 0 ? 0.5 : 1;
    this.y += this.speed * slowmo * this.direction;

    switch (this.obstacleType) {
      case "wave":
        this.x = this.initialX + Math.sin(this.y * 0.01 + this.phase) * 50;
        break;
      case "spinner":
        this.rotation += 0.03 * slowmo;
        break;
      case "zigzag":
        this.x += Math.sin(this.y * 0.05) * 2;
        break;
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();

    if (this.obstacleType === "spinner") {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.translate(-this.width / 2, -this.height / 2);
    } else {
      ctx.translate(this.x, this.y);
    }

    const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, "rgba(255, 107, 107, 0.8)");
    gradient.addColorStop(1, this.color);

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 5; i < this.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  /** @param {number} canvasHeight */
  isOffScreen(canvasHeight) {
    return (
      (this.direction === 1 && this.y > canvasHeight + this.height) ||
      (this.direction === -1 && this.y < -this.height)
    );
  }

  /**
   * @param {{ x: number, y: number, radius: number }} ball
   * @param {{ shield: number }} powerups
   */
  collidesWith(ball, powerups) {
    if (powerups.shield > 0) return false;

    const closestX = Math.max(this.x, Math.min(ball.x, this.x + this.width));
    const closestY = Math.max(this.y, Math.min(ball.y, this.y + this.height));

    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return dx * dx + dy * dy < ball.radius * ball.radius;
  }
}
