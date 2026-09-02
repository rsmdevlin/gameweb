import * as THREE from 'three';
import type { PropManager } from './PropManager';

export interface MapDefinition {
  id: string;
  name: string;
  size: { width: number; height: number };
  spawnPoints: THREE.Vector3[];
  props: PropPlacement[];
}

export interface PropPlacement {
  propId: string;
  position: THREE.Vector3;
  rotation: number;
}

export class MapManager {
  private maps: Map<string, MapDefinition> = new Map();

  constructor(private propManager: PropManager) {
    this.initDefaultMaps();
  }

  private initDefaultMaps() {
    // Default Arena Map
    const arenaProps: PropPlacement[] = [];

    // Create a warehouse-style layout with lots of props
    // Boxes scattered around
    for (let i = 0; i < 15; i++) {
      arenaProps.push({
        propId: 'box',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.5,
          Math.random() * 40 - 20
        ),
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Barrels in clusters
    for (let i = 0; i < 10; i++) {
      arenaProps.push({
        propId: 'barrel',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.6,
          Math.random() * 40 - 20
        ),
        rotation: 0
      });
    }

    // Crates
    for (let i = 0; i < 12; i++) {
      arenaProps.push({
        propId: 'crate',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.5,
          Math.random() * 40 - 20
        ),
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Small boxes
    for (let i = 0; i < 20; i++) {
      arenaProps.push({
        propId: 'small_box',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.25,
          Math.random() * 40 - 20
        ),
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Tall boxes for cover
    for (let i = 0; i < 8; i++) {
      arenaProps.push({
        propId: 'tall_box',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.75,
          Math.random() * 40 - 20
        ),
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Spheres
    for (let i = 0; i < 15; i++) {
      arenaProps.push({
        propId: 'sphere',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.5,
          Math.random() * 40 - 20
        ),
        rotation: 0
      });
    }

    // Cones
    for (let i = 0; i < 10; i++) {
      arenaProps.push({
        propId: 'cone',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.5,
          Math.random() * 40 - 20
        ),
        rotation: 0
      });
    }

    // Cylinders
    for (let i = 0; i < 8; i++) {
      arenaProps.push({
        propId: 'cylinder',
        position: new THREE.Vector3(
          Math.random() * 40 - 20,
          0.5,
          Math.random() * 40 - 20
        ),
        rotation: 0
      });
    }

    const arena: MapDefinition = {
      id: 'arena',
      name: 'Default Arena',
      size: { width: 100, height: 100 },
      spawnPoints: [
        new THREE.Vector3(-15, 1, -15),
        new THREE.Vector3(15, 1, -15),
        new THREE.Vector3(-15, 1, 15),
        new THREE.Vector3(15, 1, 15),
        new THREE.Vector3(0, 1, -15),
        new THREE.Vector3(0, 1, 15),
        new THREE.Vector3(-15, 1, 0),
        new THREE.Vector3(15, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-10, 1, -10)
      ],
      props: arenaProps
    };

    this.maps.set('arena', arena);
  }

  loadMap(mapId: string, scene: THREE.Scene): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.error(`Map ${mapId} not found`);
      return false;
    }

    // Clear existing props (keep ground and lights)
    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData.isProp) {
        objectsToRemove.push(obj);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(map.size.width, map.size.height);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a8c3a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.isGround = true;
    scene.add(ground);

    // Add walls/boundaries (invisible collision boxes)
    const wallHeight = 5;
    const wallThickness = 1;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.3
    });

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(map.size.width, wallHeight, wallThickness),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -map.size.height / 2);
    northWall.userData.isWall = true;
    scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(map.size.width, wallHeight, wallThickness),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, map.size.height / 2);
    southWall.userData.isWall = true;
    scene.add(southWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, map.size.height),
      wallMaterial
    );
    westWall.position.set(-map.size.width / 2, wallHeight / 2, 0);
    westWall.userData.isWall = true;
    scene.add(westWall);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, map.size.height),
      wallMaterial
    );
    eastWall.position.set(map.size.width / 2, wallHeight / 2, 0);
    eastWall.userData.isWall = true;
    scene.add(eastWall);

    // Load all props
    map.props.forEach(placement => {
      const prop = this.propManager.createProp(placement.propId);
      prop.position.copy(placement.position);
      prop.rotation.y = placement.rotation;
      prop.userData.isProp = true;
      prop.userData.propId = placement.propId;
      scene.add(prop);
    });

    console.log(`Map ${map.name} loaded with ${map.props.length} props`);
    return true;
  }

  getMap(mapId: string): MapDefinition | undefined {
    return this.maps.get(mapId);
  }

  getAllMaps(): MapDefinition[] {
    return Array.from(this.maps.values());
  }

  getRandomSpawnPoint(mapId: string): THREE.Vector3 {
    const map = this.maps.get(mapId);
    if (!map || map.spawnPoints.length === 0) {
      return new THREE.Vector3(0, 1, 0);
    }

    const index = Math.floor(Math.random() * map.spawnPoints.length);
    return map.spawnPoints[index].clone();
  }
}
