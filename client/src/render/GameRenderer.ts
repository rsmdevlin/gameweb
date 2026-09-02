import * as THREE from 'three';
import type { GameState, Player, Vector3 } from 'shared';
import { MobileControls } from '../controls/MobileControls';
import { GameHUD } from '../ui/GameHUD';

type EventCallback = (data?: any) => void;

export class GameRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private players: Map<string, THREE.Mesh> = new Map();
  private events: Map<string, EventCallback[]> = new Map();
  private gameState: GameState | null = null;
  private mobileControls: MobileControls;
  private hud: GameHUD;

  // Player control
  private localPlayerId: string | null = null;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private mobileMove = { x: 0, y: 0 };

  // Camera
  private cameraOffset = new THREE.Vector3(0, 5, 10);
  private mouseX = 0;
  private mouseY = 0;
  private isPointerLocked = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });

    this.mobileControls = new MobileControls();
    this.hud = new GameHUD();

    this.setupMobileControls();
    this.setupHUDHandlers();
  }

  init() {
    // Renderer setup
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene setup
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a8c3a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add some basic props for testing
    this.createTestProps();

    // Camera position
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Controls
    this.setupControls();

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start render loop
    this.animate();
  }

  private createTestProps() {
    // Create some basic 3D objects as props
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 16);

    const material = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7
    });

    // Add boxes
    for (let i = 0; i < 10; i++) {
      const box = new THREE.Mesh(boxGeometry, material.clone());
      box.position.set(
        Math.random() * 40 - 20,
        0.5,
        Math.random() * 40 - 20
      );
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box);
    }

    // Add spheres
    for (let i = 0; i < 10; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, material.clone());
      sphere.position.set(
        Math.random() * 40 - 20,
        0.5,
        Math.random() * 40 - 20
      );
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      this.scene.add(sphere);
    }

    // Add cones
    for (let i = 0; i < 5; i++) {
      const cone = new THREE.Mesh(coneGeometry, material.clone());
      cone.position.set(
        Math.random() * 40 - 20,
        0.5,
        Math.random() * 40 - 20
      );
      cone.castShadow = true;
      cone.receiveShadow = true;
      this.scene.add(cone);
    }
  }

  private setupMobileControls() {
    this.mobileControls.onMove((x, y) => {
      this.mobileMove.x = x;
      this.mobileMove.y = -y; // Invert Y for forward/backward
    });

    this.mobileControls.onAttack(() => {
      this.emit('attack', null);
    });

    this.mobileControls.onTransform(() => {
      this.emit('transform', 'box');
    });
  }

  private setupHUDHandlers() {
    this.hud.onChat((message) => {
      this.emit('chat', message);
    });
  }

  private setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': this.moveForward = true; break;
        case 'KeyS': this.moveBackward = true; break;
        case 'KeyA': this.moveLeft = true; break;
        case 'KeyD': this.moveRight = true; break;
        case 'KeyE': this.emit('transform', 'box'); break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': this.moveForward = false; break;
        case 'KeyS': this.moveBackward = false; break;
        case 'KeyA': this.moveLeft = false; break;
        case 'KeyD': this.moveRight = false; break;
      }
    });

    // Mouse controls
    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseX -= e.movementX * 0.002;
        this.mouseY -= e.movementY * 0.002;
        this.mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.mouseY));
      }
    });

    // Mouse click for attack
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.isPointerLocked) {
        this.emit('attack', null); // Raycast target later
      }
    });
  }

  updateGameState(gameState: GameState) {
    this.gameState = gameState;

    // Update HUD
    this.hud.updateGameState(gameState);

    // Update local player health
    if (this.localPlayerId && gameState.players[this.localPlayerId]) {
      const localPlayer = gameState.players[this.localPlayerId];
      this.hud.updateHealth(localPlayer.health);
    }

    // Update or create player meshes
    Object.entries(gameState.players).forEach(([playerId, player]) => {
      if (!this.players.has(playerId)) {
        this.createPlayerMesh(playerId, player);
      } else {
        this.updatePlayerMesh(playerId, player);
      }
    });

    // Remove disconnected players
    for (const playerId of this.players.keys()) {
      if (!gameState.players[playerId]) {
        const mesh = this.players.get(playerId);
        if (mesh) {
          this.scene.remove(mesh);
          this.players.delete(playerId);
        }
      }
    }
  }

  setLocalPlayerId(playerId: string) {
    this.localPlayerId = playerId;
  }

  addChatMessage(username: string, message: string) {
    this.hud.addChatMessage(username, message);
  }

  private createPlayerMesh(playerId: string, player: Player) {
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: player.team === 'hunter' ? 0xff4444 : 0x4444ff
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(player.position.x, player.position.y, player.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.players.set(playerId, mesh);
    this.scene.add(mesh);
  }

  private updatePlayerMesh(playerId: string, player: Player) {
    const mesh = this.players.get(playerId);
    if (mesh) {
      mesh.position.set(player.position.x, player.position.y, player.position.z);
      mesh.rotation.y = player.rotation.y;
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Update player movement
    if (this.gameState && this.localPlayerId) {
      const speed = 0.1;

      this.direction.set(0, 0, 0);

      // Desktop controls
      if (this.moveForward) this.direction.z -= 1;
      if (this.moveBackward) this.direction.z += 1;
      if (this.moveLeft) this.direction.x -= 1;
      if (this.moveRight) this.direction.x += 1;

      // Mobile controls
      if (this.mobileMove.x !== 0 || this.mobileMove.y !== 0) {
        this.direction.x += this.mobileMove.x;
        this.direction.z += this.mobileMove.y;
      }

      if (this.direction.length() > 0) {
        this.direction.normalize();

        // Rotate direction based on camera
        this.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mouseX);

        this.velocity.x = this.direction.x * speed;
        this.velocity.z = this.direction.z * speed;

        const localPlayer = this.gameState.players[this.localPlayerId];
        if (localPlayer) {
          const newPos = {
            x: localPlayer.position.x + this.velocity.x,
            y: localPlayer.position.y,
            z: localPlayer.position.z + this.velocity.z
          };

          const newRot = {
            x: 0,
            y: this.mouseX,
            z: 0
          };

          this.emit('playerMove', {
            position: newPos,
            rotation: newRot,
            velocity: { x: this.velocity.x, y: 0, z: this.velocity.z }
          });
        }
      }

      // Update camera
      const localPlayer = this.gameState.players[this.localPlayerId];
      if (localPlayer) {
        const playerPos = new THREE.Vector3(
          localPlayer.position.x,
          localPlayer.position.y,
          localPlayer.position.z
        );

        const offset = new THREE.Vector3(
          Math.sin(this.mouseX) * this.cameraOffset.z,
          this.cameraOffset.y + this.mouseY * 5,
          Math.cos(this.mouseX) * this.cameraOffset.z
        );

        this.camera.position.copy(playerPos).add(offset);
        this.camera.lookAt(playerPos);
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  private emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  dispose() {
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
