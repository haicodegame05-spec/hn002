
import React, { useState, useEffect, useRef } from 'react';
import { GameLog, Player, GameGenre, getGenreMeta, AppSettings } from '../../types';
import { Send, Sparkles, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react';

interface MobileTerminalProps {
  logs: GameLog[];
  onCommand: (cmd: string, timeCost?: number) => void;
  onOpenAiHint?: () => void;
  isLoading: boolean;
  placeholder?: string;
  player: Player;
  genre?: GameGenre;
  settings: AppSettings;
}

export const MobileTerminal: React.FC<MobileTerminalProps> = ({ 
  logs, onCommand, onOpenAiHint, isLoading, placeholder = "Gõ hành động...", 
  player, genre, settings
}) => {
  const [input, setInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  const logsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const genreMeta = getGenreMeta(genre);
  const aiTheme = genreMeta.aiTheme;
  const lastLogRef = useRef<HTMLDivElement>(null);

  // Auto-switch to last page when new logs arrive
  useEffect(() => {
    if (totalPages > currentPage) {
      setCurrentPage(totalPages);
    }
  }, [logs.length, totalPages]);

  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setElapsedTime(0);
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e?: React.FormEvent, customCmd?: string, timeCost?: number) => {
    if (e) e.preventDefault();
    const finalCmd = customCmd || input;
    if (finalCmd.trim() && !isLoading) {
      onCommand(finalCmd.trim(), timeCost);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const formatActionTime = (mins: any) => {
    const m = parseInt(mins) || 15;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `${h}h${rem}p` : `${h}h`;
    }
    return `${m}p`;
  };

  const renderContent = (content: any, type?: string) => {
    if (!content) return null;
    let safeContent = typeof content === 'string' ? content : (content.text || JSON.stringify(content));
    
    // Split into lines
    const lines = safeContent.split('\n');
    
    // Grouping logic: group consecutive lines that start with the same [NPC NAME]
    // or are part of a special block (Message, Email, Letter)
    const groups: { 
      npc?: string, 
      lines: string[], 
      isGM?: boolean, 
      specialType?: 'message' | 'email' | 'letter' | 'system' | 'dialogue' | 'thought',
      dialogueName?: string,
      dialogueText?: string,
      thoughtText?: string
    }[] = [];
    
    let currentSpecialBlock: { type: 'message' | 'email' | 'letter' | 'system', lines: string[] } | null = null;

    lines.forEach(line => {
      let trimmed = line.trim();
      if (!trimmed) {
        if (currentSpecialBlock) {
          currentSpecialBlock.lines.push(line);
        } else {
          groups.push({ lines: [line] });
        }
        return;
      }

      // Detect special block headers
      const messageMatch = trimmed.match(/^\[(?:TIN NHẮN|MESSAGE)(?:\s+TỪ)?:\s*([^\]]+)\]/i);
      const emailMatch = trimmed.match(/^\[EMAIL(?:\s+TỪ)?:\s*([^\]]+)\]/i);
      const letterMatch = trimmed.match(/^\[(?:THƯ|LETTER)(?:\s+TỪ)?:\s*([^\]]+)\]/i);
      const systemMatch = trimmed.match(/^\[(?:THÔNG BÁO|HỆ THỐNG|SYSTEM|GM):?\s*([^\]]*)\]/i);

      if (messageMatch || emailMatch || letterMatch || systemMatch) {
        // If we were in a special block, close it
        if (currentSpecialBlock) {
          groups.push({ specialType: currentSpecialBlock.type, lines: currentSpecialBlock.lines });
          currentSpecialBlock = null;
        }
        
        const type = messageMatch ? 'message' : emailMatch ? 'email' : letterMatch ? 'letter' : 'system';
        currentSpecialBlock = { type, lines: [line] };
        return;
      }

      // If we are in a special block, keep adding lines
      if (currentSpecialBlock) {
        currentSpecialBlock.lines.push(line);
        return;
      }

      if (settings.beautifyContent) {
        // Dialogue detection
        const dialogueMatch = trimmed.match(/^\[([^\]]+)\](?:\s*(?:nói|bảo|hỏi|đáp|thì thầm|hét lên))?:\s*"(.*)"$/i) || 
                             trimmed.match(/^([^:\[\]]+):\s*"(.*)"$/i);
        if (dialogueMatch) {
          groups.push({ specialType: 'dialogue', dialogueName: dialogueMatch[1].trim(), dialogueText: dialogueMatch[2].trim(), lines: [line] });
          return;
        }

        // Thought detection
        const thoughtMatch = trimmed.match(/^\((.*)\)$/) || 
                            trimmed.match(/^\*(.*)\*$/) ||
                            trimmed.match(/^\[([^\]]+)\]\s*(?:thầm nghĩ|nghĩ):\s*(.*)$/i) ||
                            trimmed.match(/^(?:Suy nghĩ|Nghĩ):\s*(.*)$/i);
        if (thoughtMatch) {
          const text = thoughtMatch.length > 2 ? thoughtMatch[2].trim() : thoughtMatch[1].trim();
          groups.push({ specialType: 'thought', thoughtText: text, lines: [line] });
          return;
        }
      }

      // Handle GM: prefix
      const isGM = trimmed.startsWith('GM:');
      if (isGM) {
        trimmed = trimmed.replace(/^GM:\s*/, '').trim();
      }
      
      // Match [NPC NAME] at the start of the line
      const match = trimmed.match(/^\[([^\]]+)\]/);
      if (match) {
        const npcName = match[1].trim();
        // Only group if it's likely a status update (multiple brackets in the line)
        const bracketCount = (trimmed.match(/\[/g) || []).length;
        
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.npc === npcName && bracketCount > 1) {
          lastGroup.lines.push(trimmed);
        } else if (bracketCount > 1) {
          groups.push({ npc: npcName, lines: [trimmed], isGM });
        } else {
          groups.push({ lines: [line] });
        }
      } else {
        groups.push({ lines: [line] });
      }
    });

    // Close any remaining special block
    if (currentSpecialBlock) {
      groups.push({ specialType: currentSpecialBlock.type, lines: currentSpecialBlock.lines });
    }

    return (
      <div className="space-y-1">
        {groups.map((group, gIdx) => {
          if (group.specialType === 'dialogue') {
            const isMC = group.dialogueName?.toLowerCase() === player.name.toLowerCase() || 
                         group.dialogueName?.toLowerCase() === 'bạn' || 
                         group.dialogueName?.toLowerCase() === 'mc';
            
            return (
              <div key={gIdx} className={`flex ${isMC ? 'justify-end' : 'justify-start'} my-1 animate-in fade-in slide-in-from-${isMC ? 'right' : 'left'}-2 duration-300`}>
                <div className={`max-w-[90%] space-y-0.5`}>
                  <div className={`flex items-center gap-1.5 ${isMC ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="mono text-[8px] font-black text-neutral-500 uppercase tracking-widest">{group.dialogueName}</span>
                    <div className={`w-1 h-1 rounded-full ${isMC ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl ${isMC ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 rounded-tr-none' : 'bg-blue-500/10 border border-blue-500/30 text-blue-100 rounded-tl-none'} shadow-lg`}>
                    <p className={`${fontSizeClass} leading-relaxed`}>"{group.dialogueText}"</p>
                  </div>
                </div>
              </div>
            );
          }

          if (group.specialType === 'thought') {
            return (
              <div key={gIdx} className="my-1 px-3 py-1.5 bg-purple-500/5 border-l-2 border-purple-500/30 italic text-purple-200/70 animate-in fade-in duration-500">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px]">💭</span>
                  <span className="mono text-[8px] font-black uppercase tracking-widest">Suy nghĩ</span>
                </div>
                <p className={`${fontSizeClass} leading-relaxed`}>{group.thoughtText}</p>
              </div>
            );
          }

          if (group.specialType) {
            const header = group.lines[0];
            const body = group.lines.slice(1);
            const headerText = header.replace(/[\[\]]/g, '').trim();

            let bgColor = "bg-neutral-900/50";
            let borderColor = "border-neutral-700";
            let textColor = "text-neutral-300";
            let icon = "✉️";
            let label = "THÔNG TIN";

            if (group.specialType === 'message') {
              bgColor = "bg-indigo-500/10";
              borderColor = "border-indigo-500/30";
              textColor = "text-indigo-200";
              icon = "💬";
              label = "TIN NHẮN";
            } else if (group.specialType === 'email') {
              bgColor = "bg-cyan-500/10";
              borderColor = "border-cyan-500/30";
              textColor = "text-cyan-200";
              icon = "📧";
              label = "EMAIL";
            } else if (group.specialType === 'letter') {
              bgColor = "bg-amber-900/10";
              borderColor = "border-amber-700/30";
              textColor = "text-amber-100/90";
              icon = "📜";
              label = "THƯ TÍN";
            } else if (group.specialType === 'system') {
              bgColor = "bg-rose-500/10";
              borderColor = "border-rose-500/30";
              textColor = "text-rose-200";
              icon = "⚠️";
              label = "HỆ THỐNG";
            }

            return (
              <div key={gIdx} className={`my-2 ${bgColor} border ${borderColor} rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-lg`}>
                <div className={`px-2 py-1 border-b ${borderColor} flex items-center justify-between bg-black/40`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{icon}</span>
                    <span className={`mono text-[8px] font-black uppercase tracking-widest ${textColor}`}>{label}</span>
                  </div>
                  <div className={`mono text-[8px] font-bold opacity-60 ${textColor}`}>
                    {headerText.split(':').pop()?.trim()}
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  {body.map((line, lIdx) => (
                    <div key={lIdx} className={`whitespace-pre-wrap ${fontSizeClass} ${group.specialType === 'letter' ? 'font-serif italic leading-relaxed' : 'mono'}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (!group.npc) {
            // Normal text rendering
            return (
              <div key={gIdx} className={`block ${type === 'system' ? 'bg-cyan-500/5 border-y border-cyan-500/10 p-1 relative' : ''}`}>
                <div className={type === 'system' ? 'pl-1' : ''}>
                  {group.lines.map((line, lIdx) => {
                    const parts = line.split(/(\[[^\]]+\])/g);
                    return (
                      <React.Fragment key={lIdx}>
                        {parts.map((part, pIdx) => {
                          if (!part) return null;
                          const trimmedPart = part.trim();

                          // Handle GM: prefix visually
                          if (pIdx === 0 && trimmedPart.startsWith('GM:')) {
                            return (
                              <span key={pIdx} className="inline-flex items-center gap-1 px-1 py-0.5 bg-cyan-500/20 border border-cyan-500/40 rounded-sm text-cyan-400 mono text-[9px] font-black mr-1.5">
                                GM
                              </span>
                            );
                          }

                          const isSystemBlock = trimmedPart.startsWith('[') && trimmedPart.endsWith(']');
                          
                          if (isSystemBlock) {
                            return (
                              <span key={pIdx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-emerald-300 mono text-[10px] font-black tracking-tight leading-tight italic uppercase mr-1">
                                {part.replace(/[\[\]]/g, '').trim()}
                              </span>
                            );
                          }
                          return <span key={pIdx} className={`whitespace-pre-wrap ${fontSizeClass}`}>{part}</span>;
                        })}
                        {lIdx < group.lines.length - 1 && <br />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Grouped NPC notifications
          return (
            <div key={gIdx} className="my-1 bg-emerald-500/5 border border-emerald-500/20 rounded-sm p-2 space-y-1 animate-in fade-in slide-in-from-left-2 duration-300 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-0.5 h-full bg-emerald-500/30"></div>
              {group.isGM && (
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-emerald-500/10 pb-0.5">
                  <span className="px-1 py-0.5 bg-cyan-500/20 border border-cyan-500/40 rounded-sm text-cyan-400 mono text-[8px] font-black">GM</span>
                  <span className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest">Cập nhật thực thể</span>
                </div>
              )}
              {group.lines.map((line, lIdx) => {
                const parts = line.split(/(\[[^\]]+\])/g);
                return (
                  <div key={lIdx} className="flex flex-wrap items-center gap-1">
                    {parts.map((part, pIdx) => {
                      if (!part || !part.trim()) return null;
                      const trimmedPart = part.trim();
                      const isSystemBlock = trimmedPart.startsWith('[') && trimmedPart.endsWith(']');
                      
                      if (isSystemBlock) {
                        const blockText = part.replace(/[\[\]]/g, '').trim();
                        const isNpcName = blockText === group.npc;
                        
                        // If it's the NPC name and NOT the first line of the group, skip it to avoid redundancy
                        if (isNpcName && lIdx > 0) return null;

                        return (
                          <span key={pIdx} className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-sm mono text-[9px] font-black tracking-tight leading-tight italic uppercase ${isNpcName ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200' : 'bg-white/5 border border-white/10 text-emerald-400/80'}`}>
                            {blockText}
                          </span>
                        );
                      }
                      return <span key={pIdx} className="text-[9px] text-neutral-500 italic">{part}</span>;
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  let playerCommandCounter = 0;

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const getAiProcessingStep = (seconds: number) => {
    if (seconds < 5) return "Đang liên kết Ma Trận...";
    if (seconds < 10) return "Phân tích bối cảnh...";
    if (seconds < 15) return "Truy vấn vạn giới...";
    if (seconds < 20) return "Kiến tạo phản hồi...";
    return "Đồng bộ thực tại...";
  };

  const getAiProcessingLabel = (seconds: number) => {
    if (seconds < 5) return "KẾT NỐI";
    if (seconds < 10) return "PHÂN TÍCH";
    if (seconds < 15) return "TRUY VẤN";
    if (seconds < 20) return "KHỞI TẠO";
    return "HOÀN TẤT";
  };

  const getFontSizeClass = () => {
    return 'text-base';
  };

  const fontSizeClass = getFontSizeClass();

  const paginatedLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  return (
    <div className="MobileTerminal flex flex-col h-full bg-[var(--bg)] overflow-hidden relative">
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-1 space-y-1 custom-scrollbar scroll-smooth">
        {paginatedLogs.map((log, i) => {
          const actualIndex = (currentPage - 1) * logsPerPage + i;
          const isLast = actualIndex === logs.length - 1;
          
          // Calculate turn number for player logs correctly across pages
          const turnNumber = log.type === 'player' 
            ? logs.slice(0, actualIndex + 1).filter(l => l.type === 'player').length 
            : 0;

          if (log.type === 'system') {
            return (
              <div key={actualIndex} ref={isLast ? lastLogRef : null} className="my-1">
                <div className="text-cyan-400 mono text-[10px] font-black uppercase tracking-tight italic">
                  {renderContent(log.content, log.type)}
                </div>
              </div>
            );
          }

          return (
            <div key={actualIndex} ref={isLast ? lastLogRef : null} className={`animate-in fade-in slide-in-from-bottom-1 duration-300 ${log.type === 'player' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-neutral-300'}`}>
              <div className="flex gap-1.5">
                <span className={`text-[10px] mt-1 font-black mono ${log.type === 'player' ? 'text-emerald-500' : 'opacity-20'}`}>
                  {log.type === 'player' ? '❯' : '•'}
                </span>
                <div className="flex-grow flex flex-col min-w-0">
                  {log.type === 'player' && (
                    <div className="mb-0.5 flex items-center gap-1">
                       <span className="text-[8px] mono font-black text-emerald-500/30 uppercase tracking-widest">HÀNH_ĐỘNG_{turnNumber.toString().padStart(3, '0')}</span>
                    </div>
                  )}
                  <div className={`mono ${fontSizeClass} leading-relaxed`}>
                    {renderContent(log.content, log.type)}
                  </div>

                  {log.imageUrl && (
                    <div className="mt-2 mb-1 rounded-xl overflow-hidden border border-white/10 shadow-lg animate-in fade-in zoom-in duration-700">
                      <img 
                        src={log.imageUrl} 
                        alt="Scene illustration" 
                        className="w-full h-auto object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  
                  {log.type === 'narrator' && log.suggestedActions && log.suggestedActions.length > 0 && actualIndex === logs.length - 1 && (
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                      {log.suggestedActions.map((sObj: any, idx) => {
                        const actionText = typeof sObj === 'string' ? sObj : (sObj.action || "Tiếp tục");
                        const actionTime = typeof sObj === 'string' ? 15 : (sObj.time || 15);
                        return (
                          <div key={idx} className="flex items-center gap-1.5 group/action">
                            <div
                              onClick={() => !isLoading && handleSubmit(undefined, actionText, actionTime)}
                              className={`p-1 flex-grow rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 mono text-[12px] uppercase font-black active:scale-95 flex items-center justify-between gap-2 shadow-lg ${isLoading ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-500/40">❯</span>
                                <span className="whitespace-normal text-left">{actionText}</span>
                              </div>
                              <span className="px-2 py-1 bg-black/60 rounded-lg text-[9px] text-emerald-500/60 border border-white/5 shrink-0">
                                {formatActionTime(actionTime)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(actionText, idx);
                              }}
                              className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl active:scale-90 transition-all shadow-lg shrink-0"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-emerald-500/40" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg)] border-t border-white/10 shrink-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className={`absolute top-0 left-0 w-full h-0.5 ${aiTheme.scanline} animate-[scan_2s_linear_infinite]`}></div>
            </div>
            
            <div className="w-full space-y-4 relative z-10">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <div className={`w-12 h-12 border-2 ${aiTheme.primary.replace('text-', 'border-')}/20 rounded-full animate-spin`}></div>
                  <div className={`absolute inset-0 border-t-2 ${aiTheme.primary.replace('text-', 'border-')} rounded-full animate-[spin_1s_linear_infinite]`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className={`w-5 h-5 ${aiTheme.iconColor}`} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className={`${aiTheme.primary} mono text-sm font-black tracking-widest uppercase italic`}>
                    {aiTheme.label}
                  </h3>
                  <p className={`${aiTheme.secondary} mono text-[8px] font-bold uppercase tracking-tighter`}>
                    {getAiProcessingStep(elapsedTime)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end px-1">
                  <span className={`text-[8px] mono font-black ${aiTheme.secondary} uppercase`}>Sync: {Math.min(100, Math.floor((elapsedTime / 25) * 100))}%</span>
                  <span className={`${aiTheme.primary} mono text-lg font-black tabular-nums`}>{formatTime(elapsedTime)}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className={`h-full bg-gradient-to-r ${aiTheme.accent} transition-all duration-1000 ease-out ${aiTheme.glow}`}
                    style={{ width: `${Math.min((elapsedTime / 25) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center -mt-3 mb-1">
          <button 
            type="button"
            onClick={() => setIsInputCollapsed(!isInputCollapsed)}
            className="w-12 h-6 flex items-center justify-center rounded-t-xl bg-neutral-900 border-x border-t border-white/10 text-neutral-500 shadow-lg"
          >
            {isInputCollapsed ? '▲' : '▼'}
          </button>
        </div>

        {!isInputCollapsed && (
          <div className="p-1">
            {/* Mobile Pagination Controls */}
            <div className="flex items-center justify-between mb-2 px-2 py-1 bg-black/40 border border-white/5 rounded-lg shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-neutral-500 active:text-emerald-500 disabled:opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="mono text-[9px] font-black text-emerald-500 uppercase">
                    P.{currentPage}/{totalPages}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-neutral-500 active:text-emerald-500 disabled:opacity-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={scrollToTop}
                    className="p-1 text-neutral-500 active:text-cyan-400 flex items-center gap-1"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button 
                    type="button"
                    onClick={scrollToBottom}
                    className="p-1 text-neutral-500 active:text-cyan-400 flex items-center gap-1"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1 opacity-20">
                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                  <span className="text-[7px] mono font-black text-neutral-500 uppercase tracking-tighter">Matrix v3.0</span>
                </div>
              </div>
            </div>

            <div className={`flex flex-col gap-2 bg-[var(--bg)]/10 border p-1 rounded-2xl transition-all relative overflow-hidden ${isLoading ? 'border-emerald-500/20' : 'border-white/5 focus-within:border-emerald-500/40 shadow-[0_0_30px_rgba(0,0,0,0.3)]'}`}>
              <div className="flex items-start gap-2">
                <span className="mt-1 font-black mono text-emerald-500 text-lg">❯</span>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    disabled={isLoading}
                    rows={1}
                    placeholder={isLoading ? "Đang xoay chuyển thực tại..." : placeholder}
                    className={`flex-grow bg-transparent border-none outline-none text-white ${fontSizeClass} mono resize-none py-1 max-h-[150px] placeholder:text-neutral-700`}
                  />
              </div>
              
              <div className="flex justify-between items-center pt-1 border-t border-white/5 gap-2">
                <button 
                  type="button"
                  onClick={onOpenAiHint}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Nhắc AI
                </button>
                
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-[2] py-3 rounded-xl bg-emerald-500 text-black mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <Send className="w-4 h-4" />
                  Gửi Hành Động
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
