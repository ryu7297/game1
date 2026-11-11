import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Point,
  Direction,
  GameMode,
  GameStatus,
  FoodItem,
  Obstacle,
  Particle,
  FloatingText,
  WormSkin,
  ActivePowerup,
  Achievement,
} from './types/game';
import {
  GRID_COLS,
  GRID_ROWS,
  SKINS,
  INITIAL_ACHIEVEMENTS,
  BASE_SPEED_MS,
} from './utils/constants';
import { sound } from './utils/audio';
import { getNextAiMove } from './utils/ai';
import { GameBoard } from './components/GameBoard';
import { HUD } from './components/HUD';
import { Controls } from './components/Controls';
import { GameOverModal } from './components/GameOverModal';
import { SkinsModal } from './components/SkinsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { HelpModal } from './components/HelpModal';

// Helper to create initial snakes
const createInitialPlayerSnake = (): Point[] => [
  { x: 10, y: 11 },
  { x: 9, y: 11 },
  { x: 8, y: 11 },
];

const createInitialAiSnake = (): Point[] => [
  { x: 18, y: 11 },
  { x: 19, y: 11 },
  { x: 20, y: 11 },
];

// Helper to generate symmetric maze obstacles
const generateMazeObstacles = (): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  // Corner blocks
  for (let x = 5; x <= 8; x++) {
    obstacles.push({ x, y: 4 });
    obstacles.push({ x: GRID_COLS - 1 - x, y: 4 });
    obstacles.push({ x, y: GRID_ROWS - 5 });
    obstacles.push({ x: GRID_COLS - 1 - x, y: GRID_ROWS - 5 });
  }
  // Center pillars
  for (let y = 8; y <= 13; y++) {
    obstacles.push({ x: 12, y });
    obstacles.push({ x: 13, y });
  }
  return obstacles;
};

