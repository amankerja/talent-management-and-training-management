import { 
  Department, 
  JobLevel, 
  JobPosition,
  EducationLevel, 
  TrainingModule, 
  TrainingCategory,
  TNARule, 
  Employee, 
  CriticalPosition, 
  ManpowerDeptPlan, 
  NineBoxInfo,
  WorkforceMovement,
  CompetencyCategory,
  ProficiencyLevel,
  CompetencyItem,
  PositionCompetencyRequirement,
  EmployeeCompetencyAssessment,
  AnnualTrainingPlanItem,
  Trainer,
  TrainingEvent,
  TrainingReminder,
  IndividualDevelopmentPlan,
  DetailedIDP,
  CareerNode,
  MPPScenario,
  AgenticActionItem,
  SystemNotification
} from '../types';

export const DEPARTMENTS: Department[] = [
  'Operations',
  'Engineering',
  'Human Resources',
  'Supply Chain',
  'Sales & Commercial',
  'Finance & IT'
];

export const JOB_LEVELS: JobLevel[] = [
  'Director',
  'Manager',
  'Supervisor',
  'Senior Staff',
  'Staff',
  'Admin',
  'Operator'
];

export const EDUCATION_LEVELS: EducationLevel[] = ['SMA', 'D3', 'S1', 'S2', 'S3'];

export const TRAINING_CATEGORIES: TrainingCategory[] = [
  'Leadership',
  'Compliance & Safety',
  'Technical & Engineering',
  'Quality & 5S',
  'Soft Skill',
  'Digital & Data'
];

export const COMPETENCY_CATEGORIES: CompetencyCategory[] = [
  'HSE & Compliance',
  'Technical',
  'Leadership & Management',
  'Core & Culture',
  'Digital & Data'
];

export const EDU_RANKS: Record<EducationLevel, number> = {
  'SMA': 1,
  'D3': 2,
  'S1': 3,
  'S2': 4,
  'S3': 5
};

export const computeNineBoxGrid = (
  perf: 'Low' | 'Medium' | 'High', 
  pot: 'Low' | 'Medium' | 'High'
): number => {
  if (perf === 'High') {
    if (pot === 'High') return 9;
    if (pot === 'Medium') return 8;
    return 7;
  }
  if (perf === 'Medium') {
    if (pot === 'High') return 6;
    if (pot === 'Medium') return 5;
    return 4;
  }
  if (pot === 'High') return 3;
  if (pot === 'Medium') return 2;
  return 1;
};

// ==========================================================================
// 1. MASTER TRAINING MODULES (MAX 3 SEEDER - PT AMAN KERJA PERTAMBANGAN)
// ==========================================================================
export const INITIAL_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'T01',
    code: 'POP-101',
    name: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan',
    category: 'Compliance & Safety',
    durationHours: 40,
    provider: 'Ditjen Minerba & Pusdiklat ESDM',
    description: 'Sertifikasi kompetensi wajib pengawas teknis tambang sesuai Kepmen ESDM No 1827 K/30/MEM/2018.',
    mandatoryForRoles: ['Director', 'Manager', 'Supervisor']
  },
  {
    id: 'T02',
    code: 'HSE-201',
    name: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu',
    category: 'Compliance & Safety',
    durationHours: 16,
    provider: 'Divisi K3LH PT Aman Kerja',
    description: 'Metodologi identifikasi bahaya, penilaian risiko pit tambang, dan investigasi insiden alat berat.',
    mandatoryForRoles: ['Director', 'Manager', 'Supervisor']
  },
  {
    id: 'T03',
    code: 'LEAD-301',
    name: 'Mining Fleet Optimization & Supervisory Leadership',
    category: 'Leadership',
    durationHours: 24,
    provider: 'Mining Excellence Leadership Institute',
    description: 'Strategi optimasi dispatch dump truck/excavator, efisiensi bahan bakar, dan people management di pit tambang.',
    mandatoryForRoles: ['Director', 'Manager']
  }
];

// ==========================================================================
// 2. MASTER TNA RULES (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_TNA_RULES: Record<string, TNARule> = {
  'Operations_Director': {
    id: 'R01',
    department: 'Operations',
    level: 'Director',
    minEdu: 'S2',
    minTenureYears: 8,
    requiredTrainingIds: ['T01', 'T02', 'T03']
  },
  'Operations_Manager': {
    id: 'R02',
    department: 'Operations',
    level: 'Manager',
    minEdu: 'S1',
    minTenureYears: 4,
    requiredTrainingIds: ['T01', 'T02', 'T03']
  },
  'Engineering_Supervisor': {
    id: 'R03',
    department: 'Engineering',
    level: 'Supervisor',
    minEdu: 'D3',
    minTenureYears: 2,
    requiredTrainingIds: ['T01', 'T02']
  }
};

