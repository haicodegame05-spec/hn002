
import React, { useState, useRef } from 'react';
import { AppSettings, AiModel, ThinkingLevel } from '../../types';
import { Trash2, Plus, Upload, ShieldCheck, Cpu, Zap, RefreshCw, Palette, Settings, Key, Sliders, Eye, EyeOff, Maximize, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';
import { gameAI } from '../../services/geminiService';
import { ConfirmModal } from '../ConfirmModal';

interface MobileSettingsModalProps {
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

type Tab = 'general' | 'api';

const PRESET_COLORS = [
  { name: 'Lục bảo', hex: '#10b981' },
  { name: 'Thiên thanh', hex: '#0ea5e9' },
  { name: 'Hoa hồng', hex: '#f43f5e' },
  { name: 'Hổ phách', hex: '#f59e0b' },
  { name: 'Tím thạch anh', hex: '#8b5cf6' },
  { name: 'Ngọc bích', hex: '#06b6d4' },
];

const FONT_OPTIONS = [
  { name: 'Inter (Mặc định)', value: '"Inter"' },
  { name: 'Roboto', value: '"Roboto"' },
  { name: 'Open Sans', value: '"Open Sans"' },
  { name: 'Montserrat', value: '"Montserrat"' },
  { name: 'Playfair Display', value: '"Playfair Display"' },
  { name: 'Cormorant Garamond', value: '"Cormorant Garamond"' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono"' },
  { name: 'Space Grotesk', value: '"Space Grotesk"' },
  { name: 'Be Vietnam Pro', value: '"Be Vietnam Pro"' },
  { name: 'Dancing Script', value: '"Dancing Script"' },
  { name: 'Noto Sans', value: '"Noto Sans"' },
  { name: 'Noto Serif', value: '"Noto Serif"' },
  { name: 'Lora', value: '"Lora"' },
  { name: 'Merriweather', value: '"Merriweather"' },
  { name: 'Oswald', value: '"Oswald"' },
  { name: 'Source Sans 3', value: '"Source Sans 3"' },
  { name: 'Quicksand', value: '"Quicksand"' },
  { name: 'Mulish', value: '"Mulish"' },
  { name: 'Cabin', value: '"Cabin"' },
  { name: 'Nunito', value: '"Nunito"' },
];

const DEFAULT_SETTINGS: AppSettings = {
  aiModel: AiModel.FLASH_3,
  thinkingBudget: 4000,
  thinkingLevel: ThinkingLevel.HIGH,
  contextWindowSize: 10,
  isFullscreen: false,
  mobileMode: true,
  primaryColor: '#10b981',
  adultContent: true,
  difficulty: 'medium',
  effectsEnabled: true,
  theme: 'dark',
  mcGender: '??',
  userApiKeys: [],
  fontSize: 15,
  beautifyContent: false,
  maxNpcsToSendToAi: 5,
  proxyStatus: 'idle',
  imageStyle: 'Ảnh chụp',
};

const IMAGE_STYLES = [
  'Ảnh chụp',
  'Anime',
  'Nghệ thuật số',
  'Tranh sơn dầu',
  'Phác thảo',
  '3D Render',
  'Cyberpunk',
  'Fantasy',
  'Điện ảnh'
];

const IMAGE_MODELS_GEMINI = [
  { id: 'gemini-2.5-flash-image', label: 'Nano Banana (Gemini 2.5 Flash Image)' },
  { id: 'gemini-3.1-flash-image-preview', label: 'Nano Banana 2 (Gemini 3.1 Flash Image)' },
  { id: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro (Gemini 3 Pro Image)' },
];

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = ({ onClose, settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [newKey, setNewKey] = useState('');
  const [proxyError, setProxyError] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxBudget = (settings.aiModel === AiModel.PRO_31 || settings.aiModel === AiModel.PRO_25) ? 32768 : 24576;

  const handleAddKey = () => {
    if (!newKey.trim()) return;
    const extractedKeys = newKey.split(/[\n,\r\s]+/).map(k => k.trim()).filter(k => k.length > 20);
    if (extractedKeys.length === 0) { setNewKey(''); return; }
    const currentKeys = settings.userApiKeys || [];
    const uniqueNewKeys = extractedKeys.filter(k => !currentKeys.includes(k));
    if (uniqueNewKeys.length > 0) {
      onUpdateSettings({ userApiKeys: [...currentKeys, ...uniqueNewKeys] });
      gameAI.resetBlacklist();
    }
    setNewKey('');
  };

  const handleRemoveKey = (keyToRemove: string) => {
    const currentKeys = settings.userApiKeys || [];
    onUpdateSettings({ userApiKeys: currentKeys.filter(k => k !== keyToRemove) });
    gameAI.resetBlacklist();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const extractedKeys = content.split(/[\n,\r]+/).map(k => k.trim()).filter(k => k.length > 20);
      const currentKeys = settings.userApiKeys || [];
      const uniqueNewKeys = extractedKeys.filter(k => !currentKeys.includes(k));
      if (uniqueNewKeys.length > 0) {
        onUpdateSettings({ userApiKeys: [...currentKeys, ...uniqueNewKeys] });
        gameAI.resetBlacklist();
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleLoadModels = async () => {
    if (!settings.proxyUrl || !settings.proxyKey) {
      alert('Vui lòng nhập URL và Key trước khi tải danh sách model');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch(`${settings.proxyUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${settings.proxyKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          const models = data.data.map((m: any) => m.id).sort();
          setAvailableModels(models);
          if (models.length > 0 && !settings.proxyModel) {
            onUpdateSettings({ proxyModel: models[0], proxyStatus: 'success' });
          } else {
            onUpdateSettings({ proxyStatus: 'success' });
          }
          alert(`Đã tải thành công ${models.length} model!`);
        } else {
          alert('Định dạng phản hồi không hợp lệ');
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Lỗi: ${errData.error?.message || response.status}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="MobileSettingsModal fixed inset-0 z-[600] bg-black flex flex-col h-full overflow-hidden font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">SYSTEM_CONFIG</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 text-neutral-400 rounded-xl border border-white/10 active:scale-90 transition-all">✕</button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-white/5 bg-black/20 shrink-0">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-1 flex items-center justify-center gap-2 mono text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'general' ? 'text-emerald-400' : 'text-neutral-600'}`}
        >
          <Settings size={14} />
          Cấu hình
          {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-1 flex items-center justify-center gap-2 mono text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'api' ? 'text-emerald-400' : 'text-neutral-600'}`}
        >
          <Key size={14} />
          API Matrix
          {activeTab === 'api' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-1 pb-32 space-y-1">
        {activeTab === 'general' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* FONT CHỮ */}
            <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-2">
              <div className="flex flex-col gap-0.5 px-1">
                <span className="text-[11px] font-black text-white uppercase tracking-tight">Phông chữ hệ thống</span>
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Thay đổi phông chữ toàn bộ game</span>
              </div>
              <select
                value={settings.fontFamily || 'Inter'}
                onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-emerald-400 outline-none focus:border-emerald-500/50"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value} className="bg-black text-white">
                    {font.name}
                  </option>
                ))}
              </select>

              <div className="h-px bg-white/5 w-full my-1" />

              <div className="flex flex-col gap-0.5 px-1">
                <span className="text-[11px] font-black text-white uppercase tracking-tight">Cỡ chữ cho nội dung</span>
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Điều chỉnh kích thước văn bản (mặc định: 15px)</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <button 
                  onClick={() => onUpdateSettings({ fontSize: Math.max(8, (settings.fontSize || 15) - 1) })}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 active:bg-white/10 text-neutral-400 transition-all"
                >
                  -
                </button>
                <span className="mono text-emerald-400 text-sm font-black">{settings.fontSize || 15}</span>
                <button 
                  onClick={() => onUpdateSettings({ fontSize: Math.min(32, (settings.fontSize || 15) + 1) })}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 active:bg-white/10 text-neutral-400 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* CÁC TÙY CHỌN BẬT/TẮT */}
            <div className="space-y-2">
              <div 
                onClick={() => onUpdateSettings({ mobileMode: !settings.mobileMode })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.mobileMode ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Chế độ di động</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Tối ưu cho màn hình nhỏ</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.mobileMode ? 'bg-emerald-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.mobileMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => onUpdateSettings({ adultContent: !settings.adultContent })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.adultContent ? 'bg-rose-500/5 border-rose-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Nội dung 18+</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Kích hoạt miêu tả chi tiết</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.adultContent ? 'bg-rose-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.adultContent ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

            {/* ĐỘ KHÓ THỰC TẠI */}
            <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-2">
              <div className="flex flex-col gap-0.5 px-1">
                <span className="text-[11px] font-black text-white uppercase tracking-tight">Độ Khó Thực Tại</span>
                <span className="text-[8px] text-neutral-600 font-bold uppercase">Ảnh hưởng tỷ lệ thành công & hậu quả</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Dễ', color: 'emerald' },
                  { id: 'medium', label: 'Trung Bình', color: 'blue' },
                  { id: 'hard', label: 'Khó', color: 'orange' },
                  { id: 'hell', label: 'Địa Ngục', color: 'rose' },
                  { id: 'asian', label: 'Asian', color: 'fuchsia' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onUpdateSettings({ difficulty: d.id as any })}
                    className={`py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${settings.difficulty === d.id ? `bg-${d.color}-500/20 border-${d.color}-500 text-${d.color}-400` : 'bg-white/5 border-white/10 text-neutral-500'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

              <div 
                onClick={() => onUpdateSettings({ isNovelMode: !settings.isNovelMode })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.isNovelMode ? 'bg-indigo-500/5 border-indigo-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Chế độ tiểu thuyết</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">AI viết dài & xử lý chuỗi hành động</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.isNovelMode ? 'bg-indigo-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.isNovelMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => onUpdateSettings({ beautifyContent: !settings.beautifyContent })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.beautifyContent ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Làm đẹp cho nội dung</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Bong bóng chat & phong cách riêng</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.beautifyContent ? 'bg-emerald-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.beautifyContent ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => onUpdateSettings({ effectsEnabled: !settings.effectsEnabled })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.effectsEnabled ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Hiệu ứng hình ảnh</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Ánh sáng & Chuyển động</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.effectsEnabled ? 'bg-emerald-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.effectsEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => onUpdateSettings({ isFullscreen: !settings.isFullscreen })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.isFullscreen ? 'bg-blue-500/5 border-blue-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Toàn màn hình</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Mở rộng không gian hiển thị</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.isFullscreen ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.isFullscreen ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => onUpdateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                className={`p-1 rounded-2xl border transition-all flex items-center justify-between ${settings.theme === 'light' ? 'bg-amber-500/5 border-amber-500/40' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">Chế độ nền sáng</span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Giao diện tông màu sáng</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${settings.theme === 'light' ? 'bg-amber-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.theme === 'light' ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>

              {/* TỰ ĐỘNG TẠO ẢNH MÔ TẢ */}
              <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-4">
                <div 
                  onClick={() => onUpdateSettings({ autoGenerateImages: !settings.autoGenerateImages })}
                  className={`flex items-center justify-between cursor-pointer`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${settings.autoGenerateImages ? 'text-cyan-400' : 'text-white'}`}>Tự động tạo ảnh mô tả</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">AI tự động minh họa lượt chơi</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${settings.autoGenerateImages ? 'bg-cyan-500' : 'bg-neutral-800'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.autoGenerateImages ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </div>
                </div>

                {settings.autoGenerateImages && (
                  <div className="space-y-4 pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 px-1">Mô hình tạo ảnh (Model)</label>
                      <div className="relative">
                        <select
                          value={settings.imageModel || 'gemini-2.5-flash-image'}
                          onChange={(e) => onUpdateSettings({ imageModel: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-cyan-400 outline-none focus:border-cyan-500/50 transition-all appearance-none"
                        >
                          <optgroup label="Mô hình mặc định (Gemini)" className="bg-black text-neutral-500">
                            {IMAGE_MODELS_GEMINI.map(m => (
                              <option key={m.id} value={m.id} className="bg-black text-white">{m.label}</option>
                            ))}
                          </optgroup>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500/50 text-[8px]">
                          ▼
                        </div>
                      </div>
                      <p className="text-[8px] text-neutral-600 font-bold uppercase italic px-1">
                        * Các model Nano Banana được cung cấp miễn phí bởi Google AI Studio thông qua Gemini API Key của bạn.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 px-1">Phong cách ảnh (Style)</label>
                      <div className="relative">
                        <select
                          value={settings.imageStyle || 'Ảnh chụp'}
                          onChange={(e) => onUpdateSettings({ imageStyle: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-cyan-400 outline-none focus:border-cyan-500/50 transition-all appearance-none"
                        >
                          {IMAGE_STYLES.map(style => (
                            <option key={style} value={style} className="bg-black text-white">{style}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500/50 text-[8px]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MÀU SẮC */}
            <div className="space-y-2">
              <div className="px-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Màu sắc chủ đạo</h4>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-2xl space-y-3">
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color.hex}
                      onClick={() => onUpdateSettings({ primaryColor: color.hex })}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${settings.primaryColor === color.hex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-transparent'}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {settings.primaryColor === color.hex && <span className="text-white text-[10px] font-black">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-xl border border-white/10 shrink-0 shadow-lg" style={{ backgroundColor: settings.primaryColor }}></div>
                  <input 
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => onUpdateSettings({ primaryColor: e.target.value })}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 mono text-xs font-black text-white outline-none focus:border-emerald-500/50"
                    placeholder="#HEX"
                  />
                </div>
              </div>
            </div>

            {/* LÕI XỬ LÝ AI */}
            <div className="space-y-2">
              <div className="px-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Lõi xử lý AI</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.PRO_31 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.PRO_31 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">III-PRO-3.1</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Tối Thượng</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Phiên bản 3.1 mới nhất, cân bằng hoàn hảo.</p>
                  {settings.aiModel === AiModel.PRO_31 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.FLASH_LITE_31 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.FLASH_LITE_31 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">III-LITE-3.1</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Tinh Gọn</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Phiên bản 3.1 Lite, cực nhanh.</p>
                  {settings.aiModel === AiModel.FLASH_LITE_31 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.FLASH_3 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.FLASH_3 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">III-FLASH</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Thần Tốc</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Mặc định, phản hồi siêu tốc.</p>
                  {settings.aiModel === AiModel.FLASH_3 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.PRO_25 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.PRO_25 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">II.V-PRO</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Thông Thái</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Logic ổn định, miêu tả sâu.</p>
                  {settings.aiModel === AiModel.PRO_25 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.FLASH_25 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.FLASH_25 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">II.V-FLASH</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Cân Bằng</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Phiên bản 2.5 Flash, ổn định.</p>
                  {settings.aiModel === AiModel.FLASH_25 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
                <button 
                  onClick={() => onUpdateSettings({ aiModel: AiModel.FLASH_LITE_25 })}
                  className={`p-1 rounded-2xl border transition-all text-left relative ${settings.aiModel === AiModel.FLASH_LITE_25 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="block mono text-[8px] font-black text-emerald-400 uppercase mb-1">II.V-LITE</span>
                  <span className="text-sm font-black text-white uppercase italic">Xung Nhịp Tiết Kiệm</span>
                  <p className="text-[9px] text-neutral-500 font-bold mt-1">Phiên bản 2.5 Lite, nhẹ nhàng.</p>
                  {settings.aiModel === AiModel.FLASH_LITE_25 && <div className="absolute top-2 right-2 text-emerald-500 text-xs">✓</div>}
                </button>
              </div>
            </div>

            {/* THANH TRƯỢT */}
            <div className="space-y-6">
              <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-2">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Cửa sổ Ngữ cảnh</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">Số lượt hội thoại AI ghi nhớ</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={settings.contextWindowSize}
                      onChange={(e) => onUpdateSettings({ contextWindowSize: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="bg-transparent mono text-emerald-400 text-xs font-black w-10 outline-none text-center"
                    />
                    <span className="text-[8px] text-neutral-700 font-black uppercase">Lượt</span>
                  </div>
                </div>
              </div>

              <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-2">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Giới hạn NPC gửi cho AI</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">Số lượng NPC tối đa (Mặc định: 5)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
                    <input 
                      type="number"
                      min="1"
                      max="50"
                      value={settings.maxNpcsToSendToAi || 5}
                      onChange={(e) => onUpdateSettings({ maxNpcsToSendToAi: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="bg-transparent mono text-emerald-400 text-xs font-black w-10 outline-none text-center"
                    />
                    <span className="text-[8px] text-neutral-700 font-black uppercase">NPC</span>
                  </div>
                </div>
              </div>

              {/* THINKING LEVEL MOBILE */}
              {settings.aiModel.includes('gemini-3') && (
                <>
                  <div className="p-1 rounded-2xl border bg-white/[0.02] border-white/5 space-y-2">
                    <div className="flex flex-col gap-0.5 px-1">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">Cấp độ Suy luận</span>
                      <span className="text-[8px] text-neutral-600 font-bold uppercase">Chỉ Gemini 3. HIGH: Sâu, LOW: Nhanh</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: ThinkingLevel.LOW, label: 'LOW', color: 'blue' },
                        { id: ThinkingLevel.HIGH, label: 'HIGH', color: 'emerald' }
                      ].map((l) => (
                        <button
                          key={l.id}
                          disabled={settings.thinkingBudget > 0}
                          onClick={() => onUpdateSettings({ thinkingLevel: l.id })}
                          className={`py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${settings.thinkingBudget > 0 ? 'opacity-20 grayscale' : ''} ${settings.thinkingLevel === l.id ? `bg-${l.color}-500/20 border-${l.color}-500 text-${l.color}-400` : 'bg-white/5 border-white/10 text-neutral-500'}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Ngân sách Suy luận</span>
                        <span className="mono text-emerald-400 text-xs font-black">{settings.thinkingBudget.toLocaleString()} TKNS</span>
                      </div>
                      <input 
                        type="range" min="0" max={maxBudget} step="512"
                        value={settings.thinkingBudget}
                        onChange={(e) => onUpdateSettings({ thinkingBudget: parseInt(e.target.value) })}
                        className="w-full h-1 bg-neutral-800 rounded-full appearance-none accent-emerald-500"
                      />
                      <div className="px-2 space-y-1">
                        <p className="text-[8px] text-amber-500/80 font-bold uppercase italic">* Mặc định: 4,000 Tokens.</p>
                        <p className="text-[8px] text-neutral-600 font-bold uppercase italic leading-tight">
                          * Nếu Ngân sách &gt; 0, Cấp độ suy luận sẽ bị tắt. Kéo về 0 để dùng Cấp độ.
                        </p>
                      </div>
                    </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* API MATRIX SECTION */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest italic">Ma Trận API</h4>
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px] transition-all duration-500 ${
                  settings.userApiKeys && settings.userApiKeys.length > 0 
                    ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' 
                    : 'bg-neutral-700 shadow-transparent'
                }`} />
              </div>
              <div className="flex gap-2 px-2">
                <button 
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: 'Xác nhận Reset API',
                      message: 'Bạn có chắc chắn muốn xóa toàn bộ API Key và cấu hình Proxy không?',
                      onConfirm: () => {
                        onUpdateSettings({
                          userApiKeys: [],
                          proxyUrl: '',
                          proxyKey: '',
                          proxyModel: '',
                          proxyStatus: 'idle'
                        });
                        setAvailableModels([]);
                        gameAI.resetBlacklist();
                      },
                      type: 'danger'
                    });
                  }}
                  className="flex-1 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl mono text-[8px] font-black text-rose-400 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={10} />
                  RESET TAB API
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-neutral-400 active:scale-90 transition-all"
                >
                  <Upload size={14} />
                </button>
              </div>
              <input type="file" accept=".txt" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

              <div className="flex gap-2">
                <textarea 
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Dán API Key..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 mono text-[10px] font-black text-emerald-400 outline-none min-h-[46px] max-h-[100px] resize-none"
                  rows={1}
                />
                <button 
                  onClick={handleAddKey}
                  className="p-3 bg-emerald-500 text-black rounded-xl active:scale-90 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[200px]">
                <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <span className="mono text-[8px] font-black text-neutral-500 uppercase tracking-widest">Danh sách ({settings.userApiKeys?.length || 0})</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowKeys(!showKeys)} className="text-neutral-500">
                      {showKeys ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => gameAI.resetBlacklist()} className="text-neutral-500">
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-2 space-y-2">
                  {(!settings.userApiKeys || settings.userApiKeys.length === 0) ? (
                    <div className="py-12 flex flex-col items-center justify-center text-neutral-700 space-y-2">
                      <Zap size={24} />
                      <p className="mono text-[8px] font-black uppercase tracking-widest">Trống</p>
                    </div>
                  ) : (
                    settings.userApiKeys.map((key, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-[8px] font-black text-emerald-500 mono">{idx + 1}</div>
                        <div className="flex-grow mono text-[9px] text-neutral-400 truncate">
                          {showKeys ? key : `${key.substring(0, 8)}••••••••${key.substring(key.length - 4)}`}
                        </div>
                        <button onClick={() => handleRemoveKey(key)} className="p-1 text-neutral-600 active:scale-90 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* PROXY CONFIGURATION */}
            <section className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">Cấu hình Proxy</span>
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px] transition-all duration-500 ${
                  settings.proxyStatus === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' :
                  settings.proxyStatus === 'testing' ? 'bg-yellow-500 shadow-yellow-500/50 animate-pulse' :
                  settings.proxyStatus === 'error' ? 'bg-rose-500 shadow-rose-500/50' :
                  'bg-neutral-700 shadow-transparent'
                }`} />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="mono text-[8px] font-black text-neutral-600 uppercase tracking-widest">Proxy URL</label>
                    <button 
                      onClick={handleLoadModels}
                      disabled={isLoadingModels}
                      className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded mono text-[7px] font-black text-purple-400"
                    >
                      {isLoadingModels ? <RefreshCw size={8} className="animate-spin" /> : <RefreshCw size={8} />}
                      LOAD MODELS
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={settings.proxyUrl || ''}
                    onChange={(e) => onUpdateSettings({ proxyUrl: e.target.value })}
                    placeholder="https://openrouter.ai/api/v1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 mono text-[10px] text-purple-300 outline-none focus:border-purple-500/50"
                  />
                </div>
                {/* Proxy Model Selection */}
                {(availableModels.length > 0 || settings.proxyModel) && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    <label className="mono text-[8px] font-black text-neutral-600 uppercase tracking-widest">Chọn Model Proxy</label>
                    <select 
                      value={settings.proxyModel || ''}
                      onChange={(e) => onUpdateSettings({ proxyModel: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 mono text-[10px] text-purple-300 outline-none focus:border-purple-500/50"
                    >
                      {!settings.proxyModel && <option value="">-- Chọn Model --</option>}
                      {availableModels.length > 0 ? (
                        availableModels.map(m => (
                          <option key={m} value={m} className="bg-black text-white">{m}</option>
                        ))
                      ) : settings.proxyModel ? (
                        <option value={settings.proxyModel}>{settings.proxyModel}</option>
                      ) : null}
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="mono text-[8px] font-black text-neutral-600 uppercase tracking-widest">Proxy Key</label>
                  <input 
                    type="password"
                    value={settings.proxyKey || ''}
                    onChange={(e) => onUpdateSettings({ proxyKey: e.target.value })}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 mono text-[10px] text-purple-300 outline-none focus:border-purple-500/50"
                  />
                </div>

                {proxyError && (
                  <p className="text-[8px] text-rose-400 mono font-black uppercase text-center animate-pulse">
                    &gt; ERROR: {proxyError}
                  </p>
                )}
              </div>
              <p className="text-[8px] text-neutral-600 font-bold italic leading-relaxed">
                * Hỗ trợ chuẩn <span className="text-purple-400">OpenAI API</span> (OpenRouter, Groq, DeepSeek...).
              </p>
              <p className="text-[8px] text-neutral-600 font-bold italic leading-relaxed mt-1">
                * Chỉ cần tải Model thành công và chọn Model, thông tin sẽ được lưu tự động. Ưu tiên dùng Proxy nếu được cấu hình. Nếu trống sẽ dùng Key AI Studio.
              </p>
            </section>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-2 bg-black/80 border-t border-white/5 shrink-0 flex gap-2">
        <button 
          onClick={() => {
            setConfirmConfig({
              isOpen: true,
              title: 'Khôi phục cài đặt gốc',
              message: 'Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định không? (Bao gồm cả API Key)',
              onConfirm: () => {
                onUpdateSettings(DEFAULT_SETTINGS);
                gameAI.resetBlacklist();
              },
              type: 'danger'
            });
          }}
          className="flex-1 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl mono text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Reset Gốc
        </button>
        <button 
          onClick={onClose}
          className="flex-[2] py-3 bg-emerald-500 text-black rounded-2xl mono text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
        >
          Lưu & Quay lại
        </button>
      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        type={confirmConfig.type}
      />
    </div>
  );
};
