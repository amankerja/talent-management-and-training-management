export type Department = 
  | 'Operations' 
  | 'Engineering' 
  | 'Human Resources' 
  | 'Supply Chain' 
  | 'Sales & Commercial' 
  | 'Finance & IT';

export type JobLevel = 
  | 'Director'
  | 'Manager' 
  | 'Supervisor' 
  | 'Senior Staff' 
  | 'Staff' 
  | 'Admin'
  | 'Operator';

export type EducationLevel = 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';

export type EmploymentType = 'PKWTT (Permanent)' | 'PKWT (Contract)' | 'Outsource';

export interface JobPosition {
  id: string;
  code: string;
  title: string;
  department: Department;
  level: JobLevel;
  grade: string;
  reportsToPositionId?: string;
  reportsToTitle?: string;
  reportsToLevel?: JobLevel;
  targetHeadcount: number;
  currentFilledCount?: number;
  minEdu?: EducationLevel;
  minTenureYears?: number;
  isCritical?: boolean;
  description?: string;
}

// --------------------------------------------------------------------------
// DOMAIN 02: WORKFORCE MOVEMENT & CAREER TIMELINE
// --------------------------------------------------------------------------
export type MovementType = 
  | 'Promotion' 
  | 'Demotion' 
  | 'Rotation' 
  | 'Mutation' 
  | 'Transfer' 
  | 'Acting Position' 
  | 'Resignation' 
  | 'Retirement';

export interface WorkforceMovement {
  id: string;
  employeeId: string;
  employeeName: string;
  type: MovementType;
  fromPosition: string;
  toPosition: string;
  fromDepartment: Department;
  toDepartment: Department;
  fromGrade?: string;
  toGrade?: string;
  effectiveDate: string;
  skNumber?: string;
  reason?: string;
  approvedBy?: string;
  status: 'Draft' | 'Approved' | 'Executed';
}

// --------------------------------------------------------------------------
// DOMAIN 03: COMPETENCY FRAMEWORK & TNA GAP ENGINE
// --------------------------------------------------------------------------
export type CompetencyCategory = 
  | 'Technical' 
  | 'HSE & Compliance' 
  | 'Leadership & Management' 
  | 'Core & Culture' 
  | 'Digital & Data';

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export interface CompetencyLevelDefinition {
  level: ProficiencyLevel;
  name: 'Awareness' | 'Basic' | 'Competent' | 'Advanced' | 'Expert';
  behaviorIndicators: string[];
  recommendedTrainingIds?: string[];
}

export interface CompetencyItem {
  id: string;
  code: string;
  name: string;
  category: CompetencyCategory;
  description: string;
  levels: Record<ProficiencyLevel, CompetencyLevelDefinition>;
}

export interface PositionCompetencyRequirement {
  id: string;
  positionId: string;
  positionTitle: string;
  department: Department;
  level: JobLevel;
  competencyId: string;
  competencyName: string;
  requiredLevel: ProficiencyLevel; // Target 1..5
  isCritical?: boolean;
}

export interface EmployeeCompetencyAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  competencyId: string;
  competencyName: string;
  currentLevel: ProficiencyLevel; // Actual 1..5
  assessedDate: string;
  assessedBy: string;
  method: 'Self' | 'Manager' | 'Assessor' | 'Certification';
  notes?: string;
}

export interface CompetencyGapItem {
  employeeId: string;
  employeeName: string;
  department: Department;
  jobTitle: string;
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  requiredLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel;
  gap: number; // current - required (e.g. 3 - 4 = -1)
  status: 'Met' | 'Minor Gap (-1)' | 'Critical Gap (-2+)';
  recommendedTrainingId?: string;
  recommendedTrainingName?: string;
}

// --------------------------------------------------------------------------
// DOMAIN 04: LEARNING & TRAINING LIFECYCLE
// --------------------------------------------------------------------------
export type TrainingCategory = 
  | 'Leadership' 
  | 'Compliance & Safety' 
  | 'Technical & Engineering' 
  | 'Quality & 5S' 
  | 'Soft Skill' 
  | 'Digital & Data';

export type TrainingStatusType = 'done' | 'progress' | 'not_done';

