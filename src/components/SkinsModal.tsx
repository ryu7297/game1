import React from 'react';
import { X, Check } from 'lucide-react';
import { WormSkin, SkinId } from '../types/game';
import { SKINS } from '../utils/constants';

interface SkinsModalProps {
  currentSkin: WormSkin;
  onSelectSkin: (skin: WormSkin) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  currentSkin,
  onSelectSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">지렁이 스킨 선택</h2>
            <p className="text-xs text-slate-400 mt-0.5">원하는 스타일의 지렁이로 플레이하세요.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {SKINS.map((skin) => {
            const isSelected = skin.id === currentSkin.id;
            return (
              <button
                key={skin.id}
                onClick={() => {
                  onSelectSkin(skin);
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Skin Avatar Preview */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${skin.headColor}, ${skin.bodyColorEnd})`,
                      boxShadow: `0 0 10px ${skin.glowColor}`,
                    }}
                  >
                    {/* Cute Eyes preview */}
                    <div className="flex gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: skin.eyeColor }}
                      >
                        <div
                          className="w-1.2 h-1.2 rounded-full"
                          style={{ backgroundColor: skin.pupilColor }}
                        />
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: skin.eyeColor }}
                      >
                        <div
                          className="w-1.2 h-1.2 rounded-full"
                          style={{ backgroundColor: skin.pupilColor }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {skin.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{skin.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Swatches */}
                  <div className="flex -space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-900"
                      style={{ backgroundColor: skin.headColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-900"
                      style={{ backgroundColor: skin.bodyColorEnd }}
                    />
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors text-sm"
        >
          확인
        </button>
      </div>
    </div>
  );
};
