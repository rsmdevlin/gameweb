import { MessageType, type WSMessage, type GameState } from 'shared';
import { GameRenderer } from '../render/GameRenderer';

type EventCallback = (data?: any) => void;

export class GameClient {
  private ws: WebSocket | null = null;
  private renderer: GameRenderer | null = null;
  private events: Map<string, EventCallback[]> = new Map();
  private gameState: GameState | null = null;
  private localPlayerId: string | null = null;

  constructor(
    private wsUrl: string,
    private token: string
  ) {}

  connect() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.authenticate();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    };
  }

  private authenticate() {
    this.send({
      type: MessageType.AUTH,
      data: { token: this.token },
      timestamp: Date.now()
    });
  }

  private handleMessage(message: WSMessage) {
    switch (message.type) {
      case MessageType.AUTH_SUCCESS:
        console.log('Authenticated:', message.data);
        this.localPlayerId = message.data.userId;
        this.emit('connected');
        break;

      case MessageType.AUTH_FAILED:
        console.error('Authentication failed:', message.data);
        this.emit('error', message.data);
        break;

      case MessageType.JOIN_SERVER:
        console.log('Joined server:', message.data);
        this.emit('joined_server', message.data);
        break;

      case MessageType.GAME_STATE:
        this.gameState = message.data;
        if (this.renderer && this.gameState) {
          this.renderer.updateGameState(this.gameState);
        }
        this.emit('game_state', this.gameState);
        break;

      case MessageType.SERVER_LIST:
        this.emit('serverList', message.data.servers);
        break;

      case MessageType.PLAYER_JOINED:
        console.log('Player joined:', message.data);
        this.emit('lobby_update', message.data);
        break;

      case MessageType.PLAYER_LEFT:
        console.log('Player left:', message.data);
        this.emit('lobby_update', message.data);
        break;

      case MessageType.START_GAME:
        console.log('Game starting...');
        this.initRenderer();
        this.emit('game_started');
        break;

      case MessageType.PLAYER_DAMAGE:
        console.log('Player damaged:', message.data);
        this.emit('player_damage', message.data);
        break;

      case MessageType.PLAYER_DEATH:
        console.log('Player died:', message.data);
        this.emit('player_death', message.data);
        break;

      case MessageType.ROUND_START:
        console.log('Round started:', message.data);
        this.emit('round_start', message.data);
        break;

      case MessageType.ROUND_END:
        console.log('Round ended:', message.data);
        this.emit('round_end', message.data);
        break;

      case MessageType.CHAT_MESSAGE:
        if (this.renderer) {
          this.renderer.addChatMessage(message.data.username, message.data.message);
        }
        this.emit('chat', message.data);
        break;

      case MessageType.ERROR:
        console.error('Server error:', message.data);
        this.emit('error', message.data);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  private initRenderer() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new GameRenderer(canvas);
    this.renderer.init();

    // Set local player ID
    if (this.localPlayerId) {
      this.renderer.setLocalPlayerId(this.localPlayerId);
    }

    // Send movement updates
    this.renderer.on('playerMove', (moveData) => {
      this.send({
        type: MessageType.PLAYER_MOVE,
        data: moveData,
        timestamp: Date.now()
      });
    });

    // Handle chat messages
    this.renderer.on('chat', (message) => {
      this.sendChat(message);
    });

    // Handle attacks
    this.renderer.on('attack', (targetId) => {
      this.send({
        type: MessageType.PLAYER_ATTACK,
        data: { targetId },
        timestamp: Date.now()
      });
    });

    // Handle transformations
    this.renderer.on('transform', (propModelId) => {
      this.send({
        type: MessageType.PLAYER_TRANSFORM,
        data: { propModelId },
        timestamp: Date.now()
      });
    });
  }

  send(message: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendChat(message: string) {
    this.send({
      type: MessageType.CHAT_MESSAGE,
      data: { message },
      timestamp: Date.now()
    });
  }

  createServer(name: string, map: string, maxPlayers: number, password?: string) {
    this.send({
      type: MessageType.CREATE_SERVER,
      data: { name, map, maxPlayers, password, mode: 'prop_hunt' },
      timestamp: Date.now()
    });
  }

  joinServer(serverId: string, password?: string) {
    this.send({
      type: MessageType.JOIN_SERVER,
      data: { serverId, password },
      timestamp: Date.now()
    });
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
