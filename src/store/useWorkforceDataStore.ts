import { create } from 'zustand';
import { 
  Employee, 
  TrainingModule, 
  TNARule, 
  CriticalPosition, 
  ManpowerDeptPlan, 
  JobPosition,
  Department, 
  JobLevel, 
  TrainingStatusType, 
  NineBoxInfo,
  EducationLevel,
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
  ProficiencyLevel,
  DetailedIDP,
  CareerNode,
  MPPScenario,
  AgenticActionItem,
  SystemNotification
} from '../types';
import { 
  DEPARTMENTS, 
  JOB_LEVELS, 
  EDUCATION_LEVELS,
  INITIAL_EMPLOYEES, 
  INITIAL_TRAINING_MODULES, 
  INITIAL_TNA_RULES, 
  CRITICAL_POSITIONS, 
  INITIAL_MPP_DATA,
  INITIAL_JOB_POSITIONS,
  NINE_BOX_DEFINITIONS,
  INITIAL_COMPETENCIES,
  INITIAL_WORKFORCE_MOVEMENTS,
  INITIAL_POSITION_COMPETENCIES,
  INITIAL_ANNUAL_TRAINING_PLANS,
  INITIAL_TRAINERS,
  INITIAL_TRAINING_EVENTS,
  INITIAL_TRAINING_REMINDERS,
  INITIAL_DETAILED_IDPS,
  INITIAL_CAREER_NODES,
  INITIAL_MPP_SCENARIOS,
  INITIAL_AGENTIC_ACTIONS,
  INITIAL_NOTIFICATIONS,
  computeNineBoxGrid
} from '../data/mockData';
import {
  initializeDatabase,
  fetchEmployees,
  saveEmployeeToDb,
  deleteEmployeeFromDb,
  fetchTrainingModules,
  saveTrainingModuleToDb,
  deleteTrainingModuleFromDb,
  fetchTnaRules,
  saveTnaRuleToDb,
  fetchCriticalPositions,
  saveCriticalPositionToDb,
  deleteCriticalPositionFromDb,
  fetchMppPlans,
  saveMppPlanToDb,
  fetchJobPositions,
  saveJobPositionToDb,
  deleteJobPositionFromDb,
  fetchCompetencies,
  saveCompetencyToDb,
  deleteCompetencyFromDb,
  fetchWorkforceMovements,
  saveWorkforceMovementToDb,
  fetchTrainingEvents,
  saveTrainingEventToDb,
  fetchDetailedIdps,
  saveDetailedIdpToDb,
  fetchCareerNodes,
  saveCareerNodeToDb,
  logActivityToDb,
  bulkSaveEmployeesToDb,
  bulkSaveTrainingModulesToDb,
  bulkSaveTnaRulesToDb,
  bulkSaveCriticalPositionsToDb,
  bulkSaveMppPlansToDb,
  bulkSaveJobPositionsToDb,
  resetAndReseedDatabase
} from '../services/db';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

const checkDemoQuota = (count: number, entityName: string): boolean => {
  const auth = useAuthStore.getState();
  if (auth.accountType === 'demo' && count >= 5) {
    useToastStore.getState().addToast(
      '🔒 Batas Kuota Akun Demo',
      `Akun demo dibatasi maksimal 5 data ${entityName}. Silakan aktivasi lisensi resmi untuk akses tak terbatas.`,
      'error'
    );
    return false;
  }
  return true;
};

export interface WorkforceOverallStats {
  totalEmployees: number;
  totalModules: number;
  complianceRate: number;
  criticalVacanciesCount: number;
  contractsExpiringCount: number;
  retiringCount: number;
  noSuccessorCount: number;
  overSpannedManagersCount: number;
  totalGapCount: number;
}

interface WorkforceDataState {
  // Domain 02: Core Workforce
  employees: Employee[];
  jobPositions: JobPosition[];
  criticalPositions: CriticalPosition[];
  workforceMovements: WorkforceMovement[];

  // Domain 03: Competency & TNA
  competencies: CompetencyItem[];
  positionCompetencies: PositionCompetencyRequirement[];
  employeeAssessments: EmployeeCompetencyAssessment[];
  tnaRules: Record<string, TNARule>;

  // Domain 04: Learning & Training
  trainingModules: TrainingModule[];
  annualTrainingPlans: AnnualTrainingPlanItem[];
  trainers: Trainer[];
  trainingEvents: TrainingEvent[];
  trainingReminders: TrainingReminder[];

  // Domain 07: Workforce Planning
  mppData: ManpowerDeptPlan[];

  dbMode: 'sqlite' | 'localStorage';
  isDbReady: boolean;

  // Lifecycle
  initStore: () => Promise<void>;
  reseedDatabase: () => Promise<void>;

  // Employee CRUD
  addNewEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  // Workforce Movement
  addWorkforceMovement: (mov: Omit<WorkforceMovement, 'id'>) => void;
  updateWorkforceMovement: (mov: WorkforceMovement) => void;
  deleteWorkforceMovement: (id: string) => void;

  // Competency Framework Actions
  addCompetency: (item: Omit<CompetencyItem, 'id'>) => void;
  updateCompetency: (item: CompetencyItem) => void;
  deleteCompetency: (id: string) => void;
  savePositionCompetencyRequirement: (req: Omit<PositionCompetencyRequirement, 'id'>) => void;
  deletePositionCompetencyRequirement: (id: string) => void;
  recordEmployeeAssessment: (assessment: Omit<EmployeeCompetencyAssessment, 'id'>) => void;

  // Training Module CRUD
  addNewTrainingModule: (mod: Omit<TrainingModule, 'id'>) => void;
  updateTrainingModule: (mod: TrainingModule) => void;
  deleteTrainingModule: (id: string) => void;

  // Annual Training Plan & Events Actions
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

  // Closed-Loop Cross-Domain Automation
  enrollEmployeeToBatch: (eventId: string, employeeId: string) => void;
  completeAttendeeTraining: (eventId: string, employeeId: string, result: { status: 'Passed' | 'Failed'; postTestScore: number; certNo?: string }) => void;
  closeGapWithTrainingDirect: (employeeId: string, competencyId: string, moduleId?: string) => void;

