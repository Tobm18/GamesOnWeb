// ============================================================
// Powerup — collectible accordant un effet temporaire
// Types : shield, slowmo, doublePoints
// ============================================================

const SYMBOLS = { shield: "\uf132", slowmo: "\uf017", doublePoints: "\uf005" };
const COLORS = {
  shield: "#00BFFF",
  slowmo: "#32CD32",
  doublePoints: "#FFD700",
};

export class Powerup {
  /** @param {number} canvasWidth */
  constructor(canvasWidth) {
    this.radius = 15;
    this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
    this.y = -this.radius;
    this.speed = 2;
    this.rotation = 0;

    const types = ["shield", "slowmo", "doublePoints"];
    this.type = types[Math.floor(Math.random() * types.length)];
    this.color = COLORS[this.type];
  }

  /** @param {{ slowmo: number }} powerups */
  update(powerups) {
    const slowmo = powerups.slowmo > 0 ? 0.5 : 1;
    this.y += this.speed * slowmo;
    this.rotation += 0.05;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = '900 16px "Font Awesome 6 Free"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.color;
    ctx.fillText(SYMBOLS[this.type], 0, 0);

    ctx.restore();
  }

  /** @param {number} canvasHeight */
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.radius;
  }

  /** @param {{ x: number, y: number, radius: number }} ball */
  collidesWith(ball) {
    const dx = this.x - ball.x;
    const dy = this.y - ball.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius + ball.radius;
  }
}
