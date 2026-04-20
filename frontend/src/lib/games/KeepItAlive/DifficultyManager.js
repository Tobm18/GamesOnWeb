// ============================================================
// DifficultyManager — gestion de la difficulté progressive
// Responsabilités : temps écoulé, gravité, vent, cadences de spawn
// ============================================================

export class DifficultyManager {
  constructor() {
    // Timing
    this.startTime = 0;
    this.currentTime = 0; // secondes écoulées

    // Scaling physique
    this.gravityIncrease = 0.02;
    this.windChance = 0.004;
    this.maxWind = 0.5;
    this.obstacleSpeedMultiplier = 1;

    // Intervalles de spawn (ms)
    this.obstacleSpawnRate = 2500;
    this.minObstacleInterval = 800;
    this.powerupSpawnRate = 12000;
    this.collectableSpawnRate = 1500;

    // Timestamps du dernier spawn
    this.lastObstacleSpawn = 0;
    this.lastPowerupSpawn = 0;
    this.lastCollectableSpawn = 0;
  }

  reset() {
    const now = Date.now();
    this.startTime = now;
    this.currentTime = 0;
    this.obstacleSpeedMultiplier = 1;
    this.lastObstacleSpawn = now;
    this.lastPowerupSpawn = now;
    this.lastCollectableSpawn = now;
  }

  /**
   * Met à jour les valeurs de difficulté et retourne les décisions de spawn.
   *
   * @param {{ baseGravity: number, gravity: number, windForce: number }} physics
   *   Objet modifié en place (gravity et windForce sont mis à jour).
   *
   * @returns {{ spawnObstacle: boolean, spawnPowerup: boolean, spawnCollectable: boolean }}
   */
  update(physics) {
    const now = Date.now();
    this.currentTime = (now - this.startTime) / 1000;

    // Augmentation progressive de la gravité
    physics.gravity =
      physics.baseGravity +
      Math.floor(this.currentTime / 8) * this.gravityIncrease;

    // Accélération progressive des obstacles
    this.obstacleSpeedMultiplier = 1 + this.currentTime / 100;

    // Vent aléatoire + amortissement
    if (Math.random() < this.windChance) {
      physics.windForce = (Math.random() - 0.5) * this.maxWind;
    }
    physics.windForce *= 0.99;

    // Décisions de spawn
    const obstacleInterval = Math.max(
      this.obstacleSpawnRate - this.currentTime * 40,
      this.minObstacleInterval,
    );
    const spawnObstacle = now - this.lastObstacleSpawn > obstacleInterval;
    if (spawnObstacle) this.lastObstacleSpawn = now;

    // Le powerup n'est spawné que si le cooldown ET la chance aléatoire sont vérifiés
    const spawnPowerup =
      now - this.lastPowerupSpawn > this.powerupSpawnRate &&
      Math.random() < 0.15;
    if (spawnPowerup) this.lastPowerupSpawn = now;

    const collectableInterval = Math.max(
      this.collectableSpawnRate - this.currentTime * 20,
      600,
    );
    const spawnCollectable =
      now - this.lastCollectableSpawn > collectableInterval;
    if (spawnCollectable) this.lastCollectableSpawn = now;

    return { spawnObstacle, spawnPowerup, spawnCollectable };
  }
}
