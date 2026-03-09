
import React from 'react';
import { Player, getGenreMeta, GameGenre, GameTime } from '../../types';
import { syncAgeAndBirthday } from '../../utils/timeUtils';

interface McHeaderProps {
  player: Player;
  genre?: GameGenre;
  onClose: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdatePlayer?: (player: any) => void;
  gameTime?: GameTime;
  isGameStarted?: boolean;
  onToggleLock?: (field: string) => void;
  onExport?: () => void;
  onImport?: () => void;
}

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

export const McHeader: React.FC<McHeaderProps> = ({ player, genre, onClose, isEditing, onToggleEdit, onUpdatePlayer, gameTime, isGameStarted, onToggleLock, onExport, onImport }) => {
  const meta = getGenreMeta(genre);
  const getRank = (level: number) => {
    const rankIndex = Math.min(Math.floor(level / 10), meta.ranks.length - 1);
    return meta.ranks[rankIndex];
  };

  const handleChange = (field: string, value: any) => {
    if (onUpdatePlayer) {
      if ((field === 'age' || field === 'birthday') && gameTime?.year !== undefined) {
        const currentYear = gameTime.year;
        const updates = syncAgeAndBirthday(field as 'age' | 'birthday', value, currentYear, player);
        onUpdatePlayer({ ...player, ...updates });
      } else {
        onUpdatePlayer({ ...player, [field]: value });
      }
    }
  };

  const healthPercent = Math.min(100, (player.health / player.maxHealth) * 100);

  return (
    <div className="flex flex-col border-b border-white/10 bg-emerald-500/5 shrink-0 mono">
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-4">
          <div className="h-10 w-px bg-white/10 hidden lg:block mx-2"></div>

          <div className="hidden lg:flex items-center gap-6">
            {/* Name */}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isEditing ? (
                  <input 
                    value={player.statLabels?.['name_label'] || 'Họ Tên'}
                    onChange={(e) => onUpdatePlayer?.({
                      ...player,
                      statLabels: { ...(player.statLabels || {}), 'name_label': e.target.value }
                    })}
                    className="bg-transparent text-[7px] text-neutral-600 font-black uppercase tracking-widest outline-none border-b border-white/10 w-16"
                  />
                ) : (
                  <span className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">
                    {player.statLabels?.['name_label'] || 'Họ Tên'}
                  </span>
                )}
                <LockIcon isLocked={player.lockedFields?.includes('name') || false} onClick={() => onToggleLock?.('name')} />
              </div>
              {isEditing ? (
                <input 
                  value={player.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bg-transparent text-sm font-black text-white uppercase italic outline-none border-b border-emerald-500/20 w-32"
                />
              ) : (
                <span className="text-sm font-black text-white uppercase italic leading-none">{player.name}</span>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isEditing ? (
                  <input 
                    value={player.statLabels?.['gender_label'] || 'Giới tính'}
                    onChange={(e) => onUpdatePlayer?.({
                      ...player,
                      statLabels: { ...(player.statLabels || {}), 'gender_label': e.target.value }
                    })}
                    className="bg-transparent text-[7px] text-neutral-600 font-black uppercase tracking-widest outline-none border-b border-white/10 w-16"
                  />
                ) : (
                  <span className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">
                    {player.statLabels?.['gender_label'] || 'Giới tính'}
                  </span>
                )}
                <LockIcon isLocked={player.lockedFields?.includes('gender') || false} onClick={() => onToggleLock?.('gender')} />
              </div>
              {isEditing ? (
                <select 
                  value={player.gender} 
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="bg-transparent text-sm font-black uppercase italic text-white outline-none"
                >
                  <option value="??" className="bg-neutral-900">?? (Chưa chọn)</option>
                  <option value="Nam" className="bg-neutral-900">Nam</option>
                  <option value="Nữ" className="bg-neutral-900">Nữ</option>
                  <option value="Khác" className="bg-neutral-900">Khác</option>
                </select>
              ) : (
                <span className={`text-sm font-black uppercase italic leading-none ${player.gender === 'Nữ' ? 'text-pink-400' : player.gender === 'Nam' ? 'text-blue-400' : 'text-neutral-500'}`}>
                  {player.gender || '---'}
                </span>
              )}
            </div>

            {/* Age */}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isEditing ? (
                  <input 
                    value={player.statLabels?.['age_label'] || 'Tuổi'}
                    onChange={(e) => onUpdatePlayer?.({
                      ...player,
                      statLabels: { ...(player.statLabels || {}), 'age_label': e.target.value }
                    })}
                    className="bg-transparent text-[7px] text-neutral-600 font-black uppercase tracking-widest outline-none border-b border-white/10 w-12"
                  />
                ) : (
                  <span className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">
                    {player.statLabels?.['age_label'] || 'Tuổi'}
                  </span>
                )}
                <LockIcon isLocked={player.lockedFields?.includes('age') || false} onClick={() => onToggleLock?.('age')} />
              </div>
              {isEditing ? (
                <input 
                  type="number"
                  value={player.age} 
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  className="bg-transparent text-sm font-black text-white outline-none w-12"
                />
              ) : (
                <span className="text-sm font-black text-white uppercase italic leading-none">{player.age || '??'}</span>
              )}
            </div>

            {/* Birthday */}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isEditing ? (
                  <input 
                    value={player.statLabels?.['birthday_label'] || 'Ngày sinh'}
                    onChange={(e) => onUpdatePlayer?.({
                      ...player,
                      statLabels: { ...(player.statLabels || {}), 'birthday_label': e.target.value }
                    })}
                    className="bg-transparent text-[7px] text-neutral-600 font-black uppercase tracking-widest outline-none border-b border-white/10 w-16"
                  />
                ) : (
                  <span className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">
                    {player.statLabels?.['birthday_label'] || 'Ngày sinh'}
                  </span>
                )}
                <LockIcon isLocked={player.lockedFields?.includes('birthday') || false} onClick={() => onToggleLock?.('birthday')} />
              </div>
              {isEditing ? (
                <input 
                  value={player.birthday || ''} 
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  className="bg-transparent text-sm font-black text-white outline-none w-24"
                />
              ) : (
                <span className="text-sm font-black text-white uppercase italic tracking-tight leading-none">{player.birthday || '---'}</span>
              )}
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden md:block mx-2"></div>
        </div>

        <div className="flex items-center gap-2">
          {!isGameStarted && (
            <>
              <button 
                onClick={onImport} 
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-all rounded-sm border font-black uppercase text-[10px] shadow-2xl active:scale-95 flex items-center gap-2"
                title="Nhập dữ liệu MC từ tệp JSON"
              >
                <span>📥</span> Nhập
              </button>
              <button 
                onClick={onExport} 
                className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-all rounded-sm border font-black uppercase text-[10px] shadow-2xl active:scale-95 flex items-center gap-2"
                title="Xuất dữ liệu MC ra tệp JSON"
              >
                <span>📤</span> Xuất
              </button>
            </>
          )}

          {isGameStarted && (
            isEditing ? (
              <button 
                onClick={onToggleEdit} 
                className="px-4 py-1.5 bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 transition-all rounded-sm border font-black uppercase text-[10px] shadow-2xl active:scale-95 flex items-center gap-2"
              >
                <span>💾</span> Lưu Thay Đổi
              </button>
            ) : (
              <button 
                onClick={onToggleEdit} 
                className="px-4 py-1.5 bg-white/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 transition-all rounded-sm border font-black uppercase text-[10px] shadow-2xl active:scale-95"
              >
                ✎ Chỉnh Sửa
              </button>
            )
          )}

          <button onClick={onClose} className="px-4 py-1.5 bg-white/5 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-all rounded-sm border border-white/10 font-black uppercase text-[10px] shadow-2xl active:scale-95">
            [ESC] Đóng
          </button>
        </div>
      </div>

      {/* Vital Bars */}
      <div className="flex items-center gap-4 px-4 pb-2">
        <div className="flex-grow flex items-center gap-3">
          <div className="flex flex-col w-48">
            <div className="flex justify-between text-[8px] font-black uppercase mb-0.5">
              <div className="flex items-center">
                {isEditing ? (
                  <input 
                    value={player.statLabels?.['health_label'] || 'Sinh Mệnh (HP)'}
                    onChange={(e) => onUpdatePlayer?.({
                      ...player,
                      statLabels: { ...(player.statLabels || {}), 'health_label': e.target.value }
                    })}
                    className="bg-transparent text-rose-500 outline-none border-b border-rose-500/20 w-24"
                  />
                ) : (
                  <span className="text-rose-500">{player.statLabels?.['health_label'] || 'Sinh Mệnh (HP)'}</span>
                )}
                <LockIcon isLocked={player.lockedFields?.includes('health') || false} onClick={() => onToggleLock?.('health')} />
              </div>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={player.health}
                    onChange={(e) => handleChange('health', parseInt(e.target.value) || 0)}
                    className="bg-transparent text-white w-12 outline-none border-b border-rose-500/20 text-right"
                  />
                  <span>/</span>
                  <input 
                    type="number"
                    value={player.maxHealth}
                    onChange={(e) => handleChange('maxHealth', parseInt(e.target.value) || 0)}
                    className="bg-transparent text-white w-12 outline-none border-b border-rose-500/20"
                  />
                  <LockIcon isLocked={player.lockedFields?.includes('maxHealth') || false} onClick={() => onToggleLock?.('maxHealth')} />
                </div>
              ) : (
                <span className="text-white">{player.health} / {player.maxHealth}</span>
              )}
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-500" 
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col ml-4">
            <div className="flex items-center">
              {isEditing ? (
                <input 
                  value={player.statLabels?.['location_label'] || 'Vị Trí Hiện Tại'}
                  onChange={(e) => onUpdatePlayer?.({
                    ...player,
                    statLabels: { ...(player.statLabels || {}), 'location_label': e.target.value }
                  })}
                  className="bg-transparent text-[8px] text-neutral-600 font-black uppercase tracking-widest outline-none border-b border-white/10 w-24"
                />
              ) : (
                <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">
                  {player.statLabels?.['location_label'] || 'Vị Trí Hiện Tại'}
                </span>
              )}
              <LockIcon isLocked={player.lockedFields?.includes('currentLocation') || false} onClick={() => onToggleLock?.('currentLocation')} />
            </div>
            {isEditing ? (
              <input 
                value={player.currentLocation || ''} 
                onChange={(e) => handleChange('currentLocation', e.target.value)}
                className="bg-transparent text-[10px] text-white font-black uppercase italic outline-none border-b border-white/10 w-48"
              />
            ) : (
              <span className="text-[10px] text-white font-black uppercase italic">📍 {player.currentLocation || 'Khởi đầu thực tại'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
