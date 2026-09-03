import type { Player } from 'shared';

export enum Team {
  HUNTER = 'hunter',
  PROP = 'prop',
  SPECTATOR = 'spectator'
}

export enum GamePhase {
  WAITING = 'waiting',
  HIDING = 'hiding',
  HUNTING = 'hunting',
  ROUND_END = 'round_end'
}

export interface RoundState {
  phase: GamePhase;
  timeRemaining: number;
  huntersAlive: number;
  propsAlive: number;
  winner: Team | null;
}

export class PropHuntGameMode {
  private roundDuration: number = 300; // 5 minutes in seconds
  private hidingDuration: number = 30; // 30 seconds hiding phase
  private currentPhase: GamePhase = GamePhase.WAITING;
  private phaseTimer: number = 0;
  private players: Map<string, { player: Player; team: Team; alive: boolean }> = new Map();

  constructor() {}

  startRound(playerIds: string[]) {
    if (playerIds.length < 2) {
      console.error('Need at least 2 players to start');
      return false;
    }

    // Assign teams (1 hunter for every 3 props, minimum 1 hunter)
    const numHunters = Math.max(1, Math.floor(playerIds.length / 4));
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

    this.players.clear();

    // First players are hunters
    for (let i = 0; i < numHunters; i++) {
      this.players.set(shuffled[i], {
        player: { id: shuffled[i] } as Player,
        team: Team.HUNTER,
        alive: true
      });
    }

    // Rest are props
    for (let i = numHunters; i < shuffled.length; i++) {
      this.players.set(shuffled[i], {
        player: { id: shuffled[i] } as Player,
        team: Team.PROP,
        alive: true
      });
    }

    // Start hiding phase
    this.currentPhase = GamePhase.HIDING;
    this.phaseTimer = this.hidingDuration;

    console.log(`Round started: ${numHunters} hunters vs ${shuffled.length - numHunters} props`);
    return true;
  }

  update(deltaTime: number): RoundState {
    this.phaseTimer -= deltaTime;

    // Phase transitions
    if (this.currentPhase === GamePhase.HIDING && this.phaseTimer <= 0) {
      this.currentPhase = GamePhase.HUNTING;
      this.phaseTimer = this.roundDuration;
      console.log('Hunting phase started!');
    }

    if (this.currentPhase === GamePhase.HUNTING && this.phaseTimer <= 0) {
      this.endRound(Team.PROP); // Props win if time runs out
    }

    // Check win conditions
    const aliveHunters = this.getAlivePlayers(Team.HUNTER).length;
    const aliveProps = this.getAlivePlayers(Team.PROP).length;

    if (this.currentPhase === GamePhase.HUNTING) {
      if (aliveProps === 0) {
        this.endRound(Team.HUNTER);
      } else if (aliveHunters === 0) {
        this.endRound(Team.PROP);
      }
    }

    return {
      phase: this.currentPhase,
      timeRemaining: Math.max(0, this.phaseTimer),
      huntersAlive: aliveHunters,
      propsAlive: aliveProps,
      winner: null
    };
  }

  private endRound(winner: Team) {
    this.currentPhase = GamePhase.ROUND_END;
    this.phaseTimer = 10; // 10 seconds to show results
    console.log(`Round ended! Winner: ${winner}`);
  }

  handlePlayerDeath(playerId: string) {
    const playerData = this.players.get(playerId);
    if (playerData) {
      playerData.alive = false;
      playerData.team = Team.SPECTATOR;
      console.log(`Player ${playerId} died`);
    }
  }

  handlePlayerDamage(attackerId: string, targetId: string, damage: number): boolean {
    const attacker = this.players.get(attackerId);
    const target = this.players.get(targetId);

    if (!attacker || !target || !target.alive) {
      return false;
    }

    // Only hunters can damage props
    if (attacker.team !== Team.HUNTER) {
      console.log('Only hunters can attack!');
      return false;
    }

    // Can't attack during hiding phase
    if (this.currentPhase === GamePhase.HIDING) {
      console.log('Cannot attack during hiding phase!');
      return false;
    }

    // Can't attack other hunters
    if (target.team === Team.HUNTER) {
      console.log('Cannot attack teammates!');
      return false;
    }

    return true; // Damage is valid
  }

  getPlayerTeam(playerId: string): Team | null {
    return this.players.get(playerId)?.team || null;
  }

  isPlayerAlive(playerId: string): boolean {
    return this.players.get(playerId)?.alive || false;
  }

  getAlivePlayers(team?: Team): string[] {
    const result: string[] = [];
    this.players.forEach((data, id) => {
      if (data.alive && (!team || data.team === team)) {
        result.push(id);
      }
    });
    return result;
  }

  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  getPhaseTimer(): number {
    return Math.max(0, this.phaseTimer);
  }

  isHidingPhase(): boolean {
    return this.currentPhase === GamePhase.HIDING;
  }

  isHuntingPhase(): boolean {
    return this.currentPhase === GamePhase.HUNTING;
  }

  canPropsTransform(): boolean {
    return this.currentPhase === GamePhase.HIDING || this.currentPhase === GamePhase.HUNTING;
  }

  canHuntersAttack(): boolean {
    return this.currentPhase === GamePhase.HUNTING;
  }

  reset() {
    this.currentPhase = GamePhase.WAITING;
    this.phaseTimer = 0;
    this.players.clear();
  }
}
