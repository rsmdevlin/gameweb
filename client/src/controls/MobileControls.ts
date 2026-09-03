export class MobileControls {
  private joystickElement: HTMLElement;
  private buttonsElement: HTMLElement;
  private joystickKnob: HTMLElement;
  private joystickBase: HTMLElement;

  private moveX = 0;
  private moveY = 0;
  private isJoystickActive = false;

  private callbacks: {
    onMove?: (x: number, y: number) => void;
    onAttack?: () => void;
    onTransform?: () => void;
  } = {};

  constructor() {
    this.joystickElement = this.createJoystick();
    this.buttonsElement = this.createButtons();

    this.joystickBase = this.joystickElement.querySelector('.joystick-base') as HTMLElement;
    this.joystickKnob = this.joystickElement.querySelector('.joystick-knob') as HTMLElement;

    this.setupJoystick();

    // Only show on mobile/tablet
    if (this.isMobileDevice()) {
      this.show();
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private createJoystick(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mobile-joystick';
    container.innerHTML = `
      <div class="joystick-base">
        <div class="joystick-knob"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .mobile-joystick {
        position: fixed;
        bottom: 30px;
        left: 30px;
        z-index: 1000;
        display: none;
      }

      .mobile-joystick.active {
        display: block;
      }

      .joystick-base {
        width: 120px;
        height: 120px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(126, 34, 206, 0.6);
        border-radius: 50%;
        position: relative;
        touch-action: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .joystick-knob {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.1s;
        box-shadow: 0 2px 10px rgba(126, 34, 206, 0.5);
      }

      .mobile-buttons {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        display: none;
        flex-direction: column;
        gap: 15px;
      }

      .mobile-buttons.active {
        display: flex;
      }

      .mobile-button {
        width: 70px;
        height: 70px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(126, 34, 206, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        cursor: pointer;
        touch-action: none;
        transition: all 0.2s;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .mobile-button:active {
        transform: scale(0.9);
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 10px rgba(126, 34, 206, 0.7);
      }
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        touch-action: none;
        user-select: none;
      }

      .mobile-button:active {
        background: rgba(255, 255, 255, 0.5);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    return container;
  }

  private createButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mobile-buttons';
    container.innerHTML = `
      <button class="mobile-button" data-action="attack">⚔️</button>
      <button class="mobile-button" data-action="transform">🎭</button>
    `;

    document.body.appendChild(container);

    // Button handlers
    container.querySelectorAll('.mobile-button').forEach(button => {
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const action = (button as HTMLElement).dataset.action;

        if (action === 'attack' && this.callbacks.onAttack) {
          this.callbacks.onAttack();
        } else if (action === 'transform' && this.callbacks.onTransform) {
          this.callbacks.onTransform();
        }
      });
    });

    return container;
  }

  private setupJoystick() {
    const handleMove = (clientX: number, clientY: number) => {
      if (!this.isJoystickActive) return;

      const rect = this.joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      const maxDistance = rect.width / 2 - 25;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }

      this.joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

      this.moveX = deltaX / maxDistance;
      this.moveY = deltaY / maxDistance;

      if (this.callbacks.onMove) {
        this.callbacks.onMove(this.moveX, this.moveY);
      }
    };

    this.joystickBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isJoystickActive = true;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isJoystickActive && e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener('touchend', () => {
      if (this.isJoystickActive) {
        this.isJoystickActive = false;
        this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        this.moveX = 0;
        this.moveY = 0;

        if (this.callbacks.onMove) {
          this.callbacks.onMove(0, 0);
        }
      }
    });
  }

  show() {
    this.joystickElement.classList.add('active');
    this.buttonsElement.classList.add('active');
  }

  hide() {
    this.joystickElement.classList.remove('active');
    this.buttonsElement.classList.remove('active');
  }

  onMove(callback: (x: number, y: number) => void) {
    this.callbacks.onMove = callback;
  }

  onAttack(callback: () => void) {
    this.callbacks.onAttack = callback;
  }

  onTransform(callback: () => void) {
    this.callbacks.onTransform = callback;
  }

  getMoveVector(): { x: number; y: number } {
    return { x: this.moveX, y: this.moveY };
  }
}
