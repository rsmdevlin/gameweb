import type { GameState } from 'shared';

export class GameHUD {
  private hudElement: HTMLElement;
  private healthBar: HTMLElement;
  private timerElement: HTMLElement;
  private phaseElement: HTMLElement;
  private scoreElement: HTMLElement;
  private chatContainer: HTMLElement;
  private chatInput: HTMLElement;
  private chatMessages: HTMLElement;
  private playerList: HTMLElement;

  private onChatSend?: (message: string) => void;
  private hideTimeout: any;

  constructor() {
    this.hudElement = this.createHUD();
    this.healthBar = this.hudElement.querySelector('.health-fill') as HTMLElement;
    this.timerElement = this.hudElement.querySelector('.timer-value') as HTMLElement;
    this.phaseElement = this.hudElement.querySelector('.phase-text') as HTMLElement;
    this.scoreElement = this.hudElement.querySelector('.score-text') as HTMLElement;
    this.chatContainer = this.hudElement.querySelector('.chat-container') as HTMLElement;
    this.chatInput = this.hudElement.querySelector('.chat-input') as HTMLElement;
    this.chatMessages = this.hudElement.querySelector('.chat-messages') as HTMLElement;
    this.playerList = this.hudElement.querySelector('.player-list') as HTMLElement;

    this.setupChatHandlers();
  }

  private createHUD(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'game-hud';
    container.innerHTML = `
      <div class="hud-top">
        <div class="timer">
          <div class="timer-label">TIME</div>
          <div class="timer-value">0:00</div>
        </div>
        <div class="phase">
          <div class="phase-text">LOBBY</div>
        </div>
        <div class="score">
          <div class="score-text">Hunters: 0 | Props: 0</div>
        </div>
      </div>

      <div class="hud-bottom-left">
        <div class="health-bar">
          <div class="health-label">HP</div>
          <div class="health-container">
            <div class="health-fill"></div>
          </div>
          <div class="health-value">100</div>
        </div>
      </div>

      <div class="hud-bottom-right">
        <div class="player-list">
          <div class="player-list-title">Players</div>
          <div class="player-items"></div>
        </div>
      </div>

      <div class="chat-container">
        <div class="chat-messages"></div>
        <input type="text" class="chat-input" placeholder="Press Enter to chat..." maxlength="200">
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .game-hud {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
        font-family: 'Segoe UI', Arial, sans-serif;
      }

      .game-hud * {
        pointer-events: auto;
      }

      .hud-top {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        gap: 20px;
      }

      .timer, .phase, .score {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        padding: 15px 25px;
        border-radius: 10px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        color: white;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      }
      }

      .timer-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 5px;
      }

      .timer-value {
        font-size: 24px;
        font-weight: bold;
      }

      .phase-text {
        font-size: 18px;
        font-weight: bold;
        text-transform: uppercase;
      }

      .score-text {
        font-size: 16px;
      }

      .hud-bottom-left {
        position: absolute;
        bottom: 20px;
        left: 20px;
      }

      .health-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
      }

      .health-label {
        font-weight: bold;
        font-size: 14px;
      }

      .health-container {
        width: 200px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        overflow: hidden;
      }

      .health-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #ff4444, #ff6666);
        transition: width 0.3s;
      }

      .health-value {
        font-weight: bold;
        min-width: 40px;
      }

      .hud-bottom-right {
        position: absolute;
        bottom: 160px;
        right: 20px;
      }

      .player-list {
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 8px;
        color: white;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
      }

      .player-list-title {
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        padding-bottom: 8px;
      }

      .player-item {
        padding: 5px;
        margin: 3px 0;
        border-radius: 4px;
        font-size: 14px;
      }

      .player-item.hunter {
        background: rgba(255, 68, 68, 0.3);
      }

      .player-item.prop {
        background: rgba(68, 68, 255, 0.3);
      }

      .player-item.dead {
        opacity: 0.5;
        text-decoration: line-through;
      }

      .chat-container {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 500px;
      }

      .chat-messages {
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 10px;
        display: none;
      }

      .chat-messages.active {
        display: block;
      }

      .chat-message {
        color: white;
        margin: 5px 0;
        font-size: 14px;
      }

      .chat-message .username {
        font-weight: bold;
        margin-right: 5px;
      }

      .chat-input {
        width: 100%;
        padding: 12px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        outline: none;
      }

      .chat-input:focus {
        border-color: rgba(255, 255, 255, 0.6);
      }

      @media (max-width: 768px) {
        .hud-top {
          flex-direction: column;
          gap: 10px;
          padding: 10px;
        }

        .timer, .phase, .score {
          padding: 10px 15px;
        }

        .health-container {
          width: 120px;
        }

        .player-list {
          max-height: 150px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    return container;
  }

  private setupChatHandlers() {
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const input = this.chatInput as HTMLInputElement;
        const message = input.value.trim();

        if (message && this.onChatSend) {
          this.onChatSend(message);
          input.value = '';
        }
      }
    });

    // Show chat messages when typing
    this.chatInput.addEventListener('focus', () => {
      this.chatMessages.classList.add('active');
    });

    // Auto-hide chat after 5 seconds of inactivity
    this.chatInput.addEventListener('blur', () => {
      this.hideTimeout = setTimeout(() => {
        if (document.activeElement !== this.chatInput) {
          this.chatMessages.classList.remove('active');
        }
      }, 5000);
    });
  }

  updateGameState(gameState: GameState) {
    // Update phase
    this.phaseElement.textContent = gameState.phase.toUpperCase();

    // Update timer
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = Math.floor(gameState.timer % 60);
    this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update score
    this.scoreElement.textContent = `Hunters: ${gameState.score.hunters} | Props: ${gameState.score.props}`;

    // Update player list
    const playerItems = this.playerList.querySelector('.player-items') as HTMLElement;
    playerItems.innerHTML = '';

    Object.values(gameState.players).forEach(player => {
      const item = document.createElement('div');
      item.className = `player-item ${player.team}`;
      if (!player.isAlive) {
        item.classList.add('dead');
      }
      item.textContent = `${player.username} (${player.health}HP)`;
      playerItems.appendChild(item);
    });
  }

  updateHealth(health: number) {
    const percentage = Math.max(0, Math.min(100, health));
    this.healthBar.style.width = `${percentage}%`;

    const healthValue = this.hudElement.querySelector('.health-value') as HTMLElement;
    healthValue.textContent = `${Math.floor(percentage)}`;

    // Change color based on health
    if (percentage > 60) {
      this.healthBar.style.background = 'linear-gradient(90deg, #44ff44, #66ff66)';
    } else if (percentage > 30) {
      this.healthBar.style.background = 'linear-gradient(90deg, #ffaa44, #ffcc66)';
    } else {
      this.healthBar.style.background = 'linear-gradient(90deg, #ff4444, #ff6666)';
    }
  }

  addChatMessage(username: string, message: string) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `<span class="username">${username}:</span>${message}`;

    this.chatMessages.appendChild(messageEl);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    // Show chat temporarily
    this.chatMessages.classList.add('active');

    setTimeout(() => {
      if (document.activeElement !== this.chatInput) {
        this.chatMessages.classList.remove('active');
      }
    }, 5000);

    // Keep only last 50 messages
    while (this.chatMessages.children.length > 50) {
      this.chatMessages.removeChild(this.chatMessages.firstChild!);
    }
  }

  onChat(callback: (message: string) => void) {
    this.onChatSend = callback;
  }

  show() {
    this.hudElement.style.display = 'block';
  }

  hide() {
    this.hudElement.style.display = 'none';
  }

  destroy() {
    this.hudElement.remove();
  }
}
