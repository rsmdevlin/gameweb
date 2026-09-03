import type { GameServer } from 'shared';

export class ServerBrowser {
  private container: HTMLElement;
  private onJoinServer?: (serverId: string, password?: string) => void;
  private onCreateServer?: (config: { name: string; map: string; maxPlayers: number; password?: string }) => void;
  private onBack?: () => void;

  constructor() {
    this.container = this.createBrowser();
  }

  private createBrowser(): HTMLElement {
    const browser = document.createElement('div');
    browser.className = 'server-browser';
    browser.innerHTML = `
      <div class="browser-container">
        <div class="browser-header">
          <button class="back-btn">← Back</button>
          <h2>Server Browser</h2>
          <button class="create-server-btn">+ Create Server</button>
        </div>

        <div class="server-list-container">
          <div class="server-list-header">
            <span>Server Name</span>
            <span>Map</span>
            <span>Players</span>
            <span>Action</span>
          </div>
          <div class="server-list"></div>
          <div class="no-servers" style="display: none;">
            <p>No servers available</p>
            <p class="hint">Create your own server to start playing!</p>
          </div>
        </div>

        <!-- Create Server Modal -->
        <div class="modal" id="create-server-modal" style="display: none;">
          <div class="modal-content">
            <h3>Create Server</h3>
            <form id="create-server-form">
              <div class="form-group">
                <label>Server Name</label>
                <input type="text" id="server-name" required maxlength="50" placeholder="My Awesome Server">
              </div>

              <div class="form-group">
                <label>Map</label>
                <select id="server-map">
                  <option value="arena">Default Arena</option>
                </select>
              </div>

              <div class="form-group">
                <label>Max Players</label>
                <input type="number" id="server-max-players" min="2" max="16" value="10">
              </div>

              <div class="form-group">
                <label>Password (Optional)</label>
                <input type="password" id="server-password" placeholder="Leave empty for public server">
              </div>

              <div class="form-buttons">
                <button type="button" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-create">Create Server</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Join Password Modal -->
        <div class="modal" id="join-password-modal" style="display: none;">
          <div class="modal-content">
            <h3>Enter Server Password</h3>
            <form id="join-password-form">
              <div class="form-group">
                <input type="password" id="join-password" placeholder="Password" required>
              </div>
              <div class="form-buttons">
                <button type="button" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-join">Join</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .server-browser {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        display: none;
        z-index: 1000;
      }

      .server-browser.active {
        display: block;
      }

      .browser-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .browser-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      .browser-header h2 {
        color: white;
        font-size: 36px;
        margin: 0;
      }

      .back-btn, .create-server-btn {
        padding: 12px 24px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .back-btn:hover, .create-server-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .create-server-btn {
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        border: none;
      }

      .server-list-container {
        flex: 1;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        padding: 20px;
        overflow-y: auto;
      }

      .server-list-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 15px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        margin-bottom: 15px;
        color: white;
        font-weight: 600;
      }

      .server-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .server-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 15px;
        align-items: center;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        transition: all 0.3s;
      }

      .server-item:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(126, 34, 206, 0.5);
        transform: translateX(5px);
      }

      .server-name {
        font-weight: 600;
        font-size: 18px;
      }

      .server-locked {
        color: #fbbf24;
      }

      .server-players {
        color: #a0aec0;
      }

      .server-players.full {
        color: #ef4444;
      }

      .join-btn {
        padding: 8px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .join-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
      }

      .join-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .no-servers {
        text-align: center;
        padding: 60px 20px;
        color: white;
      }

      .no-servers p {
        font-size: 20px;
        margin: 10px 0;
      }

      .no-servers .hint {
        color: #a0aec0;
        font-size: 16px;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }

      .modal-content {
        background: rgba(30, 30, 30, 0.95);
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        border: 2px solid rgba(255, 255, 255, 0.1);
      }

      .modal-content h3 {
        color: white;
        margin: 0 0 20px 0;
        font-size: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        color: white;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        font-size: 16px;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #7e22ce;
      }

      .form-buttons {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
      }

      .btn-cancel, .btn-create, .btn-join {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .btn-create, .btn-join {
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        color: white;
      }

      .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .btn-create:hover, .btn-join:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(126, 34, 206, 0.5);
      }

      @media (max-width: 768px) {
        .server-list-header,
        .server-item {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .browser-header {
          flex-direction: column;
          gap: 15px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(browser);

    this.setupHandlers(browser);

    return browser;
  }

  private setupHandlers(browser: HTMLElement) {
    // Back button
    browser.querySelector('.back-btn')?.addEventListener('click', () => {
      if (this.onBack) this.onBack();
    });

    // Create server button
    browser.querySelector('.create-server-btn')?.addEventListener('click', () => {
      this.showCreateModal();
    });

    // Create server form
    const createForm = browser.querySelector('#create-server-form') as HTMLFormElement;
    createForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateServer();
    });

    // Modal cancel buttons
    browser.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        this.hideModals();
      });
    });
  }

  private showCreateModal() {
    const modal = this.container.querySelector('#create-server-modal') as HTMLElement;
    modal.style.display = 'flex';
  }

  private hideModals() {
    this.container.querySelectorAll('.modal').forEach(modal => {
      (modal as HTMLElement).style.display = 'none';
    });
  }

  private handleCreateServer() {
    const name = (this.container.querySelector('#server-name') as HTMLInputElement).value;
    const map = (this.container.querySelector('#server-map') as HTMLSelectElement).value;
    const maxPlayers = parseInt((this.container.querySelector('#server-max-players') as HTMLInputElement).value);
    const password = (this.container.querySelector('#server-password') as HTMLInputElement).value;

    if (this.onCreateServer) {
      this.onCreateServer({
        name,
        map,
        maxPlayers,
        password: password || undefined
      });
    }

    this.hideModals();
  }

  updateServerList(servers: GameServer[]) {
    const list = this.container.querySelector('.server-list') as HTMLElement;
    const noServers = this.container.querySelector('.no-servers') as HTMLElement;

    if (servers.length === 0) {
      list.innerHTML = '';
      noServers.style.display = 'block';
      return;
    }

    noServers.style.display = 'none';
    list.innerHTML = servers.map(server => `
      <div class="server-item">
        <div class="server-name">
          ${server.name}
          ${server.hasPassword ? '<span class="server-locked">🔒</span>' : ''}
        </div>
        <div>${server.map}</div>
        <div class="server-players ${server.currentPlayers >= server.maxPlayers ? 'full' : ''}">
          ${server.currentPlayers}/${server.maxPlayers}
        </div>
        <div>
          <button
            class="join-btn"
            data-server-id="${server.id}"
            data-has-password="${server.hasPassword}"
            ${server.currentPlayers >= server.maxPlayers ? 'disabled' : ''}
          >
            Join
          </button>
        </div>
      </div>
    `).join('');

    // Add join handlers
    list.querySelectorAll('.join-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const serverId = (btn as HTMLElement).dataset.serverId!;
        const hasPassword = (btn as HTMLElement).dataset.hasPassword === 'true';

        if (hasPassword) {
          this.showJoinPasswordModal(serverId);
        } else if (this.onJoinServer) {
          this.onJoinServer(serverId);
        }
      });
    });
  }

  private showJoinPasswordModal(serverId: string) {
    const modal = this.container.querySelector('#join-password-modal') as HTMLElement;
    modal.style.display = 'flex';

    const form = modal.querySelector('#join-password-form') as HTMLFormElement;
    form.onsubmit = (e) => {
      e.preventDefault();
      const password = (modal.querySelector('#join-password') as HTMLInputElement).value;
      if (this.onJoinServer) {
        this.onJoinServer(serverId, password);
      }
      this.hideModals();
    };
  }

  onJoin(callback: (serverId: string, password?: string) => void) {
    this.onJoinServer = callback;
  }

  onCreate(callback: (config: { name: string; map: string; maxPlayers: number; password?: string }) => void) {
    this.onCreateServer = callback;
  }

  onBackClick(callback: () => void) {
    this.onBack = callback;
  }

  show() {
    this.container.classList.add('active');
  }

  hide() {
    this.container.classList.remove('active');
  }

  destroy() {
    this.container.remove();
  }
}
