
import React, { useState, useMemo } from 'react';
import { GameArchetype, GameGenre, InitialChoice } from '../../types';
import { GAME_ARCHETYPES } from '../../constants';
import { CUSTOM_URBAN_NORMAL } from '../../dataCustomUrbanNormal';
import { CUSTOM_URBAN_SUPER } from '../../dataCustomUrbanSuper';
import { CUSTOM_CULTIVATION } from '../../dataCustomCultivation';
import { CUSTOM_WUXIA } from '../../dataCustomWuxia';
import { CUSTOM_FANTASY_HUMAN } from '../../dataCustomFantasyHuman';
import { CUSTOM_FANTASY_MULTI } from '../../dataCustomFantasyMulti';
import { SYSTEMS_DATA } from '../../dataSystems';
import { ABILITIES_DATA } from '../../dataAbilities';
import { GENRE_ABILITIES } from '../../dataAbilitiesGenre';

interface MobileCustomIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorld: GameArchetype | null;
  onSelectIdentity: (identity: string | InitialChoice, systemName?: string) => void;
  onSwitchWorld: (world: GameArchetype) => void;
  onMcSetup?: () => void;
}

const SPECIAL_SUGGESTIONS: Record<string, { title: string, tag: string, color: string, desc?: string }[]> = {
  [GameGenre.URBAN_NORMAL]: CUSTOM_URBAN_NORMAL,
  [GameGenre.URBAN_SUPERNATURAL]: CUSTOM_URBAN_SUPER,
  [GameGenre.CULTIVATION]: CUSTOM_CULTIVATION,
  [GameGenre.WUXIA]: CUSTOM_WUXIA,
  [GameGenre.FANTASY_HUMAN]: CUSTOM_FANTASY_HUMAN,
  [GameGenre.FANTASY_MULTIRACE]: CUSTOM_FANTASY_MULTI
};

