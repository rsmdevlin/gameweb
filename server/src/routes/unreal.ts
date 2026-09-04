import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import type { UnrealServerManager } from '../game/UnrealServerManager.js';

let unrealServerManager: UnrealServerManager;

export function setUnrealServerManager(manager: UnrealServerManager) {
  unrealServerManager = manager;
}

export const unrealRouter = Router();

// Get Pixel Streaming URL for a game server
unrealRouter.post('/allocate', authenticateToken, async (req: Request, res: Response) => {
  const { serverId, maxPlayers } = req.body;

  if (!serverId || !maxPlayers) {
    return res.status(400).json({ error: 'serverId and maxPlayers required' });
  }

  const allocation = unrealServerManager.allocateServer(serverId, maxPlayers);

  if (!allocation) {
    return res.status(503).json({ error: 'No UE5 servers available' });
  }

  res.json(allocation);
});

// Heartbeat from UE5 instance
unrealRouter.post('/heartbeat', async (req: Request, res: Response) => {
  const { instanceId, serverToken } = req.body;

  if (!instanceId) {
    return res.status(400).json({ error: 'instanceId required' });
  }

  unrealServerManager.updateHeartbeat(instanceId);
  res.json({ ok: true });
});

// Get UE5 server status
unrealRouter.get('/status', authenticateToken, async (req: Request, res: Response) => {
  const status = unrealServerManager.getStatus();
  res.json(status);
});

// Join player to UE5 instance
unrealRouter.post('/join', authenticateToken, async (req: Request, res: Response) => {
  const { instanceId } = req.body;
  const userId = (req as any).user.userId;

  if (!instanceId) {
    return res.status(400).json({ error: 'instanceId required' });
  }

  const success = unrealServerManager.addPlayerToInstance(instanceId, userId);

  if (!success) {
    return res.status(400).json({ error: 'Cannot join instance' });
  }

  res.json({ ok: true });
});

// Leave UE5 instance
unrealRouter.post('/leave', authenticateToken, async (req: Request, res: Response) => {
  const { instanceId } = req.body;
  const userId = (req as any).user.userId;

  if (!instanceId) {
    return res.status(400).json({ error: 'instanceId required' });
  }

  unrealServerManager.removePlayerFromInstance(instanceId, userId);
  res.json({ ok: true });
});
