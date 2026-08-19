import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { 
  Employee, 
  JobPosition,
  TrainingModule, 
  TNARule, 
  CriticalPosition, 
  ManpowerDeptPlan, 
  Department, 
  JobLevel, 
  TrainingStatusType, 
  NineBoxInfo,
  WorkforceMovement,
  CompetencyItem,
  PositionCompetencyRequirement,
  EmployeeCompetencyAssessment,
  CompetencyGapItem,
  AnnualTrainingPlanItem,
  Trainer,
  TrainingEvent,
  TrainingReminder,
  ExecutiveHealthSummary,
  DetailedIDP,
  CareerNode,
  MPPScenario,
  AgenticActionItem,
  SystemNotification
} from '../types';
import { ExportImportEntity } from '../utils/dataExportImport';
import { useToastStore, Toast } from '../store/useToastStore';
import { useUIStore, ActiveTabType } from '../store/useUIStore';
import { useFilterStore } from '../store/useFilterStore';
import { useWorkforceDataStore, WorkforceOverallStats } from '../store/useWorkforceDataStore';

export type { ActiveTabType, Toast, WorkforceOverallStats };

export interface WorkforceContextType {
  // Domain 02: Workforce Foundation
  employees: Employee[];
  jobPositions: JobPosition[];
  criticalPositions: CriticalPosition[];
  workforceMovements: WorkforceMovement[];
  addWorkforceMovement: (mov: Omit<WorkforceMovement, 'id'>) => void;
  updateWorkforceMovement: (mov: WorkforceMovement) => void;
  deleteWorkforceMovement: (id: string) => void;

  // Domain 03: Competency & TNA
  competencies: CompetencyItem[];
  positionCompetencies: PositionCompetencyRequirement[];
  employeeAssessments: EmployeeCompetencyAssessment[];
  tnaRules: Record<string, TNARule>;
  addCompetency: (item: Omit<CompetencyItem, 'id'>) => void;
  updateCompetency: (item: CompetencyItem) => void;
  deleteCompetency: (id: string) => void;
  savePositionCompetencyRequirement: (req: Omit<PositionCompetencyRequirement, 'id'>) => void;
  deletePositionCompetencyRequirement: (id: string) => void;
  recordEmployeeAssessment: (assessment: Omit<EmployeeCompetencyAssessment, 'id'>) => void;
  getCompetencyGaps: (filterDept?: string) => CompetencyGapItem[];

  // Domain 04: Learning & Training
  trainingModules: TrainingModule[];
  annualTrainingPlans: AnnualTrainingPlanItem[];
  trainers: Trainer[];
  trainingEvents: TrainingEvent[];
  trainingReminders: TrainingReminder[];
  addAnnualTrainingPlan: (plan: Omit<AnnualTrainingPlanItem, 'id'>) => void;
  updateAnnualTrainingPlan: (plan: AnnualTrainingPlanItem) => void;
  deleteAnnualTrainingPlan: (id: string) => void;
  addTrainingEvent: (evt: Omit<TrainingEvent, 'id'>) => void;
  updateTrainingEvent: (evt: TrainingEvent) => void;
  deleteTrainingEvent: (id: string) => void;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void;
  updateTrainer: (trainer: Trainer) => void;
  deleteTrainer: (id: string) => void;
  addTrainingReminder: (rem: Omit<TrainingReminder, 'id' | 'createdAt'>) => void;
  updateTrainingReminder: (rem: TrainingReminder) => void;
  deleteTrainingReminder: (id: string) => void;
  toggleTrainingReminder: (id: string) => void;
  enrollEmployeeToBatch: (eventId: string, employeeId: string) => void;
  completeAttendeeTraining: (eventId: string, employeeId: string, result: { status: 'Passed' | 'Failed'; postTestScore: number; certNo?: string }) => void;
  closeGapWithTrainingDirect: (employeeId: string, competencyId: string, moduleId?: string) => void;

