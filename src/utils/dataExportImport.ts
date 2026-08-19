import * as XLSX from 'xlsx';
import { 
  Employee, 
  TrainingModule, 
  TNARule, 
  CriticalPosition, 
  ManpowerDeptPlan, 
  TrainingStatusType,
  Department,
  JobLevel,
  EducationLevel,
  EmploymentType,
  TrainingCategory,
  CompetencyItem,
  AnnualTrainingPlanItem,
  WorkforceMovement
} from '../types';
import { 
  DEPARTMENTS, 
  JOB_LEVELS, 
  EDUCATION_LEVELS, 
  TRAINING_CATEGORIES,
  computeNineBoxGrid 
} from '../data/mockData';

export type ExportImportEntity = 
  | 'all'
  | 'employees'
  | 'training_modules'
  | 'training_matrix'
  | 'tna_rules'
  | 'ninebox'
  | 'mpp'
  | 'critical_positions'
  | 'competencies'
  | 'annual_training_plan'
  | 'workforce_movements';

export type ExportFormat = 'xlsx' | 'csv' | 'json';

export interface FullDatabaseBackup {
  version: string;
  exportDate: string;
  system: string;
  data: {
    employees: Employee[];
    trainingModules: TrainingModule[];
    tnaRules: Record<string, TNARule>;
    criticalPositions: CriticalPosition[];
    mppData: ManpowerDeptPlan[];
  };
}

export interface ImportPreviewResult<T = any> {
  entityType: ExportImportEntity;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  data: T;
  errors: { row: number; field: string; message: string; rowData?: Record<string, unknown> }[];
  warnings: { row: number; field: string; message: string }[];
  headersDetected: string[];
  previewRows: Array<Record<string, unknown> | object>;
}

// ----------------------------------------------------------------------
// HELPER: FILE DOWNLOADER (Excel, CSV, JSON)
// ----------------------------------------------------------------------

