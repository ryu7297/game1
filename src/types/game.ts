export type GameMode = 'classic' | 'arcade' | 'maze' | 'duel';
export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType = 'NORMAL' | 'GOLDEN' | 'MAGNET' | 'SLOW' | 'GHOST';

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  type: FoodType;
  points: number;
  expiresAt?: number; // for temporary items
  spawnTime: number;
}

export interface Obstacle {
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export type SkinId = 'emerald' | 'cyber' | 'dragon' | 'gummy' | 'galaxy';

export interface WormSkin {
  id: SkinId;
  name: string;
  desc: string;
  headColor: string;
  bodyColorStart: string;
  bodyColorEnd: string;
  eyeColor: string;
  pupilColor: string;
  glowColor: string;
  pattern: 'dots' | 'stripes' | 'scales' | 'neon' | 'stars';
}

export interface ActivePowerup {
  type: 'MAGNET' | 'SLOW' | 'GHOST';
  expiresAt: number;
  durationMs: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameStats {
  score: number;
  applesEaten: number;
  goldenEaten: number;
  powerupsCollected: number;
  maxCombo: number;
  currentCombo: number;
  comboTimer: number; // 0 to 1
  length: number;
  gameTimeSec: number;
}
