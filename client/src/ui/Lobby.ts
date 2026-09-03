import type { Player } from 'shared';

export class Lobby {
  private container: HTMLElement;
  private onStartGame?: () => void;
  private onLeave?: () => void;
  private isHost: boolean = false;
  private serverName: string = '';

  constructor() {
    this.container = this.createLobby();
  }

  private createLobby(): HTMLElement {
    const lobby = document.createElement('div');
    lobby.className = 'lobby';
    lobby.innerHTML = `
      <div class="lobby-container">
        <div class="lobby-header">
          <button class="leave-btn">← Leave</button>
          <h2 class="server-name">Server Name</h2>
          <div class="lobby-status">Waiting for players...</div>
        </div>

        <div class="lobby-content">
          <div class="players-section">
            <h3>Players <span class="player-count">0/10</span></h3>
            <div class="players-grid"></div>
          </div>

          <div class="lobby-info">
            <div class="info-card">
              <h4>🎮 Game Mode</h4>
              <p>Prop Hunt</p>
            </div>
            <div class="info-card">
              <h4>🗺️ Map</h4>
              <p class="map-name">Default Arena</p>
            </div>
            <div class="info-card">
              <h4>⏱️ Round Time</h4>
              <p>5 minutes</p>
            </div>
          </div>
        </div>

        <div class="lobby-footer">
          <button class="start-btn" disabled>START GAME</button>
          <p class="host-hint">Only the host can start the game</p>
        </div>

        <div class="lobby-chat">
          <div class="chat-messages"></div>
          <div class="chat-input-container">
            <input type="text" class="chat-input" placeholder="Type a message..." maxlength="200">
            <button class="chat-send">Send</button>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .lobby {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        display: none;
        z-index: 1000;
      }

      .lobby.active {
        display: block;
      }

      .lobby-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .lobby-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        background: rgba(0, 0, 0, 0.5);
        padding: 20px;
        border-radius: 12px;
      }

      .leave-btn {
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .leave-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .server-name {
        flex: 1;
        color: white;
        margin: 0;
        font-size: 28px;
      }

      .lobby-status {
        color: #fbbf24;
        font-weight: 600;
        padding: 8px 16px;
        background: rgba(251, 191, 36, 0.2);
        border-radius: 6px;
      }

      .lobby-content {
        flex: 1;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        overflow: hidden;
      }

      .players-section {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        padding: 20px;
        overflow-y: auto;
      }

      .players-section h3 {
        color: white;
        margin: 0 0 15px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .player-count {
        color: #7e22ce;
        font-size: 18px;
      }

      .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }

      .player-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 15px;
        color: white;
        transition: all 0.3s;
      }

      .player-card.host {
        border-color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
      }

      .player-card.ready {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }

      .player-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 5px;
      }

      .player-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .player-badge.host {
        background: #fbbf24;
        color: #1e3c72;
      }

      .player-badge.ready {
        background: #10b981;
        color: white;
      }

      .lobby-info {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .info-card {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        padding: 20px;
        color: white;
      }

      .info-card h4 {
        margin: 0 0 10px 0;
        font-size: 18px;
      }

      .info-card p {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #a0aec0;
      }

      .lobby-footer {
        margin-top: 20px;
        text-align: center;
      }

      .start-btn {
        padding: 18px 60px;
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        border: none;
        color: white;
        border-radius: 12px;
        font-size: 20px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 6px 20px rgba(126, 34, 206, 0.5);
      }

      .start-btn:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(126, 34, 206, 0.7);
      }

      .start-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .host-hint {
        color: #a0aec0;
        margin-top: 10px;
        font-size: 14px;
      }

      .lobby-chat {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 300px;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        color: white;
        font-size: 14px;
      }

      .chat-message {
        margin-bottom: 10px;
      }

      .chat-message .username {
        color: #7e22ce;
        font-weight: 600;
      }

      .chat-input-container {
        display: flex;
        gap: 10px;
        padding: 15px;
        border-top: 2px solid rgba(255, 255, 255, 0.1);
      }

      .chat-input {
        flex: 1;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        font-size: 14px;
      }

      .chat-input:focus {
        outline: none;
        border-color: #7e22ce;
      }

      .chat-send {
        padding: 10px 20px;
        background: linear-gradient(135deg, #7e22ce 0%, #be185d 100%);
        border: none;
        color: white;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .chat-send:hover {
        transform: translateY(-2px);
      }

      @media (max-width: 1024px) {
        .lobby-content {
          grid-template-columns: 1fr;
        }

        .lobby-chat {
          width: 90%;
          right: 5%;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(lobby);

    this.setupHandlers(lobby);

    return lobby;
  }

  private setupHandlers(lobby: HTMLElement) {
    // Leave button
    lobby.querySelector('.leave-btn')?.addEventListener('click', () => {
      if (this.onLeave) this.onLeave();
    });

    // Start button
    lobby.querySelector('.start-btn')?.addEventListener('click', () => {
      if (this.onStartGame) this.onStartGame();
    });

    // Chat input
    const chatInput = lobby.querySelector('.chat-input') as HTMLInputElement;
    const chatSend = lobby.querySelector('.chat-send');

    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message) {
        this.sendChatMessage(message);
        chatInput.value = '';
      }
    };

    chatSend?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  private sendChatMessage(message: string) {
    // Will be implemented when connecting to game client
    console.log('Chat message:', message);
  }

  setServerInfo(name: string, map: string, maxPlayers: number) {
    this.serverName = name;
    const serverNameEl = this.container.querySelector('.server-name');
    const mapNameEl = this.container.querySelector('.map-name');
    const playerCountEl = this.container.querySelector('.player-count');

    if (serverNameEl) serverNameEl.textContent = name;
    if (mapNameEl) mapNameEl.textContent = map;
    if (playerCountEl) playerCountEl.textContent = `0/${maxPlayers}`;
  }

  setHost(isHost: boolean) {
    this.isHost = isHost;
    const startBtn = this.container.querySelector('.start-btn') as HTMLButtonElement;
    const hostHint = this.container.querySelector('.host-hint') as HTMLElement;

    if (isHost) {
      hostHint.style.display = 'none';
      startBtn.disabled = false;
    } else {
      hostHint.style.display = 'block';
      startBtn.disabled = true;
    }
  }

  updatePlayers(players: Player[], hostId: string, maxPlayers: number) {
    const grid = this.container.querySelector('.players-grid');
    const playerCountEl = this.container.querySelector('.player-count');
    const lobbyStatus = this.container.querySelector('.lobby-status');

    if (!grid) return;

    if (playerCountEl) {
      playerCountEl.textContent = `${players.length}/${maxPlayers}`;
    }

    if (lobbyStatus) {
      if (players.length >= 2) {
        lobbyStatus.textContent = 'Ready to start!';
        (lobbyStatus as HTMLElement).style.color = '#10b981';
      } else {
        lobbyStatus.textContent = 'Waiting for players...';
        (lobbyStatus as HTMLElement).style.color = '#fbbf24';
      }
    }

    grid.innerHTML = players.map(player => `
      <div class="player-card ${player.id === hostId ? 'host' : ''}">
        <div class="player-name">${player.username}</div>
        ${player.id === hostId ? '<span class="player-badge host">HOST</span>' : ''}
      </div>
    `).join('');

    // Enable start button if host and enough players
    if (this.isHost) {
      const startBtn = this.container.querySelector('.start-btn') as HTMLButtonElement;
      startBtn.disabled = players.length < 2;
    }
  }

  addChatMessage(username: string, message: string) {
    const chatMessages = this.container.querySelector('.chat-messages');
    if (!chatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `<span class="username">${username}:</span> ${message}`;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  onStart(callback: () => void) {
    this.onStartGame = callback;
  }

  onLeaveClick(callback: () => void) {
    this.onLeave = callback;
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
