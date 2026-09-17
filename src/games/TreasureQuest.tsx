import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../services/sound';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Key,
  Flame,
  Award,
  ShieldAlert
} from 'lucide-react';

interface MazeTile {
  type: 'wall' | 'floor' | 'door_bronze' | 'door_silver' | 'door_gold' | 'chest';
  visited?: boolean;
}

interface DungeonTrap {
  x: number;
  y: number;
  activeTimer: number; // cycles between 0 and 120 frames
  isSpikeUp: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

// 15x15 dungeon grid definition: 1 = wall, 0 = floor, B = Bronze Door, S = Silver Door, G = Gold Door, C = Chest
const MAZE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 'B', 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 'S', 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 'G', 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 'C', 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE_SIZE = 48;

export const TreasureQuest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordGameCompletion, setActiveGame, soundMuted, toggleSound } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'victory'>('ready');
  const [keysFound, setKeysFound] = useState({ bronze: false, silver: false, gold: false });
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    px: 1.5,
    py: 1.5,
    targetPx: 1.5,
    targetPy: 1.5,
    health: 3,
    keys: { bronze: false, silver: false, gold: false },
    keyPositions: [
      { type: 'bronze', x: 1, y: 13, collected: false },
      { type: 'silver', x: 7, y: 1, collected: false },
      { type: 'gold', x: 13, y: 1, collected: false }
    ],
    traps: [
      { x: 3, y: 1, activeTimer: 0, isSpikeUp: false },
      { x: 7, y: 5, activeTimer: 40, isSpikeUp: false },
      { x: 9, y: 7, activeTimer: 80, isSpikeUp: false },
      { x: 13, y: 9, activeTimer: 20, isSpikeUp: false },
      { x: 5, y: 11, activeTimer: 60, isSpikeUp: false }
    ] as DungeonTrap[],
    particles: [] as Particle[],
    doorsUnlocked: { bronze: false, silver: false, gold: false },
    chestOpened: false,
    startTime: 0,
    gameOver: false,
    scoreVal: 0,
    cameraX: 0,
    cameraY: 0
  });

  const movePlayer = useCallback((dx: number, dy: number) => {
    const g = gameRef.current;
    if (g.gameOver || g.chestOpened) return;

    const newTargetX = g.targetPx + dx;
    const newTargetY = g.targetPy + dy;

    // Check bounds
    const tx = Math.floor(newTargetX);
    const ty = Math.floor(newTargetY);

    if (tx < 0 || tx >= 15 || ty < 0 || ty >= 15) return;

    const tile = MAZE_MAP[ty][tx];

    // Wall collision
    if (tile === 1) return;

    // Check locked doors
    if (tile === 'B' && !g.doorsUnlocked.bronze) {
      if (g.keys.bronze) {
        g.doorsUnlocked.bronze = true;
        sounds.playKeyPickup();
        g.scoreVal += 150;
      } else {
        return; // Locked!
      }
    } else if (tile === 'S' && !g.doorsUnlocked.silver) {
      if (g.keys.silver) {
        g.doorsUnlocked.silver = true;
        sounds.playKeyPickup();
        g.scoreVal += 200;
      } else {
        return;
      }
    } else if (tile === 'G' && !g.doorsUnlocked.gold) {
      if (g.keys.gold) {
        g.doorsUnlocked.gold = true;
        sounds.playKeyPickup();
        g.scoreVal += 300;
      } else {
        return;
      }
    }

    g.targetPx = newTargetX;
    g.targetPy = newTargetY;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.code === 'Space' || e.key === 'Enter') {
          startGame();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer]);

  const startGame = () => {
    gameRef.current = {
      px: 1.5,
      py: 1.5,
      targetPx: 1.5,
      targetPy: 1.5,
      health: 3,
      keys: { bronze: false, silver: false, gold: false },
      keyPositions: [
        { type: 'bronze', x: 1, y: 13, collected: false },
        { type: 'silver', x: 7, y: 1, collected: false },
        { type: 'gold', x: 13, y: 1, collected: false }
      ],
      traps: [
        { x: 3, y: 1, activeTimer: 0, isSpikeUp: false },
        { x: 7, y: 5, activeTimer: 40, isSpikeUp: false },
        { x: 9, y: 7, activeTimer: 80, isSpikeUp: false },
        { x: 13, y: 9, activeTimer: 20, isSpikeUp: false },
        { x: 5, y: 11, activeTimer: 60, isSpikeUp: false }
      ],
      particles: [],
      doorsUnlocked: { bronze: false, silver: false, gold: false },
      chestOpened: false,
      startTime: Date.now(),
      gameOver: false,
      scoreVal: 100,
      cameraX: 0,
      cameraY: 0
    };

    setHealth(3);
    setScore(100);
    setKeysFound({ bronze: false, silver: false, gold: false });
    setGameState('playing');
    sounds.playClick();
  };

  const winGame = () => {
    const g = gameRef.current;
    g.chestOpened = true;
    sounds.playVictory();

    // Massive chest fireworks
    for (let i = 0; i < 50; i++) {
      g.particles.push({
        x: g.px * TILE_SIZE,
        y: g.py * TILE_SIZE,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 6 + 3,
        life: 0,
        maxLife: 50
      });
    }

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    const finalScore = g.scoreVal + 1000 + g.health * 200;
    recordGameCompletion('treasure-quest', finalScore, 3, duration, {
      keysFound: 3,
      reachedTreasure: true
    });
    setGameState('victory');
  };

  const endGame = () => {
    const g = gameRef.current;
    if (g.gameOver) return;
    g.gameOver = true;
    sounds.playCrash();

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    const keysCount = (g.keys.bronze ? 1 : 0) + (g.keys.silver ? 1 : 0) + (g.keys.gold ? 1 : 0);
    recordGameCompletion('treasure-quest', g.scoreVal, keysCount, duration, {
      keysFound: keysCount,
      reachedTreasure: false
    });
    setGameState('gameover');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const g = gameRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Smooth player movement interpolation
      g.px += (g.targetPx - g.px) * 0.25;
      g.py += (g.targetPy - g.py) * 0.25;

      // Smooth camera follow player
      const targetCamX = g.px * TILE_SIZE - width / 2;
      const targetCamY = g.py * TILE_SIZE - height / 2;
      g.cameraX += (targetCamX - g.cameraX) * 0.15;
      g.cameraY += (targetCamY - g.cameraY) * 0.15;

      // Clear dark dungeon background
      ctx.fillStyle = '#090807';
      ctx.fillRect(0, 0, width, height);

      // Camera Offset
      ctx.save();
      ctx.translate(-Math.floor(g.cameraX), -Math.floor(g.cameraY));

      // Draw Maze Tiles
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          const tile = MAZE_MAP[r][c];
          const rx = c * TILE_SIZE;
          const ry = r * TILE_SIZE;

          if (tile === 1) {
            // Stone Dungeon Wall
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx, ry, TILE_SIZE, TILE_SIZE);

            // Wall stone texture
            ctx.fillStyle = '#44403c';
            ctx.fillRect(rx + 4, ry + 4, TILE_SIZE - 8, 4);
          } else {
            // Dungeon Stone Floor
            ctx.fillStyle = '#292524';
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx, ry, TILE_SIZE, TILE_SIZE);

            // Special Tiles: Doors and Chest
            if (tile === 'B') {
              // Bronze Door
              ctx.fillStyle = g.doorsUnlocked.bronze ? '#44403c' : '#b45309';
              ctx.fillRect(rx + 6, ry + 6, TILE_SIZE - 12, TILE_SIZE - 12);
              if (!g.doorsUnlocked.bronze) {
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 12px Rajdhani';
                ctx.fillText('BRONZE', rx + 7, ry + 28);
              }
            } else if (tile === 'S') {
              // Silver Door
              ctx.fillStyle = g.doorsUnlocked.silver ? '#44403c' : '#94a3b8';
              ctx.fillRect(rx + 6, ry + 6, TILE_SIZE - 12, TILE_SIZE - 12);
              if (!g.doorsUnlocked.silver) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Rajdhani';
                ctx.fillText('SILVER', rx + 9, ry + 28);
              }
            } else if (tile === 'G') {
              // Gold Door
              ctx.fillStyle = g.doorsUnlocked.gold ? '#44403c' : '#f59e0b';
              ctx.fillRect(rx + 6, ry + 6, TILE_SIZE - 12, TILE_SIZE - 12);
              if (!g.doorsUnlocked.gold) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Rajdhani';
                ctx.fillText('GOLD', rx + 11, ry + 28);
              }
            } else if (tile === 'C') {
              // Ancient Relic Chest
              ctx.fillStyle = '#f59e0b';
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 15;
              ctx.fillRect(rx + 10, ry + 12, 28, 24);

              ctx.fillStyle = '#ffffff';
              ctx.fillRect(rx + 22, ry + 20, 4, 8);
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Update and Draw Spike Traps
      g.traps.forEach(trap => {
        trap.activeTimer = (trap.activeTimer + 1) % 100;
        trap.isSpikeUp = trap.activeTimer > 60;

        const tx = trap.x * TILE_SIZE;
        const ty = trap.y * TILE_SIZE;

        ctx.save();
        if (trap.isSpikeUp) {
          // Lethal Spike Up
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(tx + 8, ty + TILE_SIZE - 8);
          ctx.lineTo(tx + 24, ty + 8);
          ctx.lineTo(tx + 40, ty + TILE_SIZE - 8);
          ctx.fill();

          // Check damage to player
          const dist = Math.hypot(g.px - (trap.x + 0.5), g.py - (trap.y + 0.5));
          if (dist < 0.6 && gameState === 'playing' && !g.gameOver) {
            g.health -= 1;
            setHealth(g.health);
            sounds.playCrash();

            if (g.health <= 0) {
              endGame();
            } else {
              // Bounce player back
              g.targetPx = 1.5;
              g.targetPy = 1.5;
            }
          }
        } else {
          // Spikes retracting
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx + 12, ty + 12, 24, 24);
        }
        ctx.restore();
      });

      // Update and Draw Key Pickups
      g.keyPositions.forEach(k => {
        if (k.collected) return;
        const kx = (k.x + 0.5) * TILE_SIZE;
        const ky = (k.y + 0.5) * TILE_SIZE;

        const colors = { bronze: '#b45309', silver: '#cbd5e1', gold: '#fbbf24' };
        ctx.save();
        ctx.fillStyle = colors[k.type as keyof typeof colors];
        ctx.shadowColor = colors[k.type as keyof typeof colors];
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(kx, ky - 4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(kx - 2, ky + 2, 4, 10);
        ctx.fillRect(kx, ky + 8, 4, 3);
        ctx.restore();

        // Pickup Check
        const dist = Math.hypot(g.px - (k.x + 0.5), g.py - (k.y + 0.5));
        if (dist < 0.6 && !k.collected) {
          k.collected = true;
          g.keys[k.type as keyof typeof g.keys] = true;
          setKeysFound({ ...g.keys });
          g.scoreVal += 200;
          sounds.playKeyPickup();

          for (let p = 0; p < 12; p++) {
            g.particles.push({
              x: kx,
              y: ky,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: colors[k.type as keyof typeof colors],
              size: 3,
              life: 0,
              maxLife: 20
            });
          }
        }
      });

      // Check Win Condition (Arriving at Chest with Gold Door Open)
      const playerTileX = Math.floor(g.px);
      const playerTileY = Math.floor(g.py);
      if (
        MAZE_MAP[playerTileY][playerTileX] === 'C' &&
        gameState === 'playing' &&
        !g.chestOpened
      ) {
        winGame();
      }

      // Draw Orion Vale (Dungeon Seeker)
      const pScreenX = g.px * TILE_SIZE;
      const pScreenY = g.py * TILE_SIZE;

      ctx.save();
      // Torchlight glow around player
      const torchGrad = ctx.createRadialGradient(pScreenX, pScreenY, 15, pScreenX, pScreenY, 160);
      torchGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      torchGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = torchGrad;
      ctx.beginPath();
      ctx.arc(pScreenX, pScreenY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Character Body
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pScreenX, pScreenY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Torso / Pack
      ctx.fillStyle = '#78350f';
      ctx.fillRect(pScreenX - 8, pScreenY - 6, 16, 12);

      // Torch in hand
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(pScreenX + 12, pScreenY - 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Active Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life >= p.maxLife) {
          g.particles.splice(i, 1);
        }
      }

      ctx.restore(); // restore camera

      // Mini-Map Radar (Top Right Corner)
      const mapScale = 5;
      const mapX = width - 15 * mapScale - 16;
      const mapY = 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(mapX - 4, mapY - 4, 15 * mapScale + 8, 15 * mapScale + 8);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX - 4, mapY - 4, 15 * mapScale + 8, 15 * mapScale + 8);

      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          const t = MAZE_MAP[r][c];
          if (t === 1) {
            ctx.fillStyle = '#475569';
            ctx.fillRect(mapX + c * mapScale, mapY + r * mapScale, mapScale, mapScale);
          } else if (t === 'C') {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(mapX + c * mapScale, mapY + r * mapScale, mapScale, mapScale);
          }
        }
      }

      // Player Blip on Minimap
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(mapX + g.px * mapScale, mapY + g.py * mapScale, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl border border-amber-500/30 shadow-2xl shadow-amber-950/50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Return to Hub"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-amber-400 tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              TREASURE QUEST
            </h2>
            <p className="text-xs text-slate-400">Hero: Orion Vale (Dungeon Seeker)</p>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs">
            <span className={keysFound.bronze ? 'text-amber-500 font-bold' : 'text-slate-600'}>
              [B]
            </span>
            <span className={keysFound.silver ? 'text-slate-200 font-bold' : 'text-slate-600'}>
              [S]
            </span>
            <span className={keysFound.gold ? 'text-yellow-400 font-bold' : 'text-slate-600'}>
              [G]
            </span>
          </div>

          <div className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30 text-sm font-semibold">
            <span>❤️ x{health}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full aspect-[4/3] max-h-[560px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full object-cover"
        />

        {/* Start Game Ready Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/20">
              <Key className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2 tracking-wide">
              TREASURE QUEST
            </h3>
            <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
              Explore King Solon&apos;s ancient labyrinth dungeon! Locate the Bronze, Silver, and Gold keys, dodge spike traps, unlock gates, and claim the Sun Relic!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-400 max-w-sm w-full">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <span className="text-amber-400 font-bold block mb-1">W / A / S / D or Arrow Keys</span>
                Navigate 4 Directions
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-display font-bold text-lg tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition"
            >
              ENTER LABYRINTH (SPACE)
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-2">
              <Award className="w-9 h-9" />
            </div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
              Sanctum Conquered
            </span>
            <h3 className="text-4xl font-display font-black text-white mb-4">RELIC CLAIMED!</h3>

            <p className="text-slate-300 text-sm max-w-md mb-6">
              You navigated the subterranean traps and successfully unlocked the Vault of King Solon!
            </p>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-amber-500/30 transition active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                PLAY AGAIN
              </button>
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-base transition"
              >
                <Home className="w-5 h-5" />
                GAME HUB
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">Trap Triggered</span>
            <h3 className="text-4xl font-display font-black text-white mb-4">PERISHED IN MAZE</h3>

            <div className="flex gap-4 mt-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-amber-500/30 transition active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                TRY AGAIN
              </button>
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-base transition"
              >
                <Home className="w-5 h-5" />
                GAME HUB
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive 4-Way D-Pad Touch Controls */}
      <div className="w-full bg-slate-900/90 px-4 py-3 border-t border-amber-500/20 flex items-center justify-between select-none">
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            onPointerDown={() => movePlayer(0, -1)}
            className="h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            onPointerDown={() => movePlayer(-1, 0)}
            className="h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onPointerDown={() => movePlayer(0, 1)}
            className="h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onPointerDown={() => movePlayer(1, 0)}
            className="h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400 text-center max-w-xs">
          Use <span className="text-amber-400 font-semibold">WASD</span> or{' '}
          <span className="text-amber-400 font-semibold">Arrow Keys</span> to walk. Walk onto keys to collect them and onto doors to unlock!
        </div>

        <div className="text-right text-xs text-slate-400">
          <div>Relic Vault</div>
          <div className="text-amber-400 font-bold">15x15 Maze</div>
        </div>
      </div>
    </div>
  );
};
