import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkforce, ActiveTabType } from '../../context/WorkforceContext';
import {
  Search,
  LayoutDashboard,
  TableProperties,
  SlidersHorizontal,
  Grid3X3,
  TrendingUp,
  Network,
  Users,
  Sparkles,
  UserPlus,
  PlusCircle,
  CornerDownLeft,
  Command,
  LucideIcon,
  Target,
  GraduationCap,
  Award,
  Compass,
  History,
  Calendar,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  keywords: string;
  run: () => void;
}

export const CommandPalette: React.FC = () => {
  const { 
    setActiveTab, 
    setIsAddEmployeeModalOpen, 
    setIsAddModuleModalOpen,
    openExportImportModal 
  } = useWorkforce();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const goTo = (tab: ActiveTabType) => () => {
    setActiveTab(tab);
    close();
  };

  const items: CommandItem[] = useMemo(
    () => [
      { id: 'executive', label: '01. Executive Strategic Cockpit', hint: 'Domain 01', icon: LayoutDashboard, keywords: 'executive dashboard kpi health risk radar direksi', run: goTo('executive') },
      { id: 'workforce', label: '02. Workforce Foundation & Movement', hint: 'Domain 02', icon: Users, keywords: 'workforce employee karyawan movement mutasi rotasi promosi timeline org struktur', run: goTo('workforce') },
      { id: 'competency-tna', label: '03. Competency Framework & TNA Engine', hint: 'Domain 03', icon: Target, keywords: 'competency tna gap assessment dictionary library standar kemahiran', run: goTo('competency-tna') },
      { id: 'learning-training', label: '04. Learning & Annual Training Lifecycle', hint: 'Domain 04', icon: GraduationCap, keywords: 'learning training atp annual plan batch event kelas trainer sertifikat', run: goTo('learning-training') },
      { id: 'talent-succession', label: '05. 9-Box Talent & Succession Bench', hint: 'Domain 05', icon: Award, keywords: 'talent succession 9box nine box hipo suksesi pipeline bench', run: goTo('talent-succession') },
      { id: 'performance-dev', label: '06. Performance & Individual Development Plan', hint: 'Domain 06', icon: Compass, keywords: 'performance development idp 70 20 10 career path goals kpi', run: goTo('performance-dev') },
      { id: 'workforce-planning', label: '07. Workforce Planning & MPP Studio', hint: 'Domain 07', icon: TrendingUp, keywords: 'mpp manpower planning 4 pilar budget headcount skenario', run: goTo('workforce-planning') },
      { id: 'people-intelligence', label: '08. People Intelligence & AI Advisor', hint: 'Domain 08', icon: Sparkles, keywords: 'people intelligence gemini ai advisor briefing predictive risk', run: goTo('people-intelligence') },
      { id: 'help-guide', label: 'Pusat Bantuan, Tanya Jawab & Simulasi Alur Kerja (Use Cases)', hint: 'Bantuan', icon: HelpCircle, keywords: 'help qna faq use case panduan tutorial simulasi onboarding promosi suksesi atp', run: goTo('help-guide') },

      {
        id: 'export-hub',
        label: 'Pusat Export Data (Excel / CSV / JSON)',
        hint: 'Aksi Cepat',
        icon: TableProperties,
        keywords: 'export ekspor unduh download excel csv json',
        run: () => {
          openExportImportModal('employees', 'export');
          close();
        }
      },
      {
        id: 'import-hub',
        label: 'Pusat Import & Sinkronisasi Data',
        hint: 'Aksi Cepat',
        icon: TableProperties,
        keywords: 'import impor upload unggah sinkronisasi template',
        run: () => {
          openExportImportModal('employees', 'import');
          close();
        }
      },
      {
        id: 'backup-restore',
        label: 'Backup & Restore Database Lengkap',
        hint: 'Aksi Cepat',
        icon: TableProperties,
        keywords: 'backup restore pulihkan database cadangan snapshot',
        run: () => {
          openExportImportModal('all', 'backup');
          close();
        }
      },
      {
        id: 'add-employee',
        label: 'Tambah Karyawan Baru',
        hint: 'Aksi Cepat',
        icon: UserPlus,
        keywords: 'tambah baru employee karyawan register onboard',
        run: () => {
          setIsAddEmployeeModalOpen(true);
          close();
        }
      },
      {
        id: 'add-module',
        label: 'Tambah Modul Pelatihan Baru',
        hint: 'Aksi Cepat',
        icon: PlusCircle,
        keywords: 'tambah modul training baru course silabus',
        run: () => {
          setIsAddModuleModalOpen(true);
          close();
        }
      }
    ],
    [goTo, openExportImportModal, setIsAddEmployeeModalOpen, setIsAddModuleModalOpen]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        filtered[activeIndex].run();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={close} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari domain, modul, fitur, atau aksi cepat... (contoh: '03', 'movement', 'atp')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada navigasi atau aksi yang cocok dengan kata kunci "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === activeIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.hint}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigasi</span>
            <span>↵ Pilih</span>
          </div>
          <span>WorkforceOS 8 Grand Domains</span>
        </div>
      </motion.div>
    </div>
  );
};