  // Domain 06: Performance & IDP
  detailedIdps: DetailedIDP[];
  careerNodes: CareerNode[];
  updateIDPTaskStatus: (idpId: string, category: 'experience70' | 'exposure20' | 'education10', taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  createOrUpdateIDP: (idp: DetailedIDP) => void;
  addCareerNode: (node: CareerNode) => void;
  updateCareerNode: (node: CareerNode) => void;
  deleteCareerNode: (nodeId: string) => void;
  reorderCareerNodes: (trackId: string, orderedNodes: CareerNode[]) => void;

  // Domain 07: Workforce Planning
  mppData: ManpowerDeptPlan[];
  mppScenarios: MPPScenario[];
  updateMppPlan: (dept: Department, updated: Partial<ManpowerDeptPlan>) => void;
  addMppScenario: (scenario: MPPScenario) => void;

  // Domain 08: People Intelligence & Notification Center
  agenticActions: AgenticActionItem[];
  notifications: SystemNotification[];
  executeAgenticAction: (actionId: string) => void;
  addAgenticAction: (action: Omit<AgenticActionItem, 'id' | 'status'>) => void;
  deleteAgenticAction: (id: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // System & Database State
  dbMode: 'sqlite' | 'localStorage';
  isDbReady: boolean;
  reseedDatabase: () => Promise<void>;

  // UI & Navigation
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  domainSubTabs: {
    workforce: string;
    competencyTna: string;
    learningTraining: string;
    talentSuccession: string;
    performanceDev: string;
    workforcePlanning: string;
    peopleIntelligence: string;
  };
  setDomainSubTab: (domain: 'workforce' | 'competencyTna' | 'learningTraining' | 'talentSuccession' | 'performanceDev' | 'workforcePlanning' | 'peopleIntelligence', subTab: string) => void;

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

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
  filterLevels: string[];
  setFilterLevels: (levels: string[]) => void;
  filterStatuses: TrainingStatusType[];
  setFilterStatuses: (statuses: TrainingStatusType[]) => void;
  filterQualification: 'All' | 'Qualified' | 'Gap';
  setFilterQualification: (q: 'All' | 'Qualified' | 'Gap') => void;

  // Mutations
  updateEmployeeTraining: (empId: string, moduleId: string, status: TrainingStatusType, score?: number, certNo?: string) => void;
  updateTnaRule: (keyOrRule: string | TNARule, ruleMaybe?: TNARule) => void;
  addNewTrainingModule: (mod: Omit<TrainingModule, 'id'>) => void;
  addTrainingModule: (mod: Omit<TrainingModule, 'id'>) => void;
  updateTrainingModule: (mod: TrainingModule) => void;
  deleteTrainingModule: (id: string) => void;
  addNewEmployee: (emp: Omit<Employee, 'id'>) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  addNewJobPosition: (pos: Omit<JobPosition, 'id'> | JobPosition) => void;
  addJobPosition: (pos: Omit<JobPosition, 'id'> | JobPosition) => void;
  updateJobPosition: (pos: JobPosition) => void;
  deleteJobPosition: (id: string) => void;
  addCriticalPosition: (pos: Omit<CriticalPosition, 'id' | 'successors'>) => void;
  deleteCriticalPosition: (id: string) => void;
  nominateSuccessor: (criticalPosId: string, candidateEmpId: string, readiness?: 'Ready Now' | 'Ready in 1 Year' | 'Ready in 2-3 Years') => void;
  removeSuccessor: (criticalPosId: string, candidateEmpId: string) => void;

  // Bulk Operations
  importEmployees: (imported: Employee[], mode?: 'merge' | 'replace') => Promise<number>;
  importTrainingModules: (imported: TrainingModule[], mode?: 'merge' | 'replace') => Promise<number>;
  importTrainingMatrix: (records: { nip: string; moduleCodeOrId: string; status: TrainingStatusType; score?: number; certNo?: string; completedDate?: string }[]) => Promise<number>;
  importTnaRules: (rules: Record<string, TNARule>, mode?: 'merge' | 'replace') => Promise<number>;
  importNineBoxCalibrations: (calibrations: { nip: string; perf: 'Low' | 'Medium' | 'High'; pot: 'Low' | 'Medium' | 'High'; isKeyTalent?: boolean; isSuccessorReady?: boolean }[]) => Promise<number>;
  importMppPlans: (plans: ManpowerDeptPlan[], mode?: 'merge' | 'replace') => Promise<number>;
  importCriticalPositions: (positions: CriticalPosition[], mode?: 'merge' | 'replace') => Promise<number>;
  importJobPositions: (positions: JobPosition[], mode?: 'merge' | 'replace') => Promise<number>;
  restoreFullDatabaseBackup: (backupData: any, mode?: 'merge' | 'replace') => Promise<void>;

  // Selectors & Computed
  getRuleFor: (dept: Department, level: JobLevel) => TNARule | undefined;
  checkQualification: (emp: Employee) => {
    isQualified: boolean;
    eduValid: boolean;
    tenureValid: boolean;
    requiredTrainingsCount: number;
    completedTrainingsCount: number;
    trainingComplete: boolean;
    statusText: string;
    badgeClass: string;
  };
  getDirectReportsFor: (managerId: string, managerName?: string) => Employee[];
  getNineBoxBox: (boxNumber: number | Employee) => NineBoxInfo;
  getPositionsByDepartment: (dept: Department | 'All') => JobPosition[];
  getFilledCountForPosition: (posTitle: string, dept: Department) => number;
  stats: WorkforceOverallStats;
  executiveHealth: ExecutiveHealthSummary;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const WorkforceContext = createContext<WorkforceContextType | null>(null);

export const WorkforceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dataStore = useWorkforceDataStore();
  const uiStore = useUIStore();
  const filterStore = useFilterStore();
  const toastStore = useToastStore();

  useEffect(() => {
    dataStore.initStore();
  }, []);

  const stats = useMemo(() => {
    return dataStore.getOverallStats();
  }, [dataStore.employees, dataStore.trainingModules, dataStore.criticalPositions, dataStore.tnaRules]);

  const executiveHealth = useMemo(() => {
    return dataStore.getExecutiveHealthSummary();
  }, [dataStore.employees, dataStore.criticalPositions, dataStore.mppData, dataStore.positionCompetencies, stats]);

  const value: WorkforceContextType = {
    // Data
    employees: dataStore.employees,
    jobPositions: dataStore.jobPositions,
    criticalPositions: dataStore.criticalPositions,
    workforceMovements: dataStore.workforceMovements,
    addWorkforceMovement: dataStore.addWorkforceMovement,
    updateWorkforceMovement: dataStore.updateWorkforceMovement,
    deleteWorkforceMovement: dataStore.deleteWorkforceMovement,

    competencies: dataStore.competencies,
    positionCompetencies: dataStore.positionCompetencies,
    employeeAssessments: dataStore.employeeAssessments,
    tnaRules: dataStore.tnaRules,
    addCompetency: dataStore.addCompetency,
    updateCompetency: dataStore.updateCompetency,
    deleteCompetency: dataStore.deleteCompetency,
    savePositionCompetencyRequirement: dataStore.savePositionCompetencyRequirement,
    deletePositionCompetencyRequirement: dataStore.deletePositionCompetencyRequirement,
    recordEmployeeAssessment: dataStore.recordEmployeeAssessment,
    getCompetencyGaps: dataStore.getCompetencyGaps,

    trainingModules: dataStore.trainingModules,
    annualTrainingPlans: dataStore.annualTrainingPlans,
    trainers: dataStore.trainers,
    trainingEvents: dataStore.trainingEvents,
    trainingReminders: dataStore.trainingReminders,
    addAnnualTrainingPlan: dataStore.addAnnualTrainingPlan,
    updateAnnualTrainingPlan: dataStore.updateAnnualTrainingPlan,
    deleteAnnualTrainingPlan: dataStore.deleteAnnualTrainingPlan,
    addTrainingEvent: dataStore.addTrainingEvent,
    updateTrainingEvent: dataStore.updateTrainingEvent,
    deleteTrainingEvent: dataStore.deleteTrainingEvent,
    addTrainer: dataStore.addTrainer,
    updateTrainer: dataStore.updateTrainer,
    deleteTrainer: dataStore.deleteTrainer,
    addTrainingReminder: dataStore.addTrainingReminder,
    updateTrainingReminder: dataStore.updateTrainingReminder,
    deleteTrainingReminder: dataStore.deleteTrainingReminder,
    toggleTrainingReminder: dataStore.toggleTrainingReminder,
    enrollEmployeeToBatch: dataStore.enrollEmployeeToBatch,
    completeAttendeeTraining: dataStore.completeAttendeeTraining,
    closeGapWithTrainingDirect: dataStore.closeGapWithTrainingDirect,

    detailedIdps: dataStore.detailedIdps,
    careerNodes: dataStore.careerNodes,
    updateIDPTaskStatus: dataStore.updateIDPTaskStatus,
    createOrUpdateIDP: dataStore.createOrUpdateIDP,
    addCareerNode: dataStore.addCareerNode,
    updateCareerNode: dataStore.updateCareerNode,
    deleteCareerNode: dataStore.deleteCareerNode,
    reorderCareerNodes: dataStore.reorderCareerNodes,

    mppData: dataStore.mppData,
    mppScenarios: dataStore.mppScenarios,
    updateMppPlan: dataStore.updateMppPlan,
    addMppScenario: dataStore.addMppScenario,

    agenticActions: dataStore.agenticActions,
    notifications: dataStore.notifications,
    executeAgenticAction: dataStore.executeAgenticAction,
    addAgenticAction: dataStore.addAgenticAction,
    deleteAgenticAction: dataStore.deleteAgenticAction,
    addNotification: dataStore.addNotification,
    markNotificationAsRead: dataStore.markNotificationAsRead,
    markAllNotificationsAsRead: dataStore.markAllNotificationsAsRead,

    dbMode: dataStore.dbMode,
    isDbReady: dataStore.isDbReady,
    reseedDatabase: dataStore.reseedDatabase,

    // UI
    activeTab: uiStore.activeTab,
    setActiveTab: uiStore.setActiveTab,
    domainSubTabs: uiStore.domainSubTabs,
    setDomainSubTab: uiStore.setDomainSubTab,

    selectedEmployee: uiStore.selectedEmployee,
    setSelectedEmployee: uiStore.setSelectedEmployee,
    isEmployeeModalOpen: uiStore.isEmployeeModalOpen,
    setIsEmployeeModalOpen: uiStore.setIsEmployeeModalOpen,
    isAddEmployeeModalOpen: uiStore.isAddEmployeeModalOpen,
    setIsAddEmployeeModalOpen: uiStore.setIsAddEmployeeModalOpen,
    isAddModuleModalOpen: uiStore.isAddModuleModalOpen,
    setIsAddModuleModalOpen: uiStore.setIsAddModuleModalOpen,
    isManageModulesModalOpen: uiStore.isManageModulesModalOpen,
    setIsManageModulesModalOpen: uiStore.setIsManageModulesModalOpen,
    isExportImportModalOpen: uiStore.isExportImportModalOpen,
    setIsExportImportModalOpen: uiStore.setIsExportImportModalOpen,
    exportImportEntity: uiStore.exportImportEntity,
    setExportImportEntity: uiStore.setExportImportEntity,
    exportImportTab: uiStore.exportImportTab,
    setExportImportTab: uiStore.setExportImportTab,
    openExportImportModal: uiStore.openExportImportModal,

    // Filters
    searchQuery: filterStore.searchQuery,
    setSearchQuery: filterStore.setSearchQuery,
    filterDepartment: filterStore.filterDepartment,
    setFilterDepartment: filterStore.setFilterDepartment,
    filterLevels: filterStore.filterLevels,
    setFilterLevels: filterStore.setFilterLevels,
    filterStatuses: filterStore.filterStatuses,
    setFilterStatuses: filterStore.setFilterStatuses,
    filterQualification: filterStore.filterQualification,
    setFilterQualification: filterStore.setFilterQualification,

    // Mutations
    updateEmployeeTraining: dataStore.updateEmployeeTraining,
    updateTnaRule: dataStore.updateTnaRule,
    addNewTrainingModule: dataStore.addNewTrainingModule,
    addTrainingModule: dataStore.addNewTrainingModule,
    updateTrainingModule: dataStore.updateTrainingModule,
    deleteTrainingModule: dataStore.deleteTrainingModule,
    addNewEmployee: dataStore.addNewEmployee,
    addEmployee: dataStore.addNewEmployee,
    updateEmployee: dataStore.updateEmployee,
    deleteEmployee: dataStore.deleteEmployee,
    addNewJobPosition: dataStore.addNewJobPosition,
    addJobPosition: dataStore.addNewJobPosition,
    updateJobPosition: dataStore.updateJobPosition,
    deleteJobPosition: dataStore.deleteJobPosition,
    addCriticalPosition: dataStore.addCriticalPosition,
    deleteCriticalPosition: dataStore.deleteCriticalPosition,
    nominateSuccessor: dataStore.nominateSuccessor,
    removeSuccessor: dataStore.removeSuccessor,

    // Bulk Imports
    importEmployees: dataStore.importEmployees,
    importTrainingModules: dataStore.importTrainingModules,
    importTrainingMatrix: dataStore.importTrainingMatrix,
    importTnaRules: dataStore.importTnaRules,
    importNineBoxCalibrations: dataStore.importNineBoxCalibrations,
    importMppPlans: dataStore.importMppPlans,
    importCriticalPositions: dataStore.importCriticalPositions,
    importJobPositions: dataStore.importJobPositions,
    restoreFullDatabaseBackup: dataStore.restoreFullDatabaseBackup,

    // Selectors
    getRuleFor: dataStore.getRuleFor,
    checkQualification: dataStore.checkQualification,
    getDirectReportsFor: dataStore.getDirectReportsFor,
    getNineBoxBox: dataStore.getNineBoxBox,
    getPositionsByDepartment: dataStore.getPositionsByDepartment,
    getFilledCountForPosition: dataStore.getFilledCountForPosition,
    stats,
    executiveHealth,

    // Toasts
    toasts: toastStore.toasts,
    addToast: toastStore.addToast,
    removeToast: toastStore.removeToast
  };

  return (
    <WorkforceContext.Provider value={value}>
      {children}
    </WorkforceContext.Provider>
  );
};

// Unified Backwards-Compatible Hook
export const useWorkforce = () => {
  const context = useContext(WorkforceContext);
  if (!context) {
    throw new Error('useWorkforce must be used within a WorkforceProvider');
  }
  return context;
};

// Sliced Granular Hooks for Maximum Performance Optimization
export { useToastStore, useUIStore, useFilterStore, useWorkforceDataStore };