// ==========================================================================
// 3. 9-BOX MATRIX DEFINITIONS (FRAMEWORK STANDAR)
// ==========================================================================
export const NINE_BOX_DEFINITIONS: Record<number, NineBoxInfo> = {
  1: {
    box: 1,
    title: '1. Risk / Bad Hire (Low Perf, Low Pot)',
    perf: 'Low',
    pot: 'Low',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50 hover:bg-rose-100',
    border: 'border-rose-200',
    textBadge: 'bg-rose-100 text-rose-800',
    strategicDescription: 'Karyawan dengan performa dan potensi di bawah standar. Perlu evaluasi struktural segera.',
    recommendedActions: [
      'Jalankan Program Peningkatan Kinerja (PIP) 60-90 hari dengan KPI terukur.',
      'Lakukan reassessment kesesuaian tugas atau pertimbangkan relokasi tugas operasional sederhana.',
      'Jika tidak ada perbaikan, inisiasi proses transisi/offboarding sesuai regulasi.'
    ]
  },
  2: {
    box: 2,
    title: '2. Dilemma / Inconsistent (Low Perf, Med Pot)',
    perf: 'Low',
    pot: 'Medium',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-200',
    textBadge: 'bg-amber-100 text-amber-800',
    strategicDescription: 'Memiliki kapabilitas potensial namun output kinerja belum konsisten di lapangan.',
    recommendedActions: [
      'Identifikasi akar masalah penurunan kinerja (tools, lingkungan tambang, atau target).',
      'Pasangkan dengan mentor senior untuk transfer best practice operasional.',
      'Review target kerja mingguan untuk membangun konsistensi kinerja.'
    ]
  },
  3: {
    box: 3,
    title: '3. Enigma / Rough Diamond (Low Perf, High Pot)',
    perf: 'Low',
    pot: 'High',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-200',
    textBadge: 'bg-purple-100 text-purple-800',
    strategicDescription: 'Karyawan berbakat tinggi yang underperform. Seringkali mengalami mismatch peran atau kebosanan.',
    recommendedActions: [
      'Lakukan sesi one-on-one mendalam dari pimpinan untuk mengeksplorasi penugasan baru.',
      'Rotasikan ke proyek penambangan baru yang membutuhkan inovasi teknis.',
      'Berikan penugasan khusus berbasis riset geologi atau otomatisasi pit.'
    ]
  },
  4: {
    box: 4,
    title: '4. Effective / Solid Worker (Med Perf, Low Pot)',
    perf: 'Medium',
    pot: 'Low',
    color: 'text-slate-700',
    bgLight: 'bg-slate-50 hover:bg-slate-100',
    border: 'border-slate-200',
    textBadge: 'bg-slate-100 text-slate-800',
    strategicDescription: 'Pekerja stabil yang menjalankan tugas harian dengan baik namun memiliki limitasi promosi cepat.',
    recommendedActions: [
      'Pertahankan di posisi saat ini dan berikan apresiasi atas stabilitas operasional tambang.',
      'Tingkatkan keahlian teknis spesifik untuk efisiensi pekerjaan rutin pit.',
      'Fokuskan pada sertifikasi kompetensi K3 tingkat pengawas.'
    ]
  },
  5: {
    box: 5,
    title: '5. Core Employee / Backbone (Med Perf, Med Pot)',
    perf: 'Medium',
    pot: 'Medium',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    textBadge: 'bg-blue-100 text-blue-800',
    strategicDescription: 'Tulang punggung operasional tambang yang konsisten, disiplin, dan dapat diandalkan.',
    recommendedActions: [
      'Berikan pengayaan pekerjaan dan pelatihan kompetensi lanjutan (TNA Core).',
      'Dorong partisipasi dalam inisiatif Kaizen / efisiensi fleet hauling.',
      'Siapkan untuk rotasi lateral guna memperluas pemahaman proses penambangan menyeluruh.'
    ]
  },
  6: {
    box: 6,
    title: '6. High Potential (Med Perf, High Pot)',
    perf: 'Medium',
    pot: 'High',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100',
    border: 'border-indigo-200',
    textBadge: 'bg-indigo-100 text-indigo-800',
    strategicDescription: 'Calon pemimpin masa depan yang sedang dalam tahap mematangkan performa operasional lapangan.',
    recommendedActions: [
      'Masukkan ke dalam Fast-Track Talent Pool dan berikan IDP akselerasi suksesi.',
      'Libatkan sebagai Project Lead dalam penanganan project pit baru.',
      'Berikan program Executive Coaching dan Leadership Training tingkat lanjut.'
    ]
  },
  7: {
    box: 7,
    title: '7. Trusted Professional (High Perf, Low Pot)',
    perf: 'High',
    pot: 'Low',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100',
    border: 'border-emerald-200',
    textBadge: 'bg-emerald-100 text-emerald-800',
    strategicDescription: 'Spesialis teknis berkinerja unggul (Subject Matter Expert) di bidang keselamatan & teknik tambang.',
    recommendedActions: [
      'Kembangkan jalur karir spesialis tanpa beban birokrasi struktural.',
      'Jadikan sebagai Internal Trainer dan mentor teknis pengawas lapangan.',
      'Berikan reward kompetitif berbasis keahlian teknis dan pencapaian target produksi/K3.'
    ]
  },
  8: {
    box: 8,
    title: '8. High Performer (High Perf, Med Pot)',
    perf: 'High',
    pot: 'Medium',
    color: 'text-teal-700',
    bgLight: 'bg-teal-50 hover:bg-teal-100',
    border: 'border-teal-200',
    textBadge: 'bg-teal-100 text-teal-800',
    strategicDescription: 'Karyawan andalan dengan pencapaian target kerja konsisten melampaui ekspektasi perusahaan.',
    recommendedActions: [
      'Siapkan sebagai kandidat suksesi lapis pertama untuk posisi satu level di atasnya.',
      'Berikan penugasan strategis dan pendelegasian wewenang yang lebih luas.',
      'Tingkatkan keterlibatan dalam rapat perencanaan tambang strategis bulanan.'
    ]
  },
  9: {
    box: 9,
    title: '9. Star / Future Leader (High Perf, High Pot)',
    perf: 'High',
    pot: 'High',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    textBadge: 'bg-blue-100 text-blue-800',
    strategicDescription: 'Talenta eksekutif terbaik dengan kompetensi teknis dan kepemimpinan luar biasa. Kunci masa depan perusahaan.',
    recommendedActions: [
      'Tempatkan di posisi kepemimpinan kunci (Key Talent / Suksesor Utama).',
      'Libatkan dalam pengambilan keputusan strategis korporat dan komite operasi tambang.',
      'Berikan paket retensi jangka panjang dan program pengembangan eksekutif bertaraf internasional.'
    ]
  }
};

