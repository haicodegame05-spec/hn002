
import React, { useState } from 'react';
import { Player, Relationship, GameGenre, AppSettings } from '../types';
import { DEFAULT_BLOOD_KEYWORDS, DEFAULT_FAMILY_BLACKLIST } from '../constants/familyRoles';
import { renderSafeText, toSentenceCase } from './NpcProfileBase';
import { MobileHaremModal } from './Mobile/MobileHaremModal';

interface Props {
  player: Player;
  genre?: GameGenre;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: (npc: Relationship) => void;
  settings: AppSettings;
}

export const HaremModal: React.FC<Props> = ({ player, genre, isOpen, onClose, onOpenProfile, settings }) => {
  const isMobile = settings.mobileMode;
  const [selectedNpc, setSelectedNpc] = useState<Relationship | null>(null);

  if (isMobile && isOpen) {
    return (
      <MobileHaremModal 
        player={player}
        genre={genre}
        onClose={onClose}
        onOpenProfile={onOpenProfile}
        settings={settings}
      />
    );
  }

  if (!isOpen) return null;

  const haremList = (player.relationships || []).filter(r => {
    if (r.type === 'harem') return true;
    if (r.type === 'family' || r.type === 'social') return false; // Ưu tiên lựa chọn thủ công
    
    // Phải có thiện cảm >= 600 (trên thang 1000)
    if ((r.affinity || 0) < 600) return false;

    const role = renderSafeText(r.familyRole).toLowerCase();
    
    // Kiểm tra huyết thống thực sự
    const isRealBlood = DEFAULT_BLOOD_KEYWORDS.some(k => role.includes(k)) && !DEFAULT_FAMILY_BLACKLIST.some(k => role.includes(k));
    
    // Nếu là huyết thống thực sự (Ba, Mẹ, Anh, Chị ruột) -> Vẫn có thể ở Harem nếu thiện cảm cao (tùy game), 
    // nhưng ở đây ta giữ logic cũ là ưu tiên Family nếu là huyết thống thực sự để tránh trùng lặp nếu người dùng muốn tách biệt.
    // Tuy nhiên, yêu cầu của người dùng là Harem dựa trên thiện cảm 600+. 
    // Tôi sẽ cho phép hiện ở Harem nếu đạt 600+, kể cả là Family (đa nhãn).
    return true;
  });

  return (
    <div className="HaremModal fixed inset-0 z-[110] bg-neutral-950 flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-pink-500/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
          <h2 className="text-sm font-black text-pink-400 mono tracking-[0.4em] uppercase">[ HAREM_LINK_ESTABLISHED ]</h2>
        </div>
        <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all rounded-xl border border-white/10 font-black uppercase text-[10px]">
          Ngắt kết nối [ESC]
        </button>
      </div>

      <div className={`flex flex-grow overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'w-full h-1/3' : 'w-full md:w-[26rem]'} border-r border-white/5 bg-black/40 flex flex-col shrink-0`}>
          <div className={`${isMobile ? 'p-4' : 'p-8'} border-b border-white/5`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black text-pink-500 uppercase tracking-tighter italic`}>Mỹ Nhân <span className="text-white">Đồ</span></h3>
            <p className="mono text-[9px] text-neutral-600 font-bold uppercase mt-1 tracking-[0.2em]">Dữ liệu hồng nhan chi kỷ</p>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-5 space-y-3">
            {haremList.length > 0 ? (
              haremList.map((rel, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedNpc(rel)} 
                  className={`p-3 md:p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 group ${selectedNpc?.id === rel.id ? 'bg-pink-500/10 border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.1)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
                >
                  <div className={`w-12 md:w-16 aspect-[2/3] rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all ${selectedNpc?.id === rel.id ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/20' : 'border-white/5'}`}>
                    {rel.avatar ? (
                      <img src={rel.avatar} alt={renderSafeText(rel.name)} className="w-full h-full object-cover bg-neutral-900" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-pink-500/20 text-xl md:text-2xl font-black italic">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-xs md:text-sm font-black text-white uppercase group-hover:text-pink-400 transition-colors truncate">{renderSafeText(rel.name)}</div>
                    <div className="mono text-[7px] md:text-[8px] text-pink-500/60 font-black uppercase tracking-widest mt-0.5">{toSentenceCase(rel.powerLevel || 'Phàm nhân')}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-pink-500 text-[9px] md:text-[10px] font-black mono">♥ {renderSafeText(rel.affinity)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                <div className="text-5xl mb-4">💔</div>
                <p className="mono text-[10px] font-black uppercase tracking-widest">Mạng lưới trống</p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-grow ${isMobile ? 'p-4' : 'p-10 md:p-20'} overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_center,rgba(236,72_153,0.04),transparent)]`}>
          {selectedNpc ? (
            <div className={`max-w-4xl mx-auto ${isMobile ? 'space-y-6' : 'space-y-12'} animate-in fade-in slide-in-from-right-10 duration-500`}>
              <div className="absolute top-0 right-0 border-4 border-pink-500/10 text-pink-500/10 text-4xl md:text-6xl font-black uppercase -rotate-12 pointer-events-none select-none">
                Confidential
              </div>

              <div className={`flex flex-col ${isMobile ? '' : 'lg:flex-row'} gap-6 md:gap-12 items-start`}>
                <div className={`flex-shrink-0 space-y-4 md:space-y-6 text-center group ${isMobile ? 'w-full' : ''}`}>
                  <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className={`relative ${isMobile ? 'w-48' : 'w-64'} aspect-[2/3] rounded-[2rem] md:rounded-[3rem] border-4 border-pink-500/20 bg-neutral-900 flex items-center justify-center shadow-2xl overflow-hidden`}>
                       {selectedNpc.avatar ? (
                         <img src={selectedNpc.avatar} alt={renderSafeText(selectedNpc.name)} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-pink-500/10">
                           <span className="text-4xl md:text-6xl font-black italic">?</span>
                           <span className="text-[8px] md:text-[10px] mono font-black uppercase tracking-widest mt-4">No_Data</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black text-white uppercase tracking-tighter leading-none`}>{renderSafeText(selectedNpc.name)}</h2>
                    <p className="text-pink-400 mono text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">{toSentenceCase(selectedNpc.status)}</p>
                    
                    <button 
                      onClick={() => onOpenProfile?.(selectedNpc)}
                      className="mt-4 md:mt-6 w-full py-3 bg-pink-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-pink-400 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
                    >
                      <span>📸</span> Chỉnh sửa hồ sơ
                    </button>

                    <div className="flex justify-center gap-2 mt-4">
                      <span className="px-3 md:px-4 py-1 bg-pink-500/10 border border-pink-500/20 rounded-lg text-[8px] md:text-[9px] text-pink-400 font-black uppercase tracking-widest">{toSentenceCase(selectedNpc.race || 'Nhân loại')}</span>
                      <span className="px-3 md:px-4 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] md:text-[9px] text-neutral-400 font-black uppercase tracking-widest">{toSentenceCase(selectedNpc.mood || 'Bình thản')}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex-grow grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4 md:gap-6 pt-4`}>
                  <div className={`${isMobile ? 'p-6' : 'p-8'} bg-black/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group hover:border-pink-500/30 transition-all`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    <span className="block mono text-[8px] md:text-[9px] font-black text-neutral-600 uppercase mb-4 tracking-[0.2em]">Tâm lý đối với MC</span>
                    <p className="text-xs md:text-sm text-neutral-200 italic font-medium leading-relaxed mono uppercase tracking-tight">
                      "{toSentenceCase(selectedNpc.impression, 'Đối tượng hiện vẫn đang giữ khoảng cách, cần thêm tương tác.')}"
                    </p>
                  </div>
                  <div className={`${isMobile ? 'p-6' : 'p-8'} bg-black/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] group hover:border-pink-500/30 transition-all`}>
                    <span className="block mono text-[8px] md:text-[9px] font-black text-neutral-600 uppercase mb-6 tracking-[0.2em]">Bí mật khuê phòng</span>
                    <div className="space-y-3">
                      {Array.isArray(selectedNpc.secrets) && selectedNpc.secrets.length > 0 ? selectedNpc.secrets.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-pink-500/5 border border-pink-500/10 rounded-xl animate-in fade-in slide-in-from-left duration-300">
                          <span className="text-lg md:text-xl">🔒</span>
                          <span className="text-[10px] md:text-[11px] text-pink-400 font-bold uppercase tracking-tight">{renderSafeText(s)}</span>
                        </div>
                      )) : (
                        <div className="py-6 md:py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-30">
                          <span className="text-2xl md:text-3xl mb-3">㊙</span>
                          <p className="mono text-[8px] font-black uppercase tracking-widest">Chưa có bí mật</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'} gap-4 md:gap-6`}>
                {[
                  {l: 'Độ trung thành', v: renderSafeText(selectedNpc.loyalty) || '??', c: 'text-pink-400'},
                  {l: 'Mức độ sủng ái', v: renderSafeText(selectedNpc.affinity) || 0, c: 'text-white'},
                  {l: 'Cảnh giới', v: toSentenceCase(selectedNpc.powerLevel || 'Ẩn số'), c: 'text-neutral-400'}
                ].map((item, i) => (
                  <div key={i} className={`p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] text-center ${isMobile && i === 2 ? 'col-span-2' : ''}`}>
                    <span className="block mono text-[7px] md:text-[8px] font-black text-neutral-600 uppercase mb-2 tracking-widest">{item.l}</span>
                    <span className={`text-xl md:text-2xl font-black ${item.c} mono`}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`${isMobile ? 'text-5xl' : 'text-[10rem]'} opacity-5 mb-4 select-none font-black italic text-pink-500`}>HAREM</div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black text-neutral-700 mono uppercase tracking-[0.5em]`}>Chọn một mỹ nhân</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
