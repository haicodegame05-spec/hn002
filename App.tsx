
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { GAME_ARCHETYPES } from './constants';
import { Header } from './components/Layout/Header';
import { LandingView } from './views/LandingView';
import { FanficView } from './fanfic/FanficView';
import { GameCard } from './components/GameCard';
import { PlayingView } from './views/PlayingView';
import { McModal } from './components/McModal';

// Direct imports instead of lazy load
import { CustomIdentityModal } from './components/CustomIdentityModal';
import { HaremModal } from './components/HaremModal';
import { FamilyModal } from './components/FamilyModal';
import { SocialModal } from './components/SocialModal';
import { CodexModal } from './components/CodexModal';
import { NpcProfileModal } from './components/NpcProfileModal';
import { SaveManagerModal } from './components/SaveManagerModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { LibraryModal } from './components/LibraryModal';
import { MemoryModal } from './components/MemoryModal';
import { AiHintModal } from './components/AiHintModal';

// Mobile Modals
import { MobileWorldSelect } from './components/Mobile/MobileWorldSelect';
import { MobileContextSelect } from './components/Mobile/MobileContextSelect';
import { MobileScenarioSelect } from './components/Mobile/MobileScenarioSelect';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#050505] flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-rose-500 uppercase tracking-tighter italic">Hệ Thống Gặp Lỗi Nghiêm Trọng</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Ma Trận AI đã gặp phải một sự cố không mong muốn trong quá trình kiến tạo thực tại.
              Dữ liệu hiện tại có thể đã bị gián đoạn.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-left overflow-auto max-h-32">
              <code className="text-[10px] text-rose-400/70 mono break-all">
                {this.state.error?.message || "Lỗi không xác định"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Tái khởi động Ma Trận
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useGameLogic } from './hooks/useGameLogic';
import { Relationship, GameGenre } from './types';
import { dbService } from './services/dbService';
import { FREE_STYLE_ARCHETYPE } from './constants/freeStyle';