// ==========================================================================
// 4. MASTER EMPLOYEES (MAX 3 SEEDER - PT AMAN KERJA PERTAMBANGAN)
// RELASIONAL INTEGRITY:
// EMP-001 (Direktur) -> Atasan langsung EMP-002
// EMP-002 (Manager)   -> Bawahan EMP-001, Atasan langsung EMP-003
// EMP-003 (Supervisor)-> Bawahan EMP-002
// ==========================================================================
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    nip: 'AK-DIR-001',
    name: 'Ahmad Faqih Didin, S.T., M.T.',
    email: 'ahmad.faqih@amankerja.co.id',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    department: 'Operations',
    jobTitle: 'Direktur Operasional & Kepala Teknik Tambang',
    level: 'Director',
    grade: 'G10',
    education: 'S2',
    tenureYears: 12,
    joinDate: '2014-03-01',
    birthYear: 1984,
    employmentType: 'PKWTT (Permanent)',
    managerName: undefined,
    managerId: undefined,
    directReportsCount: 1,
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxGrid: 9,
    trainings: {
      'T01': { status: 'Completed', score: 96, completedDate: '2022-04-10', certNo: 'POP-ESDM-2022-0941' },
      'T02': { status: 'Completed', score: 98, completedDate: '2023-08-15', certNo: 'HIRADC-AK-2023-001' },
      'T03': { status: 'Completed', score: 95, completedDate: '2024-02-20', certNo: 'MLE-LEAD-2024-012' }
    },
    radar: {
      'K3 & Regulasi Tambang': 98,
      'Fleet & Pit Operations': 94,
      'Strategic Management': 96,
      'Leadership & Coaching': 95,
      'Mine Plan & Engineering': 92
    },
    careerPaths: [
      { year: 2014, title: 'Mining Planning Engineer', department: 'Engineering' },
      { year: 2018, title: 'Mining Operations Manager', department: 'Operations' },
      { year: 2022, title: 'Direktur Operasional & Kepala Teknik Tambang', department: 'Operations' }
    ],
    isKeyTalent: true,
    isSuccessorReady: true,
    notes: 'Pemegang sertifikasi KTT Utama (Kepala Teknik Tambang). Penanggung jawab mutlak keselamatan operasional tambang PT Aman Kerja.'
  },
  {
    id: 'EMP-002',
    nip: 'AK-OPS-002',
    name: 'Joko Prasetyo, S.T.',
    email: 'joko.prasetyo@amankerja.co.id',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    department: 'Operations',
    jobTitle: 'Mining Operations Manager',
    level: 'Manager',
    grade: 'G8',
    education: 'S1',
    tenureYears: 6,
    joinDate: '2020-05-15',
    birthYear: 1989,
    employmentType: 'PKWTT (Permanent)',
    managerName: 'Ahmad Faqih Didin, S.T., M.T.',
    managerId: 'EMP-001',
    directReportsCount: 1,
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxGrid: 9,
    trainings: {
      'T01': { status: 'Completed', score: 92, completedDate: '2021-06-12', certNo: 'POP-ESDM-2021-4821' },
      'T02': { status: 'Completed', score: 90, completedDate: '2023-09-05', certNo: 'HIRADC-AK-2023-018' },
      'T03': { status: 'Completed', score: 88, completedDate: '2024-03-10', certNo: 'MLE-LEAD-2024-045' }
    },
    radar: {
      'K3 & Regulasi Tambang': 92,
      'Fleet & Pit Operations': 91,
      'Strategic Management': 84,
      'Leadership & Coaching': 86,
      'Mine Plan & Engineering': 90
    },
    careerPaths: [
      { year: 2020, title: 'Field Safety Supervisor', department: 'Engineering' },
      { year: 2023, title: 'Mining Operations Manager', department: 'Operations' }
    ],
    isKeyTalent: true,
    isSuccessorReady: true,
    notes: 'Kandidat suksesor lapis pertama untuk posisi Kepala Teknik Tambang / Direktur Operasional. Menguasai manajemen armada 40 unit dump truck.'
  },
  {
    id: 'EMP-003',
    nip: 'AK-HSE-003',
    name: 'Bambang Triyono, A.Md.',
    email: 'bambang.triyono@amankerja.co.id',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    department: 'Engineering',
    jobTitle: 'Field Safety & K3 Mining Supervisor',
    level: 'Supervisor',
    grade: 'G6',
    education: 'D3',
    tenureYears: 3,
    joinDate: '2023-02-10',
    birthYear: 1995,
    employmentType: 'PKWTT (Permanent)',
    managerName: 'Joko Prasetyo, S.T.',
    managerId: 'EMP-002',
    directReportsCount: 0,
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxGrid: 8,
    trainings: {
      'T01': { status: 'Completed', score: 94, completedDate: '2023-04-18', certNo: 'POP-ESDM-2023-1102' },
      'T02': { status: 'Completed', score: 95, completedDate: '2024-01-20', certNo: 'HIRADC-AK-2024-004' }
    },
    radar: {
      'K3 & Regulasi Tambang': 96,
      'Fleet & Pit Operations': 80,
      'Strategic Management': 68,
      'Leadership & Coaching': 72,
      'Mine Plan & Engineering': 85
    },
    careerPaths: [
      { year: 2023, title: 'Field Safety Inspector', department: 'Engineering' },
      { year: 2025, title: 'Field Safety & K3 Mining Supervisor', department: 'Engineering' }
    ],
    isKeyTalent: true,
    isSuccessorReady: false,
    notes: 'Pengawas K3 lapangan dengan catatan zero accident di Pit Alfa selama 18 bulan berturut-turut. Disiapkan untuk suksesi Mining Operations Manager.'
  }
];

// ==========================================================================
// 5. MASTER JOB POSITIONS (MAX 3 SEEDER - HIERARKIS & RELASIONAL)
// ==========================================================================
export const INITIAL_JOB_POSITIONS: JobPosition[] = [
  {
    id: 'POS-001',
    code: 'DIR-OPS-01',
    title: 'Direktur Operasional & Kepala Teknik Tambang',
    department: 'Operations',
    level: 'Director',
    grade: 'G10',
    reportsToPositionId: undefined,
    reportsToTitle: undefined,
    reportsToLevel: undefined,
    targetHeadcount: 1,
    currentFilledCount: 1,
    minEdu: 'S2',
    minTenureYears: 8,
    isCritical: true,
    description: 'Pimpinan tertinggi operasional tambang dan penanggung jawab teknis IUP operasional PT Aman Kerja.'
  },
  {
    id: 'POS-002',
    code: 'MNG-OPS-02',
    title: 'Mining Operations Manager',
    department: 'Operations',
    level: 'Manager',
    grade: 'G8',
    reportsToPositionId: 'POS-001',
    reportsToTitle: 'Direktur Operasional & Kepala Teknik Tambang',
    reportsToLevel: 'Director',
    targetHeadcount: 1,
    currentFilledCount: 1,
    minEdu: 'S1',
    minTenureYears: 4,
    isCritical: true,
    description: 'Bertanggung jawab atas pencapaian target produksi batubara/mineral dan efisiensi armada alat berat pit tambang.'
  },
  {
    id: 'POS-003',
    code: 'SPV-HSE-03',
    title: 'Field Safety & K3 Mining Supervisor',
    department: 'Engineering',
    level: 'Supervisor',
    grade: 'G6',
    reportsToPositionId: 'POS-002',
    reportsToTitle: 'Mining Operations Manager',
    reportsToLevel: 'Manager',
    targetHeadcount: 1,
    currentFilledCount: 1,
    minEdu: 'D3',
    minTenureYears: 2,
    isCritical: true,
    description: 'Memimpin inspeksi K3 harian, audit HIRADC, dan kepatuhan keselamatan kerja seluruh pekerja tambang.'
  }
];

