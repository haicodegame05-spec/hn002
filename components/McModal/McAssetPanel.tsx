
import { Asset } from '../../types';
import { InspectType } from './McInspector';

interface McAssetPanelProps {
  gold: number;
  assets: Asset[];
  currency: string;
  onInspect: (data: { name: string; type: InspectType; description?: string }) => void;
  isEditing?: boolean;
  onUpdatePlayer?: (player: any) => void;
  player?: any;
  onToggleLock?: (field: string) => void;
}

export const McAssetPanel: React.FC<McAssetPanelProps> = ({ gold, assets, currency, onInspect, isEditing, onUpdatePlayer, player, onToggleLock }) => {
  const handleGoldChange = (val: number) => {
    if (onUpdatePlayer) onUpdatePlayer({ gold: val });
  };

  const handleCurrencyChange = (val: string) => {
    if (onUpdatePlayer) onUpdatePlayer({ customCurrency: val });
  };

  const handleAssetsChange = (text: string) => {
    if (onUpdatePlayer) {
      const lines = text.split('\n').filter(s => s.trim());
      const newAssets = lines.map(line => {
        const [name, ...descParts] = line.split('|');
        return {
          name: name.trim(),
          description: descParts.join('|').trim() || "Thực thể sở hữu có giá trị kinh tế/vận mệnh cao. Đã được Quantum_Core xác thực tính chính danh và quyền kiểm soát tuyệt đối của chủ thể."
        };
      });
      onUpdatePlayer({ assets: newAssets });
    }
  };

  const isGoldLocked = player?.lockedFields?.includes('gold');
  const isCurrencyLocked = player?.lockedFields?.includes('customCurrency');
  const isAssetsLocked = player?.lockedFields?.includes('assets');

  const LockIcon = ({ isLocked, onClick, className = "" }: { isLocked: boolean, onClick?: () => void, className?: string }) => (
    <span 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onClick?.(); } }}
      className={`ml-1 transition-all hover:scale-110 active:scale-90 cursor-pointer inline-flex items-center justify-center ${isLocked ? 'text-amber-500' : 'text-neutral-700 hover:text-neutral-500'} ${className}`}
      title={isLocked ? "Đã khóa - AI không thể thay đổi" : "Chưa khóa - AI có thể thay đổi"}
      role="button"
      tabIndex={0}
    >
      {isLocked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
      )}
    </span>
  );

  return (
    <section className="p-3 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-sm space-y-3 h-full shadow-xl mono">
      <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
         <div className="flex items-center gap-1">
           <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">❯ TÀI SẢN</span>
           <LockIcon isLocked={isAssetsLocked} onClick={() => onToggleLock?.('assets')} />
         </div>
         <span className="text-[8px] text-emerald-700 font-bold uppercase mono italic bg-emerald-500/5 px-1.5 rounded-sm">SECURE_VAULT</span>
      </div>

      <div className="bg-black/60 p-3 rounded-sm border border-white/10 flex justify-between items-center group hover:border-yellow-500/40 transition-colors">
         <div className="flex flex-col">
           <div className="flex items-center gap-1">
             <span className="text-[10px] text-neutral-500 font-black uppercase tracking-tight">Tiền mặt</span>
             <LockIcon isLocked={isCurrencyLocked} onClick={() => onToggleLock?.('customCurrency')} />
           </div>
           {isEditing ? (
             <input 
               value={player?.customCurrency || currency}
               onChange={(e) => handleCurrencyChange(e.target.value)}
               className="bg-transparent text-[8px] text-yellow-500/60 font-black uppercase outline-none border-b border-yellow-500/10 w-20"
               placeholder="Đơn vị tiền"
             />
           ) : (
             <span className="text-[8px] text-yellow-500/60 font-black uppercase italic">({player?.customCurrency || currency})</span>
           )}
         </div>
         <div className="flex items-center gap-2">
           {isEditing ? (
             <input 
               type="number"
               value={gold}
               onChange={(e) => handleGoldChange(parseInt(e.target.value) || 0)}
               className="bg-transparent text-2xl font-black text-yellow-500 tabular-nums italic outline-none border-b border-yellow-500/20 w-32 text-right"
             />
           ) : (
             <span className="text-2xl font-black text-yellow-500 tabular-nums italic leading-none group-hover:scale-105 transition-transform">{gold.toLocaleString()}</span>
           )}
           <LockIcon isLocked={isGoldLocked} onClick={() => onToggleLock?.('gold')} />
         </div>
      </div>

      <div className="space-y-1.5 flex-grow">
         <span className="text-[8px] text-neutral-600 font-black uppercase px-1 italic">Sở hữu hữu hình (Nhấn để xem):</span>
         <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {isEditing ? (
              <textarea 
                value={assets && assets.length > 0 ? assets.map(a => `${a.name} | ${a.description}`).join('\n') : ''}
                onChange={(e) => handleAssetsChange(e.target.value)}
                className="w-full bg-black/40 text-[10px] p-2.5 border border-emerald-500/20 rounded-sm text-emerald-400 outline-none resize-none"
                rows={10}
                placeholder="Tên | Mô tả (Mỗi tài sản một dòng)"
              />
            ) : (
              assets && assets.length > 0 ? assets.map((asset, i) => (
                <button 
                  key={i} 
                  onClick={() => onInspect({ name: asset.name, type: 'asset', description: asset.description })}
                  className="text-left text-[10px] p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-sm text-emerald-400 flex items-center gap-3 group hover:bg-emerald-500/10 hover:border-emerald-500 transition-all"
                >
                   <span className="shrink-0 text-emerald-500 group-hover:scale-110 transition-transform">🏛️</span>
                   <span className="font-black uppercase tracking-tight truncate flex-grow">{asset.name}</span>
                   <span className="text-[8px] opacity-0 group-hover:opacity-40 transition-opacity">SCAN❯</span>
                </button>
              )) : (
                 <div className="py-10 text-center border border-dashed border-white/10 rounded-sm opacity-10 italic">
                    <p className="text-[8px] font-black uppercase tracking-tighter">No_Holdings_In_Matrix</p>
                 </div>
              )
            )}
         </div>
      </div>
    </section>
  );
};
