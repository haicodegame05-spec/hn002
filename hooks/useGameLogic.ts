
import { useState, useCallback, useEffect } from 'react';
import { GameLog, GameArchetype, Player, SubScenario, Relationship, GameTime, GameGenre, AppSettings, AiModel, CodexEntry, getGenreMeta, ThinkingLevel } from '../types';
import { FanficWork, FanficCharacter } from '../fanfic/types';
import { gameAI } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { memoryService } from '../services/memoryService';
import { compensateNpcData, mergeNpcData, isValidValue } from '../services/npcService';
import { GAME_ARCHETYPES } from '../constants';
import { FANFIC_ARCHETYPE } from '../fanfic/constants';
import { FREE_STYLE_ARCHETYPE } from '../constants/freeStyle';

import { CUSTOM_CULTIVATION } from '../dataCustomCultivation';
import { CUSTOM_URBAN_NORMAL } from '../dataCustomUrbanNormal';
import { CUSTOM_WUXIA } from '../dataCustomWuxia';
import { CUSTOM_FANTASY_HUMAN } from '../dataCustomFantasyHuman';
import { CUSTOM_FANTASY_MULTI } from '../dataCustomFantasyMulti';
import { CUSTOM_URBAN_SUPER } from '../dataCustomUrbanSuper';

export type ViewState = 'landing' | 'world-select' | 'context-select' | 'scenario-select' | 'playing' | 'fanfic-select';

export const INITIAL_PLAYER_STATE: Player = {
  name: '??',
  avatar: '',
  gender: '??' as any,
  age: 0,
  birthday: '',
  health: 100,
  maxHealth: 100,
  level: 1,
  gold: 0,
  exp: 0,
  turnCount: 0,
  stats: { strength: 0, intelligence: 0, agility: 0, charisma: 0, luck: 0, soul: 0, merit: 0 },
  lineage: '??',
  spiritRoot: '??',
  physique: '??',
  systemName: '',
  personality: '??',
  currentLocation: 'Khởi đầu thực tại',
  assets: [],
  relationships: [],
  codex: [],
  quests: [],
  skills: [],
  inventory: [],
  gallery: [],
  identities: [],
  customFields: [],
  nextNpcId: 1,
  aiHints: { oneTurn: '', permanent: '', longResponse: false, customHints: [] },
  lockedFields: [],
  newFields: []
};

// Helper to normalize arrays of objects (inventory, skills, assets)
const normalizeObjectArray = (arr: any[]) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') {
      return { name: item, description: 'Chưa có mô tả chi tiết.' };
    }
    if (item && typeof item === 'object') {
      const name = item.name || item.title || 'Vô danh';
      const description = item.description || item.desc || 'Chưa có mô tả chi tiết.';
      return {
        name: (name === undefined || name === null || String(name) === 'undefined') ? 'Vô danh' : String(name),
        description: (description === undefined || description === null || String(description) === 'undefined') ? 'Chưa có mô tả chi tiết.' : String(description)
      };
    }
    return { name: 'Vô danh', description: 'Chưa có mô tả chi tiết.' };
  });
};