// ==========================================================================
// 6. MASTER CRITICAL POSITIONS & SUCCESSION (MAX 3 SEEDER)
// ==========================================================================
export const CRITICAL_POSITIONS: CriticalPosition[] = [
  {
    id: 'CP01',
    title: 'Direktur Operasional & Kepala Teknik Tambang',
    department: 'Operations',
    currentHolder: 'Ahmad Faqih Didin, S.T., M.T.',
    currentHolderId: 'EMP-001',
    riskLevel: 'High',
    businessImpact: 'Kekosongan posisi menghentikan izin operasional IUP tambang dari Ditjen Minerba ESDM.',
    retirementYearsRemaining: 15,
    successors: [
      {
        employeeId: 'EMP-002',
        name: 'Joko Prasetyo, S.T.',
        readiness: 'Ready in 1 Year',
        currentRole: 'Mining Operations Manager',
        matchScore: 89
      }
    ]
  },
  {
    id: 'CP02',
    title: 'Mining Operations Manager',
    department: 'Operations',
    currentHolder: 'Joko Prasetyo, S.T.',
    currentHolderId: 'EMP-002',
    riskLevel: 'Medium',
    businessImpact: 'Gangguan langsung pada ritme produksi pit dan potensi penurunan output hauling harian 30%.',
    retirementYearsRemaining: 20,
    successors: [
      {
        employeeId: 'EMP-003',
        name: 'Bambang Triyono, A.Md.',
        readiness: 'Ready in 2-3 Years',
        currentRole: 'Field Safety & K3 Mining Supervisor',
        matchScore: 78
      }
    ]
  },
  {
    id: 'CP03',
    title: 'Field Safety & K3 Mining Supervisor',
    department: 'Engineering',
    currentHolder: 'Bambang Triyono, A.Md.',
    currentHolderId: 'EMP-003',
    riskLevel: 'Low',
    businessImpact: 'Penurunan intensitas patroli K3 dan mitigasi potensi insiden alat berat di area pit tambang.',
    retirementYearsRemaining: 25,
    successors: []
  }
];

// ==========================================================================
// 7. MANPOWER PLANNING (MPP) (MAX 3 DEPARTMENTS)
// ==========================================================================
export const INITIAL_MPP_DATA: ManpowerDeptPlan[] = [
  {
    department: 'Operations',
    currentHeadcount: 2,
    projectedTurnover: 0,
    projectedRetirements: 0,
    projectedSupply: 2,
    requiredDemand: 3,
    gap: -1,
    interventions: {
      promotionsInternal: 1,
      externalHires: 0,
      contractExtensions: 0,
      upskillingPrograms: 1
    },
    estimatedBudgetMillionIDR: 450
  },
  {
    department: 'Engineering',
    currentHeadcount: 1,
    projectedTurnover: 0,
    projectedRetirements: 0,
    projectedSupply: 1,
    requiredDemand: 2,
    gap: -1,
    interventions: {
      promotionsInternal: 0,
      externalHires: 1,
      contractExtensions: 0,
      upskillingPrograms: 1
    },
    estimatedBudgetMillionIDR: 280
  },
  {
    department: 'Human Resources',
    currentHeadcount: 0,
    projectedTurnover: 0,
    projectedRetirements: 0,
    projectedSupply: 0,
    requiredDemand: 1,
    gap: -1,
    interventions: {
      promotionsInternal: 0,
      externalHires: 1,
      contractExtensions: 0,
      upskillingPrograms: 0
    },
    estimatedBudgetMillionIDR: 150
  }
];

// ==========================================================================
// 8. MASTER COMPETENCY FRAMEWORK (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_COMPETENCIES: CompetencyItem[] = [
  {
    id: 'CMP-01',
    code: 'CORE-K3-01',
    name: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)',
    category: 'HSE & Compliance',
    description: 'Penguasaan regulasi keselamatan pertambangan minerba, kepatuhan AMDAL/RKL-RPL, dan HIRADC.',
    levels: {
      1: { level: 1, name: 'Awareness', behaviorIndicators: ['Mengetahui rambu K3 dasar tambang dan APD wajib.'], recommendedTrainingIds: ['T02'] },
      2: { level: 2, name: 'Basic', behaviorIndicators: ['Mampu melakukan safety briefing P5M sebelum shift dimulai.'], recommendedTrainingIds: ['T02'] },
      3: { level: 3, name: 'Competent', behaviorIndicators: ['Mampu memimpin investigasi kecelakaan dan audit K3 berkala.'], recommendedTrainingIds: ['T01', 'T02'] },
      4: { level: 4, name: 'Advanced', behaviorIndicators: ['Menyusun SOP K3LH tambang dan mengaudit kepatuhan kontraktor.'], recommendedTrainingIds: ['T01', 'T02'] },
      5: { level: 5, name: 'Expert', behaviorIndicators: ['Bertindak sebagai penanggung jawab KTT mutlak di hadapan inspektur tambang ESDM.'], recommendedTrainingIds: ['T01', 'T02', 'T03'] }
    }
  },
  {
    id: 'CMP-02',
    code: 'TECH-OPS-02',
    name: 'Optimasi Armada Alat Berat & Mine Production Dispatch',
    category: 'Technical',
    description: 'Keahlian teknis pengaturan antrean hauling, rasio kupas overburden (SR), dan efisiensi bahan bakar pit.',
    levels: {
      1: { level: 1, name: 'Awareness', behaviorIndicators: ['Memahami jenis alat berat excavator, dump truck, dan dozer.'], recommendedTrainingIds: ['T03'] },
      2: { level: 2, name: 'Basic', behaviorIndicators: ['Mampu mencatat ritase hauling dan memantau loading point.'], recommendedTrainingIds: ['T03'] },
      3: { level: 3, name: 'Competent', behaviorIndicators: ['Mengatur alokasi unit untuk mencapai target shift produksi.'], recommendedTrainingIds: ['T03'] },
      4: { level: 4, name: 'Advanced', behaviorIndicators: ['Menganalisis bottleneck siklus hauling dan optimasi antrean fleet.'], recommendedTrainingIds: ['T03'] },
      5: { level: 5, name: 'Expert', behaviorIndicators: ['Merancang strategi penambangan terintegrasi dengan biaya terendah per ton (Cost/Ton).'], recommendedTrainingIds: ['T03'] }
    }
  },
  {
    id: 'CMP-03',
    code: 'LEAD-MNG-03',
    name: 'Kepemimpinan Operasional & Manajemen Krisis Tambang',
    category: 'Leadership & Management',
    description: 'Kemampuan memimpin ribuan personil pit, coaching supervisor, dan menangani kondisi darurat tanggap bencana.',
    levels: {
      1: { level: 1, name: 'Awareness', behaviorIndicators: ['Mampu berkomunikasi dengan jelas melalui radio rig pit.'], recommendedTrainingIds: ['T03'] },
      2: { level: 2, name: 'Basic', behaviorIndicators: ['Mampu mengarahkan regu kerja untuk bekerja tepat waktu dan disiplin.'], recommendedTrainingIds: ['T03'] },
      3: { level: 3, name: 'Competent', behaviorIndicators: ['Melakukan pembinaan performa berkala kepada staf lapangan.'], recommendedTrainingIds: ['T03'] },
      4: { level: 4, name: 'Advanced', behaviorIndicators: ['Memimpin koordinasi tanggap darurat (ERT) dan resolusi konflik operasional.'], recommendedTrainingIds: ['T03'] },
      5: { level: 5, name: 'Expert', behaviorIndicators: ['Membangun budaya zero harm keselamatan tambang di seluruh jajaran organisasi.'], recommendedTrainingIds: ['T01', 'T03'] }
    }
  }
];

