
import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Relationship, getGenreMeta, GameGenre, Player, IdentityType, FamilyLink } from '../types';

export const PLACEHOLDERS = ['??', '[Bị khóa]', '[Chưa tiết lộ]', '[Ẩn]', '[Cần khám phá]', '[Yêu cầu cấp độ X]', 'N/A', 'Chưa rõ', 'Unknown'];

export const isPlaceholder = (data: any): boolean => {
  if (typeof data !== 'string') return false;
  const trimmed = data.trim();
  return PLACEHOLDERS.includes(trimmed) || trimmed.includes('??') || (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

export const renderSafeText = (data: any, fallback: string = '---'): string => {
  if (data === undefined || data === null || data === '') return fallback;
  if (isPlaceholder(data)) return data; // Keep placeholder as is for special rendering
  if (typeof data === 'string') return data;
  if (typeof data === 'number') return String(data);
  if (Array.isArray(data)) return data.length > 0 ? data.map(i => renderSafeText(i)).join(', ') : fallback;
  if (typeof data === 'object') return data.text || data.description || data.value || data.name || JSON.stringify(data);
  return String(data);
};

export const toSentenceCase = (text: any, fallback: string = ''): string => {
  const str = renderSafeText(text, fallback);
  if (!str || str === fallback) return fallback;
  let sentence = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return sentence.replace(/\bmc\b/gi, 'MC');
};

/**
 * Component hiển thị dữ liệu có sự thay đổi (Diff)
 */
export const DiffValue: React.FC<{ 
  fieldKey: string, 
  current: any, 
  lastChanges?: Record<string, {old: any, new: any}>,
  color?: string,
  className?: string
}> = ({ fieldKey, current, lastChanges, color = "text-white", className = "" }) => {
  const change = lastChanges?.[fieldKey];
  const safeCurrent = renderSafeText(current);
  const isLocked = isPlaceholder(safeCurrent);

  if (change && renderSafeText(change.old) !== renderSafeText(change.new)) {
    const isNewLocked = isPlaceholder(change.new);
    return (
      <span className={`flex flex-col items-end animate-in fade-in duration-500 ${className}`}>
        <span className="text-[9px] text-rose-500/50 line-through leading-none decoration-rose-500/40">{renderSafeText(change.old)}</span>
        <span className={`text-xs font-black ${isNewLocked ? 'text-neutral-600 italic' : color} leading-tight flex items-center gap-1`}>
          {isNewLocked && <Lock className="w-2 h-2" />}
          ❯ {renderSafeText(change.new)}
        </span>
      </span>
    );
  }

  return (
    <span className={`text-xs font-bold ${isLocked ? 'text-neutral-600 italic' : color} ${className} flex items-center gap-1`}>
      {isLocked && <Lock className="w-2 h-2 opacity-50" />}
      {safeCurrent}
    </span>
  );
};

export const LockToggle: React.FC<{
  fieldKey: string,
  npc: Relationship,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ fieldKey, npc, onUpdateNpc }) => {
  if (!onUpdateNpc) return null;
  
  const isLocked = npc.lockedFields?.includes(fieldKey);
  
  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLocked = npc.lockedFields || [];
    const newLocked = isLocked 
      ? currentLocked.filter(f => f !== fieldKey)
      : [...currentLocked, fieldKey];
    
    onUpdateNpc({ ...npc, lockedFields: newLocked });
  };

  return (
    <button 
      onClick={toggleLock}
      className={`ml-1.5 p-0.5 rounded-sm transition-all ${isLocked ? 'text-amber-500 bg-amber-500/10' : 'text-neutral-700 hover:text-neutral-400 hover:bg-white/5'}`}
      title={isLocked ? "Đã khóa - AI không thể thay đổi" : "Mở khóa - AI có thể cập nhật"}
    >
      {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
    </button>
  );
};

const BioItem = ({ label, field, color = "text-white", isEditing, npc, lastChanges, handleChange, onUpdateNpc }: any) => (
  <div className="group flex justify-between items-start p-2 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.05] transition-all">
    <span className="text-[10px] text-neutral-500 font-black uppercase tracking-tighter shrink-0 mt-0.5">{label}</span>
    <div className="flex items-center justify-end flex-grow ml-4 min-w-0">
      {isEditing ? (
        <input 
          value={(npc as any)[field] || ''} 
          onChange={(e) => handleChange(field, e.target.value)}
          className={`bg-transparent text-xs font-black ${color} text-right outline-none border-b border-white/10 focus:border-white/30 w-full`}
        />
      ) : (
        <DiffValue fieldKey={field} current={(npc as any)[field]} lastChanges={lastChanges} color={color} className="text-right" />
      )}
      <LockToggle fieldKey={field} npc={npc} onUpdateNpc={onUpdateNpc} />
    </div>
  </div>
);

export const NpcSidebarBio: React.FC<{ 
  npc: Relationship, 
  themeColor: string, 
  genre?: GameGenre,
  isEditing?: boolean,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ npc, themeColor, genre, isEditing, onUpdateNpc }) => {
  const meta = getGenreMeta(genre);
  const labels = meta.npcLabels;

  const handleChange = (field: keyof Relationship, value: any) => {
    if (onUpdateNpc) onUpdateNpc({ ...npc, [field]: value });
  };

  return (
    <div className="space-y-1.5 mono shrink-0">
      <div className="grid grid-cols-1 gap-1">
        <BioItem label={labels.race} field="race" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
      </div>

      <div className="pt-2 border-t border-white/10 grid grid-cols-1 gap-1">
        <BioItem label="Hoạt động" field="status" color="text-cyan-400" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        <BioItem label={labels.power} field="powerLevel" color={`text-${themeColor}-400`} isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        <BioItem label="Vai trò MC" field="familyRole" color="text-amber-400" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        <BioItem label={labels.faction} field="faction" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        <BioItem label={labels.alignment} field="alignment" color="text-cyan-400" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        <BioItem label="Gia Thế" field="lineage" color="text-emerald-400" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
        
        {(npc.identities || []).filter(i => i.isRevealed).map((identity, idx) => (
          <div key={idx} className="p-2 border border-rose-500/30 bg-rose-500/10 rounded-sm mt-1 flex flex-col gap-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`text-[6px] font-black uppercase px-1 py-0.5 rounded border ${
                  identity.type === IdentityType.FANFIC ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' :
                  identity.type === IdentityType.DESTINY ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                  identity.type === IdentityType.LEGENDARY ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
                  'bg-white/5 border-white/10 text-white/40'
                }`}>
                  {identity.type || IdentityType.NORMAL}
                </span>
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Thân phận Lộ Diện</span>
              </div>
              <Unlock className="w-2.5 h-2.5 text-rose-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase">{identity.name}</span>
              <span className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter">{identity.role}</span>
            </div>
          </div>
        ))}
        <BioItem label="Vị trí cuối" field="lastLocation" isEditing={isEditing} npc={npc} lastChanges={npc.lastChanges} handleChange={handleChange} onUpdateNpc={onUpdateNpc} />
      </div>

      <div className="p-2.5 bg-black/40 border border-white/10 rounded-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Sở thích
            </span>
            <LockToggle fieldKey="likes" npc={npc} onUpdateNpc={onUpdateNpc} />
          </div>
          {isEditing ? (
            <input 
              value={Array.isArray(npc.likes) ? npc.likes.join(', ') : ''} 
              onChange={(e) => handleChange('likes', e.target.value.split(',').map(s => s.trim()))}
              className="w-full bg-transparent text-[9px] text-emerald-400 font-black italic outline-none border-b border-emerald-500/20"
              placeholder="Sở thích (cách nhau bằng dấu phẩy)"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {Array.isArray(npc.likes) && npc.likes.length ? npc.likes.map((l, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-[9px] text-emerald-400 font-black italic shrink-0">{toSentenceCase(l)}</span>
              )) : <span className="text-[9px] text-neutral-700 italic">Dữ liệu trống</span>}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"></span> Chán ghét
            </span>
            <LockToggle fieldKey="dislikes" npc={npc} onUpdateNpc={onUpdateNpc} />
          </div>
          {isEditing ? (
            <input 
              value={Array.isArray(npc.dislikes) ? npc.dislikes.join(', ') : ''} 
              onChange={(e) => handleChange('dislikes', e.target.value.split(',').map(s => s.trim()))}
              className="w-full bg-transparent text-[9px] text-rose-400 font-black italic outline-none border-b border-rose-500/20"
              placeholder="Chán ghét (cách nhau bằng dấu phẩy)"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {Array.isArray(npc.dislikes) && npc.dislikes.length ? npc.dislikes.map((d, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-sm text-[9px] text-rose-400 font-black italic shrink-0">{toSentenceCase(d)}</span>
              )) : <span className="text-[9px] text-neutral-700 italic">Dữ liệu trống</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NpcSkillsWidget: React.FC<{
  npc: Relationship,
  genre?: GameGenre,
  isEditing?: boolean,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ npc, genre, isEditing, onUpdateNpc }) => {
  const meta = getGenreMeta(genre);
  const skillLabel = meta.skillLabel || 'KỸ NĂNG & NĂNG LỰC';

  const handleChange = (field: keyof Relationship, value: any) => {
    if (onUpdateNpc) onUpdateNpc({ ...npc, [field]: value });
  };

  return (
    <div className="p-4 bg-indigo-500/10 border-2 border-indigo-500/40 rounded-sm mono relative overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.1)] shrink-0 animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_8px_#6366f1]"></div>
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <h3 className="text-[12px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
           <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1] animate-pulse"></span> {skillLabel}
        </h3>
        <LockToggle fieldKey="skills" npc={npc} onUpdateNpc={onUpdateNpc} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {isEditing ? (
          <textarea 
            value={Array.isArray(npc.skills) ? npc.skills.join(', ') : ''} 
            onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            className="w-full bg-black/60 text-[10px] p-2 border border-white/10 rounded-sm text-neutral-300 outline-none resize-none font-mono"
            rows={3}
            placeholder="Nhập kỹ năng, cách nhau bằng dấu phẩy..."
          />
        ) : (
          Array.isArray(npc.skills) && npc.skills.length ? npc.skills.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-sm text-[10px] text-indigo-300 font-black uppercase tracking-tight hover:bg-indigo-500/20 transition-all">
              <DiffValue fieldKey={`skill_${i}`} current={skill} lastChanges={npc.lastChanges} color="text-indigo-300" className="text-[10px]" />
            </span>
          )) : <div className="text-[10px] text-neutral-700 font-bold text-center py-4 italic uppercase w-full">Dữ_Liệu_Năng_Lực_Trống</div>
        )}
      </div>
    </div>
  );
};

export const NpcSocialColumn: React.FC<{ 
  npc: Relationship, 
  player: Player, 
  onSwitchNpc: (npc: Relationship) => void,
  isEditing?: boolean,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ npc, player, onSwitchNpc, isEditing, onUpdateNpc }) => {
  const ownerShortName = renderSafeText(npc.name).split(' ').pop() || 'NPC';

  const handleMcRelativesChange = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && onUpdateNpc) {
        onUpdateNpc({ ...npc, mcRelatives: parsed });
      }
    } catch (e) {}
  };

  const handleNpcRelativesChange = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && onUpdateNpc) {
        onUpdateNpc({ ...npc, npcRelatives: parsed });
      }
    } catch (e) {}
  };

  const mcRels = npc.mcRelatives || (npc.relatives || []).filter(r => r.npcId === 'mc_player');
  const npcRels = npc.npcRelatives || (npc.relatives || []).filter(r => r.npcId !== 'mc_player');

  const renderRelItem = (rel: FamilyLink, i: number, isMcPart: boolean) => {
    if (!rel) return null;
    const rawName = renderSafeText(rel.npcName || (rel as any).name, "");
    const playerName = renderSafeText(player.name, "MC");
    const relId = rel.npcId || (rel as any).id;
    const isPlayer = relId === 'mc_player' || 
                     (rawName && (
                       rawName.toLowerCase() === playerName.toLowerCase() ||
                       ['mc', 'bạn', 'người chơi', 'player'].includes(rawName.toLowerCase())
                     ));
    
    const knownNpc = player.relationships.find(r => 
      (relId && r.id === relId) || 
      (rawName && r.name && r.name.toLowerCase() === rawName.toLowerCase())
    );

    const displayRelName = isPlayer 
      ? `[ BẠN: ${playerName} ]` 
      : (knownNpc ? knownNpc.name : (rawName || relId || "Vô danh"));

    return (
      <div 
        key={i} 
        onClick={() => !isPlayer && knownNpc && onSwitchNpc(knownNpc)}
        className={`group p-2 border transition-all mb-1 ${
          isPlayer ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
          knownNpc ? 'bg-white/[0.02] border-white/10 cursor-pointer hover:border-yellow-500/40 hover:bg-white/[0.05]' : 
          'bg-black/40 border-white/5 opacity-40 grayscale'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black truncate uppercase ${isPlayer ? 'text-emerald-400' : 'text-neutral-200'}`}>
              {displayRelName}
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-tighter ${isPlayer ? 'text-emerald-500/70' : 'text-neutral-600'} flex items-center gap-1`}>
              {ownerShortName} ❯ <DiffValue fieldKey={`${isMcPart ? 'mcRel' : 'npcRel'}_${i}_relation`} current={rel.relation} lastChanges={npc.lastChanges} color={isPlayer ? 'text-emerald-500/70' : 'text-neutral-600'} className="text-[8px]" />
            </span>
          </div>
          {knownNpc && !isPlayer && (
            <div className="text-right shrink-0">
               <span className="text-[10px] text-pink-500 font-black">{knownNpc.affinity}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/40 rounded-sm mono relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.1)] shrink-0 min-h-[120px] animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent shadow-[0_0_8px_#eab308]"></div>
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h3 className="text-[12px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
           <span className="w-2.5 h-2.5 bg-yellow-500 rotate-45 shadow-[0_0_10px_#eab308] animate-pulse"></span> Mạng Lưới Matrix
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-tighter">{(mcRels.length + npcRels.length)} Thực Thể</span>
          <LockToggle fieldKey="relatives" npc={npc} onUpdateNpc={onUpdateNpc} />
        </div>
      </div>

      <div className="space-y-4">
        {/* MC Relatives Section */}
        <div className="space-y-1">
          <h4 className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
            Quan Hệ Với MC
          </h4>
          {isEditing ? (
            <div className="space-y-1">
              <textarea 
                defaultValue={JSON.stringify(mcRels, null, 2)}
                onBlur={(e) => handleMcRelativesChange(e.target.value)}
                className="w-full bg-black/60 text-[9px] p-2 border border-emerald-500/20 rounded-sm text-emerald-100 outline-none resize-none font-mono"
                rows={4}
                placeholder="MC Relatives JSON"
              />
            </div>
          ) : (
            mcRels.length ? mcRels.map((rel, i) => renderRelItem(rel, i, true)) : <div className="text-[9px] text-neutral-700 font-bold italic uppercase py-2">Chưa_Xác_Định_Với_MC</div>
          )}
        </div>

        {/* NPC Relatives Section */}
        <div className="space-y-1">
          <h4 className="text-[9px] font-black text-yellow-500/70 uppercase flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 bg-yellow-500/50 rounded-full"></span>
            Quan Hệ Với NPC Khác
          </h4>
          {isEditing ? (
            <div className="space-y-1">
              <textarea 
                defaultValue={JSON.stringify(npcRels, null, 2)}
                onBlur={(e) => handleNpcRelativesChange(e.target.value)}
                className="w-full bg-black/60 text-[9px] p-2 border border-white/10 rounded-sm text-neutral-300 outline-none resize-none font-mono"
                rows={6}
                placeholder="NPC Relatives JSON"
              />
            </div>
          ) : (
            npcRels.length ? npcRels.map((rel, i) => renderRelItem(rel, i, false)) : <div className="text-[9px] text-neutral-700 font-bold italic uppercase py-2">Không_Có_Liên_Kết_NPC</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NpcInventoryWidget: React.FC<{
  npc: Relationship,
  isEditing?: boolean,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ npc, isEditing, onUpdateNpc }) => {
  const handleInventoryChange = (text: string) => {
    if (onUpdateNpc) {
      const lines = text.split('\n').filter(s => s.trim());
      const newInventory = lines.map(line => {
        const [name, ...descParts] = line.split('|');
        return {
          name: name.trim(),
          description: descParts.join('|').trim() || "Vật thể mang năng lượng tích hợp."
        };
      });
      onUpdateNpc({ ...npc, inventory: newInventory });
    }
  };

  return (
    <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-sm mono relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.1)] shrink-0 animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_8px_#10b981]"></div>
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></span> TÚI ĐỒ (INVENTORY)
        </h3>
        <LockToggle fieldKey="inventory" npc={npc} onUpdateNpc={onUpdateNpc} />
      </div>

      <div className={isEditing ? "space-y-1.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5"}>
        {isEditing ? (
          <textarea 
            value={npc.inventory && npc.inventory.length > 0 ? npc.inventory.map(i => `${i.name} | ${i.description}`).join('\n') : ''}
            onChange={(e) => handleInventoryChange(e.target.value)}
            className="w-full bg-black/60 text-[10px] p-2.5 border border-white/10 rounded-sm text-neutral-300 outline-none resize-none font-mono"
            rows={5}
            placeholder="Tên | Mô tả (Mỗi vật phẩm một dòng)"
          />
        ) : (
          npc.inventory && npc.inventory.length > 0 ? npc.inventory.map((item, i) => (
            <div key={i} className="p-1.5 bg-white/[0.03] border border-white/5 rounded-sm flex flex-col gap-0.5 hover:bg-white/[0.06] transition-colors group min-w-0">
              <DiffValue fieldKey={`inv_${i}_name`} current={item.name} lastChanges={npc.lastChanges} color="text-emerald-400" className="text-[10px] uppercase truncate" />
              <DiffValue fieldKey={`inv_${i}_desc`} current={item.description} lastChanges={npc.lastChanges} color="text-neutral-500" className="text-[8px] italic leading-tight line-clamp-1 group-hover:line-clamp-none transition-all" />
            </div>
          )) : <div className="text-[10px] text-neutral-700 font-bold text-center py-4 italic uppercase w-full col-span-full">Túi_Đồ_Trống</div>
        )}
      </div>
    </div>
  );
};

export const NpcCustomFieldsWidget: React.FC<{
  npc: Relationship,
  isEditing?: boolean,
  onUpdateNpc?: (npc: Relationship) => void
}> = ({ npc, isEditing, onUpdateNpc }) => {
  const fields = npc.customFields || [];

  return (
    <div className="p-4 bg-white/[0.03] border-2 border-white/10 rounded-sm mono relative overflow-hidden shrink-0 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <h3 className="text-[12px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
           <span className="w-2.5 h-2.5 bg-neutral-500 rotate-45 animate-pulse"></span> THÔNG TIN TÙY CHỈNH
        </h3>
        <LockToggle fieldKey="customFields" npc={npc} onUpdateNpc={onUpdateNpc} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {fields.map((field, i) => (
          <div key={i} className="bg-black/40 border border-white/5 p-2 rounded-sm group relative">
            {isEditing && (
              <button 
                onClick={() => {
                  const newFields = fields.filter((_, idx) => idx !== i);
                  onUpdateNpc?.({ ...npc, customFields: newFields });
                }}
                className="absolute top-1 right-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >✕</button>
            )}
            <div className="flex flex-col gap-1">
              {isEditing ? (
                <>
                  <input 
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...fields];
                      newFields[i] = { ...field, label: e.target.value };
                      onUpdateNpc?.({ ...npc, customFields: newFields });
                    }}
                    className="bg-transparent text-[8px] font-black text-neutral-500 uppercase outline-none border-b border-white/5"
                    placeholder="Tên"
                  />
                  <input 
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...fields];
                      newFields[i] = { ...field, value: e.target.value };
                      onUpdateNpc?.({ ...npc, customFields: newFields });
                    }}
                    className="bg-transparent text-xs font-black text-white outline-none border-b border-white/10"
                    placeholder="Giá trị"
                  />
                </>
              ) : (
                <>
                  <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">{field.icon || '💠'} {field.label}</span>
                  <DiffValue fieldKey={`custom_${i}_value`} current={field.value} lastChanges={npc.lastChanges} color="text-white" className="text-xs" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <button 
          onClick={() => {
            const newFields = [...fields, { label: 'MỚI', value: '?', icon: '💠' }];
            onUpdateNpc?.({ ...npc, customFields: newFields });
          }}
          className="w-full mt-3 py-2 bg-white/5 border border-dashed border-white/20 rounded-sm text-[9px] font-black text-neutral-500 uppercase hover:bg-white/10 transition-all"
        >
          + THÊM WIDGET
        </button>
      )}
    </div>
  );
};
