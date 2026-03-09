
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Clock, Infinity as InfinityIcon, Save } from 'lucide-react';
import { Player, AppSettings } from '../types';
import { MobileAiHintModal } from './Mobile/MobileAiHintModal';

interface AiHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUpdatePlayer: (player: Player) => void;
  settings: AppSettings;
}

export const AiHintModal: React.FC<AiHintModalProps> = ({ isOpen, onClose, player, onUpdatePlayer, settings }) => {
  if (settings.mobileMode && isOpen) {
    return <MobileAiHintModal onClose={onClose} player={player} onUpdatePlayer={onUpdatePlayer} />;
  }

  const [activeTab, setActiveTab] = useState<'oneTurn' | 'permanent'>('oneTurn');
  const [oneTurnHint, setOneTurnHint] = useState(player.aiHints?.oneTurn || '');
  const [permanentHint, setPermanentHint] = useState(player.aiHints?.permanent || '');
  const [longResponse, setLongResponse] = useState(player.aiHints?.longResponse || false);
  const [customHints, setCustomHints] = useState<{ id: string; text: string; enabled: boolean }[]>(player.aiHints?.customHints || []);
  const [newHintText, setNewHintText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOneTurnHint(player.aiHints?.oneTurn || '');
      setPermanentHint(player.aiHints?.permanent || '');
      setLongResponse(player.aiHints?.longResponse || false);
      setCustomHints(player.aiHints?.customHints || []);
    }
  }, [isOpen, player.aiHints]);

  const handleSave = () => {
    onUpdatePlayer({
      ...player,
      aiHints: {
        oneTurn: oneTurnHint,
        permanent: permanentHint,
        longResponse: longResponse,
        customHints: customHints
      }
    });
    onClose();
  };

  const addCustomHint = () => {
    if (!newHintText.trim()) return;
    const newHint = {
      id: Date.now().toString(),
      text: newHintText.trim(),
      enabled: true
    };
    setCustomHints([...customHints, newHint]);
    setNewHintText('');
  };

  const toggleCustomHint = (id: string) => {
    setCustomHints(customHints.map(h => h.id === id ? { ...h, enabled: !h.enabled } : h));
  };

  const removeCustomHint = (id: string) => {
    setCustomHints(customHints.filter(h => h.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="AiHintModal relative w-[99vw] h-[99vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-white leading-none">Nhắc AI</h2>
                  <p className="text-[10px] mono text-neutral-500 font-bold uppercase tracking-widest mt-1">Gợi ý hướng đi cho thực tại</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-black/40">
              <button
                onClick={() => setActiveTab('oneTurn')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'oneTurn' ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">1 Lượt</span>
                {activeTab === 'oneTurn' && <motion.div layoutId="hintTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />}
              </button>
              <button
                onClick={() => setActiveTab('permanent')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'permanent' ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <InfinityIcon className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Vĩnh Viễn</span>
                {activeTab === 'permanent' && <motion.div layoutId="hintTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow overflow-y-auto">
              {activeTab === 'oneTurn' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-300/80 leading-relaxed italic">
                      "MỆNH LỆNH TỐI CAO: Chỉ thị này sẽ được AI ưu tiên thực hiện tuyệt đối trong 1 lượt kế tiếp. Sau đó sẽ tự động xóa bỏ."
                    </p>
                  </div>
                  <textarea
                    value={oneTurnHint}
                    onChange={(e) => setOneTurnHint(e.target.value)}
                    placeholder="Ví dụ: Hãy để NPC A tỏ ra ghen tuông, hoặc mô tả chi tiết cảnh chiến đấu này..."
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-700 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none custom-scrollbar"
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
                    <p className="text-xs text-amber-300/80 leading-relaxed italic">
                      "CHỈ THỊ VĨNH VIỄN: AI sẽ luôn tuân thủ mệnh lệnh này trong mọi lượt chơi cho đến khi bạn thay đổi hoặc xóa nó."
                    </p>
                    
                    <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Siêu Trường Văn (2000+ từ)</span>
                        <span className="text-[8px] text-neutral-500 font-bold">Bắt buộc AI viết lời dẫn ít nhất 2000 từ mỗi lượt</span>
                      </div>
                      <button 
                        onClick={() => setLongResponse(!longResponse)}
                        className={`w-10 h-5 rounded-full transition-all relative ${longResponse ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-neutral-800'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${longResponse ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Custom Hints List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Danh sách chỉ thị</h3>
                      <span className="text-[8px] text-neutral-500 mono uppercase">{customHints.length} mục</span>
                    </div>

                    <div className="space-y-2">
                      {customHints.map(hint => (
                        <div key={hint.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4 group">
                          <div className="flex-grow">
                            <p className={`text-xs transition-all ${hint.enabled ? 'text-white' : 'text-neutral-600 line-through'}`}>{hint.text}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleCustomHint(hint.id)}
                              className={`w-10 h-5 rounded-full transition-all relative ${hint.enabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-neutral-800'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${hint.enabled ? 'left-6' : 'left-1'}`} />
                            </button>
                            <button 
                              onClick={() => removeCustomHint(hint.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-neutral-600 hover:text-rose-500 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newHintText}
                        onChange={(e) => setNewHintText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustomHint()}
                        placeholder="Thêm chỉ thị mới..."
                        className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-700 focus:border-indigo-500/50 outline-none transition-all"
                      />
                      <button 
                        onClick={addCustomHint}
                        className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-400 transition-all active:scale-95"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Ghi chú bổ sung</h3>
                    <textarea
                      value={permanentHint}
                      onChange={(e) => setPermanentHint(e.target.value)}
                      placeholder="Ví dụ: Luôn mô tả MC với phong thái lạnh lùng, hoặc ưu tiên các tình tiết lãng mạn..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-none custom-scrollbar"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/60 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-neutral-400 text-xs font-black uppercase hover:bg-white/5 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95"
              >
                <Save className="w-4 h-4" />
                Lưu Chỉ Thị
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
