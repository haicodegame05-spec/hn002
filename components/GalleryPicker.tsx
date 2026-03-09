
import React, { useState, useEffect } from 'react';
import { Player, GameGenre, GalleryImage, AppSettings } from '../types';
import { dbService } from '../services/dbService';
import { fetchCloudinaryImages, checkSystemHealth } from '../services/uploadService';
import { X, RefreshCw, Globe, Smartphone, Filter } from 'lucide-react';

interface GalleryPickerProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: string) => void;
  settings: AppSettings;
  title?: string;
  themeColor?: string;
  onGenerateAvatar?: (customPrompt?: string) => Promise<string | undefined>;
}

export const GalleryPicker: React.FC<GalleryPickerProps> = ({ 
  player, isOpen, onClose, onSelect, settings, 
  title = "TÙY CHỌN ẢNH MC", 
  themeColor = "emerald",
  onGenerateAvatar
}) => {
  const [cloudinaryGallery, setCloudinaryGallery] = useState<string[]>([]);
  const [localGallery, setLocalGallery] = useState<GalleryImage[]>([]);
  const [libraryMode, setLibraryMode] = useState<'shared' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<GameGenre | 'All'>('All');
  const [systemMode, setSystemMode] = useState<'full' | 'basic'>('basic');

  const initGallery = async () => {
    setIsLoading(true);
    const health = await checkSystemHealth();
    setSystemMode(health.mode);
    
    // Load local gallery
    const localImages = await dbService.getLocalImages();
    setLocalGallery(localImages);

    if (health.mode === 'full') {
      const images = await fetchCloudinaryImages();
      setCloudinaryGallery(images);
    }
    setIsLoading(false);
  };

  const loadGallery = async () => {
    setIsLoading(true);
    if (libraryMode === 'shared' && systemMode === 'full') {
      const images = await fetchCloudinaryImages();
      setCloudinaryGallery(images);
    } else {
      const localImages = await dbService.getLocalImages();
      setLocalGallery(localImages);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      initGallery();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Merge Cloudinary images with player gallery metadata
  const displayGallery: GalleryImage[] = libraryMode === 'shared' 
    ? (systemMode === 'full' ? Array.from(new Set([...cloudinaryGallery, ...player.gallery.map(g => g.url)])) : player.gallery.map(g => g.url)).map(url => {
        const existing = player.gallery.find(g => g.url === url);
        return existing || { url, tags: [], genre: undefined };
      })
    : localGallery;

  const customCategories = ['Hot Girl', '210', 'Segg', 'Anime'];
  const tabs = ['All', ...Object.values(GameGenre), ...customCategories];

  const filteredGallery = activeTab === 'All' 
    ? displayGallery 
    : displayGallery.filter(img => {
        if (Object.values(GameGenre).includes(activeTab as any)) {
          return img.genre === activeTab;
        }
        if (customCategories.includes(activeTab)) {
          return img.tags.includes(activeTab);
        }
        return false;
      });

  const isMobile = settings.mobileMode;

  return (
    <div className="fixed inset-[0.5%] z-[2000] bg-black/98 backdrop-blur-3xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden mono rounded-xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-6 border-b border-white/10 bg-black/40 shrink-0 gap-3">
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8">
          <div className="flex flex-col">
            <h3 className={`text-sm md:text-2xl font-black text-${themeColor}-400 uppercase tracking-widest italic flex items-center gap-3`}>
              {title}
            </h3>
            <span className="text-[7px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em]">
              Media_Asset_Selector // {libraryMode.toUpperCase()}_VAULT
            </span>
          </div>

          <div className="flex bg-black/60 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => { setLibraryMode('local'); loadGallery(); }}
              className={`px-2 md:px-5 py-1 md:py-2 rounded-lg text-[8px] md:text-[11px] font-black uppercase transition-all flex items-center gap-1 md:gap-2 ${libraryMode === 'local' ? `bg-${themeColor}-500 text-black shadow-lg shadow-${themeColor}-500/20` : 'text-neutral-500 hover:text-white'}`}
            >
              <Smartphone size={isMobile ? 10 : 14} /> {isMobile ? 'MÁY' : 'THƯ VIỆN MÁY'}
            </button>
            <button 
              onClick={() => { setLibraryMode('shared'); loadGallery(); }}
              className={`px-2 md:px-5 py-1 md:py-2 rounded-lg text-[8px] md:text-[11px] font-black uppercase transition-all flex items-center gap-1 md:gap-2 ${libraryMode === 'shared' ? `bg-${themeColor}-500 text-black shadow-lg shadow-${themeColor}-500/20` : 'text-neutral-500 hover:text-white'}`}
            >
              <Globe size={isMobile ? 10 : 14} /> {isMobile ? 'CHUNG' : 'THƯ VIỆN CHUNG'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 md:gap-3">
          {onGenerateAvatar && (
            <button 
              onClick={async () => {
                const result = await onGenerateAvatar();
                if (result) onSelect(result);
              }}
              className={`flex-grow md:flex-grow-0 px-3 md:px-6 py-2 md:py-3 bg-${themeColor}-500/20 hover:bg-${themeColor}-500 text-${themeColor}-400 hover:text-black transition-all rounded-xl border border-${themeColor}-500/30 font-black uppercase text-[9px] md:text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]`}
            >
              <span className="animate-pulse">✨</span> TẠO AVATAR BẰNG AI
            </button>
          )}
          <button 
            onClick={loadGallery}
            className="p-2 md:p-3 bg-white/5 hover:bg-white/10 text-neutral-400 rounded-xl border border-white/10 transition-all active:scale-95"
          >
            <RefreshCw size={isMobile ? 14 : 20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onClose} 
            className="px-3 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-all rounded-xl border border-white/10 font-black uppercase text-[9px] md:text-xs"
          >
            {isMobile ? '✕' : 'QUAY LẠI [ESC]'}
          </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-3 p-3 md:p-4 bg-black/20 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 px-2 border-r border-white/10 mr-2 shrink-0">
          <Filter size={14} className="text-neutral-500" />
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Lọc:</span>
        </div>
        
        {isMobile ? (
          <div className="flex-grow relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className={`w-full bg-black/60 text-${themeColor}-400 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black uppercase appearance-none focus:outline-none focus:border-${themeColor}-500 transition-all`}
            >
              {tabs.map(tab => (
                <option key={tab} value={tab} className="bg-neutral-900 text-white">
                  {tab}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-${themeColor}-500`}></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap border ${
                  activeTab === tab 
                    ? `bg-${themeColor}-500 text-black border-${themeColor}-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]` 
                    : 'bg-white/5 text-neutral-500 border-white/10 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
             <div className={`w-12 md:w-16 h-12 md:h-16 border-2 border-${themeColor}-500/20 border-t-${themeColor}-500 rounded-full animate-spin mb-6`}></div>
             <span className={`text-${themeColor}-400 font-black uppercase tracking-[0.5em] animate-pulse text-[10px] md:text-xs`}>Accessing_Vault_Data...</span>
          </div>
        ) : filteredGallery.length > 0 ? (
          <div className={`grid gap-3 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'}`}>
            {filteredGallery.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelect(img.url)}
                className={`group aspect-[2/3] rounded-sm overflow-hidden border border-white/10 hover:border-${themeColor}-500 cursor-pointer transition-all relative shadow-2xl active:scale-95`}
              >
                <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                
                <div className={`absolute inset-0 bg-${themeColor}-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]`}>
                   <span className="bg-black/80 text-white text-[8px] md:text-[10px] font-black px-3 py-1.5 uppercase border border-white/10 shadow-2xl">CHỌN ẢNH</span>
                </div>

                {img.genre && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-1.5 py-0.5 bg-${themeColor}-500 text-black text-[6px] md:text-[8px] font-black uppercase rounded shadow-lg`}>
                      {img.genre}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <div className={`text-6xl md:text-[12rem] mb-4 md:mb-8 select-none font-black italic text-${themeColor}-500`}>EMPTY</div>
            <h3 className="text-xl md:text-3xl font-black text-white mono uppercase tracking-[0.5em]">Kho ảnh trống</h3>
            <p className="text-[10px] md:text-xs text-neutral-500 mt-4 uppercase tracking-widest">Vui lòng nạp thêm ảnh trong Thư Viện Ảnh chính</p>
          </div>
        )}
      </div>
    </div>
  );
};