export const MobileCustomIdentityModal: React.FC<MobileCustomIdentityModalProps> = ({ 
  isOpen, onClose, selectedWorld, onSelectIdentity, onSwitchWorld, onMcSetup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [activeSystem, setActiveSystem] = useState('');
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'system' | 'ability'>('identity');

  const identityList = useMemo(() => (selectedWorld ? SPECIAL_SUGGESTIONS[selectedWorld.genre] || [] : []), [selectedWorld]);
  const systemList = SYSTEMS_DATA;
  const abilityList = useMemo(() => (selectedWorld ? GENRE_ABILITIES[selectedWorld.genre] || ABILITIES_DATA : ABILITIES_DATA), [selectedWorld]);

  const filterItems = (list: any[]) => list.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tag && item.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen || !selectedWorld) return null;

  const handleAddItem = (item: any, type: 'identity' | 'system' | 'ability') => {
    const prefix = type === 'identity' ? 'Thân phận: ' : type === 'system' ? 'Sở hữu ' : 'Dị năng: ';
    if (type === 'system') setActiveSystem(item.title);
    if (!customValue.includes(item.title)) {
      setCustomValue(prev => prev + (prev.length > 0 ? ' ' : '') + prefix + item.title + '.');
    }
  };

  const handleGenreSwitch = (world: GameArchetype) => {
    onSwitchWorld(world);
    setIsGenreMenuOpen(false);
  };

  return (
    <div className="MobileCustomIdentityModal fixed inset-0 z-[400] bg-[#030303] flex flex-col h-full overflow-hidden font-sans animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="p-3 border-b border-white/10 bg-black/80 backdrop-blur-3xl flex items-center justify-between shrink-0 relative z-30">
        <button onClick={onClose} className="p-2.5 bg-white/5 text-neutral-400 rounded-xl border border-white/10 active:scale-90 transition-all">
          <span className="text-lg">←</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-black text-white uppercase italic tracking-tighter leading-none mb-1">KIẾN TẠO THỰC TẠI</h2>
          <span className="text-[8px] mono text-emerald-500/50 font-black uppercase tracking-widest">Quantum_Sync_Ready</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-[9px] font-black uppercase active:scale-90 ${isGenreMenuOpen ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
          >
            {selectedWorld.genre}
          </button>
          {isGenreMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-2 bg-black/40 border-b border-white/5">
                <span className="text-[7px] mono text-neutral-600 font-black uppercase tracking-widest italic">Chuyển dịch không gian...</span>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {GAME_ARCHETYPES.map((world) => (
                  <button
                    key={world.id}
                    onClick={() => handleGenreSwitch(world)}
                    className={`w-full text-left p-3 text-[10px] font-black uppercase border-b border-white/5 last:border-none transition-colors ${selectedWorld.id === world.id ? 'bg-emerald-500 text-black' : 'text-neutral-400 active:bg-white/5'}`}
                  >
                    {world.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH & EDITOR */}
      <div className="p-2 bg-black/40 border-b border-white/5 space-y-2 shrink-0">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lọc dữ liệu thành phần..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[10px] text-white font-bold uppercase tracking-widest outline-none focus:border-emerald-500/50 transition-all"
          />
          <div className="absolute inset-y-0 left-4 flex items-center text-neutral-600 text-xs">🔍</div>
        </div>

        <div className="relative bg-neutral-900/60 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-inner">
          <textarea 
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Chọn 'Nguyên liệu' từ các danh sách bên dưới hoặc tự nhập tại đây..."
            className="w-full h-28 bg-transparent border-none outline-none p-4 text-white font-bold text-sm leading-relaxed resize-none mono custom-scrollbar"
          />
          <div className="px-3 py-2 bg-black/40 flex justify-between items-center border-t border-white/5">
            <button onClick={() => setCustomValue('')} className="text-[9px] font-black uppercase text-rose-500/50 active:text-rose-500 transition-colors italic">Xóa bộ đệm</button>
            <div className="flex flex-col items-end">
              <p className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest italic text-right mb-0.5">Dữ liệu nạp: {customValue.length} byte</p>
              {activeSystem && <span className="text-[7px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-sm font-black mono uppercase">Hệ Thống: {activeSystem}</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            disabled={!customValue.trim()}
            onClick={() => onSelectIdentity(customValue.trim())}
            className="flex-grow py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.2)] disabled:opacity-10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>KHỞI CHẠY THỰC TẠI</span>
            <span className="text-lg">❯❯</span>
          </button>
          {onMcSetup && (
            <button 
              onClick={onMcSetup}
              className="w-14 bg-blue-500/10 border border-dashed border-blue-500/40 rounded-xl text-blue-500 flex items-center justify-center active:scale-95 transition-all shadow-lg"
            >
              <span className="text-xl">👤</span>
            </button>
          )}
        </div>
      </div>


      {/* TAB NAVIGATION */}
      <div className="flex bg-black/60 border-b border-white/10 shrink-0">
        {[
          { id: 'identity', label: 'Thân Phận', icon: '👤' },
          { id: 'system', label: 'Hệ Thống', icon: '💎' },
          { id: 'ability', label: 'Dị Năng', icon: '🧿' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative ${activeTab === tab.id ? 'text-emerald-500' : 'text-neutral-500'}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
          </button>
        ))}
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {activeTab === 'identity' && (
          filterItems(identityList).length > 0 ? filterItems(identityList).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAddItem(item, 'identity')}
              className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left active:bg-blue-500/10 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-black uppercase ${item.color}`}>{item.title}</span>
                <span className="text-[7px] mono font-bold text-neutral-700 uppercase bg-white/5 px-1.5 py-0.5 rounded">#{item.tag}</span>
              </div>
              {item.desc && <p className="text-[9px] text-neutral-600 italic line-clamp-1">{item.desc}</p>}
            </button>
          )) : (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
              <span className="text-4xl mb-4">👤</span>
              <p className="text-[10px] mono font-black uppercase tracking-widest">Không có dữ liệu thân phận cho thể loại này</p>
              <p className="text-[8px] mt-2 text-center px-8">Bạn có thể tự nhập thân phận mong muốn vào ô văn bản phía trên</p>
            </div>
          )
        )}

        {activeTab === 'system' && filterItems(systemList).map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleAddItem(item, 'system')}
            className={`w-full p-4 border rounded-xl text-left transition-all ${activeSystem === item.title ? 'bg-yellow-500/10 border-yellow-500' : 'bg-white/[0.02] border-white/5 active:bg-yellow-500/10'}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-black uppercase ${item.color}`}>{item.title}</span>
              <span className="text-[7px] mono font-bold text-neutral-700 uppercase bg-white/5 px-1.5 py-0.5 rounded">#{item.tag}</span>
            </div>
            {item.desc && <p className="text-[9px] text-neutral-500 font-bold leading-tight line-clamp-2">{item.desc}</p>}
          </button>
        ))}

        {activeTab === 'ability' && filterItems(abilityList).map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleAddItem(item, 'ability')}
            className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left active:bg-purple-500/10 transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-black uppercase ${item.color}`}>{item.title}</span>
              <span className="text-[7px] mono font-bold text-neutral-700 uppercase bg-white/5 px-1.5 py-0.5 rounded">#{item.tag}</span>
            </div>
            {item.desc && <p className="text-[9px] text-neutral-500 font-bold leading-tight line-clamp-2">{item.desc}</p>}
          </button>
        ))}
      </div>
    </div>
  );
};
