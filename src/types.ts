export type GameId = 'neon-rush' | 'jungle-escape' | 'sky-dash' | 'cyber-rider' | 'treasure-quest';

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  difficulty: GameDifficulty;
  characterName: string;
  characterTitle: string;
  characterBio: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  gradient: string;
  bestScoreKey: string;
  controls: {
    keyboard: string[];
    mobile: string;
  };
  features: string[];
}

export interface PlayerProfile {
  username: string;
  title: string;
  avatarId: string;
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  dailyStreak: number;
  lastClaimDate: string;
  claimedToday: boolean;
  gamesPlayed: number;
  highScores: Record<GameId, number>;
  unlockedAchievements: string[];
  claimedMissions: string[];
  selectedVehicleOrSkin?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  gameId?: GameId | 'all';
  icon: string;
  xpReward: number;
  coinReward: number;
  target: number;
  progressKey: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  gameId: GameId | 'all';
  target: number;
  current: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  score: number;
  title: string;
  isCurrentPlayer?: boolean;
}

export interface GameSessionResult {
  gameId: GameId;
  score: number;
  distanceOrCoins: number;
  durationSeconds: number;
  xpEarned: number;
  coinsEarned: number;
  isNewHighScore: boolean;
  previousHighScore: number;
  unlockedAchievements: Achievement[];
  leveledUp: boolean;
  newLevel?: number;
}
