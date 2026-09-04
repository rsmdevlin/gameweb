import { AuthManager } from '../auth/AuthManager.js';
import type { GameServer } from 'shared';

export class LauncherUI {
  private container: HTMLElement;
  private currentScreen: 'main-menu' | 'server-browser' | 'lobby' | 'game' = 'main-menu';
  private authManager: AuthManager;
  private onPlayCallback?: () => void;
  private onJoinServerCallback?: (serverId: string, password?: string) => void;
  private onCreateServerCallback?: (config: any) => void;
  private onStartGameCallback?: () => void;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
    this.container = document.createElement('div');
    this.container.id = 'launcher';
    this.setupStyles();
    document.body.appendChild(this.container);
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #000;
        color: #fff;
        overflow: hidden;
      }

      #launcher {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        z-index: 1000;
        transition: opacity 0.5s ease;
      }

      #launcher.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .launcher-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(circle at 20% 50%, rgba(41, 128, 185, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(142, 68, 173, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }

      .launcher-particles {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
      }

      .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: float 15s infinite ease-in-out;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
      }

      .launcher-content {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .launcher-logo {
        font-size: 72px;
        font-weight: 800;
        letter-spacing: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 60px;
        text-transform: uppercase;
        animation: glow 2s ease-in-out infinite;
      }

      @keyframes glow {
        0%, 100% { filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.5)); }
        50% { filter: drop-shadow(0 0 40px rgba(102, 126, 234, 0.8)); }
      }

      .launcher-menu {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 400px;
      }

      .launcher-button {
        padding: 20px 40px;
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        border: 2px solid rgba(102, 126, 234, 0.5);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
        position: relative;
        overflow: hidden;
      }

      .launcher-button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
      }

      .launcher-button:hover::before {
        width: 300px;
        height: 300px;
      }

      .launcher-button:hover {
        transform: translateY(-2px);
        border-color: rgba(102, 126, 234, 1);
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4));
      }

      .launcher-button span {
        position: relative;
        z-index: 1;
      }

      .launcher-button.primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-color: #667eea;
      }

      .launcher-button.primary:hover {
        box-shadow: 0 10px 50px rgba(102, 126, 234, 0.6);
      }

      .screen {
        display: none;
        width: 100%;
        height: 100%;
        animation: fadeIn 0.5s ease;
      }

      .screen.active {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .server-browser {
        width: 90%;
        max-width: 1200px;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 16px;
        padding: 40px;
        backdrop-filter: blur(10px);
      }

      .server-browser-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      .server-browser-title {
        font-size: 36px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .server-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 30px;
        padding-right: 10px;
      }

      .server-list::-webkit-scrollbar {
        width: 8px;
      }

      .server-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }

      .server-list::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.5);
        border-radius: 4px;
      }

      .server-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: 20px;
        align-items: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .server-item:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.5);
        transform: translateX(5px);
      }

      .server-name {
        font-size: 18px;
        font-weight: 600;
      }

      .server-info {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      .server-players {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 16px;
      }

      .server-lock {
        color: #f39c12;
        font-size: 18px;
      }

      .button-group {
        display: flex;
        gap: 20px;
        margin-top: 20px;
      }

      .small-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        background: rgba(102, 126, 234, 0.2);
        border: 1px solid rgba(102, 126, 234, 0.5);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .small-button:hover {
        background: rgba(102, 126, 234, 0.4);
        border-color: rgba(102, 126, 234, 1);
      }

      .lobby-container {
        width: 90%;
        max-width: 800px;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 16px;
        padding: 40px;
        backdrop-filter: blur(10px);
      }

      .lobby-title {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 30px;
        text-align: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .player-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
      }

      .player-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }

      .player-name {
        font-size: 18px;
        font-weight: 600;
      }

      .player-ready {
        padding: 5px 15px;
        background: rgba(46, 204, 113, 0.3);
        border: 1px solid #2ecc71;
        border-radius: 6px;
        font-size: 14px;
        color: #2ecc71;
      }

      .input-group {
        margin-bottom: 20px;
      }

      .input-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }

      .input-field {
        width: 100%;
        padding: 12px 16px;
        font-size: 16px;
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .input-field:focus {
        outline: none;
        border-color: rgba(102, 126, 234, 1);
        background: rgba(255, 255, 255, 0.08);
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .modal.active {
        display: flex;
      }

      .modal-content {
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid rgba(102, 126, 234, 0.5);
        border-radius: 16px;
        padding: 40px;
        min-width: 400px;
        backdrop-filter: blur(20px);
      }

      .modal-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 30px;
        text-align: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
    document.head.appendChild(style);
  }

  showMainMenu() {
    this.currentScreen = 'main-menu';
    const user = this.authManager.getCurrentUser();

    this.container.innerHTML = `
      <div class="launcher-bg"></div>
      <div class="launcher-particles"></div>
      <div class="launcher-content">
        <div class="launcher-logo">PROP HUNT</div>
        <div style="margin-bottom: 20px; font-size: 18px; color: rgba(255,255,255,0.6);">
          Welcome, ${user?.username || 'Player'}
        </div>
        <div class="launcher-menu">
          <button class="launcher-button primary" id="play-btn">
            <span>PLAY</span>
          </button>
          <button class="launcher-button" id="settings-btn">
            <span>SETTINGS</span>
          </button>
          <button class="launcher-button" id="logout-btn">
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    `;

    this.createParticles();

    document.getElementById('play-btn')?.addEventListener('click', () => {
      this.showServerBrowser();
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      this.authManager.logout();
      window.location.reload();
    });
  }

  private createParticles() {
    const particlesContainer = this.container.querySelector('.launcher-particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  showServerBrowser() {
    this.currentScreen = 'server-browser';

    this.container.innerHTML = `
      <div class="launcher-bg"></div>
      <div class="launcher-content">
        <div class="server-browser">
          <div class="server-browser-header">
            <div class="server-browser-title">SERVER BROWSER</div>
            <button class="small-button" id="refresh-btn">🔄 REFRESH</button>
          </div>

          <div class="server-list" id="server-list">
            <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
              Loading servers...
            </div>
          </div>

          <div class="button-group">
            <button class="launcher-button primary" id="create-server-btn">
              <span>CREATE SERVER</span>
            </button>
            <button class="launcher-button" id="back-btn">
              <span>BACK</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-btn')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    document.getElementById('create-server-btn')?.addEventListener('click', () => {
      this.showCreateServerModal();
    });

    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.refreshServerList();
    });

    this.refreshServerList();
  }

  updateServerList(servers: GameServer[]) {
    const serverList = document.getElementById('server-list');
    if (!serverList) return;

    if (servers.length === 0) {
      serverList.innerHTML = `
        <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
          No servers available. Create one!
        </div>
      `;
      return;
    }

    serverList.innerHTML = servers.map(server => `
      <div class="server-item" data-server-id="${server.id}">
        <div class="server-name">${server.name}</div>
        <div class="server-info">${server.map}</div>
        <div class="server-info">${server.mode}</div>
        <div class="server-players">
          👥 ${server.currentPlayers}/${server.maxPlayers}
        </div>
        ${server.hasPassword ? '<div class="server-lock">🔒</div>' : '<div></div>'}
      </div>
    `).join('');

    serverList.querySelectorAll('.server-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const serverId = (e.currentTarget as HTMLElement).dataset.serverId;
        if (serverId) {
          const server = servers.find(s => s.id === serverId);
          if (server?.hasPassword) {
            this.showPasswordModal(serverId);
          } else {
            this.onJoinServerCallback?.(serverId);
          }
        }
      });
    });
  }

  private showCreateServerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">CREATE SERVER</div>

        <div class="input-group">
          <label class="input-label">Server Name</label>
          <input type="text" class="input-field" id="server-name" value="My Server" />
        </div>

        <div class="input-group">
          <label class="input-label">Max Players</label>
          <input type="number" class="input-field" id="max-players" value="8" min="2" max="16" />
        </div>

        <div class="input-group">
          <label class="input-label">Password (optional)</label>
          <input type="password" class="input-field" id="server-password" placeholder="Leave empty for public" />
        </div>

        <div class="button-group">
          <button class="launcher-button primary" id="confirm-create">
            <span>CREATE</span>
          </button>
          <button class="launcher-button" id="cancel-create">
            <span>CANCEL</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#confirm-create')?.addEventListener('click', () => {
      const name = (document.getElementById('server-name') as HTMLInputElement).value;
      const maxPlayers = parseInt((document.getElementById('max-players') as HTMLInputElement).value);
      const password = (document.getElementById('server-password') as HTMLInputElement).value;

      this.onCreateServerCallback?.({
        name,
        maxPlayers,
        password: password || undefined,
        map: 'Abandoned Hotel',
        mode: 'Prop Hunt'
      });

      modal.remove();
    });

    modal.querySelector('#cancel-create')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  private showPasswordModal(serverId: string) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">ENTER PASSWORD</div>

        <div class="input-group">
          <input type="password" class="input-field" id="join-password" placeholder="Server password" />
        </div>

        <div class="button-group">
          <button class="launcher-button primary" id="confirm-join">
            <span>JOIN</span>
          </button>
          <button class="launcher-button" id="cancel-join">
            <span>CANCEL</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#confirm-join')?.addEventListener('click', () => {
      const password = (document.getElementById('join-password') as HTMLInputElement).value;
      this.onJoinServerCallback?.(serverId, password);
      modal.remove();
    });

    modal.querySelector('#cancel-join')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  showLobby(players: any[], isHost: boolean) {
    this.currentScreen = 'lobby';

    this.container.innerHTML = `
      <div class="launcher-bg"></div>
      <div class="launcher-content">
        <div class="lobby-container">
          <div class="lobby-title">LOBBY</div>

          <div class="player-list" id="lobby-player-list">
            ${players.map(p => `
              <div class="player-item">
                <div class="player-name">${p.username}</div>
                <div class="player-ready">READY</div>
              </div>
            `).join('')}
          </div>

          <div class="button-group">
            ${isHost ? `
              <button class="launcher-button primary" id="start-game-btn">
                <span>START GAME</span>
              </button>
            ` : ''}
            <button class="launcher-button" id="leave-lobby-btn">
              <span>LEAVE</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (isHost) {
      document.getElementById('start-game-btn')?.addEventListener('click', () => {
        this.onStartGameCallback?.();
      });
    }

    document.getElementById('leave-lobby-btn')?.addEventListener('click', () => {
      this.showServerBrowser();
    });
  }

  updateLobbyPlayers(players: any[]) {
    const playerList = document.getElementById('lobby-player-list');
    if (!playerList) return;

    playerList.innerHTML = players.map(p => `
      <div class="player-item">
        <div class="player-name">${p.username}</div>
        <div class="player-ready">READY</div>
      </div>
    `).join('');
  }

  hide() {
    this.container.classList.add('hidden');
  }

  show() {
    this.container.classList.remove('hidden');
  }

  onPlay(callback: () => void) {
    this.onPlayCallback = callback;
  }

  onJoinServer(callback: (serverId: string, password?: string) => void) {
    this.onJoinServerCallback = callback;
  }

  onCreateServer(callback: (config: any) => void) {
    this.onCreateServerCallback = callback;
  }

  onStartGame(callback: () => void) {
    this.onStartGameCallback = callback;
  }

  private refreshServerList() {
    // This will be called from main.ts via GameClient
  }

  destroy() {
    this.container.remove();
  }
}
