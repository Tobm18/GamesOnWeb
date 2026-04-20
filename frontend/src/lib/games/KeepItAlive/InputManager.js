// ============================================================
// InputManager — gestion des touches clavier
// ============================================================

export class InputManager {
  constructor() {
    this.left = false;
    this.right = false;
  }

  handleKeyDown(code) {
    if (code === "ArrowLeft") this.left = true;
    if (code === "ArrowRight") this.right = true;
  }

  handleKeyUp(code) {
    if (code === "ArrowLeft") this.left = false;
    if (code === "ArrowRight") this.right = false;
  }

  reset() {
    this.left = false;
    this.right = false;
  }
}
