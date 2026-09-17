import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../services/sound';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  CloudLightning,
  Sparkles,
  Zap
} from 'lucide-react';

interface SkyPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'standard' | 'moving' | 'crumbly' | 'booster';
  moveDir?: number;
  moveSpeed?: number;
  minX?: number;
  maxX?: number;
  crumblesLeft?: number;
  stepped?: boolean;
}

interface SkyGem {
  x: number;
  y: number;
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

export const SkyDash: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordGameCompletion, setActiveGame, soundMuted, toggleSound } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [jetFuel, setJetFuel] = useState(100);

  const gameRef = useRef({
    playerX: 400,
    playerY: 480,
    vx: 0,
    vy: 0,
    fuel: 100,
    maxFuel: 100,
    isGrounded: false,
    cameraY: 0,
    maxAltitude: 0,
    scoreVal: 0,
    gems: 0,
    platforms: [] as SkyPlatform[],
    gemsList: [] as SkyGem[],
    particles: [] as Particle[],
    clouds: [] as { x: number; y: number; scale: number; speed: number }[],
    keys: { left: false, right: false, up: false },
    startTime: 0,
    gameOver: false
  });

  const jumpOrBoost = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) return;

    if (g.isGrounded) {
      g.vy = -16;
      g.isGrounded = false;
      sounds.playJump();
    } else if (g.fuel >= 20) {
      // Jet boost midair
      g.vy = -14;
      g.fuel -= 25;
      sounds.playJump();

      // Jet exhaust particles
      for (let i = 0; i < 10; i++) {
        g.particles.push({
          x: g.playerX + (Math.random() - 0.5) * 14,
          y: g.playerY + 16,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 5 + 3,
          color: '#a855f7',
          size: Math.random() * 3 + 2,
          life: 0,
          maxLife: 20
        });
      }
    }
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.code === 'Space' || e.key === 'Enter') {
          startGame();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        e.preventDefault();
        jumpOrBoost();
        gameRef.current.keys.up = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        gameRef.current.keys.up = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, jumpOrBoost]);

  const startGame = () => {
    // Generate initial platforms ascending upward
    const plats: SkyPlatform[] = [
      { x: 300, y: 520, width: 200, height: 16, type: 'standard' },
      { x: 200, y: 410, width: 130, height: 16, type: 'standard' },
      { x: 450, y: 310, width: 120, height: 16, type: 'moving', moveDir: 1, moveSpeed: 2, minX: 350, maxX: 650 },
      { x: 260, y: 190, width: 110, height: 16, type: 'crumbly', crumblesLeft: 30 },
      { x: 420, y: 70, width: 120, height: 16, type: 'booster' },
      { x: 180, y: -50, width: 120, height: 16, type: 'standard' },
      { x: 380, y: -170, width: 130, height: 16, type: 'moving', moveDir: -1, moveSpeed: 2.5, minX: 150, maxX: 550 },
      { x: 220, y: -290, width: 110, height: 16, type: 'standard' },
      { x: 440, y: -410, width: 100, height: 16, type: 'crumbly', crumblesLeft: 30 },
      { x: 280, y: -530, width: 120, height: 16, type: 'booster' }
    ];

    const initialGems: SkyGem[] = [
      { x: 260, y: 370 },
      { x: 500, y: 270 },
      { x: 310, y: 150 },
      { x: 480, y: 30 },
      { x: 240, y: -90 },
      { x: 440, y: -210 }
    ];

    const cloudArr = [];
    for (let i = 0; i < 15; i++) {
      cloudArr.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        scale: Math.random() * 1.5 + 0.8,
        speed: Math.random() * 0.4 + 0.1
      });
    }

    gameRef.current = {
      playerX: 400,
      playerY: 480,
      vx: 0,
      vy: -12,
      fuel: 100,
      maxFuel: 100,
      isGrounded: false,
      cameraY: 0,
      maxAltitude: 0,
      scoreVal: 0,
      gems: 0,
      platforms: plats,
      gemsList: initialGems,
      particles: [],
      clouds: cloudArr,
      keys: { left: false, right: false, up: false },
      startTime: Date.now(),
      gameOver: false
    };

    setScore(0);
    setAltitude(0);
    setGemsCollected(0);
    setJetFuel(100);
    setGameState('playing');
    sounds.playClick();
  };

  const endGame = () => {
    const g = gameRef.current;
    if (g.gameOver) return;
    g.gameOver = true;
    sounds.playCrash();

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    recordGameCompletion('sky-dash', g.scoreVal, g.gems, duration);
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

      // Stratospheric Purple/Indigo Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.4, '#2e1065');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = 'rgba(216, 180, 254, 0.15)';
      g.clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, (cloud.y - g.cameraY * 0.3) % height, 40 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 30 * cloud.scale, (cloud.y - g.cameraY * 0.3) % height, 50 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 60 * cloud.scale, (cloud.y - g.cameraY * 0.3) % height, 35 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();

        cloud.x += cloud.speed;
        if (cloud.x > width + 100) cloud.x = -100;
      });

      // Update Game Loop if playing
      if (gameState === 'playing' && !g.gameOver) {
        // Player Horizontal Physics
        if (g.keys.left) g.vx -= 0.8;
        if (g.keys.right) g.vx += 0.8;
        g.vx *= 0.88; // friction
        g.playerX += g.vx;

        // Screen wrap
        if (g.playerX < -20) g.playerX = width + 20;
        if (g.playerX > width + 20) g.playerX = -20;

        // Vertical Gravity
        g.playerY += g.vy;
        g.vy += 0.65; // gravity

        // Smooth Camera follow ascending upward
        const targetCamY = g.playerY - 320;
        if (targetCamY < g.cameraY) {
          g.cameraY += (targetCamY - g.cameraY) * 0.12;
        }

        const currentAltitude = Math.max(0, Math.floor(-g.cameraY * 0.2));
        if (currentAltitude > g.maxAltitude) {
          g.maxAltitude = currentAltitude;
          g.scoreVal = g.maxAltitude * 2 + g.gems * 30;
        }

        // Refill Jet Fuel slowly
        if (g.fuel < g.maxFuel) {
          g.fuel = Math.min(g.maxFuel, g.fuel + 0.2);
        }

        // Platform Collisions (only when falling downwards)
        let groundedThisFrame = false;
        for (let i = g.platforms.length - 1; i >= 0; i--) {
          const plat = g.platforms[i];

          // Move moving platforms
          if (plat.type === 'moving' && plat.minX && plat.maxX && plat.moveSpeed && plat.moveDir) {
            plat.x += plat.moveSpeed * plat.moveDir;
            if (plat.x <= plat.minX) plat.moveDir = 1;
            if (plat.x >= plat.maxX) plat.moveDir = -1;
          }

          // Collision Check
          if (
            g.vy > 0 &&
            g.playerX + 16 > plat.x &&
            g.playerX - 16 < plat.x + plat.width &&
            g.playerY + 22 >= plat.y &&
            g.playerY + 22 <= plat.y + 18
          ) {
            if (plat.type === 'booster') {
              // Super Jet Spring
              g.vy = -24;
              g.fuel = g.maxFuel;
              sounds.playJump();

              // Booster explosion particles
              for (let p = 0; p < 12; p++) {
                g.particles.push({
                  x: g.playerX,
                  y: plat.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 6 - 2,
                  color: '#38bdf8',
                  size: 3,
                  life: 0,
                  maxLife: 20
                });
              }
            } else {
              g.playerY = plat.y - 22;
              g.vy = -13; // auto bounce
              g.isGrounded = true;
              groundedThisFrame = true;
              g.fuel = Math.min(g.maxFuel, g.fuel + 35);
              sounds.playJump();

              if (plat.type === 'crumbly') {
                plat.stepped = true;
              }
            }
          }

          // Handle Crumbly Platforms
          if (plat.type === 'crumbly' && plat.stepped && plat.crumblesLeft !== undefined) {
            plat.crumblesLeft--;
            if (plat.crumblesLeft <= 0) {
              g.platforms.splice(i, 1);
            }
          }
        }

        if (!groundedThisFrame && g.vy > 0) {
          g.isGrounded = false;
        }

        // Collect Floating Gems
        for (let i = g.gemsList.length - 1; i >= 0; i--) {
          const gem = g.gemsList[i];
          const dist = Math.hypot(g.playerX - gem.x, g.playerY - gem.y);
          if (dist < 30 && !gem.collected) {
            gem.collected = true;
            g.gems += 1;
            g.scoreVal += 40;
            sounds.playCoin();

            for (let p = 0; p < 8; p++) {
              g.particles.push({
                x: gem.x,
                y: gem.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#ec4899',
                size: 3,
                life: 0,
                maxLife: 20
              });
            }
          }

          if (gem.collected || gem.y - g.cameraY > height + 100) {
            g.gemsList.splice(i, 1);
          }
        }

        // Spawn higher platforms as player climbs
        const highestPlatY = Math.min(...g.platforms.map(p => p.y));
        if (highestPlatY > g.cameraY - 200) {
          const newY = highestPlatY - (100 + Math.random() * 40);
          const newX = 80 + Math.random() * (width - 240);
          const types: ('standard' | 'moving' | 'crumbly' | 'booster')[] = [
            'standard',
            'moving',
            'crumbly',
            'booster'
          ];
          const chosenType = types[Math.floor(Math.random() * types.length)];

          g.platforms.push({
            x: newX,
            y: newY,
            width: 100 + Math.random() * 40,
            height: 16,
            type: chosenType,
            moveDir: Math.random() < 0.5 ? 1 : -1,
            moveSpeed: 2,
            minX: 60,
            maxX: width - 180,
            crumblesLeft: 30
          });

          // 50% chance to spawn floating gem above it
          if (Math.random() < 0.5) {
            g.gemsList.push({
              x: newX + 50,
              y: newY - 45
            });
          }
        }

        // Clean up platforms far below screen
        for (let i = g.platforms.length - 1; i >= 0; i--) {
          if (g.platforms[i].y - g.cameraY > height + 200) {
            g.platforms.splice(i, 1);
          }
        }

        // Abyss Fall Death Check
        if (g.playerY - g.cameraY > height + 60) {
          endGame();
        }

        setScore(g.scoreVal);
        setAltitude(g.maxAltitude);
        setGemsCollected(g.gems);
        setJetFuel(Math.round(g.fuel));
      }

      // Render Camera Transform
      ctx.save();
      ctx.translate(0, -g.cameraY);

      // Draw Platforms
      g.platforms.forEach(plat => {
        ctx.save();
        if (plat.type === 'standard') {
          // Antigravity Ion Platform
          ctx.fillStyle = '#6b21a8';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          ctx.fillStyle = '#a855f7';
          ctx.fillRect(plat.x, plat.y, plat.width, 4);

          // Glowing energy line
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(plat.x + 10, plat.y + 8);
          ctx.lineTo(plat.x + plat.width - 10, plat.y + 8);
          ctx.stroke();
        } else if (plat.type === 'moving') {
          // Moving Cyan Platform
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x, plat.y, plat.width, 4);

          // Direction arrow glow
          ctx.fillStyle = '#e0f2fe';
          ctx.font = 'bold 9px Rajdhani';
          ctx.fillText('◄► MOVING', plat.x + 12, plat.y + 12);
        } else if (plat.type === 'crumbly') {
          // Dissolving Cloud Island
          ctx.fillStyle = plat.stepped ? '#f43f5e' : '#e2e8f0';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 9px Rajdhani';
          ctx.fillText('CRUMBLE', plat.x + 12, plat.y + 12);
        } else if (plat.type === 'booster') {
          // Super Booster Spring Pad
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Rajdhani';
          ctx.fillText('▲▲ SUPER JUMP ▲▲', plat.x + 10, plat.y + 12);
        }
        ctx.restore();
      });

      // Draw Sky Gems
      g.gemsList.forEach(gem => {
        ctx.save();
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(gem.x, gem.y - 12);
        ctx.lineTo(gem.x + 10, gem.y);
        ctx.lineTo(gem.x, gem.y + 12);
        ctx.lineTo(gem.x - 10, gem.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gem.x, gem.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Zephyr (Aero Scout)
      if (!g.gameOver) {
        ctx.save();

        // Ion Jet Boots Thrust
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;

        if (g.vy < 0) {
          // Firing thrusters
          ctx.fillRect(g.playerX - 10, g.playerY + 18, 5, 14);
          ctx.fillRect(g.playerX + 5, g.playerY + 18, 5, 14);
        }

        // Aero Scout Body
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(g.playerX - 10, g.playerY - 20, 20, 36);

        // Neon Visor
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(g.playerX - 6, g.playerY - 24, 12, 6);

        // Antigravity Glider Wings
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.playerX - 22, g.playerY - 6);
        ctx.lineTo(g.playerX, g.playerY - 14);
        ctx.lineTo(g.playerX + 22, g.playerY - 6);
        ctx.stroke();

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

      ctx.restore(); // restore camera transform

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Return to Hub"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-purple-400 tracking-wider flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-purple-400" />
              SKY DASH
            </h2>
            <p className="text-xs text-slate-400">Hero: Zephyr (Aero Scout)</p>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{gemsCollected}</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 text-sm font-semibold">
            <span className="text-xs text-purple-500">ALT</span>
            <span>{altitude}m</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{jetFuel}%</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-purple-400" />}
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
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/20">
              <CloudLightning className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2 tracking-wide">
              SKY DASH
            </h3>
            <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
              Leap across floating platforms in the stratosphere! Collect prismatic sky gems, hit yellow bounce pads, and fire midair ion-jets to stay aloft!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-400 max-w-sm w-full">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">A / D or ← / →</span>
                Steer Left & Right
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">Space / W / ↑</span>
                Jump & Midair Jet Boost
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-display font-bold text-lg tracking-wider shadow-lg shadow-purple-500/30 active:scale-95 transition"
            >
              LAUNCH SKYWARD (SPACE)
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">Lost to the Clouds</span>
            <h3 className="text-4xl font-display font-black text-white mb-4">ALTITUDE LOST</h3>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md w-full">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Max Altitude</div>
                <div className="text-2xl font-display font-bold text-purple-400">{altitude}m</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Score</div>
                <div className="text-2xl font-display font-bold text-white">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Gems</div>
                <div className="text-2xl font-display font-bold text-pink-400">+{gemsCollected}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-purple-500/30 transition active:scale-95"
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
      </div>

      {/* Responsive Touch Controls */}
      <div className="w-full bg-slate-900/90 px-4 py-3 border-t border-purple-500/20 flex items-center justify-between select-none">
        <div className="flex gap-2">
          <button
            onPointerDown={() => { gameRef.current.keys.left = true; }}
            onPointerUp={() => { gameRef.current.keys.left = false; }}
            onPointerLeave={() => { gameRef.current.keys.left = false; }}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-purple-500 active:text-slate-950 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => { gameRef.current.keys.right = true; }}
            onPointerUp={() => { gameRef.current.keys.right = false; }}
            onPointerLeave={() => { gameRef.current.keys.right = false; }}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-purple-500 active:text-slate-950 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400 text-center">
          <span className="text-purple-400 font-semibold">A / D</span> (Steer) |{' '}
          <span className="text-purple-400 font-semibold">Space / W</span> (Jump & Jet Boost)
        </div>

        <button
          onPointerDown={jumpOrBoost}
          className="w-32 h-12 rounded-xl bg-purple-500 active:bg-purple-400 text-slate-950 font-display font-extrabold flex items-center justify-center text-sm shadow-lg shadow-purple-500/30 transition active:scale-95"
          aria-label="Jet Boost"
        >
          <ArrowUp className="w-5 h-5 mr-1" />
          JET BOOST
        </button>
      </div>
    </div>
  );
};
