import React from 'react';
import { useGame } from '../context/GameContext';
import { Target, CheckCircle, X, Sparkles, Coins, Gift } from 'lucide-react';

export const MissionsModal: React.FC = () => {
  const { activeModal, setActiveModal, missions, claimMission } = useGame();

  if (activeModal !== 'missions') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white">DAILY & WEEKLY MISSIONS</h3>
              <p className="text-xs text-slate-400">Complete quests to earn bonus XP and Coins</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 no-scrollbar">
          {missions.map(m => {
            const percent = Math.min(100, Math.floor((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          m.type === 'daily'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {m.type}
                      </span>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{m.description}</p>
                  </div>

                  {/* Claim Button / Status */}
                  <div>
                    {m.claimed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> CLAIMED
                      </span>
                    ) : m.completed ? (
                      <button
                        onClick={() => claimMission(m.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 animate-pulse transition active:scale-95"
                      >
                        <Gift className="w-3.5 h-3.5" /> CLAIM!
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Sparkles className="w-3 h-3" />+{m.xpReward}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Coins className="w-3 h-3" />+{m.coinReward}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {m.current} / {m.target} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
