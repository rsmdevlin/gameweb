import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/init.js';
import { handleWebSocket, setGameManagerForWS } from './websocket/handler.js';
import { authRouter } from './routes/auth.js';
import { serversRouter, setGameManager } from './routes/servers.js';
import { GameManager } from './game/GameManager.js';
import type { IncomingMessage } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Serve static files from client/dist
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

// Initialize GameManager
const gameManager = new GameManager();
setGameManager(gameManager);
setGameManagerForWS(gameManager);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/servers', serversRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    res.sendFile(path.join(clientPath, 'index.html'));
  }
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  handleWebSocket(ws, req);
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('✓ Database initialized');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ WebSocket server ready at ws://0.0.0.0:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