  // Domain 06: IDP & Career Architecture
  detailedIdps: DetailedIDP[];
  careerNodes: CareerNode[];
  updateIDPTaskStatus: (idpId: string, category: 'experience70' | 'exposure20' | 'education10', taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  createOrUpdateIDP: (idp: DetailedIDP) => void;
  addCareerNode: (node: CareerNode) => void;
  updateCareerNode: (node: CareerNode) => void;
  deleteCareerNode: (nodeId: string) => void;
  reorderCareerNodes: (trackId: string, orderedNodes: CareerNode[]) => void;

  // Domain 07: MPP Scenarios
  mppScenarios: MPPScenario[];
  addMppScenario: (scenario: MPPScenario) => void;

  // Domain 08: Agentic Action Engine & Notifications
  agenticActions: AgenticActionItem[];
  notifications: SystemNotification[];
  executeAgenticAction: (actionId: string) => void;
  addAgenticAction: (action: Omit<AgenticActionItem, 'id' | 'status'>) => void;
  deleteAgenticAction: (id: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Job Position / Level Management CRUD
  addNewJobPosition: (pos: Omit<JobPosition, 'id'> | JobPosition) => void;
  updateJobPosition: (pos: JobPosition) => void;
  deleteJobPosition: (id: string) => void;

  // Matrix & Rules
  updateEmployeeTraining: (empId: string, moduleId: string, status: TrainingStatusType, score?: number, certNo?: string) => void;
  updateTnaRule: (keyOrRule: string | TNARule, ruleMaybe?: TNARule) => void;

  // MPP & Succession
  updateMppPlan: (dept: Department, updated: Partial<ManpowerDeptPlan>) => void;
  addCriticalPosition: (pos: Omit<CriticalPosition, 'id' | 'successors'>) => void;
  deleteCriticalPosition: (id: string) => void;
  nominateSuccessor: (criticalPosId: string, candidateEmpId: string, readiness?: 'Ready Now' | 'Ready in 1 Year' | 'Ready in 2-3 Years') => void;
  removeSuccessor: (criticalPosId: string, candidateEmpId: string) => void;

  // Bulk Imports
  importEmployees: (imported: Employee[], mode?: 'merge' | 'replace') => Promise<number>;
  importTrainingModules: (imported: TrainingModule[], mode?: 'merge' | 'replace') => Promise<number>;
  importTrainingMatrix: (records: { nip: string; moduleCodeOrId: string; status: TrainingStatusType; score?: number; certNo?: string; completedDate?: string }[]) => Promise<number>;
  importTnaRules: (rules: Record<string, TNARule>, mode?: 'merge' | 'replace') => Promise<number>;
  importNineBoxCalibrations: (calibrations: { nip: string; perf: 'Low' | 'Medium' | 'High'; pot: 'Low' | 'Medium' | 'High'; isKeyTalent?: boolean; isSuccessorReady?: boolean }[]) => Promise<number>;
  importMppPlans: (plans: ManpowerDeptPlan[], mode?: 'merge' | 'replace') => Promise<number>;
  importCriticalPositions: (positions: CriticalPosition[], mode?: 'merge' | 'replace') => Promise<number>;
  importJobPositions: (positions: JobPosition[], mode?: 'merge' | 'replace') => Promise<number>;
  restoreFullDatabaseBackup: (backupData: any, mode?: 'merge' | 'replace') => Promise<void>;

  // Selectors & Computed Queries
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
  getNineBoxBox: (boxOrEmp: number | Employee) => NineBoxInfo;
  getOverallStats: () => WorkforceOverallStats;
  getExecutiveHealthSummary: () => ExecutiveHealthSummary;
  getCompetencyGaps: (filterDept?: string) => CompetencyGapItem[];
  getPositionsByDepartment: (dept: Department | 'All') => JobPosition[];
  getFilledCountForPosition: (posTitle: string, dept: Department) => number;
}

const loadStorage = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(`workforce_os_v2_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(`workforce_os_v2_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};

export const useWorkforceDataStore = create<WorkforceDataState>((set, get) => ({
  employees: INITIAL_EMPLOYEES,
  jobPositions: INITIAL_JOB_POSITIONS,
  criticalPositions: CRITICAL_POSITIONS,
  workforceMovements: loadStorage('movements', INITIAL_WORKFORCE_MOVEMENTS),

  competencies: loadStorage('competencies', INITIAL_COMPETENCIES),
  positionCompetencies: loadStorage('pos_competencies', INITIAL_POSITION_COMPETENCIES),
  employeeAssessments: loadStorage('assessments', []),
  tnaRules: INITIAL_TNA_RULES,

  trainingModules: INITIAL_TRAINING_MODULES,
  annualTrainingPlans: loadStorage('atp', INITIAL_ANNUAL_TRAINING_PLANS),
  trainers: loadStorage('trainers', INITIAL_TRAINERS),
  trainingEvents: loadStorage('events', INITIAL_TRAINING_EVENTS),
  trainingReminders: loadStorage('reminders', INITIAL_TRAINING_REMINDERS),

  mppData: INITIAL_MPP_DATA,
  detailedIdps: loadStorage('detailed_idps', INITIAL_DETAILED_IDPS),
  careerNodes: loadStorage('career_nodes', INITIAL_CAREER_NODES),
  mppScenarios: loadStorage('mpp_scenarios', INITIAL_MPP_SCENARIOS),
  agenticActions: loadStorage('agentic_actions', INITIAL_AGENTIC_ACTIONS),
  notifications: loadStorage('notifications', INITIAL_NOTIFICATIONS),
  dbMode: 'localStorage',
  isDbReady: false,

  initStore: async () => {
    try {
      const { mode, isSeeded } = await initializeDatabase();
      set({ dbMode: mode });

      const [
        loadedEmployees,
        loadedModules,
        loadedRules,
        loadedPositions,
        loadedMpp,
        loadedJobPositions,
        loadedCompetencies,
        loadedMovements,
        loadedEvents,
        loadedIdps,
        loadedCareerNodes
      ] = await Promise.all([
        fetchEmployees(),
        fetchTrainingModules(),
        fetchTnaRules(),
        fetchCriticalPositions(),
        fetchMppPlans(),
        fetchJobPositions(),
        fetchCompetencies(),
        fetchWorkforceMovements(),
        fetchTrainingEvents(),
        fetchDetailedIdps(),
        fetchCareerNodes()
      ]);

      set({
        employees: loadedEmployees,
        trainingModules: loadedModules,
        tnaRules: loadedRules,
        criticalPositions: loadedPositions,
        mppData: loadedMpp,
        jobPositions: loadedJobPositions.length > 0 ? loadedJobPositions : INITIAL_JOB_POSITIONS,
        competencies: loadedCompetencies.length > 0 ? loadedCompetencies : INITIAL_COMPETENCIES,
        workforceMovements: loadedMovements.length > 0 ? loadedMovements : INITIAL_WORKFORCE_MOVEMENTS,
        trainingEvents: loadedEvents.length > 0 ? loadedEvents : INITIAL_TRAINING_EVENTS,
        detailedIdps: loadedIdps.length > 0 ? loadedIdps : INITIAL_DETAILED_IDPS,
        careerNodes: loadedCareerNodes.length > 0 ? loadedCareerNodes : INITIAL_CAREER_NODES,
        isDbReady: true
      });

      if (isSeeded && mode === 'sqlite') {
        useToastStore.getState().addToast(
          'Database Siap',
          'Sistem terhubung ke SQLite lokal (workforce_os.db) dengan data awal terverifikasi.',
          'success'
        );
      }
    } catch (err) {
      console.error('[WorkforceDataStore] Init error:', err);
      set({ isDbReady: true });
    }
  },

  reseedDatabase: async () => {
    try {
      await resetAndReseedDatabase();
      const [
        loadedEmployees,
        loadedModules,
        loadedRules,
        loadedPositions,
        loadedMpp,
        loadedJobPositions,
        loadedCompetencies,
        loadedMovements,
        loadedEvents,
        loadedIdps,
        loadedCareerNodes
      ] = await Promise.all([
        fetchEmployees(),
        fetchTrainingModules(),
        fetchTnaRules(),
        fetchCriticalPositions(),
        fetchMppPlans(),
        fetchJobPositions(),
        fetchCompetencies(),
        fetchWorkforceMovements(),
        fetchTrainingEvents(),
        fetchDetailedIdps(),
        fetchCareerNodes()
      ]);
      set({
        employees: loadedEmployees,
        trainingModules: loadedModules,
        tnaRules: loadedRules,
        criticalPositions: loadedPositions,
        mppData: loadedMpp,
        jobPositions: loadedJobPositions,
        competencies: loadedCompetencies,
        positionCompetencies: INITIAL_POSITION_COMPETENCIES,
        workforceMovements: loadedMovements,
        annualTrainingPlans: INITIAL_ANNUAL_TRAINING_PLANS,
        trainers: INITIAL_TRAINERS,
        trainingEvents: loadedEvents,
        detailedIdps: loadedIdps,
        careerNodes: loadedCareerNodes
      });
      useToastStore.getState().addToast('Database Direset', 'Semua data telah dikembalikan ke kondisi Seeder awal.', 'info');
    } catch (err) {
      console.error('[WorkforceDataStore] Reseed error:', err);
      useToastStore.getState().addToast('Gagal Reset', 'Terjadi kesalahan saat mereset database.', 'error');
    }
  },

  // -------------------------------------------------------------
  // EMPLOYEES & WORKFORCE MOVEMENTS
  // -------------------------------------------------------------
  addNewEmployee: (empData) => {
    if (!checkDemoQuota(get().employees.length, 'karyawan')) return;
    const employees = get().employees;
    const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const autoNineBox = computeNineBoxGrid(empData.performanceRating, empData.potentialRating);
    const newEmployee: Employee = {
      ...empData,
      id: newId,
      nineBoxGrid: autoNineBox,
      isKeyTalent: autoNineBox >= 8
    };

    set({ employees: [newEmployee, ...employees] });
    saveEmployeeToDb(newEmployee).catch(console.error);
    useToastStore.getState().addToast('Karyawan Baru Terdaftar', `${newEmployee.name} (${newEmployee.nip}) berhasil disimpan ke database.`, 'success');
  },

  updateEmployee: (updatedEmp) => {
    const autoNineBox = computeNineBoxGrid(updatedEmp.performanceRating, updatedEmp.potentialRating);
    const modifiedEmp: Employee = {
      ...updatedEmp,
      nineBoxGrid: autoNineBox,
      isKeyTalent: autoNineBox >= 8
    };

    set((state) => ({
      employees: state.employees.map((e) => (e.id === modifiedEmp.id ? modifiedEmp : e))
    }));
    saveEmployeeToDb(modifiedEmp).catch(console.error);
    useToastStore.getState().addToast('Data Karyawan Diperbarui', `Profil ${modifiedEmp.name} berhasil disimpan ke database.`, 'success');
  },

  deleteEmployee: (empId) => {
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== empId)
    }));
    deleteEmployeeFromDb(empId).catch(console.error);
    useToastStore.getState().addToast('Karyawan Dihapus', 'Data karyawan telah dikeluarkan dari database.', 'info');
  },

