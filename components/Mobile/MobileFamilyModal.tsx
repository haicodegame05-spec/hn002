
import React, { useState } from 'react';
import { Player, Relationship, GameGenre, AppSettings } from '../../types';
import { renderSafeText, toSentenceCase } from '../NpcProfileBase';
import { isFamilyMember } from '../../constants/familyRoles';
import { DEFAULT_AVATAR } from '../../constants';

interface MobileFamilyModalProps {
  player: Player;
  genre?: GameGenre;
  onClose: () => void;
  onOpenProfile?: (npc: Relationship) => void;
  settings: AppSettings;
}

export const MobileFamilyModal: React.FC<MobileFamilyModalProps> = ({ player, genre, onClose, onOpenProfile, settings }) => {
  const [selectedNpc, setSelectedNpc] = useState<Relationship | null>(null);

  const familyList = (player.relationships || []).filter(r => {
    if (r.type === 'family') return true;
    if (r.type === 'harem' || r.type === 'social') return false; // Ưu tiên lựa chọn thủ công
    if (!r.familyRole) return false;
    return isFamilyMember(renderSafeText(r.familyRole), genre);
  });

  return (
    <div className="MobileFamilyModal fixed inset-0 z-[310] bg-black flex flex-col h-full overflow-hidden mono">
      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-orange-500/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]"></div>
          <h2 className="text-sm font-black text-orange-500 uppercase tracking-widest italic">FAMILY_SYNC</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 text-neutral-400 rounded-lg border border-white/10">✕</button>
      </div>

      {/* LIST OR DETAIL VIEW */}
      <div className="flex-grow overflow-hidden flex flex-col">
        {selectedNpc ? (
          <div className="flex-grow flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* BACK BUTTON */}
            <button 
              onClick={() => setSelectedNpc(null)}
              className="m-4 flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest"
            >
              ❮ Quay lại danh sách
            </button>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-1 space-y-1">
              {/* PROFILE HEADER */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 aspect-[2/3] rounded-[2rem] border-4 border-orange-500/20 bg-neutral-900 overflow-hidden shadow-2xl">
                  {selectedNpc.avatar ? (
                    <img src={selectedNpc.avatar} alt={selectedNpc.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={DEFAULT_AVATAR} alt={selectedNpc.name} className="w-full h-full object-cover opacity-40" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedNpc.name}</h3>
                  <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">{selectedNpc.familyRole}</p>
                </div>
                <button 
                  onClick={() => onOpenProfile?.(selectedNpc)}
                  className="w-full py-3 bg-orange-500 text-black font-black uppercase text-[10px] rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>📂</span> Chi tiết hồ sơ
                </button>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                  <span className="block text-[7px] text-neutral-600 font-black uppercase mb-1 tracking-widest">Thiện cảm</span>
                  <span className="text-xl font-black text-orange-400 mono">{selectedNpc.affinity}</span>
                </div>
                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                  <span className="block text-[7px] text-neutral-600 font-black uppercase mb-1 tracking-widest">Tình trạng</span>
                  <span className="text-xs font-black text-white uppercase truncate">{selectedNpc.status || 'Khỏe mạnh'}</span>
                </div>
              </div>

              {/* IMPRESSION */}
              <div className="p-1 bg-[var(--bg)]/40 border border-white/5 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-30"></div>
                <span className="block text-[8px] text-neutral-600 font-black uppercase mb-3 tracking-widest">Tâm lý đối với MC</span>
                <p className="text-xs text-neutral-200 italic leading-relaxed">
                  "{toSentenceCase(selectedNpc.impression, 'Người thân máu mủ, đang theo dõi sự trưởng thành của bạn.')}"
                </p>
              </div>

              {/* SECRETS */}
              <div className="space-y-3">
                <span className="block text-[8px] text-neutral-600 font-black uppercase tracking-widest px-2">Bí mật gia đình</span>
                {Array.isArray(selectedNpc.secrets) && selectedNpc.secrets.length > 0 ? (
                  selectedNpc.secrets.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                      <span className="text-lg">🔒</span>
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-tight">{renderSafeText(s)}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-1 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-30">
                    <span className="text-2xl mb-2">㊙</span>
                    <p className="text-[8px] font-black uppercase tracking-widest">Không có bí mật</p>
                  </div>
                )}
              </div>
              
              <div className="h-10"></div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col overflow-hidden p-1 space-y-1">
            <div className="shrink-0">
              <h3 className="text-xl font-black text-orange-500 uppercase tracking-tighter italic">Gia Tộc <span className="text-white">Phả Hệ</span></h3>
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Dữ liệu huyết thống ({familyList.length})</p>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3">
              {familyList.length > 0 ? (
                familyList.map((rel, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedNpc(rel)} 
                    className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 active:scale-95 transition-all"
                  >
                    <div className="w-14 aspect-[2/3] rounded-xl border-2 border-white/5 overflow-hidden shrink-0">
                      {rel.avatar ? (
                        <img src={rel.avatar} alt={rel.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src={DEFAULT_AVATAR} alt={rel.name} className="w-full h-full object-cover opacity-40" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-black text-white uppercase truncate">{rel.name}</div>
                      <div className="text-[8px] text-orange-500/60 font-black uppercase tracking-widest mt-0.5">{rel.familyRole}</div>
                      <div className="text-orange-500 text-[10px] font-black mono mt-1">{rel.affinity}</div>
                    </div>
                    <span className="text-neutral-700">❯</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <div className="text-5xl mb-4">🏠</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Không có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
