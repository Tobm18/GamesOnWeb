// ============================================================
// FloatingText — texte flottant animé (score, combo, etc.)
// ============================================================

export class FloatingText {
  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   */
  constructor(text, x, y, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 60;
    this.vy = -2;
  }

  update() {
    this.y += this.vy;
    this.life -= 1;
    this.vy *= 0.95;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life / 60;
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}
