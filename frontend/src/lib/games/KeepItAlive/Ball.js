// ============================================================
// Ball — entité joueur : état, physique, rendu
// ============================================================

export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.vx = 0;
    this.vy = 0;
    this.color = "#4ecdc4";
    this.moveSpeed = 0.6;
    this.maxHorizontalSpeed = 10;
    this.trail = [];
    this.maxTrailLength = 15;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
  }

  /**
   * Met à jour la position et la vitesse.
   * @param {object} physics  - { gravity, windForce, horizontalFriction, friction, maxSpeed }
   * @param {object} input    - { left: boolean, right: boolean }
   * @param {object} powerups - { slowmo: number, ... }
   */
  update(physics, input, powerups) {
    const slowmo = powerups.slowmo > 0 ? 0.7 : 1;

    this.vy += physics.gravity * slowmo;

    if (input.left) this.vx -= this.moveSpeed;
    if (input.right) this.vx += this.moveSpeed;

    this.vx += physics.windForce;
    this.vx *= physics.horizontalFriction;
    this.vy *= physics.friction;

    if (Math.abs(this.vx) > this.maxHorizontalSpeed) {
      this.vx = Math.sign(this.vx) * this.maxHorizontalSpeed;
    }
    if (Math.abs(this.vy) > physics.maxSpeed) {
      this.vy = Math.sign(this.vy) * physics.maxSpeed;
    }

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) this.trail.shift();

    this.x += this.vx * slowmo;
    this.y += this.vy * slowmo;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} powerups - { shield: number, ... }
   */
  draw(ctx, powerups) {
    // Traînée
    this.trail.forEach((pos, i) => {
      ctx.globalAlpha = (i / this.trail.length) * 0.3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Bouclier
    if (powerups.shield > 0) {
      ctx.save();
      const sr = this.radius + 14;

      ctx.beginPath();
      ctx.arc(this.x, this.y, sr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,191,255,0.12)";
      ctx.fill();

      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(0,191,255,0.9)";

      ctx.beginPath();
      ctx.arc(this.x, this.y, sr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,191,255,0.95)";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,191,255,0.8)";
      ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Halo
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 2,
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, "rgba(78, 205, 196, 0)");
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Corps
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Reflet
    ctx.beginPath();
    ctx.arc(this.x - 6, this.y - 6, this.radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
  }
}
