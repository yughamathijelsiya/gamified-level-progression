import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  GameId,
  PlayerProfile,
  Achievement,
  Mission,
  LeaderboardEntry,
  GameSessionResult
} from '../types';
import {
  GAMES_CATALOG,
  INITIAL_ACHIEVEMENTS,
  INITIAL_MISSIONS,
  INITIAL_LEADERBOARD,
  PLAYER_TITLES
} from '../data/games';
import { sounds } from '../services/sound';

interface GameContextType {
  profile: PlayerProfile;
  activeGame: GameId | null;
  activeModal: 'leaderboard' | 'achievements' | 'missions' | 'profile' | null;
  latestReward: GameSessionResult | null;
  soundMuted: boolean;
  achievements: Achievement[];
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  setActiveGame: (gameId: GameId | null) => void;
  setActiveModal: (modal: 'leaderboard' | 'achievements' | 'missions' | 'profile' | null) => void;
  closeRewardModal: () => void;
  toggleSound: () => void;
  claimDailyStreak: () => void;
  claimMission: (missionId: string) => void;
  updateProfileName: (name: string) => void;
  updateAvatar: (avatarId: string) => void;
  recordGameCompletion: (
    gameId: GameId,
    score: number,
    distanceOrCoins: number,
    durationSeconds: number,
    extraMetrics?: { keysFound?: number; reachedTreasure?: boolean }
  ) => GameSessionResult;
  resetAllProgress: () => void;
}

const STORAGE_KEY = 'levelup_player_profile_v2';
const MISSIONS_KEY = 'levelup_missions_v2';
const ACHIEVEMENTS_KEY = 'levelup_achievements_v2';

const calculateXpToNext = (level: number) => {
  return Math.floor(350 * Math.pow(1.35, level - 1));
};

const getTitleForLevel = (level: number) => {
  const match = [...PLAYER_TITLES].reverse().find(t => level >= t.level);
  return match ? match.title : 'Rookie Challenger';
};

