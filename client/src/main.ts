import { AuthManager } from './auth/AuthManager';
import { GameClient } from './game/GameClient';
import { MainMenu } from './ui/MainMenu';
import { ServerBrowser } from './ui/ServerBrowser';
import { Lobby } from './ui/Lobby';
import { MessageType, type GameServer } from 'shared';

// Use relative URLs in production, localhost in development
const API_URL = (import.meta as any).env?.VITE_API_URL || window.location.origin;
const WS_URL = (import.meta as any).env?.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

class App {
  private authManager: AuthManager;
  private gameClient: GameClient | null = null;
  private mainMenu: MainMenu | null = null;
  private serverBrowser: ServerBrowser | null = null;
  private lobby: Lobby | null = null;
  private currentUser: { username: string; token: string; userId?: string } | null = null;
  private currentServer: GameServer | null = null;

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
        const username = localStorage.getItem('username') || 'Player';
        this.currentUser = { username, token };
        this.showMainMenu();
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
        if (result.success && result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('username', result.user.username);
          this.currentUser = { username: result.user.username, token: result.token };
          this.showMainMenu();
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
          localStorage.setItem('username', username);
          this.currentUser = { username, token: result.token };
          this.showMainMenu();
        }
      } catch (error: any) {
        errorDiv.textContent = error.message || 'Registration failed';
        errorDiv.style.display = 'block';
      }
    });
  }

  private showMainMenu() {
    this.hideAllScreens();

    if (!this.mainMenu) {
      this.mainMenu = new MainMenu();
      this.mainMenu.setUsername(this.currentUser?.username || 'Player');

      this.mainMenu.onNav((screen) => {
        switch (screen) {
          case 'play':
          case 'server-browser':
            this.showServerBrowser();
            break;
          case 'profile':
            alert('Profile screen coming soon!');
            break;
          case 'settings':
            alert('Settings screen coming soon!');
            break;
        }
      });

      this.mainMenu.onLogoutClick(() => {
        this.handleLogout();
      });
    }

    this.mainMenu.show();
  }

  private showServerBrowser() {
    if (this.mainMenu) {
      this.mainMenu.hide();
    }

    if (!this.serverBrowser) {
      this.serverBrowser = new ServerBrowser();

      this.serverBrowser.onBackClick(() => {
        this.serverBrowser?.hide();
        this.showMainMenu();
      });

      this.serverBrowser.onJoin((serverId, password) => {
        this.joinServer(serverId, password);
      });

      this.serverBrowser.onCreate((config) => {
        this.createServer(config);
      });
    }

    this.serverBrowser.show();
    this.loadServerList();
  }

  private async loadServerList() {
    try {
      const response = await fetch(`${API_URL}/api/servers`, {
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`
        }
      });

      if (response.ok) {
        const servers: GameServer[] = await response.json();
        this.serverBrowser?.updateServerList(servers);
      } else {
        console.error('Failed to load servers');
        this.serverBrowser?.updateServerList([]);
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      this.serverBrowser?.updateServerList([]);
    }
  }

  private async createServer(config: { name: string; map: string; maxPlayers: number; password?: string }) {
    try {
      const response = await fetch(`${API_URL}/api/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentUser?.token}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const server = await response.json();
        alert(`Server "${config.name}" created successfully!`);
        this.joinServer(server.id);
      } else {
        const error = await response.json();
        alert(`Failed to create server: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating server:', error);
      alert('Failed to create server. Please try again.');
    }
  }

  private joinServer(serverId: string, password?: string) {
    if (!this.currentUser) return;

    this.serverBrowser?.hide();
    this.showScreen('loading-screen');

    // Initialize game client
    this.gameClient = new GameClient(WS_URL, this.currentUser.token);

    this.gameClient.on('connected', (data: any) => {
      // Save userId from auth
      if (data?.userId && this.currentUser) {
        this.currentUser.userId = data.userId;
      }

      // Send join server request
      this.gameClient?.send({
        type: MessageType.JOIN_SERVER,
        data: { serverId, password },
        timestamp: Date.now()
      });
    });

    this.gameClient.on('joined_server', (data: any) => {
      this.currentServer = data.server;
      this.showLobby(data.server, data.gameState);
    });

    this.gameClient.on('lobby_update', (data: any) => {
      if (this.lobby) {
        this.lobby.updatePlayers(data.players, data.hostId, this.currentServer?.maxPlayers || 10);
      }
    });

    this.gameClient.on('game_started', () => {
      this.lobby?.hide();
      this.showScreen('game-screen');
    });

    this.gameClient.on('error', (error) => {
      console.error('Game error:', error);
      const errorMessage = typeof error === 'string' ? error : error?.error || error?.message || 'Unknown error';
      alert('Connection error: ' + errorMessage);
      this.serverBrowser?.show();
      this.hideAllScreens();
    });

    this.gameClient.connect();
  }

  private showLobby(server: GameServer, gameState: any) {
    this.hideAllScreens();

    if (!this.lobby) {
      this.lobby = new Lobby();

      this.lobby.onLeaveClick(() => {
        if (confirm('Are you sure you want to leave?')) {
          this.gameClient?.send({
            type: MessageType.LEAVE_SERVER,
            data: {},
            timestamp: Date.now()
          });
          this.lobby?.hide();
          this.showServerBrowser();
        }
      });

      this.lobby.onStart(() => {
        this.gameClient?.send({
          type: MessageType.START_GAME,
          data: {},
          timestamp: Date.now()
        });
      });
    }

    this.lobby.setServerInfo(server.name, server.map, server.maxPlayers);
    this.lobby.setHost(server.hostId === this.currentUser?.userId);
    this.lobby.updatePlayers(gameState.players, server.hostId, server.maxPlayers);
    this.lobby.show();
  }

  private handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.currentUser = null;
    this.currentServer = null;

    if (this.mainMenu) {
      this.mainMenu.destroy();
      this.mainMenu = null;
    }

    if (this.serverBrowser) {
      this.serverBrowser.destroy();
      this.serverBrowser = null;
    }

    if (this.lobby) {
      this.lobby.destroy();
      this.lobby = null;
    }

    if (this.gameClient) {
      this.gameClient.disconnect();
      this.gameClient = null;
    }

    this.showScreen('auth-screen');
  }

  private hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
  }

  private showScreen(screenId: string) {
    console.log('[App] Switching to screen:', screenId);
    this.hideAllScreens();
    const screen = document.getElementById(screenId);
    console.log('[App] Screen element:', screen);
    if (screen) {
      screen.classList.add('active');
      console.log('[App] Screen classes:', screen.className);
    } else {
      console.error('[App] Screen not found:', screenId);
    }
  }
}

// Start app
new App();
