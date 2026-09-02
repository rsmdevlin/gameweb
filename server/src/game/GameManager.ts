import type { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import {
  type GameServer,
  type GameState,
  type Player,
  type Vector3,
  type PlayerMoveData,
  MessageType,
  type WSMessage
} from 'shared';

interface ServerData {
  server: GameServer;
  gameState: GameState;
  password?: string;
}

interface ConnectedPlayer {
  ws: WebSocket;
  player: Player;
  serverId: string;
}

export class GameManager {
  private servers: Map<string, ServerData> = new Map();
  private players: Map<string, ConnectedPlayer> = new Map();
  private updateInterval: NodeJS.Timeout;

  constructor() {
    // Game loop - 60 ticks per second
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 60);
  }

  getServerList(): GameServer[] {
    return Array.from(this.servers.values()).map(s => s.server);
  }

  createServer(config: Omit<GameServer, 'id' | 'currentPlayers'>, password?: string): GameServer {
    const serverId = randomUUID();
    const server: GameServer = {
      id: serverId,
      currentPlayers: 0,
      ...config
    };

    const gameState: GameState = {
      serverId,
      phase: 'lobby',
      timer: 0,
      players: {},
      score: { hunters: 0, props: 0 }
    };

    this.servers.set(serverId, { server, gameState, password });
    return server;
  }

  joinServer(
    userId: string,
    username: string,
    ws: WebSocket,
    serverId: string,
    password?: string
  ): { success: boolean; error?: string; server?: GameServer; gameState?: GameState } {
    const serverData = this.servers.get(serverId);

    if (!serverData) {
      return { success: false, error: 'Server not found' };
    }

    if (serverData.password && serverData.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    if (serverData.server.currentPlayers >= serverData.server.maxPlayers) {
      return { success: false, error: 'Server is full' };
    }

    // Create player
    const player: Player = {
      id: userId,
      username,
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      team: 'hunter',
      health: 100,
      isAlive: true,
      isProp: false
    };

    this.players.set(userId, { ws, player, serverId });
    serverData.gameState.players[userId] = player;
    serverData.server.currentPlayers++;

    // Broadcast new player to others
    this.broadcastToServer(serverId, {
      type: MessageType.GAME_STATE,
      data: serverData.gameState,
      timestamp: Date.now()
    });

    return {
      success: true,
      server: serverData.server,
      gameState: serverData.gameState
    };
  }

  addPlayer(userId: string, username: string, ws: WebSocket, serverId: string) {
    const serverData = this.servers.get(serverId);
    if (!serverData) return;

    const player: Player = {
      id: userId,
      username,
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      team: 'hunter',
      health: 100,
      isAlive: true,
      isProp: false
    };

    this.players.set(userId, { ws, player, serverId });
    serverData.gameState.players[userId] = player;
    serverData.server.currentPlayers++;
  }

  removePlayer(userId: string) {
    const playerData = this.players.get(userId);
    if (!playerData) return;

    const serverData = this.servers.get(playerData.serverId);
    if (serverData) {
      delete serverData.gameState.players[userId];
      serverData.server.currentPlayers--;

      // Remove empty servers
      if (serverData.server.currentPlayers === 0) {
        this.servers.delete(playerData.serverId);
      } else {
        this.broadcastToServer(playerData.serverId, {
          type: MessageType.GAME_STATE,
          data: serverData.gameState,
          timestamp: Date.now()
        });
      }
    }

    this.players.delete(userId);
  }

  leaveServer(userId: string) {
    this.removePlayer(userId);
  }

  startGame(userId: string) {
    const playerData = this.players.get(userId);
    if (!playerData) return;

    const serverData = this.servers.get(playerData.serverId);
    if (!serverData) return;

    // Only host can start
    if (serverData.server.hostId !== userId) return;

    // Assign teams randomly
    const playerIds = Object.keys(serverData.gameState.players);
    const propCount = Math.ceil(playerIds.length / 2);

    playerIds.sort(() => Math.random() - 0.5);

    playerIds.forEach((id, index) => {
      const player = serverData.gameState.players[id];
      player.team = index < propCount ? 'prop' : 'hunter';
      player.health = 100;
      player.isAlive = true;
      player.isProp = false;
    });

    serverData.gameState.phase = 'hiding';
    serverData.gameState.timer = 30; // 30 seconds hiding phase

    this.broadcastToServer(playerData.serverId, {
      type: MessageType.START_GAME,
      data: serverData.gameState,
      timestamp: Date.now()
    });
  }

  updatePlayerPosition(userId: string, moveData: PlayerMoveData) {
    const playerData = this.players.get(userId);
    if (!playerData) return;

    playerData.player.position = moveData.position;
    playerData.player.rotation = moveData.rotation;

    const serverData = this.servers.get(playerData.serverId);
    if (serverData) {
      serverData.gameState.players[userId] = playerData.player;
    }
  }

  transformPlayer(userId: string, propModelId: string) {
    const playerData = this.players.get(userId);
    if (!playerData || playerData.player.team !== 'prop') return;

    playerData.player.isProp = true;
    playerData.player.propModelId = propModelId;

    const serverData = this.servers.get(playerData.serverId);
    if (serverData) {
      this.broadcastToServer(playerData.serverId, {
        type: MessageType.PLAYER_TRANSFORM,
        data: { userId, propModelId },
        timestamp: Date.now()
      });
    }
  }

  handleAttack(attackerId: string, targetId: string) {
    const attacker = this.players.get(attackerId);
    const target = this.players.get(targetId);

    if (!attacker || !target || attacker.player.team !== 'hunter') return;

    const distance = this.getDistance(attacker.player.position, target.player.position);

    if (distance < 3) { // Attack range
      target.player.health -= 25;

      if (target.player.health <= 0) {
        target.player.isAlive = false;
        target.player.health = 0;

        this.broadcastToServer(attacker.serverId, {
          type: MessageType.PLAYER_DEATH,
          data: { victimId: targetId, killerId: attackerId },
          timestamp: Date.now()
        });
      } else {
        this.broadcastToServer(attacker.serverId, {
          type: MessageType.PLAYER_DAMAGE,
          data: { targetId, damage: 25, health: target.player.health },
          timestamp: Date.now()
        });
      }
    }
  }

  broadcastChat(userId: string, username: string, message: string) {
    const playerData = this.players.get(userId);
    if (!playerData) return;

    this.broadcastToServer(playerData.serverId, {
      type: MessageType.CHAT_MESSAGE,
      data: {
        id: randomUUID(),
        userId,
        username,
        message,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private update() {
    // Update game timers and check win conditions
    for (const [serverId, serverData] of this.servers) {
      if (serverData.gameState.phase === 'hiding' || serverData.gameState.phase === 'hunting') {
        serverData.gameState.timer -= 1 / 60;

        if (serverData.gameState.timer <= 0) {
          if (serverData.gameState.phase === 'hiding') {
            serverData.gameState.phase = 'hunting';
            serverData.gameState.timer = 180; // 3 minutes hunting phase
          } else {
            this.endGame(serverId);
          }
        }

        // Check win conditions
        const players = Object.values(serverData.gameState.players);
        const aliveProps = players.filter(p => p.team === 'prop' && p.isAlive).length;
        const aliveHunters = players.filter(p => p.team === 'hunter' && p.isAlive).length;

        if (aliveProps === 0) {
          serverData.gameState.score.hunters++;
          this.endGame(serverId);
        } else if (aliveHunters === 0) {
          serverData.gameState.score.props++;
          this.endGame(serverId);
        }
      }

      // Broadcast state updates every tick
      this.broadcastToServer(serverId, {
        type: MessageType.GAME_STATE,
        data: serverData.gameState,
        timestamp: Date.now()
      });
    }
  }

  private endGame(serverId: string) {
    const serverData = this.servers.get(serverId);
    if (!serverData) return;

    serverData.gameState.phase = 'ended';
    serverData.gameState.timer = 10; // 10 seconds before returning to lobby

    this.broadcastToServer(serverId, {
      type: MessageType.END_GAME,
      data: serverData.gameState,
      timestamp: Date.now()
    });

    setTimeout(() => {
      if (serverData.gameState.phase === 'ended') {
        serverData.gameState.phase = 'lobby';
        serverData.gameState.timer = 0;
      }
    }, 10000);
  }

  private broadcastToServer(serverId: string, message: WSMessage) {
    for (const [userId, playerData] of this.players) {
      if (playerData.serverId === serverId && playerData.ws.readyState === playerData.ws.OPEN) {
        playerData.ws.send(JSON.stringify(message));
      }
    }
  }

  private getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  destroy() {
    clearInterval(this.updateInterval);
  }
}
