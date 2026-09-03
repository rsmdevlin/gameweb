import { Team, GamePhase, PropHuntGameMode, type RoundState } from './PropHuntGameMode.js';

export interface PlayerScore {
  playerId: string;
  kills: number;
  deaths: number;
  wins: number;
  timeAsHunter: number;
  timeAsProp: number;
}

export interface RoundResult {
  winner: Team;
  duration: number;
  huntersAlive: number;
  propsAlive: number;
  playerScores: Map<string, PlayerScore>;
}

export class RoundSystem {
  private gameMode: PropHuntGameMode;
  private roundNumber: number = 0;
  private roundHistory: RoundResult[] = [];
  private playerScores: Map<string, PlayerScore> = new Map();
  private roundStartTime: number = 0;
  private isRoundActive: boolean = false;

  constructor() {
    this.gameMode = new PropHuntGameMode();
  }

  startNewRound(playerIds: string[]): boolean {
    if (this.isRoundActive) {
      console.warn('Round already active');
      return false;
    }

    if (playerIds.length < 2) {
      console.error('Need at least 2 players');
      return false;
    }

    // Initialize player scores if needed
    playerIds.forEach(id => {
      if (!this.playerScores.has(id)) {
        this.playerScores.set(id, {
          playerId: id,
          kills: 0,
          deaths: 0,
          wins: 0,
          timeAsHunter: 0,
          timeAsProp: 0
        });
      }
    });

    // Start round
    const success = this.gameMode.startRound(playerIds);
    if (success) {
      this.roundNumber++;
      this.roundStartTime = Date.now();
      this.isRoundActive = true;
      console.log(`Round ${this.roundNumber} started with ${playerIds.length} players`);
    }

    return success;
  }

  update(deltaTime: number): RoundState {
    if (!this.isRoundActive) {
      return {
        phase: GamePhase.WAITING,
        timeRemaining: 0,
        huntersAlive: 0,
        propsAlive: 0,
        winner: null
      };
    }

    // Update game mode
    const state = this.gameMode.update(deltaTime);

    // Update player time stats
    const alivePlayers = this.gameMode.getAlivePlayers();
    alivePlayers.forEach(playerId => {
      const score = this.playerScores.get(playerId);
      if (score) {
        const team = this.gameMode.getPlayerTeam(playerId);
        if (team === Team.HUNTER) {
          score.timeAsHunter += deltaTime;
        } else if (team === Team.PROP) {
          score.timeAsProp += deltaTime;
        }
      }
    });

    // Check if round ended
    if (state.phase === GamePhase.ROUND_END) {
      this.endRound(state);
    }

    return state;
  }

  private endRound(finalState: RoundState) {
    if (!this.isRoundActive) return;

    const duration = (Date.now() - this.roundStartTime) / 1000;
    const winner = this.determineWinner(finalState);

    // Update player stats
    const alivePlayers = this.gameMode.getAlivePlayers();
    alivePlayers.forEach(playerId => {
      const score = this.playerScores.get(playerId);
      const team = this.gameMode.getPlayerTeam(playerId);
      if (score && team === winner) {
        score.wins++;
      }
    });

    // Record round result
    const result: RoundResult = {
      winner,
      duration,
      huntersAlive: finalState.huntersAlive,
      propsAlive: finalState.propsAlive,
      playerScores: new Map(this.playerScores)
    };

    this.roundHistory.push(result);
    this.isRoundActive = false;

    console.log(`Round ${this.roundNumber} ended. Winner: ${winner}`);
  }

  private determineWinner(state: RoundState): Team {
    if (state.propsAlive === 0) {
      return Team.HUNTER;
    }
    if (state.huntersAlive === 0 || state.timeRemaining <= 0) {
      return Team.PROP;
    }
    // Default to props if unclear
    return Team.PROP;
  }

  handlePlayerKill(killerId: string, victimId: string) {
    const killerScore = this.playerScores.get(killerId);
    const victimScore = this.playerScores.get(victimId);

    if (killerScore) {
      killerScore.kills++;
    }

    if (victimScore) {
      victimScore.deaths++;
    }

    // Update game mode
    this.gameMode.handlePlayerDeath(victimId);

    console.log(`Player ${killerId} killed ${victimId}`);
  }

  handlePlayerDamage(attackerId: string, targetId: string, damage: number): boolean {
    return this.gameMode.handlePlayerDamage(attackerId, targetId, damage);
  }

  getPlayerScore(playerId: string): PlayerScore | null {
    return this.playerScores.get(playerId) || null;
  }

  getAllScores(): PlayerScore[] {
    return Array.from(this.playerScores.values());
  }

  getLeaderboard(): PlayerScore[] {
    return this.getAllScores().sort((a, b) => {
      // Sort by wins first, then by K/D ratio
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      const aKD = a.deaths > 0 ? a.kills / a.deaths : a.kills;
      const bKD = b.deaths > 0 ? b.kills / b.deaths : b.kills;
      return bKD - aKD;
    });
  }

  getRoundHistory(): RoundResult[] {
    return [...this.roundHistory];
  }

  getCurrentRound(): number {
    return this.roundNumber;
  }

  isActive(): boolean {
    return this.isRoundActive;
  }

  getCurrentPhase(): GamePhase {
    return this.gameMode.getCurrentPhase();
  }

  getPhaseTimeRemaining(): number {
    return this.gameMode.getPhaseTimer();
  }

  getPlayerTeam(playerId: string): Team | null {
    return this.gameMode.getPlayerTeam(playerId);
  }

  isPlayerAlive(playerId: string): boolean {
    return this.gameMode.isPlayerAlive(playerId);
  }

  canPropsTransform(): boolean {
    return this.gameMode.canPropsTransform();
  }

  canHuntersAttack(): boolean {
    return this.gameMode.canHuntersAttack();
  }

  forceEndRound(winner: Team) {
    if (!this.isRoundActive) return;

    const state: RoundState = {
      phase: GamePhase.ROUND_END,
      timeRemaining: 0,
      huntersAlive: this.gameMode.getAlivePlayers(Team.HUNTER).length,
      propsAlive: this.gameMode.getAlivePlayers(Team.PROP).length,
      winner
    };

    this.endRound(state);
  }

  reset() {
    this.gameMode.reset();
    this.isRoundActive = false;
    this.roundNumber = 0;
    this.roundHistory = [];
    // Keep player scores across resets
  }

  resetAllScores() {
    this.playerScores.clear();
    this.roundHistory = [];
    this.roundNumber = 0;
  }
}