export const useGameLogic = () => {
  const [view, setView] = useState<ViewState>('landing');

  const [selectedWorld, setSelectedWorld] = useState<GameArchetype | null>(null);
  const [selectedContext, setSelectedContext] = useState<SubScenario | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [isSavingStatus, setIsSaving] = useState(false);
  
  const [lastAction, setLastAction] = useState<{ type: 'start' | 'command' | 'fanfic-start', data: any } | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('matrix_settings');
    const defaultSettings: AppSettings = {
      aiModel: AiModel.FLASH_3,
      thinkingBudget: 4000,
      thinkingLevel: ThinkingLevel.HIGH,
      contextWindowSize: 10,
      isFullscreen: false,
      mobileMode: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
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
      autoGenerateImages: false,
      imageModel: 'gemini-2.5-flash-image',
      imageStyle: 'Ảnh chụp',
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed, isFullscreen: false }; // Always start non-fullscreen
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Automatic mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile !== settings.mobileMode) {
        setSettings(prev => ({ ...prev, mobileMode: isMobile }));
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.mobileMode]);

  // Persist settings to localStorage and IndexedDB
  useEffect(() => {
    const syncSettings = async () => {
      const { isFullscreen, proxyStatus, ...rest } = settings;
      // Save to localStorage for fast initial load
      localStorage.setItem('matrix_settings', JSON.stringify(rest));
      // Save to IndexedDB for persistence
      try {
        await dbService.saveSettings(rest);
      } catch (err) {
        console.error("Failed to save settings to IndexedDB", err);
      }
    };
    syncSettings();
  }, [settings]);

  const [gameTime, setGameTime] = useState<GameTime>({
    year: 0, month: 0, day: 0, hour: 0, minute: 0
  });
  
  const [modals, setModals] = useState({
    identity: false, harem: false, family: false, social: false, codex: false, 
    memory: false, library: false, npcProfile: false, save: false, history: false, 
    settings: false, customIdentity: false, saveManager: false,
    aiHint: false
  });
  
  const [activeNpcProfile, setActiveNpcProfile] = useState<Relationship | null>(null);
  
  const [player, setPlayer] = useState<Player>(() => JSON.parse(JSON.stringify(INITIAL_PLAYER_STATE)));

  // Apply primary color to CSS variables
  useEffect(() => {
    if (!settings.primaryColor) return;
    
    // Convert hex to RGB for the --primary-rgb variable
    const hex = settings.primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }
    document.documentElement.style.setProperty('--app-font-size', `${settings.fontSize || 15}px`);
    document.documentElement.style.setProperty('--app-font', settings.fontFamily || '"Inter"');
  }, [settings.primaryColor, settings.fontSize, settings.fontFamily]);

  useEffect(() => {
    const handleFsChange = () => {
      const isActualFs = !!document.fullscreenElement;
      setSettings(prev => (prev.isFullscreen !== isActualFs ? { ...prev, isFullscreen: isActualFs } : prev));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const loadSaveData = useCallback((data: any, shouldSetView: boolean = true) => {
    if (!data) return;
    const loadedPlayer = { 
      ...data.player, 
      quests: Array.isArray(data.player.quests) ? data.player.quests : [],
      currentLocation: data.player.currentLocation || 'Khởi đầu thực tại'
    };
    if (loadedPlayer.personality === 'Chưa thức tỉnh nhân cách') {
      loadedPlayer.personality = '';
    }
    setPlayer(loadedPlayer);
    setLogs(data.logs || []);
    setGameTime(data.gameTime);
    setLastAction(data.lastAction || null);
    if (data.selectedWorld) {
      setSelectedWorld(data.selectedWorld);
      setSelectedContext(data.selectedContext || null);
      if (shouldSetView) setView(data.view || 'playing');
    } else {
      if (shouldSetView) setView('landing');
    }
    if (data.memory) memoryService.setState(data.memory);
  }, [setView]);

  useEffect(() => {
    const initLoad = async () => {
      try {
        // 1. Load settings from IndexedDB (Source of truth)
        const dbSettings = await dbService.getSettings();
        if (dbSettings) {
          setSettings(prev => ({ ...prev, ...dbSettings, isFullscreen: false }));
        }

        // 2. Load latest save
        const latest = await dbService.getLatestSave();
        if (latest?.data) {
          // Load data but force landing view on F5
          loadSaveData(latest.data, false);
          setView('landing');
        }
      } catch (err) { console.error("DB Load Error", err); }
    };
    initLoad();
  }, [loadSaveData, setView]);

  const triggerAutoSave = useCallback(async (overrides?: any) => {
    const currentPlayer = overrides?.player || player;
    const currentView = overrides?.view || view;
    const worldToSave = overrides?.selectedWorld || selectedWorld;

    if (!worldToSave && currentView === 'playing') {
      console.warn("AutoSave blocked: No selectedWorld while in playing view.");
      return;
    }

    setIsSaving(true);
    const slotIndex = currentPlayer.turnCount % 10;
    const slotId = `auto_slot_${slotIndex}`;
    const dataToSave = {
      player: currentPlayer,
      logs: overrides?.logs || logs,
      gameTime: overrides?.gameTime || gameTime,
      selectedWorld: worldToSave,
      selectedContext: overrides?.selectedContext || selectedContext,
      view: currentView,
      settings: overrides?.settings || settings,
      memory: memoryService.getState(),
      lastAction: overrides?.lastAction || lastAction
    };
    try { 
      await dbService.save(dataToSave, slotId); 
      await dbService.save(dataToSave, 'current_session');
    } catch (err) {
      console.error("AutoSave failed:", err);
    } finally { 
      setTimeout(() => setIsSaving(false), 800); 
    }
  }, [player, logs, gameTime, selectedWorld, selectedContext, view, settings]);

  const formatGameTime = useCallback((t: GameTime) => {
    if (!t || t.year === 0) return "Ngày ??/??/???? | ??:??";
    const d = t.day ? t.day.toString().padStart(2, '0') : '??';
    const m = t.month ? t.month.toString().padStart(2, '0') : '??';
    const y = t.year || '????';
    const h = t.hour !== undefined ? t.hour.toString().padStart(2, '0') : '??';
    const min = t.minute !== undefined ? t.minute.toString().padStart(2, '0') : '??';
    return `Ngày ${d}/${m}/${y} | ${h}:${min}`;
  }, []);

  const handleCommand = useCallback(async (command: string, timeCost?: number, isRetry: boolean = false) => {
    if (!command.trim() || isLoading || !selectedWorld) return;
    
    // Luôn cập nhật hành động cuối cùng để có thể "Tải Lại"
    setLastAction({ type: 'command', data: { command, timeCost } });

    let currentLogs = [...logs];
    
    if (isRetry) {
      // Khi tải lại, chúng ta dọn dẹp các log lỗi hoặc narrator của lượt thất bại trước đó
      // nhưng giữ lại log của người chơi để terminal không bị trống trải
      const lastNonSystemIdx = [...currentLogs].reverse().findIndex(l => l.type === 'error' || l.type === 'narrator');
      if (lastNonSystemIdx !== -1) {
        currentLogs = currentLogs.slice(0, currentLogs.length - 1 - lastNonSystemIdx);
      }
      setLogs(currentLogs);
      
      // Đồng bộ hóa: Lưu ngay lập tức giống như lượt chơi bình thường
      triggerAutoSave({ 
        logs: currentLogs, 
        lastAction: { type: 'command', data: { command, timeCost } } 
      });
    } else {
      const playerLog: GameLog = { content: command, type: 'player', timestamp: Date.now() };
      currentLogs.push(playerLog);
      setLogs(currentLogs);
      
      // Lưu ngay lập tức để bảo toàn trạng thái nếu AI gặp lỗi hoặc người dùng F5
      triggerAutoSave({ 
        logs: currentLogs, 
        lastAction: { type: 'command', data: { command, timeCost } } 
      });
    }
    
    setIsLoading(true);
    setLoadingProgress(10);
    setLoadingStep('Khởi tạo yêu cầu...');
    
    const startTime = performance.now();
    try {
      setLoadingProgress(30);
      setLoadingStep('Phân tích bối cảnh...');
      
      // Lịch sử chỉ bao gồm các lượt đã HOÀN THÀNH (cặp Player + Narrator)
      // Không bao gồm hành động hiện tại đang gửi (command)
      const history = currentLogs
        .filter(l => (l.type === 'player' || l.type === 'narrator') && l.content !== command)
        .map(l => ({ role: l.type === 'player' ? 'user' : 'model', parts: [{ text: l.content }] }))
        .slice(-(settings.contextWindowSize * 2));
      
      setLoadingProgress(50);
      setLoadingStep('Kết nối Ma Trận AI...');
      
      const timeStr = gameTime.year === 0 ? "Ngày ??/??/???? | ??:??" : formatGameTime(gameTime);
      const update = await gameAI.getResponse(
        command, 
        history, 
        player, 
        selectedWorld.genre, 
        selectedWorld.id.startsWith('fanfic_'),
        selectedWorld.systemInstruction, 
        settings, 
        (currentLogs[currentLogs.length - 1]?.metadata?.newNpcCount || 0), 
        timeStr
      );
      
      setLoadingProgress(80);
      setLoadingStep('Đang nhận phản hồi...');
      
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      // Luôn tăng lượt chơi khi AI phản hồi thành công, bất kể là tải lại hay lượt mới
      let updatedPlayer = { ...player, turnCount: player.turnCount + 1 };
      
      // Update token usage
      const latestTokens = update.tokenUsage || 0;
      const totalTokens = (updatedPlayer.tokenUsage?.total || 0) + latestTokens;
      const oldHistory = updatedPlayer.tokenUsage?.history || [];
      const newHistory = [latestTokens, ...oldHistory].slice(0, 5);
      updatedPlayer.tokenUsage = {
        latest: latestTokens,
        total: totalTokens,
        history: newHistory
      };

      const narratorText = update.text || "";
      const usedKeyIndex = update.usedKeyIndex;
      const usedModel = update.usedModel;
      const usedProxy = update.usedProxy;
      
      const isProxy = !!usedProxy;
      const coreLabel = isProxy ? "PROXY_CORE" : (usedKeyIndex ? `CORE_${usedKeyIndex}` : "SYSTEM_CORE");
      const modelLabel = usedModel ? ` | ${isProxy ? 'PROXY_MODEL' : 'MODEL'}: ${usedModel}` : "";
      const proxyLabel = usedProxy ? ` | GATEWAY: ${usedProxy}` : "";
      
      const justification = update.evolutionJustification;
      const newRelsRaw = Array.isArray(update.newRelationships) ? update.newRelationships : [];
      let currentRels: Relationship[] = [...updatedPlayer.relationships].map(r => ({ ...r, isPresent: false }));
      let newNpcCount = 0;
      newRelsRaw.forEach(rawNpc => {
        if (!rawNpc || (!rawNpc.id && !rawNpc.name)) return;
        
        const existingIdx = currentRels.findIndex(r => 
          (rawNpc.id && r.id === rawNpc.id) || 
          (r.name && rawNpc.name && r.name.toLowerCase() === rawNpc.name.toLowerCase())
        );

        if (existingIdx > -1) {
          const oldAffinity = currentRels[existingIdx].affinity || 0;
          const oldLoyalty = currentRels[existingIdx].loyalty || 0;
          const oldLust = currentRels[existingIdx].lust || 0;
          const oldLibido = currentRels[existingIdx].libido || 0;

          currentRels[existingIdx] = mergeNpcData(currentRels[existingIdx], rawNpc, narratorText, gameTime.year, justification);
          currentRels[existingIdx].isPresent = true;

          // Detect changes for notification
          const newAffinity = currentRels[existingIdx].affinity || 0;
          const newLoyalty = currentRels[existingIdx].loyalty || 0;
          const newLust = currentRels[existingIdx].lust || 0;
          const newLibido = currentRels[existingIdx].libido || 0;
          const reason = rawNpc.affinityChangeReason || (rawNpc as any).affinity_change_reason || (rawNpc as any).affinity_reason || (rawNpc as any).reason;

          const createChangeLog = (label: string, oldVal: number, newVal: number) => {
            if (oldVal !== newVal) {
              const diff = newVal - oldVal;
              const sign = diff > 0 ? '+' : '';
              return `[ ${currentRels[existingIdx].name} ] [ ${label} ${sign}${diff} ] [ ${newVal}/1000 ]${reason ? ` [ Lý do: ${reason} ]` : ''}`;
            }
            return null;
          };

          const affLog = createChangeLog('Thiện cảm', oldAffinity, newAffinity);
          const loyLog = createChangeLog('Trung thành', oldLoyalty, newLoyalty);
          const lustLog = createChangeLog('Hưng phấn', oldLust, newLust);
          const libidoLog = createChangeLog('Bản tính dâm', oldLibido, newLibido);

          const combinedNpcLogs = [affLog, loyLog, lustLog, libidoLog].filter(Boolean).join('\n');
          if (combinedNpcLogs) {
            currentLogs.push({
              content: `GM: ${combinedNpcLogs}`,
              type: 'system',
              timestamp: Date.now()
            });
          }
        } else {
          const npcWithId = { ...rawNpc, id: `npc_${String(updatedPlayer.nextNpcId++).padStart(6, '0')}` };
          currentRels.push(compensateNpcData({ ...npcWithId, isPresent: true, viewed: false }, gameTime.year));
          newNpcCount++;
        }
      });
      updatedPlayer.relationships = currentRels;
      let finalNarratorText = narratorText;
      if (justification) {
        finalNarratorText += `\n\n[ GIẢI TRÌNH THAY ĐỔI ]: ${justification}`;
      }
      finalNarratorText += `\n\n[ THỜI GIAN KIẾN TẠO THỰC TẠI: ${duration} GIÂY | ${coreLabel}${modelLabel}${proxyLabel} ]`;
      
      const narratorLog: GameLog = { 
        content: finalNarratorText, 
        type: 'narrator', 
        timestamp: Date.now(), 
        suggestedActions: update.suggestedActions,
        metadata: { duration, usedKeyIndex, usedModel, usedProxy, newNpcCount }
      };
      
      // currentLogs đã chứa log người chơi và đã được dọn dẹp nếu là retry
      const finalLogs = [...currentLogs, narratorLog];
      
      setLogs(finalLogs);
      
      // Tự động tạo ảnh mô tả nếu được bật
      if (settings.autoGenerateImages) {
        setLoadingStep("Đang phác họa hình ảnh thực tại...");
        try {
          const styleMap: Record<string, string> = {
            'Ảnh chụp': 'realistic photo',
            'Anime': 'anime style',
            'Nghệ thuật số': 'digital art',
            'Tranh sơn dầu': 'oil painting',
            'Phác thảo': 'sketch',
            '3D Render': '3D render',
            'Cyberpunk': 'cyberpunk style',
            'Fantasy': 'fantasy art',
            'Điện ảnh': 'cinematic'
          };
          const style = styleMap[settings.imageStyle || ''] || settings.imageStyle || 'digital art';
          const imagePrompt = `A high quality ${style} illustration for a text-based game. Scene description: ${narratorText}. Genre: ${selectedWorld.genre}. High detail, cinematic lighting, masterpiece.`;
          const imageUrl = await gameAI.generateImage(imagePrompt, settings);
          if (imageUrl) {
            setLogs(prev => prev.map((l, idx) => 
              idx === prev.length - 1 ? { ...l, imageUrl } : l
            ));
          }
        } catch (err) {
          console.error("Failed to generate image:", err);
        }
      }

      // AI-driven time progression (Strictly AI-controlled)
      const nextTime = update.newTime || gameTime;
      if (update.newTime) {
        setGameTime(update.newTime);
      }
      
      if (update.statsUpdates) {
        const s = update.statsUpdates;
        const newFields = updatedPlayer.newFields || [];

        if (s.health !== undefined && !updatedPlayer.lockedFields?.includes('health')) updatedPlayer.health = Math.min(updatedPlayer.maxHealth, Math.max(0, updatedPlayer.health + s.health));
        if (s.maxHealth !== undefined && !updatedPlayer.lockedFields?.includes('maxHealth')) updatedPlayer.maxHealth = s.maxHealth;
        if (s.gold !== undefined && !updatedPlayer.lockedFields?.includes('gold')) updatedPlayer.gold = Math.max(0, updatedPlayer.gold + s.gold);
        if (s.exp !== undefined && !updatedPlayer.lockedFields?.includes('exp')) updatedPlayer.exp += s.exp;
        if (s.level !== undefined && !updatedPlayer.lockedFields?.includes('level')) updatedPlayer.level = s.level;
        
        const canUpdate = (field: string, newVal: any, oldVal: any) => {
          if (newVal === undefined || newVal === null) return false;
          if (updatedPlayer.lockedFields?.includes(field)) return false;
          // Bảo vệ dữ liệu hợp lệ: Không cho phép ghi đè một giá trị hợp lệ bằng một placeholder
          if (isValidValue(oldVal) && !isValidValue(newVal)) return false;
          return newVal !== oldVal;
        };

        const trackField = (key: string, newVal: any, oldVal: any) => {
          if (canUpdate(key, newVal, oldVal)) {
            if (!isValidValue(oldVal) && isValidValue(newVal)) {
              if (!newFields.includes(key)) newFields.push(key);
            }
          }
        };

        if (canUpdate('name', s.name, updatedPlayer.name)) {
          trackField('name', s.name, updatedPlayer.name);
          updatedPlayer.name = s.name;
        }
        
        if (canUpdate('title', s.title, updatedPlayer.title)) {
          trackField('title', s.title, updatedPlayer.title);
          updatedPlayer.title = s.title;
        }
        
        if (canUpdate('lineage', s.lineage, updatedPlayer.lineage)) {
          trackField('lineage', s.lineage, updatedPlayer.lineage);
          updatedPlayer.lineage = s.lineage;
        }
        
        if (canUpdate('currentLocation', s.currentLocation, updatedPlayer.currentLocation)) {
          trackField('currentLocation', s.currentLocation, updatedPlayer.currentLocation);
          updatedPlayer.currentLocation = s.currentLocation;
        }
        
        if (canUpdate('systemName', s.systemName, updatedPlayer.systemName)) {
          trackField('systemName', s.systemName, updatedPlayer.systemName);
          updatedPlayer.systemName = s.systemName;
        }
        
        if (canUpdate('personality', s.personality, updatedPlayer.personality)) {
          trackField('personality', s.personality, updatedPlayer.personality);
          updatedPlayer.personality = s.personality;
        }
        
        if (canUpdate('gender', s.gender, updatedPlayer.gender)) {
          trackField('gender', s.gender, updatedPlayer.gender);
          updatedPlayer.gender = s.gender;
        }
        
        if (canUpdate('age', s.age, updatedPlayer.age)) {
          trackField('age', s.age, updatedPlayer.age);
          updatedPlayer.age = s.age;
        }
        
        if (canUpdate('birthday', s.birthday, updatedPlayer.birthday)) {
          trackField('birthday', s.birthday, updatedPlayer.birthday);
          updatedPlayer.birthday = s.birthday;
        }
        
        if (canUpdate('spiritRoot', s.spiritRoot, updatedPlayer.spiritRoot)) {
          trackField('spiritRoot', s.spiritRoot, updatedPlayer.spiritRoot);
          updatedPlayer.spiritRoot = s.spiritRoot;
        }
        
        if (canUpdate('physique', s.physique, updatedPlayer.physique)) {
          trackField('physique', s.physique, updatedPlayer.physique);
          updatedPlayer.physique = s.physique;
        }
        
        if (canUpdate('avatar', s.avatar, updatedPlayer.avatar)) {
          trackField('avatar', s.avatar, updatedPlayer.avatar);
          if (s.avatar && (s.avatar.startsWith('http') || s.avatar.startsWith('data:') || s.avatar.startsWith('/'))) {
            updatedPlayer.avatar = s.avatar;
          }
        }
        
        if (s.customCurrency && !updatedPlayer.lockedFields?.includes('customCurrency')) updatedPlayer.customCurrency = s.customCurrency;
        if (s.statLabels && !updatedPlayer.lockedFields?.includes('statLabels')) updatedPlayer.statLabels = { ...updatedPlayer.statLabels, ...s.statLabels };
        if (Array.isArray(s.customFields) && !updatedPlayer.lockedFields?.includes('customFields')) updatedPlayer.customFields = s.customFields;
        
        if (Array.isArray(s.inventory) && !updatedPlayer.lockedFields?.includes('inventory')) updatedPlayer.inventory = normalizeObjectArray(s.inventory);
        if (Array.isArray(s.skills) && !updatedPlayer.lockedFields?.includes('skills')) updatedPlayer.skills = normalizeObjectArray(s.skills);
        if (Array.isArray(s.assets) && !updatedPlayer.lockedFields?.includes('assets')) updatedPlayer.assets = normalizeObjectArray(s.assets);
        if (Array.isArray(s.identities) && !updatedPlayer.lockedFields?.includes('identities')) updatedPlayer.identities = s.identities;

        if (s.stats) {
          Object.entries(s.stats).forEach(([statKey, statVal]) => {
            const fieldKey = `stat_${statKey}`;
            const oldVal = (updatedPlayer.stats as any)[statKey];
            
            if (!updatedPlayer.lockedFields?.includes(fieldKey)) {
              trackField(fieldKey, statVal, oldVal);
              (updatedPlayer.stats as any)[statKey] = statVal;
            }
          });
        }

        // Remove redundant absolute updates that were already handled as deltas or are inconsistent
        // if (s.health !== undefined && !updatedPlayer.lockedFields?.includes('health')) updatedPlayer.health = s.health;
        // if (s.maxHealth !== undefined && !updatedPlayer.lockedFields?.includes('maxHealth')) updatedPlayer.maxHealth = s.maxHealth;
        // if (s.gold !== undefined && !updatedPlayer.lockedFields?.includes('gold')) updatedPlayer.gold = s.gold;
        // if (s.level !== undefined && !updatedPlayer.lockedFields?.includes('level')) updatedPlayer.level = s.level;
        // if (s.exp !== undefined && !updatedPlayer.lockedFields?.includes('exp')) updatedPlayer.exp = s.exp;

        updatedPlayer.newFields = newFields;
      }
      if (update.currentLocation && !updatedPlayer.lockedFields?.includes('currentLocation')) updatedPlayer.currentLocation = update.currentLocation;

      if (Array.isArray(update.questUpdates) && !updatedPlayer.lockedFields?.includes('quests')) {
        let currentQuests = [...updatedPlayer.quests];
        update.questUpdates.forEach(q => {
          const idx = currentQuests.findIndex(cq => cq.id === q.id);
          if (idx > -1) {
            currentQuests[idx] = { ...currentQuests[idx], ...q };
          } else {
            currentQuests.push(q);
            // Notify new quest
            currentLogs.push({
              content: `[ NHIỆM VỤ MỚI ]: ${q.title}`,
              type: 'system',
              timestamp: Date.now()
            });
          }
        });
        updatedPlayer.quests = currentQuests;
      }

      if (update.newCodexEntry) {
        const entry = { ...update.newCodexEntry, viewed: false };
        const exists = updatedPlayer.codex.some(c => c.title === entry.title);
        if (!exists) updatedPlayer.codex = [...updatedPlayer.codex, entry];
      }

      // Ensure genre entry exists in Codex
      const genreTitle = `Hệ Thống Thế Giới: ${selectedWorld.genre}`;
      const hasGenreEntry = updatedPlayer.codex.some(c => c.title.includes('Hệ Thống Thế Giới') || c.title.includes('Thể loại'));
      if (!hasGenreEntry) {
        const genreEntry: CodexEntry = {
          category: 'destiny',
          title: genreTitle,
          content: `### Phân Loại Thực Tại\n\nThế giới này được vận hành theo quy luật: **${selectedWorld.genre}**.\n\n### Đặc trưng thế giới\n\n${selectedWorld.description}\n\n### Tính năng cốt lõi\n\n${selectedWorld.features.map(f => `- ${f}`).join('\n')}`,
          unlocked: true,
          viewed: false
        };
        updatedPlayer.codex = [...updatedPlayer.codex, genreEntry];
      }

      if (Array.isArray(update.newCodexEntries)) {
        update.newCodexEntries.forEach(entry => {
          const entryWithViewed = { ...entry, viewed: false };
          const exists = updatedPlayer.codex.some(c => c.title === entryWithViewed.title);
          if (!exists) updatedPlayer.codex.push(entryWithViewed);
        });
      }

      setPlayer(updatedPlayer);
      if (updatedPlayer.aiHints?.oneTurn) {
        setPlayer(prev => ({
          ...prev,
          aiHints: { ...prev.aiHints!, oneTurn: '' }
        }));
      }
      memoryService.updateMemory(finalLogs, updatedPlayer.turnCount);
      triggerAutoSave({ 
        player: updatedPlayer, 
        logs: finalLogs, 
        gameTime: nextTime,
        lastAction: null // Clear last action on success
      });
      
      setLoadingProgress(100);
      setLoadingStep('Đồng bộ thực tại...');
    } catch (error: any) {
      console.error("Game AI Error:", error);
      const coreIndex = error?.usedKeyIndex;
      const coreInfo = coreIndex ? ` (Core #${coreIndex})` : " (System Core)";
      
      const errorMessage = error?.message?.includes("API_KEY_INVALID") 
        ? `API Key${coreInfo} không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại Ma Trận API.`
        : error?.message?.includes("quota")
        ? `Hết hạn mức API${coreInfo} (Rate Limit). Vui lòng thử lại sau hoặc thêm API Key mới.`
        : error?.message?.includes("SAFETY_BLOCK")
        ? `[BỘ LỌC AN TOÀN]: ${error.message.split(": ")[1] || "Nội dung bị chặn do quá nhạy cảm."}`
        : error?.message?.includes("PARSE_ERROR")
        ? `[LỖI DỮ LIỆU]: ${error.message.split(": ")[1] || "Lỗi phân tích lượng tử."}`
        : `Mất kết nối thực tại tại${coreInfo} hoặc lỗi hệ thống: ${error?.message || "Không rõ nguyên nhân"}`;
        
      setLogs(prev => {
        const newLogs = [...prev, { 
          content: `[ CẢNH BÁO HỆ THỐNG ]: ${errorMessage}`, 
          type: 'error', 
          timestamp: Date.now(),
          metadata: { usedKeyIndex: coreIndex }
        } as GameLog];
        // Save error state so user can refresh and still see the error and retry
        triggerAutoSave({ logs: newLogs });
        return newLogs;
      });
    } finally { 
      setIsLoading(false); 
      setLoadingProgress(0);
      setLoadingStep('');
    }
  }, [logs, isLoading, selectedWorld, player, gameTime, formatGameTime, triggerAutoSave, settings]);

  // Fix: wrapped handleStartGame in useCallback to ensure stable reference for handleRetry
  const handleStartGame = useCallback(async (scenarioText: string, isRetry: boolean = false) => {
    if (!selectedWorld) return;
    
    // Luôn lưu hành động khởi đầu để có thể tải lại
    setLastAction({ type: 'start', data: scenarioText });
    
    // Bắt buộc làm sạch gameplay trước khi AI chạy
    setIsLoading(true);
    setLoadingProgress(10);
    setLoadingStep('Khởi tạo thế giới...');
    
    // Hiển thị kịch bản khởi đầu trong terminal
    setLogs([{ content: `[ KHỞI TẠO THẾ GIỚI ]: ${scenarioText}`, type: 'system', timestamp: Date.now() }]); 
    setView('playing');
    
    // Initial time is a zero placeholder, AI will provide the real start time in its first response
    const startTime: GameTime = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
    setGameTime(startTime);
    
    // Ngẫu nhiên hóa một số thông tin cơ bản nếu người dùng chưa thiết lập
    // Use placeholders if user hasn't provided specific data
    const finalName = player.name !== '??' ? player.name : '??';
    const finalAge = player.age !== 0 ? player.age : 0;
    const finalGender = player.gender !== '??' ? player.gender : (settings.mcGender || '??');

    let stats = { ...player.stats };
    const hasCustomStats = Object.values(stats).some(v => v !== 0);
    if (!hasCustomStats) {
      stats = { strength: 0, intelligence: 0, agility: 0, charisma: 0, luck: 0, soul: 0, merit: 0 };
    }

    let lineage = player.lineage !== '??' ? player.lineage : '??';
    let spiritRoot = player.spiritRoot !== '??' ? player.spiritRoot : '??';
    let physique = player.physique !== '??' ? player.physique : '??';

    const initialPlayer: Player = {
      ...player,
      health: 100,
      maxHealth: 100,
      level: 1,
      gold: player.gold,
      exp: 0,
      turnCount: 0,
      stats: stats,
      lineage: lineage,
      spiritRoot: spiritRoot,
      physique: physique,
      systemName: '',
      personality: player.personality || '??',
      currentLocation: 'Khởi đầu thực tại',
      assets: [],
      relationships: [],
      codex: [],
      quests: [],
      skills: [],
      inventory: [],
      nextNpcId: 1,
    };
    
    setPlayer(initialPlayer);
    setActiveNpcProfile(null);
    memoryService.setState({ 
      worldSummary: "Câu chuyện vừa bắt đầu.", 
      memories: [], 
      lastSummarizedTurn: 0 
    }); // Reset memory state

    // Save initial state immediately so if AI fails or user refreshes, they are in the game
    triggerAutoSave({ 
      view: 'playing', 
      logs: [{ content: `[ KHỞI TẠO THẾ GIỚI ]: ${scenarioText}`, type: 'system', timestamp: Date.now() }], 
      player: initialPlayer, 
      gameTime: startTime,
      selectedWorld: selectedWorld,
      lastAction: { type: 'start', data: scenarioText }
    });
    
    try {
      setLoadingProgress(40);
      setLoadingStep('Kiến tạo bối cảnh...');
      
      const perfStart = performance.now();
      
      setLoadingProgress(60);
      setLoadingStep('Kết nối Ma Trận AI...');
      
      const mcData = `
DỮ LIỆU NHÂN VẬT CHÍNH (MC) - NGƯỜI CHƠI ĐÃ THIẾT LẬP (BẮT BUỘC TUÂN THỦ 100%):
- Tên: ${initialPlayer.name}
- Tuổi: ${initialPlayer.age}
- Giới tính: ${initialPlayer.gender}
- Ngày sinh: ${initialPlayer.birthday}
- Danh hiệu: ${initialPlayer.title || 'Chưa có'}
- Gia thế/Nguồn gốc: ${initialPlayer.lineage}
- Tính cách: ${initialPlayer.personality}
- ${getGenreMeta(selectedWorld.genre).npcLabels.race.split(' / ')[0]}: ${initialPlayer.spiritRoot}
- ${selectedWorld.genre === GameGenre.CULTIVATION ? 'Thể Chất' : 'Huyết Mạch'}: ${initialPlayer.physique}
- Chỉ số cơ bản: ${JSON.stringify(initialPlayer.stats)}
- Tài sản ban đầu: ${initialPlayer.gold} ${getGenreMeta(selectedWorld.genre).currency}
`;

      const startPrompt = `[ LỆNH KHỞI CHẠY VẬN MỆNH ]
Kịch bản bối cảnh: ${scenarioText}

${mcData}

YÊU CẦU TỐI CAO: AI phải tôn trọng TUYỆT ĐỐI và 100% dữ liệu nhân vật chính (MC) nêu trên. 
1. KHÔNG được tự ý thay đổi Tên, Tuổi, Giới tính, Tính cách, Gia thế hay bất kỳ thông tin nào người chơi đã nhập.
2. Sử dụng các thông tin này làm nền tảng để xây dựng nội dung dẫn truyện và các mối quan hệ ban đầu.
3. Nếu người chơi đã nhập dữ liệu cụ thể (không phải '??'), AI không được phép 'sáng tạo lại' các thông tin đó.
4. Hãy bắt đầu câu chuyện ngay lập tức dựa trên kịch bản và nhân vật này.`;

      const update = await gameAI.getResponse(
        startPrompt,
        [],
        initialPlayer,
        selectedWorld.genre,
        false,
        selectedWorld.systemInstruction,
        settings,
        0,
        "Ngày ??/??/???? | ??:??"
      );
      
      setLoadingProgress(90);
      setLoadingStep('Đang nhận phản hồi...');
      
      const perfEnd = performance.now();
      const duration = ((perfEnd - perfStart) / 1000).toFixed(2);
      const usedKeyIndex = update.usedKeyIndex;
      const usedModel = update.usedModel;
      const usedProxy = update.usedProxy;
      
      const isProxy = !!usedProxy;
      const coreLabel = isProxy ? "PROXY_CORE" : (usedKeyIndex ? `CORE_${usedKeyIndex}` : "SYSTEM_CORE");
      const modelLabel = usedModel ? ` | ${isProxy ? 'PROXY_MODEL' : 'MODEL'}: ${usedModel}` : "";
      const proxyLabel = usedProxy ? ` | GATEWAY: ${usedProxy}` : "";
      
      const newNpcCount = Array.isArray(update.newRelationships) ? update.newRelationships.length : 0;
      
      let updatedPlayer = { ...initialPlayer };

      // Update token usage
      const latestTokens = update.tokenUsage || 0;
      const totalTokens = (updatedPlayer.tokenUsage?.total || 0) + latestTokens;
      const oldHistory = updatedPlayer.tokenUsage?.history || [];
      const newHistory = [latestTokens, ...oldHistory].slice(0, 5);
      updatedPlayer.tokenUsage = {
        latest: latestTokens,
        total: totalTokens,
        history: newHistory
      };

      const narratorLog: GameLog = { 
        content: update.text + (update.evolutionJustification ? `\n\n[ GIẢI TRÌNH THAY ĐỔI ]: ${update.evolutionJustification}` : "") + `\n\n[ KHỞI TẠO THÀNH CÔNG | ${duration}s | ${coreLabel}${modelLabel}${proxyLabel} ]`, 
        type: 'narrator', 
        timestamp: Date.now(), 
        suggestedActions: update.suggestedActions,
        metadata: { duration, usedKeyIndex, usedModel, usedProxy, newNpcCount }
      };
      // Giữ lại log khởi tạo và thêm log của AI
      setLogs(prev => [...prev, narratorLog]);
      
      // Add initial codex entries
      const initialCodexEntry: CodexEntry = {
        category: 'destiny',
        title: 'Khởi Chạy Vận Mệnh',
        content: `### Bối cảnh khởi đầu\n\n${scenarioText}\n\n### Dẫn nhập vận mệnh\n\n${update.text}`,
        unlocked: true,
        viewed: false
      };

      const genreEntry: CodexEntry = {
        category: 'destiny',
        title: `Hệ Thống Thế Giới: ${selectedWorld.genre}`,
        content: `### Phân Loại Thực Tại\n\nThế giới này được vận hành theo quy luật: **${selectedWorld.genre}**.\n\n### Đặc trưng thế giới\n\n${selectedWorld.description}\n\n### Tính năng cốt lõi\n\n${selectedWorld.features.map(f => `- ${f}`).join('\n')}\n\n### Quy tắc hệ thống\n\n${selectedWorld.systemInstruction.split('\n').slice(0, 5).join('\n')}...`,
        unlocked: true,
        viewed: false
      };

      updatedPlayer.codex = [initialCodexEntry, genreEntry];

      if (update.newCodexEntry) {
        const entry = { ...update.newCodexEntry, viewed: false };
        const exists = updatedPlayer.codex.some(c => c.title === entry.title);
        if (!exists) updatedPlayer.codex.push(entry);
      }

      if (Array.isArray(update.newCodexEntries)) {
        update.newCodexEntries.forEach(entry => {
          const entryWithViewed = { ...entry, viewed: false };
          const exists = updatedPlayer.codex.some(c => c.title === entryWithViewed.title);
          if (!exists) updatedPlayer.codex.push(entryWithViewed);
        });
      }

      if (update.statsUpdates) {
        const s = update.statsUpdates;
        const canUpdate = (field: string, newVal: any, oldVal: any) => {
          if (newVal === undefined || newVal === null) return false;
          if (updatedPlayer.lockedFields?.includes(field)) return false;
          if (isValidValue(oldVal) && !isValidValue(newVal)) return false;
          return newVal !== oldVal;
        };

        if (canUpdate('name', s.name, updatedPlayer.name)) updatedPlayer.name = s.name!;
        if (canUpdate('title', s.title, updatedPlayer.title)) updatedPlayer.title = s.title;
        if (canUpdate('lineage', s.lineage, updatedPlayer.lineage)) updatedPlayer.lineage = s.lineage;
        if (canUpdate('currentLocation', s.currentLocation, updatedPlayer.currentLocation)) updatedPlayer.currentLocation = s.currentLocation;
        if (canUpdate('systemName', s.systemName, updatedPlayer.systemName)) updatedPlayer.systemName = s.systemName;
        if (canUpdate('personality', s.personality, updatedPlayer.personality)) updatedPlayer.personality = s.personality;
        if (canUpdate('gender', s.gender, updatedPlayer.gender)) updatedPlayer.gender = s.gender;
        if (canUpdate('age', s.age, updatedPlayer.age)) updatedPlayer.age = s.age;
        if (canUpdate('birthday', s.birthday, updatedPlayer.birthday)) updatedPlayer.birthday = s.birthday;
        if (canUpdate('spiritRoot', s.spiritRoot, updatedPlayer.spiritRoot)) updatedPlayer.spiritRoot = s.spiritRoot;
        if (canUpdate('physique', s.physique, updatedPlayer.physique)) updatedPlayer.physique = s.physique;
        if (canUpdate('avatar', s.avatar, updatedPlayer.avatar)) updatedPlayer.avatar = s.avatar;
        
        if (s.customCurrency && !updatedPlayer.lockedFields?.includes('customCurrency')) updatedPlayer.customCurrency = s.customCurrency;
        if (s.statLabels && !updatedPlayer.lockedFields?.includes('statLabels')) updatedPlayer.statLabels = { ...updatedPlayer.statLabels, ...s.statLabels };
        if (Array.isArray(s.customFields) && !updatedPlayer.lockedFields?.includes('customFields')) updatedPlayer.customFields = s.customFields;
        if (s.health !== undefined && !updatedPlayer.lockedFields?.includes('health')) updatedPlayer.health = s.health;
        if (s.maxHealth !== undefined && !updatedPlayer.lockedFields?.includes('maxHealth')) updatedPlayer.maxHealth = s.maxHealth;
        if (s.gold !== undefined && !updatedPlayer.lockedFields?.includes('gold')) updatedPlayer.gold = s.gold;
        if (s.level !== undefined && !updatedPlayer.lockedFields?.includes('level')) updatedPlayer.level = s.level;
        if (s.exp !== undefined && !updatedPlayer.lockedFields?.includes('exp')) updatedPlayer.exp = s.exp;
        
        if (Array.isArray(s.inventory) && !updatedPlayer.lockedFields?.includes('inventory')) updatedPlayer.inventory = normalizeObjectArray(s.inventory);
        if (Array.isArray(s.skills) && !updatedPlayer.lockedFields?.includes('skills')) updatedPlayer.skills = normalizeObjectArray(s.skills);
        if (Array.isArray(s.assets) && !updatedPlayer.lockedFields?.includes('assets')) updatedPlayer.assets = normalizeObjectArray(s.assets);
        if (Array.isArray(s.identities) && !updatedPlayer.lockedFields?.includes('identities')) updatedPlayer.identities = s.identities;

        if (s.stats) {
          Object.entries(s.stats).forEach(([statKey, statVal]) => {
            if (!updatedPlayer.lockedFields?.includes(`stat_${statKey}`)) {
              (updatedPlayer.stats as any)[statKey] = statVal;
            }
          });
        }
      }
      if (update.currentLocation && !updatedPlayer.lockedFields?.includes('currentLocation')) updatedPlayer.currentLocation = update.currentLocation;
      
      if (Array.isArray(update.questUpdates) && !updatedPlayer.lockedFields?.includes('quests')) {
        updatedPlayer.quests = update.questUpdates;
      }
      
      if (Array.isArray(update.newRelationships)) {
        updatedPlayer.relationships = update.newRelationships.map(r => {
          const npcWithId = { ...r, id: `npc_${String(updatedPlayer.nextNpcId++).padStart(6, '0')}` };
          return compensateNpcData({ ...npcWithId, isPresent: true, viewed: false }, update.newTime?.year || startTime.year);
        });
      }
      
      // Final time sync from AI's first response
      const finalTime = update.newTime || startTime;
      if (update.newTime) {
        setGameTime(update.newTime);
      }
      
      setPlayer(updatedPlayer);
      memoryService.updateMemory([narratorLog], 0);
      triggerAutoSave({ 
        view: 'playing', 
        logs: [narratorLog], 
        player: updatedPlayer, 
        gameTime: finalTime,
        selectedWorld: selectedWorld,
        lastAction: null // Clear last action on success
      });
      
      setLoadingProgress(100);
      setLoadingStep('Đồng bộ thực tại...');
    } catch (error: any) {
      console.error("Game Start Error:", error);
      const coreIndex = error?.usedKeyIndex;
      const coreInfo = coreIndex ? ` (Core #${coreIndex})` : " (System Core)";
      
      const errorMessage = error?.message?.includes("API_KEY_INVALID") 
        ? `API Key${coreInfo} không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại Ma Trận API.`
        : error?.message?.includes("quota")
        ? `Hết hạn mức API${coreInfo} (Rate Limit). Vui lòng thử lại sau hoặc thêm API Key mới.`
        : error?.message?.includes("SAFETY_BLOCK")
        ? `[BỘ LỌC AN TOÀN]: ${error.message.split(": ")[1] || "Nội dung bị chặn do quá nhạy cảm."}`
        : error?.message?.includes("PARSE_ERROR")
        ? `[LỖI DỮ LIỆU]: ${error.message.split(": ")[1] || "Lỗi phân tích lượng tử."}`
        : `Lỗi khởi tạo thực tại tại${coreInfo}: ${error?.message || "Không rõ nguyên nhân"}`;
        
      setLogs([{ 
        content: `[ CẢNH BÁO HỆ THỐNG ]: ${errorMessage}`, 
        type: 'error', 
        timestamp: Date.now(),
        metadata: { usedKeyIndex: coreIndex }
      }]);
      // Save error state
      triggerAutoSave({ 
        logs: [{ 
          content: `[ CẢNH BÁO HỆ THỐNG ]: ${errorMessage}`, 
          type: 'error', 
          timestamp: Date.now(),
          metadata: { usedKeyIndex: coreIndex }
        }], 
        view: 'playing', 
        player: initialPlayer, 
        selectedWorld 
      });
    } finally { 
      setIsLoading(false); 
      setLoadingProgress(0);
      setLoadingStep('');
    }
  }, [selectedWorld, player, formatGameTime, settings, triggerAutoSave]);

  const handleExit = useCallback(() => {
    setSelectedWorld(null);
    setSelectedContext(null);
    setLogs([]);
    setView('landing');
  }, [setView]);

  const handleBack = useCallback(() => {
    const flow: ViewState[] = ['landing', 'world-select', 'context-select', 'scenario-select', 'playing'];
    const currentIdx = flow.indexOf(view);
    
    if (view === 'fanfic-select') {
      setView('landing');
    } else if (view === 'scenario-select' && selectedWorld?.id === 'free_style_mode') {
      setView('landing');
    } else if (currentIdx > 0) {
      setView(flow[currentIdx - 1]);
    } else {
      setView('landing');
    }
  }, [view, setView, selectedWorld]);

  const markAsViewed = useCallback((id: string, type: 'codex' | 'npc') => {
    setPlayer(prev => {
      if (type === 'codex') {
        const exists = prev.codex.find(c => c.title === id);
        if (!exists || exists.viewed) return prev;
        return {
          ...prev,
          codex: prev.codex.map(c => c.title === id ? { ...c, viewed: true } : c)
        };
      } else {
        const exists = prev.relationships.find(r => r.id === id);
        if (!exists || exists.viewed) return prev;
        return {
          ...prev,
          relationships: prev.relationships.map(r => r.id === id ? { ...r, viewed: true } : r)
        };
      }
    });
  }, []);

  const handleManualSave = useCallback(async () => {
    if (!selectedWorld) {
      alert("Hệ thống chưa xác định được thế giới hiện tại. Không thể phong ấn!");
      return;
    }
    
    setIsSaving(true);
    try {
      const dataToSave = { 
        player, 
        logs, 
        gameTime, 
        selectedWorld, 
        selectedContext, 
        settings, 
        view,
        memory: memoryService.getState()
      };
      
      const slotId = `manual_${selectedWorld.id}`;
      
      await dbService.save(dataToSave, slotId);
      
      // Download to machine
      const metadata = {
        playerName: player.name,
        level: player.level,
        timestamp: Date.now(),
        genre: selectedWorld.genre,
        worldId: selectedWorld.id,
        turnCount: player.turnCount,
        avatar: player.avatar
      };
      const blob = new Blob([JSON.stringify({ ...dataToSave, metadata }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ThiênCơ_${player.name}_${selectedWorld.title}_Turn${player.turnCount}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // setModals(prev => ({ ...prev, saveManager: true })); // Removed for immediate feel
    } catch (err) {
      console.error("Manual Save Error:", err);
      alert("Lỗi phong ấn thực tại: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  }, [player, logs, gameTime, selectedWorld, selectedContext, settings, view]);

  const handleStartFanficGame = useCallback(async (work: FanficWork, mc: FanficCharacter, npcs: FanficCharacter[], customPrompt: string, isRetry: boolean = false) => {
    // 1. Setup the Fanfic Archetype
    const fanficArchetype: GameArchetype = {
      ...FANFIC_ARCHETYPE,
      id: `fanfic_${work.id}`,
      title: `${FANFIC_ARCHETYPE.title}: ${work.title}`,
      description: `${work.description}\n\n${FANFIC_ARCHETYPE.description}`,
      systemInstruction: `${FANFIC_ARCHETYPE.systemInstruction}\n\nTÁC PHẨM GỐC: ${work.title}\nBỐI CẢNH: ${work.description}\n\nNHÂN VẬT CHÍNH (MC): ${mc.name} (${mc.role})\nNHÂN VẬT PHỤ (NPCs): ${npcs.map(n => n.name).join(', ')}`
    };

    setSelectedWorld(fanficArchetype);
    setIsLoading(true);
    
    if (!isRetry) {
      setLogs([]);
    }
    
    setView('playing');

    const startTime: GameTime = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
    setGameTime(startTime);

    // 2. Initialize Player with Fanfic data or placeholders
    const updatedPlayer: Player = {
      ...player,
      name: mc.name || '??',
      avatar: '',
      gender: settings.mcGender || '??' as any, 
      age: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      gold: 0,
      exp: 0,
      stats: { strength: 0, intelligence: 0, agility: 0, charisma: 0, luck: 0, soul: 0, merit: 0 },
      lineage: mc.role || '??',
      personality: mc.description || '??',
      currentLocation: work.title,
      turnCount: 0,
      systemName: '',
      assets: [],
      skills: [],
      inventory: [],
      codex: [],
      quests: [],
      nextNpcId: 1,
      relationships: [] // Start with empty relationships, AI will add them dynamically
    };

    const scenarioText = `Bắt đầu hành trình Đồng Nhân trong thế giới ${work.title}.\nNhân vật: ${mc.name}, giới tính ${updatedPlayer.gender}.\nBối cảnh: ${customPrompt || 'Theo dòng thời gian nguyên tác.'}`;
    setLastAction({ type: 'fanfic-start', data: { scenarioText, work, mc, npcs, customPrompt } });
    
    // Hiển thị kịch bản khởi đầu trong terminal
    setLogs([{ content: `[ KHỞI TẠO ĐỒNG NHÂN ]: ${scenarioText}`, type: 'system', timestamp: Date.now() }]);

    // Save initial state immediately
    triggerAutoSave({ 
      view: 'playing', 
      logs: [{ content: `[ KHỞI TẠO ĐỒNG NHÂN ]: ${scenarioText}`, type: 'system', timestamp: Date.now() }], 
      player: updatedPlayer, 
      gameTime: startTime,
      selectedWorld: fanficArchetype,
      lastAction: { type: 'fanfic-start', data: { scenarioText, work, mc, npcs, customPrompt } }
    });

    const startTimePerf = performance.now();
    try {
      const update = await gameAI.getResponse(
        scenarioText,
        [],
        updatedPlayer,
        fanficArchetype.genre,
        true,
        fanficArchetype.systemInstruction,
        settings,
        updatedPlayer.relationships.length,
        "Ngày ??/??/???? | ??:??"
      );

      const endTimePerf = performance.now();
      const duration = ((endTimePerf - startTimePerf) / 1000).toFixed(2);
      const usedKeyIndex = update.usedKeyIndex;
      const usedModel = update.usedModel;
      const usedProxy = update.usedProxy;
      
      const isProxy = !!usedProxy;
      const coreLabel = isProxy ? "PROXY_CORE" : (usedKeyIndex ? `CORE_${usedKeyIndex}` : "SYSTEM_CORE");
      const modelLabel = usedModel ? ` | ${isProxy ? 'PROXY_MODEL' : 'MODEL'}: ${usedModel}` : "";
      const proxyLabel = usedProxy ? ` | GATEWAY: ${usedProxy}` : "";
      
      const justification = update.evolutionJustification;

      // Update token usage
      const latestTokens = update.tokenUsage || 0;
      const totalTokens = (updatedPlayer.tokenUsage?.total || 0) + latestTokens;
      const oldHistory = updatedPlayer.tokenUsage?.history || [];
      const newHistory = [latestTokens, ...oldHistory].slice(0, 5);
      updatedPlayer.tokenUsage = {
        latest: latestTokens,
        total: totalTokens,
        history: newHistory
      };

      let finalNarratorText = update.text;
      if (justification) {
        finalNarratorText += `\n\n[ GIẢI TRÌNH THAY ĐỔI ]: ${justification}`;
      }
      finalNarratorText += `\n\n[ KHỞI TẠO ĐỒNG NHÂN THÀNH CÔNG | ${duration}s | ${coreLabel}${modelLabel}${proxyLabel} ]`;

      const narratorLog: GameLog = {
        content: finalNarratorText,
        type: 'narrator',
        timestamp: Date.now(),
        suggestedActions: update.suggestedActions,
        metadata: { duration, usedKeyIndex, usedModel, usedProxy }
      };

      setLogs(prev => [...prev, narratorLog]);
      
      if (update.statsUpdates) {
        const s = update.statsUpdates;
        const canUpdate = (field: string, newVal: any, oldVal: any) => {
          if (newVal === undefined || newVal === null) return false;
          if (updatedPlayer.lockedFields?.includes(field)) return false;
          if (isValidValue(oldVal) && !isValidValue(newVal)) return false;
          return newVal !== oldVal;
        };

        if (canUpdate('name', s.name, updatedPlayer.name)) updatedPlayer.name = s.name!;
        if (canUpdate('title', s.title, updatedPlayer.title)) updatedPlayer.title = s.title;
        if (canUpdate('lineage', s.lineage, updatedPlayer.lineage)) updatedPlayer.lineage = s.lineage;
        if (canUpdate('currentLocation', s.currentLocation, updatedPlayer.currentLocation)) updatedPlayer.currentLocation = s.currentLocation;
        if (canUpdate('systemName', s.systemName, updatedPlayer.systemName)) updatedPlayer.systemName = s.systemName;
        if (canUpdate('personality', s.personality, updatedPlayer.personality)) updatedPlayer.personality = s.personality;
        if (canUpdate('gender', s.gender, updatedPlayer.gender)) updatedPlayer.gender = s.gender;
        if (canUpdate('age', s.age, updatedPlayer.age)) updatedPlayer.age = s.age;
        if (canUpdate('birthday', s.birthday, updatedPlayer.birthday)) updatedPlayer.birthday = s.birthday;
        if (canUpdate('spiritRoot', s.spiritRoot, updatedPlayer.spiritRoot)) updatedPlayer.spiritRoot = s.spiritRoot;
        if (canUpdate('physique', s.physique, updatedPlayer.physique)) updatedPlayer.physique = s.physique;
        if (canUpdate('avatar', s.avatar, updatedPlayer.avatar)) updatedPlayer.avatar = s.avatar;
        
        if (s.customCurrency && !updatedPlayer.lockedFields?.includes('customCurrency')) updatedPlayer.customCurrency = s.customCurrency;
        if (s.statLabels && !updatedPlayer.lockedFields?.includes('statLabels')) updatedPlayer.statLabels = { ...updatedPlayer.statLabels, ...s.statLabels };
        if (Array.isArray(s.customFields) && !updatedPlayer.lockedFields?.includes('customFields')) updatedPlayer.customFields = s.customFields;
        if (s.health !== undefined && !updatedPlayer.lockedFields?.includes('health')) updatedPlayer.health = s.health;
        if (s.maxHealth !== undefined && !updatedPlayer.lockedFields?.includes('maxHealth')) updatedPlayer.maxHealth = s.maxHealth;
        if (s.gold !== undefined && !updatedPlayer.lockedFields?.includes('gold')) updatedPlayer.gold = s.gold;
        if (s.level !== undefined && !updatedPlayer.lockedFields?.includes('level')) updatedPlayer.level = s.level;
        if (s.exp !== undefined && !updatedPlayer.lockedFields?.includes('exp')) updatedPlayer.exp = s.exp;
        
        if (Array.isArray(s.inventory) && !updatedPlayer.lockedFields?.includes('inventory')) updatedPlayer.inventory = normalizeObjectArray(s.inventory);
        if (Array.isArray(s.skills) && !updatedPlayer.lockedFields?.includes('skills')) updatedPlayer.skills = normalizeObjectArray(s.skills);
        if (Array.isArray(s.assets) && !updatedPlayer.lockedFields?.includes('assets')) updatedPlayer.assets = normalizeObjectArray(s.assets);
        if (Array.isArray(s.identities) && !updatedPlayer.lockedFields?.includes('identities')) updatedPlayer.identities = s.identities;

        if (s.stats) {
          Object.entries(s.stats).forEach(([statKey, statVal]) => {
            if (!updatedPlayer.lockedFields?.includes(`stat_${statKey}`)) {
              (updatedPlayer.stats as any)[statKey] = statVal;
            }
          });
        }
      }
      if (update.currentLocation && !updatedPlayer.lockedFields?.includes('currentLocation')) updatedPlayer.currentLocation = update.currentLocation;

      const finalTime = update.newTime || startTime;
      if (update.newTime) {
        setGameTime(update.newTime);
      }

      if (Array.isArray(update.newRelationships)) {
        updatedPlayer.relationships = update.newRelationships.map(r => {
          const npcWithId = { ...r, id: `npc_${String(updatedPlayer.nextNpcId++).padStart(6, '0')}` };
          return compensateNpcData({ ...npcWithId, isPresent: true, viewed: false }, update.newTime?.year || 0);
        });
      }

      if (Array.isArray(update.questUpdates)) {
        updatedPlayer.quests = update.questUpdates;
      }

      const initialCodexEntry: CodexEntry = {
        category: 'destiny',
        title: 'Vận Mệnh Đồng Nhân',
        content: `### Tác phẩm: ${work.title}\n\n${scenarioText}\n\n### Dẫn nhập\n\n${update.text}`,
        unlocked: true,
        viewed: false
      };

      const genreEntry: CodexEntry = {
        category: 'destiny',
        title: `Hệ Thống Thế Giới: ${fanficArchetype.genre}`,
        content: `### Phân Loại Thực Tại\n\nThế giới này được vận hành theo quy luật: **${fanficArchetype.genre}**.\n\n### Đặc trưng thế giới\n\n${fanficArchetype.description}\n\n### Quy tắc hệ thống\n\n${fanficArchetype.systemInstruction.split('\n').slice(0, 5).join('\n')}...`,
        unlocked: true,
        viewed: false
      };

      updatedPlayer.codex = [initialCodexEntry, genreEntry];

      if (update.newCodexEntry) {
        const entry = { ...update.newCodexEntry, viewed: false };
        const exists = updatedPlayer.codex.some(c => c.title === entry.title);
        if (!exists) updatedPlayer.codex.push(entry);
      }

      if (Array.isArray(update.newCodexEntries)) {
        update.newCodexEntries.forEach(entry => {
          const entryWithViewed = { ...entry, viewed: false };
          const exists = updatedPlayer.codex.some(c => c.title === entryWithViewed.title);
          if (!exists) updatedPlayer.codex.push(entryWithViewed);
        });
      }

      setPlayer(updatedPlayer);
      triggerAutoSave({ 
        view: 'playing', 
        logs: [narratorLog], 
        player: updatedPlayer, 
        gameTime: finalTime,
        selectedWorld: fanficArchetype,
        lastAction: null // Clear last action on success
      });
    } catch (error: any) {
      console.error("Fanfic start failed:", error);
      const errorMessage = error?.message || "Không rõ nguyên nhân";
      const errorLogs: GameLog[] = [{ 
        content: `[ LỖI KHỞI TẠO ]: Lỗi khởi tạo thế giới Đồng Nhân: ${errorMessage}. Vui lòng kiểm tra lại cấu hình hoặc thử lại.`, 
        type: 'narrator', 
        timestamp: Date.now() 
      }];
      setLogs(errorLogs);
      // Save error state
      triggerAutoSave({ logs: errorLogs, view: 'playing', player: updatedPlayer, selectedWorld: fanficArchetype });
    } finally {
      setIsLoading(false);
    }
  }, [player, settings, triggerAutoSave, formatGameTime]);

  // Fix: implemented handleRetry to re-execute the last recorded action
  const handleRetry = useCallback(() => {
    if (!lastAction || isLoading) return;
    if (lastAction.type === 'start') {
      handleStartGame(lastAction.data, true);
    } else if (lastAction.type === 'fanfic-start') {
      const d = lastAction.data;
      handleStartFanficGame(d.work, d.mc, d.npcs, d.customPrompt, true);
    } else if (lastAction.type === 'command') {
      handleCommand(lastAction.data.command, lastAction.data.timeCost, true);
    }
  }, [lastAction, isLoading, handleStartGame, handleCommand, handleStartFanficGame]);

  const toggleLock = useCallback((field: string) => {
    setPlayer(prev => {
      const currentLocks = prev.lockedFields || [];
      const isLocked = currentLocks.includes(field);
      const nextLocks = isLocked 
        ? currentLocks.filter(f => f !== field)
        : [...currentLocks, field];
      return { ...prev, lockedFields: nextLocks };
    });
  }, []);

  const resetPlayer = useCallback(() => {
    const freshPlayer = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATE));
    setPlayer({
      ...freshPlayer,
      gallery: player.gallery
    });
  }, [player.gallery]);

  const handleStartNewGameFlow = useCallback(() => {
    resetPlayer();
    setView('world-select');
  }, [resetPlayer]);

  const handleStartFreeStyle = useCallback(() => {
    resetPlayer();
    setSelectedWorld(FREE_STYLE_ARCHETYPE);
    setSelectedContext(FREE_STYLE_ARCHETYPE.subScenarios[0]);
    setView('scenario-select');
  }, [resetPlayer]);

  return {
    view, setView,
    handleStartNewGameFlow,
    handleStartFreeStyle,
    resetPlayer,
    selectedWorld, setSelectedWorld, selectedContext, setSelectedContext,
    logs, setLogs, isLoading, loadingProgress, loadingStep, isSavingStatus,
    gameTime, setGameTime, formatGameTime, modals, setModals, player, setPlayer,
    activeNpcProfile, setActiveNpcProfile, handleCommand, handleStartGame, handleBack, handleExit,
    handleRetry, triggerAutoSave, settings, setSettings, loadSaveData,
    handleStartFanficGame,
    updateSettings: (s: Partial<AppSettings>) => {
      if (s.isFullscreen !== undefined && s.isFullscreen !== settings.isFullscreen) {
        if (s.isFullscreen) {
          const docEl = document.documentElement as any;
          const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
          if (requestFs) {
            requestFs.call(docEl).catch((err: any) => {
              console.error("Fullscreen request failed:", err);
              setSettings(prev => ({ ...prev, isFullscreen: false }));
            });
          } else {
            console.warn("Fullscreen API not supported");
            setSettings(prev => ({ ...prev, isFullscreen: false }));
          }
        } else if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement) {
          const exitFs = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen;
          if (exitFs) {
            exitFs.call(document).catch((err: any) => {
              console.error("Exit fullscreen failed:", err);
              setSettings(prev => ({ ...prev, isFullscreen: true }));
            });
          }
        }
      }
      setSettings(prev => ({ ...prev, ...s }));
    },
    handleManualSave,
    generateAiAvatar: async (customPrompt?: string) => {
      if (!selectedWorld) return;
      setIsLoading(true);
      setLoadingStep("Đang phác họa chân dung nhân vật...");
      try {
        const styleMap: Record<string, string> = {
          'Ảnh chụp': 'realistic photo',
          'Anime': 'anime style',
          'Nghệ thuật số': 'digital art',
          'Tranh sơn dầu': 'oil painting',
          'Phác thảo': 'sketch',
          '3D Render': '3D render',
          'Cyberpunk': 'cyberpunk style',
          'Fantasy': 'fantasy art',
          'Điện ảnh': 'cinematic'
        };
        const style = styleMap[settings.imageStyle || ''] || settings.imageStyle || 'digital art';
        
        const basePrompt = customPrompt || `A high quality ${style} portrait of a character named ${player.name}. Gender: ${player.gender}. Age: ${player.age}. Personality: ${player.personality}. Genre: ${selectedWorld.genre}. Background: ${player.currentLocation}. High detail, cinematic lighting, masterpiece.`;
        
        const imageUrl = await gameAI.generateImage(basePrompt, settings);
        if (imageUrl) {
          setPlayer(prev => ({
            ...prev,
            avatar: imageUrl,
            gallery: [{ url: imageUrl, tags: ['avatar', player.name], genre: selectedWorld.genre }, ...prev.gallery]
          }));
          return imageUrl;
        }
      } catch (error) {
        console.error("Avatar generation failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    toggleLock,
    markAsViewed,
    deleteNpc: (id: string) => {
      setPlayer(prev => ({
        ...prev,
        relationships: prev.relationships.filter(r => r.id !== id)
      }));
      setModals(prev => ({ ...prev, npcProfile: false }));
      setActiveNpcProfile(null);
    }
  };
};
