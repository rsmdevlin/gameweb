import * as THREE from 'three';

export interface AttackResult {
  hit: boolean;
  targetId?: string;
  damage: number;
  position: THREE.Vector3;
}

export class HunterSystem {
  private attackCooldown: number = 0;
  private attackCooldownTime: number = 0.5; // 0.5 seconds between attacks
  private attackRange: number = 3; // 3 meters attack range
  private attackDamage: number = 50;
  private attackAngle: number = Math.PI / 4; // 45 degree cone

  // Penalty system for attacking wrong targets
  private healthPenalty: number = 10;
  private maxHealth: number = 100;
  private currentHealth: number = 100;

  constructor() {}

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  performAttack(
    attackerPosition: THREE.Vector3,
    attackerRotation: number,
    targets: Array<{ id: string; position: THREE.Vector3; isProp: boolean }>
  ): AttackResult {
    if (!this.canAttack()) {
      return { hit: false, damage: 0, position: attackerPosition };
    }

    // Start cooldown
    this.attackCooldown = this.attackCooldownTime;

    // Calculate attack direction
    const attackDirection = new THREE.Vector3(
      Math.sin(attackerRotation),
      0,
      Math.cos(attackerRotation)
    );

    // Find targets in range and cone
    let closestTarget: { id: string; distance: number; isProp: boolean } | null = null;

    for (const target of targets) {
      // Calculate direction to target
      const toTarget = new THREE.Vector3()
        .copy(target.position)
        .sub(attackerPosition);
      const distance = toTarget.length();

      // Check if in range
      if (distance > this.attackRange) continue;

      // Check if in attack cone
      toTarget.normalize();
      const angle = attackDirection.angleTo(toTarget);
      if (angle > this.attackAngle) continue;

      // Update closest target
      if (!closestTarget || distance < closestTarget.distance) {
        closestTarget = {
          id: target.id,
          distance,
          isProp: target.isProp
        };
      }
    }

    // Process attack result
    if (closestTarget) {
      if (closestTarget.isProp) {
        // Hit a prop - successful attack
        return {
          hit: true,
          targetId: closestTarget.id,
          damage: this.attackDamage,
          position: attackerPosition
        };
      } else {
        // Hit wrong target (another hunter or object) - apply penalty
        this.currentHealth = Math.max(0, this.currentHealth - this.healthPenalty);
        console.log(`Friendly fire penalty! Health: ${this.currentHealth}`);
        return {
          hit: false,
          damage: 0,
          position: attackerPosition
        };
      }
    }

    // Missed
    return { hit: false, damage: 0, position: attackerPosition };
  }

  // Prop detection system
  detectProps(
    hunterPosition: THREE.Vector3,
    hunterRotation: number,
    objects: Array<{ id: string; position: THREE.Vector3; isProp: boolean; isMoving: boolean }>
  ): Array<{ id: string; suspicionLevel: number }> {
    const detectionRange = 15;
    const detectionCone = Math.PI / 3; // 60 degrees
    const suspiciousObjects: Array<{ id: string; suspicionLevel: number }> = [];

    const lookDirection = new THREE.Vector3(
      Math.sin(hunterRotation),
      0,
      Math.cos(hunterRotation)
    );

    for (const obj of objects) {
      if (!obj.isProp) continue;

      const toObject = new THREE.Vector3()
        .copy(obj.position)
        .sub(hunterPosition);
      const distance = toObject.length();

      if (distance > detectionRange) continue;

      // Check if in view cone
      toObject.normalize();
      const angle = lookDirection.angleTo(toObject);
      if (angle > detectionCone) continue;

      // Calculate suspicion level based on movement
      let suspicion = 0;

      if (obj.isMoving) {
        // Moving props are highly suspicious
        suspicion = 80 + Math.random() * 20;
      } else {
        // Stationary props have low suspicion
        suspicion = Math.random() * 30;
      }

      // Distance affects suspicion (closer = more visible)
      suspicion *= (1 - distance / detectionRange);

      if (suspicion > 20) {
        suspiciousObjects.push({
          id: obj.id,
          suspicionLevel: Math.min(100, suspicion)
        });
      }
    }

    return suspiciousObjects.sort((a, b) => b.suspicionLevel - a.suspicionLevel);
  }

  update(deltaTime: number) {
    // Update cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
      if (this.attackCooldown < 0) {
        this.attackCooldown = 0;
      }
    }
  }

  getAttackCooldownProgress(): number {
    return 1 - (this.attackCooldown / this.attackCooldownTime);
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  resetHealth() {
    this.currentHealth = this.maxHealth;
  }

  takeDamage(damage: number) {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  getAttackRange(): number {
    return this.attackRange;
  }

  getAttackAngle(): number {
    return this.attackAngle;
  }

  // Visual helper for attack indicator
  createAttackIndicator(): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(
      this.attackRange * Math.tan(this.attackAngle),
      this.attackRange,
      8,
      1,
      true
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(geometry, material);
    cone.rotation.x = Math.PI / 2;
    return cone;
  }

  reset() {
    this.attackCooldown = 0;
    this.currentHealth = this.maxHealth;
  }
}
