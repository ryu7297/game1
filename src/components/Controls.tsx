import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Direction } from '../types/game';

interface ControlsProps {
  onDirectionChange: (dir: Direction) => void;
  isBoosting: boolean;
  onBoostStart: () => void;
  onBoostEnd: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onDirectionChange,
  isBoosting,
  onBoostStart,
  onBoostEnd,
}) => {
  const triggerDir = (dir: Direction) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    onDirectionChange(dir);
  };

  return (
    <div className="w-full flex items-center justify-between gap-4 mt-2 px-2 max-w-lg mx-auto select-none">
      {/* Desktop Helper Guide */}
      <div className="hidden sm:flex flex-col gap-1 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-mono">
            W A S D
          </kbd>
          <span>또는</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-mono">
            방향키
          </kbd>
          <span className="text-slate-500">이동</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-mono">
            Shift
          </kbd>
          <span className="text-slate-500">부스트 가속</span>
          <span className="text-slate-600">·</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-mono">
            Space
          </kbd>
          <span className="text-slate-500">일시정지</span>
        </div>
      </div>

      {/* Virtual D-Pad for Mobile and Mouse Clickers */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-4">
        {/* Boost Button */}
        <button
          onMouseDown={onBoostStart}
          onMouseUp={onBoostEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            onBoostStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBoostEnd();
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border transition-all active:scale-95 ${
            isBoosting
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-700'
          }`}
          title="부스트 가속 (Shift)"
        >
          <Zap className={`w-6 h-6 ${isBoosting ? 'fill-current animate-bounce' : ''}`} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">부스트</span>
        </button>

        {/* 4-way Cross Buttons */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-36 h-36">
          <div />
          <button
            onClick={() => triggerDir('UP')}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-slate-200 rounded-xl border border-slate-700 shadow-sm transition-all"
            aria-label="위쪽"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div />

          <button
            onClick={() => triggerDir('LEFT')}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-slate-200 rounded-xl border border-slate-700 shadow-sm transition-all"
            aria-label="왼쪽"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center text-[10px] text-slate-600 font-mono">
            DPAD
          </div>

          <button
            onClick={() => triggerDir('RIGHT')}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-slate-200 rounded-xl border border-slate-700 shadow-sm transition-all"
            aria-label="오른쪽"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div />
          <button
            onClick={() => triggerDir('DOWN')}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-slate-200 rounded-xl border border-slate-700 shadow-sm transition-all"
            aria-label="아래쪽"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
