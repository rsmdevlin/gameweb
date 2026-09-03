import type { AuthManager } from '../auth/AuthManager';

export class MainMenu {
  private container: HTMLElement;
  private onNavigate?: (screen: 'play' | 'server-browser' | 'profile' | 'settings') => void;
  private onLogout?: () => void;
  private username: string = '';

  constructor() {
    this.container = this.createMenu();
  }

  private createMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'main-menu';
    menu.innerHTML = `
      <div class="menu-background"></div>
      <div class="menu-container">
        <div class="menu-header">
          <h1 class="game-title">PROP HUNT</h1>
          <p class="game-subtitle">Hide or Seek in 3D Multiplayer</p>
          <div class="user-info">
            <span class="username-display"></span>
          </div>
        </div>

        <div class="menu-buttons">
          <button class="menu-btn menu-btn-primary" data-action="play">
            <span class="btn-icon">🎮</span>
            <span class="btn-text">PLAY</span>
          </button>

          <button class="menu-btn" data-action="server-browser">
            <span class="btn-icon">🌐</span>
            <span class="btn-text">SERVER BROWSER</span>
          </button>

          <button class="menu-btn" data-action="profile">
            <span class="btn-icon">👤</span>
            <span class="btn-text">PROFILE</span>
          </button>

          <button class="menu-btn" data-action="settings">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">SETTINGS</span>
          </button>

          <button class="menu-btn menu-btn-logout" data-action="logout">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">LOGOUT</span>
          </button>
        </div>

        <div class="menu-footer">
          <p>GameWeb v1.0 | 3D Multiplayer Prop Hunt</p>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .main-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .menu-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
        animation: backgroundShift 20s ease infinite;
      }

      @keyframes backgroundShift {
        0%, 100% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(30deg); }
      }

      .menu-container {
        position: relative;
        width: 90%;
        max-width: 600px;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 20px;
        padding: 50px 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
      }

      .menu-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .game-title {
        font-size: 56px;
        font-weight: 900;
        color: #fff;
        margin: 0 0 10px 0;
        text-shadow: 0 0 20px rgba(126, 34, 206, 0.8),
                     0 0 40px rgba(126, 34, 206, 0.4);
        letter-spacing: 4px;
      }

      .game-subtitle {
        font-size: 18px;
        color: #a0aec0;
        margin: 0 0 20px 0;
      }

      .user-info {
        margin-top: 15px;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        display: inline-block;
      }

      .username-display {
        color: #7e22ce;
        font-weight: 600;
        font-size: 16px;
      }

      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
      }

      .menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        padding: 18px 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        letter-spacing: 1px;
      }

      .menu-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      }

      .menu-btn:active {
        transform: translateY(-1px);
      }

      .menu-btn-primary {
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        box-shadow: 0 6px 20px rgba(126, 34, 206, 0.5);
        font-size: 22px;
        padding: 22px 35px;
      }

      .menu-btn-primary:hover {
        box-shadow: 0 10px 30px rgba(126, 34, 206, 0.7);
      }

      .menu-btn-logout {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      }

      .menu-btn-logout:hover {
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
      }

      .btn-icon {
        font-size: 24px;
      }

      .menu-footer {
        text-align: center;
        color: #718096;
        font-size: 14px;
        margin-top: 20px;
      }

      @media (max-width: 768px) {
        .menu-container {
          padding: 30px 20px;
        }

        .game-title {
          font-size: 40px;
        }

        .menu-btn {
          font-size: 16px;
          padding: 15px 25px;
        }

        .menu-btn-primary {
          font-size: 18px;
          padding: 18px 30px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(menu);

    // Setup button handlers
    menu.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset.action;

        if (action === 'logout' && this.onLogout) {
          this.onLogout();
        } else if (action && this.onNavigate) {
          this.onNavigate(action as any);
        }
      });
    });

    return menu;
  }

  setUsername(username: string) {
    this.username = username;
    const display = this.container.querySelector('.username-display');
    if (display) {
      display.textContent = `Logged in as ${username}`;
    }
  }

  onNav(callback: (screen: 'play' | 'server-browser' | 'profile' | 'settings') => void) {
    this.onNavigate = callback;
  }

  onLogoutClick(callback: () => void) {
    this.onLogout = callback;
  }

  show() {
    this.container.style.display = 'flex';
  }

  hide() {
    this.container.style.display = 'none';
  }

  destroy() {
    this.container.remove();
  }
}
