// ============================================================
// Starfield — fond étoilé défilant
// ============================================================

export class Starfield {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} [count=100]
   */
  constructor(canvasWidth, canvasHeight, count = 100) {
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
    }));
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  draw(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > canvasHeight) {
        star.y = 0;
        star.x = Math.random() * canvasWidth;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
