
import React, { useState } from 'react';
import { Player, Relationship, GameGenre, AppSettings } from '../types';
import { renderSafeText, toSentenceCase } from './NpcProfileBase';
import { isFamilyMember } from '../constants/familyRoles';
import { MobileFamilyModal } from './Mobile/MobileFamilyModal';

interface Props {
  player: Player;
  genre?: GameGenre;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: (npc: Relationship) => void;
  settings: AppSettings;
}

export const FamilyModal: React.FC<Props> = ({ player, genre, isOpen, onClose, onOpenProfile, settings }) => {
  const isMobile = settings.mobileMode;
  const [selectedNpc, setSelectedNpc] = useState<Relationship | null>(null);

  if (isMobile && isOpen) {
    return (
      <MobileFamilyModal 
        player={player}
        genre={genre}
        onClose={onClose}
        onOpenProfile={onOpenProfile}
        settings={settings}
      />
    );
  }

  if (!isOpen) return null;

  const familyList = (player.relationships || []).filter(r => {
    if (r.type === 'family') return true;
    if (r.type === 'harem' || r.type === 'social') return false; // Ưu tiên lựa chọn thủ công
    if (!r.familyRole) return false;
    return isFamilyMember(renderSafeText(r.familyRole), genre);
  });

  return (
    <div className="FamilyModal fixed inset-0 z-[110] bg-neutral-950 flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-orange-500/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
          <h2 className="text-sm font-black text-orange-400 mono tracking-[0.4em] uppercase">[ FAMILY_LINEAGE_SYNC_ACTIVE ]</h2>
        </div>
        <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all rounded-xl border border-white/10 font-black uppercase text-[10px]">
          Thoát [ESC]
        </button>
      </div>

      <div className={`flex flex-grow overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'w-full h-1/3' : 'w-full md:w-[26rem]'} border-r border-white/5 bg-black/40 flex flex-col shrink-0`}>
          <div className={`${isMobile ? 'p-4' : 'p-8'} border-b border-white/5`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black text-orange-500 uppercase tracking-tighter italic`}>Gia Tộc <span className="text-white">Phả Hệ</span></h3>
            <p className="mono text-[9px] text-neutral-600 font-bold uppercase mt-1 tracking-[0.2em]">Dữ liệu những người cùng huyết thống</p>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-5 space-y-3">
            {familyList.length > 0 ? (
              familyList.map((rel, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedNpc(rel)} 
                  className={`p-3 md:p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 group ${selectedNpc?.id === rel.id ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
                >
                  <div className={`w-12 md:w-16 aspect-[2/3] rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all ${selectedNpc?.id === rel.id ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20' : 'border-white/5'}`}>
                    {rel.avatar ? (
                      <img src={rel.avatar} alt={renderSafeText(rel.name)} className="w-full h-full object-cover bg-neutral-900" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-orange-500/20 text-xl md:text-2xl font-black italic">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-xs md:text-sm font-black text-white uppercase group-hover:text-orange-400 transition-colors truncate">{renderSafeText(rel.name)}</div>
                    <div className="mono text-[7px] md:text-[8px] text-orange-500/60 font-black uppercase tracking-widest mt-0.5">{renderSafeText(rel.familyRole)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-orange-500 text-[9px] md:text-[10px] font-black mono">{renderSafeText(rel.affinity)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                <div className="text-5xl mb-4">🏠</div>
                <p className="mono text-[10px] font-black uppercase tracking-widest">Không có dữ liệu huyết thống</p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-grow ${isMobile ? 'p-4' : 'p-10 md:p-20'} overflow-y-auto custom-scrollbar relative`}>
          {selectedNpc ? (
            <div className={`max-w-4xl mx-auto ${isMobile ? 'space-y-6' : 'space-y-12'} animate-in fade-in slide-in-from-right-10 duration-500`}>
              <div className={`flex flex-col ${isMobile ? '' : 'lg:flex-row'} gap-6 md:gap-12 items-start`}>
                <div className={`flex-shrink-0 space-y-4 md:space-y-6 text-center group ${isMobile ? 'w-full' : ''}`}>
                  <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className={`relative ${isMobile ? 'w-48' : 'w-64'} aspect-[2/3] rounded-[2rem] md:rounded-[3rem] border-4 border-orange-500/20 bg-neutral-900 flex items-center justify-center shadow-2xl overflow-hidden`}>
                       {selectedNpc.avatar ? (
                         <img src={selectedNpc.avatar} alt={renderSafeText(selectedNpc.name)} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-orange-500/10">
                           <span className="text-4xl md:text-6xl font-black italic">?</span>
                           <span className="text-[8px] md:text-[10px] mono font-black uppercase tracking-widest mt-4">NO_PORTRAIT</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black text-white uppercase tracking-tighter leading-none`}>{renderSafeText(selectedNpc.name)}</h2>
                    <p className="text-orange-400 mono text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">{renderSafeText(selectedNpc.familyRole)}</p>
                    
                    <button 
                      onClick={() => onOpenProfile?.(selectedNpc)}
                      className="mt-4 md:mt-6 w-full py-3 bg-orange-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
                    >
                      <span>📂</span> Chi tiết Hồ sơ
                    </button>
                  </div>
                </div>

                <div className={`flex-grow grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4 md:gap-6 pt-4`}>
                  <div className={`${isMobile ? 'p-6' : 'p-8'} bg-black/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    <span className="block mono text-[8px] md:text-[9px] font-black text-neutral-600 uppercase mb-4 tracking-[0.2em]">Tâm lý đối với chủ thể</span>
                    <p className="text-xs md:text-sm text-neutral-200 italic font-medium leading-relaxed mono uppercase tracking-tight">
                      "{toSentenceCase(selectedNpc.impression, 'Người thân máu mủ, đang theo dõi sự trưởng thành của bạn.')}"
                    </p>
                  </div>
                  <div className={`${isMobile ? 'p-6' : 'p-8'} bg-black/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem]`}>
                    <span className="block mono text-[8px] md:text-[9px] font-black text-neutral-600 uppercase mb-6 tracking-[0.2em]">Bí mật gia đình</span>
                    <div className="space-y-3">
                      {Array.isArray(selectedNpc.secrets) && selectedNpc.secrets.length > 0 ? selectedNpc.secrets.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                          <span className="text-lg md:text-xl">🔒</span>
                          <span className="text-[10px] md:text-[11px] text-orange-400 font-bold uppercase tracking-tight">{renderSafeText(s)}</span>
                        </div>
                      )) : (
                        <div className="py-6 md:py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-30">
                          <span className="text-2xl md:text-3xl mb-3">㊙</span>
                          <p className="mono text-[8px] font-black uppercase tracking-widest">Không có bí mật</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'} gap-4 md:gap-6`}>
                {[
                  {l: 'Thiện cảm huyết thống', v: renderSafeText(selectedNpc.affinity) || 0, c: 'text-orange-400'},
                  {l: 'Vị thế gia tộc', v: toSentenceCase(selectedNpc.powerLevel || 'Thành viên'), c: 'text-white'},
                  {l: 'Tình trạng', v: toSentenceCase(selectedNpc.status || 'Khỏe mạnh'), c: 'text-neutral-400'}
                ].map((item, i) => (
                  <div key={i} className={`p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] text-center ${isMobile && i === 2 ? 'col-span-2' : ''}`}>
                    <span className="block mono text-[7px] md:text-[8px] font-black text-neutral-600 uppercase mb-2 tracking-widest">{item.l}</span>
                    <span className={`text-xl md:text-2xl font-black ${item.c} mono uppercase`}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`${isMobile ? 'text-5xl' : 'text-[10rem]'} opacity-5 mb-4 select-none font-black italic text-orange-500`}>FAMILY</div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black text-neutral-700 mono uppercase tracking-[0.5em]`}>Chọn một người thân</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
