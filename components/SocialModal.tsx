
import React, { useState } from 'react';
import { Player, Relationship, GameGenre, AppSettings } from '../types';
import { isFamilyMember } from '../constants/familyRoles';
import { renderSafeText, toSentenceCase } from './NpcProfileBase';
import { MobileSocialModal } from './Mobile/MobileSocialModal';

interface Props {
  player: Player;
  genre?: GameGenre;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: (npc: Relationship) => void;
  settings: AppSettings;
}

export const SocialModal: React.FC<Props> = ({ player, genre, isOpen, onClose, onOpenProfile, settings }) => {
  const isMobile = settings.mobileMode;
  const [selectedNpc, setSelectedNpc] = useState<Relationship | null>(null);

  if (isMobile && isOpen) {
    return (
      <MobileSocialModal 
        player={player}
        genre={genre}
        onClose={onClose}
        onOpenProfile={onOpenProfile}
        settings={settings}
      />
    );
  }

  if (!isOpen) return null;

  const socialList = (player.relationships || []).filter(r => {
    if (r.type === 'social') return true;
    if (r.type === 'family' || r.type === 'harem') return false; // Ưu tiên lựa chọn thủ công
    
    const isHarem = (r.affinity || 0) >= 600;
    const isRealBlood = isFamilyMember(renderSafeText(r.familyRole), genre);

    // Nếu là Harem hoặc Family thì không hiện ở Social
    if (isHarem || isRealBlood) return false;

    // Các trường hợp còn lại -> Hiện ở Social
    return true;
  });

  return (
    <div className="SocialModal fixed inset-0 z-[110] bg-neutral-950 flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
      <div className="flex justify-between items-center p-8 border-b border-white/5 bg-cyan-500/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
          <h2 className="text-xl font-black text-cyan-400 mono tracking-[0.4em] uppercase">[ SOCIAL_MATRIX_SCAN_ACTIVE ]</h2>
        </div>
        <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all rounded-xl border border-white/10 font-black uppercase text-xs">
          Thoát [ESC]
        </button>
      </div>

      <div className={`flex flex-grow overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'w-full h-1/3' : 'w-full md:w-[30rem]'} border-r border-white/5 bg-black/40 flex flex-col shrink-0`}>
          <div className={`${isMobile ? 'p-6' : 'p-10'} border-b border-white/5`}>
            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black text-cyan-400 uppercase tracking-tighter italic`}>Intelligence <span className="text-white">Network</span></h3>
            <p className="mono text-[10px] text-neutral-600 font-bold uppercase mt-2 tracking-[0.2em]">Cơ sở dữ liệu nhân sinh lục địa</p>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3">
            {socialList.length > 0 ? (
              socialList.map((rel, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedNpc(rel)} 
                  className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer border transition-all flex items-center gap-4 md:gap-5 group ${selectedNpc?.id === rel.id ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
                >
                  <div className={`w-12 md:w-16 aspect-[2/3] rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all ${selectedNpc?.id === rel.id ? 'border-cyan-500 scale-110 shadow-lg shadow-cyan-500/20' : 'border-white/5'}`}>
                    {rel.avatar ? (
                      <img src={rel.avatar} alt={renderSafeText(rel.name)} className="w-full h-full object-cover bg-neutral-900" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-cyan-500/20 text-xl md:text-2xl font-black">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm md:text-lg font-black text-white uppercase group-hover:text-cyan-400 transition-colors truncate">{renderSafeText(rel.name)}</div>
                    <div className="mono text-[8px] md:text-[10px] text-neutral-500 font-black uppercase mt-1 truncate">{toSentenceCase(rel.familyRole || rel.status)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`mono text-[10px] md:text-xs font-black ${rel.affinity > 0 ? 'text-cyan-400' : 'text-red-500'}`}>{renderSafeText(rel.affinity)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                <div className="text-5xl md:text-6xl mb-6">👤</div>
                <p className="mono text-[10px] md:text-xs font-black uppercase tracking-widest">Chưa thu thập được dữ liệu xã hội nào</p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-grow ${isMobile ? 'p-6' : 'p-12 md:p-20'} overflow-y-auto custom-scrollbar relative`}>
          {selectedNpc ? (
            <div className={`max-w-5xl mx-auto ${isMobile ? 'space-y-10' : 'space-y-16'} animate-in fade-in duration-500`}>
              <div className="absolute top-0 right-0 border-4 border-red-500/10 text-red-500/10 text-4xl md:text-6xl font-black uppercase -rotate-12 pointer-events-none select-none">
                High Priority Target
              </div>

              <div className={`flex flex-col ${isMobile ? '' : 'lg:flex-row'} gap-10 md:gap-16 items-start border-b border-white/5 ${isMobile ? 'pb-10' : 'pb-16'}`}>
                <div className={`flex-shrink-0 space-y-6 text-center ${isMobile ? 'w-full' : ''}`}>
                  <div className="flex justify-center">
                    <div className={`${isMobile ? 'w-48' : 'w-64'} aspect-[2/3] rounded-[2.5rem] md:rounded-[3.5rem] border-8 flex items-center justify-center shadow-2xl overflow-hidden ${selectedNpc.affinity > 0 ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      {selectedNpc.avatar ? (
                        <img src={selectedNpc.avatar} alt={renderSafeText(selectedNpc.name)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                          <span className="text-5xl md:text-7xl">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter leading-none`}>{renderSafeText(selectedNpc.name)}</h2>
                    <p className="text-neutral-500 mono text-xs md:text-sm font-black uppercase tracking-widest">{toSentenceCase(selectedNpc.status)}</p>
                    <button 
                      onClick={() => onOpenProfile?.(selectedNpc)}
                      className="mt-6 md:mt-8 w-full py-4 bg-cyan-500 text-black font-black uppercase text-[10px] md:text-xs rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3"
                    >
                      <span>📂</span> Xem hồ sơ
                    </button>
                  </div>
                </div>

                <div className="flex-grow space-y-8 md:space-y-10 pt-6">
                  <div className={`grid grid-cols-1 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'} gap-4 md:gap-8`}>
                    <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem]">
                      <span className="block mono text-[8px] md:text-[10px] font-black text-neutral-600 uppercase mb-4 tracking-widest">Vị trí cuối cùng</span>
                      <p className="text-lg md:text-2xl font-black text-cyan-400">{toSentenceCase(selectedNpc.lastLocation || 'Chưa rõ')}</p>
                    </div>
                    <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem]">
                      <span className="block mono text-[8px] md:text-[10px] font-black text-neutral-600 uppercase mb-4 tracking-widest">Tâm trạng</span>
                      <p className="text-lg md:text-2xl font-black text-white italic truncate">"{toSentenceCase(selectedNpc.mood || 'Khó đoán')}"</p>
                    </div>
                    <div className={`p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] ${isMobile ? 'col-span-2' : ''}`}>
                      <span className="block mono text-[8px] md:text-[10px] font-black text-neutral-600 uppercase mb-4 tracking-widest">Độ trung thành</span>
                      <p className={`text-lg md:text-2xl font-black mono ${selectedNpc.loyalty !== undefined ? 'text-amber-400' : 'text-neutral-700'}`}>
                        {selectedNpc.loyalty !== undefined ? `${selectedNpc.loyalty}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                      <span className="w-6 md:w-10 h-0.5 bg-cyan-500"></span> Hồ sơ Phân tích
                    </h4>
                    <div className={`p-6 md:p-10 bg-black/60 border border-white/5 rounded-[2rem] md:rounded-[3rem] relative`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                      <p className="text-sm md:text-xl text-neutral-400 font-medium leading-relaxed italic max-w-3xl">
                        {toSentenceCase(selectedNpc.impression, 'Đối tượng đang được giám sát chặt chẽ. Chưa có báo cáo cụ thể về các hành vi bất thường đối với chủ thể MC.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-10 pt-10`}>
                <div className="space-y-6 md:space-y-8">
                  <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Dữ liệu <span className="text-red-500">Bí mật</span></h4>
                  <div className="space-y-4">
                    {Array.isArray(selectedNpc.secrets) && selectedNpc.secrets.length > 0 ? selectedNpc.secrets.map((s, i) => (
                      <div key={i} className="p-4 md:p-6 bg-red-500/5 border border-red-500/20 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-6 group hover:bg-red-500/10 transition-all">
                        <span className="text-2xl md:text-3xl">🔒</span>
                        <span className="text-xs md:text-sm font-black text-red-400 tracking-tight uppercase leading-tight">{renderSafeText(s)}</span>
                      </div>
                    )) : (
                      <div className="py-12 md:py-20 border-2 border-dashed border-white/5 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center opacity-30">
                        <span className="text-4xl md:text-5xl mb-6">㊙</span>
                        <p className="mono text-[10px] md:text-xs font-black uppercase tracking-widest">Chưa thâm nhập được</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Quan hệ <span className="text-cyan-400">Đồng minh</span></h4>
                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center opacity-40 grayscale">
                    <div className="w-16 md:w-20 h-16 md:h-20 rounded-full border-4 border-cyan-500/20 mb-6 flex items-center justify-center text-3xl md:text-4xl">🔗</div>
                    <p className="mono text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">Chưa có dữ liệu mạng lưới</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`${isMobile ? 'text-6xl' : 'text-[12rem]'} opacity-5 mb-8 select-none font-black italic text-cyan-500`}>NETWORK</div>
              <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-black text-neutral-700 mono uppercase tracking-[0.5em]`}>Chọn một đối tượng</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