const defaultProfile: PlayerProfile = {
  username: 'NeoPlayer',
  title: 'Rookie Challenger',
  avatarId: 'neon',
  level: 1,
  xp: 0,
  xpToNext: 350,
  coins: 100,
  dailyStreak: 1,
  lastClaimDate: '',
  claimedToday: false,
  gamesPlayed: 0,
  highScores: {
    'neon-rush': 0,
    'jungle-escape': 0,
    'sky-dash': 0,
    'cyber-rider': 0,
    'treasure-quest': 0
  },
  unlockedAchievements: [],
  claimedMissions: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    if (typeof window === 'undefined') return defaultProfile;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return defaultProfile;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return INITIAL_ACHIEVEMENTS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MISSIONS;
    try {
      const saved = localStorage.getItem(MISSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_MISSIONS;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeModal, setActiveModal] = useState<'leaderboard' | 'achievements' | 'missions' | 'profile' | null>(null);
  const [latestReward, setLatestReward] = useState<GameSessionResult | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => sounds.getMuted());

  // Save profile changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile]);

  // Save missions changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
    }
  }, [missions]);

  // Sync player into leaderboard
  useEffect(() => {
    const totalScore = Object.values(profile.highScores).reduce((a, b) => a + b, 0);
    setLeaderboard(prev => {
      const updated = prev.map(item => {
        if (item.isCurrentPlayer) {
          return {
            ...item,
            name: `${profile.username} (You)`,
            level: profile.level,
            score: totalScore,
            title: profile.title,
            avatar: profile.avatarId
          };
        }
        return item;
      });

      // Sort descending by score
      updated.sort((a, b) => b.score - a.score);
      // Reassign rank
      return updated.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    });
  }, [profile.highScores, profile.level, profile.username, profile.title, profile.avatarId]);

  // Check Daily Streak availability on load
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.lastClaimDate !== today) {
      setProfile(p => ({ ...p, claimedToday: false }));
    }
  }, [profile.lastClaimDate]);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) sounds.playClick();
  };

  const claimDailyStreak = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.claimedToday) return;

    sounds.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newStreak = profile.dailyStreak + 1;
    const bonusCoins = 50 + newStreak * 10;
    const bonusXp = 100 + newStreak * 20;

    setProfile(p => {
      let currentXp = p.xp + bonusXp;
      let currentLevel = p.level;
      let reqXp = p.xpToNext;

      while (currentXp >= reqXp) {
        currentXp -= reqXp;
        currentLevel += 1;
        reqXp = calculateXpToNext(currentLevel);
      }

      return {
        ...p,
        coins: p.coins + bonusCoins,
        dailyStreak: newStreak,
        lastClaimDate: today,
        claimedToday: true,
        xp: currentXp,
        level: currentLevel,
        xpToNext: reqXp,
        title: getTitleForLevel(currentLevel)
      };
    });
  };

  const claimMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    sounds.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setMissions(prev =>
      prev.map(m => (m.id === missionId ? { ...m, claimed: true } : m))
    );

    setProfile(p => {
      let currentXp = p.xp + mission.xpReward;
      let currentLevel = p.level;
      let reqXp = p.xpToNext;

      while (currentXp >= reqXp) {
        currentXp -= reqXp;
        currentLevel += 1;
        reqXp = calculateXpToNext(currentLevel);
      }

      return {
        ...p,
        coins: p.coins + mission.coinReward,
        xp: currentXp,
        level: currentLevel,
        xpToNext: reqXp,
        title: getTitleForLevel(currentLevel),
        claimedMissions: [...p.claimedMissions, missionId]
      };
    });
  };

  const updateProfileName = (name: string) => {
    if (!name.trim()) return;
    setProfile(p => ({ ...p, username: name.trim().slice(0, 16) }));
    sounds.playClick();
  };

  const updateAvatar = (avatarId: string) => {
    setProfile(p => ({ ...p, avatarId }));
    sounds.playClick();
  };

  const recordGameCompletion = (
    gameId: GameId,
    score: number,
    distanceOrCoins: number,
    durationSeconds: number,
    extraMetrics?: { keysFound?: number; reachedTreasure?: boolean }
  ): GameSessionResult => {
    const prevHighScore = profile.highScores[gameId] || 0;
    const isNewHighScore = score > prevHighScore;

    // XP calculation: Base score + item bonus + duration bonus
    const xpEarned = Math.max(
      40,
      Math.floor(score * 1.3) + distanceOrCoins * 8 + Math.min(100, durationSeconds * 2)
    );

    // Coins calculation: 1 coin per 20 score + direct coins collected + 5 completion bonus
    const coinsEarned = Math.max(5, Math.floor(score / 20) + distanceOrCoins + 5);

    // Check Level Progression
    let newXp = profile.xp + xpEarned;
    let newLevel = profile.level;
    let newXpToNext = profile.xpToNext;
    let didLevelUp = false;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = calculateXpToNext(newLevel);
      didLevelUp = true;
    }

    if (didLevelUp) {
      sounds.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
    } else {
      sounds.playVictory();
    }

    // Evaluate Achievements
    const unlockedNow: Achievement[] = [];
    const currentUnlockedIds = new Set(profile.unlockedAchievements);

    achievements.forEach(ach => {
      if (currentUnlockedIds.has(ach.id)) return;

      let achieved = false;
      if (ach.id === 'first_run') {
        achieved = true;
      } else if (ach.id === 'neon_sprinter' && gameId === 'neon-rush' && score >= 500) {
        achieved = true;
      } else if (ach.id === 'jungle_survivor' && gameId === 'jungle-escape' && score >= 600) {
        achieved = true;
      } else if (ach.id === 'sky_walker' && gameId === 'sky-dash' && score >= 500) {
        achieved = true;
      } else if (ach.id === 'road_warrior' && gameId === 'cyber-rider' && score >= 800) {
        achieved = true;
      } else if (
        ach.id === 'relic_hunter' &&
        gameId === 'treasure-quest' &&
        extraMetrics?.reachedTreasure
      ) {
        achieved = true;
      } else if (ach.id === 'level_5_club' && newLevel >= 5) {
        achieved = true;
      } else if (ach.id === 'coin_collector_50' && profile.coins + coinsEarned >= 250) {
        achieved = true;
      }

      if (achieved) {
        unlockedNow.push(ach);
        currentUnlockedIds.add(ach.id);
      }
    });

    // Update Missions progress
    setMissions(prevMissions =>
      prevMissions.map(m => {
        if (m.completed) return m;

        let addedProgress = 0;
        if (m.id === 'm1' && gameId === 'neon-rush') {
          addedProgress = score;
        } else if (m.id === 'm2' && gameId === 'jungle-escape') {
          addedProgress = distanceOrCoins;
        } else if (m.id === 'm3' && gameId === 'sky-dash') {
          addedProgress = distanceOrCoins;
        } else if (m.id === 'm4' && gameId === 'cyber-rider') {
          addedProgress = score;
        } else if (m.id === 'm5' && gameId === 'treasure-quest' && extraMetrics?.keysFound) {
          addedProgress = extraMetrics.keysFound;
        }

        if (addedProgress > 0) {
          const nextVal = m.current + addedProgress;
          return {
            ...m,
            current: nextVal,
            completed: nextVal >= m.target
          };
        }
        return m;
      })
    );

    // Update Profile
    const updatedHighScores = {
      ...profile.highScores,
      [gameId]: Math.max(prevHighScore, score)
    };

    setProfile(prev => ({
      ...prev,
      level: newLevel,
      xp: newXp,
      xpToNext: newXpToNext,
      coins: prev.coins + coinsEarned,
      gamesPlayed: prev.gamesPlayed + 1,
      title: getTitleForLevel(newLevel),
      highScores: updatedHighScores,
      unlockedAchievements: Array.from(currentUnlockedIds)
    }));

    const result: GameSessionResult = {
      gameId,
      score,
      distanceOrCoins,
      durationSeconds,
      xpEarned,
      coinsEarned,
      isNewHighScore,
      previousHighScore: prevHighScore,
      unlockedAchievements: unlockedNow,
      leveledUp: didLevelUp,
      newLevel: didLevelUp ? newLevel : undefined
    };

    setLatestReward(result);
    return result;
  };

  const closeRewardModal = () => {
    setLatestReward(null);
    sounds.playClick();
  };

  const resetAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MISSIONS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    setProfile(defaultProfile);
    setMissions(INITIAL_MISSIONS);
    sounds.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        activeGame,
        activeModal,
        latestReward,
        soundMuted,
        achievements,
        missions,
        leaderboard,
        setActiveGame,
        setActiveModal,
        closeRewardModal,
        toggleSound,
        claimDailyStreak,
        claimMission,
        updateProfileName,
        updateAvatar,
        recordGameCompletion,
        resetAllProgress
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
