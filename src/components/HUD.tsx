import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  Palette,
} from 'lucide-react';
import { GameMode, ActivePowerup } from '../types/game';

interface HUDProps {
  score: number;
  highScore: number;
  length: number;
  gameMode: GameMode;
  combo: number;
  comboTimeLeft: number; // 0 to 1
  activePowerup: ActivePowerup | null;
  powerupTimeLeftSec: number;
  isMuted: boolean;
  isPaused: boolean;
  aiScore?: number;
  aiLength?: number;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenSkins: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  length,
  gameMode,
  combo,
  comboTimeLeft,
  activePowerup,
  powerupTimeLeftSec,
  isMuted,
  isPaused,
  aiScore,
  aiLength,
  onToggleMute,
  onTogglePause,
  onRestart,
  onOpenSkins,
  onOpenAchievements,
  onOpenHelp,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Stat Bar */}
      <div className="flex items-center justify-between gap-4 py-2 px-1">
        {/* Left: Scores */}
        <div className="flex items-baseline gap-4 sm:gap-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">점수</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tabular-nums tracking-tight">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">최고 기록</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">지렁이 길이</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums">
              {length}
            </span>
          </div>

          {/* AI Rival status in Duel Mode */}
          {gameMode === 'duel' && aiScore !== undefined && (
            <div className="flex flex-col border-l border-slate-700 pl-4">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-medium">AI 라이벌</span>
              <span className="text-lg sm:text-xl font-bold text-purple-300 font-mono tabular-nums">
                {aiScore}점 · L:{aiLength}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onTogglePause}
            title={isPaused ? '게임 재개 (Space)' : '일시정지 (Space)'}
            className="p-2 sm:px-3 sm:py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            <span className="hidden md:inline">{isPaused ? '계속하기' : '일시정지'}</span>
          </button>

          <button
            onClick={onRestart}
            title="다시 시작 (R)"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? '소리 켜기' : '소리 끄기'}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenSkins}
            title="스킨 꾸미기"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Palette className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={onOpenAchievements}
            title="업적 보기"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={onOpenHelp}
            title="조작법 및 규칙"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Dynamic Sub-Bar: Combos & Active Powerups */}
      {(combo > 1 || activePowerup) && (
        <div className="flex items-center gap-3 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          {combo > 1 && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                콤보 x{combo}
              </span>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-75 ease-linear"
                  style={{ width: `${Math.max(0, Math.min(100, comboTimeLeft * 100))}%` }}
                />
              </div>
            </div>
          )}

          {combo > 1 && activePowerup && <span className="text-slate-600">·</span>}

          {activePowerup && (
            <div className="flex items-center gap-2 text-sky-400 font-medium">
              <span>
                {activePowerup.type === 'MAGNET' && '🧲 자석 모드'}
                {activePowerup.type === 'SLOW' && '❄️ 슬로우 모션'}
                {activePowerup.type === 'GHOST' && '👻 유령 통과 모드'}
              </span>
              <span className="font-mono text-slate-300">({powerupTimeLeftSec}초)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