  addWorkforceMovement: (movData) => {
    if (!checkDemoQuota(get().workforceMovements.length, 'pergerakan karyawan')) return;
    const newMovement: WorkforceMovement = {
      ...movData,
      id: `MOV-${Date.now()}`
    };

    // Closed-Loop Automation: If status is Executed, automatically synchronize Employee Profile, Job Positions, Succession & Career History!
    if (movData.status === 'Executed') {
      const { employees, jobPositions, criticalPositions } = get();
      const targetEmp = employees.find((e) => e.id === movData.employeeId);
      if (targetEmp) {
        const updatedEmp: Employee = {
          ...targetEmp,
          jobTitle: movData.toPosition,
          department: movData.toDepartment,
          grade: movData.toGrade || targetEmp.grade,
          movements: [newMovement, ...(targetEmp.movements || [])]
        };

        // Update Job Positions Headcounts
        const updatedPositions = jobPositions.map((p) => {
          if (p.title.toLowerCase() === movData.fromPosition.toLowerCase()) {
            const newCount = Math.max(0, (p.currentFilledCount || 1) - 1);
            saveJobPositionToDb({ ...p, currentFilledCount: newCount }).catch(console.error);
            return { ...p, currentFilledCount: newCount };
          }
          if (p.title.toLowerCase() === movData.toPosition.toLowerCase()) {
            const newCount = (p.currentFilledCount || 0) + 1;
            saveJobPositionToDb({ ...p, currentFilledCount: newCount }).catch(console.error);
            return { ...p, currentFilledCount: newCount };
          }
          return p;
        });

        // Update Critical Position Holder if promoting to critical role
        const updatedCriticalPos = criticalPositions.map((cp) => {
          if (cp.title.toLowerCase() === movData.toPosition.toLowerCase()) {
            const updatedCP = {
              ...cp,
              currentHolder: targetEmp.name,
              currentHolderId: targetEmp.id,
              successors: cp.successors.filter((s) => s.employeeId !== targetEmp.id)
            };
            saveCriticalPositionToDb(updatedCP).catch(console.error);
            return updatedCP;
          }
          return cp;
        });

        set((state) => ({
          workforceMovements: [newMovement, ...state.workforceMovements],
          employees: state.employees.map((e) => (e.id === targetEmp.id ? updatedEmp : e)),
          jobPositions: updatedPositions,
          criticalPositions: updatedCriticalPos
        }));

        saveEmployeeToDb(updatedEmp).catch(console.error);
        saveWorkforceMovementToDb(newMovement).catch(console.error);
        logActivityToDb('Mutasi/Promosi', 'Executed', `Pengangkatan ${targetEmp.name} ke ${movData.toPosition} berhasil disahkan.`, 'Direksi').catch(console.error);

        useToastStore.getState().addToast(
          '⚡ [Closed-Loop] Pergerakan Disahkan',
          `Promosi/Mutasi ${targetEmp.name} ke ${movData.toPosition} telah meng-update profil, posisi jabatan, dan struktur suksesi!`,
          'success'
        );
        return;
      }
    }

    set((state) => ({
      workforceMovements: [newMovement, ...state.workforceMovements]
    }));
    saveWorkforceMovementToDb(newMovement).catch(console.error);
    useToastStore.getState().addToast(
      'Pergerakan Karyawan Dicatat',
      `${newMovement.type} untuk ${newMovement.employeeName} berhasil disimpan.`,
      'success'
    );
  },

  updateWorkforceMovement: (mov) => {
    set((state) => ({
      workforceMovements: state.workforceMovements.map((m) => (m.id === mov.id ? mov : m))
    }));
    saveWorkforceMovementToDb(mov).catch(console.error);
    useToastStore.getState().addToast('Pergerakan Diperbarui', `Catatan pergerakan ${mov.employeeName} berhasil diperbarui.`, 'info');
  },

  deleteWorkforceMovement: (id) => {
    set((state) => ({
      workforceMovements: state.workforceMovements.filter((m) => m.id !== id)
    }));
    useToastStore.getState().addToast('Pergerakan Dihapus', 'Catatan pergerakan berhasil dihapus dari sistem.', 'info');
  },

  // -------------------------------------------------------------
  // COMPETENCY FRAMEWORK
  // -------------------------------------------------------------
  addCompetency: (item) => {
    if (!checkDemoQuota(get().competencies.length, 'kompetensi')) return;
    const newComp: CompetencyItem = {
      ...item,
      id: `CMP-${Date.now()}`
    };
    set((state) => ({ competencies: [...state.competencies, newComp] }));
    saveCompetencyToDb(newComp).catch(console.error);
    useToastStore.getState().addToast('Kompetensi Baru', `${newComp.name} (${newComp.code}) ditambahkan.`, 'success');
  },

  updateCompetency: (comp) => {
    set((state) => ({
      competencies: state.competencies.map((c) => (c.id === comp.id ? comp : c))
    }));
    saveCompetencyToDb(comp).catch(console.error);
    useToastStore.getState().addToast('Kompetensi Diperbarui', `Perubahan pada ${comp.name} disimpan.`, 'info');
  },

  deleteCompetency: (id) => {
    set((state) => ({
      competencies: state.competencies.filter((c) => c.id !== id)
    }));
    deleteCompetencyFromDb(id).catch(console.error);
    useToastStore.getState().addToast('Kompetensi Dihapus', 'Kompetensi telah dihapus dari framework.', 'info');
  },

  savePositionCompetencyRequirement: (req) => {
    const existing = get().positionCompetencies;
    const exists = existing.find((p) => p.positionId === req.positionId);
    let updatedList: PositionCompetencyRequirement[];

    if (exists) {
      const updatedReq: PositionCompetencyRequirement = { ...req, id: exists.id };
      updatedList = existing.map((p) => (p.positionId === req.positionId ? updatedReq : p));
    } else {
      const newReq: PositionCompetencyRequirement = { ...req, id: `PCR-${Date.now()}` };
      updatedList = [...existing, newReq];
    }

    set({ positionCompetencies: updatedList });
    useToastStore.getState().addToast('Standar Kompetensi Disimpan', `Kualifikasi kompetensi untuk posisi ${req.positionTitle} berhasil disimpan.`, 'success');
  },

  deletePositionCompetencyRequirement: (id) => {
    set((state) => ({
      positionCompetencies: state.positionCompetencies.filter((p) => p.id !== id)
    }));
  },

  recordEmployeeAssessment: (assessment) => {
    const newAssessment: EmployeeCompetencyAssessment = {
      ...assessment,
      id: `ASS-${Date.now()}`
    };
    set((state) => ({
      employeeAssessments: [newAssessment, ...state.employeeAssessments.filter(a => a.employeeId !== assessment.employeeId || a.competencyId !== assessment.competencyId)],
      employees: state.employees.map((emp) => {
        if (emp.id === assessment.employeeId) {
          const updatedEmp = {
            ...emp,
            competencyScores: {
              ...(emp.competencyScores || {}),
              [assessment.competencyId]: assessment.currentLevel
            }
          };
          saveEmployeeToDb(updatedEmp).catch(console.error);
          return updatedEmp;
        }
        return emp;
      })
    }));
    useToastStore.getState().addToast('Asesmen Kompetensi Disimpan', `Skor level ${assessment.currentLevel} untuk ${assessment.employeeName} berhasil dicatat.`, 'success');
  },

  // -------------------------------------------------------------
  // ANNUAL TRAINING PLAN, EVENTS & TRAINERS
  // -------------------------------------------------------------
  addAnnualTrainingPlan: (plan) => {
    if (!checkDemoQuota(get().annualTrainingPlans.length, 'rencana pelatihan tahunan')) return;
    const newPlan: AnnualTrainingPlanItem = {
      ...plan,
      id: `ATP-${Date.now()}`
    };
    set((state) => ({ annualTrainingPlans: [...state.annualTrainingPlans, newPlan] }));
    useToastStore.getState().addToast('Rencana Pelatihan Dibuat', `${newPlan.moduleName} (${newPlan.plannedMonth}) berhasil ditambahkan ke ATP.`, 'success');
  },

  updateAnnualTrainingPlan: (plan) => {
    set((state) => ({
      annualTrainingPlans: state.annualTrainingPlans.map((p) => (p.id === plan.id ? plan : p))
    }));
    useToastStore.getState().addToast('Rencana Pelatihan Diperbarui', `Status ${plan.moduleName} diubah menjadi ${plan.status}.`, 'success');
  },

