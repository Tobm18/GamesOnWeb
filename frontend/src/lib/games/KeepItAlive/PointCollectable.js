// ============================================================
// PointCollectable — étoile collectible avec raretés
// ============================================================

const RARITIES = [
  {
    threshold: 0.4,
    value: 5,
    size: 12,
    color: "#90EE90",
    glow: "rgba(144, 238, 144, 0.5)",
  },
  {
    threshold: 0.65,
    value: 25,
    size: 16,
    color: "#4169E1",
    glow: "rgba(65, 105, 225, 0.5)",
  },
  {
    threshold: 0.85,
    value: 100,
    size: 20,
    color: "#9370DB",
    glow: "rgba(147, 112, 219, 0.6)",
  },
  {
    threshold: 0.95,
    value: 200,
    size: 24,
    color: "#FF6347",
    glow: "rgba(255, 99, 71, 0.7)",
  },
  {
    threshold: 1.0,
    value: 500,
    size: 28,
    color: "#FFD700",
    glow: "rgba(255, 215, 0, 0.8)",
  },
];

export class PointCollectable {
  /** @param {number} canvasWidth */
  constructor(canvasWidth) {
    this.x = Math.random() * (canvasWidth - 40) + 20;
    this.y = -20;
    this.speed = Math.random() * 1.5 + 1;
    this.rotation = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;

    const rarity = Math.random();
    const config = RARITIES.find((r) => rarity < r.threshold);
    Object.assign(this, config);
  }

  /** @param {{ slowmo: number }} powerups */
  update(powerups) {
    const slowmo = powerups.slowmo > 0 ? 0.5 : 1;
    this.y += this.speed * slowmo;
    this.rotation += 0.03;
    this.pulsePhase += 0.1;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
    const currentSize = this.size * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.glow;

    // Étoile à 5 branches
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * currentSize;
      const y = Math.sin(angle) * currentSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();

    // Centre blanc
    ctx.beginPath();
    ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Valeur
    ctx.shadowBlur = 0;
    const fontSize = Math.max(14, Math.round(currentSize * 0.6));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(3, Math.round(currentSize * 0.12));
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeText(this.value, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillText(this.value, 0, 0);

    ctx.restore();
  }

  /** @param {number} canvasHeight */
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.size;
  }

  /** @param {{ x: number, y: number, radius: number }} ball */
  collidesWith(ball) {
    const dx = this.x - ball.x;
    const dy = this.y - ball.y;
    return Math.sqrt(dx * dx + dy * dy) < this.size + ball.radius;
  }
}
