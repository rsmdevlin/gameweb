import { AuthManager } from './auth/AuthManager';
import { GameClient } from './game/GameClient';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3000/ws';

class App {
  private authManager: AuthManager;
  private gameClient: GameClient | null = null;

  constructor() {
    this.authManager = new AuthManager(API_URL);
    this.init();
  }

  private async init() {
    // Show loading screen
    this.showScreen('loading-screen');

    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      const valid = await this.authManager.verifyToken(token);
      if (valid) {
        this.startGame(token);
        return;
      }
    }

    // Show auth screen
    this.showScreen('auth-screen');
    this.setupAuthHandlers();
  }

  private setupAuthHandlers() {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    const showRegister = document.getElementById('show-register') as HTMLAnchorElement;
    const showLogin = document.getElementById('show-login') as HTMLAnchorElement;
    const errorDiv = document.getElementById('auth-error') as HTMLDivElement;

    // Toggle forms
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      errorDiv.style.display = 'none';
    });

    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      errorDiv.style.display = 'none';
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value;
      const password = (document.getElementById('login-password') as HTMLInputElement).value;

      try {
        const result = await this.authManager.login(email, password);
        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
          this.startGame(result.token);
        }
      } catch (error: any) {
        errorDiv.textContent = error.message || 'Login failed';
        errorDiv.style.display = 'block';
      }
    });

    // Register
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (document.getElementById('register-username') as HTMLInputElement).value;
      const email = (document.getElementById('register-email') as HTMLInputElement).value;
      const password = (document.getElementById('register-password') as HTMLInputElement).value;

      try {
        const result = await this.authManager.register(username, email, password);
        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
          this.startGame(result.token);
        }
      } catch (error: any) {
        errorDiv.textContent = error.message || 'Registration failed';
        errorDiv.style.display = 'block';
      }
    });
  }

  private startGame(token: string) {
    this.showScreen('loading-screen');

    // Initialize game client
    this.gameClient = new GameClient(WS_URL, token);

    this.gameClient.on('connected', () => {
      this.showScreen('game-screen');
    });

    this.gameClient.on('error', (error) => {
      console.error('Game error:', error);
      alert('Connection error. Please refresh the page.');
    });

    this.gameClient.connect();
  }

  private showScreen(screenId: string) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId)?.classList.add('active');
  }
}

// Start app
new App();
