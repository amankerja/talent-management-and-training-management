import { create } from 'zustand';
import { Employee } from '../types';
import { ExportImportEntity } from '../utils/dataExportImport';

export type ActiveTabType = 
  // 8 Main Grand Domains + Dedicated Settings & Help
  | 'executive'
  | 'workforce'
  | 'competency-tna'
  | 'learning-training'
  | 'talent-succession'
  | 'performance-dev'
  | 'workforce-planning'
  | 'people-intelligence'
  | 'help-guide'
  | 'settings'
  // Legacy / Direct Shortcuts Compatibility
  | 'dashboard'
  | 'matrix' 
  | 'tna-setup' 
  | 'ninebox' 
  | 'mpp' 
  | 'org' 
  | 'employees'
  | 'ai-advisor';

interface UIState {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  
  // Subtab routing memory for domains
  domainSubTabs: {
    workforce: string;
    competencyTna: string;
    learningTraining: string;
    talentSuccession: string;
    performanceDev: string;
    workforcePlanning: string;
    peopleIntelligence: string;
  };
  setDomainSubTab: (domain: keyof UIState['domainSubTabs'], subTab: string) => void;

  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  
  isEmployeeModalOpen: boolean;
  setIsEmployeeModalOpen: (open: boolean) => void;
  
  isAddEmployeeModalOpen: boolean;
  setIsAddEmployeeModalOpen: (open: boolean) => void;
  
  isAddModuleModalOpen: boolean;
  setIsAddModuleModalOpen: (open: boolean) => void;
  
  isManageModulesModalOpen: boolean;
  setIsManageModulesModalOpen: (open: boolean) => void;
  
  isExportImportModalOpen: boolean;
  setIsExportImportModalOpen: (open: boolean) => void;
  
  exportImportEntity: ExportImportEntity;
  setExportImportEntity: (entity: ExportImportEntity) => void;
  
  exportImportTab: 'export' | 'import' | 'backup';
  setExportImportTab: (tab: 'export' | 'import' | 'backup') => void;
  
  openExportImportModal: (entity?: ExportImportEntity, tab?: 'export' | 'import' | 'backup') => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'executive',
  setActiveTab: (tab) => set({ activeTab: tab }),

  domainSubTabs: {
    workforce: 'directory',
    competencyTna: 'library',
    learningTraining: 'annual-plan',
    talentSuccession: 'ninebox',
    performanceDev: 'idp',
    workforcePlanning: 'studio',
    peopleIntelligence: 'ai-advisor'
  },
  setDomainSubTab: (domain, subTab) => 
    set((state) => ({
      domainSubTabs: {
        ...state.domainSubTabs,
        [domain]: subTab
      }
    })),

  selectedEmployee: null,
  setSelectedEmployee: (emp) => set({ selectedEmployee: emp }),

  isEmployeeModalOpen: false,
  setIsEmployeeModalOpen: (open) => set({ isEmployeeModalOpen: open }),

  isAddEmployeeModalOpen: false,
  setIsAddEmployeeModalOpen: (open) => set({ isAddEmployeeModalOpen: open }),

  isAddModuleModalOpen: false,
  setIsAddModuleModalOpen: (open) => set({ isAddModuleModalOpen: open }),

  isManageModulesModalOpen: false,
  setIsManageModulesModalOpen: (open) => set({ isManageModulesModalOpen: open }),

  isExportImportModalOpen: false,
  setIsExportImportModalOpen: (open) => set({ isExportImportModalOpen: open }),

  exportImportEntity: 'employees',
  setExportImportEntity: (entity) => set({ exportImportEntity: entity }),

  exportImportTab: 'export',
  setExportImportTab: (tab) => set({ exportImportTab: tab }),

  openExportImportModal: (entity = 'employees', tab = 'export') =>
    set({
      exportImportEntity: entity,
      exportImportTab: tab,
      isExportImportModalOpen: true
    })
}));
