import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { MessageType, type WSMessage } from 'shared';
import { GameManager } from '../game/GameManager.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const gameManager = new GameManager();

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  isAlive?: boolean;
}

export function handleWebSocket(ws: AuthenticatedWebSocket, req: IncomingMessage) {
  ws.isAlive = true;

  // Handle pong responses for keep-alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const message: WSMessage = JSON.parse(data.toString());

      // Authentication required for all messages except AUTH
      if (message.type !== MessageType.AUTH && !ws.userId) {
        sendMessage(ws, {
          type: MessageType.ERROR,
          data: { error: 'Not authenticated' },
          timestamp: Date.now()
        });
        return;
      }

      switch (message.type) {
        case MessageType.AUTH:
          await handleAuth(ws, message.data);
          break;

        case MessageType.SERVER_LIST:
          handleServerList(ws);
          break;

        case MessageType.CREATE_SERVER:
          handleCreateServer(ws, message.data);
          break;

        case MessageType.JOIN_SERVER:
          handleJoinServer(ws, message.data);
          break;

        case MessageType.LEAVE_SERVER:
          handleLeaveServer(ws);
          break;

        case MessageType.START_GAME:
          handleStartGame(ws);
          break;

        case MessageType.PLAYER_MOVE:
          handlePlayerMove(ws, message.data);
          break;

        case MessageType.PLAYER_TRANSFORM:
          handlePlayerTransform(ws, message.data);
          break;

        case MessageType.PLAYER_ATTACK:
          handlePlayerAttack(ws, message.data);
          break;

        case MessageType.CHAT_MESSAGE:
          handleChatMessage(ws, message.data);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      sendMessage(ws, {
        type: MessageType.ERROR,
        data: { error: 'Invalid message format' },
        timestamp: Date.now()
      });
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      gameManager.removePlayer(ws.userId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

async function handleAuth(ws: AuthenticatedWebSocket, data: { token: string }) {
  try {
    const decoded = jwt.verify(data.token, JWT_SECRET) as { userId: string; username: string };

    ws.userId = decoded.userId;
    ws.username = decoded.username;

    sendMessage(ws, {
      type: MessageType.AUTH_SUCCESS,
      data: { userId: decoded.userId, username: decoded.username },
      timestamp: Date.now()
    });

    console.log(`User ${decoded.username} authenticated`);
  } catch (error) {
    sendMessage(ws, {
      type: MessageType.AUTH_FAILED,
      data: { error: 'Invalid token' },
      timestamp: Date.now()
    });
    ws.close();
  }
}

function handleServerList(ws: AuthenticatedWebSocket) {
  const servers = gameManager.getServerList();
  sendMessage(ws, {
    type: MessageType.SERVER_LIST,
    data: { servers },
    timestamp: Date.now()
  });
}

function handleCreateServer(ws: AuthenticatedWebSocket, data: any) {
  if (!ws.userId || !ws.username) return;

  const server = gameManager.createServer({
    name: data.name,
    map: data.map,
    mode: data.mode || 'prop_hunt',
    maxPlayers: data.maxPlayers || 10,
    hasPassword: !!data.password,
    hostId: ws.userId
  }, data.password);

  gameManager.addPlayer(ws.userId, ws.username, ws, server.id);

  sendMessage(ws, {
    type: MessageType.CREATE_SERVER,
    data: { server },
    timestamp: Date.now()
  });
}

function handleJoinServer(ws: AuthenticatedWebSocket, data: { serverId: string; password?: string }) {
  if (!ws.userId || !ws.username) return;

  const result = gameManager.joinServer(ws.userId, ws.username, ws, data.serverId, data.password);

  if (!result.success) {
    sendMessage(ws, {
      type: MessageType.ERROR,
      data: { error: result.error },
      timestamp: Date.now()
    });
    return;
  }

  sendMessage(ws, {
    type: MessageType.JOIN_SERVER,
    data: { server: result.server, gameState: result.gameState },
    timestamp: Date.now()
  });
}

function handleLeaveServer(ws: AuthenticatedWebSocket) {
  if (!ws.userId) return;
  gameManager.leaveServer(ws.userId);
}

function handleStartGame(ws: AuthenticatedWebSocket) {
  if (!ws.userId) return;
  gameManager.startGame(ws.userId);
}

function handlePlayerMove(ws: AuthenticatedWebSocket, data: any) {
  if (!ws.userId) return;
  gameManager.updatePlayerPosition(ws.userId, data);
}

function handlePlayerTransform(ws: AuthenticatedWebSocket, data: any) {
  if (!ws.userId) return;
  gameManager.transformPlayer(ws.userId, data.propModelId);
}

function handlePlayerAttack(ws: AuthenticatedWebSocket, data: any) {
  if (!ws.userId) return;
  gameManager.handleAttack(ws.userId, data.targetId);
}

function handleChatMessage(ws: AuthenticatedWebSocket, data: { message: string }) {
  if (!ws.userId || !ws.username) return;
  gameManager.broadcastChat(ws.userId, ws.username, data.message);
}

function sendMessage(ws: WebSocket, message: WSMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Keep-alive ping interval
setInterval(() => {
  // This would need access to all connected clients
  // Will be implemented in GameManager
}, 30000);
