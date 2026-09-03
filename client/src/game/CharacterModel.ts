import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CharacterAnimations {
  idle?: THREE.AnimationAction;
  walk?: THREE.AnimationAction;
  run?: THREE.AnimationAction;
  jump?: THREE.AnimationAction;
}

export class CharacterModel {
  public model: THREE.Group | null = null;
  public mixer: THREE.AnimationMixer | null = null;
  public animations: CharacterAnimations = {};
  private currentAnimation: THREE.AnimationAction | null = null;
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  async load(modelPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          this.model = gltf.scene;
          this.mixer = new THREE.AnimationMixer(this.model);

          // Parse animations
          gltf.animations.forEach((clip) => {
            const action = this.mixer!.clipAction(clip);
            const name = clip.name.toLowerCase();

            if (name.includes('idle')) {
              this.animations.idle = action;
            } else if (name.includes('walk')) {
              this.animations.walk = action;
            } else if (name.includes('run')) {
              this.animations.run = action;
            } else if (name.includes('jump')) {
              this.animations.jump = action;
            }
          });

          // Enable shadows
          this.model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Scale model
          this.model.scale.set(1, 1, 1);

          // Play idle animation by default
          if (this.animations.idle) {
            this.playAnimation('idle');
          }

          resolve();
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading character model: ${percent.toFixed(0)}%`);
        },
        (error) => {
          console.error('Error loading character model:', error);
          reject(error);
        }
      );
    });
  }

  playAnimation(name: keyof CharacterAnimations, fadeTime: number = 0.2) {
    const animation = this.animations[name];
    if (!animation || animation === this.currentAnimation) return;

    // Fade out current animation
    if (this.currentAnimation) {
      this.currentAnimation.fadeOut(fadeTime);
    }

    // Fade in new animation
    animation.reset().fadeIn(fadeTime).play();
    this.currentAnimation = animation;
  }

  update(deltaTime: number) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  setPosition(x: number, y: number, z: number) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  setRotation(y: number) {
    if (this.model) {
      this.model.rotation.y = y;
    }
  }

  getPosition(): THREE.Vector3 {
    return this.model ? this.model.position.clone() : new THREE.Vector3();
  }

  addToScene(scene: THREE.Scene) {
    if (this.model) {
      scene.add(this.model);
    }
  }

  removeFromScene(scene: THREE.Scene) {
    if (this.model) {
      scene.remove(this.model);
    }
  }

  dispose() {
    if (this.model) {
      this.model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }

    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAnimation = null;
  }
}
