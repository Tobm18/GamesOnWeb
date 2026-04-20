// ============================================================
// Particle — particule d'effet visuel (explosion, collecte…)
// ============================================================

export class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 3 + 1;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.color = `hsl(${Math.random() * 60 + 160}, 70%, 60%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vy += 0.1; // micro-gravité
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  isDead() {
    return this.life <= 0;
  }
}