export interface TrainingModule {
  id: string;
  code: string;
  name: string;
  category: TrainingCategory;
  durationHours: number;
  provider: string;
  description: string;
  costPerParticipantIDR?: number;
  mandatoryForRoles?: string[];
  mappedCompetencyId?: string;
}

export interface TrainingRecord {
  status: TrainingStatusType;
  completedDate?: string;
  score?: number;
  certificateNo?: string;
  validUntil?: string;
}

export type AnnualPlanStatus = 'Planned' | 'Approved' | 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';

export interface AnnualTrainingPlanItem {
  id: string;
  year: number;
  moduleId: string;
  moduleName: string;
  category: TrainingCategory;
  department: Department | 'All';
  targetParticipantsCount: number;
  plannedMonth: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
  estimatedBudgetMillionIDR: number;
  status: AnnualPlanStatus;
  actualParticipantsCount?: number;
  actualSpendMillionIDR?: number;
  trainerName?: string;
}

export interface Trainer {
  id: string;
  name: string;
  type: 'Internal' | 'External Vendor';
  companyOrDept: string;
  email: string;
  phone: string;
  specialization: string[];
  rating: number; // 1-5
  totalBatchesConducted: number;
}

export interface TrainingEvent {
  id: string;
  annualPlanId?: string;
  moduleId: string;
  moduleName: string;
  batchCode: string;
  eventName: string;
  batchNumber: number;
  trainerId?: string;
  trainerName: string;
  trainerType: 'Internal' | 'External Vendor';
  location: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  quota: number;
  status: 'Draft' | 'Registration' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  costIDR: number;
  participantIds: string[];
  attendees?: {
    employeeId: string;
    employeeName: string;
    department: Department;
    status: 'Registered' | 'Attended' | 'Absent' | 'Passed' | 'Failed';
    preTestScore?: number;
    postTestScore?: number;
    feedbackScore?: number; // 1-5
    certificateNo?: string;
    certValidUntil?: string;
  }[];
}

