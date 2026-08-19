import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  Zap,
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  Target,
  Users,
  AlertTriangle,
  Clock,
  DollarSign,
  Briefcase,
  Copy,
  Check,
  BookOpen,
  Crown,
  Network,
  ShieldCheck,
  RefreshCw,
  Cpu,
  BarChart3,
  Lightbulb,
  Building2,
  Key,
  ExternalLink,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { 
  askGeminiAdvisor, 
  WorkforceContextPayload 
} from '../../services/gemini';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
  actionRecommendation?: {
    tab: 'matrix' | 'ninebox' | 'mpp' | 'org' | 'employees' | 'tna-setup';
    buttonText: string;
  };
  metricsHighlight?: {
    label: string;
    value: string;
    tone: 'positive' | 'warning' | 'critical';
  }[];
}

const AIMessageContent: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-line font-medium leading-relaxed">{text}</div>;
  }

  // Parse text into formatted paragraphs, bold, lists, and headers
  return (
    <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-sans select-text">
      {text.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-slate-900 pt-1.5 pb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{trimmed.replace('### ', '')}</span>
            </h4>
          );
        }

        // Header ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-slate-900 pt-2 pb-0.5 border-b border-slate-200/60">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-indigo-600 font-bold leading-none mt-1">•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-indigo-600 font-bold font-mono text-[11px] leading-snug">{numMatch[1]}.</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numMatch[2]) }} />
            </div>
          );
        }

        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        );
      })}
    </div>
  );
};

// Helper for inline markdown bold & code formatting
function formatInlineMarkdown(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-200/70 text-indigo-800 rounded-md font-mono text-[11px] font-semibold">$1</code>');
}

