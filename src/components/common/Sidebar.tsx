import React, { useState, useEffect } from 'react';
import { useWorkforce, ActiveTabType } from '../../context/WorkforceContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  LayoutDashboard,
  Users,
  Target,
  GraduationCap,
  Award,
  Compass,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TableProperties,
  HelpCircle,
  Settings,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface DomainNavItem {
  tab: ActiveTabType;
  label: string;
  icon: LucideIcon;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile, collapsed, onToggleCollapse }) => {
  const { 
    activeTab, 
    setActiveTab, 
    stats, 
    openExportImportModal 
  } = useWorkforce();

  const companyProfile = useSettingsStore((s) => s.companyProfile);
  const setIsSettingsModalOpen = useSettingsStore((s) => s.setIsSettingsModalOpen);

  // Normalize legacy tab keys to grand domains for active highlighting
  const getNormalizedDomain = (tab: ActiveTabType): ActiveTabType => {
    if (tab === 'dashboard') return 'executive';
    if (tab === 'employees' || tab === 'org') return 'workforce';
    if (tab === 'matrix' || tab === 'tna-setup') return 'competency-tna';
    if (tab === 'ninebox') return 'talent-succession';
    if (tab === 'mpp') return 'workforce-planning';
    if (tab === 'ai-advisor') return 'people-intelligence';
    return tab;
  };

  const normalizedActiveTab = getNormalizedDomain(activeTab);

  const DOMAIN_NAV_ITEMS: DomainNavItem[] = [
    { 
      tab: 'executive', 
      label: 'Executive Cockpit', 
      icon: LayoutDashboard
    },
    { 
      tab: 'workforce', 
      label: 'Workforce Foundation', 
      icon: Users
    },
    { 
      tab: 'competency-tna', 
      label: 'Competency & TNA', 
      icon: Target
    },
    { 
      tab: 'learning-training', 
      label: 'Learning & Training', 
      icon: GraduationCap
    },
    { 
      tab: 'talent-succession', 
      label: 'Talent & Succession', 
      icon: Award
    },
    { 
      tab: 'performance-dev', 
      label: 'Performance & IDP', 
      icon: Compass
    },
    { 
      tab: 'workforce-planning', 
      label: 'Workforce Planning', 
      icon: TrendingUp
    },
    { 
      tab: 'people-intelligence', 
      label: 'People Intelligence', 
      icon: Sparkles
    },
  ];

  const handleNavClick = (tab: ActiveTabType) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) onCloseMobile();
  };

  return (
    <aside
      className={`
        fixed lg:static top-0 bottom-0 left-0 z-30
        flex flex-col bg-white border-r border-slate-200/80
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      {collapsed ? (
        <div className="h-16 flex items-center justify-center border-b border-slate-100 group">
          <button
            onClick={onToggleCollapse}
            title={`${companyProfile.companyName || 'WorkforceOS'} — Klik untuk memperluas menu`}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs transition-all cursor-pointer group relative overflow-hidden"
          >
            {companyProfile.companyLogo ? (
              <img src={companyProfile.companyLogo} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4.5 h-4.5 group-hover:hidden" />
              </div>
            )}
            <div className="absolute inset-0 bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true, 'company')}
            title="Klik untuk ubah profil & logo perusahaan"
            className="flex items-center gap-2.5 min-w-0 text-left p-1 rounded-xl hover:bg-slate-100/80 transition cursor-pointer flex-1 group"
          >
            {companyProfile.companyLogo ? (
              <div className="relative w-9 h-9 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-400 transition">
                <img src={companyProfile.companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:bg-blue-700 transition">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xs font-bold text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition">
                {companyProfile.companyName || 'WorkforceOS'}
              </h1>
              <p className="text-[10.5px] text-slate-400 truncate">
                {companyProfile.industryType || 'Enterprise Talent System'}
              </p>
            </div>
          </button>

          <button
            onClick={onToggleCollapse}
            aria-label="Ciutkan Menu"
            title="Ciutkan Sidebar"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
        )}

        {DOMAIN_NAV_ITEMS.map((item) => {
          const isActive = normalizedActiveTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group font-sans cursor-pointer
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              <div className="relative shrink-0">
                <Icon
                  className={`
                    w-4 h-4 transition-colors
                    ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                  `}
                />
              </div>

              {!collapsed && (
                <span className="truncate text-left flex-1 font-medium">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-2 pb-1">
          <div className="border-t border-slate-100" />
        </div>

        {/* Export / Import Hub in Sidebar */}
        <div className="pt-1">
          <button
            onClick={() => openExportImportModal('employees', 'export')}
            title={collapsed ? 'Export & Import Data Hub' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group font-sans
              text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium cursor-pointer
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <TableProperties className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
            {!collapsed && (
              <span className="truncate flex-1 text-left">Pusat Export / Import</span>
            )}
          </button>
        </div>

        {/* Help Center & Use Cases in Sidebar */}
        <div className="pt-1">
          <button
            onClick={() => handleNavClick('help-guide')}
            title={collapsed ? 'Pusat Bantuan, Q&A & Simulasi Alur Kerja' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group font-sans cursor-pointer
              ${
                activeTab === 'help-guide'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <HelpCircle className={`w-4 h-4 shrink-0 ${activeTab === 'help-guide' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            {!collapsed && (
              <span className="truncate flex-1 text-left">Panduan &amp; Simulasi</span>
            )}
          </button>
        </div>

        {/* Settings & Master Data Menu Item in Sidebar (Full Page) */}
        <div className="pt-1">
          <button
            onClick={() => handleNavClick('settings')}
            title={collapsed ? 'Pusat Pengaturan Sistem (Profil, Referensi, Lisensi & Backup)' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group font-sans cursor-pointer
              ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-blue-600 rotate-45' : 'text-slate-400 group-hover:text-blue-600 group-hover:rotate-45'} transition-transform`} />
            {!collapsed && (
              <span className="truncate flex-1 text-left font-bold">Pengaturan / Settings</span>
            )}
          </button>
        </div>
      </nav>

      {/* Compact User / System Status Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 m-2 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Kepatuhan Pelatihan</span>
            <span className="font-semibold text-slate-700">{stats.complianceRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-100 flex items-center justify-center">
          <button
            onClick={onToggleCollapse}
            aria-label="Perluas Menu"
            title="Perluas Sidebar"
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