const App: React.FC = () => {
  const {
    view, setView,
    selectedWorld, setSelectedWorld,
    selectedContext, setSelectedContext,
    logs, setLogs,
    isLoading,
    isSavingStatus,
    gameTime, setGameTime, formatGameTime,
    modals, setModals,
    player, setPlayer,
    activeNpcProfile, setActiveNpcProfile,
    handleCommand, handleStartGame, handleBack, handleExit,
    handleRetry,
    handleStartNewGameFlow,
    handleStartFreeStyle,
    resetPlayer,
    handleStartFanficGame,
    handleManualSave,
    markAsViewed,
    settings, updateSettings, loadSaveData,
    deleteNpc,
    toggleLock,
    generateAiAvatar
  } = useGameLogic();

  const [customScenario, setCustomScenario] = useState('');
  const importSetupRef = useRef<HTMLInputElement>(null);

  const handleExportSetup = () => {
    const setupData = {
      player,
      customScenario,
      selectedWorldId: selectedWorld?.id,
      selectedContextId: selectedContext?.id
    };
    const dataStr = JSON.stringify(setupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const worldName = (selectedWorld?.title || 'Game').replace(/\s+/g, '_');
    const playerName = (player.name || 'Unknown').replace(/\s+/g, '_');
    const fileName = `Matrix_Setup_${worldName}_${playerName}.json`;

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
  };

  const handleImportSetup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.player) setPlayer(data.player);
        if (data.customScenario !== undefined) setCustomScenario(data.customScenario);
        alert("Nhập dữ liệu thành công!");
      } catch (err) {
        alert("Tệp không hợp lệ!");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const anyModalOpen = Object.values(modals).some(v => v === true);
        if (anyModalOpen) {
          setModals(Object.keys(modals).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any));
        } else if (view === 'playing' || view === 'fanfic-select') {
          handleExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modals, setModals, view, handleExit]);

  const openNpcProfile = useCallback((npc: Relationship) => { 
    setActiveNpcProfile(npc); 
    setModals(prev => ({ ...prev, npcProfile: true })); 
  }, [setActiveNpcProfile, setModals]);

  const handleLoadSpecificSave = async (slotId: string) => {
    const data = await dbService.load(slotId);
    if (data) {
      loadSaveData(data);
      setModals(prev => ({ ...prev, saveManager: false, history: false }));
    }
  };

  return (
    <ErrorBoundary>
      <div 
        className={`h-screen flex flex-col bg-[#050505] overflow-hidden text-neutral-200 ${!settings.effectsEnabled ? 'no-effects' : ''} ${settings.theme === 'light' ? 'theme-light' : ''}`}
        style={{ 
          '--app-font-size': `${settings.fontSize || 15}px`,
          fontSize: 'var(--app-font-size)',
        } as React.CSSProperties}
      >
      {view === 'playing' && !settings.mobileMode && (
        <Header 
          player={player}
          gameTime={formatGameTime(gameTime)} 
          currentLocation={player.currentLocation}
          isSaving={isSavingStatus} 
          modals={modals} 
          setModals={setModals} 
          handleBack={handleBack} 
          handleExit={handleExit}
          view={view} 
          onManualSave={handleManualSave}
          onRetry={handleRetry}
          isLoading={isLoading}
          settings={settings}
          onUpdateSettings={updateSettings}
          markAsViewed={markAsViewed}
        />
      )}
      
      <main className="flex-grow flex flex-col overflow-hidden relative">
          {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={importSetupRef} 
        onChange={handleImportSetup} 
        className="hidden" 
        accept=".json" 
      />

      {view === 'landing' && (
            <LandingView 
              player={player}
              settings={settings}
              onUpdateSettings={updateSettings}
              onStart={handleStartNewGameFlow} 
              onStartFanfic={() => setView('fanfic-select')}
              onStartFreeStyle={handleStartFreeStyle}
              onContinue={async () => {
                const latest = await dbService.getLatestSave();
                if (latest) handleLoadSpecificSave(latest.slot);
              }}
              onOpenSaveManager={() => setModals({...modals, saveManager: true})}
              onOpenSettings={() => setModals({...modals, settings: true})} 
            />
          )}
          
          {view === 'fanfic-select' && (
            <FanficView 
              onBack={handleBack}
              onExit={handleExit}
              onStartGame={handleStartFanficGame}
              settings={settings}
            />
          )}
          
          {view === 'world-select' && (
            settings.mobileMode ? (
              <MobileWorldSelect 
                archetypes={GAME_ARCHETYPES} 
                onSelect={(a) => { setSelectedWorld(a); setView('context-select'); }} 
                onBack={handleBack} 
              />
            ) : (
              <div className={`flex-grow flex flex-col items-center overflow-y-auto custom-scrollbar ${settings.mobileMode ? 'p-4 pb-20' : 'p-12 pb-24'}`}>
                <div className="absolute top-8 left-8">
                  <button 
                    onClick={handleBack}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>❮</span> Quay Lại
                  </button>
                </div>
                <h2 className={`${settings.mobileMode ? 'text-4xl' : 'text-7xl'} font-black text-white uppercase tracking-tighter italic mb-8 md:mb-16 text-center`}>
                  Vạn Giới <span className="text-emerald-500">Hồng Trần</span>
                </h2>
                <div className={`grid gap-4 md:gap-8 w-full max-w-[120rem] ${settings.mobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-6'}`}>
                  {GAME_ARCHETYPES.map(a => <GameCard key={a.id} archetype={a} onSelect={() => { setSelectedWorld(a); setView('context-select'); }} />)}
                </div>
              </div>
            )
          )}

          {view === 'context-select' && selectedWorld && (
            settings.mobileMode ? (
              <MobileContextSelect 
                world={selectedWorld} 
                onSelect={(sub) => { setSelectedContext(sub); setView('scenario-select'); }} 
                onBack={handleBack} 
                onCustom={selectedWorld.genre !== GameGenre.FREE_STYLE ? () => setModals({ ...modals, customIdentity: true }) : undefined}
              />
            ) : (
              <div className={`flex-grow flex flex-col overflow-hidden ${settings.mobileMode ? 'p-4' : 'p-12'}`}>
                <div className={`flex justify-between items-center mb-6 md:mb-12 ${settings.mobileMode ? 'flex-col gap-4' : ''}`}>
                  {!settings.mobileMode && (
                    <div className="w-48">
                      <button 
                        onClick={handleBack}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                      >
                        <span>❮</span> Quay Lại
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <h2 className={`${settings.mobileMode ? 'text-3xl' : 'text-6xl'} font-black text-white uppercase tracking-tighter text-center`}>
                      Chọn <span className="text-emerald-500">Bối Cảnh</span>
                    </h2>
                  </div>
                  <div className={`${settings.mobileMode ? 'w-full' : 'w-auto'} flex justify-end gap-3`}>
                    {selectedWorld.genre !== GameGenre.FREE_STYLE && (
                      <button 
                        onClick={() => setModals({ ...modals, customIdentity: true })}
                        className="w-full md:w-auto px-6 py-3 bg-emerald-500/10 border border-dashed border-emerald-500/40 rounded-2xl text-emerald-500 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95 flex items-center justify-center gap-3"
                      >
                        <span className="text-lg">✨</span>
                        <span>Tùy Chọn</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className={`flex-grow overflow-y-auto custom-scrollbar grid gap-4 md:gap-6 ${settings.mobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                  {selectedWorld.subScenarios.map(sub => (
                    <div key={sub.id} onClick={() => { setSelectedContext(sub); setView('scenario-select'); }} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-neutral-900/40 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-xl flex flex-col min-h-[120px] md:min-h-[160px]">
                      <h3 className="text-xs md:text-sm font-black text-white group-hover:text-emerald-400 uppercase mb-2 md:mb-4">{sub.title.replace("Bối cảnh: ", "")}</h3>
                      <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold leading-relaxed">{sub.description}</p>
                      <div className="mt-auto pt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] md:text-[10px] mono font-black text-emerald-500">TIẾP TỤC ❯</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {view === 'scenario-select' && selectedContext && (
            settings.mobileMode ? (
              <MobileScenarioSelect 
                context={selectedContext} 
                onSelect={(sc) => {
                  if (typeof sc !== 'string' && sc.id === 'custom') setModals({...modals, customIdentity: true});
                  else handleStartGame(`${selectedContext.title}: ${typeof sc === 'string' ? sc : sc.label}`);
                }} 
                onBack={handleBack} 
                onMcSetup={() => setModals({ ...modals, identity: true })}
                isFreeStyle={selectedWorld?.genre === GameGenre.FREE_STYLE}
                onExport={handleExportSetup}
                onImport={() => importSetupRef.current?.click()}
              />
            ) : (
              <div className={`ScenarioSelect flex-grow flex flex-col overflow-hidden ${selectedWorld?.genre === GameGenre.FREE_STYLE ? 'p-0' : 'p-12'}`}>
                <div className={`${selectedWorld?.genre === GameGenre.FREE_STYLE ? 'p-8 pb-4' : ''} relative flex flex-col items-center shrink-0`}>
                  <div className="absolute top-0 left-0">
                    <button 
                      onClick={handleBack}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>❮</span> Quay Lại
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 flex gap-3">
                    <button 
                      onClick={handleExportSetup}
                      className="px-4 py-3 bg-amber-500/10 border border-dashed border-amber-500/40 rounded-2xl text-amber-500 font-black uppercase text-[10px] tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                      title="Xuất dữ liệu thiết lập"
                    >
                      <span>📤</span>
                    </button>
                    <button 
                      onClick={() => importSetupRef.current?.click()}
                      className="px-4 py-3 bg-blue-500/10 border border-dashed border-blue-500/40 rounded-2xl text-blue-400 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                      title="Nhập dữ liệu thiết lập"
                    >
                      <span>📥</span>
                    </button>
                    <button 
                      onClick={() => setModals({ ...modals, identity: true })}
                      className="px-6 py-3 bg-blue-500/10 border border-dashed border-blue-500/40 rounded-2xl text-blue-500 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-black transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-95 flex items-center gap-3"
                    >
                      <span className="text-lg">👤</span>
                      <span>Nhân Vật Chính</span>
                    </button>
                    {selectedWorld?.genre !== GameGenre.FREE_STYLE && (
                      <button 
                        onClick={() => setModals({ ...modals, customIdentity: true })}
                        className="px-6 py-3 bg-emerald-500/10 border border-dashed border-emerald-500/40 rounded-2xl text-emerald-500 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95 flex items-center gap-3"
                      >
                        <span className="text-lg">✨</span>
                        <span>Tùy Chọn</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col items-center mb-6 md:mb-8">
                    <h2 className={`${settings.mobileMode ? 'text-3xl' : 'text-6xl'} font-black text-white uppercase tracking-tighter mb-2 md:mb-4 text-center`}>
                      {selectedWorld?.genre === GameGenre.FREE_STYLE ? 'Kiến Tạo' : 'Chọn'} <span className="text-emerald-500">{selectedWorld?.genre === GameGenre.FREE_STYLE ? 'Thực Tại' : 'Kịch Bản'}</span>
                    </h2>
                    <p className="text-neutral-500 text-center uppercase mono text-[10px] md:text-xs tracking-widest font-black italic mb-2">{selectedContext.title}</p>
                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest italic">Bỏ qua thiết lập nhân vật chính cũng được, AI sẽ dùng thiết lập mặc định của game</p>
                  </div>
                </div>

                {selectedWorld?.genre === GameGenre.FREE_STYLE ? (
                  <div className="flex-grow flex gap-8 px-12 pb-12 overflow-hidden">
                    {/* Left Column: Suggestions */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4">
                      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 mb-2">
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Gợi ý bối cảnh</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/10 rounded text-[8px] mono text-emerald-500 font-bold">{selectedContext.scenarios.length} mục</span>
                      </div>
                      {selectedContext.scenarios.map((sc: string, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => setCustomScenario(sc)}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] mono font-black text-emerald-500/40 group-hover:text-emerald-500 transition-colors">#{idx + 1}</span>
                            <div className="h-px flex-grow bg-white/5"></div>
                          </div>
                          <p className="text-[11px] text-neutral-400 group-hover:text-white font-bold leading-relaxed line-clamp-3">{sc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Right Column: Editor */}
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                      <div className="relative group flex-grow">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
                        <textarea 
                          value={customScenario}
                          onChange={(e) => setCustomScenario(e.target.value)}
                          placeholder="Nhập bối cảnh thế giới của bạn tại đây... (Vd: Một thế giới nơi con người có thể điều khiển trọng lực, bạn là một thợ săn tiền thưởng đang bị truy nã gắt gao...)"
                          className="relative w-full h-full p-8 bg-neutral-900 border border-white/10 rounded-2xl text-white font-medium text-sm md:text-base focus:border-emerald-500 focus:outline-none transition-all custom-scrollbar resize-none shadow-2xl"
                        />
                      </div>
                      
                      <div className="flex justify-center">
                        <button 
                          onClick={() => {
                            if (!customScenario.trim()) {
                              alert("Vui lòng nhập bối cảnh!");
                              return;
                            }
                            handleStartGame(`${selectedContext.title}: ${customScenario.trim()}`);
                          }}
                          className="w-full max-w-md h-16 bg-emerald-500 text-black font-black uppercase text-sm rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-4 group"
                        >
                          <span className="tracking-[0.2em]">KHỞI CHẠY THỰC TẠI</span>
                          <span className="text-2xl group-hover:translate-x-2 transition-transform">❯❯</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-[120rem] mx-auto px-2 md:px-4">
                    {selectedContext.scenarios.map((sc, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleStartGame(`${selectedContext.title}: ${sc}`)} 
                        className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 bg-neutral-900/40 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-lg flex items-center gap-4 md:gap-6 h-fit"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-500 font-black mono text-lg md:text-xl group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          {idx + 1}
                        </div>
                        <div className="flex-grow">
                          <p className="text-neutral-200 text-xs md:text-sm font-bold leading-relaxed group-hover:text-white transition-colors">{sc}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                           <span className="text-[9px] md:text-[10px] mono font-black text-emerald-500">BẮT ĐẦU ❯</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
          
          {view === 'playing' && selectedWorld && (
            <PlayingView 
              player={player} 
              genre={selectedWorld.genre} 
              logs={logs} 
              isLoading={isLoading} 
              handleCommand={handleCommand} 
              onOpenAiHint={() => setModals({...modals, aiHint: true})}
              openNpcProfile={openNpcProfile} 
              settings={settings}
              gameTime={formatGameTime(gameTime)}
              currentLocation={player.currentLocation}
              isSaving={isSavingStatus}
              modals={modals}
              setModals={setModals}
              handleBack={handleBack}
              handleExit={handleExit}
              onManualSave={handleManualSave}
              onRetry={handleRetry}
              selectedWorld={selectedWorld}
              onUpdateSettings={updateSettings}
              activeNpcProfile={activeNpcProfile}
              setActiveNpcProfile={setActiveNpcProfile}
              view={view}
            />
          )}
        </main>

      <McModal 
          player={player} 
          genre={selectedWorld?.genre} 
          isOpen={modals.identity} 
          onClose={() => setModals({...modals, identity: false})} 
          onUpdatePlayer={setPlayer} 
          settings={settings} 
          initialEditing={view !== 'playing'}
          gameTime={gameTime}
          isGameStarted={view === 'playing'}
          onToggleLock={toggleLock}
          onGenerateAvatar={generateAiAvatar}
        />

        <CustomIdentityModal 
          isOpen={modals.customIdentity}
          onClose={() => setModals({...modals, customIdentity: false})}
          selectedWorld={selectedWorld}
          onSelectIdentity={(identity) => {
            setModals({...modals, customIdentity: false});
            handleStartGame(typeof identity === 'string' ? identity : identity.label);
          }}
          onSwitchWorld={setSelectedWorld}
          settings={settings}
          onMcSetup={() => setModals({ ...modals, identity: true, customIdentity: false })}
        />

        <HaremModal player={player} genre={selectedWorld?.genre} isOpen={modals.harem} onClose={() => setModals({...modals, harem: false})} onOpenProfile={openNpcProfile} settings={settings} />

        <FamilyModal player={player} genre={selectedWorld?.genre} isOpen={modals.family} onClose={() => setModals({...modals, family: false})} onOpenProfile={openNpcProfile} settings={settings} />

        <SocialModal player={player} genre={selectedWorld?.genre} isOpen={modals.social} onClose={() => setModals({...modals, social: false})} onOpenProfile={openNpcProfile} settings={settings} />

        <CodexModal 
          player={player} 
          genre={selectedWorld?.genre} 
          isOpen={modals.codex} 
          onClose={() => setModals({...modals, codex: false})} 
          settings={settings} 
          markAsViewed={markAsViewed}
        />

        <MemoryModal 
          isOpen={modals.memory} 
          onClose={() => setModals({...modals, memory: false})} 
          settings={settings} 
          logs={logs}
          turnCount={player.turnCount}
        />

        <AiHintModal isOpen={modals.aiHint} onClose={() => setModals({...modals, aiHint: false})} player={player} onUpdatePlayer={setPlayer} settings={settings} />

        <LibraryModal player={player} isOpen={modals.library} onClose={() => setModals({...modals, library: false})} onUpdatePlayer={setPlayer} settings={settings} />

        <NpcProfileModal 
          npc={activeNpcProfile} 
          player={player} 
          isOpen={modals.npcProfile} 
          genre={selectedWorld?.genre} 
          onClose={() => setModals({...modals, npcProfile: false})} 
          onUpdateNpc={(n) => { 
            setPlayer(prev => ({...prev, relationships: prev.relationships.map(r => r.id === n.id ? n : r)})); 
            setActiveNpcProfile(n); 
          }} 
          onDeleteNpc={(id) => {
            deleteNpc(id);
          }}
          onSwitchNpc={setActiveNpcProfile} 
          markAsViewed={markAsViewed}
          settings={settings}
          gameTime={gameTime}
        />

        <SaveManagerModal isOpen={modals.saveManager} onClose={() => setModals({...modals, saveManager: false})} onLoadSave={handleLoadSpecificSave} settings={settings} />

        <HistoryModal isOpen={modals.history} onClose={() => setModals({...modals, history: false})} logs={logs} onLoadSave={handleLoadSpecificSave} settings={settings} />

        <SettingsModal isOpen={modals.settings} onClose={() => setModals({...modals, settings: false})} settings={settings} onUpdateSettings={updateSettings} />
    </div>
    </ErrorBoundary>
  );
};

export default App;
