import * as THREE from 'three';
import type { GameState, Player, Vector3 } from 'shared';
import { MobileControls } from '../controls/MobileControls';
import { GameHUD } from '../ui/GameHUD';
import { PropManager } from '../game/PropManager';
import { MapManager } from '../game/MapManager';

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
  private propManager: PropManager;
  private mapManager: MapManager;

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
      antialias: false, // Disable AA for performance
      powerPreference: 'high-performance'
    });

    this.mobileControls = new MobileControls();
    this.hud = new GameHUD();
    this.propManager = new PropManager();
    this.mapManager = new MapManager(this.propManager);

    this.setupMobileControls();
    this.setupHUDHandlers();
  }

  init() {
    // Detect device performance tier
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isLowEnd = isMobile || navigator.hardwareConcurrency <= 4;

    // Renderer setup - ultra low quality for performance
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Lower pixel ratio drastically for performance
    const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(pixelRatio);

    // No shadows at all - huge performance gain
    this.renderer.shadowMap.enabled = false;

    // Scene setup
    this.scene.background = new THREE.Color(0x87CEEB);

    // Minimal fog
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 80);

    // Only ambient light - no directional for performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    // Ground and props loaded by MapManager
    this.mapManager.loadMap('arena', this.scene);

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
        this.emit('attack', null);
      }
    });

    // Touch camera rotation for mobile
    let lastTouchX = 0;
    let lastTouchY = 0;
    let isCameraTouch = false;
    let cameraTouchId: number | null = null;

    this.canvas.addEventListener('touchstart', (e) => {
      // Find a touch that's not on UI elements (joystick/buttons)
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const target = touch.target as HTMLElement;

        // Skip if touch is on joystick or buttons
        if (target.closest('.mobile-joystick') || target.closest('.mobile-buttons')) {
          continue;
        }

        // This is a camera rotation touch
        cameraTouchId = touch.identifier;
        isCameraTouch = true;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        break;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!isCameraTouch || cameraTouchId === null) return;

      // Find the camera touch
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === cameraTouchId) {
          const deltaX = touch.clientX - lastTouchX;
          const deltaY = touch.clientY - lastTouchY;

          this.mouseX -= deltaX * 0.005;
          this.mouseY -= deltaY * 0.005;
          this.mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.mouseY));

          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
          break;
        }
      }
    }, { passive: true });

    const resetCameraTouch = () => {
      isCameraTouch = false;
      cameraTouchId = null;
    };

    this.canvas.addEventListener('touchend', (e) => {
      if (!isCameraTouch || cameraTouchId === null) return;

      // Check if camera touch ended
      let cameraEnded = true;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === cameraTouchId) {
          cameraEnded = false;
          break;
        }
      }

      if (cameraEnded) {
        resetCameraTouch();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchcancel', resetCameraTouch, { passive: true });
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
    // Ultra-optimized low-poly capsule - 4 segments only
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: player.team === 'hunter' ? 0xff4444 : 0x4444ff,
      flatShading: true // Faster rendering
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(player.position.x, player.position.y, player.position.z);

    // No shadows on mobile for performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

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
    // Stop animation loop
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Hide and clean up mobile controls
    if (this.mobileControls) {
      this.mobileControls.hide();
    }

    // Hide and clean up HUD
    if (this.hud) {
      this.hud.hide();
    }

    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize());

    // Clear scene
    this.scene.clear();

    // Clear player meshes
    this.players.clear();
  }
}
