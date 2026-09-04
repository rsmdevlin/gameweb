import type { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import type { GameServer, GameState } from 'shared';

interface UnrealServerInstance {
  id: string;
  serverId: string;
  host: string;
  port: number;
  pixelStreamingPort: number;
  status: 'starting' | 'ready' | 'running' | 'stopping' | 'stopped';
  players: Set<string>;
  maxPlayers: number;
  lastHeartbeat: number;
}

interface ServerAllocation {
  instanceId: string;
  pixelStreamingUrl: string;
  serverToken: string;
}

export class UnrealServerManager {
  private instances: Map<string, UnrealServerInstance> = new Map();
  private serverPool: UnrealServerInstance[] = [];
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    // Check server heartbeats every 10 seconds
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 10000);
  }

  // Allocate a UE5 server instance for a game server
  allocateServer(serverId: string, maxPlayers: number): ServerAllocation | null {
    // Find available instance from pool
    let instance = this.serverPool.find(
      i => i.status === 'ready' && i.players.size === 0
    );

    if (!instance) {
      // Create new instance (in production, this would spawn actual UE5 process)
      instance = this.createInstance(serverId, maxPlayers);
    }

    if (!instance) return null;

    instance.serverId = serverId;
    instance.status = 'running';
    this.instances.set(instance.id, instance);

    const serverToken = randomUUID();

    return {
      instanceId: instance.id,
      pixelStreamingUrl: `ws://${instance.host}:${instance.pixelStreamingPort}`,
      serverToken
    };
  }

  private createInstance(serverId: string, maxPlayers: number): UnrealServerInstance {
    const instanceId = randomUUID();

    // In production: spawn UE5 dedicated server process with Pixel Streaming
    // For now, simulate instance creation
    const instance: UnrealServerInstance = {
      id: instanceId,
      serverId,
      host: process.env.UE5_SERVER_HOST || 'localhost',
      port: this.getAvailablePort(),
      pixelStreamingPort: this.getAvailablePort(),
      status: 'starting',
      players: new Set(),
      maxPlayers,
      lastHeartbeat: Date.now()
    };

    this.instances.set(instanceId, instance);

    // Simulate startup time
    setTimeout(() => {
      instance.status = 'ready';
    }, 3000);

    return instance;
  }

  addPlayerToInstance(instanceId: string, playerId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    if (instance.players.size >= instance.maxPlayers) return false;

    instance.players.add(playerId);
    instance.lastHeartbeat = Date.now();
    return true;
  }

  removePlayerFromInstance(instanceId: string, playerId: string) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.players.delete(playerId);

    // If no players left, mark as ready for reuse
    if (instance.players.size === 0) {
      instance.status = 'ready';
      instance.serverId = '';
    }
  }

  getInstanceForServer(serverId: string): UnrealServerInstance | undefined {
    return Array.from(this.instances.values()).find(i => i.serverId === serverId);
  }

  updateHeartbeat(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.lastHeartbeat = Date.now();
    }
  }

  private checkHeartbeats() {
    const now = Date.now();
    const timeout = 30000; // 30 seconds

    for (const [id, instance] of this.instances) {
      if (now - instance.lastHeartbeat > timeout && instance.status === 'running') {
        console.warn(`UE5 instance ${id} heartbeat timeout, marking as stopped`);
        instance.status = 'stopped';

        // In production: kill the UE5 process
        this.instances.delete(id);
      }
    }
  }

  private portCounter = 7777;
  private getAvailablePort(): number {
    return this.portCounter++;
  }

  shutdownInstance(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.status = 'stopping';

    // In production: send shutdown command to UE5 process
    setTimeout(() => {
      this.instances.delete(instanceId);
    }, 2000);
  }

  getStatus() {
    return {
      totalInstances: this.instances.size,
      runningInstances: Array.from(this.instances.values()).filter(i => i.status === 'running').length,
      readyInstances: Array.from(this.instances.values()).filter(i => i.status === 'ready').length,
      instances: Array.from(this.instances.values()).map(i => ({
        id: i.id,
        serverId: i.serverId,
        status: i.status,
        playerCount: i.players.size,
        maxPlayers: i.maxPlayers
      }))
    };
  }

  destroy() {
    clearInterval(this.heartbeatInterval);

    // Shutdown all instances
    for (const [id] of this.instances) {
      this.shutdownInstance(id);
    }
  }
}
