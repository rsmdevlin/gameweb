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
      if (obj.userData.isProp || obj.userData.isGround || obj.userData.isWall || obj.userData.isStructure) {
        objectsToRemove.push(obj);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    // Create realistic ground with texture variation
    const groundGeometry = new THREE.PlaneGeometry(map.size.width, map.size.height, 50, 50);

    // Add height variation for terrain
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);
      const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;
      positions.setZ(i, noise);
    }
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5a40,
      roughness: 0.9,
      metalness: 0.1
    });

    // Add vertex colors for grass variation
    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const variation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = 0.23 * variation;
      colors[i * 3 + 1] = 0.35 * variation;
      colors[i * 3 + 2] = 0.25 * variation;
    }
    groundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundMaterial.vertexColors = true;

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.isGround = true;
    scene.add(ground);

    // Add atmosphere
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

    // Enhanced lighting
    this.setupSceneLighting(scene);

    // Add structures for cover
    this.addStructures(scene, map);

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

  private setupSceneLighting(scene: THREE.Scene) {
    // Remove old lights
    const lightsToRemove: THREE.Light[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Light && !obj.userData.keepLight) {
        lightsToRemove.push(obj);
      }
    });
    lightsToRemove.forEach(light => scene.remove(light));

    // Ambient light
    const ambient = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambient);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Hemisphere light for sky/ground
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a5a40, 0.6);
    scene.add(hemiLight);

    // Atmospheric point lights
    const pointLight1 = new THREE.PointLight(0xffaa00, 0.8, 25);
    pointLight1.position.set(20, 4, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00aaff, 0.8, 25);
    pointLight2.position.set(-20, 4, -20);
    scene.add(pointLight2);
  }

  private addStructures(scene: THREE.Scene, map: MapDefinition) {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8,
      metalness: 0.2
    });

    // Central tower
    const towerGeometry = new THREE.CylinderGeometry(2, 2.5, 8, 8);
    const tower = new THREE.Mesh(towerGeometry, wallMaterial);
    tower.position.set(0, 4, 0);
    tower.castShadow = true;
    tower.receiveShadow = true;
    tower.userData.isStructure = true;
    scene.add(tower);

    // Walls for cover
    const wallGeometry = new THREE.BoxGeometry(10, 3, 0.5);

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.set(0, 1.5, 25);
    wall1.castShadow = true;
    wall1.receiveShadow = true;
    wall1.userData.isStructure = true;
    scene.add(wall1);

    const wall2 = wall1.clone();
    wall2.position.set(0, 1.5, -25);
    wall2.userData.isStructure = true;
    scene.add(wall2);

    const wall3 = wall1.clone();
    wall3.rotation.y = Math.PI / 2;
    wall3.position.set(25, 1.5, 0);
    wall3.userData.isStructure = true;
    scene.add(wall3);

    const wall4 = wall1.clone();
    wall4.rotation.y = Math.PI / 2;
    wall4.position.set(-25, 1.5, 0);
    wall4.userData.isStructure = true;
    scene.add(wall4);

    // Platforms
    const platformGeometry = new THREE.BoxGeometry(4, 0.3, 4);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.7,
      metalness: 0.3
    });

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      const x = Math.cos(angle) * 15;
      const z = Math.sin(angle) * 15;

      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(x, 1.5, z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      platform.userData.isStructure = true;
      scene.add(platform);
    }
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
