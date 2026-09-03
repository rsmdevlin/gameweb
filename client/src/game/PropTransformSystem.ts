import * as THREE from 'three';
import type { PropManager } from './PropManager.js';

export interface PropTransform {
  propId: string;
  mesh: THREE.Mesh;
  originalScale: THREE.Vector3;
}

export class PropTransformSystem {
  private propManager: PropManager;
  private currentTransform: PropTransform | null = null;
  private availableProps: string[] = [];
  private transformCooldown: number = 0;
  private cooldownTime: number = 2; // seconds

  constructor(propManager: PropManager) {
    this.propManager = propManager;
    this.initAvailableProps();
  }

  private initAvailableProps() {
    // Props that players can transform into
    this.availableProps = [
      'box',
      'small_box',
      'tall_box',
      'crate',
      'barrel',
      'sphere',
      'cone',
      'cylinder'
    ];
  }

  canTransform(): boolean {
    return this.transformCooldown <= 0;
  }

  transformIntoProp(propId: string): PropTransform | null {
    if (!this.canTransform()) {
      console.log('Transform on cooldown');
      return null;
    }

    if (!this.availableProps.includes(propId)) {
      console.error(`Invalid prop ID: ${propId}`);
      return null;
    }

    // Remove previous transform
    if (this.currentTransform) {
      this.removeTransform();
    }

    // Create prop mesh
    const propMesh = this.propManager.createProp(propId);

    this.currentTransform = {
      propId,
      mesh: propMesh,
      originalScale: propMesh.scale.clone()
    };

    // Start cooldown
    this.transformCooldown = this.cooldownTime;

    console.log(`Transformed into ${propId}`);
    return this.currentTransform;
  }

  transformIntoRandomProp(): PropTransform | null {
    const randomPropId = this.availableProps[
      Math.floor(Math.random() * this.availableProps.length)
    ];
    return this.transformIntoProp(randomPropId);
  }

  removeTransform(): void {
    if (this.currentTransform) {
      // The mesh will be removed from scene by the caller
      this.currentTransform = null;
    }
  }

  getCurrentTransform(): PropTransform | null {
    return this.currentTransform;
  }

  isTransformed(): boolean {
    return this.currentTransform !== null;
  }

  updateTransformPosition(position: THREE.Vector3, rotation: number) {
    if (this.currentTransform) {
      this.currentTransform.mesh.position.copy(position);
      this.currentTransform.mesh.rotation.y = rotation;
    }
  }

  update(deltaTime: number) {
    // Update cooldown
    if (this.transformCooldown > 0) {
      this.transformCooldown -= deltaTime;
      if (this.transformCooldown < 0) {
        this.transformCooldown = 0;
      }
    }
  }

  getCooldownProgress(): number {
    return 1 - (this.transformCooldown / this.cooldownTime);
  }

  getAvailableProps(): string[] {
    return [...this.availableProps];
  }

  // Prop selection UI helpers
  getNextProp(currentPropId: string | null): string {
    if (!currentPropId) {
      return this.availableProps[0];
    }

    const currentIndex = this.availableProps.indexOf(currentPropId);
    const nextIndex = (currentIndex + 1) % this.availableProps.length;
    return this.availableProps[nextIndex];
  }

  getPreviousProp(currentPropId: string | null): string {
    if (!currentPropId) {
      return this.availableProps[this.availableProps.length - 1];
    }

    const currentIndex = this.availableProps.indexOf(currentPropId);
    const prevIndex = currentIndex <= 0 ? this.availableProps.length - 1 : currentIndex - 1;
    return this.availableProps[prevIndex];
  }

  dispose() {
    this.removeTransform();
  }
}