export interface TrainingReminder {
  id: string;
  eventId?: string;
  eventName?: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  targetRole?: 'Peserta' | 'Instruktur' | 'Panitia HR' | 'All';
  priority: 'Critical' | 'Warning' | 'Info';
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

// --------------------------------------------------------------------------
// DOMAIN 05: TALENT & SUCCESSION
// --------------------------------------------------------------------------
export interface CriticalPosition {
  id: string;
  title: string;
  department: Department;
  currentHolder: string;
  currentHolderId: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  businessImpact: string;
  retirementYearsRemaining: number;
  successors: {
    employeeId: string;
    name: string;
    readiness: 'Ready Now' | 'Ready in 1 Year' | 'Ready in 2-3 Years';
    fitScore: number;
  }[];
}

export interface NineBoxInfo {
  box: number;
  title: string;
  perf: 'Low' | 'Medium' | 'High';
  pot: 'Low' | 'Medium' | 'High';
  color: string;
  bgLight: string;
  border: string;
  textBadge: string;
  strategicDescription: string;
  recommendedActions: string[];
}

export type CrisisExitReason = 
  | 'Sudden Resignation (2-Weeks Notice)' 
  | 'Emergency Medical Leave (90 Days)' 
  | 'Accelerated Retirement' 
  | 'Disciplinary Termination';

export interface EmergencySuccessionSimulation {
  positionId: string;
  positionTitle: string;
  department: Department;
  currentHolder: string;
  crisisReason: CrisisExitReason;
  operationalVulnerabilityScore: number; // 0-100%
  dailyRevenueRiskMillionIDR: number;
  complianceImpactNote: string;
  subordinatesImpactedCount: number;
  bestSuccessor: {
    employeeId: string;
    name: string;
    readiness: 'Ready Now' | 'Ready in 1 Year' | 'Ready in 2-3 Years';
    fitScore: number;
    leadershipScore: number;
    technicalScore: number;
    onboardingVelocityDays: number;
    transitionGapNote: string;
  } | null;
  secondarySuccessors: {
    employeeId: string;
    name: string;
    readiness: string;
    fitScore: number;
  }[];
  aiContingencyGuidance: string;
}

// --------------------------------------------------------------------------
// DOMAIN 06: PERFORMANCE & DEVELOPMENT (IDP & GOALS)
// --------------------------------------------------------------------------
export interface IndividualDevelopmentPlan {
  id: string;
  employeeId: string;
  year: number;
  targetRole?: string;
  strengths: string[];
  developmentAreas: string[];
  action70Experience: string[]; // 70% On the job
  action20Exposure: string[];   // 20% Coaching / Mentorship
  action10Education: string[];  // 10% Formal training
  status: 'Draft' | 'Active' | 'Under Review' | 'Completed';
}

export interface CareerPathOption {
  id: string;
  trackType: 'Management Track' | 'Specialist Track' | 'Lateral Move';
  targetRole: string;
  targetGrade: string;
  targetDept: string;
  fitPercentage: number;
  description: string;
  requiredCompetencies: string[];
  gapsToClose: string[];
}

export interface CompetencyRadar {
  performance: number; // 0 - 100
  leadership: number;  // 0 - 100
  technical: number;   // 0 - 100
  adaptability: number;// 0 - 100
  cultureFit: number;  // 0 - 100
}

// --------------------------------------------------------------------------
// CORE EMPLOYEE MASTER
// --------------------------------------------------------------------------
export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  avatarUrl: string;
  department: Department;
  jobTitle: string;
  level: JobLevel;
  grade: string;
  education: EducationLevel;
  tenureYears: number;
  joinDate: string;
  birthYear: number;
  employmentType: EmploymentType;
  contractEndDate?: string;
  managerName?: string;
  managerId?: string;
  directReportsCount?: number;
  performanceRating: 'Low' | 'Medium' | 'High';
  potentialRating: 'Low' | 'Medium' | 'High';
  nineBoxGrid: number; // 1 to 9
  trainings: Record<string, TrainingRecord>;
  radar: CompetencyRadar;
  careerPaths: CareerPathOption[];
  isKeyTalent?: boolean;
  isSuccessorReady?: boolean;
  movements?: WorkforceMovement[];
  competencyScores?: Record<string, ProficiencyLevel>; // competencyId -> current level
  notes?: string;
}

// --------------------------------------------------------------------------
// DOMAIN 07: WORKFORCE PLANNING (MPP)
// --------------------------------------------------------------------------
export interface ManpowerDeptPlan {
  department: Department;
  currentHeadcount: number;
  projectedTurnover: number;
  projectedRetirements: number;
  projectedSupply: number; // current - turnover - retirements
  requiredDemand: number;
  gap: number; // demand - supply
  interventions: {
    recruitmentCount: number;
    internalMobilityCount: number;
    upskillingCount: number;
    automationEfficiencyCount: number;
  };
  estimatedBudgetMillionIDR: number;
}

export interface TNARule {
  id: string;
  department: Department | 'All';
  level: JobLevel;
  minEdu: EducationLevel;
  minTenureYears: number;
  requiredTrainingIds: string[];
}

