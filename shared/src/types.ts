// Player types
export interface Player {
  id: string;
  username: string;
  position: Vector3;
  rotation: Vector3;
  team: 'hunter' | 'prop';
  health: number;
  isAlive: boolean;
  isProp: boolean;
  propModelId?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Game types
export interface GameServer {
  id: string;
  name: string;
  map: string;
  mode: string;
  maxPlayers: number;
  currentPlayers: number;
  hasPassword: boolean;
  hostId: string;
}

export interface GameState {
  serverId: string;
  phase: 'lobby' | 'hiding' | 'hunting' | 'ended';
  timer: number;
  players: Record<string, Player>;
  score: {
    hunters: number;
    props: number;
  };
}

// WebSocket message types
export enum MessageType {
  // Auth
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',

  // Server browser
  SERVER_LIST = 'server_list',
  CREATE_SERVER = 'create_server',
  JOIN_SERVER = 'join_server',
  LEAVE_SERVER = 'leave_server',

  // Game state
  GAME_STATE = 'game_state',
  PLAYER_MOVE = 'player_move',
  PLAYER_TRANSFORM = 'player_transform',
  PLAYER_ATTACK = 'player_attack',
  PLAYER_DAMAGE = 'player_damage',
  PLAYER_DEATH = 'player_death',

  // Chat
  CHAT_MESSAGE = 'chat_message',

  // Game control
  START_GAME = 'start_game',
  END_GAME = 'end_game',

  // Error
  ERROR = 'error'
}

export interface WSMessage<T = any> {
  type: MessageType;
  data: T;
  timestamp: number;
}

// Auth types
export interface AuthRequest {
  token: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
}

// Movement types
export interface PlayerMoveData {
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
}

// Chat types
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

// Database types
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface PlayerStats {
  user_id: string;
  games_played: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  time_played: number;
}
