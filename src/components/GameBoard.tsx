import React, { useEffect, useRef } from 'react';
import {
  Point,
  Direction,
  FoodItem,
  Obstacle,
  Particle,
  FloatingText,
  WormSkin,
  ActivePowerup,
} from '../types/game';
import { GRID_COLS, GRID_ROWS } from '../utils/constants';

interface GameBoardProps {
  playerSnake: Point[];
  playerDir: Direction;
  aiSnake?: Point[];
  aiDir?: Direction;
  foods: FoodItem[];
  obstacles: Obstacle[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  skin: WormSkin;
  activePowerup: ActivePowerup | null;
  screenShake: number;
  showGridLines: boolean;
  gameStatus: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  onCanvasClick?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  playerSnake,
  playerDir,
  aiSnake,
  aiDir,
  foods,
  obstacles,
  particles,
  floatingTexts,
  skin,
  activePowerup,
  screenShake,
  showGridLines,
  gameStatus,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tongueTimer = 0;

    const render = (time: number) => {
      tongueTimer = (time / 300) % 10; // cycles every ~3s

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Apply screen shake
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake * 5;
        const shakeY = (Math.random() - 0.5) * screenShake * 5;
        ctx.translate(shakeX, shakeY);
      }

      const cellW = width / GRID_COLS;
      const cellH = height / GRID_ROWS;

      // 1. Draw Arena Background
      ctx.fillStyle = '#0F172A'; // deep slate 900
      ctx.fillRect(0, 0, width, height);

      // Soft vignette gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.7
      );
      bgGrad.addColorStop(0, '#1E293B'); // slate-800 center
      bgGrad.addColorStop(1, '#090D16'); // very dark perimeter
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Optional Grid Dots / Lines
      if (showGridLines) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let col = 0; col <= GRID_COLS; col++) {
          ctx.beginPath();
          ctx.moveTo(col * cellW, 0);
          ctx.lineTo(col * cellW, height);
          ctx.stroke();
        }
        for (let row = 0; row <= GRID_ROWS; row++) {
          ctx.beginPath();
          ctx.moveTo(0, row * cellH);
          ctx.lineTo(width, row * cellH);
          ctx.stroke();
        }
      } else {
        // Subtle dot grid
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let col = 1; col < GRID_COLS; col++) {
          for (let row = 1; row < GRID_ROWS; row++) {
            ctx.beginPath();
            ctx.arc(col * cellW, row * cellH, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Arena Outer Border
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // 2. Draw Obstacles (Maze rocks)
      obstacles.forEach((obs) => {
        const ox = obs.x * cellW;
        const oy = obs.y * cellH;
        const pad = 2;

        ctx.fillStyle = '#334155'; // slate-700
        ctx.beginPath();
        ctx.roundRect(ox + pad, oy + pad, cellW - pad * 2, cellH - pad * 2, 6);
        ctx.fill();

        ctx.strokeStyle = '#64748B'; // slate-500
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner rock texture cross
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(ox + cellW * 0.3, oy + cellH * 0.4, cellW * 0.4, 2);
        ctx.fillRect(ox + cellW * 0.45, oy + cellH * 0.25, 2, cellH * 0.5);
      });

      // 3. Draw Foods
      const pulseTime = time / 250;
      foods.forEach((food) => {
        const fx = food.x * cellW + cellW / 2;
        const fy = food.y * cellH + cellH / 2;
        const baseR = Math.min(cellW, cellH) * 0.4;
        const pulse = Math.sin(pulseTime) * 1.5;
        const r = Math.max(3, baseR + pulse);

        if (food.type === 'NORMAL') {
          // Red Apple
          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(fx, fy + r * 0.7, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Apple Body
          const grad = ctx.createRadialGradient(fx - r * 0.3, fy - r * 0.3, 1, fx, fy, r);
          grad.addColorStop(0, '#F87171'); // red-400
          grad.addColorStop(0.7, '#EF4444'); // red-500
          grad.addColorStop(1, '#B91C1C'); // red-700
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, Math.PI * 2);
          ctx.fill();

          // Green leaf & stem
          ctx.fillStyle = '#78350F'; // brown stem
          ctx.fillRect(fx - 1, fy - r - 3, 2, 4);

          ctx.fillStyle = '#10B981'; // green leaf
          ctx.beginPath();
          ctx.ellipse(fx + 3, fy - r - 1, 3, 1.8, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Specular highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(fx - r * 0.35, fy - r * 0.35, r * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (food.type === 'GOLDEN') {
          // Golden Apple with Aura
          const glowR = r + 4 + Math.sin(pulseTime * 2) * 2;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.beginPath();
          ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Body
          const grad = ctx.createRadialGradient(fx - r * 0.3, fy - r * 0.3, 1, fx, fy, r);
          grad.addColorStop(0, '#FEF08A');
          grad.addColorStop(0.6, '#F59E0B');
          grad.addColorStop(1, '#B45309');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, Math.PI * 2);
          ctx.fill();

          // Crown spark / star
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(fx - r * 0.3, fy - r * 0.3, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Golden leaf
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.ellipse(fx + 3, fy - r - 1, 3, 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (food.type === 'MAGNET') {
          // Magnet Powerup (Blue/Cyan Orb with Horseshoe Magnet)
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.beginPath();
          ctx.arc(fx, fy, r + 3, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, r);
          grad.addColorStop(0, '#67E8F9');
          grad.addColorStop(1, '#0891B2');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, Math.PI * 2);
          ctx.fill();

          // Magnet 'U' shape
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(fx, fy, r * 0.5, 0, Math.PI, false);
          ctx.lineTo(fx + r * 0.5, fy - 3);
          ctx.moveTo(fx - r * 0.5, fy);
          ctx.lineTo(fx - r * 0.5, fy - 3);
          ctx.stroke();
        } else if (food.type === 'SLOW') {
          // Ice Snowflake / Slow Mo
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
          ctx.beginPath();
          ctx.arc(fx, fy, r + 3, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, r);
          grad.addColorStop(0, '#93C5FD');
          grad.addColorStop(1, '#2563EB');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, Math.PI * 2);
          ctx.fill();

          // Crystal lines
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(fx - r * 0.6, fy);
          ctx.lineTo(fx + r * 0.6, fy);
          ctx.moveTo(fx, fy - r * 0.6);
          ctx.lineTo(fx, fy + r * 0.6);
          ctx.stroke();
        } else if (food.type === 'GHOST') {
          // Ghost Powerup (Violet / Lavender Phantom)
          ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
          ctx.beginPath();
          ctx.arc(fx, fy, r + 4, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, r);
          grad.addColorStop(0, '#E9D5FF');
          grad.addColorStop(1, '#7E22CE');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy - 2, r * 0.85, Math.PI, 0, false);
          ctx.lineTo(fx + r * 0.85, fy + r * 0.6);
          ctx.lineTo(fx + r * 0.3, fy + r * 0.3);
          ctx.lineTo(fx, fy + r * 0.6);
          ctx.lineTo(fx - r * 0.3, fy + r * 0.3);
          ctx.lineTo(fx - r * 0.85, fy + r * 0.6);
          ctx.closePath();
          ctx.fill();

          // Ghost eyes
          ctx.fillStyle = '#4C1D95';
          ctx.beginPath();
          ctx.arc(fx - 3, fy - 2, 1.5, 0, Math.PI * 2);
          ctx.arc(fx + 3, fy - 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Helper to draw a snake
      const drawSnake = (
        snake: Point[],
        dir: Direction,
        isPlayer: boolean,
        snakeSkin: WormSkin,
        powerup: ActivePowerup | null
      ) => {
        if (snake.length === 0) return;

        const isGhostActive = isPlayer && powerup?.type === 'GHOST';
        ctx.globalAlpha = isGhostActive ? 0.65 : 1.0;

        // Draw body segments from tail to head
        const bodyRadius = Math.min(cellW, cellH) * 0.44;

        // Draw continuous rounded connecting segments
        for (let i = snake.length - 1; i >= 1; i--) {
          const curr = snake[i];
          const next = snake[i - 1];

          const cx = curr.x * cellW + cellW / 2;
          const cy = curr.y * cellH + cellH / 2;
          const nx = next.x * cellW + cellW / 2;
          const ny = next.y * cellH + cellH / 2;

          const progress = i / snake.length; // 1 at tail, 0 at head
          const segRadius = bodyRadius * (0.75 + 0.25 * (1 - progress));

          // Interpolated color between start & end
          ctx.strokeStyle = isPlayer ? snakeSkin.bodyColorStart : '#A855F7';
          ctx.fillStyle = isPlayer ? snakeSkin.bodyColorEnd : '#7E22CE';

          // Segment circle
          ctx.beginPath();
          ctx.arc(cx, cy, segRadius, 0, Math.PI * 2);
          ctx.fill();

          // Connect to next segment seamlessly
          ctx.lineWidth = segRadius * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          // Decorative pattern on body (scales, dots, or stripes)
          if (isPlayer && i % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(cx, cy, segRadius * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw Head
        const head = snake[0];
        const hx = head.x * cellW + cellW / 2;
        const hy = head.y * cellH + cellH / 2;
        const headRadius = bodyRadius * 1.12;

        // Head Glow if powerup or cyber
        if (isPlayer && (powerup || snakeSkin.id === 'cyber')) {
          ctx.shadowColor = powerup ? '#38BDF8' : snakeSkin.glowColor;
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = isPlayer ? snakeSkin.headColor : '#C026D3'; // player skin or rival magenta
        ctx.beginPath();
        ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset shadow

        // Eye offsets depending on direction
        let eye1 = { x: 0, y: 0 };
        let eye2 = { x: 0, y: 0 };
        let pupilOffset = { x: 0, y: 0 };
        let tongueStart = { x: 0, y: 0 };
        let tongueEnd = { x: 0, y: 0 };

        const ed = headRadius * 0.52;
        const pd = 1.8;

        if (dir === 'UP') {
          eye1 = { x: hx - ed * 0.7, y: hy - ed * 0.4 };
          eye2 = { x: hx + ed * 0.7, y: hy - ed * 0.4 };
          pupilOffset = { x: 0, y: -pd };
          tongueStart = { x: hx, y: hy - headRadius };
          tongueEnd = { x: hx, y: hy - headRadius - 6 };
        } else if (dir === 'DOWN') {
          eye1 = { x: hx - ed * 0.7, y: hy + ed * 0.4 };
          eye2 = { x: hx + ed * 0.7, y: hy + ed * 0.4 };
          pupilOffset = { x: 0, y: pd };
          tongueStart = { x: hx, y: hy + headRadius };
          tongueEnd = { x: hx, y: hy + headRadius + 6 };
        } else if (dir === 'LEFT') {
          eye1 = { x: hx - ed * 0.4, y: hy - ed * 0.7 };
          eye2 = { x: hx - ed * 0.4, y: hy + ed * 0.7 };
          pupilOffset = { x: -pd, y: 0 };
          tongueStart = { x: hx - headRadius, y: hy };
          tongueEnd = { x: hx - headRadius - 6, y: hy };
        } else {
          // RIGHT
          eye1 = { x: hx + ed * 0.4, y: hy - ed * 0.7 };
          eye2 = { x: hx + ed * 0.4, y: hy + ed * 0.7 };
          pupilOffset = { x: pd, y: 0 };
          tongueStart = { x: hx + headRadius, y: hy };
          tongueEnd = { x: hx + headRadius + 6, y: hy };
        }

        // Animated Tongue Flick (flicks out when tongueTimer < 1.5)
        if (tongueTimer < 1.2 && gameStatus === 'PLAYING') {
          ctx.strokeStyle = '#F43F5E'; // cute pink-red tongue
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tongueStart.x, tongueStart.y);
          ctx.lineTo(tongueEnd.x, tongueEnd.y);
          ctx.stroke();

          // Forked tongue tip
          const forkSize = 3;
          ctx.beginPath();
          if (dir === 'UP' || dir === 'DOWN') {
            ctx.moveTo(tongueEnd.x - forkSize, tongueEnd.y + (dir === 'UP' ? -forkSize : forkSize));
            ctx.lineTo(tongueEnd.x, tongueEnd.y);
            ctx.lineTo(tongueEnd.x + forkSize, tongueEnd.y + (dir === 'UP' ? -forkSize : forkSize));
          } else {
            ctx.moveTo(tongueEnd.x + (dir === 'LEFT' ? -forkSize : forkSize), tongueEnd.y - forkSize);
            ctx.lineTo(tongueEnd.x, tongueEnd.y);
            ctx.lineTo(tongueEnd.x + (dir === 'LEFT' ? -forkSize : forkSize), tongueEnd.y + forkSize);
          }
          ctx.stroke();
        }

        // Draw Eye Whites
        ctx.fillStyle = isPlayer ? snakeSkin.eyeColor : '#FFF';
        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, headRadius * 0.35, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, headRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Draw Pupils
        ctx.fillStyle = isPlayer ? snakeSkin.pupilColor : '#4A044E';
        ctx.beginPath();
        ctx.arc(
          eye1.x + pupilOffset.x,
          eye1.y + pupilOffset.y,
          headRadius * 0.2,
          0,
          Math.PI * 2
        );
        ctx.arc(
          eye2.x + pupilOffset.x,
          eye2.y + pupilOffset.y,
          headRadius * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Eye glint
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
          eye1.x + pupilOffset.x - 1,
          eye1.y + pupilOffset.y - 1,
          headRadius * 0.08,
          0,
          Math.PI * 2
        );
        ctx.arc(
          eye2.x + pupilOffset.x - 1,
          eye2.y + pupilOffset.y - 1,
          headRadius * 0.08,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Cute blush for Gummy skin
        if (isPlayer && snakeSkin.id === 'gummy') {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y + 5, 2.5, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y + 5, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Active Magnet aura rings around head
        if (isPlayer && powerup?.type === 'MAGNET') {
          const ringPulse = (time / 100) % 15;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hx, hy, headRadius + ringPulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
      };

      // Draw AI Snake if present
      if (aiSnake && aiSnake.length > 0 && aiDir) {
        drawSnake(aiSnake, aiDir, false, skin, null);
      }

      // Draw Player Snake
      drawSnake(playerSnake, playerDir, true, skin, activePowerup);

      // 5. Draw Particles
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. Draw Floating Texts
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 7. Paused Overlay
      if (gameStatus === 'PAUSED') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 24px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('일시 정지', width / 2, height / 2 - 10);
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Space 키 또는 화면을 눌러 계속하기', width / 2, height / 2 + 20);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    playerSnake,
    playerDir,
    aiSnake,
    aiDir,
    foods,
    obstacles,
    particles,
    floatingTexts,
    skin,
    activePowerup,
    screenShake,
    showGridLines,
    gameStatus,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[26/22] max-h-[72vh] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800"
      onClick={onCanvasClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer select-none"
      />
    </div>
  );
};
