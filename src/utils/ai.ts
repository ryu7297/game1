import { Point, Direction, FoodItem, Obstacle } from '../types/game';

const DIRECTIONS: { dir: Direction; dx: number; dy: number }[] = [
  { dir: 'UP', dx: 0, dy: -1 },
  { dir: 'DOWN', dx: 0, dy: 1 },
  { dir: 'LEFT', dx: -1, dy: 0 },
  { dir: 'RIGHT', dx: 1, dy: 0 },
];

/**
 * Returns whether a point is blocked by walls, obstacles, player snake, or ai snake
 */
function isBlocked(
  p: Point,
  cols: number,
  rows: number,
  obstacles: Obstacle[],
  playerSnake: Point[],
  aiSnake: Point[],
  ignoreTail: boolean = true
): boolean {
  // Check boundaries
  if (p.x < 0 || p.x >= cols || p.y < 0 || p.y >= rows) {
    return true;
  }

  // Check obstacles
  for (const obs of obstacles) {
    if (obs.x === p.x && obs.y === p.y) return true;
  }

  // Check player snake body
  for (let i = 0; i < playerSnake.length; i++) {
    if (playerSnake[i].x === p.x && playerSnake[i].y === p.y) {
      return true;
    }
  }

  // Check AI snake body (can ignore tail if moving next frame)
  const aiBodyLen = ignoreTail ? aiSnake.length - 1 : aiSnake.length;
  for (let i = 0; i < aiBodyLen; i++) {
    if (aiSnake[i].x === p.x && aiSnake[i].y === p.y) {
      return true;
    }
  }

  return false;
}

/**
 * Count reachable cells from a point via flood fill to avoid dead ends
 */
function countReachableSpace(
  start: Point,
  cols: number,
  rows: number,
  obstacles: Obstacle[],
  playerSnake: Point[],
  aiSnake: Point[],
  maxDepth = 30
): number {
  const visited = new Set<string>();
  const queue: Point[] = [start];
  visited.add(`${start.x},${start.y}`);
  let count = 0;

  while (queue.length > 0 && count < maxDepth) {
    const curr = queue.shift()!;
    count++;

    for (const d of DIRECTIONS) {
      const nextP: Point = { x: curr.x + d.dx, y: curr.y + d.dy };
      const key = `${nextP.x},${nextP.y}`;
      if (!visited.has(key) && !isBlocked(nextP, cols, rows, obstacles, playerSnake, aiSnake, false)) {
        visited.add(key);
        queue.push(nextP);
      }
    }
  }

  return count;
}

/**
 * AI Pathfinding using BFS towards closest food, with flood-fill fallback
 */
export function getNextAiMove(
  aiSnake: Point[],
  currentDir: Direction,
  foods: FoodItem[],
  playerSnake: Point[],
  obstacles: Obstacle[],
  cols: number,
  rows: number
): Direction {
  if (aiSnake.length === 0) return currentDir;
  const head = aiSnake[0];

  // Find valid neighbor moves
  const validMoves: { dir: Direction; next: Point }[] = [];
  const oppositeDir: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  for (const d of DIRECTIONS) {
    if (d.dir === oppositeDir[currentDir]) continue; // cannot reverse immediately
    const nextP: Point = { x: head.x + d.dx, y: head.y + d.dy };
    if (!isBlocked(nextP, cols, rows, obstacles, playerSnake, aiSnake, true)) {
      validMoves.push({ dir: d.dir, next: nextP });
    }
  }

  if (validMoves.length === 0) {
    // If totally boxed in, try any non-reverse move
    return currentDir;
  }
  if (validMoves.length === 1) {
    return validMoves[0].dir;
  }

  // Target food: prioritize closest food
  let targetFood: FoodItem | null = null;
  let minManhattan = Infinity;
  for (const f of foods) {
    const dist = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
    if (dist < minManhattan) {
      minManhattan = dist;
      targetFood = f;
    }
  }

  if (targetFood) {
    // BFS to find shortest path to target food
    const queue: { point: Point; firstDir: Direction }[] = [];
    const visited = new Set<string>();
    visited.add(`${head.x},${head.y}`);

    for (const move of validMoves) {
      visited.add(`${move.next.x},${move.next.y}`);
      queue.push({ point: move.next, firstDir: move.dir });
    }

    let foundDir: Direction | null = null;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.point.x === targetFood.x && curr.point.y === targetFood.y) {
        foundDir = curr.firstDir;
        break;
      }

      for (const d of DIRECTIONS) {
        const nextP: Point = { x: curr.point.x + d.dx, y: curr.point.y + d.dy };
        const key = `${nextP.x},${nextP.y}`;
        if (!visited.has(key) && !isBlocked(nextP, cols, rows, obstacles, playerSnake, aiSnake, false)) {
          visited.add(key);
          queue.push({ point: nextP, firstDir: curr.firstDir });
        }
      }
    }

    if (foundDir) {
      // Before committing, ensure this move doesn't lead into an inescapable small pocket
      const targetMove = validMoves.find((m) => m.dir === foundDir);
      if (targetMove) {
        const space = countReachableSpace(targetMove.next, cols, rows, obstacles, playerSnake, aiSnake, 18);
        if (space >= 10 || space >= aiSnake.length) {
          return foundDir;
        }
      }
    }
  }

  // Fallback: choose the neighbor that provides maximum reachable free space (flood fill)
  let bestDir = validMoves[0].dir;
  let maxSpace = -1;

  for (const move of validMoves) {
    const space = countReachableSpace(move.next, cols, rows, obstacles, playerSnake, aiSnake, 25);
    if (space > maxSpace) {
      maxSpace = space;
      bestDir = move.dir;
    }
  }

  return bestDir;
}
