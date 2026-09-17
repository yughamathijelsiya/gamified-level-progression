import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { User, X, Edit2, Check, RotateCcw, Award, Trophy, Coins, Flame } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    profile,
    updateProfileName,
    updateAvatar,
    resetAllProgress
  } = useGame();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  if (activeModal !== 'profile') return null;

  const handleSaveName = () => {
    updateProfileName(nameInput);
    setIsEditing(false);
  };

  const avatars = [
    { id: 'neon', name: 'Volt (Neon)', color: 'border-cyan-400 bg-cyan-500/20 text-cyan-400' },
    { id: 'jungle', name: 'Maya (Jungle)', color: 'border-emerald-400 bg-emerald-500/20 text-emerald-400' },
    { id: 'sky', name: 'Zephyr (Sky)', color: 'border-purple-400 bg-purple-500/20 text-purple-400' },
    { id: 'cyber', name: 'Nova (Rider)', color: 'border-pink-400 bg-pink-500/20 text-pink-400' },
    { id: 'maze', name: 'Orion (Vault)', color: 'border-amber-400 bg-amber-500/20 text-amber-400' }
  ];

  const totalHighScore = Object.values(profile.highScores).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white">PLAYER DOSSIER</h3>
              <p className="text-xs text-slate-400">Career Statistics & Profile</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="my-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-cyan-400">
              LV{profile.level}
            </div>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  maxLength={14}
                  className="bg-slate-900 border border-cyan-500/50 rounded-lg px-2 py-1 text-sm text-white font-bold outline-none w-full"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-display font-black text-white flex items-center gap-2">
                  {profile.username}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-500 hover:text-cyan-400 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </h4>
              </div>
            )}
            <div className="text-xs text-cyan-400 font-semibold">{profile.title}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Level {profile.level} • {profile.xp} / {profile.xpToNext} XP
            </div>
          </div>
        </div>

        {/* Select Avatar / Hero Identity */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Hero Avatar
          </label>
          <div className="grid grid-cols-5 gap-2">
            {avatars.map(av => (
              <button
                key={av.id}
                onClick={() => updateAvatar(av.id)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  profile.avatarId === av.id
                    ? `${av.color} shadow-md`
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
                title={av.name}
              >
                <div className="w-6 h-6 rounded-full bg-current opacity-20" />
                <span className="text-[9px] font-bold truncate max-w-full">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Total High Score</div>
              <div className="text-sm font-display font-bold text-white">
                {totalHighScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Coins Balance</div>
              <div className="text-sm font-display font-bold text-amber-400">
                {profile.coins.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-slate-400">Daily Streak</div>
              <div className="text-sm font-display font-bold text-orange-400">
                {profile.dailyStreak} Days
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <Award className="w-5 h-5 text-pink-400" />
            <div>
              <div className="text-slate-400">Achievements</div>
              <div className="text-sm font-display font-bold text-pink-400">
                {profile.unlockedAchievements.length} Unlocked
              </div>
            </div>
          </div>
        </div>

        {/* Reset Progress Button */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              if (confirm('Reset your profile and start fresh?')) {
                resetAllProgress();
                setActiveModal(null);
              }
            }}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Profile Data
          </button>
        </div>
      </div>
    </div>
  );
};
