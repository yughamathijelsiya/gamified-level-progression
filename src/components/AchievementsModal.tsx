import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Award, CheckCircle2, Lock, X, Sparkles, Coins } from 'lucide-react';

export const AchievementsModal: React.FC = () => {
  const { activeModal, setActiveModal, achievements, profile } = useGame();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (activeModal !== 'achievements') return null;

  const unlockedSet = new Set(profile.unlockedAchievements);

  const filteredAchievements = achievements.filter(ach => {
    const isUnlocked = unlockedSet.has(ach.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white">ACHIEVEMENTS</h3>
              <p className="text-xs text-slate-400">
                Unlocked: {profile.unlockedAchievements.length} / {achievements.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-slate-800 text-pink-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`flex-1 py-2 rounded-lg transition ${
              filter === 'unlocked'
                ? 'bg-slate-800 text-pink-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            UNLOCKED ({profile.unlockedAchievements.length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`flex-1 py-2 rounded-lg transition ${
              filter === 'locked'
                ? 'bg-slate-800 text-pink-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LOCKED ({achievements.length - profile.unlockedAchievements.length})
          </button>
        </div>

        {/* List of Achievements */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
          {filteredAchievements.map(ach => {
            const isUnlocked = unlockedSet.has(ach.id);

            return (
              <div
                key={ach.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  isUnlocked
                    ? 'bg-pink-500/10 border-pink-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      isUnlocked
                        ? 'bg-pink-500/20 border-pink-400 text-pink-400 shadow-md shadow-pink-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <CheckCircle2 className="w-6 h-6 text-pink-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{ach.title}</h4>
                    <p className="text-xs text-slate-400 max-w-xs sm:max-w-sm leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Reward Badges */}
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    <Sparkles className="w-3 h-3" />+{ach.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Coins className="w-3 h-3" />+{ach.coinReward}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
