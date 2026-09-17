import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../services/sound';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Flame,
  Gauge,
  BatteryCharging,
  Zap
} from 'lucide-react';

interface TrafficVehicle {
  x: number; // 0 to 800
  y: number; // screen Y
  speed: number;
  width: number;
  height: number;
  color: string;
  type: 'sedan' | 'truck' | 'drone';
}

interface EnergyCell {
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

export const CyberRider: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordGameCompletion, setActiveGame, soundMuted, toggleSound } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [energyCollected, setEnergyCollected] = useState(0);
  const [currentKmh, setCurrentKmh] = useState(120);
  const [nitroAvailable, setNitroAvailable] = useState(false);

  const gameRef = useRef({
    playerX: 400,
    playerY: 480,
    targetX: 400,
    vx: 0,
    baseSpeed: 10,
    speed: 10,
    nitroActive: false,
    nitroFuel: 100,
    distanceTravelled: 0,
    scoreVal: 0,
    energy: 0,
    traffic: [] as TrafficVehicle[],
    cells: [] as EnergyCell[],
    particles: [] as Particle[],
    roadOffset: 0,
    keys: { left: false, right: false, up: false, down: false, boost: false },
    startTime: 0,
    gameOver: false,
    shake: 0
  });

  const activateBoost = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver || g.nitroFuel < 20) return;
    g.nitroActive = true;
    sounds.playLevelUp();
  }, []);

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
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameRef.current.keys.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameRef.current.keys.down = true;
      } else if (e.key === 'Shift' || e.code === 'Space') {
        activateBoost();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameRef.current.keys.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameRef.current.keys.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activateBoost]);

  const startGame = () => {
    const initialTraffic: TrafficVehicle[] = [
      { x: 320, y: -100, speed: 4, width: 44, height: 75, color: '#0284c7', type: 'sedan' },
      { x: 480, y: -300, speed: 3, width: 56, height: 110, color: '#f59e0b', type: 'truck' },
      { x: 260, y: -500, speed: 5, width: 44, height: 75, color: '#a855f7', type: 'sedan' }
    ];

    gameRef.current = {
      playerX: 400,
      playerY: 480,
      targetX: 400,
      vx: 0,
      baseSpeed: 10,
      speed: 10,
      nitroActive: false,
      nitroFuel: 100,
      distanceTravelled: 0,
      scoreVal: 0,
      energy: 0,
      traffic: initialTraffic,
      cells: [
        { x: 380, y: -80 },
        { x: 420, y: -180 },
        { x: 320, y: -380 }
      ],
      particles: [],
      roadOffset: 0,
      keys: { left: false, right: false, up: false, down: false, boost: false },
      startTime: Date.now(),
      gameOver: false,
      shake: 0
    };

    setScore(0);
    setDistance(0);
    setEnergyCollected(0);
    setCurrentKmh(120);
    setNitroAvailable(true);
    setGameState('playing');
    sounds.playClick();
  };

  const endGame = () => {
    const g = gameRef.current;
    if (g.gameOver) return;
    g.gameOver = true;
    sounds.playCrash();

    // High velocity crash particles
    for (let i = 0; i < 40; i++) {
      g.particles.push({
        x: g.playerX,
        y: g.playerY,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        color: ['#ec4899', '#f43f5e', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)],
        size: Math.random() * 5 + 3,
        life: 0,
        maxLife: 35
      });
    }

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    recordGameCompletion('cyber-rider', g.scoreVal, g.energy, duration);
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

      // Road bounds: 4-lane highway between 160 and 640
      const roadLeft = 160;
      const roadRight = 640;
      const roadWidth = roadRight - roadLeft;

      ctx.save();
      if (g.shake > 0) {
        ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
        g.shake *= 0.85;
      }

      // Background Cyber Highway Grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Distant neon light horizon
      const glowGrad = ctx.createLinearGradient(0, 0, 0, 160);
      glowGrad.addColorStop(0, '#1e1b4b');
      glowGrad.addColorStop(1, '#020617');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, 160);

      // Road Surface
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(roadLeft, 0, roadWidth, height);

      // Road outer glowing neon barriers
      ctx.strokeStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(roadLeft, 0);
      ctx.lineTo(roadLeft, height);
      ctx.moveTo(roadRight, 0);
      ctx.lineTo(roadRight, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Lane Divider Dashes
      const laneCount = 4;
      const laneWidth = roadWidth / laneCount;

      g.roadOffset = (g.roadOffset + g.speed) % 60;
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 35]);
      ctx.lineDashOffset = -g.roadOffset;

      for (let l = 1; l < laneCount; l++) {
        const lx = roadLeft + l * laneWidth;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Update Game Loop if playing
      if (gameState === 'playing' && !g.gameOver) {
        // Boost handling
        if (g.nitroActive) {
          g.speed = g.baseSpeed * 1.6;
          g.nitroFuel -= 0.6;
          if (g.nitroFuel <= 0) {
            g.nitroActive = false;
          }

          // Boost jet exhaust particles
          g.particles.push({
            x: g.playerX + (Math.random() - 0.5) * 8,
            y: g.playerY + 28,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 8 + 6,
            color: '#ec4899',
            size: Math.random() * 4 + 2,
            life: 0,
            maxLife: 20
          });
        } else {
          // Normal speed adjustments
          if (g.keys.up) {
            g.speed = Math.min(g.baseSpeed * 1.3, g.speed + 0.3);
          } else if (g.keys.down) {
            g.speed = Math.max(g.baseSpeed * 0.6, g.speed - 0.4);
          } else {
            g.speed += (g.baseSpeed - g.speed) * 0.1;
          }

          if (g.nitroFuel < 100) {
            g.nitroFuel = Math.min(100, g.nitroFuel + 0.1);
          }
        }

        // Increase base speed with distance
        g.baseSpeed = Math.min(20, 10 + g.distanceTravelled * 0.002);
        g.distanceTravelled += g.speed * 0.1;
        g.scoreVal += Math.floor(g.speed * 0.15);

        // Lateral steering
        if (g.keys.left) g.vx -= 1.2;
        if (g.keys.right) g.vx += 1.2;
        g.vx *= 0.85; // friction
        g.playerX += g.vx;

        // Keep inside road bounds
        if (g.playerX < roadLeft + 24) {
          g.playerX = roadLeft + 24;
          g.vx = 0;
          g.shake = 4;
        }
        if (g.playerX > roadRight - 24) {
          g.playerX = roadRight - 24;
          g.vx = 0;
          g.shake = 4;
        }

        // Move Traffic (relative speed)
        for (let i = g.traffic.length - 1; i >= 0; i--) {
          const veh = g.traffic[i];
          veh.y += g.speed - veh.speed;

          // Hitbox collision check with player
          const pLeft = g.playerX - 16;
          const pRight = g.playerX + 16;
          const pTop = g.playerY - 25;
          const pBottom = g.playerY + 25;

          const vLeft = veh.x - veh.width / 2;
          const vRight = veh.x + veh.width / 2;
          const vTop = veh.y - veh.height / 2;
          const vBottom = veh.y + veh.height / 2;

          const collides =
            pRight > vLeft &&
            pLeft < vRight &&
            pBottom > vTop &&
            pTop < vBottom;

          if (collides) {
            endGame();
            break;
          }

          if (veh.y > height + 100) {
            g.traffic.splice(i, 1);
          }
        }

        // Move Energy Cells
        for (let i = g.cells.length - 1; i >= 0; i--) {
          const cell = g.cells[i];
          cell.y += g.speed;

          const dist = Math.hypot(g.playerX - cell.x, g.playerY - cell.y);
          if (dist < 32 && !cell.collected) {
            cell.collected = true;
            g.energy += 1;
            g.scoreVal += 35;
            g.nitroFuel = Math.min(100, g.nitroFuel + 20);
            sounds.playCoin();

            for (let p = 0; p < 8; p++) {
              g.particles.push({
                x: cell.x,
                y: cell.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#38bdf8',
                size: 3,
                life: 0,
                maxLife: 20
              });
            }
          }

          if (cell.y > height + 60 || cell.collected) {
            g.cells.splice(i, 1);
          }
        }

        // Spawn Traffic Vehicles
        const minY = Math.min(...g.traffic.map(t => t.y), 0);
        if (minY > -250) {
          const randomLane = Math.floor(Math.random() * laneCount);
          const spawnX = roadLeft + (randomLane + 0.5) * laneWidth;
          const types: ('sedan' | 'truck' | 'drone')[] = ['sedan', 'truck', 'drone'];
          const chosenType = types[Math.floor(Math.random() * types.length)];

          const vehConfig = {
            sedan: { width: 42, height: 72, color: '#0ea5e9', speed: 4 },
            truck: { width: 52, height: 115, color: '#f59e0b', speed: 2.5 },
            drone: { width: 36, height: 50, color: '#a855f7', speed: 5.5 }
          }[chosenType];

          g.traffic.push({
            x: spawnX,
            y: minY - 180 - Math.random() * 100,
            speed: vehConfig.speed,
            width: vehConfig.width,
            height: vehConfig.height,
            color: vehConfig.color,
            type: chosenType
          });

          // Energy cell spawn in neighboring lane
          if (Math.random() < 0.65) {
            const otherLane = (randomLane + 1 + Math.floor(Math.random() * (laneCount - 1))) % laneCount;
            g.cells.push({
              x: roadLeft + (otherLane + 0.5) * laneWidth,
              y: minY - 120
            });
          }
        }

        setScore(g.scoreVal);
        setDistance(Math.floor(g.distanceTravelled));
        setEnergyCollected(g.energy);
        setCurrentKmh(Math.floor(g.speed * 12));
        setNitroAvailable(g.nitroFuel >= 20);
      }

      // Draw Energy Cells
      g.cells.forEach(cell => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(cell.x, cell.y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Rajdhani';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', cell.x, cell.y);
        ctx.restore();
      });

      // Draw Traffic Vehicles
      g.traffic.forEach(veh => {
        ctx.save();
        ctx.fillStyle = veh.color;
        ctx.shadowColor = veh.color;
        ctx.shadowBlur = 8;

        // Vehicle Chassis
        ctx.fillRect(veh.x - veh.width / 2, veh.y - veh.height / 2, veh.width, veh.height);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(
          veh.x - veh.width * 0.35,
          veh.y - veh.height * 0.15,
          veh.width * 0.7,
          veh.height * 0.25
        );

        // Tail Lights (facing player)
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(veh.x - veh.width / 2 + 3, veh.y + veh.height / 2 - 5, 8, 4);
        ctx.fillRect(veh.x + veh.width / 2 - 11, veh.y + veh.height / 2 - 5, 8, 4);
        ctx.restore();
      });

      // Draw Nova's Vortex-9 Hoverbike
      if (!g.gameOver) {
        ctx.save();

        // Bike Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(g.playerX, g.playerY + 8, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hover Thruster Exhaust Flames
        ctx.fillStyle = g.nitroActive ? '#38bdf8' : '#ec4899';
        ctx.shadowColor = g.nitroActive ? '#38bdf8' : '#ec4899';
        ctx.shadowBlur = 14;
        const exhaustLen = g.nitroActive ? 28 : 15;
        ctx.fillRect(g.playerX - 6, g.playerY + 24, 4, exhaustLen);
        ctx.fillRect(g.playerX + 2, g.playerY + 24, 4, exhaustLen);

        // Bike Body / Streamlined Chassis
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(g.playerX, g.playerY - 28); // front nose
        ctx.lineTo(g.playerX + 14, g.playerY + 20);
        ctx.lineTo(g.playerX - 14, g.playerY + 20);
        ctx.closePath();
        ctx.fill();

        // Pilot Nova Helm
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(g.playerX, g.playerY - 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Pilot Neon Visor
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(g.playerX - 6, g.playerY - 6, 12, 4);

        // Handlebars / Wings
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.playerX - 18, g.playerY);
        ctx.lineTo(g.playerX + 18, g.playerY);
        ctx.stroke();

        ctx.restore();
      }

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

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl border border-pink-500/30 shadow-2xl shadow-pink-950/50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-pink-500/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Return to Hub"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-pink-400 tracking-wider flex items-center gap-2">
              <Flame className="w-5 h-5 text-pink-400" />
              CYBER RIDER
            </h2>
            <p className="text-xs text-slate-400">Hero: Nova Lin (Drift Pilot)</p>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 text-sm font-semibold">
            <BatteryCharging className="w-4 h-4" />
            <span>{energyCollected}</span>
          </div>

          <div className="flex items-center gap-1.5 text-pink-300 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30 text-sm font-semibold">
            <Gauge className="w-4 h-4 text-pink-400" />
            <span>{currentKmh} km/h</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-pink-400" />}
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
            <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 mb-4 shadow-lg shadow-pink-500/20">
              <Flame className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2 tracking-wide">
              CYBER RIDER
            </h3>
            <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
              Drift the Vortex-9 Hoverbike along the 4-lane neon expressway! Thread between autonomous hover trucks, collect battery cells, and burn nitrous boost!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-400 max-w-sm w-full">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-pink-400 font-bold block mb-1">A / D or ← / →</span>
                Steer & Drift
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-pink-400 font-bold block mb-1">Shift or Space</span>
                Nitrous Overdrive Boost
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-slate-950 font-display font-bold text-lg tracking-wider shadow-lg shadow-pink-500/30 active:scale-95 transition"
            >
              RACE HIGHWAY (SPACE)
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">High-Speed Collision</span>
            <h3 className="text-4xl font-display font-black text-white mb-4">TOTALLED</h3>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md w-full">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Distance</div>
                <div className="text-2xl font-display font-bold text-pink-400">{distance}m</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Score</div>
                <div className="text-2xl font-display font-bold text-white">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Cells</div>
                <div className="text-2xl font-display font-bold text-cyan-400">+{energyCollected}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-pink-500/30 transition active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                RETRY
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
      <div className="w-full bg-slate-900/90 px-4 py-3 border-t border-pink-500/20 flex items-center justify-between select-none">
        <div className="flex gap-2">
          <button
            onPointerDown={() => { gameRef.current.keys.left = true; }}
            onPointerUp={() => { gameRef.current.keys.left = false; }}
            onPointerLeave={() => { gameRef.current.keys.left = false; }}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-pink-500 active:text-slate-950 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => { gameRef.current.keys.right = true; }}
            onPointerUp={() => { gameRef.current.keys.right = false; }}
            onPointerLeave={() => { gameRef.current.keys.right = false; }}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-pink-500 active:text-slate-950 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Steer Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400 text-center">
          <span className="text-pink-400 font-semibold">A / D</span> (Steer) |{' '}
          <span className="text-pink-400 font-semibold">W / S</span> (Throttle/Brake) |{' '}
          <span className="text-pink-400 font-semibold">Shift</span> (Nitro)
        </div>

        <button
          onPointerDown={activateBoost}
          disabled={!nitroAvailable}
          className={`w-32 h-12 rounded-xl font-display font-extrabold flex items-center justify-center text-sm transition active:scale-95 shadow-lg ${
            nitroAvailable
              ? 'bg-pink-500 active:bg-pink-400 text-slate-950 shadow-pink-500/30'
              : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
          aria-label="Nitrous Boost"
        >
          <Zap className="w-4 h-4 mr-1" />
          NITRO BOOST
        </button>
      </div>
    </div>
  );
};
