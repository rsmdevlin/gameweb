import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { GameServer } from 'shared';

export const serversRouter = Router();

// Global game manager instance (will be set from index.ts)
let gameManager: any = null;

export function setGameManager(manager: any) {
  gameManager = manager;
}

// Get server list
serversRouter.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    if (!gameManager) {
      return res.status(500).json({ message: 'Game manager not initialized' });
    }

    const servers: GameServer[] = gameManager.getServerList();
    res.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ message: 'Failed to fetch servers' });
  }
});

// Create server
serversRouter.post('/', authMiddleware, (req: Request, res: Response) => {
  try {
    if (!gameManager) {
      return res.status(500).json({ message: 'Game manager not initialized' });
    }

    const { name, map, maxPlayers, password } = req.body;

    if (!name || !map || !maxPlayers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (maxPlayers < 2 || maxPlayers > 16) {
      return res.status(400).json({ message: 'Max players must be between 2 and 16' });
    }

    const server = gameManager.createServer(
      {
        name,
        map,
        maxPlayers,
        hasPassword: !!password
      },
      password
    );

    res.status(201).json(server);
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({ message: 'Failed to create server' });
  }
});
