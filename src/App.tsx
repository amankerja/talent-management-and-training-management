import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Key } from 'lucide-react';
import { WorkforceProvider, useWorkforce, ActiveTabType } from './context/WorkforceContext';
import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';
import { AuthLoginPage } from './components/auth/AuthLoginPage';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';

// Dialogs & Modals on Demand
const Employee360Modal = lazy(() => import('./components/people/Employee360Modal').then((m) => ({ default: m.Employee360Modal })));
const AddEmployeeModal = lazy(() => import('./components/people/AddEmployeeModal').then((m) => ({ default: m.AddEmployeeModal })));
const AddModuleModal = lazy(() => import('./components/matrix/AddModuleModal').then((m) => ({ default: m.AddModuleModal })));
const ManageTrainingModulesModal = lazy(() => import('./components/matrix/ManageTrainingModulesModal').then((m) => ({ default: m.ManageTrainingModulesModal })));
const ExportImportModal = lazy(() => import('./components/common/ExportImportModal').then((m) => ({ default: m.ExportImportModal })));
const SettingsModal = lazy(() => import('./components/common/SettingsModal').then((m) => ({ default: m.SettingsModal })));

// 8 Grand Domains (Lazy Loaded)
const ExecutiveDashboardView = lazy(() => import('./components/executive/ExecutiveDashboardView').then((m) => ({ default: m.ExecutiveDashboardView })));
const WorkforceDomainView = lazy(() => import('./components/workforce/WorkforceDomainView').then((m) => ({ default: m.WorkforceDomainView })));
const CompetencyTNAView = lazy(() => import('./components/competency/CompetencyTNAView').then((m) => ({ default: m.CompetencyTNAView })));
const LearningTrainingView = lazy(() => import('./components/learning/LearningTrainingView').then((m) => ({ default: m.LearningTrainingView })));
const TalentSuccessionView = lazy(() => import('./components/talent/TalentSuccessionView').then((m) => ({ default: m.TalentSuccessionView })));
const PerformanceDevView = lazy(() => import('./components/performance/PerformanceDevView').then((m) => ({ default: m.PerformanceDevView })));
const WorkforcePlanningView = lazy(() => import('./components/planning/WorkforcePlanningView').then((m) => ({ default: m.WorkforcePlanningView })));
const PeopleIntelligenceView = lazy(() => import('./components/intelligence/PeopleIntelligenceView').then((m) => ({ default: m.PeopleIntelligenceView })));
const HelpAndUseCasesView = lazy(() => import('./components/help/HelpAndUseCasesView').then((m) => ({ default: m.HelpAndUseCasesView })));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView })));

// Direct Tab Routes for 8 Grand Domains + Legacy Aliases + Help Center + Settings Page
const VIEW_MAP: Record<ActiveTabType, React.LazyExoticComponent<React.FC>> = {
  // 8 Grand Domains + Settings Page
  executive: ExecutiveDashboardView,
  workforce: WorkforceDomainView,
  'competency-tna': CompetencyTNAView,
  'learning-training': LearningTrainingView,
  'talent-succession': TalentSuccessionView,
  'performance-dev': PerformanceDevView,
  'workforce-planning': WorkforcePlanningView,
  'people-intelligence': PeopleIntelligenceView,
  'help-guide': HelpAndUseCasesView,
  settings: SettingsView,

  // Legacy Aliases
  dashboard: ExecutiveDashboardView,
  employees: WorkforceDomainView,
  org: WorkforceDomainView,
  matrix: CompetencyTNAView,
  'tna-setup': CompetencyTNAView,
  ninebox: TalentSuccessionView,
  mpp: WorkforcePlanningView,
  'ai-advisor': PeopleIntelligenceView,
  career: PerformanceDevView,
  'career-architecture': PerformanceDevView,
  'career-ladder': PerformanceDevView
};

const ViewSkeleton: React.FC = () => (
  <div className="flex-1 overflow-hidden p-5 lg:p-8 bg-slate-50 space-y-6">
    <div className="h-24 rounded-xl animate-shimmer" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-shimmer" />
        ))}
      </div>
      <div className="h-64 rounded-xl animate-shimmer" />
    </div>
    <div className="h-72 rounded-xl animate-shimmer" />
  </div>
);

const SIDEBAR_COLLAPSE_KEY = 'workforce_os_v1_sidebar_collapsed';

const AppContent: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accountType = useAuthStore((s) => s.accountType);
  const { 
    activeTab, 
    setActiveTab,
    isEmployeeModalOpen, 
    isAddEmployeeModalOpen, 
    isAddModuleModalOpen, 
    isManageModulesModalOpen,
    isExportImportModalOpen 
  } = useWorkforce();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1';
  });

  const companyProfile = useSettingsStore((s) => s.companyProfile);

  // Sync Favicon and Document Title dynamically when logo is uploaded
  useEffect(() => {
    if (companyProfile.companyLogo) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = companyProfile.companyLogo;
    }
    if (companyProfile.companyName) {
      document.title = `${companyProfile.companyName} — Talent & Training Management`;
    }
  }, [companyProfile.companyLogo, companyProfile.companyName]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  if (!isAuthenticated) {
    return <AuthLoginPage />;
  }

  const ActiveView = VIEW_MAP[activeTab] || ExecutiveDashboardView;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-800 antialiased">
      {/* Mobile scrim */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Navigation Sidebar (8 Grand Domains) */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Global Executive Header */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Global Demo / Read-Only Warning Banner */}
        {accountType === 'demo' && (
          <div className="bg-amber-50 border-b border-amber-200/90 text-amber-950 px-4 py-2 flex items-center justify-between text-xs shrink-0 font-medium z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-2xs">
                <Lock className="w-3 h-3" />
                READ-ONLY DEMO
              </span>
              <span className="truncate text-xs text-amber-900">
                <strong>Peringatan Mode Demo / Evaluasi:</strong> Anda sedang dalam sesi uji coba. Halaman &amp; fitur analitikal bersifat <strong>Read-Only (Hanya Lihat)</strong> dengan kuota maksimal 5 data per tabel.
              </span>
            </div>
            <button
              onClick={() => {
                useSettingsStore.getState().setActiveSettingsTab('license');
                setActiveTab('settings');
              }}
              className="ml-3 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3 h-3" />
              <span>Aktivasi Lisensi Penuh</span>
            </button>
          </div>
        )}

        {/* Dynamic Active Module Body */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Suspense fallback={<ViewSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <ActiveView />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {/* Global Interactive Drawers and Dialogs */}
      {isEmployeeModalOpen && (
        <Suspense fallback={null}>
          <Employee360Modal />
        </Suspense>
      )}
      {isAddEmployeeModalOpen && (
        <Suspense fallback={null}>
          <AddEmployeeModal />
        </Suspense>
      )}
      {isAddModuleModalOpen && (
        <Suspense fallback={null}>
          <AddModuleModal />
        </Suspense>
      )}
      {isManageModulesModalOpen && (
        <Suspense fallback={null}>
          <ManageTrainingModulesModal />
        </Suspense>
      )}
      {isExportImportModalOpen && (
        <Suspense fallback={null}>
          <ExportImportModal />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <SettingsModal />
      </Suspense>
      <CommandPalette />

      {/* Global Feedback Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkforceProvider>
      <AppContent />
    </WorkforceProvider>
  );
}
