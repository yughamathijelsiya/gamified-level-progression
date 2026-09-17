import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GAMES_CATALOG } from './data/games';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { RewardModal } from './components/RewardModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { MissionsModal } from './components/MissionsModal';
import { ProfileModal } from './components/ProfileModal';

// Mini-Games
import { NeonRush } from './games/NeonRush';
import { JungleEscape } from './games/JungleEscape';
import { SkyDash } from './games/SkyDash';
import { CyberRider } from './games/CyberRider';
import { TreasureQuest } from './games/TreasureQuest';

import {
  Gamepad2,
  Trophy,
  Flame,
  Target,
  Award,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeGame, setActiveGame, setActiveModal, profile, claimDailyStreak } = useGame();
  const [activeCategory, setActiveCategory] = useState<'all' | 'runner' | 'arcade' | 'adventure'>('all');

  const filteredGames = GAMES_CATALOG.filter(game => {
    if (activeCategory === 'runner') return game.id === 'neon-rush' || game.id === 'jungle-escape';
    if (activeCategory === 'arcade') return game.id === 'sky-dash' || game.id === 'cyber-rider';
    if (activeCategory === 'adventure') return game.id === 'treasure-quest' || game.id === 'jungle-escape';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8">
        {/* If Active Game is selected, show the game view */}
        {activeGame ? (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in py-2">
            {activeGame === 'neon-rush' && <NeonRush />}
            {activeGame === 'jungle-escape' && <JungleEscape />}
            {activeGame === 'sky-dash' && <SkyDash />}
            {activeGame === 'cyber-rider' && <CyberRider />}
            {activeGame === 'treasure-quest' && <TreasureQuest />}
          </div>
        ) : (
          /* GAME HUB HOMEPAGE */
          <>
            {/* Hero Showcase Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  LEVELUP ORIGINALS • SEASON 1
                </div>

                <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-3 leading-tight">
                  NEXT-GEN ARCADE <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                    GAMIFIED MINI-GAMES
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Play 5 original fast-paced mini-games with responsive controls. Collect XP, rank up your player tier, maintain daily streaks, and conquer the global leaderboard!
                </p>

                {/* Hero Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveGame('neon-rush')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    PLAY FEATURED (NEON RUSH)
                  </button>

                  <button
                    onClick={() => setActiveModal('missions')}
                    className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-display font-bold text-sm tracking-wider uppercase hover:border-slate-600 transition flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-cyan-400" />
                    VIEW QUESTS
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Progression Dashboard Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setActiveModal('profile')}
                className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-2xl transition flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Player Tier
                  </div>
                  <div className="text-base font-display font-black text-white flex items-center gap-1.5">
                    Level {profile.level}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              </div>

              <div
                onClick={claimDailyStreak}
                className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-orange-500/40 p-4 rounded-2xl transition flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition">
                  <Flame className="w-5 h-5 fill-orange-400" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Daily Streak
                  </div>
                  <div className="text-base font-display font-black text-orange-400">
                    {profile.dailyStreak} Days {profile.claimedToday ? '✓' : '(Claim)'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveModal('achievements')}
                className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-pink-500/40 p-4 rounded-2xl transition flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Achievements
                  </div>
                  <div className="text-base font-display font-black text-pink-400 flex items-center gap-1.5">
                    {profile.unlockedAchievements.length} / 10
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveModal('leaderboard')}
                className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-2xl transition flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Rankings
                  </div>
                  <div className="text-base font-display font-black text-amber-400 flex items-center gap-1.5">
                    Global Top 10
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Game Hub Section Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <div>
                <h2 className="text-2xl font-display font-black tracking-wide text-white flex items-center gap-2.5">
                  <Gamepad2 className="w-6 h-6 text-cyan-400" />
                  SELECT YOUR MISSION
                </h2>
                <p className="text-xs text-slate-400">
                  5 original arcade titles loaded with unique heroes, custom physics &amp; rewards
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-bold self-start sm:self-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeCategory === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ALL (5)
                </button>
                <button
                  onClick={() => setActiveCategory('runner')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeCategory === 'runner'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RUNNERS
                </button>
                <button
                  onClick={() => setActiveCategory('arcade')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeCategory === 'arcade'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SPEED &amp; SKY
                </button>
                <button
                  onClick={() => setActiveCategory('adventure')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeCategory === 'adventure'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  DUNGEON
                </button>
              </div>
            </div>

            {/* Game Cards Grid: All 5 Games Displayed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 px-4 py-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-base text-slate-300">LEVELUP</span>
            <span>• Original Gamified Mini-Game Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Original Characters &amp; Universes</span>
            <span>•</span>
            <span>Web Audio Synthesizer</span>
            <span>•</span>
            <span>Adaptive Mobile &amp; Desktop</span>
          </div>
        </div>
      </footer>

      {/* Gamification Modals */}
      <RewardModal />
      <LeaderboardModal />
      <AchievementsModal />
      <MissionsModal />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
