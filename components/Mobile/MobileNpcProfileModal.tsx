
import React, { useRef, useState, useEffect } from 'react';
import { Relationship, GameGenre, Player, AppSettings, GameTime } from '../../types';
import { syncAgeAndBirthday } from '../../utils/timeUtils';
import { NpcSidebarBio, LockToggle, NpcSocialColumn, NpcSkillsWidget, NpcInventoryWidget, NpcCustomFieldsWidget } from '../NpcProfileBase';
import { 
  NpcRelationshipDashboard, 
  NpcPsychologyWidget, 
  NpcOpinionWidget, 
  NpcImpressionWidget, 
  NpcSecretsWidget, 
  NpcLogsWidget,
  NpcInnerSelfWidget,
  NpcFetishWidget,
  NpcSexualPreferencesWidget
} from '../NpcProfileMental';
import { NpcPhysicalColumn, NpcPrivateWidget, NpcFashionWidget, NpcPhysiologyWidget } from '../NpcProfileAnatomy';
import { IdentityPanel } from '../IdentityPanel';
import { GalleryPicker } from '../GalleryPicker';
import { DEFAULT_AVATAR } from '../../constants';

interface MobileNpcProfileModalProps {
  npc: Relationship | null;
  player: Player;
  isOpen: boolean;
  genre?: GameGenre;
  onClose: () => void;
  onUpdateNpc: (npc: Relationship) => void;
  onDeleteNpc: (id: string) => void;
  onSwitchNpc: (npc: Relationship) => void;
  markAsViewed?: (id: string, type: 'codex' | 'npc') => void;
  settings: AppSettings;
  themeColor: string;
  isHarem: boolean;
  isFam: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  handleAvatarClick: () => void;
  handleOpenGallery: () => void;
  showGalleryPicker: boolean;
  setShowGalleryPicker: (v: boolean) => void;
  selectFromGallery: (url: string) => void;
  gameTime?: GameTime;
  isUploading: boolean;
}

