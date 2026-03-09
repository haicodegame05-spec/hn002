
import { InventoryItem } from '../../types';
import { InspectType } from './McInspector';

interface McInventoryPanelProps {
  inventory: InventoryItem[];
  onInspect: (data: { name: string; type: InspectType; description?: string }) => void;
  isEditing?: boolean;
  onUpdatePlayer?: (player: any) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const McInventoryPanel: React.FC<McInventoryPanelProps> = ({ 
  inventory, 
  onInspect, 
  isEditing, 
  onUpdatePlayer,
  isLocked,
  onToggleLock
}) => {
  const handleInventoryChange = (text: string) => {
    if (onUpdatePlayer) {
      const lines = text.split('\n').filter(s => s.trim());
      const newInventory = lines.map(line => {
        const [name, ...descParts] = line.split('|');
        return {
          name: name.trim(),
          description: descParts.join('|').trim() || "Vật thể mang năng lượng tích hợp. Có thể sử dụng để thay đổi trạng thái bản thân hoặc tương tác với các thực thể khác trong Matrix."
        };
      });
      onUpdatePlayer({ inventory: newInventory });
    }
  };

  return (
    <section className="p-3 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3 h-full shadow-xl mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">❯ TÚI ĐỒ / VẬT PHẨM</span>
        {onToggleLock && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className={`ml-1 transition-all ${isLocked ? 'text-amber-500' : 'text-neutral-700 hover:text-neutral-500'}`}
            title={isLocked ? "Đã khóa - AI không thể thay đổi" : "Chưa khóa - AI có thể thay đổi"}
          >
            {isLocked ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-1.5 overflow-y-auto max-h-[450px] custom-scrollbar pr-1">
        {isEditing ? (
          <textarea 
            value={inventory && inventory.length > 0 ? inventory.map(i => `${i?.name || 'Vô danh'} | ${i?.description || 'Chưa có mô tả.'}`).join('\n') : ''}
            onChange={(e) => handleInventoryChange(e.target.value)}
            className="w-full bg-black/40 text-[10px] p-2.5 border border-white/10 rounded-sm text-neutral-400 outline-none resize-none"
            rows={15}
            placeholder="Tên | Mô tả (Mỗi vật phẩm một dòng)"
          />
        ) : (
          inventory && inventory.length > 0 ? inventory.map((item, i) => (
            <button 
              key={i} 
              onClick={() => onInspect({ name: item.name, type: 'item', description: item.description })}
              className="text-left text-[10px] p-2.5 bg-white/[0.03] border border-white/10 rounded-sm text-neutral-400 flex items-center gap-3 group hover:text-white hover:border-emerald-500/30 hover:bg-white/5 transition-all"
            >
              <span className="text-emerald-500 opacity-40 shrink-0 group-hover:opacity-100 group-hover:rotate-12 transition-all">📦</span>
              <span className="font-bold uppercase tracking-tight truncate flex-grow leading-tight">{item.name}</span>
              <span className="text-[7px] font-black opacity-0 group-hover:opacity-100 transition-opacity">SCAN</span>
            </button>
          )) : <div className="py-10 text-center border border-dashed border-white/10 rounded-sm opacity-10 italic text-[9px] font-black uppercase">Buffer_Empty</div>
        )}
      </div>
    </section>
  );
};