export default function App() {
  // Game Setup States
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [skin, setSkin] = useState<WormSkin>(() => {
    try {
      const saved = localStorage.getItem('worm_skin_id');
      const found = SKINS.find((s) => s.id === saved);
      return found || SKINS[0];
    } catch {
      return SKINS[0];
    }
  });

  // Sound & Visual Options
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [showGridLines, setShowGridLines] = useState<boolean>(false);

  // Board State
  const [playerSnake, setPlayerSnake] = useState<Point[]>(createInitialPlayerSnake);
  const [playerDir, setPlayerDir] = useState<Direction>('RIGHT');
  const [aiSnake, setAiSnake] = useState<Point[]>(createInitialAiSnake);
  const [aiDir, setAiDir] = useState<Direction>('LEFT');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Scores
  const [score, setScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [highScores, setHighScores] = useState<Record<GameMode, number>>(() => {
    try {
      const saved = localStorage.getItem('worm_highscores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { classic: 0, arcade: 0, maze: 0, duel: 0 };
  });
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [duelWinner, setDuelWinner] = useState<'player' | 'ai' | 'draw' | null>(null);

  // Juice & Effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Combos & Powerups
  const [combo, setCombo] = useState<number>(1);
  const [comboTimeLeft, setComboTimeLeft] = useState<number>(0);
  const [activePowerup, setActivePowerup] = useState<ActivePowerup | null>(null);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('worm_achievements');
      if (saved) {
        const parsed: Record<string, boolean> = JSON.parse(saved);
        return INITIAL_ACHIEVEMENTS.map((a) => ({
          ...a,
          unlocked: !!parsed[a.id],
        }));
      }
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  // Modals
  const [showSkinsModal, setShowSkinsModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Metrics
  const [applesEaten, setApplesEaten] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [goldenEatenCount, setGoldenEatenCount] = useState<number>(0);
  const [powerupCount, setPowerupCount] = useState<number>(0);
  const [gameTimeSec, setGameTimeSec] = useState<number>(0);

  // Mutable Game References to avoid stale closures in RAF loop
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  const gameModeRef = useRef<GameMode>(gameMode);
  gameModeRef.current = gameMode;

  const difficultyRef = useRef<'easy' | 'normal' | 'hard'>(difficulty);
  difficultyRef.current = difficulty;

  const isBoostingRef = useRef<boolean>(isBoosting);
  isBoostingRef.current = isBoosting;

  const activePowerupRef = useRef<ActivePowerup | null>(activePowerup);
  activePowerupRef.current = activePowerup;

  const comboRef = useRef<number>(combo);
  comboRef.current = combo;

  const comboExpiresAtRef = useRef<number>(0);
  const scoreRef = useRef<number>(score);
  scoreRef.current = score;

  const playerSnakeRef = useRef<Point[]>(playerSnake);
  playerSnakeRef.current = playerSnake;

  const nextDirRef = useRef<Direction>('RIGHT');
  const lastMovedDirRef = useRef<Direction>('RIGHT');

  const aiSnakeRef = useRef<Point[]>(aiSnake);
  aiSnakeRef.current = aiSnake;
  const aiDirRef = useRef<Direction>('LEFT');

  const foodsRef = useRef<FoodItem[]>(foods);
  foodsRef.current = foods;

  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  obstaclesRef.current = obstacles;

  const lastTickTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Update High Scores in LocalStorage
  const updateHighScore = useCallback((mode: GameMode, finalScore: number) => {
    setHighScores((prev) => {
      const currentBest = prev[mode] || 0;
      if (finalScore > currentBest) {
        const updated = { ...prev, [mode]: finalScore };
        try {
          localStorage.setItem('worm_highscores', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  // Unlock Achievement Helper
  const triggerUnlock = useCallback((id: string) => {
    setAchievements((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && !target.unlocked) {
        sound.playVictory();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
        });
        const updated = prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a));
        try {
          const saveMap: Record<string, boolean> = {};
          updated.forEach((a) => {
            saveMap[a.id] = a.unlocked;
          });
          localStorage.setItem('worm_achievements', JSON.stringify(saveMap));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  // Spawn visual particle burst
  const triggerParticles = useCallback((x: number, y: number, color: string, count = 12) => {
    const px = (x + 0.5) * (700 / GRID_COLS);
    const py = (y + 0.5) * (590 / GRID_ROWS);

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 3 + 1.5;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 2,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 10,
      });
    }
    setParticles((prev) => [...prev.slice(-30), ...newParticles]);
  }, []);

  // Spawn floating text
  const triggerFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const px = (x + 0.5) * (700 / GRID_COLS);
    const py = (y + 0.5) * (590 / GRID_ROWS);
    setFloatingTexts((prev) => [
      ...prev.slice(-8),
      {
        id: `ft-${Date.now()}-${Math.random()}`,
        x: px,
        y: py - 10,
        text,
        color,
        alpha: 1,
        life: 0,
        maxLife: 22,
      },
    ]);
  }, []);

  // Trigger brief screen shake
  const triggerShake = useCallback((strength = 1) => {
    setScreenShake(strength);
    setTimeout(() => setScreenShake(0), 180);
  }, []);

  // Spawn food helper
  const spawnFoodItem = useCallback(
    (
      currentFoods: FoodItem[],
      pSnake: Point[],
      aiSnk: Point[],
      obs: Obstacle[],
      preferredType?: 'NORMAL' | 'GOLDEN' | 'MAGNET' | 'SLOW' | 'GHOST'
    ): FoodItem => {
      let x = 0;
      let y = 0;
      let safe = false;
      let attempts = 0;

      while (!safe && attempts < 200) {
        attempts++;
        x = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
        y = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;

        const onPlayer = pSnake.some((p) => p.x === x && p.y === y);
        const onAi = aiSnk.some((p) => p.x === x && p.y === y);
        const onObs = obs.some((o) => o.x === x && o.y === y);
        const onFood = currentFoods.some((f) => f.x === x && f.y === y);

        if (!onPlayer && !onAi && !onObs && !onFood) {
          safe = true;
        }
      }

      let type: 'NORMAL' | 'GOLDEN' | 'MAGNET' | 'SLOW' | 'GHOST' = preferredType || 'NORMAL';
      if (!preferredType) {
        if (gameModeRef.current === 'arcade') {
          const rand = Math.random();
          if (rand < 0.12) type = 'GOLDEN';
          else if (rand < 0.22) type = 'MAGNET';
          else if (rand < 0.3) type = 'SLOW';
          else if (rand < 0.38) type = 'GHOST';
          else type = 'NORMAL';
        } else {
          type = Math.random() < 0.18 ? 'GOLDEN' : 'NORMAL';
        }
      }

      const points = type === 'GOLDEN' ? 50 : 10;
      const expiresAt = type === 'GOLDEN' ? Date.now() + 10000 : undefined;

      return {
        id: `food-${Date.now()}-${Math.random()}`,
        x,
        y,
        type,
        points,
        expiresAt,
        spawnTime: Date.now(),
      };
    },
    []
  );

  // Handle Game Over
  const handleGameOver = useCallback(
    (winner?: 'player' | 'ai' | 'draw') => {
      setStatus('GAME_OVER');
      statusRef.current = 'GAME_OVER';
      sound.playDie();
      triggerShake(2);

      if (winner) {
        setDuelWinner(winner);
        if (winner === 'player') {
          triggerUnlock('rival_hunter');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }

      const currentScore = scoreRef.current;
      const currentBest = highScores[gameModeRef.current] || 0;
      if (currentScore > currentBest && currentScore > 0) {
        setIsNewHigh(true);
        updateHighScore(gameModeRef.current, currentScore);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }

      if (currentScore >= 1000) triggerUnlock('score_1000');
    },
    [highScores, updateHighScore, triggerShake, triggerUnlock]
  );

  // Change Direction cleanly (checks against lastMovedDirRef to prevent self-collision)
  const handleDirectionChange = useCallback((newDir: Direction) => {
    if (statusRef.current !== 'PLAYING') return;

    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDir] !== lastMovedDirRef.current) {
      nextDirRef.current = newDir;
    }
  }, []);

  // Start / Reset Game
  const startNewGame = useCallback(
    (modeToStart = gameModeRef.current) => {
      const initialPlayer = createInitialPlayerSnake();
      const initialAi = modeToStart === 'duel' ? createInitialAiSnake() : [];
      const obs = modeToStart === 'maze' ? generateMazeObstacles() : [];

      setPlayerSnake(initialPlayer);
      playerSnakeRef.current = initialPlayer;

      setPlayerDir('RIGHT');
      nextDirRef.current = 'RIGHT';
      lastMovedDirRef.current = 'RIGHT';

      setAiSnake(initialAi);
      aiSnakeRef.current = initialAi;
      setAiDir('LEFT');
      aiDirRef.current = 'LEFT';

      setObstacles(obs);
      obstaclesRef.current = obs;

      const foodCount = modeToStart === 'duel' ? 3 : modeToStart === 'arcade' ? 2 : 1;
      const initialFoods: FoodItem[] = [];
      for (let i = 0; i < foodCount; i++) {
        const item = spawnFoodItem(initialFoods, initialPlayer, initialAi, obs, 'NORMAL');
        initialFoods.push(item);
      }
      setFoods(initialFoods);
      foodsRef.current = initialFoods;

      setScore(0);
      scoreRef.current = 0;
      setAiScore(0);
      setIsNewHigh(false);
      setDuelWinner(null);
      setCombo(1);
      comboRef.current = 1;
      setComboTimeLeft(0);
      comboExpiresAtRef.current = 0;

      setActivePowerup(null);
      activePowerupRef.current = null;

      setParticles([]);
      setFloatingTexts([]);

      setApplesEaten(0);
      setMaxCombo(1);
      setGoldenEatenCount(0);
      setPowerupCount(0);
      setGameTimeSec(0);

      lastTickTimeRef.current = performance.now();
      gameStartTimeRef.current = performance.now();
      setStatus('PLAYING');
      statusRef.current = 'PLAYING';
      sound.playClick();
    },
    [spawnFoodItem]
  );

  // Single Core Game Step Function
  const stepGame = useCallback(() => {
    if (statusRef.current !== 'PLAYING') return;

    const currentDir = nextDirRef.current;
    lastMovedDirRef.current = currentDir;
    setPlayerDir(currentDir);

    const prevSnake = playerSnakeRef.current;
    if (prevSnake.length === 0) return;

    const head = prevSnake[0];
    let nextX = head.x;
    let nextY = head.y;

    if (currentDir === 'UP') nextY -= 1;
    else if (currentDir === 'DOWN') nextY += 1;
    else if (currentDir === 'LEFT') nextX -= 1;
    else if (currentDir === 'RIGHT') nextX += 1;

    const isGhost = activePowerupRef.current?.type === 'GHOST';

    // 1. Wall Collision
    if (nextX < 0 || nextX >= GRID_COLS || nextY < 0 || nextY >= GRID_ROWS) {
      if (isGhost) {
        nextX = (nextX + GRID_COLS) % GRID_COLS;
        nextY = (nextY + GRID_ROWS) % GRID_ROWS;
      } else {
        handleGameOver(gameModeRef.current === 'duel' ? 'ai' : undefined);
        return;
      }
    }

    // 2. Obstacle Collision
    const hitObs = obstaclesRef.current.some((o) => o.x === nextX && o.y === nextY);
    if (hitObs && !isGhost) {
      handleGameOver(gameModeRef.current === 'duel' ? 'ai' : undefined);
      return;
    }

    // 3. Self Collision
    const hitSelf = prevSnake.slice(0, -1).some((s) => s.x === nextX && s.y === nextY);
    if (hitSelf && !isGhost) {
      handleGameOver(gameModeRef.current === 'duel' ? 'ai' : undefined);
      return;
    }

    // 4. AI Collision (Duel mode)
    if (gameModeRef.current === 'duel' && aiSnakeRef.current.length > 0) {
      const hitAi = aiSnakeRef.current.some((a) => a.x === nextX && a.y === nextY);
      if (hitAi && !isGhost) {
        handleGameOver('ai');
        return;
      }
    }

    const newHead: Point = { x: nextX, y: nextY };
    const newSnake = [newHead, ...prevSnake];

    // Magnet Attraction (Pulls food within 4 tiles)
    if (activePowerupRef.current?.type === 'MAGNET') {
      const updatedFoods = foodsRef.current.map((f) => {
        const dist = Math.abs(f.x - newHead.x) + Math.abs(f.y - newHead.y);
        if (dist > 0 && dist <= 4) {
          const moveX = f.x < newHead.x ? 1 : f.x > newHead.x ? -1 : 0;
          const moveY = f.y < newHead.y ? 1 : f.y > newHead.y ? -1 : 0;
          return { ...f, x: f.x + moveX, y: f.y + moveY };
        }
        return f;
      });
      foodsRef.current = updatedFoods;
      setFoods(updatedFoods);
    }

    // Check Food Collision
    let eatenFood: FoodItem | null = null;
    const remainingFoods: FoodItem[] = [];

    for (const f of foodsRef.current) {
      if (f.x === newHead.x && f.y === newHead.y) {
        eatenFood = f;
      } else {
        remainingFoods.push(f);
      }
    }

    if (eatenFood) {
      const food = eatenFood as FoodItem;
      const now = Date.now();

      // Combo management
      const currentCombo = comboRef.current;
      const nextCombo = currentCombo + 1;
      setCombo(nextCombo);
      comboRef.current = nextCombo;
      comboExpiresAtRef.current = now + 3500;
      setMaxCombo((m) => Math.max(m, nextCombo));

      // Score Calculation
      const basePts = food.points;
      const comboBonus = Math.round(basePts * Math.min(nextCombo, 5) * 0.5);
      const totalAdded = basePts + comboBonus;
      setScore((s) => {
        const newScore = s + totalAdded;
        scoreRef.current = newScore;
        return newScore;
      });
      setApplesEaten((a) => a + 1);

      // Effects & Powerups
      if (food.type === 'GOLDEN') {
        sound.playGoldenEat();
        triggerParticles(newHead.x, newHead.y, '#F59E0B', 20);
        triggerFloatingText(newHead.x, newHead.y, `+${totalAdded} ⭐`, '#FBBF24');
        setGoldenEatenCount((c) => {
          const updated = c + 1;
          if (updated >= 3) triggerUnlock('golden_feast');
          return updated;
        });
        triggerShake(1.5);
      } else if (food.type === 'MAGNET' || food.type === 'SLOW' || food.type === 'GHOST') {
        sound.playPowerup();
        const pUp: ActivePowerup = {
          type: food.type,
          expiresAt: now + 8000,
          durationMs: 8000,
        };
        setActivePowerup(pUp);
        activePowerupRef.current = pUp;

        setPowerupCount((p) => {
          const updated = p + 1;
          if (updated >= 5) triggerUnlock('arcade_master');
          return updated;
        });
        const labels = {
          MAGNET: '자석 발동! 🧲',
          SLOW: '슬로우 모션! ❄️',
          GHOST: '유령 통과! 👻',
        };
        triggerParticles(newHead.x, newHead.y, '#38BDF8', 18);
        triggerFloatingText(newHead.x, newHead.y, labels[food.type], '#38BDF8');
      } else {
        if (nextCombo > 2) {
          sound.playCombo(nextCombo);
          triggerFloatingText(newHead.x, newHead.y, `콤보 x${nextCombo}! +${totalAdded}`, '#FBBF24');
        } else {
          sound.playEat();
          triggerFloatingText(newHead.x, newHead.y, `+${totalAdded}`, '#34D399');
        }
        triggerParticles(newHead.x, newHead.y, '#EF4444', 12);
      }

      // Achievement checks
      triggerUnlock('first_bite');
      if (newSnake.length >= 20) triggerUnlock('growth_spurt');
      if (newSnake.length >= 40) triggerUnlock('giant_worm');
      if (nextCombo >= 5) triggerUnlock('combo_king');

      // Spawn replacement food item
      const newFood = spawnFoodItem(
        remainingFoods,
        newSnake,
        aiSnakeRef.current,
        obstaclesRef.current
      );
      const nextFoodsList = [...remainingFoods, newFood];
      foodsRef.current = nextFoodsList;
      setFoods(nextFoodsList);

      // Snake grows (keep tail)
      playerSnakeRef.current = newSnake;
      setPlayerSnake(newSnake);
    } else {
      // Did not eat: pop tail
      newSnake.pop();
      playerSnakeRef.current = newSnake;
      setPlayerSnake(newSnake);
    }

    // AI Snake Move (Duel mode)
    if (gameModeRef.current === 'duel' && aiSnakeRef.current.length > 0) {
      const prevAi = aiSnakeRef.current;
      const nextAiDir = getNextAiMove(
        prevAi,
        aiDirRef.current,
        foodsRef.current,
        newSnake,
        obstaclesRef.current,
        GRID_COLS,
        GRID_ROWS
      );
      aiDirRef.current = nextAiDir;
      setAiDir(nextAiDir);

      const aiHead = prevAi[0];
      let aiNextX = aiHead.x;
      let aiNextY = aiHead.y;

      if (nextAiDir === 'UP') aiNextY -= 1;
      else if (nextAiDir === 'DOWN') aiNextY += 1;
      else if (nextAiDir === 'LEFT') aiNextX -= 1;
      else if (nextAiDir === 'RIGHT') aiNextX += 1;

      // Check if AI crashed
      if (
        aiNextX < 0 ||
        aiNextX >= GRID_COLS ||
        aiNextY < 0 ||
        aiNextY >= GRID_ROWS ||
        obstaclesRef.current.some((o) => o.x === aiNextX && o.y === aiNextY) ||
        prevAi.some((a) => a.x === aiNextX && a.y === aiNextY) ||
        newSnake.some((p) => p.x === aiNextX && p.y === aiNextY)
      ) {
        handleGameOver('player');
        return;
      }

      const newAiHead: Point = { x: aiNextX, y: aiNextY };
      const newAiSnake = [newAiHead, ...prevAi];

      // Check AI Food eat
      let aiEaten: FoodItem | null = null;
      const remAfterAi: FoodItem[] = [];
      for (const f of foodsRef.current) {
        if (f.x === newAiHead.x && f.y === newAiHead.y) {
          aiEaten = f;
        } else {
          remAfterAi.push(f);
        }
      }

      if (aiEaten) {
        setAiScore((s) => s + 10);
        triggerParticles(newAiHead.x, newAiHead.y, '#C026D3', 10);
        triggerFloatingText(newAiHead.x, newAiHead.y, 'AI +10', '#D946EF');
        const spawned = spawnFoodItem(
          remAfterAi,
          newSnake,
          newAiSnake,
          obstaclesRef.current
        );
        const updated = [...remAfterAi, spawned];
        foodsRef.current = updated;
        setFoods(updated);
        aiSnakeRef.current = newAiSnake;
        setAiSnake(newAiSnake);
      } else {
        newAiSnake.pop();
        aiSnakeRef.current = newAiSnake;
        setAiSnake(newAiSnake);
      }
    }
  }, [
    handleGameOver,
    spawnFoodItem,
    triggerFloatingText,
    triggerParticles,
    triggerShake,
    triggerUnlock,
  ]);

  // Robust 60FPS Game Loop with delta timing
  useEffect(() => {
    if (status !== 'PLAYING') return;

    lastTickTimeRef.current = performance.now();

    const gameLoop = (time: number) => {
      if (statusRef.current !== 'PLAYING') return;

      // Calculate speed interval
      let baseDelay = BASE_SPEED_MS[difficultyRef.current];
      const lengthSpeedUp = Math.min(35, Math.floor(playerSnakeRef.current.length * 1.2));
      baseDelay = Math.max(50, baseDelay - lengthSpeedUp);

      if (activePowerupRef.current?.type === 'SLOW') {
        baseDelay = Math.round(baseDelay * 1.5);
      }
      if (isBoostingRef.current) {
        baseDelay = Math.round(baseDelay * 0.52);
      }

      // Check if tick interval elapsed
      if (time - lastTickTimeRef.current >= baseDelay) {
        lastTickTimeRef.current = time;
        stepGame();
      }

      // Combo countdown & cleanup
      if (comboExpiresAtRef.current > 0) {
        const remainingMs = comboExpiresAtRef.current - Date.now();
        if (remainingMs <= 0) {
          setCombo(1);
          comboRef.current = 1;
          setComboTimeLeft(0);
          comboExpiresAtRef.current = 0;
        } else {
          setComboTimeLeft(remainingMs / 3500);
        }
      }

      // Powerup expiration
      if (activePowerupRef.current && Date.now() > activePowerupRef.current.expiresAt) {
        setActivePowerup(null);
        activePowerupRef.current = null;
        triggerFloatingText(12, 11, '효과 종료', '#94A3B8');
      }

      // Expire golden apples
      const validFoods = foodsRef.current.filter((f) => !f.expiresAt || Date.now() <= f.expiresAt);
      if (validFoods.length !== foodsRef.current.length) {
        foodsRef.current = validFoods;
        setFoods(validFoods);
      }

      // Decay particles and texts
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: 1 - p.life / p.maxLife,
            life: p.life + 1,
          }))
          .filter((p) => p.life < p.maxLife)
      );

      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({
            ...ft,
            y: ft.y - 0.8,
            alpha: 1 - ft.life / ft.maxLife,
            life: ft.life + 1,
          }))
          .filter((ft) => ft.life < ft.maxLife)
      );

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [status, stepGame, triggerFloatingText]);

  // Clean 1-Second Interval for Survival Game Time
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const interval = setInterval(() => {
      setGameTimeSec((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Bulletproof Keyboard Event Listener (Supports WASD, Arrow keys, Korean IME, and Caps Lock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      // Prevent scrolling on game control keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) ||
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)
      ) {
        e.preventDefault();
      }

      // Pause / Resume / Start on Space or P
      if (code === 'Space' || key === ' ' || code === 'KeyP' || key === 'p' || key === 'ㅔ') {
        if (statusRef.current === 'PLAYING') {
          setStatus('PAUSED');
          statusRef.current = 'PAUSED';
          sound.playClick();
        } else if (statusRef.current === 'PAUSED') {
          setStatus('PLAYING');
          statusRef.current = 'PLAYING';
          lastTickTimeRef.current = performance.now();
          sound.playClick();
        } else if (statusRef.current === 'GAME_OVER' || statusRef.current === 'MENU') {
          startNewGame();
        }
        return;
      }

      // Quick Restart on R
      if (code === 'KeyR' || key === 'r' || key === 'ㄱ') {
        startNewGame();
        return;
      }

      // Boost on Shift
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        setIsBoosting(true);
        isBoostingRef.current = true;
        return;
      }

      // Movement: W/A/S/D, Arrow keys, and Korean layout ㅈ/ㅁ/ㄴ/ㅇ
      if (
        code === 'KeyW' ||
        code === 'ArrowUp' ||
        key === 'w' ||
        key === 'arrowup' ||
        key === 'ㅈ'
      ) {
        e.preventDefault();
        handleDirectionChange('UP');
      } else if (
        code === 'KeyS' ||
        code === 'ArrowDown' ||
        key === 's' ||
        key === 'arrowdown' ||
        key === 'ㄴ'
      ) {
        e.preventDefault();
        handleDirectionChange('DOWN');
      } else if (
        code === 'KeyA' ||
        code === 'ArrowLeft' ||
        key === 'a' ||
        key === 'arrowleft' ||
        key === 'ㅁ'
      ) {
        e.preventDefault();
        handleDirectionChange('LEFT');
      } else if (
        code === 'KeyD' ||
        code === 'ArrowRight' ||
        key === 'd' ||
        key === 'arrowright' ||
        key === 'ㅇ'
      ) {
        e.preventDefault();
        handleDirectionChange('RIGHT');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        setIsBoosting(false);
        isBoostingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDirectionChange, startNewGame]);

  // Skin selection handler
  const handleSelectSkin = (selected: WormSkin) => {
    setSkin(selected);
    try {
      localStorage.setItem('worm_skin_id', selected.id);
    } catch {}
    sound.playClick();
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMuted(nextMute);
  };

  // Pause toggle
  const handleTogglePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      statusRef.current = 'PAUSED';
      sound.playClick();
    } else if (status === 'PAUSED') {
      setStatus('PLAYING');
      statusRef.current = 'PLAYING';
      lastTickTimeRef.current = performance.now();
      sound.playClick();
    }
  };

  const powerupTimeLeftSec = activePowerup
    ? Math.max(0, Math.ceil((activePowerup.expiresAt - Date.now()) / 1000))
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Top Bar Contract (1 row, 3 zones separated by gap-8) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shadow-sm">
            🐛
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            지렁이 게임
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">Worm Master</span>
        </div>

        {/* Zone 2: Mode selector tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              setGameMode('classic');
              startNewGame('classic');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'classic'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            클래식
          </button>
          <button
            onClick={() => {
              setGameMode('arcade');
              startNewGame('arcade');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'arcade'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            아케이드
          </button>
          <button
            onClick={() => {
              setGameMode('maze');
              startNewGame('maze');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'maze'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            미로
          </button>
          <button
            onClick={() => {
              setGameMode('duel');
              startNewGame('duel');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'duel'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            AI 대전
          </button>
        </nav>

        {/* Zone 3: Primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => startNewGame()}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            {status === 'PLAYING' ? '새 게임' : '게임 시작'}
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 flex-1 flex flex-col justify-center items-center gap-3">
        {/* HUD Component */}
        <HUD
          score={score}
          highScore={highScores[gameMode] || 0}
          length={playerSnake.length}
          gameMode={gameMode}
          combo={combo}
          comboTimeLeft={comboTimeLeft}
          activePowerup={activePowerup}
          powerupTimeLeftSec={powerupTimeLeftSec}
          isMuted={isMuted}
          isPaused={status === 'PAUSED'}
          aiScore={aiScore}
          aiLength={aiSnake.length}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onRestart={() => startNewGame()}
          onOpenSkins={() => setShowSkinsModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
        />

        {/* Canvas Arena */}
        <div className="w-full relative">
          <GameBoard
            playerSnake={playerSnake}
            playerDir={playerDir}
            aiSnake={gameMode === 'duel' ? aiSnake : undefined}
            aiDir={gameMode === 'duel' ? aiDir : undefined}
            foods={foods}
            obstacles={obstacles}
            particles={particles}
            floatingTexts={floatingTexts}
            skin={skin}
            activePowerup={activePowerup}
            screenShake={screenShake}
            showGridLines={showGridLines}
            gameStatus={status}
            onCanvasClick={() => {
              if (status === 'MENU' || status === 'GAME_OVER') {
                startNewGame();
              } else if (status === 'PAUSED') {
                setStatus('PLAYING');
                statusRef.current = 'PLAYING';
                lastTickTimeRef.current = performance.now();
              }
            }}
          />

          {/* Initial Menu Start Card Overlay */}
          {status === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-emerald-500/10">
                🐛
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                지렁이 게임
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                사과를 먹고 몸집을 키우세요. 벽과 몸통을 조심하고, 고득점 콤보를 노려보세요!
              </p>

              {/* Quick Difficulty Selector */}
              <div className="flex items-center gap-2 mt-4 text-xs">
                <span className="text-slate-500">난이도:</span>
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(d);
                      difficultyRef.current = d;
                    }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      difficulty === d
                        ? 'bg-slate-700 text-emerald-400 font-bold border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d === 'easy' ? '쉬움' : d === 'normal' ? '보통' : '어려움'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startNewGame()}
                className="mt-6 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                게임 시작 (Space)
              </button>
            </div>
          )}
        </div>

        {/* On-screen Controls (Touch D-Pad, Boost button, Keyboard helper) */}
        <Controls
          onDirectionChange={handleDirectionChange}
          isBoosting={isBoosting}
          onBoostStart={() => {
            setIsBoosting(true);
            isBoostingRef.current = true;
          }}
          onBoostEnd={() => {
            setIsBoosting(false);
            isBoostingRef.current = false;
          }}
        />
      </main>

      {/* Footer */}
      <footer className="py-2.5 px-4 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
        <span>지렁이 게임 · Worm Master v1.0</span>
        <button
          onClick={() => setShowGridLines(!showGridLines)}
          className="hover:text-slate-300 transition-colors"
        >
          격자선 {showGridLines ? '끄기' : '켜기'}
        </button>
        <span>·</span>
        <button
          onClick={() => setShowHelpModal(true)}
          className="hover:text-slate-300 transition-colors"
        >
          도움말
        </button>
      </footer>

      {/* Modals */}
      {status === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          highScore={highScores[gameMode] || 0}
          isNewHigh={isNewHigh}
          applesEaten={applesEaten}
          maxCombo={maxCombo}
          timeSec={gameTimeSec}
          gameMode={gameMode}
          duelWinner={duelWinner}
          onRestart={() => startNewGame()}
          onChangeMode={(newMode) => {
            setGameMode(newMode);
            startNewGame(newMode);
          }}
        />
      )}

      {showSkinsModal && (
        <SkinsModal
          currentSkin={skin}
          onSelectSkin={handleSelectSkin}
          onClose={() => setShowSkinsModal(false)}
        />
      )}

      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
}