  deleteAnnualTrainingPlan: (id) => {
    set((state) => ({
      annualTrainingPlans: state.annualTrainingPlans.filter((p) => p.id !== id)
    }));
    useToastStore.getState().addToast('Rencana Pelatihan Dihapus', 'Item rencana tahunan telah dihapus.', 'info');
  },

  addTrainingEvent: (evt) => {
    if (!checkDemoQuota(get().trainingEvents.length, 'event pelatihan')) return;
    const newEvt: TrainingEvent = {
      ...evt,
      id: `EVT-${Date.now()}`
    };
    set((state) => ({ trainingEvents: [...state.trainingEvents, newEvt] }));
    useToastStore.getState().addToast('Batch Pelatihan Dijadwalkan', `${newEvt.eventName} berhasil dibuat.`, 'success');
  },

  updateTrainingEvent: (evt) => {
    set((state) => ({
      trainingEvents: state.trainingEvents.map((e) => (e.id === evt.id ? evt : e))
    }));
    useToastStore.getState().addToast('Batch Pelatihan Diperbarui', `Perubahan jadwal/peserta ${evt.eventName} disimpan.`, 'success');
  },

  deleteTrainingEvent: (id) => {
    set((state) => ({
      trainingEvents: state.trainingEvents.filter((e) => e.id !== id)
    }));
  },

  addTrainer: (trainer) => {
    const newTrainer: Trainer = {
      ...trainer,
      id: `TRN-${Date.now()}`
    };
    set((state) => ({ trainers: [...state.trainers, newTrainer] }));
    useToastStore.getState().addToast('Instruktur Terdaftar', `${newTrainer.name} berhasil ditambahkan ke database trainer.`, 'success');
  },

  updateTrainer: (trainer) => {
    set((state) => ({
      trainers: state.trainers.map((t) => (t.id === trainer.id ? trainer : t))
    }));
  },

  deleteTrainer: (id) => {
    set((state) => ({
      trainers: state.trainers.filter((t) => t.id !== id)
    }));
  },

  // -------------------------------------------------------------
  // TRAINING REMINDERS
  // -------------------------------------------------------------
  addTrainingReminder: (rem) => {
    const newRem: TrainingReminder = {
      ...rem,
      id: `REM-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    set((state) => ({
      trainingReminders: [newRem, ...state.trainingReminders]
    }));
    useToastStore.getState().addToast('Reminder Ditambahkan', `Reminder "${newRem.title}" berhasil dijadwalkan.`, 'success');
  },

  updateTrainingReminder: (rem) => {
    set((state) => ({
      trainingReminders: state.trainingReminders.map((r) => (r.id === rem.id ? rem : r))
    }));
    useToastStore.getState().addToast('Reminder Diperbarui', 'Perubahan reminder disimpan.', 'success');
  },

  deleteTrainingReminder: (id) => {
    set((state) => ({
      trainingReminders: state.trainingReminders.filter((r) => r.id !== id)
    }));
    useToastStore.getState().addToast('Reminder Dihapus', 'Reminder telah dibersihkan.', 'info');
  },

  toggleTrainingReminder: (id) => {
    set((state) => ({
      trainingReminders: state.trainingReminders.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      )
    }));
  },

  // -------------------------------------------------------------
  // CLOSED-LOOP CROSS-DOMAIN AUTOMATION
  // -------------------------------------------------------------
  enrollEmployeeToBatch: (eventId, employeeId) => {
    const { trainingEvents, employees } = get();
    const event = trainingEvents.find((e) => e.id === eventId);
    const emp = employees.find((e) => e.id === employeeId);
    if (!event || !emp) return;

    if (event.participantIds.includes(employeeId)) {
      useToastStore.getState().addToast('Sudah Terdaftar', `${emp.name} sudah terdaftar di batch ini.`, 'info');
      return;
    }

    const updatedEvent: TrainingEvent = {
      ...event,
      participantIds: [...event.participantIds, employeeId],
      attendees: [
        ...(event.attendees || []),
        {
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          status: 'Registered',
          preTestScore: 65
        }
      ]
    };

    set((state) => ({
      trainingEvents: state.trainingEvents.map((e) => (e.id === eventId ? updatedEvent : e))
    }));

    useToastStore.getState().addToast(
      '⚡ [Closed-Loop] Pendaftaran Berhasil',
      `${emp.name} berhasil didaftarkan ke ${event.eventName} (${event.batchCode}).`,
      'success'
    );
  },

  completeAttendeeTraining: (eventId, employeeId, result) => {
    const { trainingEvents, employees, trainingModules, competencies } = get();
    const event = trainingEvents.find((e) => e.id === eventId);
    const emp = employees.find((e) => e.id === employeeId);
    if (!event || !emp) return;

    const certNumber = result.certNo || `CERT/${event.batchCode}/${String(Math.floor(Math.random() * 900 + 100))}`;
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0];

    // 1. Update event attendee record
    const updatedAttendees = (event.attendees || []).map((att) => {
      if (att.employeeId === employeeId) {
        return {
          ...att,
          status: result.status,
          postTestScore: result.postTestScore,
          certificateNo: result.status === 'Passed' ? certNumber : undefined,
          certValidUntil: result.status === 'Passed' ? validUntil : undefined
        };
      }
      return att;
    });

    const updatedEvent: TrainingEvent = {
      ...event,
      attendees: updatedAttendees
    };

    // 2. Closed-Loop: Update Employee Training Record & Competency Scores
    if (result.status === 'Passed') {
      const updatedTrainings = {
        ...emp.trainings,
        [event.moduleId]: {
          status: 'done' as TrainingStatusType,
          score: result.postTestScore,
          certificateNo: certNumber,
          completedDate: today,
          validUntil: validUntil
        }
      };

      // Match Competency
      const moduleObj = trainingModules.find((m) => m.id === event.moduleId);
      const updatedScores = { ...(emp.competencyScores || {}) };

      // Auto-upgrade competency level to Level 4 if passed
      competencies.forEach((comp) => {
        const isRelated = 
          comp.id === moduleObj?.mappedCompetencyId || 
          Object.values(comp.levels).some((lvl) => lvl.recommendedTrainingIds?.includes(event.moduleId));
        if (isRelated) {
          updatedScores[comp.id] = 4; // Upgraded to Advanced Level 4
        }
      });

      const updatedEmp: Employee = {
        ...emp,
        trainings: updatedTrainings,
        competencyScores: updatedScores,
        radar: {
          ...emp.radar,
          performance: Math.min(98, emp.radar.performance + 3),
          technical: Math.min(98, emp.radar.technical + 5)
        }
      };

      set((state) => ({
        trainingEvents: state.trainingEvents.map((e) => (e.id === eventId ? updatedEvent : e)),
        employees: state.employees.map((e) => (e.id === employeeId ? updatedEmp : e))
      }));

      saveEmployeeToDb(updatedEmp).catch(console.error);

      useToastStore.getState().addToast(
        '⚡ [Closed-Loop] Kelulusan Diverifikasi',
        `Sertifikat ${certNumber} diterbitkan untuk ${emp.name}. Gap kompetensi otomatis ditutup & Profil 360 diperbarui!`,
        'success'
      );
    } else {
      set((state) => ({
        trainingEvents: state.trainingEvents.map((e) => (e.id === eventId ? updatedEvent : e))
      }));
      useToastStore.getState().addToast('Hasil Pelatihan Disimpan', `${emp.name} tercatat ${result.status} (Skor: ${result.postTestScore}).`, 'info');
    }
  },

  closeGapWithTrainingDirect: (employeeId, competencyId, moduleId) => {
    const { employees, competencies } = get();
    const emp = employees.find((e) => e.id === employeeId);
    const comp = competencies.find((c) => c.id === competencyId);
    if (!emp || !comp) return;

    const modId = moduleId || comp.levels[4]?.recommendedTrainingIds?.[0] || 'T02';
    const certNumber = `CERT/TNA/${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0];

    const updatedTrainings = {
      ...emp.trainings,
      [modId]: {
        status: 'done' as TrainingStatusType,
        score: 92,
        certificateNo: certNumber,
        completedDate: today,
        validUntil: validUntil
      }
    };

    const updatedScores = {
      ...(emp.competencyScores || {}),
      [competencyId]: 4 as ProficiencyLevel
    };

    const updatedEmp: Employee = {
      ...emp,
      trainings: updatedTrainings,
      competencyScores: updatedScores,
      radar: {
        ...emp.radar,
        technical: Math.min(95, emp.radar.technical + 5),
        performance: Math.min(95, emp.radar.performance + 3)
      }
    };

    set((state) => ({
      employees: state.employees.map((e) => (e.id === employeeId ? updatedEmp : e))
    }));

    saveEmployeeToDb(updatedEmp).catch(console.error);

    useToastStore.getState().addToast(
      '⚡ [Closed-Loop] Gap Berhasil Ditutup',
      `Kompetensi "${comp.name}" untuk ${emp.name} ditingkatkan ke Level 4. Sertifikat ${certNumber} dicatat.`,
      'success'
    );
  },

  // -------------------------------------------------------------
  // DOMAIN 06: IDP & CAREER ARCHITECTURE
  // -------------------------------------------------------------
  updateIDPTaskStatus: (idpId, category, taskId, newStatus) => {
    set((state) => {
      const nextIdps = state.detailedIdps.map((idp) => {
        if (idp.id === idpId) {
          const updatedCategory = idp[category].map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          );
          const totalTasks =
            (category === 'experience70' ? updatedCategory : idp.experience70).length +
            (category === 'exposure20' ? updatedCategory : idp.exposure20).length +
            (category === 'education10' ? updatedCategory : idp.education10).length;
          const completedTasks =
            (category === 'experience70' ? updatedCategory : idp.experience70).filter((t) => t.status === 'Completed').length +
            (category === 'exposure20' ? updatedCategory : idp.exposure20).filter((t) => t.status === 'Completed').length +
            (category === 'education10' ? updatedCategory : idp.education10).filter((t) => t.status === 'Completed').length;
          const newCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const updated = {
            ...idp,
            [category]: updatedCategory,
            completionPercentage: newCompletion,
            targetReadiness: Math.min(95, Math.round(70 + (newCompletion * 0.2)))
          };
          return updated;
        }
        return idp;
      });
      saveStorage('detailed_idps', nextIdps);
      return { detailedIdps: nextIdps };
    });
    useToastStore.getState().addToast('IDP Progres Diperbarui', `Status tugas IDP diubah menjadi ${newStatus}.`, 'success');
  },

