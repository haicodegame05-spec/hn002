import React from 'react';
import { SubScenario } from '../../types';

interface Props {
  context: SubScenario;
  onSelect: (scenario: string | { id: string, label: string, description: string, icon: string }) => void;
  onBack: () => void;
  onMcSetup?: () => void;
  isFreeStyle?: boolean;
  onExport?: () => void;
  onImport?: () => void;
}

export const MobileScenarioSelect: React.FC<Props> = ({ context, onSelect, onBack, onMcSetup, isFreeStyle, onExport, onImport }) => {
  const [customInput, setCustomInput] = React.useState('');

  return (
    <div className="MobileScenarioSelect flex-grow flex flex-col p-2 pb-8 overflow-y-auto custom-scrollbar bg-black">
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
            <h2 className="text-base font-black text-white uppercase tracking-tighter italic">{isFreeStyle ? 'Kiến Tạo Thực Tại' : 'Chọn Thân Phận'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onImport && (
              <button 
                onClick={onImport}
                className="p-2 bg-blue-500/10 border border-dashed border-blue-500/40 rounded-xl text-blue-500 text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all"
                title="Nhập"
              >
                📥
              </button>
            )}
            {onExport && (
              <button 
                onClick={onExport}
                className="p-2 bg-amber-500/10 border border-dashed border-amber-500/40 rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all"
                title="Xuất"
              >
                📤
              </button>
            )}
            {onMcSetup && (
              <button 
                onClick={onMcSetup}
                className="p-2 bg-blue-500/10 border border-dashed border-blue-500/40 rounded-xl text-blue-500 text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all flex items-center gap-2"
              >
                <span>👤</span>
              </button>
            )}
            <button onClick={onBack} className="p-2 bg-white/5 border border-white/10 rounded-xl text-neutral-400 text-xs font-black uppercase tracking-widest active:scale-90 transition-all">
              ←
            </button>
          </div>
        </div>
        <p className="text-[10px] mono text-neutral-500 uppercase font-bold tracking-widest">{context.title} // {isFreeStyle ? 'Thiết lập bối cảnh' : 'Thiết lập nhân dạng'}</p>
        <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest mt-1 italic">Bỏ qua thiết lập nhân vật chính cũng được, AI dùng mặc định</p>
      </div>

      {isFreeStyle ? (
        <div className="space-y-4">
          <textarea 
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Nhập bối cảnh thế giới của bạn tại đây..."
            className="w-full h-48 p-4 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none transition-all resize-none"
          />
          <button 
            onClick={() => {
              if (!customInput.trim()) {
                alert("Vui lòng nhập bối cảnh!");
                return;
              }
              onSelect(customInput);
            }}
            className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg"
          >
            Bắt đầu kiến tạo ❯
          </button>
          
          <div className="grid grid-cols-1 gap-2 mt-4">
            <p className="text-[8px] text-neutral-500 uppercase font-black tracking-widest mb-1">Gợi ý bối cảnh:</p>
            {context.scenarios.map((sc, idx) => (
              <button 
                key={idx}
                onClick={() => setCustomInput(sc)}
                className="p-3 bg-white/5 border border-white/5 rounded-lg text-[10px] text-neutral-400 text-left italic"
              >
                {sc}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1">
          {context.scenarios.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(scenario)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 active:scale-[0.98] transition-all shadow-xl p-5 text-left"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{scenario}</h3>
                <span className="text-[16px] opacity-40 mono font-black text-amber-500">{idx + 1}</span>
              </div>
              
              <p className="text-[10px] text-neutral-300 leading-relaxed mb-4 italic">
                Khởi đầu cuộc hành trình với tư cách là {scenario} trong bối cảnh {context.title}.
              </p>
              
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-[9px] mono text-amber-500 font-black uppercase tracking-widest">Sẵn sàng</span>
                </div>
                <span className="text-[10px] mono text-white font-black uppercase tracking-widest bg-amber-500 px-3 py-1 rounded-lg text-black">Bắt đầu ❯</span>
              </div>
            </button>
          ))}

          <button
            onClick={() => onSelect({ id: 'custom', label: 'Tự chọn', description: 'Tự thiết lập thân phận của riêng bạn', icon: '✨' })}
            className="group relative overflow-hidden rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 active:scale-[0.98] transition-all p-5 text-center"
          >
            <span className="text-2xl mb-2 block">✨</span>
            <h3 className="text-sm font-black text-emerald-500 uppercase italic tracking-tight mb-1">Tự Chọn Thân Phận</h3>
            <p className="text-[10px] text-emerald-500/60 mono uppercase font-bold">Tùy chỉnh mọi thông số nhân vật</p>
          </button>
        </div>
      )}
      
      <button 
        onClick={onBack}
        className="mt-8 p-1 border border-white/10 bg-white/5 rounded-2xl text-neutral-400 mono text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
      >
        ← Quay Lại
      </button>
    </div>
  );
};
