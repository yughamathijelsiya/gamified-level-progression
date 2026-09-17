import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, X, Crown, Sparkles, User } from 'lucide-react';

export const LeaderboardModal: React.FC = () => {
  const { activeModal, setActiveModal, leaderboard } = useGame();
  const [filter, setFilter] = useState<'all' | 'daily'>('all');

  if (activeModal !== 'leaderboard') return null;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
            <Crown className="w-4 h-4 fill-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300 flex items-center justify-center text-slate-300">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-600 flex items-center justify-center text-amber-600">
            <Medal className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-display font-bold text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white">HALL OF CHAMPIONS</h3>
              <p className="text-xs text-slate-400">Global & Daily Leaderboard</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter */}
        <div className="flex gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL TIME (TOP 10)
          </button>
          <button
            onClick={() => setFilter('daily')}
            className={`flex-1 py-2 rounded-lg transition ${
              filter === 'daily'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TODAY&apos;S SPRINT
          </button>
        </div>

        {/* Leaderboard Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {leaderboard.map(entry => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                entry.isCurrentPlayer
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(entry.rank)}

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        entry.isCurrentPlayer ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-semibold">
                      LV {entry.level}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{entry.title}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-display font-black text-white">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">PTS</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom player note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          Rank updates automatically with every game completed!
        </div>
      </div>
    </div>
  );
};
