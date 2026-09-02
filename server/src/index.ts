import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { initDatabase } from './database/init.js';
import { handleWebSocket } from './websocket/handler.js';
import { authRouter } from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
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