// ==========================================================================
// 9. POSITION COMPETENCY REQUIREMENTS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_POSITION_COMPETENCIES: PositionCompetencyRequirement[] = [
  {
    id: 'PCR-01',
    positionId: 'POS-001',
    positionTitle: 'Direktur Operasional & Kepala Teknik Tambang',
    department: 'Operations',
    jobLevel: 'Director',
    requirements: [
      { competencyId: 'CMP-01', competencyName: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 5, isMandatory: true, weight: 40 },
      { competencyId: 'CMP-02', competencyName: 'Optimasi Armada Alat Berat & Mine Production Dispatch', requiredLevel: 5, isMandatory: true, weight: 30 },
      { competencyId: 'CMP-03', competencyName: 'Kepemimpinan Operasional & Manajemen Krisis Tambang', requiredLevel: 5, isMandatory: true, weight: 30 }
    ]
  },
  {
    id: 'PCR-02',
    positionId: 'POS-002',
    positionTitle: 'Mining Operations Manager',
    department: 'Operations',
    jobLevel: 'Manager',
    requirements: [
      { competencyId: 'CMP-01', competencyName: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 4, isMandatory: true, weight: 35 },
      { competencyId: 'CMP-02', competencyName: 'Optimasi Armada Alat Berat & Mine Production Dispatch', requiredLevel: 4, isMandatory: true, weight: 40 },
      { competencyId: 'CMP-03', competencyName: 'Kepemimpinan Operasional & Manajemen Krisis Tambang', requiredLevel: 3, isMandatory: true, weight: 25 }
    ]
  },
  {
    id: 'PCR-03',
    positionId: 'POS-003',
    positionTitle: 'Field Safety & K3 Mining Supervisor',
    department: 'Engineering',
    jobLevel: 'Supervisor',
    requirements: [
      { competencyId: 'CMP-01', competencyName: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 4, isMandatory: true, weight: 50 },
      { competencyId: 'CMP-02', competencyName: 'Optimasi Armada Alat Berat & Mine Production Dispatch', requiredLevel: 2, isMandatory: false, weight: 25 },
      { competencyId: 'CMP-03', competencyName: 'Kepemimpinan Operasional & Manajemen Krisis Tambang', requiredLevel: 2, isMandatory: true, weight: 25 }
    ]
  }
];

// ==========================================================================
// 10. WORKFORCE MOVEMENTS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_WORKFORCE_MOVEMENTS: WorkforceMovement[] = [
  {
    id: 'MOV-001',
    employeeId: 'EMP-001',
    employeeName: 'Ahmad Faqih Didin, S.T., M.T.',
    type: 'Promotion',
    fromPosition: 'Mining Operations Manager',
    toPosition: 'Direktur Operasional & Kepala Teknik Tambang',
    fromDepartment: 'Operations',
    toDepartment: 'Operations',
    fromGrade: 'G8',
    toGrade: 'G10',
    effectiveDate: '2022-03-01',
    skNumber: 'SK/DIR-AK/2022/001',
    reason: 'Pengangkatan Direktur Operasional & Pengesahan KTT resmi oleh Kementerian ESDM.',
    approvedBy: 'Dewan Komisaris PT Aman Kerja',
    status: 'Executed'
  },
  {
    id: 'MOV-002',
    employeeId: 'EMP-002',
    employeeName: 'Joko Prasetyo, S.T.',
    type: 'Promotion',
    fromPosition: 'Field Safety Supervisor',
    toPosition: 'Mining Operations Manager',
    fromDepartment: 'Engineering',
    toDepartment: 'Operations',
    fromGrade: 'G6',
    toGrade: 'G8',
    effectiveDate: '2023-05-15',
    skNumber: 'SK/DIR-AK/2023/014',
    reason: 'Promosi suksesi manajerial operasional tambang.',
    approvedBy: 'Ahmad Faqih Didin, S.T., M.T.',
    status: 'Executed'
  },
  {
    id: 'MOV-003',
    employeeId: 'EMP-003',
    employeeName: 'Bambang Triyono, A.Md.',
    type: 'Promotion',
    fromPosition: 'Field Safety Inspector',
    toPosition: 'Field Safety & K3 Mining Supervisor',
    fromDepartment: 'Engineering',
    toDepartment: 'Engineering',
    fromGrade: 'G5',
    toGrade: 'G6',
    effectiveDate: '2025-01-10',
    skNumber: 'SK/DIR-AK/2025/008',
    reason: 'Prestasi zero accident dan keberhasilan sertifikasi POP.',
    approvedBy: 'Ahmad Faqih Didin, S.T., M.T.',
    status: 'Executed'
  }
];

