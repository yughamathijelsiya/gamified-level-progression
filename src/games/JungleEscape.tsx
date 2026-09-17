import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../services/sound';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Compass,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface PlatformSegment {
  x: number;
  width: number;
  type: 'stone' | 'bridge' | 'gap';
}

interface JungleObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spikes' | 'boulder' | 'low_vine';
  passed?: boolean;
}

interface JungleGem {
  x: number;
  y: number;
  type: 'gold_idol' | 'emerald';
  collected?: boolean;
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

export const JungleEscape: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordGameCompletion, setActiveGame, soundMuted, toggleSound } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [treasuresCollected, setTreasuresCollected] = useState(0);

  const gameRef = useRef({
    playerX: 120,
    playerY: 420,
    vy: 0,
    isGrounded: true,
    jumpCount: 0,
    isSliding: false,
    slideTimer: 0,
    speed: 7.5,
    distanceTravelled: 0,
    scoreVal: 0,
    treasures: 0,
    platforms: [] as PlatformSegment[],
    obstacles: [] as JungleObstacle[],
    gems: [] as JungleGem[],
    particles: [] as Particle[],
    spores: [] as { x: number; y: number; speed: number; radius: number }[],
    startTime: 0,
    gameOver: false,
    groundY: 460
  });

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) return;

    if (g.isGrounded || g.jumpCount < 2) {
      g.vy = g.jumpCount === 0 ? -15 : -13;
      g.isGrounded = false;
      g.jumpCount += 1;
      g.isSliding = false;
      g.slideTimer = 0;
      sounds.playJump();

      // Jump dust
      for (let i = 0; i < 8; i++) {
        g.particles.push({
          x: g.playerX + (Math.random() - 0.5) * 20,
          y: g.playerY + 20,
          vx: (Math.random() - 0.5) * 4 - 2,
          vy: Math.random() * 2 - 1,
          color: '#84cc16',
          size: Math.random() * 3 + 2,
          life: 0,
          maxLife: 20
        });
      }
    }
  }, []);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) return;
    if (g.isGrounded && !g.isSliding) {
      g.isSliding = true;
      g.slideTimer = 32;
      sounds.playSlide();
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.code === 'Space' || e.key === 'Enter') {
          startGame();
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        e.preventDefault();
        jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump, slide]);

  const startGame = () => {
    const sporesArr = [];
    for (let i = 0; i < 30; i++) {
      sporesArr.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: Math.random() * 1 + 0.5,
        radius: Math.random() * 2.5 + 1
      });
    }

    // Initial continuous platforms
    const initialPlatforms: PlatformSegment[] = [
      { x: 0, width: 900, type: 'stone' },
      { x: 900, width: 350, type: 'bridge' },
      { x: 1350, width: 500, type: 'stone' }
    ];

    gameRef.current = {
      playerX: 120,
      playerY: 420,
      vy: 0,
      isGrounded: true,
      jumpCount: 0,
      isSliding: false,
      slideTimer: 0,
      speed: 7.5,
      distanceTravelled: 0,
      scoreVal: 0,
      treasures: 0,
      platforms: initialPlatforms,
      obstacles: [
        { x: 600, y: 432, width: 36, height: 28, type: 'spikes' },
        { x: 1050, y: 380, width: 40, height: 40, type: 'low_vine' }
      ],
      gems: [
        { x: 400, y: 390, type: 'gold_idol' },
        { x: 450, y: 360, type: 'emerald' },
        { x: 500, y: 390, type: 'gold_idol' }
      ],
      particles: [],
      spores: sporesArr,
      startTime: Date.now(),
      gameOver: false,
      groundY: 460
    };

    setScore(0);
    setDistance(0);
    setTreasuresCollected(0);
    setGameState('playing');
    sounds.playClick();
  };

  const endGame = () => {
    const g = gameRef.current;
    if (g.gameOver) return;
    g.gameOver = true;
    sounds.playCrash();

    // Splatter particles
    for (let i = 0; i < 30; i++) {
      g.particles.push({
        x: g.playerX,
        y: g.playerY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: '#22c55e',
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 30
      });
    }

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    recordGameCompletion('jungle-escape', g.scoreVal, g.treasures, duration);
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

      // Deep Jungle Sky Gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#022c22');
      sky.addColorStop(0.5, '#064e3b');
      sky.addColorStop(1, '#022c22');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Distant Temple Silhouette & Giant Jungle Vines
      ctx.fillStyle = '#011c16';
      ctx.beginPath();
      // Ancient stone temple pyramid in background
      ctx.moveTo(width * 0.4, 300);
      ctx.lineTo(width * 0.5, 220);
      ctx.lineTo(width * 0.56, 220);
      ctx.lineTo(width * 0.66, 300);
      ctx.fill();

      // Giant winding ancient tree trunks
      ctx.fillStyle = '#06382b';
      ctx.fillRect(40, 0, 50, height);
      ctx.fillRect(520, 0, 65, height);

      // Spores floating
      ctx.fillStyle = 'rgba(134, 239, 172, 0.45)';
      g.spores.forEach(spore => {
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
        ctx.fill();

        if (gameState === 'playing' && !g.gameOver) {
          spore.x -= spore.speed;
          spore.y += Math.sin(spore.x * 0.02) * 0.5;
          if (spore.x < 0) spore.x = width + 10;
        }
      });

      // Update Game Logic if Playing
      if (gameState === 'playing' && !g.gameOver) {
        g.speed = Math.min(15, 7.5 + g.distanceTravelled * 0.0025);
        g.distanceTravelled += g.speed * 0.1;
        g.scoreVal += Math.floor(g.speed * 0.12);

        // Slide Timer
        if (g.isSliding) {
          g.slideTimer--;
          if (g.slideTimer <= 0) g.isSliding = false;
        }

        // Apply Gravity
        g.playerY += g.vy;
        g.vy += 0.75; // gravity

        // Check platform support underneath player
        let onPlatform = false;
        for (const plat of g.platforms) {
          if (
            g.playerX >= plat.x - 15 &&
            g.playerX <= plat.x + plat.width + 15 &&
            plat.type !== 'gap'
          ) {
            if (g.playerY + 24 >= g.groundY && g.playerY + 24 <= g.groundY + 25 && g.vy >= 0) {
              g.playerY = g.groundY - 24;
              g.vy = 0;
              g.isGrounded = true;
              g.jumpCount = 0;
              onPlatform = true;
              break;
            }
          }
        }

        if (!onPlatform && g.playerY + 24 > g.groundY + 5) {
          g.isGrounded = false;
        }

        // Fall into deep jungle pit death
        if (g.playerY > height + 50) {
          endGame();
        }

        // Scroll Platforms
        for (let i = g.platforms.length - 1; i >= 0; i--) {
          const plat = g.platforms[i];
          plat.x -= g.speed;
          if (plat.x + plat.width < -100) {
            g.platforms.splice(i, 1);
          }
        }

        // Spawn next platforms if end is approaching
        const lastPlat = g.platforms[g.platforms.length - 1];
        if (lastPlat && lastPlat.x + lastPlat.width < width + 400) {
          const isGap = Math.random() < 0.28;
          if (isGap) {
            const gapWidth = 100 + Math.random() * 80;
            g.platforms.push({
              x: lastPlat.x + lastPlat.width,
              width: gapWidth,
              type: 'gap'
            });
            const nextWidth = 300 + Math.random() * 300;
            g.platforms.push({
              x: lastPlat.x + lastPlat.width + gapWidth,
              width: nextWidth,
              type: Math.random() < 0.5 ? 'bridge' : 'stone'
            });
          } else {
            const platWidth = 350 + Math.random() * 300;
            g.platforms.push({
              x: lastPlat.x + lastPlat.width,
              width: platWidth,
              type: Math.random() < 0.4 ? 'bridge' : 'stone'
            });
          }
        }

        // Scroll and check Obstacles
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Rolling boulder motion
          if (obs.type === 'boulder') {
            obs.x -= 2; // rolls towards player
          }

          // Hitbox collision
          const playerLeft = g.playerX - 16;
          const playerRight = g.playerX + 16;
          const playerTop = g.isSliding ? g.playerY + 5 : g.playerY - 24;
          const playerBottom = g.playerY + 24;

          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;
          const obsTop = obs.y;
          const obsBottom = obs.y + obs.height;

          const collides =
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerBottom > obsTop &&
            playerTop < obsBottom;

          if (collides && !obs.passed) {
            endGame();
            break;
          }

          if (obs.x + obs.width < -100) {
            g.obstacles.splice(i, 1);
          }
        }

        // Scroll and check Gems / Treasures
        for (let i = g.gems.length - 1; i >= 0; i--) {
          const gem = g.gems[i];
          gem.x -= g.speed;

          const dist = Math.hypot(g.playerX - gem.x, g.playerY - gem.y);
          if (dist < 32 && !gem.collected) {
            gem.collected = true;
            g.treasures += 1;
            g.scoreVal += gem.type === 'gold_idol' ? 50 : 30;
            sounds.playCoin();

            // Gem sparkle particles
            for (let p = 0; p < 8; p++) {
              g.particles.push({
                x: gem.x,
                y: gem.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: gem.type === 'gold_idol' ? '#fbbf24' : '#34d399',
                size: 3,
                life: 0,
                maxLife: 20
              });
            }
          }

          if (gem.x < -50 || gem.collected) {
            g.gems.splice(i, 1);
          }
        }

        // Periodically spawn obstacles & treasures on the right
        const maxObsX = Math.max(...g.obstacles.map(o => o.x), 0);
        if (maxObsX < width + 200) {
          const spawnX = width + 250 + Math.random() * 200;
          const r = Math.random();
          if (r < 0.4) {
            // Spikes on stone
            g.obstacles.push({
              x: spawnX,
              y: g.groundY - 26,
              width: 38,
              height: 26,
              type: 'spikes'
            });
          } else if (r < 0.7) {
            // Low hanging swinging vine / tree branch (must slide under)
            g.obstacles.push({
              x: spawnX,
              y: g.groundY - 70,
              width: 44,
              height: 48,
              type: 'low_vine'
            });
          } else {
            // Rolling boulder
            g.obstacles.push({
              x: spawnX,
              y: g.groundY - 34,
              width: 34,
              height: 34,
              type: 'boulder'
            });
          }

          // Spawn floating relic
          g.gems.push({
            x: spawnX + 80,
            y: g.groundY - 60 - Math.random() * 30,
            type: Math.random() < 0.5 ? 'gold_idol' : 'emerald'
          });
        }

        setScore(g.scoreVal);
        setDistance(Math.floor(g.distanceTravelled));
        setTreasuresCollected(g.treasures);
      }

      // Draw Platforms (Stone ruins & wooden rope bridges)
      g.platforms.forEach(plat => {
        if (plat.type === 'gap') return;

        if (plat.type === 'stone') {
          // Ancient mossy stone blocks
          ctx.fillStyle = '#14532d';
          ctx.fillRect(plat.x, g.groundY, plat.width, height - g.groundY);

          // Top green moss edge
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x, g.groundY, plat.width, 8);

          // Stone brick divider lines
          ctx.strokeStyle = '#052e16';
          ctx.lineWidth = 2;
          for (let bx = plat.x; bx < plat.x + plat.width; bx += 60) {
            ctx.strokeRect(bx, g.groundY + 8, 60, 25);
          }
        } else if (plat.type === 'bridge') {
          // Rickety rope bridge planks
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(plat.x, g.groundY + 2);
          ctx.lineTo(plat.x + plat.width, g.groundY + 2);
          ctx.stroke();

          // Wooden planks
          ctx.fillStyle = '#b45309';
          for (let px = plat.x; px < plat.x + plat.width; px += 18) {
            ctx.fillRect(px, g.groundY - 4, 12, 14);
          }
        }
      });

      // Draw Obstacles
      g.obstacles.forEach(obs => {
        ctx.save();
        if (obs.type === 'spikes') {
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          for (let i = 0; i < obs.width; i += 12) {
            ctx.moveTo(obs.x + i, obs.y + obs.height);
            ctx.lineTo(obs.x + i + 6, obs.y);
            ctx.lineTo(obs.x + i + 12, obs.y + obs.height);
          }
          ctx.fill();
        } else if (obs.type === 'low_vine') {
          // Thick swinging canopy branch with thorns
          ctx.fillStyle = '#166534';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Sharp thorn spikes
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(obs.x + 4, obs.y + obs.height - 8, 8, 8);
          ctx.fillRect(obs.x + 24, obs.y + obs.height - 8, 8, 8);

          // Danger tag
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px Outfit';
          ctx.fillText('DUCK', obs.x + 6, obs.y + 16);
        } else if (obs.type === 'boulder') {
          // Rolling stone boulder
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Gems & Ancient Gold Idols
      g.gems.forEach(gem => {
        ctx.save();
        if (gem.type === 'gold_idol') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;

          // Aztec Gold Idol shape
          ctx.beginPath();
          ctx.arc(gem.x, gem.y - 6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(gem.x - 7, gem.y + 2, 14, 12);
        } else {
          // Emerald Gem
          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.moveTo(gem.x, gem.y - 10);
          ctx.lineTo(gem.x + 9, gem.y);
          ctx.lineTo(gem.x, gem.y + 10);
          ctx.lineTo(gem.x - 9, gem.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Maya Thorne (Ruins Pathfinder)
      if (!g.gameOver) {
        ctx.save();

        if (g.isSliding) {
          // Sliding under vines
          ctx.fillStyle = '#15803d';
          ctx.fillRect(g.playerX - 22, g.playerY + 8, 44, 16);

          // Explorer Hat
          ctx.fillStyle = '#78350f';
          ctx.fillRect(g.playerX + 12, g.playerY + 8, 14, 8);
        } else {
          // Standing / Jumping Explorer
          // Head / Fedora Hat
          ctx.fillStyle = '#92400e';
          ctx.fillRect(g.playerX - 14, g.playerY - 32, 28, 6); // Hat brim
          ctx.fillRect(g.playerX - 10, g.playerY - 42, 20, 10); // Hat crown

          // Face
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(g.playerX - 8, g.playerY - 26, 16, 10);

          // Explorer Jacket / Gear
          ctx.fillStyle = '#15803d';
          ctx.fillRect(g.playerX - 12, g.playerY - 16, 24, 20);

          // Leather Satchel / Compass
          ctx.fillStyle = '#b45309';
          ctx.fillRect(g.playerX - 8, g.playerY - 10, 16, 6);

          // Legs
          const legSwing = Math.sin(g.distanceTravelled * 0.4) * 6;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(g.playerX - 8, g.playerY + 4 + legSwing, 6, 20);
          ctx.fillRect(g.playerX + 2, g.playerY + 4 - legSwing, 6, 20);

          // Double Jump spin effect
          if (g.jumpCount === 2) {
            ctx.strokeStyle = '#86efac';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(g.playerX, g.playerY - 8, 28, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // Draw Particles
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

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Return to Hub"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-emerald-400 tracking-wider flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              JUNGLE ESCAPE
            </h2>
            <p className="text-xs text-slate-400">Hero: Maya Thorne (Pathfinder)</p>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 text-sm font-semibold">
            <Coins className="w-4 h-4" />
            <span>{treasuresCollected}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 text-sm font-semibold">
            <span className="text-xs text-emerald-500">DIST</span>
            <span>{distance}m</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
              <Compass className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2 tracking-wide">
              JUNGLE ESCAPE
            </h3>
            <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
              Flee the crumbling Sun Temple! Jump across collapsed bridge chasms, perform double-jumps over spike pits, and duck beneath thorny jungle vines!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-400 max-w-sm w-full">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">Space / W / ↑</span>
                Jump (Double Tap = Double Jump)
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">S / ↓</span>
                Slide / Duck Under Low Vines
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-display font-bold text-lg tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition"
            >
              ESCAPE NOW (SPACE)
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">Captured in the Wilds</span>
            <h3 className="text-4xl font-display font-black text-white mb-4">EXPEDITION FAILED</h3>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md w-full">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Distance</div>
                <div className="text-2xl font-display font-bold text-emerald-400">{distance}m</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Score</div>
                <div className="text-2xl font-display font-bold text-white">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Relics</div>
                <div className="text-2xl font-display font-bold text-amber-400">+{treasuresCollected}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-emerald-500/30 transition active:scale-95"
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

      {/* Responsive Touch Controls */}
      <div className="w-full bg-slate-900/90 px-4 py-3 border-t border-emerald-500/20 flex items-center justify-between select-none">
        <button
          onPointerDown={slide}
          className="w-24 h-12 rounded-xl bg-slate-800 active:bg-emerald-500 active:text-slate-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
          aria-label="Slide"
        >
          <ArrowDown className="w-5 h-5 mr-1" />
          SLIDE
        </button>

        <div className="hidden sm:block text-xs text-slate-400 text-center">
          Space or <span className="text-emerald-400 font-semibold">W</span> (Jump / Double Jump) |{' '}
          <span className="text-emerald-400 font-semibold">S</span> (Duck / Slide)
        </div>

        <button
          onPointerDown={jump}
          className="w-28 h-12 rounded-xl bg-emerald-500 active:bg-emerald-400 text-slate-950 font-display font-extrabold flex items-center justify-center text-sm shadow-lg shadow-emerald-500/30 transition active:scale-95"
          aria-label="Jump"
        >
          <ArrowUp className="w-5 h-5 mr-1" />
          JUMP / FLIP
        </button>
      </div>
    </div>
  );
};
