
import React, { useRef, useState, useEffect } from 'react';
import { Player, GameGenre, GalleryImage, AppSettings } from '../../types';
import { dbService } from '../../services/dbService';
import { uploadImage, fetchCloudinaryImages, deleteImageFromCloudinary, checkSystemHealth } from '../../services/uploadService';
import { Upload, Trash2, RefreshCw, X, Tag, User, MoreHorizontal } from 'lucide-react';

interface MobileLibraryModalProps {
  onClose: () => void;
  player: Player;
  onUpdatePlayer: (player: Player) => void;
}

export const MobileLibraryModal: React.FC<MobileLibraryModalProps> = ({ onClose, player, onUpdatePlayer }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cloudinaryGallery, setCloudinaryGallery] = useState<string[]>([]);
  const [localGallery, setLocalGallery] = useState<GalleryImage[]>([]);
  const [libraryMode, setLibraryMode] = useState<'shared' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<GameGenre | 'All'>('All');
  const [systemMode, setSystemMode] = useState<'full' | 'basic'>('basic');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const initLibrary = async () => {
    setIsLoading(true);
    const health = await checkSystemHealth();
    setSystemMode(health.mode);
    
    const localImages = await dbService.getLocalImages();
    setLocalGallery(localImages);

    if (health.mode === 'full') {
      const images = await fetchCloudinaryImages();
      setCloudinaryGallery(images);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initLibrary();
  }, []);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const mode = libraryMode === 'shared' ? 'cloud' : 'local';
      if (mode === 'cloud' && systemMode !== 'full') return;

      const uploadPromises = Array.from(files).map(file => uploadImage(file, mode));
      const uploadedUrls = await Promise.all(uploadPromises);
      await loadGallery();
      
      const newGallery = [...player.gallery];
      uploadedUrls.forEach(url => {
        if (!newGallery.find(g => g.url === url)) {
          newGallery.unshift({ url, tags: [], genre: undefined });
        }
      });
      
      onUpdatePlayer({ ...player, gallery: newGallery });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!tempUrl.trim()) return;
    const url = tempUrl.trim();
    setIsUploading(true);
    try {
      const newGallery = [...player.gallery];
      if (!newGallery.find(g => g.url === url)) {
        newGallery.unshift({ url, tags: ["external"], genre: undefined });
      }
      onUpdatePlayer({ ...player, gallery: newGallery });
      
      if (libraryMode === 'local') {
        await dbService.saveLocalImage(url, ["external"], undefined);
        await loadGallery();
      }
      
      setShowUrlInput(false);
      setTempUrl('');
    } catch (error) {
      console.error("URL submit failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const permanentDelete = async (url: string) => {
    if (libraryMode === 'shared') {
      if (systemMode !== 'full') return;

      const originalGallery = [...player.gallery];
      const originalCloudGallery = [...cloudinaryGallery];

      const newGallery = player.gallery.filter(img => img.url !== url);
      onUpdatePlayer({ ...player, gallery: newGallery });
      setCloudinaryGallery(prev => prev.filter(img => img !== url));
      setSelectedImage(null);

      try {
        await deleteImageFromCloudinary(url);
      } catch (err) {
        console.error("Delete error:", err);
        onUpdatePlayer({ ...player, gallery: originalGallery });
        setCloudinaryGallery(originalCloudGallery);
      }
    } else {
      // Local Delete - Optimistic
      const originalLocalGallery = [...localGallery];
      setLocalGallery(prev => prev.filter(img => img.url !== url));
      setSelectedImage(null);

      try {
        await dbService.deleteLocalImage(url);
      } catch (err) {
        console.error("Delete error:", err);
        setLocalGallery(originalLocalGallery);
      }
    }
  };

  const setAsPcAvatar = (image: string) => {
    onUpdatePlayer({ ...player, avatar: image });
    setSelectedImage(null);
  };

  const addTag = async (url: string) => {
    if (!newTag.trim()) return;
    if (libraryMode === 'local') {
      const img = localGallery.find(g => g.url === url);
      if (img) {
        const tags = img.tags.includes(newTag.trim()) ? img.tags : [...img.tags, newTag.trim()];
        await dbService.saveLocalImage(url, tags, img.genre);
        await loadGallery();
      }
    } else {
      const newGallery = player.gallery.map(img => {
        if (img.url === url) {
          const tags = img.tags.includes(newTag.trim()) ? img.tags : [...img.tags, newTag.trim()];
          return { ...img, tags };
        }
        return img;
      });
      onUpdatePlayer({ ...player, gallery: newGallery });
    }
    setNewTag('');
  };

  const removeTag = async (url: string, tag: string) => {
    if (libraryMode === 'local') {
      const img = localGallery.find(g => g.url === url);
      if (img) {
        const tags = img.tags.filter(t => t !== tag);
        await dbService.saveLocalImage(url, tags, img.genre);
        await loadGallery();
      }
    } else {
      const newGallery = player.gallery.map(img => {
        if (img.url === url) {
          return { ...img, tags: img.tags.filter(t => t !== tag) };
        }
        return img;
      });
      onUpdatePlayer({ ...player, gallery: newGallery });
    }
  };

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

  return (
    <div className="MobileLibraryModal fixed inset-0 z-[600] bg-black flex flex-col h-full overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" multiple />
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${systemMode === 'full' ? 'bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]' : 'bg-neutral-600'}`}></div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">MEDIA_VAULT</h2>
          
          <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5 ml-2">
            <button 
              onClick={() => setLibraryMode('local')}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${libraryMode === 'local' ? 'bg-indigo-500 text-black' : 'text-neutral-500'}`}
            >
              Máy
            </button>
            <button 
              onClick={() => setLibraryMode('shared')}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${libraryMode === 'shared' ? 'bg-indigo-500 text-black' : 'text-neutral-500'}`}
            >
              Chung
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 text-neutral-400 rounded-xl border border-white/10 active:scale-90 transition-all">✕</button>
      </div>

      {/* ACTIONS BAR */}
      <div className="p-1 border-b border-white/5 bg-black/20 flex gap-2 shrink-0 overflow-x-auto custom-scrollbar">
        {libraryMode === 'shared' ? (
          systemMode === 'full' && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 min-w-[140px] py-3 bg-indigo-500 text-black rounded-xl flex items-center justify-center gap-2 mono text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
              >
                <Upload size={14} /> {isUploading ? 'Đang tải...' : 'Nạp Ảnh Chung'}
              </button>
              <button 
                onClick={() => setShowUrlInput(true)}
                className="px-4 py-3 bg-white/5 text-indigo-400 border border-white/10 rounded-xl active:scale-95 transition-all font-black text-[10px] uppercase"
              >
                Dán URL
              </button>
            </>
          )
        ) : (
          <>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 min-w-[140px] py-3 bg-indigo-500 text-black rounded-xl flex items-center justify-center gap-2 mono text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              <Upload size={14} /> {isUploading ? 'Đang nạp...' : 'Nạp Ảnh Máy'}
            </button>
            <button 
              onClick={() => setShowUrlInput(true)}
              className="px-4 py-3 bg-white/5 text-indigo-400 border border-white/10 rounded-xl active:scale-95 transition-all font-black text-[10px] uppercase"
            >
              Dán URL
            </button>
          </>
        )}
        <button 
          onClick={loadGallery}
          className="px-4 py-3 bg-white/5 text-indigo-400 border border-white/10 rounded-xl active:scale-95 transition-all"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* TABS / FILTERS */}
      <div className="p-2 border-b border-white/5 bg-black/20 shrink-0">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-black/60 text-indigo-400 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase appearance-none focus:outline-none focus:border-indigo-500 transition-all"
          >
            {tabs.map(tab => (
              <option key={tab} value={tab} className="bg-neutral-900 text-white">
                LỌC: {tab}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-indigo-500"></div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-1 relative">
        {showUrlInput && (
          <div className="absolute inset-0 z-[1001] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-4">THÊM ẢNH TỪ URL</h3>
              <div className="space-y-4">
                <input 
                  autoFocus
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-400 font-black uppercase text-xs transition-all"
                  >
                    HỦY
                  </button>
                  <button 
                    onClick={handleUrlSubmit}
                    className="flex-1 py-4 bg-indigo-500 text-black font-black uppercase text-xs rounded-xl hover:opacity-90 transition-all"
                  >
                    XÁC NHẬN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <RefreshCw size={48} className="animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Đang truy xuất dữ liệu...</p>
          </div>
        ) : filteredGallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 pb-20">
            {filteredGallery.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(img.url)}
                className="aspect-[2/3] rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden relative group active:scale-95 transition-all"
              >
                <img src={img.url} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex flex-wrap gap-1">
                  {img.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1 py-0.5 bg-indigo-500/20 border border-indigo-500/40 rounded text-[6px] text-indigo-400 font-black uppercase">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
            <span className="text-6xl mb-4">🖼️</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Kho ảnh đang trống</p>
          </div>
        )}
      </div>

      {/* IMAGE DETAIL MODAL (MOBILE) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[700] bg-[var(--bg)]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-1 border-b border-white/10 shrink-0">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Chi tiết tài sản</span>
            <button onClick={() => setSelectedImage(null)} className="p-2 text-neutral-400">✕</button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-1 space-y-1">
            <div className="aspect-[2/3] w-full max-w-[280px] mx-auto rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl">
              <img src={selectedImage} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => setAsPcAvatar(selectedImage)}
                  className="flex-1 py-3 bg-emerald-500 text-black rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <User size={14} /> Dùng làm Avatar
                </button>
                {libraryMode === 'shared' ? (
                  systemMode === 'full' && (
                    <button 
                      onClick={() => permanentDelete(selectedImage)}
                      className="px-4 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  )
                ) : (
                  <button 
                    onClick={() => permanentDelete(selectedImage)}
                    className="px-4 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Nhãn dán (Tags)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayGallery.find(g => g.url === selectedImage)?.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-neutral-400 flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag(selectedImage, tag)} className="text-rose-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Thêm tag mới..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                  <button onClick={() => addTag(selectedImage)} className="px-4 py-2 bg-indigo-500 text-black rounded-xl text-[10px] font-black uppercase">Thêm</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