// ==========================================================================
// 11. ANNUAL TRAINING PLANS (ATP) (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_ANNUAL_TRAINING_PLANS: AnnualTrainingPlanItem[] = [
  {
    id: 'ATP-01',
    moduleCode: 'POP-101',
    moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan',
    category: 'Compliance & Safety',
    department: 'Operations',
    plannedMonth: 'April',
    targetParticipants: 3,
    actualParticipants: 3,
    estimatedBudgetMillionIDR: 45,
    actualCostMillionIDR: 42,
    status: 'Completed',
    trainerId: 'TR-01',
    trainerName: 'Ir. Bambang Soeprapto, IPU'
  },
  {
    id: 'ATP-02',
    moduleCode: 'HSE-201',
    moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu',
    category: 'Compliance & Safety',
    department: 'Engineering',
    plannedMonth: 'Agustus',
    targetParticipants: 3,
    actualParticipants: 3,
    estimatedBudgetMillionIDR: 25,
    actualCostMillionIDR: 22,
    status: 'Completed',
    trainerId: 'TR-01',
    trainerName: 'Ir. Bambang Soeprapto, IPU'
  },
  {
    id: 'ATP-03',
    moduleCode: 'LEAD-301',
    moduleName: 'Mining Fleet Optimization & Supervisory Leadership',
    category: 'Leadership',
    department: 'Operations',
    plannedMonth: 'Oktober',
    targetParticipants: 2,
    actualParticipants: 0,
    estimatedBudgetMillionIDR: 30,
    status: 'Approved',
    trainerId: 'TR-02',
    trainerName: 'Dr. Hendra Gunawan, S.T., M.T.'
  }
];

// ==========================================================================
// 12. MASTER TRAINERS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'TR-01',
    name: 'Ir. Bambang Soeprapto, IPU',
    organization: 'Pusdiklat Ditjen Minerba ESDM',
    type: 'External',
    email: 'bambang.soeprapto@minerba-trainer.go.id',
    phone: '0811-8899-2211',
    specializations: ['POP Pertambangan', 'Audit K3 Tambang', 'Investigasi Kecelakaan'],
    rating: 4.9,
    ratePerDayMillionIDR: 12
  },
  {
    id: 'TR-02',
    name: 'Dr. Hendra Gunawan, S.T., M.T.',
    organization: 'Mining Excellence Institute',
    type: 'External',
    email: 'hendra.gunawan@mining-excellence.id',
    phone: '0812-4455-6677',
    specializations: ['Fleet Optimization', 'Mine Planning', 'Cost Efficiency'],
    rating: 4.8,
    ratePerDayMillionIDR: 15
  },
  {
    id: 'TR-03',
    name: 'Ahmad Faqih Didin, S.T., M.T.',
    organization: 'PT Aman Kerja (Internal KTT)',
    type: 'Internal',
    email: 'ahmad.faqih@amankerja.co.id',
    phone: '0813-1122-3344',
    specializations: ['Executive Leadership', 'KTT Mentoring', 'Crisis Management'],
    rating: 5.0,
    ratePerDayMillionIDR: 0
  }
];

// ==========================================================================
// 13. MASTER TRAINING EVENTS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_TRAINING_EVENTS: TrainingEvent[] = [
  {
    id: 'EVT-01',
    moduleId: 'T01',
    moduleCode: 'POP-101',
    moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan',
    batchNumber: 1,
    trainerId: 'TR-01',
    trainerName: 'Ir. Bambang Soeprapto, IPU',
    startDate: '2026-04-10',
    endDate: '2026-04-14',
    location: 'Mining Learning Center Hall A',
    maxParticipants: 10,
    attendees: [
      { employeeId: 'EMP-002', name: 'Joko Prasetyo, S.T.', status: 'Enrolled' },
      { employeeId: 'EMP-003', name: 'Bambang Triyono, A.Md.', status: 'Enrolled' }
    ],
    status: 'Upcoming'
  },
  {
    id: 'EVT-02',
    moduleId: 'T02',
    moduleCode: 'HSE-201',
    moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu',
    batchNumber: 1,
    trainerId: 'TR-01',
    trainerName: 'Ir. Bambang Soeprapto, IPU',
    startDate: '2026-02-15',
    endDate: '2026-02-16',
    location: 'Pit Alfa Safety Training Center',
    maxParticipants: 15,
    attendees: [
      { employeeId: 'EMP-001', name: 'Ahmad Faqih Didin, S.T., M.T.', status: 'Passed', postTestScore: 98, certNo: 'HIRADC-AK-2026-001' },
      { employeeId: 'EMP-002', name: 'Joko Prasetyo, S.T.', status: 'Passed', postTestScore: 94, certNo: 'HIRADC-AK-2026-002' },
      { employeeId: 'EMP-003', name: 'Bambang Triyono, A.Md.', status: 'Passed', postTestScore: 96, certNo: 'HIRADC-AK-2026-003' }
    ],
    status: 'Completed'
  },
  {
    id: 'EVT-03',
    moduleId: 'T03',
    moduleCode: 'LEAD-301',
    moduleName: 'Mining Fleet Optimization & Supervisory Leadership',
    batchNumber: 1,
    trainerId: 'TR-02',
    trainerName: 'Dr. Hendra Gunawan, S.T., M.T.',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    location: 'Executive Boardroom Tambang',
    maxParticipants: 5,
    attendees: [
      { employeeId: 'EMP-002', name: 'Joko Prasetyo, S.T.', status: 'Enrolled' }
    ],
    status: 'Upcoming'
  }
];

// ==========================================================================
// 14. MASTER TRAINING REMINDERS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_TRAINING_REMINDERS: TrainingReminder[] = [
  {
    id: 'REM-01',
    employeeId: 'EMP-002',
    employeeName: 'Joko Prasetyo, S.T.',
    moduleId: 'T03',
    moduleName: 'Mining Fleet Optimization & Supervisory Leadership',
    dueDate: '2026-10-01',
    status: 'Pending',
    createdAt: '2026-08-01'
  },
  {
    id: 'REM-02',
    employeeId: 'EMP-003',
    employeeName: 'Bambang Triyono, A.Md.',
    moduleId: 'T01',
    moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan',
    dueDate: '2026-04-01',
    status: 'Sent',
    createdAt: '2026-03-01'
  },
  {
    id: 'REM-03',
    employeeId: 'EMP-001',
    employeeName: 'Ahmad Faqih Didin, S.T., M.T.',
    moduleId: 'T02',
    moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu',
    dueDate: '2026-02-01',
    status: 'Completed',
    createdAt: '2026-01-15'
  }
];