  createOrUpdateIDP: (idp) => {
    const isNew = !get().detailedIdps.some((i) => i.id === idp.id);
    if (isNew && !checkDemoQuota(get().detailedIdps.length, 'program IDP')) return;
    set((state) => {
      const nextIdps = [idp, ...state.detailedIdps.filter((i) => i.id !== idp.id)];
      saveStorage('detailed_idps', nextIdps);
      return { detailedIdps: nextIdps };
    });
    useToastStore.getState().addToast('IDP Disimpan', `Rencana pengembangan individu untuk ${idp.employeeName} berhasil disimpan.`, 'success');
  },

  addCareerNode: (node) => {
    if (!checkDemoQuota(get().careerNodes.length, 'posisi tangga karier')) return;
    set((state) => {
      const nextNodes = [...state.careerNodes, node];
      saveStorage('career_nodes', nextNodes);
      return { careerNodes: nextNodes };
    });
    useToastStore.getState().addToast('Posisi Tangga Karier Ditambahkan', `Posisi "${node.title}" berhasil ditambahkan ke tangga karier.`, 'success');
  },

  updateCareerNode: (node) => {
    set((state) => {
      const nextNodes = state.careerNodes.map((n) => (n.id === node.id ? node : n));
      saveStorage('career_nodes', nextNodes);
      return { careerNodes: nextNodes };
    });
    useToastStore.getState().addToast('Kualifikasi Diperbarui', `Detail kualifikasi posisi "${node.title}" berhasil disimpan.`, 'success');
  },

  deleteCareerNode: (nodeId) => {
    set((state) => {
      const nextNodes = state.careerNodes.filter((n) => n.id !== nodeId);
      saveStorage('career_nodes', nextNodes);
      return { careerNodes: nextNodes };
    });
    useToastStore.getState().addToast('Posisi Dihapus', 'Posisi berhasil dihapus dari tangga karier.', 'info');
  },

  reorderCareerNodes: (trackId, orderedNodes) => {
    set((state) => {
      const otherNodes = state.careerNodes.filter((n) => n.trackId !== trackId);
      const updatedNodes = orderedNodes.map((n, idx) => ({ ...n, order: idx + 1 }));
      const nextNodes = [...otherNodes, ...updatedNodes];
      saveStorage('career_nodes', nextNodes);
      return { careerNodes: nextNodes };
    });
    useToastStore.getState().addToast('Urutan Tangga Karier Diperbarui', 'Hierarki posisi berhasil diatur ulang.', 'success');
  },

  // -------------------------------------------------------------
  // DOMAIN 07: MPP SCENARIOS
  // -------------------------------------------------------------
  addMppScenario: (scenario) => {
    set((state) => {
      const nextScenarios = [...state.mppScenarios, scenario];
      saveStorage('mpp_scenarios', nextScenarios);
      return { mppScenarios: nextScenarios };
    });
    useToastStore.getState().addToast('Skenario MPP Ditambahkan', `Skenario "${scenario.label}" berhasil disimpan.`, 'success');
  },

  // -------------------------------------------------------------
  // DOMAIN 08: AGENTIC ACTION ENGINE & NOTIFICATIONS
  // -------------------------------------------------------------
  executeAgenticAction: (actionId) => {
    const action = get().agenticActions.find((a) => a.id === actionId);
    if (!action) return;

    if (action.actionType === 'create_atp' && action.payload) {
      const newPlan: AnnualTrainingPlanItem = {
        id: `ATP-AUTO-${Date.now()}`,
        year: 2026,
        moduleId: 'T02',
        moduleName: action.payload.moduleName || 'Program Resertifikasi Mandatori K3',
        category: 'Compliance & Safety',
        department: action.payload.department || 'Operations',
        plannedMonth: action.payload.plannedMonth || 'Oct',
        targetParticipantsCount: action.payload.targetParticipants || 12,
        estimatedBudgetMillionIDR: action.payload.estimatedBudgetMillionIDR || 24,
        status: 'Approved',
        trainerName: 'Ir. Bambang Suhartono, IPU'
      };

      set((state) => {
        const nextPlans = [...state.annualTrainingPlans, newPlan];
        const nextActions = state.agenticActions.map((a) =>
          a.id === actionId ? { ...a, status: 'executed' as const } : a
        );
        const nextNotifs = state.notifications.map((n) =>
          n.category === 'cert_expiring' ? { ...n, isRead: true } : n
        );
        saveStorage('atp', nextPlans);
        saveStorage('agentic_actions', nextActions);
        saveStorage('notifications', nextNotifs);
        return {
          annualTrainingPlans: nextPlans,
          agenticActions: nextActions,
          notifications: nextNotifs
        };
      });

      useToastStore.getState().addToast(
        '⚡ [Agentic Action Executed]',
        `Program "${newPlan.moduleName}" (Rp ${newPlan.estimatedBudgetMillionIDR} Jt) langsung dibuat & disetujui di ATP!`,
        'success'
      );
    } else {
      set((state) => {
        const nextActions = state.agenticActions.map((a) =>
          a.id === actionId ? { ...a, status: 'executed' as const } : a
        );
        saveStorage('agentic_actions', nextActions);
        return { agenticActions: nextActions };
      });
      useToastStore.getState().addToast('Aksi Dieksekusi', `Aksi "${action.title}" berhasil dijalankan.`, 'info');
    }
  },

  addAgenticAction: (actionData) => {
    const newAction: AgenticActionItem = {
      ...actionData,
      id: `ACT-${Date.now()}`,
      status: 'pending'
    };
    set((state) => {
      const nextActions = [newAction, ...state.agenticActions];
      saveStorage('agentic_actions', nextActions);
      return { agenticActions: nextActions };
    });
    useToastStore.getState().addToast('Rekomendasi Aksi Dibuat', `Aksi "${newAction.title}" ditambahkan ke Action Engine.`, 'success');
  },

  deleteAgenticAction: (id) => {
    set((state) => {
      const nextActions = state.agenticActions.filter((a) => a.id !== id);
      saveStorage('agentic_actions', nextActions);
      return { agenticActions: nextActions };
    });
    useToastStore.getState().addToast('Aksi Dihapus', 'Rekomendasi aksi berhasil dihapus.', 'info');
  },