function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadWorkbook(workbook: XLSX.WorkBook, filename: string, format: ExportFormat) {
  if (format === 'csv') {
    const firstSheetName = workbook.SheetNames[0];
    const csvContent = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
    // Prepend UTF-8 BOM so Excel opens CSV without encoding issues
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerFileDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
  } else {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerFileDownload(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  }
}

function downloadJson(data: unknown, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  triggerFileDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// ----------------------------------------------------------------------
// 1. DATA EXPORT BUILDERS
// ----------------------------------------------------------------------

/**
 * 1. Data Karyawan (Employees)
 */
export function buildEmployeeExportRows(employees: Employee[]) {
  return employees.map((emp, index) => ({
    'No': index + 1,
    'NIP': emp.nip,
    'Nama Lengkap': emp.name,
    'Email': emp.email,
    'Departemen': emp.department,
    'Jabatan / Posisi': emp.jobTitle,
    'Level Jabatan': emp.level,
    'Grade': emp.grade,
    'Pendidikan Terakhir': emp.education,
    'Masa Kerja (Tahun)': emp.tenureYears,
    'Tanggal Masuk': emp.joinDate,
    'Tahun Kelahiran': emp.birthYear,
    'Status Kerja': emp.employmentType,
    'Tanggal Akhir Kontrak': emp.contractEndDate || '-',
    'Nama Atasan Langsung': emp.managerName || '-',
    'Jumlah Bawahan Langsung': emp.directReportsCount || 0,
    'Rating Kinerja': emp.performanceRating,
    'Rating Potensi': emp.potentialRating,
    'Grid 9-Box': `Box ${emp.nineBoxGrid}`,
    'Key Talent (HiPo)': emp.isKeyTalent ? 'Ya' : 'Tidak',
    'Siap Suksesi': emp.isSuccessorReady ? 'Ya' : 'Tidak',
    'Skor Kinerja (Radar)': emp.radar?.performance ?? 75,
    'Skor Kepemimpinan (Radar)': emp.radar?.leadership ?? 75,
    'Skor Teknis (Radar)': emp.radar?.technical ?? 75,
    'Skor Adaptabilitas (Radar)': emp.radar?.adaptability ?? 75,
    'Skor Budaya (Radar)': emp.radar?.cultureFit ?? 75,
    'Catatan Khusus': emp.notes || ''
  }));
}

/**
 * 2. Katalog Modul Pelatihan (Training Modules)
 */
export function buildTrainingModuleExportRows(modules: TrainingModule[]) {
  return modules.map((m, index) => ({
    'No': index + 1,
    'Kode Modul': m.code,
    'Nama Modul Pelatihan': m.name,
    'Kategori': m.category,
    'Durasi (Jam)': m.durationHours,
    'Lembaga / Provider': m.provider,
    'Deskripsi & Target Kompetensi': m.description,
    'Mandatori Untuk Posisi': (m.mandatoryForRoles || []).join(', ')
  }));
}

/**
 * 3. Matriks Pelatihan & Catatan Nilai (Training Matrix & Records)
 */
export function buildTrainingMatrixExportRows(
  employees: Employee[], 
  modules: TrainingModule[],
  getRuleFor: (dept: Department, level: JobLevel) => TNARule | undefined,
  checkQualification: (emp: Employee) => any
) {
  return employees.map((emp, index) => {
    const rule = getRuleFor(emp.department, emp.level);
    const requiredIds = rule?.requiredTrainingIds || [];
    const qual = checkQualification(emp);

    const row: Record<string, any> = {
      'No': index + 1,
      'NIP': emp.nip,
      'Nama Karyawan': emp.name,
      'Departemen': emp.department,
      'Level': emp.level,
      'Jabatan': emp.jobTitle,
      'Status Kualifikasi TNA': qual.statusText,
      'Total Selesai': `${qual.completedTrainingsCount}/${qual.requiredTrainingsCount}`
    };

    // Columns for each module
    modules.forEach((mod) => {
      const record = emp.trainings[mod.id];
      const isMandatory = requiredIds.includes(mod.id);
      let statusStr = 'BELUM';
      if (record?.status === 'done') {
        statusStr = record.score !== undefined ? `SELESAI (Nilai: ${record.score})` : 'SELESAI';
      } else if (record?.status === 'progress') {
        statusStr = 'SEDANG BERJALAN';
      } else if (isMandatory) {
        statusStr = 'WAJIB (GAP)';
      } else {
        statusStr = 'OPSIONAL';
      }
      row[`[${mod.code}] ${mod.name}`] = statusStr;
    });

    return row;
  });
}

/**
 * 3b. Flat Training Records (Record by Record)
 */
export function buildFlatTrainingRecordsExportRows(employees: Employee[], modules: TrainingModule[]) {
  const rows: any[] = [];
  let no = 1;
  const modMap = new Map(modules.map(m => [m.id, m]));

  employees.forEach((emp) => {
    Object.entries(emp.trainings).forEach(([modId, rec]) => {
      const mod = modMap.get(modId);
      rows.push({
        'No': no++,
        'NIP': emp.nip,
        'Nama Karyawan': emp.name,
        'Departemen': emp.department,
        'Kode Modul': mod?.code || modId,
        'Nama Modul': mod?.name || modId,
        'Kategori': mod?.category || 'Umum',
        'Status': rec.status.toUpperCase(),
        'Nilai Evaluasi': rec.score !== undefined ? rec.score : '',
        'Nomor Sertifikat': rec.certificateNo || '',
        'Tanggal Selesai': rec.completedDate || ''
      });
    });
  });

  return rows;
}

/**
 * 4. Standar Kualifikasi & TNA (TNA Rules)
 */
export function buildTnaRulesExportRows(rules: Record<string, TNARule>, modules: TrainingModule[]) {
  const modMap = new Map(modules.map(m => [m.id, m]));
  return Object.entries(rules).map(([key, r], index) => {
    const moduleCodes = (r.requiredTrainingIds || [])
      .map(id => modMap.get(id)?.code || id)
      .join(', ');
    const moduleNames = (r.requiredTrainingIds || [])
      .map(id => modMap.get(id)?.name || id)
      .join('; ');

    return {
      'No': index + 1,
      'Key': key,
      'Departemen': r.department,
      'Level Jabatan': r.level,
      'Minimal Pendidikan': r.minEdu,
      'Minimal Masa Kerja (Tahun)': r.minTenureYears,
      'Jumlah Modul Wajib': r.requiredTrainingIds?.length || 0,
      'Kode Modul Wajib (Dipisah Koma)': moduleCodes,
      'Daftar Nama Modul Wajib': moduleNames
    };
  });
}

/**
 * 5. Data 9-Box & Kalibrasi Talenta
 */
export function buildNineBoxExportRows(employees: Employee[]) {
  return employees.map((emp, index) => ({
    'No': index + 1,
    'NIP': emp.nip,
    'Nama Karyawan': emp.name,
    'Departemen': emp.department,
    'Jabatan': emp.jobTitle,
    'Level': emp.level,
    'Rating Kinerja': emp.performanceRating,
    'Rating Potensi': emp.potentialRating,
    'Grid 9-Box': `Box ${emp.nineBoxGrid}`,
    'Kategori Talenta': emp.nineBoxGrid === 9 ? 'Star / Future Leader' : emp.nineBoxGrid >= 7 ? 'High Performer' : emp.nineBoxGrid >= 4 ? 'Core / Key Contributor' : 'Underperformer / Risk',
    'Key Talent (HiPo)': emp.isKeyTalent ? 'Ya' : 'Tidak',
    'Siap Menjadi Suksesor': emp.isSuccessorReady ? 'Ya' : 'Tidak',
    'Kompetensi Kinerja': emp.radar?.performance ?? 75,
    'Kompetensi Kepemimpinan': emp.radar?.leadership ?? 75,
    'Kompetensi Teknis': emp.radar?.technical ?? 75,
    'Kompetensi Adaptabilitas': emp.radar?.adaptability ?? 75,
    'Kompetensi Budaya': emp.radar?.cultureFit ?? 75
  }));
}

/**
 * 6. Manpower Planning (MPP)
 */
export function buildMppExportRows(mppData: ManpowerDeptPlan[]) {
  return mppData.map((plan, index) => ({
    'No': index + 1,
    'Departemen': plan.department,
    'Headcount Eksisting': plan.currentHeadcount,
    'Proyeksi Turnover': plan.projectedTurnover,
    'Proyeksi Pensiun': plan.projectedRetirements,
    'Proyeksi Supply (Net)': plan.projectedSupply,
    'Target Demand (Kebutuhan)': plan.requiredDemand,
    'Kesenjangan (Gap)': plan.gap,
    'Pilar 1: Rekrutmen Eksternal': plan.interventions.recruitmentCount,
    'Pilar 2: Mobilitas Internal': plan.interventions.internalMobilityCount,
    'Pilar 3: Upskilling & TNA': plan.interventions.upskillingCount,
    'Pilar 4: Otomasi & Efisiensi': plan.interventions.automationEfficiencyCount,
    'Total Alokasi Intervensi': 
      plan.interventions.recruitmentCount + 
      plan.interventions.internalMobilityCount + 
      plan.interventions.upskillingCount + 
      plan.interventions.automationEfficiencyCount,
    'Estimasi Budget (Juta IDR)': plan.estimatedBudgetMillionIDR
  }));
}

/**
 * 7. Posisi Kritis & Suksesor (Critical Positions)
 */
export function buildCriticalPositionsExportRows(positions: CriticalPosition[]) {
  return positions.map((pos, index) => {
    const succReadyNow = pos.successors.filter(s => s.readiness === 'Ready Now').map(s => `${s.name} (${s.fitScore}%)`).join(', ') || '-';
    const succ1Year = pos.successors.filter(s => s.readiness === 'Ready in 1 Year').map(s => `${s.name} (${s.fitScore}%)`).join(', ') || '-';
    const succ23Years = pos.successors.filter(s => s.readiness === 'Ready in 2-3 Years').map(s => `${s.name} (${s.fitScore}%)`).join(', ') || '-';

    return {
      'No': index + 1,
      'ID Posisi': pos.id,
      'Nama Posisi Kritis': pos.title,
      'Departemen': pos.department,
      'Pemegang Saat Ini': pos.currentHolder,
      'Tingkat Risiko': pos.riskLevel,
      'Sisa Tahun Pensiun': pos.retirementYearsRemaining,
      'Dampak Bisnis': pos.businessImpact,
      'Jumlah Suksesor': pos.successors.length,
      'Suksesor Ready Now': succReadyNow,
      'Suksesor Ready 1 Tahun': succ1Year,
      'Suksesor Ready 2-3 Tahun': succ23Years
    };
  });
}

/**
 * 8. Kamus Kompetensi (Competency Dictionary)
 */
export function buildCompetenciesExportRows(competencies: CompetencyItem[]) {
  return competencies.map((c, index) => ({
    'No': index + 1,
    'Kode Kompetensi': c.code,
    'Nama Kompetensi': c.name,
    'Kategori': c.category,
    'Deskripsi': c.description,
    'Indikator Level 1': (c.levels?.[1]?.behaviorIndicators || []).join('; '),
    'Indikator Level 2': (c.levels?.[2]?.behaviorIndicators || []).join('; '),
    'Indikator Level 3': (c.levels?.[3]?.behaviorIndicators || []).join('; '),
    'Indikator Level 4': (c.levels?.[4]?.behaviorIndicators || []).join('; '),
    'Indikator Level 5': (c.levels?.[5]?.behaviorIndicators || []).join('; ')
  }));
}

/**
 * 9. Annual Training Plan (ATP)
 */
export function buildAnnualTrainingPlanExportRows(plans: AnnualTrainingPlanItem[]) {
  return plans.map((p, index) => ({
    'No': index + 1,
    'ID Program': p.id,
    'Tahun': p.year,
    'Kode Modul': p.moduleId,
    'Nama Pelatihan': p.moduleName,
    'Kategori': p.category,
    'Departemen Target': p.department,
    'Bulan Pelaksanaan': p.plannedMonth,
    'Target Peserta': p.targetParticipantsCount,
    'Estimasi Budget (Jt IDR)': p.estimatedBudgetMillionIDR,
    'Status Lifecycle': p.status,
    'Instruktur / Vendor': p.trainerName || ''
  }));
}

/**
 * 10. Log Pergerakan Karyawan (Workforce Movements)
 */
export function buildWorkforceMovementsExportRows(movements: WorkforceMovement[]) {
  return movements.map((m, index) => ({
    'No': index + 1,
    'ID Log': m.id,
    'ID Karyawan': m.employeeId,
    'Nama Karyawan': m.employeeName,
    'Tipe Pergerakan': m.type,
    'Tanggal Efektif': m.effectiveDate,
    'No Surat Keputusan (SK)': m.skNumber || '',
    'Jabatan Asal': m.fromPosition,
    'Departemen Asal': m.fromDepartment,
    'Grade Asal': m.fromGrade || '',
    'Jabatan Baru': m.toPosition,
    'Departemen Baru': m.toDepartment,
    'Grade Baru': m.toGrade || '',
    'Status': m.status,
    'Alasan / Justifikasi': m.reason || '',
    'Disetujui Oleh': m.approvedBy || ''
  }));
}

// ----------------------------------------------------------------------
// 2. MAIN EXPORT FUNCTION (EXCEL / CSV / JSON)
// ----------------------------------------------------------------------

export function exportDataset(
  entity: ExportImportEntity,
  format: ExportFormat,
  contextData: {
    employees: Employee[];
    trainingModules: TrainingModule[];
    tnaRules: Record<string, TNARule>;
    criticalPositions: CriticalPosition[];
    mppData: ManpowerDeptPlan[];
    competencies?: CompetencyItem[];
    annualTrainingPlans?: AnnualTrainingPlanItem[];
    movements?: WorkforceMovement[];
    getRuleFor: (dept: Department, level: JobLevel) => TNARule | undefined;
    checkQualification: (emp: Employee) => any;
  },
  customFilteredData?: any[]
) {
  const timestamp = formatTimestamp();
  const wb = XLSX.utils.book_new();

  if (entity === 'all') {
    if (format === 'json') {
      const fullBackup: FullDatabaseBackup = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        system: 'WorkforceOS - Strategic Talent & TNA Management System',
        data: {
          employees: contextData.employees,
          trainingModules: contextData.trainingModules,
          tnaRules: contextData.tnaRules,
          criticalPositions: contextData.criticalPositions,
          mppData: contextData.mppData
        }
      };
      downloadJson(fullBackup, `WorkforceOS_FULL_BACKUP_${timestamp}.json`);
      return;
    }

    // Multi-sheet Excel export
    const empRows = buildEmployeeExportRows(contextData.employees);
    const modRows = buildTrainingModuleExportRows(contextData.trainingModules);
    const matrixRows = buildTrainingMatrixExportRows(contextData.employees, contextData.trainingModules, contextData.getRuleFor, contextData.checkQualification);
    const flatRecordsRows = buildFlatTrainingRecordsExportRows(contextData.employees, contextData.trainingModules);
    const rulesRows = buildTnaRulesExportRows(contextData.tnaRules, contextData.trainingModules);
    const mppRows = buildMppExportRows(contextData.mppData);
    const critRows = buildCriticalPositionsExportRows(contextData.criticalPositions);

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(empRows), 'Data Karyawan');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modRows), 'Katalog Modul');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrixRows), 'Matriks Pelatihan');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatRecordsRows), 'Catatan Pelatihan');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rulesRows), 'Standar TNA');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mppRows), 'Manpower Planning');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(critRows), 'Posisi Kritis');

    downloadWorkbook(wb, `WorkforceOS_FULL_DATABASE_${timestamp}`, format);
    return;
  }

  // Single entity export
  let rows: any[] = [];
  let sheetName = 'Data';
  let filePrefix = 'WorkforceOS';

  switch (entity) {
    case 'employees':
      rows = buildEmployeeExportRows(customFilteredData || contextData.employees);
      sheetName = 'Data Karyawan';
      filePrefix = 'Data_Karyawan';
      break;
    case 'training_modules':
      rows = buildTrainingModuleExportRows(customFilteredData || contextData.trainingModules);
      sheetName = 'Katalog Modul';
      filePrefix = 'Katalog_Modul_Pelatihan';
      break;
    case 'training_matrix':
      rows = buildTrainingMatrixExportRows(customFilteredData || contextData.employees, contextData.trainingModules, contextData.getRuleFor, contextData.checkQualification);
      sheetName = 'Matriks Pelatihan';
      filePrefix = 'Matriks_Pelatihan_TNA';
      break;
    case 'tna_rules':
      rows = buildTnaRulesExportRows(contextData.tnaRules, contextData.trainingModules);
      sheetName = 'Standar TNA';
      filePrefix = 'Standar_Kualifikasi_TNA';
      break;
    case 'ninebox':
      rows = buildNineBoxExportRows(customFilteredData || contextData.employees);
      sheetName = '9-Box Talenta';
      filePrefix = 'NineBox_Talent_Calibrations';
      break;
    case 'mpp':
      rows = buildMppExportRows(contextData.mppData);
      sheetName = 'Manpower Planning';
      filePrefix = 'Manpower_Planning_MPP';
      break;
    case 'critical_positions':
      rows = buildCriticalPositionsExportRows(contextData.criticalPositions);
      sheetName = 'Posisi Kritis';
      filePrefix = 'Posisi_Kritis_Suksesi';
      break;
    case 'competencies':
      rows = buildCompetenciesExportRows(contextData.competencies || []);
      sheetName = 'Kamus Kompetensi';
      filePrefix = 'Kamus_Kompetensi';
      break;
    case 'annual_training_plan':
      rows = buildAnnualTrainingPlanExportRows(contextData.annualTrainingPlans || []);
      sheetName = 'Rencana Pelatihan (ATP)';
      filePrefix = 'Annual_Training_Plan_ATP';
      break;
    case 'workforce_movements':
      rows = buildWorkforceMovementsExportRows(contextData.movements || []);
      sheetName = 'Riwayat Pergerakan';
      filePrefix = 'Workforce_Movements_Log';
      break;
  }

  if (format === 'json') {
    downloadJson(rows, `${filePrefix}_${timestamp}.json`);
  } else {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    downloadWorkbook(wb, `${filePrefix}_${timestamp}`, format);
  }
}

