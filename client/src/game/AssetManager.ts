import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelAsset {
  name: string;
  path: string;
  scale: number;
  license: string;
  author: string;
  source: string;
}

export class AssetManager {
  private loader: GLTFLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();

  // Free character models from Mixamo/Quaternius/other CC0 sources
  public characterModels: ModelAsset[] = [
    {
      name: 'SimplePerson',
      path: '/assets/models/character.glb',
      scale: 1,
      license: 'CC0 1.0 Universal',
      author: 'Quaternius',
      source: 'https://quaternius.com'
    }
  ];

  // Free prop models
  public propModels: ModelAsset[] = [
    {
      name: 'Barrel',
      path: '/assets/models/barrel.glb',
      scale: 1,
      license: 'CC0 1.0 Universal',
      author: 'Quaternius',
      source: 'https://quaternius.com'
    },
    {
      name: 'Crate',
      path: '/assets/models/crate.glb',
      scale: 1,
      license: 'CC0 1.0 Universal',
      author: 'Quaternius',
      source: 'https://quaternius.com'
    },
    {
      name: 'Box',
      path: '/assets/models/box.glb',
      scale: 1,
      license: 'CC0 1.0 Universal',
      author: 'Quaternius',
      source: 'https://quaternius.com'
    }
  ];

  constructor() {
    this.loader = new GLTFLoader();
  }

  async loadModel(asset: ModelAsset): Promise<THREE.Group> {
    // Check if already loaded
    if (this.loadedModels.has(asset.name)) {
      return this.loadedModels.get(asset.name)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        asset.path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(asset.scale, asset.scale, asset.scale);

          // Enable shadows
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.loadedModels.set(asset.name, model);
          resolve(model.clone());
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading ${asset.name}: ${percent.toFixed(0)}%`);
        },
        (error) => {
          console.error(`Error loading ${asset.name}:`, error);
          reject(error);
        }
      );
    });
  }

  async loadCharacterWithAnimations(asset: ModelAsset): Promise<{
    model: THREE.Group;
    mixer: THREE.AnimationMixer;
    animations: THREE.AnimationClip[];
  }> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        asset.path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(asset.scale, asset.scale, asset.scale);

          const mixer = new THREE.AnimationMixer(model);

          // Enable shadows
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          resolve({
            model,
            mixer,
            animations: gltf.animations
          });
        },
        undefined,
        reject
      );
    });
  }

  createFallbackCharacter(): THREE.Group {
    // Simple capsule character as fallback
    const group = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    body.receiveShadow = true;

    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.75;
    head.castShadow = true;
    head.receiveShadow = true;

    group.add(body);
    group.add(head);

    return group;
  }

  createFallbackProp(type: string): THREE.Mesh {
    let geometry: THREE.BufferGeometry;

    switch (type) {
      case 'barrel':
        geometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 16);
        break;
      case 'crate':
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  dispose() {
    this.loadedModels.forEach((model) => {
      model.traverse((child) => {
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
    });
    this.loadedModels.clear();
  }
}
