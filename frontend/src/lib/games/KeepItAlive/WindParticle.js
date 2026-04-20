// ============================================================
// WindParticle — particule visuelle représentant le vent
// ============================================================

export class WindParticle {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.length = Math.random() * 20 + 10;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.speed = Math.random() * 2 + 1;
  }

  /**
   * @param {number} windForce
   * @param {number} canvasWidth
   */
  update(windForce, canvasWidth) {
    this.x += windForce * 50;
    this.y += Math.sin(this.x * 0.01) * 0.5;

    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} windForce
   */
  draw(ctx, windForce) {
    if (Math.abs(windForce) < 0.01) return;

    ctx.save();
    ctx.globalAlpha = this.opacity * Math.abs(windForce) * 3;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - Math.sign(windForce) * this.length, this.y);
    ctx.stroke();
    ctx.restore();
  }
}
