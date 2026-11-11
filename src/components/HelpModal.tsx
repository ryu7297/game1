import React from 'react';
import { X, HelpCircle, Gamepad2, Sparkles, Shield, Swords } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">게임 규칙 및 도움말</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto pr-1 text-xs sm:text-sm">
          {/* Controls */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-2">
              <Gamepad2 className="w-4 h-4" />
              조작 방법
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">키보드 조작</span>
                <span>방향키 또는 W, A, S, D</span>
              </div>
              <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">부스트 가속</span>
                <span>Shift 키 누르고 있기</span>
              </div>
              <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">일시 정지</span>
                <span>Space 키 또는 P</span>
              </div>
              <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">모바일 / 터치</span>
                <span>화면 가상 D-패드 및 부스트 버튼</span>
              </div>
            </div>
          </div>

          {/* Game Modes */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-2">
              <Swords className="w-4 h-4" />
              게임 모드 소개
            </div>
            <div className="flex flex-col gap-1.5 text-slate-300">
              <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-400">클래식 모드:</span> 가장 순수한 정통 지렁이 게임입니다. 사과를 먹을수록 길어지고 빨라집니다.
              </div>
              <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400">아케이드 모드:</span> 자석, 슬로우 모션, 유령 통과 등 다양한 파워업과 콤보 배율이 등장합니다.
              </div>
              <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-400">미로 모드:</span> 경기장 곳곳에 돌벽 장애물이 배치되어 고도의 회피 실력이 필요합니다.
              </div>
              <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="font-bold text-purple-400">AI 대전 모드:</span> 똑똑한 AI 지렁이와 한 맵에서 사과 쟁탈전을 벌입니다. 상대를 가두거나 먼저 먹이를 독점하세요!
              </div>
            </div>
          </div>

          {/* Items & Powerups */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              먹이 및 아이템 효과
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-start gap-2 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-xl">🍎</span>
                <div>
                  <span className="font-semibold text-rose-400 block">빨간 사과</span>
                  <span className="text-xs text-slate-400">+10점, 길이 1 증가</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-xl">⭐</span>
                <div>
                  <span className="font-semibold text-amber-400 block">황금 사과</span>
                  <span className="text-xs text-slate-400">+50점, 길이 2 증가, 일정 시간 후 사라짐</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-xl">🧲</span>
                <div>
                  <span className="font-semibold text-cyan-400 block">자석 아이템</span>
                  <span className="text-xs text-slate-400">주변의 사과를 머리 쪽으로 빨아들입니다</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="text-xl">👻</span>
                <div>
                  <span className="font-semibold text-purple-400 block">유령 모드</span>
                  <span className="text-xs text-slate-400">몸체와 벽을 부딪히지 않고 반대편으로 통과</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-sm"
        >
          게임 시작하기
        </button>
      </div>
    </div>
  );
};
