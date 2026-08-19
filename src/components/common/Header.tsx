import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkforce, ActiveTabType } from '../../context/WorkforceContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Menu,
  UserPlus,
  Sparkles,
  TableProperties,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Check,
  HelpCircle,
  Settings,
  LogOut,
  Key,
  ShieldCheck,
  Building2,
  User,
  Mail,
  X
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const TAB_TITLES: Record<ActiveTabType, { title: string; category: string }> = {
  // 8 Grand Domains
  executive: { title: 'Executive Strategic Cockpit', category: 'Executive' },
  workforce: { title: 'Workforce Foundation & Movement', category: 'Workforce' },
  'competency-tna': { title: 'Competency Framework & TNA Engine', category: 'Competency' },
  'learning-training': { title: 'Learning & Annual Training Lifecycle', category: 'Learning' },
  'talent-succession': { title: '9-Box Talent & Succession Bench', category: 'Talent' },
  'performance-dev': { title: 'Performance & Individual Development Plan', category: 'Performance' },
  'workforce-planning': { title: 'Manpower Planning & 4-Pillar Studio', category: 'Planning' },
  'people-intelligence': { title: 'People Intelligence & AI Strategic Advisor', category: 'Intelligence' },
  'help-guide': { title: 'Pusat Bantuan & Simulasi Alur Kerja', category: 'Panduan' },
  settings: { title: 'Pusat Pengaturan Sistem & Organisasi', category: 'Pengaturan' },

  // Legacy Tab Support
  dashboard: { title: 'Executive Strategic Cockpit', category: 'Executive' },
  matrix: { title: 'Matriks Pelatihan & TNA', category: 'Competency' },
  ninebox: { title: '9-Box Talent Engine', category: 'Talent' },
  mpp: { title: 'Manpower Planning (MPP)', category: 'Planning' },
  org: { title: 'Struktur Organisasi & Posisi Kritis', category: 'Workforce' },
  employees: { title: 'Direktori Karyawan & Profil 360', category: 'Workforce' },
  'tna-setup': { title: 'Konfigurasi Standar TNA', category: 'Competency' },
  'ai-advisor': { title: 'AI Strategic Advisor', category: 'Intelligence' },
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeTab,
    setActiveTab,
    setDomainSubTab,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsAddEmployeeModalOpen,
    setIsAddModuleModalOpen,
    openExportImportModal,
    dbMode,
    isDbReady
  } = useWorkforce();

  const setIsSettingsModalOpen = useSettingsStore((s) => s.setIsSettingsModalOpen);
  const setActiveSettingsTab = useSettingsStore((s) => s.setActiveSettingsTab);
  const isCustomKeySet = useSettingsStore((s) => s.isCustomKeySet);
  const companyProfile = useSettingsStore((s) => s.companyProfile);

  const accountType = useAuthStore((s) => s.accountType);
  const userProfile = useAuthStore((s) => s.userProfile);
  const logout = useAuthStore((s) => s.logout);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const currentTab = TAB_TITLES[activeTab] || { title: 'WorkforceOS', category: 'Enterprise' };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.targetTab) {
      setActiveTab(notif.targetTab as ActiveTabType);
      if (notif.targetSubTab) {
        if (notif.targetTab === 'competency-tna') setDomainSubTab('competencyTna', notif.targetSubTab);
        if (notif.targetTab === 'learning-training') setDomainSubTab('learningTraining', notif.targetSubTab);
        if (notif.targetTab === 'talent-succession') setDomainSubTab('talentSuccession', notif.targetSubTab);
        if (notif.targetTab === 'performance-dev') setDomainSubTab('performanceDev', notif.targetSubTab);
      }
    }
    setIsNotifOpen(false);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20 font-sans">
      {/* Left: Mobile Toggle & Single-Line Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka Menu"
          className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0 hidden sm:inline">
            {currentTab.category}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate font-display">
            {currentTab.title}
          </h1>
        </div>
      </div>

      {/* Right: Clean, Uncluttered Compact Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Database Status Indicator */}
        <div 
          title={dbMode === 'sqlite' ? 'Database SQLite Lokal Aktif (workforce_os.db)' : 'Penyimpanan LocalStorage (Fallback)'}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDbReady ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>{dbMode === 'sqlite' ? 'SQLite' : 'Local'}</span>
        </div>

        {/* Global Notification Center 🔔 */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Pusat Notifikasi & Alert Sistem"
            className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition active:scale-95 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in flex flex-col max-h-[80vh]">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">Pusat Notifikasi ({unreadCount})</span>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-100 p-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl transition-all cursor-pointer space-y-1 ${
                        n.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-slate-50/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            n.severity === 'red' ? 'bg-rose-500 ring-2 ring-rose-200' :
                            n.severity === 'yellow' ? 'bg-amber-400 ring-2 ring-amber-100' :
                            'bg-blue-500 ring-2 ring-blue-100'
                          }`} />
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 pl-4 leading-relaxed">{n.message}</p>

                      {n.actionLabel && (
                        <div className="pl-4 pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            <span>{n.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account License Status Badge */}
        {accountType === 'demo' ? (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="hidden sm:inline">Mode Demo (Maks 5 Data)</span>
            <button
              onClick={() => {
                setActiveSettingsTab('license');
                setActiveTab('settings');
              }}
              className="ml-1 px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
            >
              <Key className="w-2.5 h-2.5" />
              <span>Aktivasi</span>
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Enterprise License</span>
          </div>
        )}

        {/* Full Page Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          title="Buka Pusat Pengaturan Sistem & Organisasi"
          className={`p-2 rounded-lg border transition active:scale-95 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/80'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white rotate-45' : 'text-slate-600'} transition-transform`} />
        </button>

        {/* Export / Import Button (Compact) */}
        <button
          onClick={() => openExportImportModal('employees', 'export')}
          title="Buka Pusat Export & Import Data"
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition active:scale-95 cursor-pointer"
        >
          <TableProperties className="w-4 h-4 text-slate-600" />
        </button>

        {/* Help Center & Use Cases Button */}
        <button
          onClick={() => setActiveTab('help-guide')}
          title="Pusat Bantuan, Tanya Jawab &amp; Simulasi Alur Kerja"
          className={`p-2 rounded-lg border transition active:scale-95 cursor-pointer ${
            activeTab === 'help-guide'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/80'
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${activeTab === 'help-guide' ? 'text-white' : 'text-slate-600'}`} />
        </button>

        {/* Logout / Switch Account Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          title="Keluar / Ganti Akun"
          className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Contextual Primary Action Button */}
        {activeTab === 'competency-tna' || activeTab === 'matrix' || activeTab === 'tna-setup' || activeTab === 'learning-training' ? (
          <button
            onClick={() => setIsAddModuleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Modul</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Karyawan</span>
          </button>
        )}
      </div>

      {/* Premium Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 z-10 space-y-5"
            >
              {/* Top Row: Icon & Close */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
                  <LogOut className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Explanation */}
              <div className="space-y-1.5 text-left">
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Keluar Sistem
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari sesi kerja saat ini dan kembali ke halaman login? Seluruh data telah tersimpan otomatis di database lokal.
                </p>
              </div>

              {/* Active Session Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sesi Akun Aktif
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    accountType === 'licensed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {accountType === 'licensed' ? 'Lisensi Enterprise' : 'Akun Demo (Evaluasi)'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-800 font-semibold">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{userProfile?.companyName || companyProfile?.companyName || 'PT Aman Kerja'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-[11px] flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{userProfile?.fullName || 'Ahmad Faqih Didin'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile?.email || 'corporate@amankerja.co.id'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ya, Keluar Akun</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
