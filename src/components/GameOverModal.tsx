import React from 'react';
import { RotateCcw, Award, Flame, Apple, Clock } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  applesEaten: number;
  maxCombo: number;
  timeSec: number;
  gameMode: GameMode;
  duelWinner?: 'player' | 'ai' | 'draw' | null;
  onRestart: () => void;
  onChangeMode: (mode: GameMode) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  applesEaten,
  maxCombo,
  timeSec,
  gameMode,
  duelWinner,
  onRestart,
  onChangeMode,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center">
        {/* Duel Result or Standard Game Over */}
        {gameMode === 'duel' && duelWinner ? (
          <div className="mb-4">
            {duelWinner === 'player' ? (
              <>
                <div className="text-4xl mb-2">👑</div>
                <h2 className="text-2xl font-extrabold text-emerald-400">라이벌 격파 승리!</h2>
                <p className="text-sm text-slate-400 mt-1">AI 지렁이보다 먼저 먹이를 차지하고 살아남았습니다!</p>
              </>
            ) : duelWinner === 'ai' ? (
              <>
                <div className="text-4xl mb-2">💥</div>
                <h2 className="text-2xl font-extrabold text-rose-400">패배...</h2>
                <p className="text-sm text-slate-400 mt-1">AI 지렁이에게 아쉽게 패배했습니다. 다음 판에 복수하세요!</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🤝</div>
                <h2 className="text-2xl font-extrabold text-amber-400">무승부!</h2>
                <p className="text-sm text-slate-400 mt-1">동시에 충돌했습니다!</p>
              </>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">게임 종료</h2>
            {isNewHigh ? (
              <div className="inline-flex items-center gap-1.5 mt-2 text-amber-400 font-bold text-sm bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Award className="w-4 h-4" />
                새로운 최고 기록 달성!
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1">벽이나 지렁이 몸에 부딪혔습니다.</p>
            )}
          </div>
        )}

        {/* Score Display */}
        <div className="my-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">최종 점수</span>
          <div className="text-4xl font-extrabold text-slate-100 font-mono tabular-nums my-1">
            {score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            최고 기록: {Math.max(score, highScore).toLocaleString()}점
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-left">
          <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
              <Apple className="w-3.5 h-3.5 text-rose-400" />
              <span>먹은 사과</span>
            </div>
            <span className="text-base font-bold text-slate-200 font-mono tabular-nums">
              {applesEaten}개
            </span>
          </div>

          <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>최대 콤보</span>
            </div>
            <span className="text-base font-bold text-slate-200 font-mono tabular-nums">
              x{maxCombo}
            </span>
          </div>

          <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>생존 시간</span>
            </div>
            <span className="text-base font-bold text-slate-200 font-mono tabular-nums">
              {formatTime(timeSec)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            다시 하기 (Space)
          </button>

          {/* Quick mode switcher */}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
            <span>모드 변경:</span>
            <button
              onClick={() => onChangeMode('classic')}
              className={`px-2 py-1 rounded transition-colors ${gameMode === 'classic' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
            >
              클래식
            </button>
            <span>·</span>
            <button
              onClick={() => onChangeMode('arcade')}
              className={`px-2 py-1 rounded transition-colors ${gameMode === 'arcade' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
            >
              아케이드
            </button>
            <span>·</span>
            <button
              onClick={() => onChangeMode('maze')}
              className={`px-2 py-1 rounded transition-colors ${gameMode === 'maze' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
            >
              미로
            </button>
            <span>·</span>
            <button
              onClick={() => onChangeMode('duel')}
              className={`px-2 py-1 rounded transition-colors ${gameMode === 'duel' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
            >
              AI 대전
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