// ----------------------------------------------------------------------
// 3. TEMPLATE GENERATORS FOR IMPORT
// ----------------------------------------------------------------------

export function downloadImportTemplate(entity: ExportImportEntity, format: 'xlsx' | 'csv' = 'xlsx') {
  const wb = XLSX.utils.book_new();

  let templateRows: any[] = [];
  let sheetName = 'Template';
  let filename = 'Template_Import';

  switch (entity) {
    case 'employees':
      sheetName = 'Template Karyawan';
      filename = 'Template_Import_Karyawan';
      templateRows = [
        {
          'NIP': 'EMP101',
          'Nama Lengkap': 'Ahmad Fauzi, S.T.',
          'Email': 'ahmad.fauzi@perusahaan.com',
          'Departemen': 'Operations',
          'Jabatan / Posisi': 'Production Superintendent',
          'Level Jabatan': 'Supervisor',
          'Grade': 'G6',
          'Pendidikan Terakhir': 'S1',
          'Masa Kerja (Tahun)': 4,
          'Tanggal Masuk': '2022-03-15',
          'Tahun Kelahiran': 1992,
          'Status Kerja': 'PKWTT (Permanent)',
          'Tanggal Akhir Kontrak': '',
          'Nama Atasan Langsung': 'Budi Santoso, S.T., M.M.',
          'Rating Kinerja': 'High',
          'Rating Potensi': 'High',
          'Skor Kinerja (Radar)': 85,
          'Skor Kepemimpinan (Radar)': 80,
          'Skor Teknis (Radar)': 88,
          'Skor Adaptabilitas (Radar)': 82,
          'Skor Budaya (Radar)': 85,
          'Catatan Khusus': 'Kandidat suksesi Manager Operasional'
        },
        {
          'NIP': 'EMP102',
          'Nama Lengkap': 'Dewi Lestari, S.E.',
          'Email': 'dewi.lestari@perusahaan.com',
          'Departemen': 'Finance & IT',
          'Jabatan / Posisi': 'Financial Analyst',
          'Level Jabatan': 'Senior Staff',
          'Grade': 'G5',
          'Pendidikan Terakhir': 'S1',
          'Masa Kerja (Tahun)': 3,
          'Tanggal Masuk': '2023-05-10',
          'Tahun Kelahiran': 1995,
          'Status Kerja': 'PKWT (Contract)',
          'Tanggal Akhir Kontrak': '2026-12-31',
          'Nama Atasan Langsung': 'Rudi Hartono, M.Ak.',
          'Rating Kinerja': 'Medium',
          'Rating Potensi': 'High',
          'Skor Kinerja (Radar)': 78,
          'Skor Kepemimpinan (Radar)': 75,
          'Skor Teknis (Radar)': 82,
          'Skor Adaptabilitas (Radar)': 80,
          'Skor Budaya (Radar)': 80,
          'Catatan Khusus': 'Sertifikasi Brevet Pajak A/B'
        }
      ];
      break;

    case 'training_modules':
      sheetName = 'Template Modul';
      filename = 'Template_Import_Modul_Pelatihan';
      templateRows = [
        {
          'Kode Modul': 'T11',
          'Nama Modul Pelatihan': 'Strategic Supply Chain & Procurement 4.0',
          'Kategori': 'Digital & Data',
          'Durasi (Jam)': 24,
          'Lembaga / Provider': 'Supply Chain Academy / BNSP',
          'Deskripsi & Target Kompetensi': 'Penerapan analitik data rantai pasok dan otomatisasi purchasing.',
          'Mandatori Untuk Posisi': 'Manager, Supervisor'
        },
        {
          'Kode Modul': 'T12',
          'Nama Modul Pelatihan': 'Crisis Management & Operational Resilience',
          'Kategori': 'Leadership',
          'Durasi (Jam)': 16,
          'Lembaga / Provider': 'Internal Academy',
          'Deskripsi & Target Kompetensi': 'Pengambilan keputusan tanggap darurat dan mitigasi gangguan bisnis.',
          'Mandatori Untuk Posisi': 'Director, Manager'
        }
      ];
      break;

    case 'training_matrix':
      sheetName = 'Template Catatan Pelatihan';
      filename = 'Template_Import_Catatan_Pelatihan';
      templateRows = [
        {
          'NIP': 'EMP001',
          'Kode Modul': 'T01',
          'Status': 'DONE',
          'Nilai Evaluasi': 90,
          'Nomor Sertifikat': 'CERT-2026-001',
          'Tanggal Selesai': '2026-02-15'
        },
        {
          'NIP': 'EMP001',
          'Kode Modul': 'T02',
          'Status': 'PROGRESS',
          'Nilai Evaluasi': '',
          'Nomor Sertifikat': '',
          'Tanggal Selesai': ''
        },
        {
          'NIP': 'EMP002',
          'Kode Modul': 'T03',
          'Status': 'DONE',
          'Nilai Evaluasi': 88,
          'Nomor Sertifikat': 'CERT-2026-008',
          'Tanggal Selesai': '2026-04-10'
        }
      ];
      break;

    case 'tna_rules':
      sheetName = 'Template Standar TNA';
      filename = 'Template_Import_Standar_TNA';
      templateRows = [
        {
          'Departemen': 'Operations',
          'Level Jabatan': 'Manager',
          'Minimal Pendidikan': 'S1',
          'Minimal Masa Kerja (Tahun)': 4,
          'Kode Modul Wajib (Dipisah Koma)': 'T01, T02, T03, T04'
        },
        {
          'Departemen': 'Operations',
          'Level Jabatan': 'Supervisor',
          'Minimal Pendidikan': 'D3',
          'Minimal Masa Kerja (Tahun)': 2,
          'Kode Modul Wajib (Dipisah Koma)': 'T01, T02'
        },
        {
          'Departemen': 'Engineering',
          'Level Jabatan': 'Senior Staff',
          'Minimal Pendidikan': 'S1',
          'Minimal Masa Kerja (Tahun)': 2,
          'Kode Modul Wajib (Dipisah Koma)': 'T03, T06, T08'
        }
      ];
      break;

    case 'ninebox':
      sheetName = 'Template Kalibrasi 9-Box';
      filename = 'Template_Import_Kalibrasi_9Box';
      templateRows = [
        {
          'NIP': 'EMP001',
          'Rating Kinerja': 'High',
          'Rating Potensi': 'High',
          'Key Talent (HiPo)': 'Ya',
          'Siap Suksesi': 'Ya'
        },
        {
          'NIP': 'EMP002',
          'Rating Kinerja': 'Medium',
          'Rating Potensi': 'High',
          'Key Talent (HiPo)': 'Tidak',
          'Siap Suksesi': 'Ya'
        }
      ];
      break;

    case 'mpp':
      sheetName = 'Template MPP';
      filename = 'Template_Import_Manpower_Planning';
      templateRows = [
        {
          'Departemen': 'Operations',
          'Target Demand (Kebutuhan)': 155,
          'Pilar 1: Rekrutmen Eksternal': 8,
          'Pilar 2: Mobilitas Internal': 4,
          'Pilar 3: Upskilling & TNA': 4,
          'Pilar 4: Otomasi & Efisiensi': 2,
          'Estimasi Budget (Juta IDR)': 420
        },
        {
          'Departemen': 'Engineering',
          'Target Demand (Kebutuhan)': 55,
          'Pilar 1: Rekrutmen Eksternal': 4,
          'Pilar 2: Mobilitas Internal': 2,
          'Pilar 3: Upskilling & TNA': 2,
          'Pilar 4: Otomasi & Efisiensi': 1,
          'Estimasi Budget (Juta IDR)': 300
        }
      ];
      break;

    case 'critical_positions':
      sheetName = 'Template Posisi Kritis';
      filename = 'Template_Import_Posisi_Kritis';
      templateRows = [
        {
          'ID Posisi': 'CP01',
          'Nama Posisi Kritis': 'Head of Plant Operations',
          'Departemen': 'Operations',
          'Pemegang Saat Ini': 'Budi Santoso, S.T., M.M.',
          'Tingkat Risiko': 'High',
          'Dampak Bisnis': 'Mengontrol 65% output produksi korporat dan kepatuhan keselamatan kerja.',
          'Sisa Tahun Pensiun': 3,
          'NIP Suksesor 1': 'EMP003',
          'Kesiapan Suksesor 1': 'Ready Now',
          'NIP Suksesor 2': 'EMP005',
          'Kesiapan Suksesor 2': 'Ready in 1 Year'
        }
      ];
      break;

    case 'competencies':
      sheetName = 'Template Kamus Kompetensi';
      filename = 'Template_Import_Kamus_Kompetensi';
      templateRows = [
        {
          'Kode Kompetensi': 'CMP_10',
          'Nama Kompetensi': 'Strategic Financial Modeling',
          'Kategori': 'Technical & Functional',
          'Deskripsi': 'Kemampuan merancang model proyeksi keuangan, DCF, dan analisis kelayakan investasi.',
          'Indikator Level 1': 'Memahami dasar laporan laba rugi dan neraca.',
          'Indikator Level 2': 'Mampu membuat proyeksi anggaran operasional departemen.',
          'Indikator Level 3': 'Mampu menyusun model kelayakan CAPEX dan NPV/IRR.',
          'Indikator Level 4': 'Mampu mengevaluasi sensitivitas risiko makro dan mitigasi fiskal.',
          'Indikator Level 5': 'Mampu merancang arsitektur strategi permodalan dan M&A korporat.'
        }
      ];
      break;

    case 'annual_training_plan':
      sheetName = 'Template ATP 2026';
      filename = 'Template_Import_Annual_Training_Plan';
      templateRows = [
        {
          'Kode Modul': 'T02',
          'Nama Pelatihan': 'Sertifikasi Pengawas Operasional Pertama (POP) K3',
          'Kategori': 'Compliance & Safety',
          'Departemen Target': 'Operations',
          'Bulan Pelaksanaan': 'Mar',
          'Target Peserta': 15,
          'Estimasi Budget (Juta IDR)': 35,
          'Status': 'Planned',
          'Instruktur / Vendor': 'Ir. Bambang Suhartono, IPU'
        },
        {
          'Kode Modul': 'T04',
          'Nama Pelatihan': 'Business Intelligence Foundation',
          'Kategori': 'Digital & Data',
          'Departemen Target': 'Supply Chain',
          'Bulan Pelaksanaan': 'Apr',
          'Target Peserta': 20,
          'Estimasi Budget (Juta IDR)': 25,
          'Status': 'Planned',
          'Instruktur / Vendor': 'Internal Faculty'
        }
      ];
      break;

    case 'workforce_movements':
      sheetName = 'Template Riwayat Pergerakan';
      filename = 'Template_Import_Workforce_Movements';
      templateRows = [
        {
          'NIP Karyawan': 'EMP001',
          'Nama Karyawan': 'Ahmad Faqih Didin',
          'Tipe Pergerakan': 'Promosi',
          'Tanggal Efektif': '2026-06-01',
          'No Surat Keputusan (SK)': 'SK/HR/2026/044',
          'Jabatan Asal': 'Senior Training Officer',
          'Departemen Asal': 'Human Resources',
          'Grade Asal': 'G7',
          'Jabatan Baru': 'Training Supervisor',
          'Departemen Baru': 'Human Resources',
          'Grade Baru': 'G8',
          'Alasan / Justifikasi': 'Pencapaian KPI Superior dan kelulusan program akselerasi IDP.',
          'Disetujui Oleh': 'Budi Santoso, S.T., M.M.'
        }
      ];
      break;

    default:
      sheetName = 'Template Import';
      filename = 'Template_Import';
      templateRows = [{ 'Contoh Kolom': 'Nilai Contoh' }];
      break;
  }

  const ws = XLSX.utils.json_to_sheet(templateRows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  downloadWorkbook(wb, filename, format);
}

// ----------------------------------------------------------------------
// 4. PARSER & VALIDATOR FOR IMPORT FILES
// ----------------------------------------------------------------------

function cleanKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function parseString(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

function parseNumber(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

function parseDateString(val: unknown, fallback = ''): string {
  if (val === null || val === undefined || val === '') return fallback;
  
  // If it's an Excel numeric serial date (e.g. 44927)
  if (typeof val === 'number') {
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return fallback;
}

function normalizeRating(val: string): 'Low' | 'Medium' | 'High' {
  const clean = val.toLowerCase().trim();
  if (clean.includes('high') || clean.includes('tinggi') || clean === 'h' || clean === '3') return 'High';
  if (clean.includes('low') || clean.includes('rendah') || clean === 'l' || clean === '1') return 'Low';
  return 'Medium';
}

function normalizeStatus(val: string): TrainingStatusType {
  const clean = val.toLowerCase().trim();
  if (clean.includes('done') || clean.includes('selesai') || clean.includes('lulus') || clean === 'd') return 'done';
  if (clean.includes('prog') || clean.includes('jalan') || clean.includes('sedang') || clean === 'p') return 'progress';
  return 'not_done';
}

export async function parseImportFile(
  file: File,
  targetEntity: ExportImportEntity,
  existingEmployees: Employee[],
  existingModules: TrainingModule[]
): Promise<ImportPreviewResult> {
  const fileName = file.name;
  const isJson = fileName.toLowerCase().endsWith('.json');

  if (isJson) {
    const text = await file.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error('File JSON tidak valid atau struktur rusak.');
    }

    // Check if full backup JSON
    if (parsed.data && parsed.data.employees && (targetEntity === 'all' || !targetEntity)) {
      return {
        entityType: 'all',
        fileName,
        totalRows: parsed.data.employees.length,
        validRows: parsed.data.employees.length,
        invalidRows: 0,
        data: parsed.data,
        errors: [],
        warnings: [],
        headersDetected: ['Full Database Snapshot JSON'],
        previewRows: parsed.data.employees.slice(0, 5)
      };
    }

    // Array JSON for specific entity
    const rawArray = Array.isArray(parsed) ? parsed : [parsed];
    return processRawRows(rawArray, targetEntity, fileName, existingEmployees, existingModules);
  }

  // Excel / CSV File Parsing via XLSX
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // If Target is 'all' or workbook contains standard multi-sheets
  if (targetEntity === 'all' || (workbook.SheetNames.includes('Data Karyawan') && workbook.SheetNames.includes('Katalog Modul'))) {
    const resultData: any = {
      employees: [],
      trainingModules: [],
      tnaRules: {},
      criticalPositions: [],
      mppData: []
    };

    let totalRowCount = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);
      totalRowCount += rows.length;

      const normName = cleanKey(sheetName);
      if (normName.includes('karyawan') || normName.includes('employee')) {
        const parsedEmps = processRawRows(rows, 'employees', fileName, existingEmployees, existingModules);
        resultData.employees = parsedEmps.data;
      } else if (normName.includes('modul') || normName.includes('trainingmodule')) {
        const parsedMods = processRawRows(rows, 'training_modules', fileName, existingEmployees, existingModules);
        resultData.trainingModules = parsedMods.data;
      } else if (normName.includes('standartna') || normName.includes('tnarule')) {
        const parsedRules = processRawRows(rows, 'tna_rules', fileName, existingEmployees, existingModules);
        resultData.tnaRules = parsedRules.data;
      } else if (normName.includes('manpower') || normName.includes('mpp')) {
        const parsedMpp = processRawRows(rows, 'mpp', fileName, existingEmployees, existingModules);
        resultData.mppData = parsedMpp.data;
      } else if (normName.includes('posisikritis') || normName.includes('criticalposition')) {
        const parsedCrit = processRawRows(rows, 'critical_positions', fileName, existingEmployees, existingModules);
        resultData.criticalPositions = parsedCrit.data;
      }
    }

    return {
      entityType: 'all',
      fileName,
      totalRows: totalRowCount,
      validRows: totalRowCount,
      invalidRows: 0,
      data: resultData,
      errors: [],
      warnings: [],
      headersDetected: workbook.SheetNames,
      previewRows: (resultData.employees || []).slice(0, 5)
    };
  }

  // Single Sheet Parse
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

  return processRawRows(rawRows, targetEntity, fileName, existingEmployees, existingModules);
}

function processRawRows(
  rawRows: any[],
  targetEntity: ExportImportEntity,
  fileName: string,
  existingEmployees: Employee[],
  existingModules: TrainingModule[]
): ImportPreviewResult {
  const errors: { row: number; field: string; message: string; rowData?: any }[] = [];
  const warnings: { row: number; field: string; message: string }[] = [];
  const headersDetected = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  const modCodeToIdMap = new Map(existingModules.map(m => [m.code.toUpperCase(), m.id]));
  const modIdToModMap = new Map(existingModules.map(m => [m.id, m]));
  const empNipToEmpMap = new Map(existingEmployees.map(e => [e.nip.toUpperCase(), e]));

  switch (targetEntity) {
    // -------------------------------------------------------------
    // 1. EMPLOYEES IMPORT
    // -------------------------------------------------------------
    case 'employees': {
      const parsedEmployees: Employee[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2; // header is row 1
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const nip = parseString(map['nip'] || map['nomorindukkaryawan'] || map['id']);
        const name = parseString(map['namalengkap'] || map['nama'] || map['name']);

        if (!nip) {
          errors.push({ row: rowNum, field: 'NIP', message: 'NIP wajib diisi', rowData: row });
          return;
        }
        if (!name) {
          errors.push({ row: rowNum, field: 'Nama Lengkap', message: 'Nama lengkap wajib diisi', rowData: row });
          return;
        }

        // Department
        let rawDept = parseString(map['departemen'] || map['department'] || 'Operations');
        const matchedDept = DEPARTMENTS.find(d => d.toLowerCase() === rawDept.toLowerCase()) || 'Operations';

        // Level
        let rawLevel = parseString(map['leveljabatan'] || map['level'] || 'Staff');
        const matchedLevel = JOB_LEVELS.find(l => l.toLowerCase() === rawLevel.toLowerCase()) || 'Staff';

        // Education
        let rawEdu = parseString(map['pendidikanterakhir'] || map['pendidikan'] || map['education'] || 'S1');
        const matchedEdu = EDUCATION_LEVELS.find(e => e.toLowerCase() === rawEdu.toLowerCase()) || 'S1';

        // Employment Type
        let rawEmpType = parseString(map['statuskerja'] || map['statushubungankerja'] || map['employmenttype'] || 'PKWTT (Permanent)');
        let matchedEmpType: EmploymentType = 'PKWTT (Permanent)';
        if (rawEmpType.toLowerCase().includes('pkwt') && !rawEmpType.toLowerCase().includes('pkwtt')) {
          matchedEmpType = 'PKWT (Contract)';
        } else if (rawEmpType.toLowerCase().includes('outsource')) {
          matchedEmpType = 'Outsource';
        }

        // Ratings
        const perf = normalizeRating(parseString(map['ratingkinerja'] || map['performance'] || map['kinerja'] || 'Medium'));
        const pot = normalizeRating(parseString(map['ratingpotensi'] || map['potential'] || map['potensi'] || 'Medium'));
        const nineBox = computeNineBoxGrid(perf, pot);

        // Find existing employee to preserve trainings and career paths
        const existing = empNipToEmpMap.get(nip.toUpperCase());

        const emp: Employee = {
          id: existing?.id || `EMP${String(existingEmployees.length + parsedEmployees.length + 1).padStart(3, '0')}`,
          nip,
          name,
          email: parseString(map['email'] || `${nip.toLowerCase()}@workforce.internal`),
          avatarUrl: parseString(map['avatarurl'] || map['avatar'] || existing?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`),
          department: matchedDept as Department,
          jobTitle: parseString(map['jabatanposisi'] || map['jabatan'] || map['posisi'] || map['jobtitle'] || 'Staff'),
          level: matchedLevel as JobLevel,
          grade: parseString(map['grade'] || (matchedLevel === 'Director' ? 'G9' : matchedLevel === 'Manager' ? 'G7' : matchedLevel === 'Supervisor' ? 'G6' : 'G4')),
          education: matchedEdu as EducationLevel,
          tenureYears: parseNumber(map['masakerjatahun'] || map['masakerja'] || map['tenureyears'] || 2),
          joinDate: parseDateString(map['tanggalmasuk'] || map['joindate'], '2023-01-01'),
          birthYear: parseNumber(map['tahunkelahiran'] || map['tahunlahir'] || map['birthyear'] || 1990),
          employmentType: matchedEmpType,
          contractEndDate: parseDateString(map['tanggalakhirkontrak'] || map['contractenddate'] || '') || undefined,
          managerName: parseString(map['namaatasanlangsung'] || map['atasan'] || map['managername'] || '') || undefined,
          managerId: existing?.managerId,
          directReportsCount: parseNumber(map['jumlahbawahanlangsung'] || map['bawahan'] || existing?.directReportsCount || 0),
          performanceRating: perf,
          potentialRating: pot,
          nineBoxGrid: nineBox,
          trainings: existing?.trainings || {},
          radar: {
            performance: parseNumber(map['skorkinerjaradar'] || map['radarkinerja'] || existing?.radar?.performance || 75),
            leadership: parseNumber(map['skorkepemimpinanradar'] || map['radarkepemimpinan'] || existing?.radar?.leadership || 75),
            technical: parseNumber(map['skorteknisradar'] || map['radarteknis'] || existing?.radar?.technical || 75),
            adaptability: parseNumber(map['skoradaptabilitasradar'] || map['radaradaptabilitas'] || existing?.radar?.adaptability || 75),
            cultureFit: parseNumber(map['skorbudayaradar'] || map['radarbudaya'] || existing?.radar?.cultureFit || 75)
          },
          careerPaths: existing?.careerPaths || [],
          isKeyTalent: map['keytalenthipo'] ? parseString(map['keytalenthipo']).toLowerCase() === 'ya' : nineBox >= 8,
          isSuccessorReady: map['siapsuksesi'] ? parseString(map['siapsuksesi']).toLowerCase() === 'ya' : existing?.isSuccessorReady || false,
          notes: parseString(map['catatankhusus'] || map['catatan'] || map['notes'] || '') || undefined
        };

        parsedEmployees.push(emp);
      });

      return {
        entityType: 'employees',
        fileName,
        totalRows: rawRows.length,
        validRows: parsedEmployees.length,
        invalidRows: errors.length,
        data: parsedEmployees,
        errors,
        warnings,
        headersDetected,
        previewRows: parsedEmployees.slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 2. TRAINING MODULES IMPORT
    // -------------------------------------------------------------
    case 'training_modules': {
      const parsedModules: TrainingModule[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const code = parseString(map['kodemodul'] || map['kode'] || map['code']).toUpperCase();
        const name = parseString(map['namamodulpelatihan'] || map['namamodul'] || map['nama'] || map['name']);

        if (!code) {
          errors.push({ row: rowNum, field: 'Kode Modul', message: 'Kode modul wajib diisi', rowData: row });
          return;
        }
        if (!name) {
          errors.push({ row: rowNum, field: 'Nama Modul', message: 'Nama modul wajib diisi', rowData: row });
          return;
        }

        // Category
        const rawCat = parseString(map['kategori'] || map['category'] || 'Leadership');
        const matchedCat = TRAINING_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase()) || 'Leadership';

        const rolesStr = parseString(map['mandatoriuntukposisi'] || map['roles'] || '');
        const mandatoryRoles = rolesStr ? rolesStr.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [];

        const existingMod = existingModules.find(m => m.code.toUpperCase() === code);

        const mod: TrainingModule = {
          id: existingMod?.id || `T${String(existingModules.length + parsedModules.length + 1).padStart(2, '0')}`,
          code,
          name,
          category: matchedCat as TrainingCategory,
          durationHours: parseNumber(map['durasi'] || map['durasijam'] || map['durationhours'] || 16),
          provider: parseString(map['lembagaprovider'] || map['provider'] || 'Corporate L&D Academy'),
          description: parseString(map['deskripsitargetkompetensi'] || map['deskripsi'] || map['description'] || 'Pelatihan pengembangan kompetensi standar.'),
          mandatoryForRoles: mandatoryRoles.length > 0 ? mandatoryRoles : existingMod?.mandatoryForRoles || []
        };

        parsedModules.push(mod);
      });

      return {
        entityType: 'training_modules',
        fileName,
        totalRows: rawRows.length,
        validRows: parsedModules.length,
        invalidRows: errors.length,
        data: parsedModules,
        errors,
        warnings,
        headersDetected,
        previewRows: parsedModules.slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 3. TRAINING MATRIX & RECORDS IMPORT
    // -------------------------------------------------------------
    case 'training_matrix': {
      // Supports both flat format (NIP, Kode Modul, Status, Nilai) and matrix format (NIP, [T01], [T02])
      const recordsToUpdate: { nip: string; moduleCodeOrId: string; status: TrainingStatusType; score?: number; certNo?: string; completedDate?: string }[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const nip = parseString(map['nip'] || map['nomorindukkaryawan']);
        if (!nip) {
          errors.push({ row: rowNum, field: 'NIP', message: 'NIP karyawan wajib ada di baris ini', rowData: row });
          return;
        }

        // Check if flat format (single module per row)
        const flatModCode = parseString(map['kodemodul'] || map['kode'] || map['modulecode']);
        if (flatModCode) {
          const status = normalizeStatus(parseString(map['status'] || 'not_done'));
          const score = map['nilaievaluasi'] !== undefined || map['nilai'] !== undefined ? parseNumber(map['nilaievaluasi'] ?? map['nilai']) : undefined;
          const certNo = parseString(map['nomorsertifikat'] || map['sertifikat'] || '');
          const completedDate = parseDateString(map['tanggalselesai'] || map['completeddate'] || '');

          recordsToUpdate.push({
            nip,
            moduleCodeOrId: flatModCode,
            status,
            score,
            certNo: certNo || undefined,
            completedDate: completedDate || undefined
          });
          return;
        }

        // Otherwise check columns for module codes
        for (const [rawKey, rawVal] of Object.entries(row)) {
          const valStr = parseString(rawVal);
          // Look for module code in brackets like "[T01] Leadership" or direct "T01"
          const codeMatch = rawKey.match(/\[([A-Za-z0-9]+)\]/) || rawKey.match(/^([T][0-9]+)/i);
          if (codeMatch && codeMatch[1]) {
            const mCode = codeMatch[1].toUpperCase();
            const status = normalizeStatus(valStr);
            let score: number | undefined = undefined;
            const scoreMatch = valStr.match(/(?:nilai|score)[:\s]*([0-9]+)/i) || valStr.match(/([0-9]+)$/);
            if (scoreMatch && scoreMatch[1]) {
              score = Number(scoreMatch[1]);
            }
            recordsToUpdate.push({
              nip,
              moduleCodeOrId: mCode,
              status,
              score
            });
          }
        }
      });

      return {
        entityType: 'training_matrix',
        fileName,
        totalRows: rawRows.length,
        validRows: recordsToUpdate.length,
        invalidRows: errors.length,
        data: recordsToUpdate,
        errors,
        warnings,
        headersDetected,
        previewRows: recordsToUpdate.slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 4. TNA RULES IMPORT
    // -------------------------------------------------------------
    case 'tna_rules': {
      const parsedRules: Record<string, TNARule> = {};

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const rawDept = parseString(map['departemen'] || map['department']);
        const rawLevel = parseString(map['leveljabatan'] || map['level']);

        if (!rawDept || !rawLevel) {
          errors.push({ row: rowNum, field: 'Departemen/Level', message: 'Departemen dan Level Jabatan wajib diisi', rowData: row });
          return;
        }

        const matchedDept = DEPARTMENTS.find(d => d.toLowerCase() === rawDept.toLowerCase()) || 'Operations';
        const matchedLevel = JOB_LEVELS.find(l => l.toLowerCase() === rawLevel.toLowerCase()) || 'Manager';
        const matchedEdu = EDUCATION_LEVELS.find(e => e.toLowerCase() === parseString(map['minimalpendidikan'] || map['minedu'] || 'S1').toLowerCase()) || 'S1';

        const rawModuleCodes = parseString(map['kodemodulwajibdipisahkoma'] || map['kodemodulwajib'] || map['kodemodul'] || map['modules'] || '');
        const codeTokens = rawModuleCodes.split(/[,;]/).map(c => c.trim().toUpperCase()).filter(Boolean);
        
        // Map codes to Module IDs
        const requiredTrainingIds: string[] = [];
        codeTokens.forEach(code => {
          const modId = modCodeToIdMap.get(code) || (existingModules.some(m => m.id === code) ? code : undefined);
          if (modId) {
            requiredTrainingIds.push(modId);
          } else {
            warnings.push({ row: rowNum, field: 'Kode Modul', message: `Modul '${code}' tidak ditemukan di katalog modul.` });
          }
        });

        const ruleKey = `${matchedDept}_${matchedLevel}`;
        parsedRules[ruleKey] = {
          id: `R_${matchedDept.slice(0,3).toUpperCase()}_${matchedLevel.slice(0,3).toUpperCase()}`,
          department: matchedDept as Department,
          level: matchedLevel as JobLevel,
          minEdu: matchedEdu as EducationLevel,
          minTenureYears: parseNumber(map['minimalmasakerjatahun'] || map['masakerja'] || map['mintenureyears'] || 2),
          requiredTrainingIds: requiredTrainingIds.length > 0 ? requiredTrainingIds : ['T01', 'T02']
        };
      });

      return {
        entityType: 'tna_rules',
        fileName,
        totalRows: rawRows.length,
        validRows: Object.keys(parsedRules).length,
        invalidRows: errors.length,
        data: parsedRules,
        errors,
        warnings,
        headersDetected,
        previewRows: Object.values(parsedRules).slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 5. NINE-BOX IMPORT
    // -------------------------------------------------------------
    case 'ninebox': {
      const nineBoxCalibrations: { nip: string; perf: 'Low'|'Medium'|'High'; pot: 'Low'|'Medium'|'High'; isKeyTalent?: boolean; isSuccessorReady?: boolean }[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const nip = parseString(map['nip'] || map['nomorindukkaryawan']);
        if (!nip) {
          errors.push({ row: rowNum, field: 'NIP', message: 'NIP wajib diisi', rowData: row });
          return;
        }

        const perf = normalizeRating(parseString(map['ratingkinerja'] || map['performance'] || map['kinerja'] || 'Medium'));
        const pot = normalizeRating(parseString(map['ratingpotensi'] || map['potential'] || map['potensi'] || 'Medium'));
        const isKeyTalent = map['keytalenthipo'] ? parseString(map['keytalenthipo']).toLowerCase() === 'ya' : undefined;
        const isSuccessorReady = map['siapsuksesi'] ? parseString(map['siapsuksesi']).toLowerCase() === 'ya' : undefined;

        nineBoxCalibrations.push({
          nip,
          perf,
          pot,
          isKeyTalent,
          isSuccessorReady
        });
      });

      return {
        entityType: 'ninebox',
        fileName,
        totalRows: rawRows.length,
        validRows: nineBoxCalibrations.length,
        invalidRows: errors.length,
        data: nineBoxCalibrations,
        errors,
        warnings,
        headersDetected,
        previewRows: nineBoxCalibrations.slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 6. MANPOWER PLANNING IMPORT
    // -------------------------------------------------------------
    case 'mpp': {
      const parsedMpp: ManpowerDeptPlan[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const rawDept = parseString(map['departemen'] || map['department']);
        const matchedDept = DEPARTMENTS.find(d => d.toLowerCase() === rawDept.toLowerCase());
        if (!matchedDept) {
          errors.push({ row: rowNum, field: 'Departemen', message: `Departemen '${rawDept}' tidak valid`, rowData: row });
          return;
        }

        const currentHeadcount = parseNumber(map['headcounteksisting'] || map['currentheadcount'] || 20);
        const projectedTurnover = parseNumber(map['proyeksiturnover'] || map['turnover'] || 1);
        const projectedRetirements = parseNumber(map['proyeksipensiun'] || map['pensiun'] || 0);
        const projectedSupply = Math.max(0, currentHeadcount - projectedTurnover - projectedRetirements);
        const requiredDemand = parseNumber(map['targetdemandkebutuhan'] || map['demand'] || currentHeadcount + 2);
        const gap = Math.max(0, requiredDemand - projectedSupply);

        const rec = parseNumber(map['pilar1rekrutmeneksternal'] || map['rekrutmen'] || Math.round(gap * 0.4));
        const mob = parseNumber(map['pilar2mobilitasinternal'] || map['mobilitas'] || Math.round(gap * 0.3));
        const up = parseNumber(map['pilar3upskillingtna'] || map['upskilling'] || Math.round(gap * 0.2));
        const auto = parseNumber(map['pilar4otomasiefisiensi'] || map['otomasi'] || Math.max(0, gap - (rec + mob + up)));
        const budget = parseNumber(map['estimasibudgetjutaidr'] || map['budget'] || (rec * 25 + mob * 10 + up * 15 + auto * 40));

        parsedMpp.push({
          department: matchedDept,
          currentHeadcount,
          projectedTurnover,
          projectedRetirements,
          projectedSupply,
          requiredDemand,
          gap,
          interventions: {
            recruitmentCount: rec,
            internalMobilityCount: mob,
            upskillingCount: up,
            automationEfficiencyCount: auto
          },
          estimatedBudgetMillionIDR: budget
        });
      });

      return {
        entityType: 'mpp',
        fileName,
        totalRows: rawRows.length,
        validRows: parsedMpp.length,
        invalidRows: errors.length,
        data: parsedMpp,
        errors,
        warnings,
        headersDetected,
        previewRows: parsedMpp.slice(0, 5)
      };
    }

    // -------------------------------------------------------------
    // 7. CRITICAL POSITIONS IMPORT
    // -------------------------------------------------------------
    case 'critical_positions': {
      const parsedPositions: CriticalPosition[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const map: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          map[cleanKey(k)] = v;
        }

        const title = parseString(map['namaposisi'] || map['namaposisikritis'] || map['title']);
        if (!title) {
          errors.push({ row: rowNum, field: 'Nama Posisi', message: 'Nama posisi kritis wajib diisi', rowData: row });
          return;
        }

        const rawDept = parseString(map['departemen'] || map['department'] || 'Operations');
        const matchedDept = DEPARTMENTS.find(d => d.toLowerCase() === rawDept.toLowerCase()) || 'Operations';

        const id = parseString(map['idposisi'] || map['id'] || `CP${String(parsedPositions.length + 1).padStart(2, '0')}`);
        const currentHolder = parseString(map['pemegangsaatini'] || map['currentholder'] || 'Pejabat Struktural');
        const riskLevelRaw = parseString(map['tingkatrisiko'] || map['risklevel'] || 'High').toLowerCase();
        const riskLevel = riskLevelRaw.includes('low') || riskLevelRaw.includes('rendah') ? 'Low' : riskLevelRaw.includes('med') || riskLevelRaw.includes('sedang') ? 'Medium' : 'High';
        const businessImpact = parseString(map['dampakbisnis'] || map['businessimpact'] || 'Posisi vital untuk kelangsungan operasional unit bisnis.');
        const retirementYearsRemaining = parseNumber(map['sisatahunpensiun'] || map['retirementyearsremaining'] || 2);

        // Successors parsing (e.g. from NIP columns)
        const successors: any[] = [];
        for (let i = 1; i <= 3; i++) {
          const succNip = parseString(map[`nipsuksesor${i}`] || map[`suksesor${i}`]);
          if (succNip) {
            const succEmp = empNipToEmpMap.get(succNip.toUpperCase()) || existingEmployees.find(e => e.id === succNip);
            const readinessRaw = parseString(map[`kesiapansuksesor${i}`] || map[`readiness${i}`] || 'Ready in 1 Year');
            const readiness = readinessRaw.toLowerCase().includes('now') ? 'Ready Now' : readinessRaw.toLowerCase().includes('2') || readinessRaw.toLowerCase().includes('3') ? 'Ready in 2-3 Years' : 'Ready in 1 Year';

            successors.push({
              employeeId: succEmp?.id || succNip,
              name: succEmp?.name || succNip,
              readiness,
              fitScore: succEmp ? Math.round((succEmp.radar.performance * 0.4) + (succEmp.radar.leadership * 0.3) + (succEmp.radar.technical * 0.3)) : 80
            });
          }
        }

        parsedPositions.push({
          id,
          title,
          department: matchedDept,
          currentHolder,
          currentHolderId: empNipToEmpMap.get(currentHolder.toUpperCase())?.id || 'EMP001',
          riskLevel,
          businessImpact,
          retirementYearsRemaining,
          successors
        });
      });

      return {
        entityType: 'critical_positions',
        fileName,
        totalRows: rawRows.length,
        validRows: parsedPositions.length,
        invalidRows: errors.length,
        data: parsedPositions,
        errors,
        warnings,
        headersDetected,
        previewRows: parsedPositions.slice(0, 5)
      };
    }

    default:
      return {
        entityType: targetEntity,
        fileName,
        totalRows: rawRows.length,
        validRows: rawRows.length,
        invalidRows: 0,
        data: rawRows,
        errors: [],
        warnings: [],
        headersDetected,
        previewRows: rawRows.slice(0, 5)
      };
  }
}
