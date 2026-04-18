/**
 * InputManager
 * Centralise la gestion des entrées clavier.
 * On stocke des flags booléens plutôt que de réagir
 * directement aux événements — plus propre dans une boucle de jeu.
 */
export class InputManager {
  constructor() {
    this.leftPressed = false;
    this.rightPressed = false;
    this.jumpPressed = false;
    this.slidePressed = false;

    this._boundOnKeyDown = (e) => this._onKeyDown(e);
    this._boundOnKeyUp = (e) => this._onKeyUp(e);
    window.addEventListener("keydown", this._boundOnKeyDown);
    window.addEventListener("keyup", this._boundOnKeyUp);
  }

  _onKeyDown(e) {
    if (e.key === "ArrowLeft") this.leftPressed = true;
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowUp" || e.key === " ") this.jumpPressed = true;
    if (e.key === "ArrowDown") this.slidePressed = true;
  }

  _onKeyUp(e) {
    if (e.key === "ArrowLeft") this.leftPressed = false;
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowUp" || e.key === " ") this.jumpPressed = false;
    if (e.key === "ArrowDown") this.slidePressed = false;
  }

  /**
   * Consomme le flag de saut : retourne true une seule fois
   * jusqu'au prochain appui. Évite le saut continu si on maintient.
   */
  consumeJump() {
    if (this.jumpPressed) {
      this.jumpPressed = false;
      return true;
    }
    return false;
  }

  destroy() {
    window.removeEventListener("keydown", this._boundOnKeyDown);
    window.removeEventListener("keyup", this._boundOnKeyUp);
  }
}
