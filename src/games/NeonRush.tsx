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
  Zap,
  Shield,
  Coins
} from 'lucide-react';

interface Obstacle {
  lane: number; // 0, 1, 2
  z: number; // distance away (e.g. 1000 down to 0)
  type: 'hurdle' | 'laser' | 'vehicle';
  passed?: boolean;
}

interface CoinItem {
  lane: number;
  z: number;
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

export const NeonRush: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordGameCompletion, setActiveGame, soundMuted, toggleSound } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [combo, setCombo] = useState(1);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);

  // Game internal mutable state ref to avoid React re-renders in 60fps loop
  const gameRef = useRef({
    lane: 1, // 0: left, 1: center, 2: right
    targetLane: 1,
    laneX: 0, // current smoothed X coordinate
    playerY: 0, // vertical offset for jumping
    isJumping: false,
    jumpVelocity: 0,
    isSliding: false,
    slideTimer: 0,
    speed: 12,
    distanceTravelled: 0,
    coins: 0,
    scoreVal: 0,
    comboMultiplier: 1,
    shield: false,
    magnetTimer: 0,
    obstacles: [] as Obstacle[],
    coinItems: [] as CoinItem[],
    particles: [] as Particle[],
    lastSpawnZ: 1000,
    startTime: 0,
    gameOver: false,
    screenShake: 0
  });

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver || g.isJumping) return;
    g.isJumping = true;
    g.jumpVelocity = 17;
    g.isSliding = false;
    g.slideTimer = 0;
    sounds.playJump();
  }, []);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver || g.isJumping) return;
    g.isSliding = true;
    g.slideTimer = 35; // frames
    sounds.playSlide();
  }, []);

  const moveLeft = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) return;
    if (g.targetLane > 0) {
      g.targetLane -= 1;
      sounds.playClick();
    }
  }, []);

  const moveRight = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) return;
    if (g.targetLane < 2) {
      g.targetLane += 1;
      sounds.playClick();
    }
  }, []);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.code === 'Space' || e.key === 'Enter') {
          startGame();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        e.preventDefault();
        jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump, slide, moveLeft, moveRight]);

  const startGame = () => {
    gameRef.current = {
      lane: 1,
      targetLane: 1,
      laneX: 0,
      playerY: 0,
      isJumping: false,
      jumpVelocity: 0,
      isSliding: false,
      slideTimer: 0,
      speed: 13,
      distanceTravelled: 0,
      coins: 0,
      scoreVal: 0,
      comboMultiplier: 1,
      shield: true, // Give player 1 courtesy starter shield
      magnetTimer: 0,
      obstacles: [
        { lane: 0, z: 700, type: 'hurdle' },
        { lane: 2, z: 1000, type: 'laser' },
        { lane: 1, z: 1300, type: 'vehicle' }
      ],
      coinItems: [
        { lane: 1, z: 400 },
        { lane: 1, z: 460 },
        { lane: 1, z: 520 },
        { lane: 0, z: 850 },
        { lane: 2, z: 1150 }
      ],
      particles: [],
      lastSpawnZ: 1400,
      startTime: Date.now(),
      gameOver: false,
      screenShake: 0
    };

    setHasShield(true);
    setHasMagnet(false);
    setScore(0);
    setDistance(0);
    setCoinsCollected(0);
    setCombo(1);
    setGameState('playing');
    sounds.playClick();
  };

  const endGame = () => {
    const g = gameRef.current;
    g.gameOver = true;
    sounds.playCrash();

    // Create crash explosion particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      g.particles.push({
        x: g.laneX,
        y: 400 - g.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#38bdf8', '#ec4899', '#f59e0b', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 5 + 3,
        life: 0,
        maxLife: 45
      });
    }

    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    recordGameCompletion('neon-rush', g.scoreVal, g.coins, duration);
    setGameState('gameover');
  };

  // Main Canvas Render Loop
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

      // Camera / Horizon parameters
      const horizonY = height * 0.32;
      const horizonWidth = width * 0.22;
      const baseWidth = width * 0.88;
      const centerX = width * 0.5;

      // Handle Screen Shake
      ctx.save();
      if (g.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * g.screenShake;
        const shakeY = (Math.random() - 0.5) * g.screenShake;
        ctx.translate(shakeX, shakeY);
        g.screenShake *= 0.88;
        if (g.screenShake < 0.5) g.screenShake = 0;
      }

      // Background Sky & Cyber Grid
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.6, '#0f172a');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant Cyber Cityscape Skyline
      ctx.fillStyle = '#090d16';
      const buildingWidths = [45, 60, 35, 75, 50, 40, 80, 55, 30, 65, 90, 40];
      let bX = 0;
      for (let i = 0; i < buildingWidths.length; i++) {
        const bw = buildingWidths[i];
        const bh = 50 + ((i * 37) % 65);
        ctx.fillRect(bX, horizonY - bh, bw, bh);

        // Cyber window dots
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(236, 72, 153, 0.3)';
        for (let row = horizonY - bh + 10; row < horizonY - 10; row += 12) {
          ctx.fillRect(bX + 8, row, 3, 3);
          ctx.fillRect(bX + bw - 12, row, 3, 3);
        }
        ctx.fillStyle = '#090d16';
        bX += bw + 8;
      }

      // Distant Neon Sun / Grid Flare
      const sunGrad = ctx.createRadialGradient(centerX, horizonY - 10, 5, centerX, horizonY - 10, 90);
      sunGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      sunGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, horizonY - 10, 90, 0, Math.PI * 2);
      ctx.fill();

      // Road Surface (Trapezoid from horizon to bottom)
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, '#090d1f');
      roadGrad.addColorStop(0.5, '#0c1228');
      roadGrad.addColorStop(1, '#111836');

      ctx.fillStyle = roadGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - horizonWidth / 2, horizonY);
      ctx.lineTo(centerX + horizonWidth / 2, horizonY);
      ctx.lineTo(centerX + baseWidth / 2, height);
      ctx.lineTo(centerX - baseWidth / 2, height);
      ctx.closePath();
      ctx.fill();

      // Outer Neon Road Barriers
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(centerX - horizonWidth / 2, horizonY);
      ctx.lineTo(centerX - baseWidth / 2, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + horizonWidth / 2, horizonY);
      ctx.lineTo(centerX + baseWidth / 2, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3 Lanes Division Lines
      const laneDividers = [-0.333, 0.333];
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 25]);
      ctx.lineDashOffset = -(g.distanceTravelled * 1.5) % 40;

      laneDividers.forEach(factor => {
        const topX = centerX + (horizonWidth / 2) * factor;
        const botX = centerX + (baseWidth / 2) * factor;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, height);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Horizon line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Perspective Projection Helper
      // z ranges from 1200 (far) to 0 (close)
      const project = (laneIndex: number, z: number) => {
        const t = Math.max(0, Math.min(1, 1 - z / 1200)); // 0 at far, 1 at near
        // Perspective curve
        const scale = 0.15 + 0.85 * (t * t);
        const y = horizonY + (height - horizonY) * t;
        const currentRoadWidth = horizonWidth + (baseWidth - horizonWidth) * t;
        const laneOffsets = [-0.333, 0, 0.333];
        const x = centerX + (currentRoadWidth / 2) * laneOffsets[laneIndex];
        return { x, y, scale };
      };

      // If Playing, Update Game State
      if (gameState === 'playing' && !g.gameOver) {
        // Increment speed gradually
        g.speed = Math.min(26, 13 + g.distanceTravelled * 0.003);
        g.distanceTravelled += g.speed * 0.1;
        g.scoreVal += Math.floor(g.speed * 0.05 * g.comboMultiplier);

        // Handle Jump Physics
        if (g.isJumping) {
          g.playerY += g.jumpVelocity;
          g.jumpVelocity -= 1.1; // gravity
          if (g.playerY <= 0) {
            g.playerY = 0;
            g.isJumping = false;
          }
        }

        // Handle Slide Timer
        if (g.isSliding) {
          g.slideTimer--;
          if (g.slideTimer <= 0) {
            g.isSliding = false;
          }
        }

        // Magnet timer
        if (g.magnetTimer > 0) {
          g.magnetTimer--;
          if (g.magnetTimer <= 0) setHasMagnet(false);
        }

        // Smooth Lane Transition
        const targetXPos = [-1, 0, 1][g.targetLane];
        g.laneX += (targetXPos - g.laneX) * 0.25;

        // Move Obstacles
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.z -= g.speed;

          // Collision Check
          if (obs.z <= 60 && obs.z >= -40 && !obs.passed) {
            // Check lane match
            const currentLane = Math.round(g.laneX + 1);
            if (currentLane === obs.lane) {
              let hit = false;
              if (obs.type === 'hurdle') {
                // Must jump over hurdle
                if (g.playerY < 32) hit = true;
              } else if (obs.type === 'laser') {
                // Must slide under laser
                if (!g.isSliding) hit = true;
              } else if (obs.type === 'vehicle') {
                // Cannot jump over vehicle
                hit = true;
              }

              if (hit) {
                if (g.shield) {
                  // Absorb hit
                  g.shield = false;
                  setHasShield(false);
                  g.screenShake = 15;
                  obs.passed = true;
                  sounds.playCrash();
                } else {
                  endGame();
                  break;
                }
              }
            }

            if (obs.z < -40) {
              obs.passed = true;
              g.comboMultiplier = Math.min(5, g.comboMultiplier + 0.2);
            }
          }

          if (obs.z < -100) {
            g.obstacles.splice(i, 1);
          }
        }

        // Move Coins & Magnet Pull
        for (let i = g.coinItems.length - 1; i >= 0; i--) {
          const coin = g.coinItems[i];
          coin.z -= g.speed;

          if (g.magnetTimer > 0 && coin.z < 400 && coin.z > 0) {
            coin.lane = g.targetLane;
          }

          // Collection Check
          if (coin.z <= 50 && coin.z >= -30 && !coin.collected) {
            const currentLane = Math.round(g.laneX + 1);
            if (currentLane === coin.lane) {
              coin.collected = true;
              g.coins += 1;
              g.scoreVal += 25 * Math.round(g.comboMultiplier);
              sounds.playCoin();

              // Spawn sparkle particles
              const pPos = project(coin.lane, coin.z);
              for (let p = 0; p < 8; p++) {
                g.particles.push({
                  x: pPos.x,
                  y: pPos.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#fbbf24',
                  size: Math.random() * 3 + 2,
                  life: 0,
                  maxLife: 25
                });
              }
            }
          }

          if (coin.z < -100) {
            g.coinItems.splice(i, 1);
          }
        }

        // Spawn new obstacles and coins
        const maxZ = Math.max(
          ...g.obstacles.map(o => o.z),
          ...g.coinItems.map(c => c.z),
          600
        );

        if (maxZ < 1200) {
          const spawnZ = maxZ + 240 + Math.random() * 180;
          const randomLane = Math.floor(Math.random() * 3);
          const types: ('hurdle' | 'laser' | 'vehicle')[] = ['hurdle', 'laser', 'vehicle'];
          const chosenType = types[Math.floor(Math.random() * types.length)];

          g.obstacles.push({
            lane: randomLane,
            z: spawnZ,
            type: chosenType
          });

          // Spawn coins in other lane
          const otherLane = (randomLane + 1 + Math.floor(Math.random() * 2)) % 3;
          for (let c = 0; c < 3; c++) {
            g.coinItems.push({
              lane: otherLane,
              z: spawnZ + c * 50
            });
          }
        }

        // React State Sync for HUD (throttled)
        setScore(g.scoreVal);
        setDistance(Math.floor(g.distanceTravelled));
        setCoinsCollected(g.coins);
        setCombo(Number(g.comboMultiplier.toFixed(1)));
      }

      // Draw Coins (sorted back to front)
      const sortedCoins = [...g.coinItems].sort((a, b) => b.z - a.z);
      sortedCoins.forEach(coin => {
        if (coin.z < 0 || coin.z > 1200 || coin.collected) return;
        const pt = project(coin.lane, coin.z);
        const radius = Math.max(3, 14 * pt.scale);

        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10 * pt.scale;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y - 15 * pt.scale, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(8, Math.floor(12 * pt.scale))}px Rajdhani`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('XP', pt.x, pt.y - 15 * pt.scale);
        ctx.restore();
      });

      // Draw Obstacles (sorted back to front)
      const sortedObs = [...g.obstacles].sort((a, b) => b.z - a.z);
      sortedObs.forEach(obs => {
        if (obs.z < -40 || obs.z > 1200) return;
        const pt = project(obs.lane, obs.z);
        const obsWidth = 70 * pt.scale;

        ctx.save();
        if (obs.type === 'hurdle') {
          // Low Neon Hurdle
          const obsHeight = 28 * pt.scale;
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8 * pt.scale;

          ctx.fillRect(pt.x - obsWidth / 2, pt.y - obsHeight, obsWidth, obsHeight);

          // Diagonal caution stripes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pt.x - obsWidth * 0.3, pt.y - obsHeight * 0.8, obsWidth * 0.2, obsHeight * 0.6);
          ctx.fillRect(pt.x + obsWidth * 0.1, pt.y - obsHeight * 0.8, obsWidth * 0.2, obsHeight * 0.6);
        } else if (obs.type === 'laser') {
          // High Laser Beam (must slide under)
          const beamY = pt.y - 65 * pt.scale;
          const beamHeight = 22 * pt.scale;

          // Side support pylons
          ctx.fillStyle = '#64748b';
          ctx.fillRect(pt.x - obsWidth / 2 - 4 * pt.scale, pt.y - 80 * pt.scale, 6 * pt.scale, 80 * pt.scale);
          ctx.fillRect(pt.x + obsWidth / 2 - 2 * pt.scale, pt.y - 80 * pt.scale, 6 * pt.scale, 80 * pt.scale);

          // Glowing laser beam
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15 * pt.scale;
          ctx.fillRect(pt.x - obsWidth / 2, beamY, obsWidth, beamHeight);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(7, Math.floor(10 * pt.scale))}px Rajdhani`;
          ctx.textAlign = 'center';
          ctx.fillText('SLIDE', pt.x, beamY + beamHeight * 0.7);
        } else if (obs.type === 'vehicle') {
          // Futuristic Hover Truck
          const vWidth = 80 * pt.scale;
          const vHeight = 55 * pt.scale;

          ctx.fillStyle = '#ec4899';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 12 * pt.scale;

          // Main chassis
          ctx.fillRect(pt.x - vWidth / 2, pt.y - vHeight, vWidth, vHeight);

          // Twin front headlights
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pt.x - vWidth * 0.3, pt.y - vHeight * 0.3, 4 * pt.scale, 0, Math.PI * 2);
          ctx.arc(pt.x + vWidth * 0.3, pt.y - vHeight * 0.3, 4 * pt.scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Player Character: Volt (Cyber Nomad)
      if (!g.gameOver) {
        // Interpolate player position in near screen coordinates
        const playerNearY = height * 0.88;
        const currentRoadWidth = baseWidth;
        const laneSpan = (currentRoadWidth / 2) * 0.333;
        const playerScreenX = centerX + g.laneX * laneSpan;
        const playerScreenY = playerNearY - g.playerY;

        ctx.save();

        // Player Ground Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        const shadowRadius = Math.max(10, 24 - g.playerY * 0.2);
        ctx.ellipse(playerScreenX, playerNearY + 4, shadowRadius, shadowRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield Bubble Effect
        if (g.shield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(playerScreenX, playerScreenY - 32, 42, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Runner Character Body
        if (g.isSliding) {
          // Sliding Pose: Sleek low horizontal profile
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          // Torso & legs flat
          ctx.fillRect(playerScreenX - 25, playerScreenY - 14, 50, 14);
          // Cyber Visor
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(playerScreenX + 15, playerScreenY - 12, 10, 6);

          // Spark particles under slide
          if (Math.random() < 0.6) {
            g.particles.push({
              x: playerScreenX - 20,
              y: playerScreenY,
              vx: -Math.random() * 4 - 2,
              vy: -Math.random() * 2,
              color: '#38bdf8',
              size: 2,
              life: 0,
              maxLife: 15
            });
          }
        } else {
          // Standing / Jumping Running Pose
          const legPhase = (g.distanceTravelled * 0.4) % (Math.PI * 2);
          const legBob = Math.sin(legPhase) * 4;

          // Kinetic Hover Jet-Boots
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;

          // Legs
          ctx.fillRect(playerScreenX - 12, playerScreenY - 20 + legBob, 8, 20);
          ctx.fillRect(playerScreenX + 4, playerScreenY - 20 - legBob, 8, 20);

          // Torso (Cyber Suit)
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(playerScreenX - 14, playerScreenY - 48, 28, 30);

          // Neon chest core
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(playerScreenX, playerScreenY - 35, 5, 0, Math.PI * 2);
          ctx.fill();

          // Cyber Helm / Visor
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(playerScreenX, playerScreenY - 56, 12, 0, Math.PI * 2);
          ctx.fill();

          // Visor Glow
          ctx.fillStyle = '#ec4899';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 10;
          ctx.fillRect(playerScreenX - 8, playerScreenY - 58, 16, 5);

          // Cape / Neon Trail
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(playerScreenX - 6, playerScreenY - 45);
          ctx.lineTo(playerScreenX - 16, playerScreenY - 25);
          ctx.stroke();

          // Jump jet thrust
          if (g.isJumping) {
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;
            ctx.fillRect(playerScreenX - 12, playerScreenY, 6, 12);
            ctx.fillRect(playerScreenX + 6, playerScreenY, 6, 12);
          }
        }

        ctx.restore();
      }

      // Render Active Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
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
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-cyan-500/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGame(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Return to Hub"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-cyan-400 tracking-wider flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              NEON RUSH
            </h2>
            <p className="text-xs text-slate-400">Hero: Volt (Cyber Nomad)</p>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 text-sm font-semibold">
            <Coins className="w-4 h-4" />
            <span>{coinsCollected}</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 text-sm font-semibold">
            <span className="text-xs text-cyan-500">DIST</span>
            <span>{distance}m</span>
          </div>

          {hasShield && (
            <div className="flex items-center gap-1 text-sky-400 bg-sky-500/20 px-2.5 py-1 rounded-full border border-sky-400/40 text-xs font-bold animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>SHIELD</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
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

        {/* Combo Multiplier Banner Overlay */}
        {gameState === 'playing' && combo > 1 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-display font-extrabold px-3 py-1 rounded-md text-sm shadow-lg shadow-pink-500/30 animate-bounce">
            COMBO x{combo}
          </div>
        )}

        {/* Start Game Ready Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/20">
              <Zap className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2 tracking-wide">
              NEON RUSH
            </h3>
            <p className="text-slate-300 max-w-md text-sm mb-6 leading-relaxed">
              Sprint along 3 magnetic cyber lanes. Jump over red barriers, slide beneath blue laser beams, and collect gold XP power cells!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-400 max-w-sm w-full">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">A / D or ← / →</span>
                Switch 3 Lanes
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">W / ↑ or Space</span>
                Jump Over Obstacles
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <span className="text-pink-400 font-bold block mb-1">S / ↓</span>
                Slide Beneath Laser Beams
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-lg tracking-wider shadow-lg shadow-cyan-500/30 active:scale-95 transition"
            >
              RUN NOW (SPACE)
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">Signal Terminated</span>
            <h3 className="text-4xl font-display font-black text-white mb-4">CRASH OVER</h3>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md w-full">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Distance</div>
                <div className="text-2xl font-display font-bold text-cyan-400">{distance}m</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Score</div>
                <div className="text-2xl font-display font-bold text-white">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Coins</div>
                <div className="text-2xl font-display font-bold text-amber-400">+{coinsCollected}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-base shadow-lg shadow-cyan-500/30 transition active:scale-95"
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

      {/* Responsive Touch / Mobile Arcade Controls Bar */}
      <div className="w-full bg-slate-900/90 px-4 py-3 border-t border-cyan-500/20 flex items-center justify-between select-none">
        <div className="flex gap-2">
          <button
            onPointerDown={moveLeft}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 active:text-slate-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={moveRight}
            className="w-14 h-12 rounded-xl bg-slate-800 active:bg-cyan-500 active:text-slate-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-md transition active:scale-95"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400 text-center">
          Keyboard: <span className="text-cyan-400 font-semibold">A / D</span> (Lanes) |{' '}
          <span className="text-cyan-400 font-semibold">W</span> (Jump) |{' '}
          <span className="text-pink-400 font-semibold">S</span> (Slide)
        </div>

        <div className="flex gap-2">
          <button
            onPointerDown={slide}
            className="w-16 h-12 rounded-xl bg-slate-800 active:bg-pink-500 active:text-slate-950 text-pink-400 border border-pink-500/30 flex flex-col items-center justify-center text-xs font-bold shadow-md transition active:scale-95"
            aria-label="Slide"
          >
            <ArrowDown className="w-5 h-5 mb-0.5" />
            SLIDE
          </button>
          <button
            onPointerDown={jump}
            className="w-16 h-12 rounded-xl bg-cyan-600 active:bg-cyan-400 text-slate-950 font-display font-extrabold flex flex-col items-center justify-center text-xs shadow-lg shadow-cyan-600/30 transition active:scale-95"
            aria-label="Jump"
          >
            <ArrowUp className="w-5 h-5 mb-0.5" />
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
