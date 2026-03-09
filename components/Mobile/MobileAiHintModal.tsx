
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../../types';
import { X, Sparkles, Clock, Infinity as InfinityIcon, Save } from 'lucide-react';

interface MobileAiHintModalProps {
  onClose: () => void;
  player: Player;
  onUpdatePlayer: (player: Player) => void;
}

export const MobileAiHintModal: React.FC<MobileAiHintModalProps> = ({ onClose, player, onUpdatePlayer }) => {
  const [activeTab, setActiveTab] = useState<'oneTurn' | 'permanent'>('oneTurn');
  const [oneTurnHint, setOneTurnHint] = useState(player.aiHints?.oneTurn || '');
  const [permanentHint, setPermanentHint] = useState(player.aiHints?.permanent || '');
  const [longResponse, setLongResponse] = useState(player.aiHints?.longResponse || false);
  const [customHints, setCustomHints] = useState<{ id: string; text: string; enabled: boolean }[]>(player.aiHints?.customHints || []);
  const [newHintText, setNewHintText] = useState('');

  useEffect(() => {
    setOneTurnHint(player.aiHints?.oneTurn || '');
    setPermanentHint(player.aiHints?.permanent || '');
    setLongResponse(player.aiHints?.longResponse || false);
    setCustomHints(player.aiHints?.customHints || []);
  }, [player.aiHints]);

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="MobileAiHintModal fixed inset-0 z-[600] bg-[#0a0a0a] flex flex-col h-full overflow-hidden font-sans"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider leading-none">Nhắc AI</h2>
            <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Gợi ý hướng đi cho thực tại</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center bg-white/5 text-neutral-400 rounded-xl border border-white/10 active:scale-90 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-white/5 bg-black/40 shrink-0">
        <button
          onClick={() => setActiveTab('oneTurn')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'oneTurn' ? 'text-indigo-400' : 'text-neutral-500'}`}
        >
          <Clock size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">1 Lượt</span>
          {activeTab === 'oneTurn' && (
            <motion.div 
              layoutId="mobileHintTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" 
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('permanent')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'permanent' ? 'text-indigo-400' : 'text-neutral-500'}`}
        >
          <InfinityIcon size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Vĩnh Viễn</span>
          {activeTab === 'permanent' && (
            <motion.div 
              layoutId="mobileHintTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" 
            />
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {activeTab === 'oneTurn' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <p className="text-[10px] text-indigo-300/80 italic leading-relaxed">
                "MỆNH LỆNH TỐI CAO: Chỉ thị này sẽ được AI ưu tiên thực hiện tuyệt đối trong 1 lượt kế tiếp. Sau đó sẽ tự động xóa bỏ."
              </p>
            </div>
            <textarea
              value={oneTurnHint}
              onChange={(e) => setOneTurnHint(e.target.value)}
              placeholder="Ví dụ: Hãy để NPC A tỏ ra ghen tuông, hoặc mô tả chi tiết cảnh chiến đấu này..."
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-700 focus:border-indigo-500/50 outline-none transition-all resize-none"
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
              <p className="text-[10px] text-amber-300/80 italic leading-relaxed">
                "CHỈ THỊ VĨNH VIỄN: AI sẽ luôn tuân thủ mệnh lệnh này trong mọi lượt chơi."
              </p>
              
              <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-tight">Siêu Trường Văn (2000+ từ)</span>
                  <span className="text-[8px] text-neutral-500 font-bold">Bắt buộc AI viết ít nhất 2000 từ</span>
                </div>
                <button 
                  onClick={() => setLongResponse(!longResponse)}
                  className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${longResponse ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-neutral-800'}`}
                >
                  <motion.div 
                    animate={{ x: longResponse ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm"
                  />
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
                  <div key={hint.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex-grow overflow-hidden">
                      <p className={`text-xs transition-all truncate ${hint.enabled ? 'text-white' : 'text-neutral-600 line-through'}`}>{hint.text}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => toggleCustomHint(hint.id)}
                        className={`w-10 h-5 rounded-full transition-all relative ${hint.enabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-neutral-800'}`}
                      >
                        <motion.div 
                          animate={{ x: hint.enabled ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm"
                        />
                      </button>
                      <button 
                        onClick={() => removeCustomHint(hint.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 active:scale-90 transition-all"
                      >
                        <X size={14} />
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
                  placeholder="Thêm chỉ thị mới..."
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-700 focus:border-indigo-500/50 outline-none transition-all"
                />
                <button 
                  onClick={addCustomHint}
                  className="px-4 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
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
                placeholder="Ví dụ: Luôn mô tả MC với phong thái lạnh lùng..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-700 focus:border-amber-500/50 outline-none transition-all resize-none custom-scrollbar"
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-black/60 border-t border-white/10 shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <Save size={16} /> Lưu Chỉ Thị
        </button>
      </div>
    </motion.div>
  );
};
