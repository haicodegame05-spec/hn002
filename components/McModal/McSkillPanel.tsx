
import { Skill } from '../../types';
import { InspectType } from './McInspector';

interface McSkillPanelProps {
  skills: Skill[];
  skillLabel: string;
  onInspect: (data: { name: string; type: InspectType; description?: string }) => void;
  isEditing?: boolean;
  onUpdatePlayer?: (player: any) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const McSkillPanel: React.FC<McSkillPanelProps> = ({ 
  skills, 
  skillLabel, 
  onInspect, 
  isEditing, 
  onUpdatePlayer,
  isLocked,
  onToggleLock
}) => {
  const handleSkillsChange = (text: string) => {
    if (onUpdatePlayer) {
      const lines = text.split('\n').filter(s => s.trim());
      const newSkills = lines.map(line => {
        const [name, ...descParts] = line.split('|');
        return {
          name: name.trim(),
          description: descParts.join('|').trim() || "Kỹ năng thần kinh/vật lý đã được mã hóa vào bản thể. Cho phép chủ thể can thiệp vào dòng chảy thực tại theo các quy luật đặc thù của thế giới hiện hành."
        };
      });
      onUpdatePlayer({ skills: newSkills });
    }
  };

  return (
    <section className="p-3 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3 h-full shadow-xl mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">❯ {skillLabel}</span>
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
            value={skills && skills.length > 0 ? skills.map(s => `${s?.name || 'Vô danh'} | ${s?.description || 'Chưa có mô tả.'}`).join('\n') : ''}
            onChange={(e) => handleSkillsChange(e.target.value)}
            className="w-full bg-black/40 text-[11px] p-2.5 border border-white/10 rounded-sm text-neutral-300 outline-none resize-none"
            rows={15}
            placeholder="Tên | Mô tả (Mỗi kỹ năng một dòng)"
          />
        ) : (
          skills && skills.length > 0 ? skills.map((skill, i) => (
            <button 
              key={i} 
              onClick={() => onInspect({ name: skill.name, type: 'skill', description: skill.description })}
              className="flex items-center justify-between p-2.5 bg-white/[0.03] border border-white/10 rounded-sm group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-emerald-500 text-[8px] animate-pulse">◈</span>
                <span className="text-[11px] font-black text-neutral-300 uppercase truncate">{skill.name}</span>
              </div>
              <span className="text-[7px] mono font-black text-emerald-500/30 uppercase shrink-0 group-hover:text-emerald-400">INFO</span>
            </button>
          )) : <div className="text-[9px] text-neutral-700 italic p-6 text-center uppercase font-black">No_Abilities_Detected</div>
        )}
      </div>
    </section>
  );
};
