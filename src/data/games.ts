import { GameInfo, Achievement, Mission, LeaderboardEntry } from '../types';

export const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'neon-rush',
    title: 'NEON RUSH',
    subtitle: 'High-Velocity Cyber Sprawl',
    description: 'Sprint through a futuristic neo-Tokyo skyline. Switch across 3 magnetic lanes, leap over hazard dividers, slide beneath laser barriers, and gather power cells as your speed surges!',
    genre: 'Endless 3D-Lane Runner',
    difficulty: 'MEDIUM',
    characterName: 'Volt (Kaelen)',
    characterTitle: 'Cyber Nomad',
    characterBio: 'Equipped with kinetic hover-boots and a neon particle cowl, Volt navigates high-voltage skyscraper highways.',
    badge: 'CYBER-SPEED',
    accentColor: '#38bdf8', // Cyan
    glowColor: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-cyan-500 via-sky-600 to-indigo-900',
    bestScoreKey: 'highScore_neon-rush',
    controls: {
      keyboard: ['A / D or ← / → (Switch Lane)', 'W or ↑ (Jump)', 'S or ↓ (Slide)'],
      mobile: 'Swipe Left/Right to change lane, Swipe Up to Jump, Swipe Down to Slide (or On-Screen Buttons)'
    },
    features: ['3 High-Speed Lanes', 'Dynamic Oncoming Drones', 'High Laser Gates & Hurdles', 'Coin Magnets & Shield Bubbles']
  },
  {
    id: 'jungle-escape',
    title: 'JUNGLE ESCAPE',
    subtitle: 'Ancient Ruins & Canopy Traps',
    description: 'Escape the crumbling Sun Temple deep in the bioluminescent jungle! Leap across collapsing stone bridges, duck beneath razor vines, and dodge rolling boulder traps.',
    genre: 'Temple Adventure Runner',
    difficulty: 'HARD',
    characterName: 'Maya Thorne',
    characterTitle: 'Ruins Pathfinder',
    characterBio: 'A fearless expeditionist armed with an ancient obsidian compass and agile acrobatic reflexes.',
    badge: 'RELIC HUNTER',
    accentColor: '#22c55e', // Emerald
    glowColor: 'rgba(34, 197, 94, 0.4)',
    gradient: 'from-emerald-500 via-green-600 to-teal-950',
    bestScoreKey: 'highScore_jungle-escape',
    controls: {
      keyboard: ['W or ↑ or Space (Jump)', 'Double-Tap Jump (Double Jump)', 'S or ↓ (Slide / Duck)'],
      mobile: 'Tap Jump (Double Tap for Double Jump), Tap Slide to duck under low vines'
    },
    features: ['Collapsing Wooden Bridges', 'Rolling Ancient Boulders', 'Sharp Spike Pits', 'Bioluminescent Spore VFX']
  },
  {
    id: 'sky-dash',
    title: 'SKY DASH',
    subtitle: 'Stratospheric Platform Jump',
    description: 'Ascend into the stratosphere jumping across floating antigravity platforms! Collect floating prism gems and time your plasma jet-boot bursts to never fall into the abyss.',
    genre: 'Vertical Sky Platformer',
    difficulty: 'HARD',
    characterName: 'Zephyr Vance',
    characterTitle: 'Aero Scout',
    characterBio: 'Pioneer of the Sky Guild, using dual atmospheric ion-jets to leap across floating aerostations.',
    badge: 'GRAVITY DEFIER',
    accentColor: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    gradient: 'from-purple-500 via-violet-600 to-indigo-950',
    bestScoreKey: 'highScore_sky-dash',
    controls: {
      keyboard: ['A / D or ← / → (Move)', 'Space or W or ↑ (Jump)', 'Tap Jump Midair (Jet Boost)'],
      mobile: 'Touch Left/Right steering pads, Tap Jump & Jet Boost buttons'
    },
    features: ['Oscillating Floating Isles', 'Dissolving Cloud Platforms', 'Prismatic Sky Gems', 'Ion Jet-Pack Thrust']
  },
  {
    id: 'cyber-rider',
    title: 'CYBER RIDER',
    subtitle: 'Hyper-Speed Grid Highway',
    description: 'Pilot the experimental Vortex-9 hoverbike down the neon expressway. Thread through heavy autonomous traffic, hit nitrous booster strips, and evade EMP energy grids.',
    genre: 'Futuristic Highway Racer',
    difficulty: 'MEDIUM',
    characterName: 'Nova Lin',
    characterTitle: 'Drift Pilot',
    characterBio: 'Former orbital grand-prix champion who modified her plasma bike with hyper-flux overdrive engines.',
    badge: 'VELOCITY ACE',
    accentColor: '#ec4899', // Pink / Magenta
    glowColor: 'rgba(236, 72, 153, 0.4)',
    gradient: 'from-pink-500 via-rose-600 to-slate-950',
    bestScoreKey: 'highScore_cyber-rider',
    controls: {
      keyboard: ['A / D or ← / → (Steer)', 'W or ↑ (Throttle)', 'S or ↓ (Brake)', 'Shift (Nitrous Boost)'],
      mobile: 'Steer Left/Right touch controls, Boost & Brake buttons'
    },
    features: ['Smooth 60FPS Drift Physics', 'High-Speed Nitrous Pads', 'Multi-Car Hover Traffic', 'Overdrive Warp Trails']
  },
  {
    id: 'treasure-quest',
    title: 'TREASURE QUEST',
    subtitle: 'The Labyrinth of King Solon',
    description: 'Delve into the mysterious stone dungeon! Navigate torchlit corridors, uncover Bronze, Silver, and Gold keys, disable dart traps, unlock inner gates, and claim the legendary Sun Relic.',
    genre: 'Dungeon Maze Adventure',
    difficulty: 'EASY',
    characterName: 'Orion Vale',
    characterTitle: 'Dungeon Seeker',
    characterBio: 'Scholar and cartographer who maps the subterranean secrets of forgotten civilizations.',
    badge: 'MAZE MASTER',
    accentColor: '#f59e0b', // Amber / Gold
    glowColor: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-amber-500 via-yellow-600 to-stone-950',
    bestScoreKey: 'highScore_treasure-quest',
    controls: {
      keyboard: ['W / A / S / D or Arrow Keys (Walk)', 'Space (Interact / Open Door)'],
      mobile: 'Virtual 4-way D-Pad or swipe navigation + Action button'
    },
    features: ['Dynamic Torchlight & Fog of War', 'Locked Gate & Key Puzzles', 'Pressure Plate Traps', 'Mini-Map Radar']
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'First Step to Legend',
    description: 'Complete your very first game on LEVELUP.',
    icon: 'Footprints',
    xpReward: 150,
    coinReward: 50,
    target: 1,
    progressKey: 'gamesPlayed'
  },
  {
    id: 'neon_sprinter',
    title: 'Neon Velocity',
    description: 'Score 500 or more in Neon Rush.',
    gameId: 'neon-rush',
    icon: 'Zap',
    xpReward: 300,
    coinReward: 100,
    target: 500,
    progressKey: 'score_neon-rush'
  },
  {
    id: 'jungle_survivor',
    title: 'Ruins Conqueror',
    description: 'Score 600 or more in Jungle Escape.',
    gameId: 'jungle-escape',
    icon: 'Trees',
    xpReward: 350,
    coinReward: 120,
    target: 600,
    progressKey: 'score_jungle-escape'
  },
  {
    id: 'sky_walker',
    title: 'Cloud Strider',
    description: 'Score 500 or more in Sky Dash without falling.',
    gameId: 'sky-dash',
    icon: 'CloudLightning',
    xpReward: 300,
    coinReward: 100,
    target: 500,
    progressKey: 'score_sky-dash'
  },
  {
    id: 'road_warrior',
    title: 'Speed of Sound',
    description: 'Score 800 or more in Cyber Rider.',
    gameId: 'cyber-rider',
    icon: 'Flame',
    xpReward: 400,
    coinReward: 150,
    target: 800,
    progressKey: 'score_cyber-rider'
  },
  {
    id: 'relic_hunter',
    title: 'The Great Vault',
    description: 'Solve the maze and unlock the Treasure Chest in Treasure Quest.',
    gameId: 'treasure-quest',
    icon: 'Key',
    xpReward: 500,
    coinReward: 200,
    target: 1,
    progressKey: 'completed_treasure-quest'
  },
  {
    id: 'coin_collector_50',
    title: 'Pocket Change',
    description: 'Accumulate 250 total Coins across your career.',
    icon: 'Coins',
    xpReward: 250,
    coinReward: 100,
    target: 250,
    progressKey: 'totalCoinsEarned'
  },
  {
    id: 'streak_3',
    title: 'Relentless Dedication',
    description: 'Achieve a 3-day daily streak.',
    icon: 'FlameKindling',
    xpReward: 500,
    coinReward: 200,
    target: 3,
    progressKey: 'dailyStreak'
  },
  {
    id: 'level_5_club',
    title: 'Elite Rising',
    description: 'Reach Player Level 5.',
    icon: 'ShieldAlert',
    xpReward: 600,
    coinReward: 250,
    target: 5,
    progressKey: 'level'
  },
  {
    id: 'all_rounder',
    title: 'Grandmaster of Games',
    description: 'Play all 5 different mini-games at least once.',
    icon: 'Trophy',
    xpReward: 800,
    coinReward: 350,
    target: 5,
    progressKey: 'uniqueGamesPlayed'
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Cyber Rush Initiate',
    description: 'Score at least 300 points in Neon Rush',
    type: 'daily',
    gameId: 'neon-rush',
    target: 300,
    current: 0,
    xpReward: 150,
    coinReward: 60,
    completed: false,
    claimed: false
  },
  {
    id: 'm2',
    title: 'Ancient Treasure Hunt',
    description: 'Collect 15 ancient relics or coins in Jungle Escape',
    type: 'daily',
    gameId: 'jungle-escape',
    target: 15,
    current: 0,
    xpReward: 200,
    coinReward: 75,
    completed: false,
    claimed: false
  },
  {
    id: 'm3',
    title: 'Prism Collector',
    description: 'Collect 12 sky gems in Sky Dash',
    type: 'daily',
    gameId: 'sky-dash',
    target: 12,
    current: 0,
    xpReward: 180,
    coinReward: 65,
    completed: false,
    claimed: false
  },
  {
    id: 'm4',
    title: 'Highway Speedster',
    description: 'Reach a distance of 400m in Cyber Rider',
    type: 'weekly',
    gameId: 'cyber-rider',
    target: 400,
    current: 0,
    xpReward: 450,
    coinReward: 180,
    completed: false,
    claimed: false
  },
  {
    id: 'm5',
    title: 'Dungeon Cartographer',
    description: 'Find all 3 colored keys in Treasure Quest',
    type: 'weekly',
    gameId: 'treasure-quest',
    target: 3,
    current: 0,
    xpReward: 500,
    coinReward: 220,
    completed: false,
    claimed: false
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Vortex_Phantom', avatar: 'neon', level: 28, score: 9840, title: 'Apex Runner' },
  { rank: 2, name: 'AuraBlaze', avatar: 'cyber', level: 24, score: 8750, title: 'Grid Champion' },
  { rank: 3, name: 'ShadowStrider', avatar: 'jungle', level: 21, score: 7920, title: 'Temple Master' },
  { rank: 4, name: 'Solstice99', avatar: 'sky', level: 19, score: 6840, title: 'Gravity Ace' },
  { rank: 5, name: 'RuneSeeker', avatar: 'maze', level: 17, score: 6210, title: 'Labyrinth King' },
  { rank: 6, name: 'PixelSamurai', avatar: 'neon', level: 15, score: 5400, title: 'Speed Demon' },
  { rank: 7, name: 'You (Player)', avatar: 'neon', level: 1, score: 0, title: 'Rookie Challenger', isCurrentPlayer: true },
  { rank: 8, name: 'EchoDrift', avatar: 'cyber', level: 12, score: 4100, title: 'Nitro Rookie' },
  { rank: 9, name: 'SkySurfer_X', avatar: 'sky', level: 10, score: 3650, title: 'Aero Cadet' },
  { rank: 10, name: 'GoldenFalcon', avatar: 'jungle', level: 9, score: 2980, title: 'Pathfinder' }
];

export const PLAYER_TITLES = [
  { level: 1, title: 'Rookie Challenger' },
  { level: 3, title: 'Neon Runner' },
  { level: 5, title: 'Temple Delver' },
  { level: 8, title: 'Aero Specialist' },
  { level: 12, title: 'Hyper Drift Ace' },
  { level: 16, title: 'Vault Breaker' },
  { level: 20, title: 'Grand Champion' },
  { level: 25, title: 'Cyber Legend' }
];
