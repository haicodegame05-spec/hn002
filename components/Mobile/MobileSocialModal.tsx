
import React, { useState } from 'react';
import { Player, Relationship, GameGenre, AppSettings } from '../../types';
import { renderSafeText, toSentenceCase } from '../NpcProfileBase';
import { isFamilyMember } from '../../constants/familyRoles';
import { DEFAULT_AVATAR } from '../../constants';

interface MobileSocialModalProps {
  player: Player;
  genre?: GameGenre;
  onClose: () => void;
  onOpenProfile?: (npc: Relationship) => void;
  settings: AppSettings;
}

export const MobileSocialModal: React.FC<MobileSocialModalProps> = ({ player, genre, onClose, onOpenProfile, settings }) => {
  const [selectedNpc, setSelectedNpc] = useState<Relationship | null>(null);

  const socialList = (player.relationships || []).filter(r => {
    if (r.type === 'social') return true;
    if (r.type === 'family' || r.type === 'harem') return false; // Ưu tiên lựa chọn thủ công
    
    const isHarem = (r.affinity || 0) >= 600;
    const isRealBlood = isFamilyMember(renderSafeText(r.familyRole), genre);
    if (isHarem || isRealBlood) return false;
    return true;
  });

  return (
    <div className="MobileSocialModal fixed inset-0 z-[310] bg-black flex flex-col h-full overflow-hidden mono">
      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-cyan-500/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest italic">SOCIAL_NETWORK</h2>
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
              className="m-4 flex items-center gap-2 text-cyan-500 text-[10px] font-black uppercase tracking-widest"
            >
              ❮ Quay lại danh sách
            </button>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-1 space-y-1">
              {/* PROFILE HEADER */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`relative w-48 aspect-[2/3] rounded-[2.5rem] border-4 flex items-center justify-center shadow-2xl overflow-hidden ${selectedNpc.affinity > 0 ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  {selectedNpc.avatar ? (
                    <img src={selectedNpc.avatar} alt={selectedNpc.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={DEFAULT_AVATAR} alt={selectedNpc.name} className="w-full h-full object-cover opacity-40" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedNpc.name}</h3>
                  <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{toSentenceCase(selectedNpc.status)}</p>
                </div>
                <button 
                  onClick={() => onOpenProfile?.(selectedNpc)}
                  className="w-full py-3 bg-cyan-500 text-black font-black uppercase text-[10px] rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>📂</span> Xem hồ sơ
                </button>
              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="block text-[7px] text-neutral-600 font-black uppercase mb-1 tracking-widest">Vị trí</span>
                  <p className="text-sm font-black text-cyan-400 truncate">{toSentenceCase(selectedNpc.lastLocation || 'Chưa rõ')}</p>
                </div>
                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="block text-[7px] text-neutral-600 font-black uppercase mb-1 tracking-widest">Thiện cảm</span>
                  <p className={`text-sm font-black mono ${selectedNpc.affinity > 0 ? 'text-cyan-400' : 'text-red-500'}`}>{selectedNpc.affinity}</p>
                </div>
              </div>

              {/* IMPRESSION */}
              <div className="p-1 bg-black/60 border border-white/5 rounded-[2rem] relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                <span className="block text-[8px] text-neutral-600 font-black uppercase mb-3 tracking-widest">Phân tích ấn tượng</span>
                <p className="text-xs text-neutral-400 font-medium italic leading-relaxed">
                  {toSentenceCase(selectedNpc.impression, 'Đối tượng đang được giám sát chặt chẽ. Chưa có báo cáo cụ thể.')}
                </p>
              </div>

              {/* SECRETS */}
              <div className="space-y-3">
                <span className="block text-[8px] text-neutral-600 font-black uppercase tracking-widest px-2">Dữ liệu bí mật</span>
                {Array.isArray(selectedNpc.secrets) && selectedNpc.secrets.length > 0 ? (
                  selectedNpc.secrets.map((s, i) => (
                    <div key={i} className="p-1 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4">
                      <span className="text-2xl">🔒</span>
                      <span className="text-[10px] font-black text-red-400 uppercase leading-tight">{renderSafeText(s)}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                    <span className="text-4xl mb-4">㊙</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Chưa thâm nhập được</p>
                  </div>
                )}
              </div>
              
              <div className="h-10"></div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col overflow-hidden p-1 space-y-1">
            <div className="shrink-0">
              <h3 className="text-xl font-black text-cyan-400 uppercase tracking-tighter italic">Intelligence <span className="text-white">Network</span></h3>
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Cơ sở dữ liệu nhân sinh ({socialList.length})</p>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3">
              {socialList.length > 0 ? (
                socialList.map((rel, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedNpc(rel)} 
                    className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 active:scale-95 transition-all"
                  >
                    <div className={`w-14 aspect-[2/3] rounded-xl border-2 overflow-hidden shrink-0 ${rel.affinity > 0 ? 'border-cyan-500/20' : 'border-red-500/20'}`}>
                      {rel.avatar ? (
                        <img src={rel.avatar} alt={rel.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src={DEFAULT_AVATAR} alt={rel.name} className="w-full h-full object-cover opacity-40" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-black text-white uppercase truncate">{rel.name}</div>
                      <div className="text-[8px] text-neutral-500 font-black uppercase tracking-widest mt-0.5 truncate">{toSentenceCase(rel.familyRole || rel.status)}</div>
                      <div className={`text-[10px] font-black mono mt-1 ${rel.affinity > 0 ? 'text-cyan-400' : 'text-red-500'}`}>{rel.affinity}</div>
                    </div>
                    <span className="text-neutral-700">❯</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <div className="text-5xl mb-4">👤</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Dữ liệu trống</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
