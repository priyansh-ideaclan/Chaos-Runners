export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  anim: string;
  color: string;
  accessory: string;
}

export interface GameRoomState {
  status: 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';
  timer: number;
  players: Record<string, PlayerState>;
  qualifiedCount: number;
  totalPlayersCount: number;
}