export const AIAdvisorView: React.FC = () => {
  const { 
    employees, 
    trainingModules, 
    criticalPositions, 
    mppData, 
    stats, 
    setActiveTab, 
    addToast 
  } = useWorkforce();

  // Settings & Gemini API Key Store
  const { geminiApiKey, geminiModel, isCustomKeySet, setIsSettingsModalOpen } = useSettingsStore();

  // Chat Conversation State
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg_initial',
      sender: 'ai',
      text: `Halo! Saya adalah **WorkforceOS Strategic AI Advisor** yang terhubung langsung ke database aktif organisasi Anda.\n\nRingkasan Kondisi Terkini:\n• **${stats.totalEmployees} Karyawan Aktif** di 6 Departemen Korporat.\n• **${stats.complianceRate}% Tingkat Kepatuhan TNA** (${stats.totalGapCount} gap kualifikasi).\n• **${criticalPositions.length} Posisi Kritis** (${stats.noSuccessorCount} posisi tanpa suksesor *Ready Now*).\n• **${stats.contractsExpiringCount} Karyawan PKWT** akan habis kontrak dalam <90 hari.\n\n${isCustomKeySet ? `✨ *Mesin reasoning Google Gemini (${geminiModel}) siap digunakan.*` : '💡 *Tip: Masukkan Google Gemini API Key di tombol AI Settings di atas untuk mengaktifkan reasoning LLM generasi terbaru.*'}\n\nSilakan tanyakan skenario suksesi, prioritas kurikulum pelatihan TNA, audit diagnostik, atau efisiensi anggaran 4-pilar MPP hari ini!`,
      timestamp: 'Baru saja',
      metricsHighlight: [
        { label: 'Kepatuhan TNA', value: `${stats.complianceRate}%`, tone: stats.complianceRate >= 80 ? 'positive' : 'warning' },
        { label: 'Posisi Kritis Rentan', value: `${stats.noSuccessorCount} Posisi`, tone: stats.noSuccessorCount > 0 ? 'critical' : 'positive' },
        { label: 'Manajer Over-Spanned', value: `${stats.overSpannedManagersCount} Orang`, tone: stats.overSpannedManagersCount > 0 ? 'warning' : 'positive' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Context Payload for Gemini LLM
  const workforceContextPayload: WorkforceContextPayload = useMemo(() => ({
    stats,
    criticalPositions,
    employeesCount: employees.length,
    mppData,
    trainingModulesCount: trainingModules.length
  }), [stats, criticalPositions, employees, mppData, trainingModules]);

  // Quick Prompt Chips
  const SAMPLE_PROMPTS = [
    { label: '👑 Rancang Rencana Suksesi Posisi Kritis', query: 'Rancang rencana suksesi darurat dan langkah mitigasi untuk posisi kunci yang belum memiliki suksesor siap (Ready Now)' },
    { label: '📊 Audit Diagnostik Kesehatan Organisasi', query: 'Lakukan audit diagnostik menyeluruh mengenai kondisi 5 pilar kesehatan tenaga kerja korporat dan berikan rekomendasi aksi prioritas' },
    { label: '💰 Optimasi Anggaran 4-Pilar MPP', query: 'Bagaimana cara mengoptimalkan bauran 4-pilar MPP (Eksternal, Mobilitas Internal, Upskilling TNA, Otomasi) untuk menghemat biaya rekrutmen?' },
    { label: '📑 Susun Memorandum Eksekutif BoD', query: 'Susun memorandum strategis formal untuk Dewan Direksi (Board of Directors) mengenai kondisi talenta, suksesi, dan resolusi kebijakan' },
    { label: '⚠️ Evaluasi Manajer Over-Spanned (>8 Bawahan)', query: 'Evaluasi risiko rentang kendali manajer yang memimpin lebih dari 8 bawahan langsung dan sarankan restrukturisasi team lead' }
  ];

  // Send Message Handler
  const handleSend = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    if (isCustomKeySet && geminiApiKey) {
      try {
        const aiResponseText = await askGeminiAdvisor(
          trimmed,
          messages.map(m => ({ sender: m.sender, text: m.text })),
          workforceContextPayload,
          geminiApiKey,
          geminiModel
        );

        // Check if response mentions navigating to a specific module
        let actionRec: AIMessage['actionRecommendation'] = undefined;
        const qLow = trimmed.toLowerCase();
        if (qLow.includes('suksesi') || qLow.includes('posisi')) {
          actionRec = { tab: 'org', buttonText: 'Buka Posisi Kritis di Desain Org' };
        } else if (qLow.includes('tna') || qLow.includes('pelatihan') || qLow.includes('modul')) {
          actionRec = { tab: 'matrix', buttonText: 'Buka Matriks Pelatihan & TNA' };
        } else if (qLow.includes('mpp') || qLow.includes('budget') || qLow.includes('biaya')) {
          actionRec = { tab: 'mpp', buttonText: 'Buka Studio Manpower Planning' };
        } else if (qLow.includes('9-box') || qLow.includes('ninebox') || qLow.includes('talenta')) {
          actionRec = { tab: 'ninebox', buttonText: 'Buka 9-Box Talent Engine' };
        }

        const aiMsg: AIMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAiGenerated: true,
          actionRecommendation: actionRec
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        console.error('[AI Advisor] Gemini error:', err);
        const errMsg: AIMessage = {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Gagal Menghubungi Google Gemini API**:\n\n${err?.message || 'Terjadi kesalahan jaringan atau API Key tidak valid.'}\n\nSilakan periksa API Key Anda di menu Pengaturan AI.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Fallback message with 1-click button to setup API key
      setTimeout(() => {
        const aiMsg: AIMessage = {
          id: `ai_fallback_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Google Gemini API Key Belum Dikonfigurasi**\n\nUntuk mendapatkan jawaban berbasis reasoning LLM mendalam untuk pertanyaan *" ${trimmed} "*:\n1. Klik tombol **Setup API Key** di pojok kanan atas.\n2. Masukkan Google Gemini API Key Anda (gratis dari Google AI Studio).\n3. Pilih model yang diinginkan (**Gemini 2.5 Flash** atau **Gemini 2.5 Pro**).\n\nSetelah API Key aktif, seluruh analisis strategis akan diproses secara personal berbasis data live SQLite Anda.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    addToast('Teks Disalin', 'Jawaban AI telah disalin ke clipboard.', 'success');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* ======================================================================= */}
      {/* TOP COMPACT EXECUTIVE CHAT HEADER */}
      {/* ======================================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4.5 h-4.5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                AI Strategic HR &amp; Talent Advisor
              </h2>
              {isCustomKeySet ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{geminiModel}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span>API Key Belum Diset</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.2">
              Asisten intelijen talenta berbasis Google Gemini LLM &amp; data live SQLite
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition active:scale-95 cursor-pointer ${
              isCustomKeySet
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title="Pengaturan Google Gemini API Key & Model"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{isCustomKeySet ? 'AI Settings' : 'Setup API Key'}</span>
          </button>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'msg_reset',
                  sender: 'ai',
                  text: 'Sesi konsultasi direset. Silakan tanyakan hal strategis terkait talenta, TNA, suksesi, atau efisiensi MPP.',
                  timestamp: 'Baru saja'
                }
              ]);
              addToast('Sesi Direset', 'Riwayat percakapan AI telah dibersihkan.', 'info');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
            title="Reset Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MESSAGES SCROLLABLE STREAM AREA */}
      {/* ======================================================================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-4 max-w-4xl w-full mx-auto">
        
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-4 text-xs leading-relaxed space-y-3 relative group transition-all shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <AIMessageContent text={m.text} isUser={isUser} />

                {/* Metrics Highlight Pills (if provided by AI) */}
                {m.metricsHighlight && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    {m.metricsHighlight.map((mh, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">{mh.label}</span>
                        <span className={`text-xs font-bold font-mono ${
                          mh.tone === 'positive' ? 'text-emerald-700' :
                          mh.tone === 'warning' ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {mh.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Recommendation Button */}
                {m.actionRecommendation && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Tindakan Rekomendasi:
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab(m.actionRecommendation!.tab);
                        addToast('Navigasi Modul', `Membuka modul ${m.actionRecommendation!.tab.toUpperCase()}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>{m.actionRecommendation.buttonText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Bubble Footer & Copy Action */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer flex items-center gap-1"
                      title="Salin jawaban"
                    >
                      {copiedMsgId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedMsgId === m.id ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Bounce Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-indigo-700 font-bold p-2.5 bg-white border border-indigo-100 rounded-xl w-fit shadow-xs animate-pulse">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
            </span>
            <span>Google Gemini sedang memproses analisis strategis...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ======================================================================= */}
      {/* PROMPT CHIPS & BOTTOM INPUT BAR */}
      {/* ======================================================================= */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Saran Pertanyaan:</span>
            </span>
            {SAMPLE_PROMPTS.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sp.query)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/80 shadow-2xs transition active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Text Input Container */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition shadow-inner">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tanyakan hal strategis (contoh: Rancang rencana suksesi posisi kritis dan hitung efisiensi biaya MPP)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputQuery);
              }}
              className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-900 bg-transparent outline-hidden placeholder:text-slate-400"
            />

            <button
              onClick={() => handleSend(inputQuery)}
              disabled={!inputQuery.trim() || isTyping}
              className="m-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>WorkforceOS AI Advisor • Analisis deterministik &amp; data-driven</span>
            <span>Tekan <strong>Enter</strong> untuk mengirim</span>
          </div>

        </div>
      </div>

    </div>
  );
};