  addNotification: (notif) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
    useToastStore.getState().addToast('🔔 Notifikasi Dikirim', newNotif.title, 'info');
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
    }));
    useToastStore.getState().addToast('Semua Notifikasi Dibaca', 'Pusat notifikasi telah dibersihkan.', 'info');
  },

  // -------------------------------------------------------------
  // TRAINING MODULES
  // -------------------------------------------------------------
  addNewTrainingModule: (modData) => {
    const trainingModules = get().trainingModules;
    const newId = `T${String(trainingModules.length + 1).padStart(2, '0')}`;
    const newModule: TrainingModule = { ...modData, id: newId };

    set({ trainingModules: [...trainingModules, newModule] });
    saveTrainingModuleToDb(newModule).catch(console.error);
    useToastStore.getState().addToast('Modul Pelatihan Ditambahkan', `Modul "${newModule.name}" berhasil dibuat.`, 'success');
  },

  updateTrainingModule: (updatedMod) => {
    set((state) => ({
      trainingModules: state.trainingModules.map((m) => (m.id === updatedMod.id ? updatedMod : m))
    }));
    saveTrainingModuleToDb(updatedMod).catch(console.error);
    useToastStore.getState().addToast('Modul Diperbarui', `Modul "${updatedMod.name}" berhasil disimpan.`, 'success');
  },

  deleteTrainingModule: (modId) => {
    set((state) => ({
      trainingModules: state.trainingModules.filter((m) => m.id !== modId)
    }));
    deleteTrainingModuleFromDb(modId).catch(console.error);
    useToastStore.getState().addToast('Modul Dihapus', 'Modul pelatihan telah dihapus dari sistem.', 'info');
  },

  // -------------------------------------------------------------
  // JOB POSITIONS CRUD
  // -------------------------------------------------------------
  addNewJobPosition: (posData) => {
    const jobPositions = get().jobPositions;
    const newId = 'id' in posData && posData.id ? posData.id : `pos_${posData.department.toLowerCase().slice(0, 3)}_${Date.now()}`;
    const newPos: JobPosition = {
      ...posData,
      id: newId
    };

    set({ jobPositions: [...jobPositions, newPos] });
    saveJobPositionToDb(newPos).catch(console.error);
    useToastStore.getState().addToast('Posisi Jabatan Ditambahkan', `Jabatan "${newPos.title}" (${newPos.code}) berhasil didaftarkan.`, 'success');
  },

  updateJobPosition: (updatedPos) => {
    set((state) => ({
      jobPositions: state.jobPositions.map((p) => (p.id === updatedPos.id ? updatedPos : p))
    }));
    saveJobPositionToDb(updatedPos).catch(console.error);
    useToastStore.getState().addToast('Posisi Jabatan Diperbarui', `Jabatan "${updatedPos.title}" berhasil disimpan.`, 'success');
  },

  deleteJobPosition: (posId) => {
    set((state) => ({
      jobPositions: state.jobPositions.filter((p) => p.id !== posId)
    }));
    deleteJobPositionFromDb(posId).catch(console.error);
    useToastStore.getState().addToast('Posisi Jabatan Dihapus', 'Jabatan telah dihapus dari struktur organisasi.', 'info');
  },

  // -------------------------------------------------------------
  // MATRIX TRAINING STATUS & RULES
  // -------------------------------------------------------------
  updateEmployeeTraining: (empId, moduleId, status, score, certNo) => {
    set((state) => ({
      employees: state.employees.map((emp) => {
        if (emp.id !== empId) return emp;
        const updatedRecord = {
          status,
          completedDate: status === 'done' ? (emp.trainings[moduleId]?.completedDate || new Date().toISOString().split('T')[0]) : undefined,
          score: score !== undefined ? score : emp.trainings[moduleId]?.score,
          certificateNo: certNo !== undefined ? certNo : emp.trainings[moduleId]?.certificateNo,
          validUntil: status === 'done' ? (emp.trainings[moduleId]?.validUntil || new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0]) : undefined
        };
        const updatedTrainings = {
          ...emp.trainings,
          [moduleId]: updatedRecord
        };
        const updatedEmp: Employee = {
          ...emp,
          trainings: updatedTrainings
        };
        saveEmployeeToDb(updatedEmp).catch(console.error);
        return updatedEmp;
      })
    }));
  },

  updateTnaRule: (keyOrRule, ruleMaybe) => {
    let key: string;
    let newRule: TNARule;

    if (typeof keyOrRule === 'string') {
      key = keyOrRule;
      newRule = ruleMaybe!;
    } else {
      key = `${keyOrRule.department}_${keyOrRule.level}`;
      newRule = keyOrRule;
    }

    set((state) => ({
      tnaRules: {
        ...state.tnaRules,
        [key]: newRule
      }
    }));
    saveTnaRuleToDb(key, newRule).catch(console.error);
    useToastStore.getState().addToast('Standar TNA Disimpan', `Aturan untuk ${newRule.department} - ${newRule.level} berhasil disimpan.`, 'success');
  },

  // -------------------------------------------------------------
  // MPP & SUCCESSION
  // -------------------------------------------------------------
  updateMppPlan: (dept, updated) => {
    set((state) => ({
      mppData: state.mppData.map((plan) => {
        if (plan.department !== dept) return plan;
        const merged = { ...plan, ...updated };
        saveMppPlanToDb(merged).catch(console.error);
        return merged;
      })
    }));
    useToastStore.getState().addToast('Rencana MPP Disimpan', `Alokasi intervensi & estimasi budget ${dept} berhasil diperbarui.`, 'success');
  },

  addCriticalPosition: (posData) => {
    if (!checkDemoQuota(get().criticalPositions.length, 'posisi kritis')) return;
    const newPos: CriticalPosition = {
      ...posData,
      id: `CP-${Date.now()}`,
      successors: []
    };
    set((state) => ({
      criticalPositions: [...state.criticalPositions, newPos]
    }));
    saveCriticalPositionToDb(newPos).catch(console.error);
    useToastStore.getState().addToast('Posisi Kritis Ditambahkan', `${newPos.title} berhasil didaftarkan ke peta suksesi.`, 'success');
  },

  deleteCriticalPosition: (id) => {
    set((state) => ({
      criticalPositions: state.criticalPositions.filter((p) => p.id !== id)
    }));
    deleteCriticalPositionFromDb(id).catch(console.error);
    useToastStore.getState().addToast('Posisi Kritis Dihapus', 'Posisi kunci telah dihapus dari peta suksesi.', 'info');
  },

  nominateSuccessor: (criticalPosId, candidateEmpId, readiness = 'Ready Now') => {
    const candidate = get().employees.find((e) => e.id === candidateEmpId);
    if (!candidate) return;

    const fitScore = Math.min(
      95,
      Math.round(
        ((candidate.radar.performance * 0.4) +
        (candidate.radar.leadership * 0.3) +
        (candidate.radar.technical * 0.3))
      )
    );

    set((state) => ({
      criticalPositions: state.criticalPositions.map((pos) => {
        if (pos.id !== criticalPosId) return pos;
        const filteredSuccessors = pos.successors.filter((s) => s.employeeId !== candidateEmpId);
        const updatedPos: CriticalPosition = {
          ...pos,
          successors: [
            ...filteredSuccessors,
            {
              employeeId: candidate.id,
              name: candidate.name,
              readiness,
              fitScore
            }
          ]
        };
        saveCriticalPositionToDb(updatedPos).catch(console.error);
        return updatedPos;
      }),
      employees: state.employees.map((e) => (e.id === candidateEmpId ? { ...e, isSuccessorReady: true } : e))
    }));

    useToastStore.getState().addToast('Suksesor Didaftarkan', `${candidate.name} dinominasikan sebagai calon suksesor (${readiness}) dengan Fit Score ${fitScore}%.`, 'success');
  },

  removeSuccessor: (criticalPosId, candidateEmpId) => {
    set((state) => ({
      criticalPositions: state.criticalPositions.map((pos) => {
        if (pos.id !== criticalPosId) return pos;
        const updatedPos: CriticalPosition = {
          ...pos,
          successors: pos.successors.filter((s) => s.employeeId !== candidateEmpId)
        };
        saveCriticalPositionToDb(updatedPos).catch(console.error);
        return updatedPos;
      })
    }));
    useToastStore.getState().addToast('Suksesor Dihapus', 'Kandidat suksesor dikeluarkan dari pipeline posisi ini.', 'info');
  },

  // -------------------------------------------------------------
  // BULK IMPORTS
  // -------------------------------------------------------------
  importEmployees: async (imported, mode = 'merge') => {
    const current = get().employees;
    let nextList: Employee[];
    if (mode === 'replace') {
      nextList = imported;
    } else {
      const map = new Map<string, Employee>();
      current.forEach((e) => map.set(e.nip, e));
      imported.forEach((e) => map.set(e.nip, e));
      nextList = Array.from(map.values());
    }
    set({ employees: nextList });
    await bulkSaveEmployeesToDb(nextList);
    useToastStore.getState().addToast('Impor Karyawan Berhasil', `${imported.length} data karyawan berhasil diproses (${mode}).`, 'success');
    return imported.length;
  },

  importTrainingModules: async (imported, mode = 'merge') => {
    const current = get().trainingModules;
    let nextList: TrainingModule[];
    if (mode === 'replace') {
      nextList = imported;
    } else {
      const map = new Map<string, TrainingModule>();
      current.forEach((m) => map.set(m.code, m));
      imported.forEach((m) => map.set(m.code, m));
      nextList = Array.from(map.values());
    }
    set({ trainingModules: nextList });
    await bulkSaveTrainingModulesToDb(nextList);
    useToastStore.getState().addToast('Impor Modul Berhasil', `${imported.length} modul pelatihan berhasil diproses.`, 'success');
    return imported.length;
  },

  importTrainingMatrix: async (records) => {
    const { employees, trainingModules } = get();
    const modMap = new Map<string, string>();
    trainingModules.forEach((m) => {
      modMap.set(m.code.toLowerCase(), m.id);
      modMap.set(m.id.toLowerCase(), m.id);
    });

    let updatedCount = 0;
    const nextEmployees = employees.map((emp) => {
      const matchingRecords = records.filter((r) => r.nip === emp.nip);
      if (matchingRecords.length === 0) return emp;

      const nextTrainings = { ...emp.trainings };
      matchingRecords.forEach((rec) => {
        const targetModId = modMap.get(rec.moduleCodeOrId.toLowerCase()) || rec.moduleCodeOrId;
        nextTrainings[targetModId] = {
          status: rec.status,
          score: rec.score,
          certificateNo: rec.certNo,
          completedDate: rec.completedDate || (rec.status === 'done' ? new Date().toISOString().split('T')[0] : undefined)
        };
        updatedCount++;
      });
      return { ...emp, trainings: nextTrainings };
    });

    set({ employees: nextEmployees });
    await bulkSaveEmployeesToDb(nextEmployees);
    useToastStore.getState().addToast('Impor Matriks Pelatihan', `${updatedCount} catatan riwayat pelatihan berhasil diintegrasikan.`, 'success');
    return updatedCount;
  },

  importTnaRules: async (rules, mode = 'merge') => {
    const current = get().tnaRules;
    const nextRules = mode === 'replace' ? rules : { ...current, ...rules };
    set({ tnaRules: nextRules });
    await bulkSaveTnaRulesToDb(nextRules);
    useToastStore.getState().addToast('Impor Standar TNA', `${Object.keys(rules).length} konfigurasi matriks kualifikasi diperbarui.`, 'success');
    return Object.keys(rules).length;
  },

  importNineBoxCalibrations: async (calibrations) => {
    const { employees } = get();
    let updatedCount = 0;
    const nextEmployees = employees.map((emp) => {
      const cal = calibrations.find((c) => c.nip === emp.nip);
      if (!cal) return emp;
      const autoGrid = computeNineBoxGrid(cal.perf, cal.pot);
      updatedCount++;
      return {
        ...emp,
        performanceRating: cal.perf,
        potentialRating: cal.pot,
        nineBoxGrid: autoGrid,
        isKeyTalent: cal.isKeyTalent !== undefined ? cal.isKeyTalent : autoGrid >= 8,
        isSuccessorReady: cal.isSuccessorReady !== undefined ? cal.isSuccessorReady : emp.isSuccessorReady
      };
    });
    set({ employees: nextEmployees });
    await bulkSaveEmployeesToDb(nextEmployees);
    useToastStore.getState().addToast('Kalibrasi 9-Box Diperbarui', `${updatedCount} data rating potensi & performa diperbarui.`, 'success');
    return updatedCount;
  },

  importMppPlans: async (plans, mode = 'merge') => {
    const current = get().mppData;
    let nextList: ManpowerDeptPlan[];
    if (mode === 'replace') {
      nextList = plans;
    } else {
      const map = new Map<string, ManpowerDeptPlan>();
      current.forEach((p) => map.set(p.department, p));
      plans.forEach((p) => map.set(p.department, p));
      nextList = Array.from(map.values());
    }
    set({ mppData: nextList });
    await bulkSaveMppPlansToDb(nextList);
    useToastStore.getState().addToast('Impor MPP Berhasil', `${plans.length} perencanaan tenaga kerja berhasil dimutakhirkan.`, 'success');
    return plans.length;
  },

  importCriticalPositions: async (positions, mode = 'merge') => {
    const current = get().criticalPositions;
    let nextList: CriticalPosition[];
    if (mode === 'replace') {
      nextList = positions;
    } else {
      const map = new Map<string, CriticalPosition>();
      current.forEach((p) => map.set(p.id, p));
      positions.forEach((p) => map.set(p.id, p));
      nextList = Array.from(map.values());
    }
    set({ criticalPositions: nextList });
    await bulkSaveCriticalPositionsToDb(nextList);
    useToastStore.getState().addToast('Impor Posisi Kritis', `${positions.length} pemetaan posisi berisiko tinggi diperbarui.`, 'success');
    return positions.length;
  },

  importJobPositions: async (positions, mode = 'merge') => {
    const current = get().jobPositions;
    let nextList: JobPosition[];
    if (mode === 'replace') {
      nextList = positions;
    } else {
      const map = new Map<string, JobPosition>();
      current.forEach((p) => map.set(p.id, p));
      positions.forEach((p) => map.set(p.id, p));
      nextList = Array.from(map.values());
    }
    set({ jobPositions: nextList });
    await bulkSaveJobPositionsToDb(nextList);
    useToastStore.getState().addToast('Impor Posisi Jabatan', `${positions.length} struktur jabatan berhasil diperbarui.`, 'success');
    return positions.length;
  },

  restoreFullDatabaseBackup: async (backupData, mode = 'replace') => {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Format file backup JSON tidak valid.');
    }
    const employeesToRestore = backupData.employees || [];
    const modulesToRestore = backupData.trainingModules || [];
    const rulesToRestore = backupData.tnaRules || {};
    const criticalToRestore = backupData.criticalPositions || [];
    const mppToRestore = backupData.mppData || [];
    const jobPosToRestore = backupData.jobPositions || [];

    set({
      employees: employeesToRestore,
      trainingModules: modulesToRestore,
      tnaRules: rulesToRestore,
      criticalPositions: criticalToRestore,
      mppData: mppToRestore,
      jobPositions: jobPosToRestore.length > 0 ? jobPosToRestore : INITIAL_JOB_POSITIONS
    });

    await Promise.all([
      bulkSaveEmployeesToDb(employeesToRestore),
      bulkSaveTrainingModulesToDb(modulesToRestore),
      bulkSaveTnaRulesToDb(rulesToRestore),
      bulkSaveCriticalPositionsToDb(criticalToRestore),
      bulkSaveMppPlansToDb(mppToRestore),
      bulkSaveJobPositionsToDb(jobPosToRestore)
    ]);

    useToastStore.getState().addToast('Database Berhasil Dipulihkan', 'Seluruh entitas data telah dipulihkan dari cadangan.', 'success');
  },

  // -------------------------------------------------------------
  // SELECTORS & COMPUTED QUERIES
  // -------------------------------------------------------------
  getRuleFor: (dept, level) => {
    const { tnaRules } = get();
    return tnaRules[`${dept}_${level}`] || tnaRules[`All_${level}`];
  },

  checkQualification: (emp) => {
    const { getRuleFor } = get();
    const rule = getRuleFor(emp.department, emp.level);

    if (!rule) {
      return {
        isQualified: true,
        eduValid: true,
        tenureValid: true,
        requiredTrainingsCount: 0,
        completedTrainingsCount: 0,
        trainingComplete: true,
        statusText: 'Kualifikasi Lengkap (Default)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }

    const eduRanks: Record<EducationLevel, number> = {
      'SMA': 1, 'D3': 2, 'S1': 3, 'S2': 4, 'S3': 5
    };
    const empRank = eduRanks[emp.education] || 1;
    const reqRank = eduRanks[rule.minEdu] || 1;
    const eduValid = empRank >= reqRank;

    const tenureValid = emp.tenureYears >= rule.minTenureYears;

    const requiredIds = rule.requiredTrainingIds || [];
    const completedCount = requiredIds.filter(
      (mId) => emp.trainings && emp.trainings[mId]?.status === 'done'
    ).length;
    const trainingComplete = completedCount === requiredIds.length;

    const isQualified = eduValid && tenureValid && trainingComplete;

    let statusText = 'Kualifikasi Lengkap';
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    if (!isQualified) {
      if (!trainingComplete && (!eduValid || !tenureValid)) {
        statusText = 'Gap Pelatihan & Profil';
        badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (!trainingComplete) {
        statusText = `Kesenjangan Pelatihan (${completedCount}/${requiredIds.length})`;
        badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        statusText = 'Kesenjangan Syarat Profil';
        badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
      }
    }

    return {
      isQualified,
      eduValid,
      tenureValid,
      requiredTrainingsCount: requiredIds.length,
      completedTrainingsCount: completedCount,
      trainingComplete,
      statusText,
      badgeClass
    };
  },

  getDirectReportsFor: (managerId, managerName) => {
    const { employees } = get();
    return employees.filter(
      (e) => e.managerId === managerId || (managerName && e.managerName === managerName)
    );
  },

  getNineBoxBox: (boxOrEmp) => {
    let boxNum: number;
    if (typeof boxOrEmp === 'number') {
      boxNum = boxOrEmp;
    } else {
      boxNum = boxOrEmp.nineBoxGrid || computeNineBoxGrid(boxOrEmp.performanceRating, boxOrEmp.potentialRating);
    }
    return NINE_BOX_DEFINITIONS[boxNum] || NINE_BOX_DEFINITIONS[5];
  },

  getCompetencyGaps: (filterDept) => {
    const { employees, positionCompetencies, competencies } = get();
    const gapList: CompetencyGapItem[] = [];

    employees.forEach((emp) => {
      if (filterDept && filterDept !== 'All' && emp.department !== filterDept) return;
      
      const reqs = positionCompetencies.filter(
        (p) => p.department === emp.department && p.level === emp.level
      );

      reqs.forEach((req) => {
        const comp = competencies.find((c) => c.id === req.competencyId);
        const actualScore = (emp.competencyScores && emp.competencyScores[req.competencyId]) 
          ? emp.competencyScores[req.competencyId] 
          : (emp.level === 'Manager' ? 4 : emp.level === 'Supervisor' ? 3 : 2) as ProficiencyLevel;

        const gap = actualScore - req.requiredLevel;
        if (gap < 0) {
          const recTraining = comp?.levels[req.requiredLevel]?.recommendedTrainingIds?.[0];
          gapList.push({
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            jobTitle: emp.jobTitle,
            competencyId: req.competencyId,
            competencyName: req.competencyName,
            category: comp?.category || 'Technical',
            requiredLevel: req.requiredLevel,
            currentLevel: actualScore,
            gap,
            status: gap <= -2 ? 'Critical Gap (-2+)' : 'Minor Gap (-1)',
            recommendedTrainingId: recTraining,
            recommendedTrainingName: recTraining ? `Modul ${recTraining}` : undefined
          });
        }
      });
    });

    return gapList;
  },

  getOverallStats: () => {
    const { employees, trainingModules, criticalPositions, getRuleFor, checkQualification, getDirectReportsFor } = get();

    let totalMandatory = 0;
    let completedMandatory = 0;
    let gapsCount = 0;

    employees.forEach((emp) => {
      const rule = getRuleFor(emp.department, emp.level);
      if (rule && rule.requiredTrainingIds) {
        rule.requiredTrainingIds.forEach((mId) => {
          totalMandatory++;
          if (emp.trainings && emp.trainings[mId]?.status === 'done') {
            completedMandatory++;
          }
        });
      }
      const qual = checkQualification(emp);
      if (!qual.isQualified) gapsCount++;
    });

    const complianceRate = totalMandatory > 0 ? Math.round((completedMandatory / totalMandatory) * 100) : 100;

    const now = new Date('2026-08-15');
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const contractsExpiringCount = employees.filter((e) => {
      if (e.employmentType.includes('Contract') && e.contractEndDate) {
        const diff = new Date(e.contractEndDate).getTime() - now.getTime();
        return diff > 0 && diff <= ninetyDays;
      }
      return false;
    }).length;

    const currentYear = 2026;
    const retiringCount = employees.filter((e) => currentYear - e.birthYear >= 54).length;

    const noSuccessorCount = criticalPositions.filter(
      (cp) => cp.successors.filter((s) => s.readiness === 'Ready Now').length === 0
    ).length;

    const managers = employees.filter((e) => e.level === 'Manager' || e.level === 'Director');
    const overSpannedManagersCount = managers.filter((mgr) => getDirectReportsFor(mgr.id, mgr.name).length > 8).length;

    return {
      totalEmployees: employees.length,
      totalModules: trainingModules.length,
      complianceRate,
      criticalVacanciesCount: criticalPositions.filter((cp) => cp.riskLevel === 'High').length,
      contractsExpiringCount,
      retiringCount,
      noSuccessorCount,
      overSpannedManagersCount,
      totalGapCount: gapsCount
    };
  },

  getExecutiveHealthSummary: () => {
    const { employees, criticalPositions, mppData, getOverallStats, getCompetencyGaps } = get();
    const stats = getOverallStats();
    const compGaps = getCompetencyGaps();

    // 1. Workforce Health
    const budgetHc = mppData.reduce((acc, curr) => acc + curr.requiredDemand, 0);
    const actualHc = employees.length;
    const vacancyCount = Math.max(0, budgetHc - actualHc);
    const turnoverRate = 4.2; // %

    // 2. Learning Health
    const mandatoryCompliance = stats.complianceRate;
    const totalTrainingHours = employees.length * 28.5; // Average hours

    // 3. Competency Health
    const criticalGapCount = compGaps.filter((g) => g.status === 'Critical Gap (-2+)').length;
    const qualRate = Math.round(((employees.length - stats.totalGapCount) / employees.length) * 100);

    // 4. Talent Health
    const hipoCount = employees.filter((e) => e.nineBoxGrid === 9 || e.nineBoxGrid === 8 || e.nineBoxGrid === 6).length;
    const highPerfCount = employees.filter((e) => e.performanceRating === 'High').length;
    const keyTalentCount = employees.filter((e) => e.isKeyTalent).length;
    const talentRiskCount = employees.filter((e) => e.nineBoxGrid === 9 && e.tenureYears >= 5).length; // flight risk high

    // 5. Succession Health
    const critPosCount = criticalPositions.length;
    const readyNowCount = criticalPositions.filter((cp) => cp.successors.some((s) => s.readiness === 'Ready Now')).length;
    const withoutSuccessor = criticalPositions.filter((cp) => cp.successors.length === 0).length;
    const succCoverage = critPosCount > 0 ? Math.round((readyNowCount / critPosCount) * 100) : 0;

    return {
      workforceHealth: {
        totalHeadcount: actualHc,
        budgetHeadcount: budgetHc,
        vacancyCount,
        turnoverRate,
        retirementRiskCount: stats.retiringCount,
        status: vacancyCount > 15 || stats.retiringCount > 10 ? 'Caution' : 'Optimal'
      },
      learningHealth: {
        trainingComplianceRate: stats.complianceRate,
        mandatoryComplianceRate: mandatoryCompliance,
        totalTrainingHours: Math.round(totalTrainingHours),
        expiringCertificationsCount: 3,
        status: stats.complianceRate < 75 ? 'Critical' : stats.complianceRate < 85 ? 'Caution' : 'Optimal'
      },
      competencyHealth: {
        totalCompetencyGapCount: compGaps.length,
        criticalCompetencyGapCount: criticalGapCount,
        skillCoverageRate: Math.max(70, Math.min(96, Math.round(100 - (compGaps.length * 1.5)))),
        qualificationRate: qualRate,
        status: criticalGapCount > 5 ? 'Critical' : compGaps.length > 10 ? 'Caution' : 'Optimal'
      },
      talentHealth: {
        highPotentialCount: hipoCount,
        highPerformerCount: highPerfCount,
        keyTalentCount,
        talentRiskCount,
        status: hipoCount < 5 ? 'Caution' : 'Optimal'
      },
      successionHealth: {
        criticalPositionsCount: critPosCount,
        successionCoverageRate: succCoverage,
        readyNowSuccessorsCount: readyNowCount,
        positionsWithoutSuccessorCount: withoutSuccessor,
        status: withoutSuccessor > 0 || succCoverage < 60 ? 'Critical' : succCoverage < 80 ? 'Caution' : 'Optimal'
      }
    };
  },

  getPositionsByDepartment: (dept) => {
    const { jobPositions } = get();
    if (!dept || dept === 'All') return jobPositions;
    return jobPositions.filter((p) => p.department === dept);
  },

  getFilledCountForPosition: (posTitle, dept) => {
    const { employees } = get();
    const cleanTitle = posTitle.toLowerCase().trim();
    return employees.filter(
      (e) => e.department === dept && e.jobTitle.toLowerCase().trim() === cleanTitle
    ).length;
  }
}));
