import React from 'react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">게임 업적</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                총 {achievements.length}개 중 {unlockedCount}개 달성
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                item.unlocked
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl w-9 h-9 flex items-center justify-center bg-slate-800/80 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>

              <div>
                {item.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
