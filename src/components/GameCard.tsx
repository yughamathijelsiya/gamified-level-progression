import React from 'react';
import { GameInfo } from '../types';
import { useGame } from '../context/GameContext';
import { Play, Trophy, Sparkles, Zap, Compass, CloudLightning, Flame, Key } from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { setActiveGame, profile } = useGame();
  const bestScore = profile.highScores[game.id] || 0;

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'HARD':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const getGameIcon = (id: string) => {
    switch (id) {
      case 'neon-rush':
        return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'jungle-escape':
        return <Compass className="w-6 h-6 text-emerald-400" />;
      case 'sky-dash':
        return <CloudLightning className="w-6 h-6 text-purple-400" />;
      case 'cyber-rider':
        return <Flame className="w-6 h-6 text-pink-400" />;
      case 'treasure-quest':
        return <Key className="w-6 h-6 text-amber-400" />;
      default:
        return <Play className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl overflow-hidden hover:-translate-y-1"
      style={{
        boxShadow: `0 10px 30px -15px ${game.glowColor}`
      }}
    >
      {/* Top Banner & Artwork Area */}
      <div className={`relative w-full h-48 bg-gradient-to-br ${game.gradient} p-4 flex flex-col justify-between overflow-hidden`}>
        {/* Abstract futuristic grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient glow sphere */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-50 pointer-events-none"
          style={{ backgroundColor: game.accentColor }}
        />

        {/* Top Badges: Badge Tag & Difficulty */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-display font-black tracking-widest uppercase px-2.5 py-1 rounded-md bg-slate-950/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {game.badge}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md ${getDifficultyBadge(game.difficulty)}`}>
            {game.difficulty}
          </span>
        </div>

        {/* Center Game Artwork Avatar & Hero Info */}
        <div className="relative z-10 flex items-center gap-3 mt-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
            {getGameIcon(game.id)}
          </div>
          <div>
            <div className="text-xs font-semibold text-white/80">
              Hero: {game.characterName}
            </div>
            <div className="text-[11px] text-white/60 font-medium">
              {game.characterTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-2xl font-display font-black tracking-wide text-white group-hover:text-cyan-400 transition">
              {game.title}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">{game.genre}</span>
          </div>

          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
            {game.description}
          </p>

          {/* Quick Feature Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {game.features.slice(0, 2).map((feat, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Row & Play Now Button */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Best:</span>
              <span className="font-display font-bold text-slate-200">
                {bestScore.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>XP Reward:</span>
              <span className="font-bold">+350-1,200</span>
            </div>
          </div>

          <button
            onClick={() => setActiveGame(game.id)}
            className="w-full py-3 px-4 rounded-xl font-display font-black text-sm tracking-wider uppercase text-slate-950 flex items-center justify-center gap-2 shadow-lg transition duration-200 group-hover:shadow-cyan-500/20 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${game.accentColor}, #ffffff)`
            }}
          >
            <Play className="w-4 h-4 fill-slate-950" />
            PLAY NOW
          </button>
        </div>
      </div>
    </div>
  );
};
