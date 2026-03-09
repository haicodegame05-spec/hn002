
import React, { useState, useMemo } from 'react';
import { Player, CodexEntry, Relationship, getGenreMeta, GameGenre, IdentityType } from '../../types';
import { Globe, ScrollText, History as HistoryIcon, Users, Zap, Search, ChevronRight, Lock, Unlock, User, Heart, Shield, BookOpen, MapPin, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DEFAULT_AVATAR } from '../../constants';

interface MobileCodexModalProps {
  player: Player;
  genre?: GameGenre;
  onClose: () => void;
  markAsViewed: (id: string, type: 'codex' | 'npc') => void;
}

type TabType = 'destiny' | 'world' | 'locations' | 'history' | 'entities' | 'npcs';

export const MobileCodexModal: React.FC<MobileCodexModalProps> = ({ player, genre, onClose, markAsViewed }) => {
  const [activeTab, setActiveTab] = useState<TabType>('destiny');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const genreMeta = getGenreMeta(genre);
  const labels = genreMeta.codexLabels || {
    world: "Thế giới",
    locations: "Địa danh",
    history: "Biên niên sử",
    entities: "Kỳ trân",
    npcs: "Nhân vật"
  };

  const categories = [
    { id: 'destiny' as TabType, label: "Vận Mệnh", icon: Sparkles },
    { id: 'world' as TabType, label: labels.world, icon: Globe },
    { id: 'locations' as TabType, label: labels.locations, icon: MapPin },
    { id: 'history' as TabType, label: labels.history, icon: HistoryIcon },
    { id: 'entities' as TabType, label: labels.entities, icon: Zap },
    { id: 'npcs' as TabType, label: labels.npcs, icon: Users },
  ];

  const safeCodex = player.codex || [];
  const safeRelationships = player.relationships || [];

  const filteredItems = useMemo(() => {
    const query = (searchQuery || '').toLowerCase().trim();
    if (activeTab === 'npcs') {
      return safeRelationships
        .filter(npc => (npc.name || '').toLowerCase().includes(query))
        .map(npc => ({
          id: npc.id,
          title: npc.name || 'Vô danh',
          subtitle: (npc.affinity || 0) >= 600 ? 'Hậu cung' : 'Xã hội',
          type: 'npc' as const,
          viewed: npc.viewed ?? true,
          data: npc
        }));
    } else {
      return safeCodex
        .filter(entry => {
          if (activeTab === 'world') {
            return entry.category === 'world' || entry.category === 'rules';
          }
          return entry.category === activeTab;
        })
        .filter(entry => (entry.title || '').toLowerCase().includes(query) || (entry.content || '').toLowerCase().includes(query))
        .map(entry => ({
          id: entry.title || 'Không tiêu đề',
          title: entry.title || 'Không tiêu đề',
          subtitle: entry.unlocked ? 'Đã giải mã' : 'Bị khóa',
          type: 'codex' as const,
          viewed: entry.viewed ?? true,
          data: entry
        }));
    }
  }, [activeTab, searchQuery, safeCodex, safeRelationships]);

  const selectedItem = useMemo(() => {
    if (!selectedEntryId) return null;
    return filteredItems.find(item => item.id === selectedEntryId);
  }, [selectedEntryId, filteredItems]);

  return (
    <div className="MobileCodexModal fixed inset-0 z-[600] bg-black flex flex-col h-full overflow-hidden font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"></div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">CODEX_DATABASE</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 text-neutral-400 rounded-xl border border-white/10 active:scale-90 transition-all">✕</button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex overflow-x-auto bg-black/20 border-b border-white/5 shrink-0 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveTab(cat.id);
              setSelectedEntryId(null);
            }}
            className={`flex-1 min-w-[80px] py-1 flex flex-col items-center gap-1 transition-all relative ${activeTab === cat.id ? 'text-amber-500' : 'text-neutral-600'}`}
          >
            <cat.icon size={16} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{cat.label}</span>
            {activeTab === cat.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="p-1 border-b border-white/5 bg-black/20 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input 
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-y-auto custom-scrollbar relative">
        {selectedItem ? (
          <div className="p-1 pb-32 animate-in fade-in duration-300">
            <button 
              onClick={() => setSelectedEntryId(null)}
              className="mb-6 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest"
            >
              ❮ Quay lại danh sách
            </button>

            {selectedItem.type === 'codex' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] text-amber-500 font-black uppercase tracking-widest">
                    ARCHIVE_{activeTab.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  {selectedItem.title}
                </h1>
                <div className="markdown-body prose prose-invert max-w-none text-sm text-neutral-300 leading-relaxed font-serif italic">
                  <ReactMarkdown>{(selectedItem.data as CodexEntry).content || ''}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex gap-1 items-start">
                  <div className={`w-32 aspect-[3/4] rounded-2xl border-4 bg-neutral-900 overflow-hidden shrink-0 ${((selectedItem.data as Relationship).affinity || 0) >= 600 ? 'border-pink-500/20' : 'border-cyan-500/20'}`}>
                    {(selectedItem.data as Relationship).avatar ? (
                      <img src={(selectedItem.data as Relationship).avatar} className="w-full h-full object-cover" />
                    ) : (
                      <img src={DEFAULT_AVATAR} className="w-full h-full object-cover opacity-20" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedItem.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-black text-neutral-400 uppercase">{selectedItem.subtitle}</span>
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-black text-neutral-400 uppercase">{(selectedItem.data as Relationship).status}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Heart size={12} className="text-rose-500 fill-rose-500" />
                        <span className="mono text-[10px] font-black text-white">{(selectedItem.data as Relationship).affinity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-cyan-500" />
                        <span className="mono text-[10px] font-black text-white">{(selectedItem.data as Relationship).loyalty || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="mono text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Ấn tượng
                  </h4>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl italic text-sm text-neutral-300 leading-relaxed">
                    "{(selectedItem.data as Relationship).impression || 'Dữ liệu sơ cấp...'}"
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="mono text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={12} /> Vạn Giới Thân Phận
                  </h4>
                  <div className="space-y-2">
                    {(selectedItem.data as Relationship).identities?.map((sid, idx) => (
                      <div key={idx} className={`p-4 border rounded-2xl flex flex-col gap-1 transition-all ${sid.isRevealed ? 'bg-rose-500/5 border-rose-500/20' : 'bg-neutral-900 border-white/5 opacity-50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded border ${
                              sid.type === IdentityType.FANFIC ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' :
                              sid.type === IdentityType.DESTINY ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                              sid.type === IdentityType.LEGENDARY ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
                              'bg-white/5 border-white/10 text-white/40'
                            }`}>
                              {sid.type || IdentityType.NORMAL}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">Thân phận {(selectedItem.data as Relationship).identities!.length > 1 ? `#${idx + 1}` : ''}</span>
                          </div>
                          {sid.isRevealed ? <Unlock size={12} className="text-rose-500" /> : <Lock size={12} className="text-neutral-700" />}
                        </div>
                        {sid.isRevealed ? (
                          <>
                            <span className="text-xs font-black text-white uppercase tracking-tight">{sid.name}</span>
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">{sid.role}</span>
                            <p className="text-[10px] text-neutral-400 italic mt-1">{sid.description}</p>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">Dữ liệu bị ẩn</span>
                        )}
                      </div>
                    ))}
                    {Array.isArray((selectedItem.data as Relationship).secrets) && (selectedItem.data as Relationship).secrets!.length > 0 ? (
                      (selectedItem.data as Relationship).secrets!.map((s, i) => (
                        <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
                          <span className="text-sm">🗝️</span>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight leading-tight">{s}</span>
                        </div>
                      ))
                    ) : (
                      !(selectedItem.data as Relationship).identities?.length && (
                        <div className="py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-20">
                          <Lock size={24} className="mb-2" />
                          <p className="mono text-[8px] font-black uppercase tracking-widest">Chưa có bí mật</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="block text-[8px] text-neutral-600 font-black uppercase mb-1">Tuổi</span>
                    <span className="text-xs font-bold text-white">{(selectedItem.data as Relationship).age || '??'}</span>
                  </div>
                  <div className="p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="block text-[8px] text-neutral-600 font-black uppercase mb-1">Chủng tộc</span>
                    <span className="text-xs font-bold text-white">{(selectedItem.data as Relationship).race || 'Nhân loại'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-1 space-y-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={`${item.type}-${item.id}-${idx}`}
                  onClick={() => {
                    setSelectedEntryId(item.id);
                    markAsViewed(item.id, item.type);
                  }}
                  className="w-full text-left p-1 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 active:bg-amber-500/10 active:border-amber-500/40 transition-all relative"
                >
                  {!item.viewed && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]"></div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                    {item.type === 'npc' ? <User size={20} /> : <ScrollText size={20} />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-tight truncate text-neutral-300">{item.title}</h4>
                    <p className="text-[8px] mono font-bold text-neutral-600 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-700" />
                </button>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center">
                <Lock size={48} className="mb-4" />
                <p className="mono text-[10px] font-black uppercase tracking-widest">Dữ liệu bị khóa</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
