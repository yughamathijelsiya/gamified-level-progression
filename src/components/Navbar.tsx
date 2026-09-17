import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Gamepad2,
  Trophy,
  Target,
  Award,
  User,
  Volume2,
  VolumeX,
  Flame,
  Coins,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    profile,
    soundMuted,
    toggleSound,
    setActiveModal,
    setActiveGame,
    claimDailyStreak,
    missions,
    achievements
  } = useGame();

  const xpPercentage = Math.min(100, Math.floor((profile.xp / profile.xpToNext) * 100));
  const hasUnclaimedMissions = missions.some(m => m.completed && !m.claimed);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-amber-400 group-hover:text-cyan-400 transition" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-wider bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              LEVELUP
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
              ARCADE
            </span>
          </div>
        </div>

        {/* Player Level & XP Progress Widget */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800/90 px-3.5 py-1.5 rounded-full shadow-inner">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-display font-extrabold text-xs text-slate-950 shadow-md shadow-cyan-500/30">
            {profile.level}
          </div>

          <div className="flex flex-col w-32">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="text-cyan-400">LVL {profile.level}</span>
              <span className="text-slate-400">
                {profile.xp}/{profile.xpToNext} XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats: Coins & Daily Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak */}
          <button
            onClick={claimDailyStreak}
            disabled={profile.claimedToday}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition select-none ${
              profile.claimedToday
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold border-amber-400 shadow-lg shadow-orange-500/30 animate-pulse hover:scale-105'
            }`}
            title={profile.claimedToday ? 'Streak claimed for today' : 'Claim daily reward!'}
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{profile.dailyStreak}D</span>
            {!profile.claimedToday && <span className="hidden sm:inline">CLAIM!</span>}
          </button>

          {/* Coins Balance */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400 shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{profile.coins.toLocaleString()}</span>
          </div>

          {/* Nav Modals Triggers */}
          <div className="flex items-center gap-1">
            {/* Missions */}
            <button
              onClick={() => setActiveModal('missions')}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition"
              title="Missions & Quests"
            >
              <Target className="w-4 h-4" />
              {hasUnclaimedMissions && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>

            {/* Achievements */}
            <button
              onClick={() => setActiveModal('achievements')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-slate-700 transition"
              title="Achievements & Badges"
            >
              <Award className="w-4 h-4" />
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setActiveModal('leaderboard')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition"
              title="Leaderboard Rankings"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Profile */}
            <button
              onClick={() => setActiveModal('profile')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="Player Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