export const MobileNpcProfileModal: React.FC<MobileNpcProfileModalProps> = ({
  npc, player, isOpen, genre, onClose, onUpdateNpc, onSwitchNpc, markAsViewed, settings,
  themeColor, isHarem, isFam, handlePrev, handleNext, handleAvatarClick, handleOpenGallery,
  showGalleryPicker, setShowGalleryPicker, selectFromGallery, onDeleteNpc,
  gameTime, isUploading
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && npc && npc.viewed === false && markAsViewed) {
      markAsViewed(npc.id, 'npc');
    }
  }, [isOpen, npc?.id, npc?.viewed, markAsViewed]);

  if (!npc) return null;

  const handleChange = (field: keyof Relationship, value: any) => {
    if (npc) {
      if ((field === 'age' || field === 'birthday') && gameTime?.year !== undefined) {
        const currentYear = gameTime.year;
        const updates = syncAgeAndBirthday(field as 'age' | 'birthday', value, currentYear, npc);
        onUpdateNpc({ ...npc, ...updates });
      } else {
        onUpdateNpc({ ...npc, [field]: value });
      }
    }
  };

  return (
    <div className="MobileNpcProfileModal fixed inset-0 z-[400] bg-black flex flex-col h-full overflow-hidden mono">
      {/* HEADER */}
      <div className={`flex flex-col gap-1 px-2 py-2 border-b border-white/10 bg-${themeColor}-500/[0.06] backdrop-blur-3xl shrink-0`}>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full bg-${themeColor}-500 shadow-[0_0_8px_currentColor] animate-pulse`}></div>
            <div className="flex items-center gap-1 mr-2">
              <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full transition-all text-neutral-400 active:scale-90">❮</button>
              <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full transition-all text-neutral-400 active:scale-90">❯</button>
            </div>
            <div className="flex items-baseline">
              {isEditing ? (
                <input 
                  value={npc.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`bg-transparent text-sm font-black text-${themeColor}-400 tracking-tight uppercase outline-none border-b border-${themeColor}-500/30 w-32`}
                />
              ) : (
                <h2 className={`text-[11px] font-black text-${themeColor}-400 tracking-tight uppercase truncate max-w-[140px]`}>
                  {npc.name}
                </h2>
              )}
              <LockToggle fieldKey="name" npc={npc} onUpdateNpc={onUpdateNpc} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`p-2.5 transition-all rounded-sm border font-black uppercase text-[10px] shadow-xl active:scale-95 ${isEditing ? `bg-${themeColor}-500 text-black border-${themeColor}-400` : 'bg-white/5 text-neutral-400 border-white/10'}`}
            >
              {isEditing ? '💾' : '✎'}
            </button>
            <button onClick={onClose} className="p-2.5 bg-white/5 text-neutral-400 rounded-sm border border-white/10 font-black uppercase text-[10px] shadow-xl active:scale-95">
              ✕
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 shrink-0">
          {isEditing ? (
            <select 
              value={npc.type} 
              onChange={(e) => handleChange('type', e.target.value)}
              className={`px-2 py-0.5 rounded-sm text-[9px] font-black border border-${themeColor}-500/30 bg-black text-${themeColor}-400 uppercase outline-none`}
            >
              <option value="family">Gia Đình</option>
              <option value="harem">Hậu Cung</option>
              <option value="social">Xã Hội</option>
            </select>
          ) : (
            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border border-${themeColor}-500/30 bg-${themeColor}-500/10 text-${themeColor}-400 uppercase tracking-tighter`}>
              {npc.type === 'harem' ? 'Hậu Cung' : npc.type === 'family' ? 'Gia Đình' : npc.type === 'social' ? 'Xã Hội' : (isHarem ? 'Hậu Cung' : isFam ? 'Gia Đình' : 'Xã Hội')}
            </span>
          )}
          {isEditing ? (
            <select 
              value={npc.isDead ? 'true' : 'false'} 
              onChange={(e) => handleChange('isDead', e.target.value === 'true')}
              className={`px-2 py-0.5 rounded-sm text-[9px] font-black border border-red-500/30 bg-black text-red-400 uppercase outline-none`}
            >
              <option value="false">Còn Sống</option>
              <option value="true">Đã Chết</option>
            </select>
          ) : npc.isDead ? (
            <span className="px-2 py-0.5 rounded-sm text-[9px] font-black border border-red-500/30 bg-red-500/10 text-red-500 uppercase tracking-tighter">
              ĐÃ CHẾT
            </span>
          ) : null}
          {isEditing ? (
            <select 
              value={npc.isPresent ? 'true' : 'false'} 
              onChange={(e) => handleChange('isPresent', e.target.value === 'true')}
              className={`px-2 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-black text-white uppercase outline-none`}
            >
              <option value="true">Hiện Diện</option>
              <option value="false">Vắng Mặt</option>
            </select>
          ) : !npc.isDead && (
            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border ${npc.isPresent ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-neutral-500/30 bg-neutral-500/10 text-neutral-400'} uppercase tracking-tighter`}>
              {npc.isPresent ? 'Hiện Diện' : 'Vắng Mặt'}
            </span>
          )}

          {/* MOBILE GENDER, AGE, BIRTHDAY */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-1.5 shrink-0">
            {isEditing ? (
              <>
                <input 
                  value={npc.gender || ''} 
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="px-1.5 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-black text-white uppercase outline-none w-12"
                  placeholder="Giới tính"
                />
                <input 
                  type="number"
                  value={npc.age || ''} 
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  className="px-1.5 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-black text-white uppercase outline-none w-10"
                  placeholder="Tuổi"
                />
                <input 
                  value={npc.birthday || ''} 
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  className="px-1.5 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-black text-white uppercase outline-none w-16"
                  placeholder="Sinh nhật"
                />
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-white/5 text-white uppercase tracking-tighter">
                  {npc.gender || '---'}
                </span>
                <span className="px-2 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-white/5 text-white uppercase tracking-tighter">
                  {npc.age || '---'}T
                </span>
                <span className="px-2 py-0.5 rounded-sm text-[9px] font-black border border-white/10 bg-white/5 text-white uppercase tracking-tighter">
                  {npc.birthday || '---'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col relative p-2 space-y-3 pb-32">
        <GalleryPicker 
          player={player}
          isOpen={showGalleryPicker}
          onClose={() => setShowGalleryPicker(false)}
          onSelect={selectFromGallery}
          settings={settings}
          title="KHO ẢNH NPC"
          themeColor={themeColor}
        />

        {/* AVATAR & BIO */}
        <div className="w-full p-1 bg-black/40 flex flex-col shrink-0 border border-white/10 rounded-sm">
          <div className="relative group mb-1.5 w-full aspect-square rounded-sm border border-white/10 bg-neutral-900 overflow-hidden shrink-0">
            {isUploading ? (
              <div className="h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className={`w-10 h-10 border-2 border-${themeColor}-500/20 border-t-${themeColor}-500 rounded-full animate-spin mb-4`}></div>
                <span className={`mono text-[10px] text-${themeColor}-400 font-black uppercase animate-pulse`}>ĐANG TẢI...</span>
              </div>
            ) : npc.avatar ? (
              <img src={npc.avatar} alt={npc.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <img src={DEFAULT_AVATAR} alt={npc.name} className="w-full h-full object-cover opacity-40" loading="lazy" />
            )}
            <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-20">
                <span className="text-white font-black text-[10px] uppercase bg-black/60 px-3 py-1.5 rounded-sm">TẢI ẢNH</span>
            </div>

            <div className="absolute top-2 right-2 z-40">
              <LockToggle fieldKey="avatar" npc={npc} onUpdateNpc={onUpdateNpc} />
            </div>

            <button onClick={handleOpenGallery} className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 border border-white/10 rounded-sm text-[10px] font-black uppercase text-white z-30">
              THƯ VIỆN
            </button>
          </div>

          <NpcSidebarBio 
            npc={npc} 
            themeColor={themeColor} 
            genre={genre} 
            isEditing={isEditing}
            onUpdateNpc={onUpdateNpc}
          />
        </div>

        <IdentityPanel 
          identities={npc.identities || []}
          isEditing={isEditing}
          onUpdate={(identities) => onUpdateNpc({ ...npc, identities })}
          isLocked={npc.lockedFields?.includes('identities')}
          onToggleLock={() => {
            const currentLocked = npc.lockedFields || [];
            const isLocked = currentLocked.includes('identities');
            const newLocked = isLocked 
              ? currentLocked.filter(f => f !== 'identities')
              : [...currentLocked, 'identities'];
            onUpdateNpc({ ...npc, lockedFields: newLocked });
          }}
        />

        {/* ALL WIDGETS */}
        <NpcRelationshipDashboard 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />
        
        <NpcFashionWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcPhysiologyWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcInnerSelfWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcFetishWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcSexualPreferencesWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcPhysicalColumn 
          npc={npc} 
          themeColor={themeColor} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcOpinionWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcImpressionWidget 
          npc={npc} 
          themeColor={themeColor} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcPsychologyWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcSecretsWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcPrivateWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcSkillsWidget 
          npc={npc} 
          genre={genre}
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />
        
        <NpcSocialColumn 
          npc={npc} 
          player={player} 
          onSwitchNpc={onSwitchNpc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcLogsWidget 
          npc={npc} 
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcInventoryWidget 
          npc={npc}
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        <NpcCustomFieldsWidget 
          npc={npc}
          isEditing={isEditing}
          onUpdateNpc={onUpdateNpc}
        />

        {isEditing && (
          <div className="pt-8 pb-4 px-2">
            <button 
              onClick={() => {
                onDeleteNpc(npc.id);
              }}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-black transition-all rounded-xl border border-rose-500/40 font-black uppercase text-xs shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              <span>🗑</span>
              <span>XÓA NHÂN VẬT KHỎI THỰC TẠI</span>
            </button>
            <p className="text-[8px] text-rose-500/60 text-center mt-2 font-black uppercase tracking-widest">Cảnh báo: Hành động này không thể hoàn tác</p>
          </div>
        )}
      </div>
    </div>
  );
};
