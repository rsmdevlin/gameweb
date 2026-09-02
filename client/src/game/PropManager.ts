import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface PropDefinition {
  id: string;
  name: string;
  modelPath?: string;
  geometry?: THREE.BufferGeometry;
  color?: number;
  scale?: number;
}

export class PropManager {
  private loader: GLTFLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();
  private propDefinitions: PropDefinition[] = [
    // Basic geometric props (always available)
    {
      id: 'box',
      name: 'Box',
      geometry: new THREE.BoxGeometry(1, 1, 1),
      color: 0x8B4513,
      scale: 1
    },
    {
      id: 'sphere',
      name: 'Sphere',
      geometry: new THREE.SphereGeometry(0.5, 16, 16),
      color: 0x8B4513,
      scale: 1
    },
    {
      id: 'cone',
      name: 'Cone',
      geometry: new THREE.ConeGeometry(0.5, 1, 16),
      color: 0x8B4513,
      scale: 1
    },
    {
      id: 'cylinder',
      name: 'Cylinder',
      geometry: new THREE.CylinderGeometry(0.4, 0.4, 1, 16),
      color: 0x8B4513,
      scale: 1
    },
    {
      id: 'barrel',
      name: 'Barrel',
      geometry: new THREE.CylinderGeometry(0.4, 0.5, 1.2, 12),
      color: 0x654321,
      scale: 1
    },
    {
      id: 'crate',
      name: 'Crate',
      geometry: new THREE.BoxGeometry(1, 1, 1),
      color: 0x8B7355,
      scale: 1
    },
    {
      id: 'small_box',
      name: 'Small Box',
      geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
      color: 0x9B7653,
      scale: 1
    },
    {
      id: 'tall_box',
      name: 'Tall Box',
      geometry: new THREE.BoxGeometry(0.6, 1.5, 0.6),
      color: 0x7B6543,
      scale: 1
    }
  ];

  constructor() {
    this.loader = new GLTFLoader();
  }

  async loadModel(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  async preloadModels() {
    const modelsToLoad = this.propDefinitions.filter(p => p.modelPath);

    for (const prop of modelsToLoad) {
      try {
        const model = await this.loadModel(prop.modelPath!);
        this.loadedModels.set(prop.id, model);
        console.log(`Loaded model: ${prop.name}`);
      } catch (error) {
        console.warn(`Failed to load model ${prop.name}, will use fallback geometry`);
      }
    }
  }

  createProp(propId: string): THREE.Object3D {
    const definition = this.propDefinitions.find(p => p.id === propId);

    if (!definition) {
      console.warn(`Unknown prop ID: ${propId}, using default box`);
      return this.createDefaultProp();
    }

    // Try to use loaded model first
    if (definition.modelPath && this.loadedModels.has(propId)) {
      const model = this.loadedModels.get(propId)!;
      const clone = model.clone();
      if (definition.scale) {
        clone.scale.setScalar(definition.scale);
      }
      return clone;
    }

    // Fallback to geometry
    if (definition.geometry) {
      const material = new THREE.MeshStandardMaterial({
        color: definition.color || 0x8B4513,
        roughness: 0.7,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(definition.geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (definition.scale) {
        mesh.scale.setScalar(definition.scale);
      }

      return mesh;
    }

    return this.createDefaultProp();
  }

  private createDefaultProp(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  getAllPropDefinitions(): PropDefinition[] {
    return this.propDefinitions;
  }

  getPropDefinition(propId: string): PropDefinition | undefined {
    return this.propDefinitions.find(p => p.id === propId);
  }

  addPropDefinition(definition: PropDefinition) {
    this.propDefinitions.push(definition);
  }
}