// ==========================================================================
// 15. DETAILED INDIVIDUAL DEVELOPMENT PLANS (IDP 70:20:10) (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_DETAILED_IDPS: DetailedIDP[] = [
  {
    id: 'IDP-EMP-001',
    employeeId: 'EMP-001',
    employeeName: 'Ahmad Faqih Didin, S.T., M.T.',
    targetPosition: 'Board of Directors / Mining Group COO',
    periodYear: 2026,
    strategicFocus: 'Ekspansi konsesi tambang baru dan transformasi pit berbasis zero-emission fleet.',
    experience70: [
      {
        id: 'T70-01',
        title: 'Memimpin Audit Komprehensif KTT di 3 Wilayah IUP Tambang',
        category: 'Project Leadership',
        targetDate: '2026-11-30',
        successMetric: 'Zero fatal incident dan diterbitkannya izin perpanjangan RKAB tepat waktu.',
        status: 'In Progress'
      }
    ],
    exposure20: [
      {
        id: 'T20-01',
        title: 'Executive Strategic Coaching dengan Board of Commissioners',
        category: 'Mentoring',
        targetDate: '2026-12-15',
        mentorName: 'Komisaris Utama PT Aman Kerja',
        status: 'In Progress'
      }
    ],
    education10: [
      {
        id: 'T10-01',
        title: 'Advanced Global Mining Executive Program',
        category: 'Certification',
        targetDate: '2026-10-20',
        provider: 'Australasian Institute of Mining and Metallurgy',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'IDP-EMP-002',
    employeeId: 'EMP-002',
    employeeName: 'Joko Prasetyo, S.T.',
    targetPosition: 'Direktur Operasional & Kepala Teknik Tambang (KTT)',
    periodYear: 2026,
    strategicFocus: 'Penguasaan regulasi teknis KTT Minerba dan efisiensi rasio operasional tambang.',
    experience70: [
      {
        id: 'T70-02',
        title: 'Pendelegasian Pj KTT Harian Pit Alfa & Pit Bravo',
        category: 'Job Enrichment',
        targetDate: '2026-09-30',
        successMetric: 'Pencapaian target produksi bulanan 100% dan zero stop work order.',
        status: 'In Progress'
      }
    ],
    exposure20: [
      {
        id: 'T20-02',
        title: 'Mentoring Intensif Suksesi KTT bersama Ahmad Faqih Didin',
        category: 'Mentoring',
        targetDate: '2026-12-31',
        mentorName: 'Ahmad Faqih Didin, S.T., M.T.',
        status: 'In Progress'
      }
    ],
    education10: [
      {
        id: 'T10-02',
        title: 'Pelatihan Sertifikasi Pengawas Operasional Utama (POU)',
        category: 'Certification',
        targetDate: '2026-11-15',
        provider: 'Pusdiklat Ditjen Minerba ESDM',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'IDP-EMP-003',
    employeeId: 'EMP-003',
    employeeName: 'Bambang Triyono, A.Md.',
    targetPosition: 'Mining Operations Manager',
    periodYear: 2026,
    strategicFocus: 'Penguatan kompetensi manajemen fleet hauling dan kepemimpinan manajerial.',
    experience70: [
      {
        id: 'T70-03',
        title: 'Rotasi Penugasan Shift Dispatcher & Fleet Optimization Pit',
        category: 'Rotation',
        targetDate: '2026-08-31',
        successMetric: 'Mengurangi waktu tunggu antrean dump truck di loading point sebesar 15%.',
        status: 'Completed'
      }
    ],
    exposure20: [
      {
        id: 'T20-03',
        title: 'Shadowing Operasional Harian bersama Joko Prasetyo',
        category: 'Job Shadowing',
        targetDate: '2026-10-31',
        mentorName: 'Joko Prasetyo, S.T.',
        status: 'In Progress'
      }
    ],
    education10: [
      {
        id: 'T10-03',
        title: 'Training Mining Fleet Optimization & Supervisory Leadership',
        category: 'Internal Training',
        targetDate: '2026-10-07',
        provider: 'Mining Excellence Institute',
        status: 'Pending'
      }
    ]
  }
];

// ==========================================================================
// 16. MASTER CAREER ARCHITECTURE & PROGRESSION LADDER (MAX 3 NODES / TRACK)
// ==========================================================================
export const INITIAL_CAREER_NODES: CareerNode[] = [
  {
    id: 'CN-OPS-01',
    trackId: 'mining-ops-track',
    trackName: 'Mining Operations & Safety Engineering Track (PT Aman Kerja)',
    department: 'Engineering',
    title: 'Field Safety & K3 Mining Supervisor',
    level: 'Supervisor',
    grade: 'G6',
    order: 1,
    educationReq: 'D3',
    minTenureYears: 2,
    requiredCompetencies: [
      { id: 'CMP-01', name: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 3 }
    ],
    requiredTrainings: [
      { moduleId: 'T01', moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan' },
      { moduleId: 'T02', moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu' }
    ],
    leadershipMinScore: 70,
    performanceMinRating: 'High',
    salaryRangeMillionIDR: { min: 12, max: 18 }
  },
  {
    id: 'CN-OPS-02',
    trackId: 'mining-ops-track',
    trackName: 'Mining Operations & Safety Engineering Track (PT Aman Kerja)',
    department: 'Operations',
    title: 'Mining Operations Manager',
    level: 'Manager',
    grade: 'G8',
    order: 2,
    educationReq: 'S1',
    minTenureYears: 5,
    requiredCompetencies: [
      { id: 'CMP-01', name: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 4 },
      { id: 'CMP-02', name: 'Optimasi Armada Alat Berat & Mine Production Dispatch', requiredLevel: 4 }
    ],
    requiredTrainings: [
      { moduleId: 'T01', moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan' },
      { moduleId: 'T02', moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu' },
      { moduleId: 'T03', moduleName: 'Mining Fleet Optimization & Supervisory Leadership' }
    ],
    leadershipMinScore: 85,
    performanceMinRating: 'High',
    salaryRangeMillionIDR: { min: 25, max: 40 }
  },
  {
    id: 'CN-OPS-03',
    trackId: 'mining-ops-track',
    trackName: 'Mining Operations & Safety Engineering Track (PT Aman Kerja)',
    department: 'Operations',
    title: 'Direktur Operasional & Kepala Teknik Tambang',
    level: 'Director',
    grade: 'G10',
    order: 3,
    educationReq: 'S2',
    minTenureYears: 10,
    requiredCompetencies: [
      { id: 'CMP-01', name: 'K3LH & Regulasi Teknis Pertambangan (KTT / POP)', requiredLevel: 5 },
      { id: 'CMP-02', name: 'Optimasi Armada Alat Berat & Mine Production Dispatch', requiredLevel: 5 },
      { id: 'CMP-03', name: 'Kepemimpinan Operasional & Manajemen Krisis Tambang', requiredLevel: 5 }
    ],
    requiredTrainings: [
      { moduleId: 'T01', moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan' },
      { moduleId: 'T02', moduleName: 'Investigasi Kecelakaan Tambang & HIRADC Terpadu' },
      { moduleId: 'T03', moduleName: 'Mining Fleet Optimization & Supervisory Leadership' }
    ],
    leadershipMinScore: 95,
    performanceMinRating: 'High',
    salaryRangeMillionIDR: { min: 50, max: 85 }
  }
];

// ==========================================================================
// 17. WORKFORCE PLANNING (MPP SCENARIOS) (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_MPP_SCENARIOS: MPPScenario[] = [
  {
    id: 'SCN-BASE',
    name: 'BASELINE',
    label: 'Status Quo Tambang 2026 (Target 2.5 Jt Ton)',
    description: 'Kondisi operasional normal dengan 3 jajaran kepemimpinan kunci PT Aman Kerja.',
    totalHeadcount: 3,
    totalCostBillionIDR: 1.8,
    capabilityScore: 94,
    riskScore: 'Low',
    implementationTimeMonths: 0,
    breakdown: {
      recruitCount: 0,
      upskillCount: 0,
      contractCount: 0,
      automationCount: 0
    },
    aiTradeoff: {
      pros: ['Efisiensi biaya maksimal', 'Kepemimpinan KTT sangat solid'],
      cons: ['Defisit 1 suksesor di tingkat engineering'],
      recommendationTag: 'Baseline'
    }
  },
  {
    id: 'SCN-EXPAN',
    name: 'OPTION_A',
    label: 'Ekspansi Pit Bravo 2027 (Target 4.0 Jt Ton)',
    description: 'Penambahan 1 manajer pit baru dan penguatan regu keselamatan kerja.',
    totalHeadcount: 5,
    totalCostBillionIDR: 2.6,
    capabilityScore: 96,
    riskScore: 'Medium',
    implementationTimeMonths: 4,
    breakdown: {
      recruitCount: 2,
      upskillCount: 1,
      contractCount: 0,
      automationCount: 0
    },
    aiTradeoff: {
      pros: ['Kapasitas produksi naik 60%', 'Regu K3 lebih terdistribusi'],
      cons: ['Kenaikan anggaran remunerasi tahunan'],
      recommendationTag: 'Production Expansion'
    }
  },
  {
    id: 'SCN-AUTO',
    name: 'OPTION_B',
    label: 'Otomasi Fleet Dispatch & IoT Pit Tambang',
    description: 'Implementasi telemetri cerdas alat berat untuk menekan risiko insiden dan biaya lembur.',
    totalHeadcount: 4,
    totalCostBillionIDR: 2.1,
    capabilityScore: 98,
    riskScore: 'Low',
    implementationTimeMonths: 6,
    breakdown: {
      recruitCount: 1,
      upskillCount: 2,
      contractCount: 0,
      automationCount: 1
    },
    aiTradeoff: {
      pros: ['Zero blind spot keselamatan K3', 'Efisiensi BBM 12%'],
      cons: ['Investasi awal sensor telemetri'],
      recommendationTag: 'Technology Modernization'
    }
  }
];

// ==========================================================================
// 18. AGENTIC ACTION ITEMS (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_AGENTIC_ACTIONS: AgenticActionItem[] = [
  {
    id: 'ACT-01',
    riskType: 'SUCCESSION RISK',
    severity: 'HIGH',
    title: 'Percepatan Kualifikasi Suksesi KTT untuk Joko Prasetyo',
    description: 'Joko Prasetyo membutuhkan penyelesaian modul POP & Leadership sebelum dipromosikan ke Direktur Operasional / KTT lapis 1.',
    actionButtonLabel: 'Buka Succession Pipeline',
    actionType: 'open_succession',
    status: 'pending'
  },
  {
    id: 'ACT-02',
    riskType: 'CERTIFICATION EXPIRY',
    severity: 'MEDIUM',
    title: 'Jadwal Resertifikasi POP Pertambangan 2026',
    description: 'Pendaftaran batch 1 sertifikasi POP untuk pengawas lapangan di Pusdiklat Ditjen Minerba ESDM.',
    participantsCount: 2,
    estimatedBudgetMillionIDR: 45,
    recommendedDate: 'April 2026',
    actionButtonLabel: 'Jadwalkan di ATP',
    actionType: 'create_atp',
    payload: {
      moduleName: 'Sertifikasi Pengawas Operasional Pertama (POP) Pertambangan',
      department: 'Operations',
      plannedMonth: 'Apr',
      targetParticipants: 2,
      estimatedBudgetMillionIDR: 45
    },
    status: 'pending'
  },
  {
    id: 'ACT-03',
    riskType: 'IDP REVIEW',
    severity: 'LOW',
    title: 'Evaluasi Semesteran IDP Ahmad Faqih & Bambang Triyono',
    description: 'Review pencapaian target 70:20:10 untuk milestone On-the-job project dan mentoring lapangan.',
    actionButtonLabel: 'Buka IDP Engine',
    actionType: 'create_idp',
    status: 'pending'
  }
];

// ==========================================================================
// 19. SYSTEM NOTIFICATIONS CENTER (MAX 3 SEEDER)
// ==========================================================================
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NOTIF-01',
    category: 'mandatory_overdue',
    severity: 'blue',
    title: 'Seluruh Sertifikasi K3 Utama Telah Terpenuhi',
    message: 'Ahmad Faqih, Joko Prasetyo, dan Bambang Triyono telah menyelesaikan modul K3 Tambang 100%.',
    timestamp: '10 menit yang lalu',
    actionLabel: 'Lihat Matriks TNA',
    targetTab: 'competency-tna',
    targetSubTab: 'gap-matrix',
    isRead: false
  },
  {
    id: 'NOTIF-02',
    category: 'cert_expiring',
    severity: 'yellow',
    title: 'Batch POP Minerba Dimulai Bulan Depan',
    message: 'Konfirmasi pendaftaran peserta Joko Prasetyo dan Bambang Triyono di Pusdiklat ESDM.',
    timestamp: '1 jam yang lalu',
    actionLabel: 'Buka Batch Pelatihan',
    targetTab: 'learning-training',
    targetSubTab: 'batches',
    isRead: false
  },
  {
    id: 'NOTIF-03',
    category: 'idp_due',
    severity: 'yellow',
    title: 'Review IDP Suksesi KTT Terjadwal',
    message: 'Evaluasi progress mentoring 70:20:10 antara Direktur Ahmad Faqih dan Joko Prasetyo.',
    timestamp: 'Kemarin',
    actionLabel: 'Review IDP',
    targetTab: 'performance-dev',
    targetSubTab: 'idp',
    isRead: false
  }
];
