import React from 'react';
import { useGame } from '../context/GameContext';
import { GAMES_CATALOG } from '../data/games';
import {
  Trophy,
  Coins,
  Sparkles,
  Award,
  RotateCcw,
  Home,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const RewardModal: React.FC = () => {
  const { latestReward, closeRewardModal, setActiveGame, profile } = useGame();

  if (!latestReward) return null;

  const gameInfo = GAMES_CATALOG.find(g => g.id === latestReward.gameId);

  const handlePlayAgain = () => {
    const gameId = latestReward.gameId;
    closeRewardModal();
    setActiveGame(null);
    setTimeout(() => {
      setActiveGame(gameId);
    }, 50);
  };

  const xpPercent = Math.min(100, Math.floor((profile.xp / profile.xpToNext) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 flex flex-col items-center text-center overflow-hidden">
        {/* Glow backdrop header */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: gameInfo?.accentColor || '#38bdf8' }}
        />

        {/* Level Up Banner if leveled up */}
        {latestReward.leveledUp && (
          <div className="w-full mb-4 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-pink-500/30 animate-bounce">
            🎉 LEVEL UP! REACHED LEVEL {latestReward.newLevel} 🎉
          </div>
        )}

        {/* Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
          {gameInfo?.title || 'Mini-Game'} Complete
        </span>

        <h3 className="text-3xl font-display font-black text-white mb-6">
          MISSION DEBRIEF
        </h3>

        {/* Score & Rewards Breakdown Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Score</span>
            <span className="text-2xl font-display font-bold text-white">
              {latestReward.score.toLocaleString()}
            </span>
            {latestReward.isNewHighScore && (
              <span className="text-[10px] text-amber-400 font-bold uppercase mt-1">NEW HIGH!</span>
            )}
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> XP
            </span>
            <span className="text-2xl font-display font-bold text-cyan-400">
              +{latestReward.xpEarned}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Career XP</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Coins
            </span>
            <span className="text-2xl font-display font-bold text-amber-400">
              +{latestReward.coinsEarned}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Rewarded</span>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Level {profile.level} Progress
            </span>
            <span className="text-cyan-400 font-bold">
              {profile.xp} / {profile.xpToNext} XP ({xpPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 transition-all duration-700 rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Unlocked Achievements Toast */}
        {latestReward.unlockedAchievements && latestReward.unlockedAchievements.length > 0 && (
          <div className="w-full mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-left">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4" />
              ACHIEVEMENTS UNLOCKED!
            </div>
            {latestReward.unlockedAchievements.map(ach => (
              <div key={ach.id} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{ach.title}</span>
                </div>
                <span className="text-amber-400 font-bold">+{ach.coinReward} Coins</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>

          <button
            onClick={closeRewardModal}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-sm tracking-wider uppercase transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};