// --------------------------------------------------------------------------
// DOMAIN 06: PERFORMANCE & DEVELOPMENT (IDP & CAREER ARCHITECTURE)
// --------------------------------------------------------------------------
export interface IDPTask {
  id: string;
  title: string;
  category: '70_experience' | '20_exposure' | '10_education';
  mentorOrLead?: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface DetailedIDP {
  id: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  targetPosition: string;
  targetReadiness: number; // e.g. 76% -> 84%
  completionPercentage: number; // e.g. 80%
  developmentGoal: string;
  durationMonths: number;
  experience70: IDPTask[];
  exposure20: IDPTask[];
  education10: IDPTask[];
  aiGuidance: string;
  status: 'Active' | 'Under Review' | 'Completed';
}

export interface CareerNode {
  id: string;
  trackId: string; // e.g. 'training-stream', 'ops-mining', 'plant-eng', 'hse-safety', 'fin-scm'
  trackName: string;
  department?: Department;
  title: string;
  level: JobLevel;
  grade: string;
  order: number;
  educationReq: EducationLevel;
  minTenureYears: number;
  requiredCompetencies: { id: string; name: string; requiredLevel: ProficiencyLevel }[];
  requiredTrainings: { moduleId: string; moduleName: string }[];
  leadershipMinScore: number;
  performanceMinRating: 'Medium' | 'High';
  salaryRangeMillionIDR: { min: number; max: number };
}

export interface CareerFitAssessment {
  nodeId: string;
  nodeTitle: string;
  educationMatch: boolean;
  experienceMatch: boolean;
  competencyScore: number; // 0 - 100
  trainingScore: number;   // 0 - 100
  leadershipScore: number; // 0 - 100
  performanceScore: number;// 0 - 100
  overallFitScore: number; // 0 - 100
  aiDiagnosis: string;
  missingRequirements: string[];
}

// --------------------------------------------------------------------------
// DOMAIN 07: WORKFORCE PLANNING (SCENARIO SIMULATION)
// --------------------------------------------------------------------------
export interface MPPScenario {
  id: string;
  name: 'BASELINE' | 'OPTION_A' | 'OPTION_B' | 'OPTION_C' | string;
  label: string;
  description: string;
  totalHeadcount: number;
  totalCostBillionIDR: number;
  capabilityScore: number; // 0 - 100
  riskScore: 'Low' | 'Medium' | 'High';
  implementationTimeMonths: number;
  breakdown: {
    recruitCount: number;      // BUY
    upskillCount: number;      // BUILD
    contractCount: number;     // BORROW
    automationCount: number;   // BOT
  };
  aiTradeoff: {
    pros: string[];
    cons: string[];
    recommendationTag?: 'Lowest Cost' | 'Best Capability' | 'Lowest Risk' | 'Fastest Implementation' | 'Baseline';
  };
}

// --------------------------------------------------------------------------
// DOMAIN 08: PEOPLE INTELLIGENCE (ACTION ENGINE & NOTIFICATIONS)
// --------------------------------------------------------------------------
export interface AgenticActionItem {
  id: string;
  riskType: 'SUCCESSION RISK' | 'COMPETENCY RISK' | 'MANPOWER RISK' | 'CERTIFICATION EXPIRY' | 'IDP REVIEW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  participantsCount?: number;
  estimatedBudgetMillionIDR?: number;
  recommendedDate?: string;
  actionButtonLabel: string;
  actionType: 'create_atp' | 'create_idp' | 'open_succession' | 'open_mpp';
  payload?: any;
  status: 'pending' | 'executed';
}

export interface SystemNotification {
  id: string;
  category: 'mandatory_overdue' | 'cert_expiring' | 'no_successor' | 'idp_due' | 'training_event';
  severity: 'red' | 'yellow' | 'blue';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  targetTab?: string;
  targetSubTab?: string;
  isRead: boolean;
}

// --------------------------------------------------------------------------
// DOMAIN 01: EXECUTIVE KPI HEALTH CLUSTERS
// --------------------------------------------------------------------------
export interface ExecutiveHealthSummary {
  workforceHealth: {
    totalHeadcount: number;
    budgetHeadcount: number;
    vacancyCount: number;
    turnoverRate: number;
    retirementRiskCount: number;
    status: 'Optimal' | 'Caution' | 'Critical';
  };
  learningHealth: {
    trainingComplianceRate: number;
    mandatoryComplianceRate: number;
    totalTrainingHours: number;
    expiringCertificationsCount: number;
    status: 'Optimal' | 'Caution' | 'Critical';
  };
  competencyHealth: {
    totalCompetencyGapCount: number;
    criticalCompetencyGapCount: number;
    skillCoverageRate: number;
    qualificationRate: number;
    status: 'Optimal' | 'Caution' | 'Critical';
  };
  talentHealth: {
    highPotentialCount: number;
    highPerformerCount: number;
    keyTalentCount: number;
    talentRiskCount: number;
    status: 'Optimal' | 'Caution' | 'Critical';
  };
  successionHealth: {
    criticalPositionsCount: number;
    successionCoverageRate: number;
    readyNowSuccessorsCount: number;
    positionsWithoutSuccessorCount: number;
    status: 'Optimal' | 'Caution' | 'Critical';
  };
}
