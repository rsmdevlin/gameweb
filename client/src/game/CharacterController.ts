import * as THREE from 'three';
import { CharacterModel } from './CharacterModel.js';

export class CharacterController {
  public character: CharacterModel;
  public camera: THREE.PerspectiveCamera;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private moveSpeed: number = 5;
  private runSpeed: number = 10;
  private jumpForce: number = 10;
  private gravity: number = -20;
  private isGrounded: boolean = true;
  private isRunning: boolean = false;

  // Camera settings
  private cameraDistance: number = 5;
  private cameraHeight: number = 2;
  private cameraSensitivity: number = 0.002;
  private cameraAngleX: number = 0;
  private cameraAngleY: number = 0.3;
  private minCameraAngleY: number = -Math.PI / 3;
  private maxCameraAngleY: number = Math.PI / 3;

  // Input state
  private keys: { [key: string]: boolean } = {};
  private mouseMovement: { x: number; y: number } = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.character = new CharacterModel();
    this.setupControls();
  }

  async loadCharacter(modelPath: string): Promise<void> {
    await this.character.load(modelPath);
  }

  private setupControls() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'ShiftLeft') {
        this.isRunning = true;
      }

      if (e.code === 'Space' && this.isGrounded) {
        this.jump();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      if (e.code === 'ShiftLeft') {
        this.isRunning = false;
      }
    });

    // Mouse (only when pointer is locked)
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.mouseMovement.x += e.movementX;
        this.mouseMovement.y += e.movementY;
      }
    });

    // Pointer lock on click
    document.addEventListener('click', () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    });
  }

  private jump() {
    this.velocity.y = this.jumpForce;
    this.isGrounded = false;
    this.character.playAnimation('jump', 0.1);
  }

  update(deltaTime: number) {
    // Update camera rotation from mouse
    this.cameraAngleX -= this.mouseMovement.x * this.cameraSensitivity;
    this.cameraAngleY -= this.mouseMovement.y * this.cameraSensitivity;
    this.cameraAngleY = Math.max(this.minCameraAngleY, Math.min(this.maxCameraAngleY, this.cameraAngleY));
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;

    // Get movement input
    const moveDirection = new THREE.Vector3();
    if (this.keys['KeyW']) moveDirection.z -= 1;
    if (this.keys['KeyS']) moveDirection.z += 1;
    if (this.keys['KeyA']) moveDirection.x -= 1;
    if (this.keys['KeyD']) moveDirection.x += 1;

    const hasMovement = moveDirection.length() > 0;

    if (hasMovement) {
      moveDirection.normalize();

      // Rotate movement direction based on camera angle
      const cameraRotation = new THREE.Quaternion();
      cameraRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleX);
      moveDirection.applyQuaternion(cameraRotation);

      // Apply movement
      const speed = this.isRunning ? this.runSpeed : this.moveSpeed;
      this.velocity.x = moveDirection.x * speed;
      this.velocity.z = moveDirection.z * speed;

      // Rotate character to face movement direction
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
      this.character.setRotation(targetAngle);

      // Play animation
      if (this.isGrounded) {
        if (this.isRunning) {
          this.character.playAnimation('run', 0.2);
        } else {
          this.character.playAnimation('walk', 0.2);
        }
      }
    } else {
      // Decelerate horizontal movement
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;

      // Play idle if grounded and not moving
      if (this.isGrounded && Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.z) < 0.1) {
        this.character.playAnimation('idle', 0.3);
      }
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // Update position
    const position = this.character.getPosition();
    position.x += this.velocity.x * deltaTime;
    position.y += this.velocity.y * deltaTime;
    position.z += this.velocity.z * deltaTime;

    // Simple ground collision (y = 0)
    if (position.y <= 0) {
      position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    this.character.setPosition(position.x, position.y, position.z);

    // Update character animations
    this.character.update(deltaTime);

    // Update camera position
    this.updateCamera();
  }

  private updateCamera() {
    const characterPos = this.character.getPosition();

    // Calculate camera offset based on angles
    const offsetX = Math.sin(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);
    const offsetY = Math.sin(this.cameraAngleY) * this.cameraDistance + this.cameraHeight;
    const offsetZ = Math.cos(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);

    // Set camera position
    this.camera.position.set(
      characterPos.x + offsetX,
      characterPos.y + offsetY,
      characterPos.z + offsetZ
    );

    // Look at character
    this.camera.lookAt(characterPos.x, characterPos.y + this.cameraHeight, characterPos.z);
  }

  getPosition(): THREE.Vector3 {
    return this.character.getPosition();
  }

  getRotation(): number {
    return this.character.model?.rotation.y || 0;
  }

  addToScene(scene: THREE.Scene) {
    this.character.addToScene(scene);
  }

  removeFromScene(scene: THREE.Scene) {
    this.character.removeFromScene(scene);
  }

  dispose() {
    this.character.dispose();
  }
}
