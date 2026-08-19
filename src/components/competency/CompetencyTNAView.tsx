import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  BookOpen,
  SlidersHorizontal,
  TableProperties,
  Flame,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  TrendingDown,
  Layers,
  GraduationCap,
  Sparkles,
  Check,
  X,
  Target,
  FileSpreadsheet,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Trash2,
  Briefcase,
  ShieldCheck,
  Eye,
  Download,
  Upload,
  FileText,
  CheckSquare,
  Square,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  CompetencyItem, 
  CompetencyCategory, 
  ProficiencyLevel, 
  PositionCompetencyRequirement, 
  EmployeeCompetencyAssessment,
  Department,
  JobLevel,
  EducationLevel 
} from '../../types';
import { DEPARTMENTS, JOB_LEVELS, COMPETENCY_CATEGORIES, EDUCATION_LEVELS } from '../../data/mockData';
import { TrainingMatrixView } from '../matrix/TrainingMatrixView';
import { SkillGapHeatmap } from '../matrix/SkillGapHeatmap';
import { generateUnifiedJobProfilePDF, generateCompetencyDictionaryPDF } from '../../utils/pdfExport';

interface UnifiedStandardItem {
  id: string;
  title: string;
  department: Department;
  level: JobLevel;
  grade: string;
  minEdu: EducationLevel;
  minTenureYears: number;
  mandatoryCertifications: string[];
  mandatoryTrainingModules: string[];
  competencies: {
    id: string;
    name: string;
    category: CompetencyCategory;
    requiredLevel: ProficiencyLevel;
    levelName: string;
    sampleIndicator: string;
    isCritical?: boolean;
  }[];
  activeIncumbentName?: string;
  incumbentTnaScore?: number;
  incumbentFitScore?: number;
}

const INITIAL_UNIFIED_STANDARDS: UnifiedStandardItem[] = [
  {
    id: 'STD-HC-SUPT',
    title: 'Training Superintendent',
    department: 'Human Resources',
    level: 'Manager',
    grade: 'G5',
    minEdu: 'S1',
    minTenureYears: 4,
    mandatoryCertifications: ['BNSP Lead Trainer Level 4', 'K3 Lingkungan Kerja', 'POP K3 Pratama'],
    mandatoryTrainingModules: ['Leadership Management 101', 'Budget & Financial Cost Control', 'TNA & Training Matrix Design', 'Strategic Workforce Planning'],
    competencies: [
      { id: 'CMP_STRAT_01', name: 'Strategic Workforce Planning', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Merancang simulasi 4-Pilar (Build, Buy, Borrow, Bot) dan mitigasi risiko suksesi 2027.', isCritical: true },
      { id: 'CMP_TNA_01', name: 'Training Needs Analysis & Design', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Menyusun kurikulum tahunan ATP, standarisasi TNA, dan evaluasi 4-Level Kirkpatrick.', isCritical: true },
      { id: 'CMP_FIN_01', name: 'Budget & Financial Cost Control', category: 'Core & Culture', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Mengelola efisiensi anggaran pelatihan ratusan juta rupiah tanpa deviasi biaya.' },
      { id: 'CMP_LEAD_01', name: 'Leadership Coaching & Mentoring', category: 'Leadership & Management', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Membimbing para supervisor dan merancang target akselerasi IDP 70:20:10.', isCritical: true },
      { id: 'CMP_HSE_01', name: 'HSE Mindset & Zero Harm Culture', category: 'HSE & Compliance', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Memastikan 100% kepatuhan regulasi keselamatan kerja di lingkungan operasional.' }
    ],
    activeIncumbentName: 'Ahmad Faqih Didin',
    incumbentTnaScore: 100,
    incumbentFitScore: 84
  },
  {
    id: 'STD-OPS-SUPT',
    title: 'Mining Production Superintendent',
    department: 'Operations',
    level: 'Manager',
    grade: 'G5',
    minEdu: 'S1',
    minTenureYears: 5,
    mandatoryCertifications: ['Pengawas Operasional Madya (POM)', 'K3 Tambang (KTT Kepmen 1827)'],
    mandatoryTrainingModules: ['Mine Operations Management (24 Jam)', 'Mine Safety & Environment (16 Jam)', 'Fleet Optimization & Dispatch (16 Jam)'],
    competencies: [
      { id: 'CMP_OPS_01', name: 'Mine Safety & Statutory Regulation', category: 'HSE & Compliance', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Memimpin audit K3 operasional, berhak menghentikan pekerjaan berisiko tinggi tanpa kompromi.', isCritical: true },
      { id: 'CMP_OPS_02', name: 'Production Scheduling & Dispatch', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Mengoptimalkan rotasi armada alat berat dan memangkas bottleneck di loading shovel.', isCritical: true },
      { id: 'CMP_OPS_03', name: 'Heavy Equipment Asset Reliability', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Menganalisis indikator MTBF/MTTR dan sinkronisasi perawatan preventif bersama workshop.', isCritical: true },
      { id: 'CMP_OPS_04', name: 'Contractor & Hauling Management', category: 'Core & Culture', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Mengevaluasi KPI pencapaian ritase dan tonase harian kontraktor pihak ketiga.' }
    ],
    activeIncumbentName: 'Budi Santoso',
    incumbentTnaScore: 100,
    incumbentFitScore: 92
  },
  {
    id: 'STD-ENG-SPEC',
    title: 'Lead Geotechnical Specialist',
    department: 'Engineering',
    level: 'Senior Staff',
    grade: 'G5',
    minEdu: 'S1',
    minTenureYears: 4,
    mandatoryCertifications: ['Ahli Geoteknik Tambang Terbuka BNSP', 'POP K3 Pratama'],
    mandatoryTrainingModules: ['Slope Stability Numerical Modeling (24 Jam)', 'Groundwater Hydrogeology (16 Jam)', 'Mining Risk Assessment (16 Jam)'],
    competencies: [
      { id: 'CMP_GEO_01', name: 'Slope Stability & Radar Monitoring', category: 'Technical', requiredLevel: 5, levelName: 'Expert', sampleIndicator: 'Memodelkan kestabilan lereng tambang (FoS) dan kalibrasi radar deformasi lereng real-time.', isCritical: true },
      { id: 'CMP_GEO_02', name: 'Hydrogeology & Dewatering Engineering', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Merancang sistem penyaliran tambang dan pemantauan muka air tanah piezometer.', isCritical: true },
      { id: 'CMP_HSE_01', name: 'HSE Mindset & Zero Harm Culture', category: 'HSE & Compliance', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Mengantisipasi potensi longsor lereng dan menerbitkan SOP evakuasi darurat pit.', isCritical: true }
    ],
    activeIncumbentName: 'Siti Rahma',
    incumbentTnaScore: 100,
    incumbentFitScore: 88
  },
  {
    id: 'STD-OPS-SPV',
    title: 'Plant Maintenance Supervisor',
    department: 'Operations',
    level: 'Supervisor',
    grade: 'G4',
    minEdu: 'D3',
    minTenureYears: 3,
    mandatoryCertifications: ['POP K3 Pratama', 'Sertifikasi Pemeliharaan Alat Berat'],
    mandatoryTrainingModules: ['Preventive Maintenance Systems', 'Hydraulic & Electrical Diagnostics', '5S & Workshop Safety'],
    competencies: [
      { id: 'CMP_MNT_01', name: 'Hydraulic & Engine Diagnostic', category: 'Technical', requiredLevel: 4, levelName: 'Advanced', sampleIndicator: 'Mendiagnosa kegagalan transmisi alat berat CAT/Komatsu dengan electronic technician tool.', isCritical: true },
      { id: 'CMP_MNT_02', name: 'Maintenance Planning & Backlog Control', category: 'Technical', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Mengatur jadwal overhaul dan meminimalisir unplanned downtime di workshop.' },
      { id: 'CMP_HSE_01', name: 'HSE Mindset & Zero Harm Culture', category: 'HSE & Compliance', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Melakukan inspeksi LOTO (Lock Out Tag Out) sebelum pekerjaan perbaikan dimulai.' }
    ],
    activeIncumbentName: 'Eko Prasetyo',
    incumbentTnaScore: 100,
    incumbentFitScore: 80
  },
  {
    id: 'STD-HC-OFF',
    title: 'Talent Development Officer',
    department: 'Human Resources',
    level: 'Staff',
    grade: 'G3',
    minEdu: 'S1',
    minTenureYears: 2,
    mandatoryCertifications: ['Sertifikasi Fasilitator Pelatihan BNSP'],
    mandatoryTrainingModules: ['Training Administration & LMS', 'HR Analytics Fundamental', 'Effective Presentation Skill'],
    competencies: [
      { id: 'CMP_TNA_01', name: 'Training Needs Analysis & Design', category: 'Technical', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Mengolah rekap kuesioner TNA tahunan dan menginput jadwal batch ke sistem LMS.' },
      { id: 'CMP_COMM_01', name: 'Effective Business Communication', category: 'Core & Culture', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Berkoordinasi dengan vendor pelatihan eksternal dan peserta training.' }
    ],
    activeIncumbentName: 'Dewi Lestari',
    incumbentTnaScore: 100,
    incumbentFitScore: 90
  }
];

export const CompetencyTNAView: React.FC = () => {
  const isDemo = useAuthStore((s) => s.isDemo());
  const {
    competencies,
    positionCompetencies,
    employees,
    jobPositions,
    trainingModules,
    getCompetencyGaps,
    addCompetency,
    updateCompetency,
    deleteCompetency,
    savePositionCompetencyRequirement,
    recordEmployeeAssessment,
    closeGapWithTrainingDirect,
    domainSubTabs,
    setDomainSubTab,
    setActiveTab,
    addToast
  } = useWorkforce();

  // Primary 3 Clean Subtabs:
  // 1. 'unified' -> ⚡ Profil Harmonisasi Standar (Single View, Table View & CRUD)
  // 2. 'library' -> Kamus & Library Kompetensi (5-Level Dictionary, Table View & CRUD)
  // 3. 'gap-audit' -> Audit Gap Kompetensi & Matriks Pelatihan
  const activeSubTab = domainSubTabs.competencyTna || 'unified';
  const setActiveSubTab = (tab: string) => setDomainSubTab('competencyTna', tab);

  // TAB 3 (GAP AUDIT & MATRIX) STATE
  const [gapAuditSubTab, setGapAuditSubTab] = useState<'all' | 'matrix' | 'gaps'>('all');
  const [isGapPanelOpen, setIsGapPanelOpen] = useState<boolean>(true);

  // =========================================================================
  // TAB 1 (UNIFIED STANDARDS) STATE
  // =========================================================================
  const [unifiedViewMode, setUnifiedViewMode] = useState<'single' | 'table'>('single');
  const [standardsList, setStandardsList] = useState<UnifiedStandardItem[]>(INITIAL_UNIFIED_STANDARDS);
  const [selectedStdId, setSelectedStdId] = useState<string>(standardsList[0]?.id || 'STD-HC-SUPT');
  const activeStd = standardsList.find((s) => s.id === selectedStdId) || standardsList[0];
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [tableDeptFilter, setTableDeptFilter] = useState<string>('All');
  const [tableLevelFilter, setTableLevelFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailStd, setDetailStd] = useState<UnifiedStandardItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<UnifiedStandardItem | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields for Standard
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState<Department>('Operations');
  const [formLevel, setFormLevel] = useState<JobLevel>('Supervisor');
  const [formGrade, setFormGrade] = useState('G4');
  const [formMinEdu, setFormMinEdu] = useState<EducationLevel>('S1');
  const [formMinTenure, setFormMinTenure] = useState<number>(3);
  const [formCertsText, setFormCertsText] = useState('');
  const [formModulesText, setFormModulesText] = useState('');
  const [formCompetencies, setFormCompetencies] = useState<{
    id: string;
    name: string;
    category: CompetencyCategory;
    requiredLevel: ProficiencyLevel;
    levelName: string;
    sampleIndicator: string;
    isCritical?: boolean;
  }[]>([]);

  // Assessment Modal
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessEmpId, setAssessEmpId] = useState(employees[0]?.id || '');
  const [assessCompId, setAssessCompId] = useState(competencies[0]?.id || '');
  const [assessLevel, setAssessLevel] = useState<ProficiencyLevel>(3);
  const [assessMethod, setAssessMethod] = useState<'Self' | 'Manager' | 'Assessor' | 'Certification'>('Manager');
  const [assessNotes, setAssessNotes] = useState('');

  // =========================================================================
  // TAB 2 (COMPETENCY DICTIONARY) STATE
  // =========================================================================
  const [dictViewMode, setDictViewMode] = useState<'split' | 'table'>('split');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [dictSearchQuery, setDictSearchQuery] = useState<string>('');
  const [selectedDictCompId, setSelectedDictCompId] = useState<string>(competencies[0]?.id || 'CMP_HSE_01');
  const activeDictComp = competencies.find((c) => c.id === selectedDictCompId) || competencies[0];
  const [selectedDictRowIds, setSelectedDictRowIds] = useState<Set<string>>(new Set());

  // Competency CRUD Modals State
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compModalMode, setCompModalMode] = useState<'create' | 'edit'>('create');
  const [compEditId, setCompEditId] = useState<string | null>(null);
  const [isCompDetailModalOpen, setIsCompDetailModalOpen] = useState(false);
  const [detailComp, setDetailComp] = useState<CompetencyItem | null>(null);
  const [isCompDeleteConfirmOpen, setIsCompDeleteConfirmOpen] = useState(false);
  const [deleteCompCandidate, setDeleteCompCandidate] = useState<CompetencyItem | null>(null);
  const [isCompBulkDeleteConfirmOpen, setIsCompBulkDeleteConfirmOpen] = useState(false);
  const [isCompImportModalOpen, setIsCompImportModalOpen] = useState(false);
  const compFileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields for Competency
  const [formCompCode, setFormCompCode] = useState('');
  const [formCompName, setFormCompName] = useState('');
  const [formCompCategory, setFormCompCategory] = useState<CompetencyCategory>('Technical');
  const [formCompDesc, setFormCompDesc] = useState('');
  const [formL1Indicators, setFormL1Indicators] = useState('');
  const [formL2Indicators, setFormL2Indicators] = useState('');
  const [formL3Indicators, setFormL3Indicators] = useState('');
  const [formL4Indicators, setFormL4Indicators] = useState('');
  const [formL5Indicators, setFormL5Indicators] = useState('');

  // Filtered Competencies for Dictionary
  const filteredCompetencies = useMemo(() => {
    return competencies.filter((c) => {
      const matchCat = filterCat === 'All' || c.category === filterCat;
      const matchQuery = c.name.toLowerCase().includes(dictSearchQuery.toLowerCase()) || c.code.toLowerCase().includes(dictSearchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [competencies, filterCat, dictSearchQuery]);

  // Live Gap List
  const competencyGaps = useMemo(() => {
    return getCompetencyGaps();
  }, [getCompetencyGaps, employees, positionCompetencies]);

  // Filtered Standards for Table View
  const filteredStandards = useMemo(() => {
    return standardsList.filter((s) => {
      const matchDept = tableDeptFilter === 'All' || s.department === tableDeptFilter;
      const matchLevel = tableLevelFilter === 'All' || s.level === tableLevelFilter;
      const matchSearch = s.title.toLowerCase().includes(tableSearchQuery.toLowerCase()) || 
                          s.department.toLowerCase().includes(tableSearchQuery.toLowerCase());
      return matchDept && matchLevel && matchSearch;
    });
  }, [standardsList, tableDeptFilter, tableLevelFilter, tableSearchQuery]);

  // --------------------------------------------------------------------------
  // TAB 1 EXCEL TEMPLATE & EXPORT HANDLERS
  // --------------------------------------------------------------------------
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Nama Jabatan': 'Mine Safety Superintendent',
        'Departemen': 'Operations',
        'Level': 'Manager',
        'Grade': 'G5',
        'Min Pendidikan': 'S1',
        'Min Masa Kerja (Tahun)': 4,
        'Sertifikasi Wajib (Pisahkan Koma)': 'Pengawas Operasional Madya (POM), K3 Tambang',
        'Modul Pelatihan Wajib (Pisahkan Koma)': 'Safety Mining Practice, Leadership 101, Emergency Response',
        'Kompetensi & Level (Format: Nama:Level)': 'HSE Mindset & Zero Harm Culture:4, Leadership Coaching & Mentoring:4'
      },
      {
        'Nama Jabatan': 'Geotechnical Engineer Supervisor',
        'Departemen': 'Engineering',
        'Level': 'Supervisor',
        'Grade': 'G4',
        'Min Pendidikan': 'S1',
        'Min Masa Kerja (Tahun)': 3,
        'Sertifikasi Wajib (Pisahkan Koma)': 'Ahli Geoteknik BNSP, POP K3 Pratama',
        'Modul Pelatihan Wajib (Pisahkan Koma)': 'Slope Stability Modeling, Hydrogeology Analysis',
        'Kompetensi & Level (Format: Nama:Level)': 'Slope Stability & Radar Monitoring:4, Hydrogeology & Dewatering Engineering:3'
      },
      {
        'Nama Jabatan': 'Talent Acquisition & Sourcing Officer',
        'Departemen': 'Human Resources',
        'Level': 'Staff',
        'Grade': 'G3',
        'Min Pendidikan': 'S1',
        'Min Masa Kerja (Tahun)': 2,
        'Sertifikasi Wajib (Pisahkan Koma)': 'Sertifikasi Asesor Rekrutmen BNSP',
        'Modul Pelatihan Wajib (Pisahkan Koma)': 'Behavioral Event Interview (BEI), HR Analytics',
        'Kompetensi & Level (Format: Nama:Level)': 'Effective Business Communication:3, Strategic Workforce Planning:2'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 22 }, { wch: 45 }, { wch: 45 }, { wch: 55 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Standar_Jabatan');
    XLSX.writeFile(wb, 'Template_Standar_Jabatan_Harmonisasi.xlsx');
    addToast('Template Diunduh', 'File Template_Standar_Jabatan_Harmonisasi.xlsx siap digunakan.', 'success');
  };

  const handleExportExcel = (itemsToExport: UnifiedStandardItem[], fileNameSuffix = 'Semua') => {
    const exportRows = itemsToExport.map((s, idx) => ({
      'No': idx + 1,
      'Nama Jabatan': s.title,
      'Departemen': s.department,
      'Level': s.level,
      'Grade': s.grade,
      'Min Pendidikan': s.minEdu,
      'Min Masa Kerja (Tahun)': s.minTenureYears,
      'Sertifikasi Legal (TNA)': s.mandatoryCertifications.join(', '),
      'Modul Pelatihan Wajib': s.mandatoryTrainingModules.join(', '),
      'Jumlah Kompetensi': s.competencies.length,
      'Daftar Kompetensi & Target': s.competencies.map(c => `${c.name} (L${c.requiredLevel})`).join('; '),
      'Incumbent Aktif': s.activeIncumbentName || 'Belum Ditugaskan',
      'Skor Kualifikasi TNA': `${s.incumbentTnaScore || 100}%`,
      'Skor Fit Kompetensi': `${s.incumbentFitScore || 85}%`
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 22 }, { wch: 40 }, { wch: 40 }, { wch: 18 },
      { wch: 50 }, { wch: 25 }, { wch: 20 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Standar_Jabatan');
    XLSX.writeFile(wb, `Data_Standar_Jabatan_${fileNameSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast('Export Berhasil', `Berhasil mengekspor ${itemsToExport.length} data standar jabatan ke Excel.`, 'success');
  };

  // --------------------------------------------------------------------------
  // TAB 1 SMART IMPORT DEDUPLICATION (SKIP EXISTING) HANDLER
  // --------------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          addToast('File Kosong', 'File Excel yang diunggah tidak memiliki baris data.', 'error');
          return;
        }

        let addedCount = 0;
        let skippedCount = 0;
        const newlyAdded: UnifiedStandardItem[] = [];

        rawData.forEach((row) => {
          const rawTitle = String(
            row['Nama Jabatan'] || row['nama_jabatan'] || row['Job Title'] || row['title'] || ''
          ).trim();

          if (!rawTitle) return;

          // DEDUPLICATION: Cek apakah nama jabatan sudah ada di sistem (case-insensitive)
          const alreadyExistsInCurrent = standardsList.some(
            (s) => s.title.toLowerCase().trim() === rawTitle.toLowerCase()
          );
          const alreadyExistsInNew = newlyAdded.some(
            (s) => s.title.toLowerCase().trim() === rawTitle.toLowerCase()
          );

          if (alreadyExistsInCurrent || alreadyExistsInNew) {
            skippedCount++;
            return; // SKIP DATA YANG SUDAH ADA!
          }

          const rawDept = String(row['Departemen'] || row['departemen'] || row['Department'] || 'Operations').trim();
          const validDept: Department = DEPARTMENTS.includes(rawDept as Department)
            ? (rawDept as Department)
            : 'Operations';

          const rawLevel = String(row['Level'] || row['level'] || 'Supervisor').trim();
          const validLevel: JobLevel = JOB_LEVELS.includes(rawLevel as JobLevel)
            ? (rawLevel as JobLevel)
            : 'Supervisor';

          const rawGrade = String(row['Grade'] || row['grade'] || 'G4').trim();
          const rawEdu = String(row['Min Pendidikan'] || row['min_pendidikan'] || row['Pendidikan'] || 'S1').trim();
          const validEdu: EducationLevel = EDUCATION_LEVELS.includes(rawEdu as EducationLevel)
            ? (rawEdu as EducationLevel)
            : 'S1';

          const rawTenure = Number(row['Min Masa Kerja (Tahun)'] || row['Min Masa Kerja'] || row['tenure'] || 2);
          const rawCerts = String(row['Sertifikasi Wajib (Pisahkan Koma)'] || row['Sertifikasi Wajib'] || row['sertifikasi'] || '');
          const certsList = rawCerts.split(/[,;]/).map(s => s.trim()).filter(Boolean);
          const rawMods = String(row['Modul Pelatihan Wajib (Pisahkan Koma)'] || row['Modul Pelatihan Wajib'] || row['modul'] || '');
          const modsList = rawMods.split(/[,;]/).map(s => s.trim()).filter(Boolean);

          const rawCompStr = String(row['Kompetensi & Level (Format: Nama:Level)'] || row['Kompetensi'] || '');
          const parsedComps: UnifiedStandardItem['competencies'] = [];

          if (rawCompStr) {
            const compEntries = rawCompStr.split(/[,;]/).map(s => s.trim()).filter(Boolean);
            compEntries.forEach((entry, idx) => {
              const parts = entry.split(':');
              const compName = parts[0]?.trim() || `Kompetensi Khusus ${idx + 1}`;
              const compLvl = Number(parts[1] || 3) as ProficiencyLevel;
              const lvlNames: Record<number, string> = { 1: 'Awareness', 2: 'Basic', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };

              parsedComps.push({
                id: `CMP_IMP_${Date.now()}_${idx}`,
                name: compName,
                category: 'Technical',
                requiredLevel: (compLvl >= 1 && compLvl <= 5 ? compLvl : 3) as ProficiencyLevel,
                levelName: lvlNames[compLvl] || 'Competent',
                sampleIndicator: 'Menerapkan standar teknis dan SOP operasional secara konsisten.',
                isCritical: true
              });
            });
          }

          if (parsedComps.length === 0) {
            parsedComps.push({
              id: competencies[0]?.id || 'CMP_01',
              name: competencies[0]?.name || 'HSE Mindset & Zero Harm Culture',
              category: 'HSE & Compliance',
              requiredLevel: 3,
              levelName: 'Competent',
              sampleIndicator: 'Memastikan kepatuhan keselamatan kerja di lingkungan tugas.',
              isCritical: true
            });
          }

          const newItem: UnifiedStandardItem = {
            id: `STD-IMP-${Date.now()}-${addedCount}`,
            title: rawTitle,
            department: validDept,
            level: validLevel,
            grade: rawGrade,
            minEdu: validEdu,
            minTenureYears: rawTenure,
            mandatoryCertifications: certsList.length > 0 ? certsList : ['POP K3 Pratama'],
            mandatoryTrainingModules: modsList.length > 0 ? modsList : ['Leadership 101'],
            competencies: parsedComps,
            activeIncumbentName: 'Belum Ditugaskan',
            incumbentTnaScore: 100,
            incumbentFitScore: 85
          };

          newlyAdded.push(newItem);
          addedCount++;
        });

        if (addedCount > 0) {
          setStandardsList(prev => [...newlyAdded, ...prev]);
          setSelectedStdId(newlyAdded[0].id);
        }

        setIsImportModalOpen(false);

        if (addedCount > 0 && skippedCount > 0) {
          addToast(
            '⚡ [Import Berhasil & Deduplikasi]',
            `Berhasil menambahkan ${addedCount} standar baru. ${skippedCount} data dilewati karena nama jabatan sudah ada di sistem.`,
            'success'
          );
        } else if (addedCount > 0 && skippedCount === 0) {
          addToast(
            '⚡ [Import Berhasil]',
            `Seluruh ${addedCount} standar jabatan baru berhasil ditambahkan ke sistem.`,
            'success'
          );
        } else {
          addToast(
            'ℹ️ [Semua Data Sudah Ada]',
            `Seluruh ${skippedCount} data di file Excel dilewati karena sudah terdaftar sebelumnya (tidak ada duplikasi).`,
            'info'
          );
        }
      } catch (err) {
        addToast('Gagal Import', 'Format file Excel tidak sesuai atau rusak. Gunakan template resmi.', 'error');
      }
    };

    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --------------------------------------------------------------------------
  // TAB 1 BULK ACTIONS
  // --------------------------------------------------------------------------
  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === filteredStandards.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredStandards.map(s => s.id)));
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedRowIds.size === 0) return;
    const remaining = standardsList.filter(s => !selectedRowIds.has(s.id));
    if (remaining.length === 0) {
      addToast('Gagal Hapus', 'Harus ada minimal satu standar jabatan di sistem.', 'error');
      return;
    }

    const count = selectedRowIds.size;
    setStandardsList(remaining);
    setSelectedStdId(remaining[0]?.id || '');
    setSelectedRowIds(new Set());
    setIsBulkDeleteConfirmOpen(false);
    addToast('Hapus Massal Berhasil', `${count} standar jabatan terpilih telah dihapus.`, 'info');
  };

  const handleBulkExportSelected = () => {
    const selectedItems = standardsList.filter(s => selectedRowIds.has(s.id));
    if (selectedItems.length === 0) return;
    handleExportExcel(selectedItems, `${selectedItems.length}_Terpilih`);
  };

  // --------------------------------------------------------------------------
  // TAB 2 (COMPETENCY DICTIONARY) TEMPLATE, IMPORT & EXPORT HANDLERS
  // --------------------------------------------------------------------------
  const handleDownloadCompTemplate = () => {
    const templateRows = [
      {
        'Kode Kompetensi': 'CMP_TECH_01',
        'Nama Kompetensi': 'Heavy Equipment Telematics & Fleet Dispatch',
        'Kategori': 'Technical',
        'Deskripsi': 'Kemampuan mengoperasikan sistem dispatch GPS real-time dan telemetry alat berat untuk optimalisasi ritase tambang.',
        'Level 1 (Awareness)': 'Mengetahui nama dan fungsi sistem fleet dispatch telematics.',
        'Level 2 (Basic)': 'Mampu membaca dashboard antrian shovel dan status unit alat berat.',
        'Level 3 (Competent)': 'Mampu mengalokasikan armada dump truck secara mandiri sesuai target loading.',
        'Level 4 (Advanced)': 'Mampu mengoptimalkan algoritma dispatch dinamis dan memangkas idle time operasional.',
        'Level 5 (Expert)': 'Merancang arsitektur telematics otonom dan memimpin integrasi fleet management system korporat.'
      },
      {
        'Kode Kompetensi': 'CMP_DATA_01',
        'Nama Kompetensi': 'HR Analytics & Workforce Predictive Modeling',
        'Kategori': 'Technical',
        'Deskripsi': 'Kemampuan menganalisis data SDM, retensi karyawan, headcount forecasting, dan dashboard performa talenta.',
        'Level 1 (Awareness)': 'Memahami metrik dasar HR seperti turnover rate dan headcount.',
        'Level 2 (Basic)': 'Mampu mengolah laporan HR bulanan menggunakan Excel dan spreadsheet.',
        'Level 3 (Competent)': 'Mampu membangun dashboard interaktif Power BI / Tableau untuk talent analytics.',
        'Level 4 (Advanced)': 'Mampu melakukan pemodelan prediktif turnover risiko suksesi dan flight risk karyawan.',
        'Level 5 (Expert)': 'Merumuskan strategi data-driven talent architecture dan standardisasi People Analytics enterprise.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 18 }, { wch: 40 }, { wch: 22 }, { wch: 50 },
      { wch: 45 }, { wch: 45 }, { wch: 45 }, { wch: 45 }, { wch: 50 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Kamus_Kompetensi');
    XLSX.writeFile(wb, 'Template_Kamus_Kompetensi_5Level.xlsx');
    addToast('Template Diunduh', 'File Template_Kamus_Kompetensi_5Level.xlsx siap digunakan.', 'success');
  };

  const handleExportCompExcel = (compsToExport: CompetencyItem[], suffix = 'Semua') => {
    const exportRows = compsToExport.map((c, idx) => ({
      'No': idx + 1,
      'Kode': c.code,
      'Nama Kompetensi': c.name,
      'Kategori': c.category,
      'Deskripsi': c.description,
      'Level 1 (Awareness)': c.levels[1]?.behaviorIndicators?.[0] || '-',
      'Level 2 (Basic)': c.levels[2]?.behaviorIndicators?.[0] || '-',
      'Level 3 (Competent)': c.levels[3]?.behaviorIndicators?.[0] || '-',
      'Level 4 (Advanced)': c.levels[4]?.behaviorIndicators?.[0] || '-',
      'Level 5 (Expert)': c.levels[5]?.behaviorIndicators?.[0] || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 35 }, { wch: 22 }, { wch: 50 },
      { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kamus_Kompetensi');
    XLSX.writeFile(wb, `Data_Kamus_Kompetensi_${suffix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast('Export Berhasil', `Berhasil mengekspor ${compsToExport.length} kamus kompetensi ke Excel.`, 'success');
  };

  const handleCompFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          addToast('File Kosong', 'File Excel kamus kompetensi tidak memiliki data.', 'error');
          return;
        }

        let addedCount = 0;
        let skippedCount = 0;

        rawData.forEach((row) => {
          const rawName = String(row['Nama Kompetensi'] || row['nama_kompetensi'] || row['name'] || '').trim();
          const rawCode = String(row['Kode Kompetensi'] || row['Kode'] || row['code'] || `CMP_${Date.now()}`).trim();

          if (!rawName) return;

          // DEDUPLICATION: Cek nama atau kode kompetensi
          const alreadyExists = competencies.some(
            (c) => c.name.toLowerCase().trim() === rawName.toLowerCase() || c.code.toLowerCase().trim() === rawCode.toLowerCase()
          );

          if (alreadyExists) {
            skippedCount++;
            return; // SKIP DATA YANG SUDAH ADA!
          }

          const rawCat = String(row['Kategori'] || row['category'] || 'Technical').trim();
          const validCat: CompetencyCategory = COMPETENCY_CATEGORIES.includes(rawCat as CompetencyCategory)
            ? (rawCat as CompetencyCategory)
            : 'Technical';

          const desc = String(row['Deskripsi'] || row['description'] || 'Definisi standar kompetensi.').trim();

          const l1 = String(row['Level 1 (Awareness)'] || row['Level 1'] || 'Mengenal konsep dasar.').trim();
          const l2 = String(row['Level 2 (Basic)'] || row['Level 2'] || 'Menerapkan dengan panduan supervisor.').trim();
          const l3 = String(row['Level 3 (Competent)'] || row['Level 3'] || 'Mampu mengeksekusi secara mandiri.').trim();
          const l4 = String(row['Level 4 (Advanced)'] || row['Level 4'] || 'Mengembangkan metode dan membimbing orang lain.').trim();
          const l5 = String(row['Level 5 (Expert)'] || row['Level 5'] || 'Ahli rujukan dan merumuskan inovasi strategis.').trim();

          addCompetency({
            code: rawCode,
            name: rawName,
            category: validCat,
            description: desc,
            levels: {
              1: { level: 1, name: 'Awareness', behaviorIndicators: [l1] },
              2: { level: 2, name: 'Basic', behaviorIndicators: [l2] },
              3: { level: 3, name: 'Competent', behaviorIndicators: [l3] },
              4: { level: 4, name: 'Advanced', behaviorIndicators: [l4] },
              5: { level: 5, name: 'Expert', behaviorIndicators: [l5] }
            }
          });

          addedCount++;
        });

        setIsCompImportModalOpen(false);

        if (addedCount > 0 && skippedCount > 0) {
          addToast(
            '⚡ [Import Kamus Berhasil & Deduplikasi]',
            `Berhasil menambahkan ${addedCount} kompetensi baru. ${skippedCount} data dilewati karena sudah ada di kamus.`,
            'success'
          );
        } else if (addedCount > 0 && skippedCount === 0) {
          addToast(
            '⚡ [Import Kamus Berhasil]',
            `Seluruh ${addedCount} kompetensi baru berhasil ditambahkan ke kamus.`,
            'success'
          );
        } else {
          addToast(
            'ℹ️ [Semua Data Sudah Ada]',
            `Seluruh ${skippedCount} data dilewati karena sudah terdaftar di kamus master (tidak ada duplikasi).`,
            'info'
          );
        }
      } catch (err) {
        addToast('Gagal Import', 'Format file Excel tidak sesuai. Gunakan template resmi.', 'error');
      }
    };

    reader.readAsBinaryString(file);
    if (compFileInputRef.current) compFileInputRef.current.value = '';
  };

  // --------------------------------------------------------------------------
  // TAB 2 BULK ACTIONS (MULTI-SELECT)
  // --------------------------------------------------------------------------
  const handleToggleSelectCompRow = (id: string) => {
    setSelectedDictRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllComps = () => {
    if (selectedDictRowIds.size === filteredCompetencies.length) {
      setSelectedDictRowIds(new Set());
    } else {
      setSelectedDictRowIds(new Set(filteredCompetencies.map(c => c.id)));
    }
  };

  const handleBulkDeleteCompsConfirm = () => {
    if (selectedDictRowIds.size === 0) return;
    const count = selectedDictRowIds.size;
    selectedDictRowIds.forEach(id => {
      deleteCompetency(id);
    });
    setSelectedDictRowIds(new Set());
    setIsCompBulkDeleteConfirmOpen(false);
    addToast('Hapus Massal Berhasil', `${count} kompetensi terpilih telah dihapus dari kamus.`, 'info');
  };

  const handleBulkExportCompsSelected = () => {
    const selectedComps = competencies.filter(c => selectedDictRowIds.has(c.id));
    if (selectedComps.length === 0) return;
    handleExportCompExcel(selectedComps, `${selectedComps.length}_Terpilih`);
  };

  // --------------------------------------------------------------------------
  // TAB 2 COMPETENCY CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenCreateCompModal = () => {
    setCompModalMode('create');
    setCompEditId(null);
    setFormCompCode(`CMP_${Date.now().toString().slice(-4)}`);
    setFormCompName('');
    setFormCompCategory('Technical');
    setFormCompDesc('');
    setFormL1Indicators('Mengenal terminologi dan konsep dasar secara umum.');
    setFormL2Indicators('Mampu menerapkan prosedur standar dengan supervisi atasan.');
    setFormL3Indicators('Mampu mengeksekusi pekerjaan secara mandiri dan akurat tanpa kesalahan.');
    setFormL4Indicators('Mampu memecahkan anomali kompleks dan membimbing staf yunior.');
    setFormL5Indicators('Mampu merancang inovasi strategis dan menjadi rujukan ahli korporat.');
    setIsCompModalOpen(true);
  };

  const handleOpenEditCompModal = (comp: CompetencyItem) => {
    setCompModalMode('edit');
    setCompEditId(comp.id);
    setFormCompCode(comp.code);
    setFormCompName(comp.name);
    setFormCompCategory(comp.category);
    setFormCompDesc(comp.description);
    setFormL1Indicators(comp.levels[1]?.behaviorIndicators?.join('\n') || '');
    setFormL2Indicators(comp.levels[2]?.behaviorIndicators?.join('\n') || '');
    setFormL3Indicators(comp.levels[3]?.behaviorIndicators?.join('\n') || '');
    setFormL4Indicators(comp.levels[4]?.behaviorIndicators?.join('\n') || '');
    setFormL5Indicators(comp.levels[5]?.behaviorIndicators?.join('\n') || '');
    setIsCompModalOpen(true);
  };

  const handleOpenCompDetailModal = (comp: CompetencyItem) => {
    setDetailComp(comp);
    setIsCompDetailModalOpen(true);
  };

  const handlePromptDeleteComp = (comp: CompetencyItem) => {
    if (competencies.length <= 1) {
      addToast('Gagal Hapus', 'Harus ada minimal satu kompetensi di kamus.', 'error');
      return;
    }
    setDeleteCompCandidate(comp);
    setIsCompDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteComp = () => {
    if (!deleteCompCandidate) return;
    deleteCompetency(deleteCompCandidate.id);
    setIsCompDeleteConfirmOpen(false);
    setDeleteCompCandidate(null);
    addToast('Kompetensi Dihapus', `Kompetensi ${deleteCompCandidate.name} telah dihapus.`, 'info');
  };

  const handleSaveCompetencyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompName.trim()) {
      addToast('Validasi Gagal', 'Nama Kompetensi wajib diisi.', 'error');
      return;
    }

    const l1List = formL1Indicators.split('\n').map(s => s.trim()).filter(Boolean);
    const l2List = formL2Indicators.split('\n').map(s => s.trim()).filter(Boolean);
    const l3List = formL3Indicators.split('\n').map(s => s.trim()).filter(Boolean);
    const l4List = formL4Indicators.split('\n').map(s => s.trim()).filter(Boolean);
    const l5List = formL5Indicators.split('\n').map(s => s.trim()).filter(Boolean);

    const compData: CompetencyItem = {
      id: compEditId || `CMP_${Date.now()}`,
      code: formCompCode,
      name: formCompName,
      category: formCompCategory,
      description: formCompDesc,
      levels: {
        1: { level: 1, name: 'Awareness', behaviorIndicators: l1List.length > 0 ? l1List : ['Memahami dasar konsep.'] },
        2: { level: 2, name: 'Basic', behaviorIndicators: l2List.length > 0 ? l2List : ['Menerapkan dengan supervisi.'] },
        3: { level: 3, name: 'Competent', behaviorIndicators: l3List.length > 0 ? l3List : ['Mengeksekusi secara mandiri.'] },
        4: { level: 4, name: 'Advanced', behaviorIndicators: l4List.length > 0 ? l4List : ['Membimbing dan memecahkan anomali.'] },
        5: { level: 5, name: 'Expert', behaviorIndicators: l5List.length > 0 ? l5List : ['Merumuskan inovasi strategis.'] }
      }
    };

    if (compModalMode === 'create') {
      addCompetency(compData);
      setSelectedDictCompId(compData.id);
      addToast('Kompetensi Dibuat', `Kompetensi ${formCompName} berhasil ditambahkan ke kamus.`, 'success');
    } else if (compModalMode === 'edit' && compEditId) {
      updateCompetency(compData);
      addToast('Kompetensi Diperbarui', `Perubahan untuk ${formCompName} berhasil disimpan.`, 'success');
    }

    setIsCompModalOpen(false);
  };

  // --------------------------------------------------------------------------
  // TAB 1 CRUD FORM HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditId(null);
    setFormTitle('');
    setFormDept('Operations');
    setFormLevel('Supervisor');
    setFormGrade('G4');
    setFormMinEdu('S1');
    setFormMinTenure(3);
    setFormCertsText('POP K3 Pratama, Sertifikasi K3 Umum');
    setFormModulesText('Leadership 101, Safety Mining Practice, Cost Management');
    setFormCompetencies([
      { id: competencies[0]?.id || 'CMP_01', name: competencies[0]?.name || 'HSE Mindset', category: 'HSE & Compliance', requiredLevel: 3, levelName: 'Competent', sampleIndicator: 'Mematuhi standar keselamatan kerja dan SOP.', isCritical: true }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: UnifiedStandardItem) => {
    setModalMode('edit');
    setEditId(std.id);
    setFormTitle(std.title);
    setFormDept(std.department);
    setFormLevel(std.level);
    setFormGrade(std.grade);
    setFormMinEdu(std.minEdu);
    setFormMinTenure(std.minTenureYears);
    setFormCertsText(std.mandatoryCertifications.join(', '));
    setFormModulesText(std.mandatoryTrainingModules.join(', '));
    setFormCompetencies([...std.competencies]);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (std: UnifiedStandardItem) => {
    setDetailStd(std);
    setIsDetailModalOpen(true);
  };

  const handlePromptDelete = (std: UnifiedStandardItem) => {
    if (standardsList.length <= 1) {
      addToast('Gagal Hapus', 'Harus ada minimal satu standar jabatan di sistem.', 'error');
      return;
    }
    setDeleteCandidate(std);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const id = deleteCandidate.id;
    const title = deleteCandidate.title;

    setStandardsList(prev => prev.filter(s => s.id !== id));
    if (selectedStdId === id) {
      const remaining = standardsList.filter(s => s.id !== id);
      setSelectedStdId(remaining[0]?.id || '');
    }
    setIsDeleteConfirmOpen(false);
    setDeleteCandidate(null);
    addToast('Standar Jabatan Dihapus', `Standar untuk ${title} berhasil dihapus.`, 'info');
  };

  const handleSaveStandardForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('Validasi Gagal', 'Nama Jabatan wajib diisi.', 'error');
      return;
    }

    const certs = formCertsText.split(',').map(s => s.trim()).filter(Boolean);
    const modules = formModulesText.split(',').map(s => s.trim()).filter(Boolean);

    if (modalMode === 'create') {
      const newStd: UnifiedStandardItem = {
        id: `STD-${Date.now()}`,
        title: formTitle,
        department: formDept,
        level: formLevel,
        grade: formGrade,
        minEdu: formMinEdu,
        minTenureYears: formMinTenure,
        mandatoryCertifications: certs,
        mandatoryTrainingModules: modules,
        competencies: formCompetencies,
        activeIncumbentName: 'Belum Ditugaskan',
        incumbentTnaScore: 100,
        incumbentFitScore: 85
      };

      setStandardsList(prev => [newStd, ...prev]);
      setSelectedStdId(newStd.id);
      addToast('Standar Jabatan Dibuat', `Standar kualifikasi & kompetensi untuk ${formTitle} berhasil disimpan.`, 'success');
    } else if (modalMode === 'edit' && editId) {
      setStandardsList(prev => prev.map(s => {
        if (s.id === editId) {
          return {
            ...s,
            title: formTitle,
            department: formDept,
            level: formLevel,
            grade: formGrade,
            minEdu: formMinEdu,
            minTenureYears: formMinTenure,
            mandatoryCertifications: certs,
            mandatoryTrainingModules: modules,
            competencies: formCompetencies
          };
        }
        return s;
      }));
      addToast('Standar Jabatan Diperbarui', `Perubahan standar untuk ${formTitle} telah disimpan.`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleAddCompetencyToForm = (compId: string, targetLevel: ProficiencyLevel) => {
    const compObj = competencies.find(c => c.id === compId);
    if (!compObj) return;

    if (formCompetencies.some(c => c.id === compId)) {
      addToast('Kompetensi Sudah Ada', 'Kompetensi ini sudah ada di daftar requirement.', 'error');
      return;
    }

    const levelNames: Record<number, string> = { 1: 'Awareness', 2: 'Basic', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };
    const sample = compObj.levels?.[targetLevel]?.behaviorIndicators?.[0] || 'Menerapkan keahlian sesuai standar.';

    setFormCompetencies(prev => [
      ...prev,
      {
        id: compObj.id,
        name: compObj.name,
        category: compObj.category,
        requiredLevel: targetLevel,
        levelName: levelNames[targetLevel],
        sampleIndicator: sample,
        isCritical: true
      }
    ]);
  };

  const handleRemoveCompetencyFromForm = (compId: string) => {
    setFormCompetencies(prev => prev.filter(c => c.id !== compId));
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === assessEmpId);
    const comp = competencies.find((x) => x.id === assessCompId);
    if (!emp || !comp) return;

    recordEmployeeAssessment({
      employeeId: emp.id,
      employeeName: emp.name,
      competencyId: comp.id,
      competencyName: comp.name,
      currentLevel: assessLevel,
      assessedDate: new Date().toISOString().split('T')[0],
      assessedBy: 'Lead Assessor / Direct Manager',
      method: assessMethod,
      notes: assessNotes
    });

    setIsAssessmentModalOpen(false);
    setAssessNotes('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Sub Navigation Bar - 3 Focused Grand Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          {/* TAB 1: UNIFIED SINGLE VIEW & TABLE VIEW */}
          <button
            onClick={() => setActiveSubTab('unified')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'unified'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Standar Jabatan Harmonisasi ({standardsList.length})</span>
          </button>

          {/* TAB 2: COMPETENCY LIBRARY */}
          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kamus 5-Level Kompetensi ({competencies.length})</span>
          </button>

          {/* TAB 3: AUDIT GAP & HEATMAP */}
          <button
            onClick={() => setActiveSubTab('gap-audit')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'gap-audit'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Audit Gap &amp; Matriks TNA</span>
            {competencyGaps.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'gap-audit' ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {competencyGaps.length} Gap
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssessmentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Input Asesmen</span>
          </button>
        </div>
      </div>

      {/* Subtab Contents Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* ========================================================================= */}
        {/* TAB 1: ⚡ PROFIL HARMONISASI STANDAR JABATAN (SINGLE VIEW, TABLE VIEW & CRUD) */}
        {/* ========================================================================= */}
        {activeSubTab === 'unified' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header Control & View Mode Switcher */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              {/* Top Row: Title & View Mode Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Harmonized Job Specification Studio</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Standar Kualifikasi (TNA) &amp; Kemahiran Kompetensi Jabatan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
                    Kelola master syarat kualifikasi formal (TNA / Hard Criteria) dan standar kemahiran 5-level kompetensi perilaku untuk setiap jabatan.
                  </p>
                </div>

                {/* View Mode Toggle Switcher */}
                <div className="flex items-center self-start lg:self-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => setUnifiedViewMode('single')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      unifiedViewMode === 'single'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu Detail</span>
                  </button>

                  <button
                    onClick={() => setUnifiedViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      unifiedViewMode === 'table'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabel Standar ({standardsList.length})</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Excel Toolbar, PDF & Action Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Excel Utility Group */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <button
                      onClick={handleDownloadTemplate}
                      title="Unduh Template Excel Format Standar Jabatan"
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Template</span>
                    </button>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Import Excel</span>
                    </button>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <button
                      onClick={() => handleExportExcel(standardsList, 'Semua')}
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export Excel</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      generateUnifiedJobProfilePDF(
                        activeStd.title,
                        activeStd.department,
                        activeStd.level,
                        activeStd.grade,
                        {
                          minEducation: activeStd.minEdu,
                          minTenureYears: activeStd.minTenureYears,
                          mandatoryCertifications: activeStd.mandatoryCertifications,
                          mandatoryTrainingModules: activeStd.mandatoryTrainingModules
                        },
                        activeStd.competencies.map((c) => ({
                          name: c.name,
                          category: c.category,
                          requiredLevel: c.requiredLevel,
                          levelName: c.levelName,
                          behaviorIndicatorSample: c.sampleIndicator
                        }))
                      );
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Cetak Profil Jabatan Standar (PDF)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cetak PDF</span>
                  </button>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Standar Baru</span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* VIEW MODE 1: DUAL COLUMN CARD SINGLE-VIEW */}
            {/* ----------------------------------------------------------------- */}
            {unifiedViewMode === 'single' && (
              <div className="space-y-6">
                {/* Position Switcher & Prominent CRUD Action Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="text-xs font-bold text-slate-700 shrink-0">Pilih Jabatan Standar:</span>
                    <select
                      value={selectedStdId}
                      onChange={(e) => setSelectedStdId(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-emerald-800 focus:outline-none focus:border-emerald-500 max-w-md w-full"
                    >
                      {standardsList.map((std) => (
                        <option key={std.id} value={std.id}>
                          {std.title} — {std.department} ({std.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenDetailModal(activeStd)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ringkasan Detail</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(activeStd)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit Standar Ini</span>
                    </button>

                    <button
                      onClick={() => handlePromptDelete(activeStd)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Split 2-Column High-Density Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: BAGIAN 1 — STANDAR KUALIFIKASI (TNA / HARD CRITERIA) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Bagian 1: Kualifikasi &amp; TNA</span>
                          <h3 className="text-sm font-bold text-slate-900">Syarat Administratif &amp; Kursus Wajib</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Hard Criteria
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Pendidikan Formal Minimum</span>
                        <strong className="text-xs text-slate-800 block">{activeStd.minEdu} (Sesuai Kualifikasi Bidang)</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Pengalaman / Masa Kerja</span>
                        <strong className="text-xs text-slate-800 block">Min. {activeStd.minTenureYears} Tahun pada posisi relevan</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Sertifikasi &amp; Lisensi Wajib</span>
                        <div className="space-y-1.5">
                          {activeStd.mandatoryCertifications.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">4. Modul Pelatihan Kurikulum Wajib</span>
                        <div className="space-y-1.5">
                          {activeStd.mandatoryTrainingModules.map((mod, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{mod}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: BAGIAN 2 — STANDAR KEMAHIRAN (5-LEVEL COMPETENCY) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Bagian 2: Kompetensi Perilaku</span>
                          <h3 className="text-sm font-bold text-slate-900">Standar Kemahiran 5-Level (Proficiency Matrix)</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Behavioral Scale (1-5)
                        </span>
                      </div>

                      <div className="space-y-3">
                        {activeStd.competencies.map((comp, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition-colors space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400">{comp.id} • {comp.category}</span>
                                <h4 className="text-xs font-bold text-slate-900 mt-0.5">{comp.name}</h4>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                  Target: Level {comp.requiredLevel} ({comp.levelName})
                                </span>
                              </div>
                            </div>

                            <div className="p-2 rounded-lg bg-white border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                              <span className="font-semibold text-slate-700">Indikator Perilaku Utama: </span>
                              <span>"{comp.sampleIndicator}"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Unified Closed-Loop Synergy Card */}
                <div className="p-5 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Live Incumbent Audit &amp; Closed-Loop Synergy</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        Evaluasi Karyawan Pemegang Jabatan: <strong className="text-amber-300">{activeStd.activeIncumbentName || 'Ahmad Faqih Didin'}</strong>
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-[9px] text-slate-300 uppercase block">Kualifikasi TNA</span>
                        <span className="text-xs font-bold text-emerald-400">{activeStd.incumbentTnaScore || 100}% Lolos ✓</span>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-[9px] text-slate-300 uppercase block">Kompetensi Fit</span>
                        <span className="text-xs font-bold text-amber-300">{activeStd.incumbentFitScore || 84}% Fit</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed">
                    💡 <strong className="text-white">Harmonisasi Sistem:</strong> Karyawan telah memenuhi 100% syarat formal administratif (ijazah, masa kerja, dan sertifikat K3). Gap kompetensi tidak menggugurkan jabatan, melainkan ditutup melalui penugasan terarah pada program <strong className="text-white">IDP 70:20:10</strong>.
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        setActiveTab('performance-dev');
                        setDomainSubTab('performanceDev', 'idp');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ Buka IDP 70:20:10 Karyawan Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW MODE 2: CONSOLIDATED CORPORATE MATRIX TABLE VIEW */}
            {/* ----------------------------------------------------------------- */}
            {unifiedViewMode === 'table' && (
              <div className="space-y-4">
                {/* Search, Filter & Bulk Actions Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari jabatan atau departemen..."
                        value={tableSearchQuery}
                        onChange={(e) => setTableSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <select
                      value={tableDeptFilter}
                      onChange={(e) => setTableDeptFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">Semua Departemen</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select
                      value={tableLevelFilter}
                      onChange={(e) => setTableLevelFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">Semua Level</option>
                      {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <span className="text-xs text-slate-500 font-semibold">
                    Menampilkan <strong className="text-slate-900">{filteredStandards.length}</strong> Standar Jabatan
                  </span>
                </div>

                {/* Floating Bulk Actions Bar (When Items Selected) */}
                {selectedRowIds.size > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                        {selectedRowIds.size}
                      </span>
                      <span className="font-bold">Standar Jabatan Terpilih</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkExportSelected}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export Terpilih ({selectedRowIds.size})</span>
                      </button>

                      <button
                        onClick={() => setIsBulkDeleteConfirmOpen(true)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Terpilih ({selectedRowIds.size})</span>
                      </button>

                      <button
                        onClick={() => setSelectedRowIds(new Set())}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <th className="py-3.5 px-3 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedRowIds.size === filteredStandards.length && filteredStandards.length > 0}
                              onChange={handleToggleSelectAll}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Pilih Semua"
                            />
                          </th>
                          <th className="py-3.5 px-4">Jabatan &amp; Departemen</th>
                          <th className="py-3.5 px-4 text-center">Level / Grade</th>
                          <th className="py-3.5 px-4 text-center">Pendidikan / Masa Kerja</th>
                          <th className="py-3.5 px-4">Sertifikasi Legal (TNA)</th>
                          <th className="py-3.5 px-4">Modul Wajib Kurikulum</th>
                          <th className="py-3.5 px-4 text-center">Standar Kompetensi</th>
                          <th className="py-3.5 px-4 text-center">Incumbent &amp; Fit</th>
                          <th className="py-3.5 px-4 text-center">Aksi Manajemen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStandards.map((std) => {
                          const isSelected = selectedRowIds.has(std.id);
                          return (
                            <tr key={std.id} className={`transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'}`}>
                              <td className="py-3.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectRow(std.id)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 block text-xs">{std.title}</span>
                                <span className="text-[11px] text-slate-500">{std.department}</span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="font-semibold text-slate-800 block">{std.level}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  {std.grade}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="font-bold text-slate-900 block">{std.minEdu}</span>
                                <span className="text-[11px] text-slate-500">Min. {std.minTenureYears} Thn</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {std.mandatoryCertifications.map((c, i) => (
                                    <span key={i} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {std.mandatoryTrainingModules.map((m, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                                  {std.competencies.length} Kompetensi
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="font-semibold text-slate-800 block text-[11px]">{std.activeIncumbentName || '-'}</span>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  Fit {std.incumbentFitScore || 85}%
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenDetailModal(std)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                                    title="Lihat Detail Standar"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Detail</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditModal(std)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                                    title="Edit Standar"
                                  >
                                    <Edit2 className="w-3 h-3 text-blue-600" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handlePromptDelete(std)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                                    title="Hapus Standar"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KAMUS & LIBRARY KOMPETENSI (5-LEVEL DICTIONARY, TABLE & BULK CRUD) */}
        {/* ========================================================================= */}
        {activeSubTab === 'library' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header Control & Actions Toolbar for Dictionary */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              {/* Top Row: Title & View Mode Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Master Competency Dictionary</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Kamus Standar Kompetensi &amp; 5-Level Kemahiran
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
                    Standarisasi definisi kompetensi perilaku &amp; teknis dari Level 1 (Awareness) sampai Level 5 (Expert) dengan indikator terukur.
                  </p>
                </div>

                {/* View Mode Toggle Switcher */}
                <div className="flex items-center self-start lg:self-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => setDictViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dictViewMode === 'split'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Split Kartu</span>
                  </button>

                  <button
                    onClick={() => setDictViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dictViewMode === 'table'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabel Kamus ({competencies.length})</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Excel Toolbar, PDF & Action Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Excel Utility Group */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <button
                      onClick={handleDownloadCompTemplate}
                      title="Unduh Template Excel Format Kamus Kompetensi"
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Template</span>
                    </button>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <button
                      onClick={() => setIsCompImportModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Import Excel</span>
                    </button>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <button
                      onClick={() => handleExportCompExcel(competencies, 'Semua')}
                      className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export Excel</span>
                    </button>
                  </div>

                  {/* Cetak Kamus PDF */}
                  <button
                    onClick={() => generateCompetencyDictionaryPDF(competencies, filterCat)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Cetak Buku Kamus Kompetensi Lengkap (PDF)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cetak PDF</span>
                  </button>
                </div>

                {/* Primary Add Button */}
                <button
                  onClick={handleOpenCreateCompModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kompetensi Baru</span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* VIEW MODE 1: SPLIT 2-COLUMN CARD DICTIONARY VIEW */}
            {/* ----------------------------------------------------------------- */}
            {dictViewMode === 'split' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari kode atau nama kompetensi..."
                        value={dictSearchQuery}
                        onChange={(e) => setDictSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <select
                      value={filterCat}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">Semua Kategori</option>
                      {COMPETENCY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <span className="text-xs text-slate-500 font-semibold">
                    Menampilkan <strong className="text-slate-900">{filteredCompetencies.length}</strong> dari {competencies.length} Kompetensi
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: List of Competencies */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Daftar Kompetensi Master ({filteredCompetencies.length})
                    </span>

                    <div className="space-y-2 max-h-150 overflow-y-auto custom-scrollbar pr-1">
                      {filteredCompetencies.map((comp) => {
                        const isSelected = comp.id === selectedDictCompId;
                        return (
                          <div
                            key={comp.id}
                            onClick={() => setSelectedDictCompId(comp.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'bg-white border-slate-200/80 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-400 font-mono">{comp.code}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {comp.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{comp.name}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{comp.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: 5 Levels Detailed Breakdown */}
                  <div className="lg:col-span-7 space-y-4">
                    {activeDictComp && (
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-4 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-emerald-700 font-mono">{activeDictComp.code}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-semibold text-slate-500">{activeDictComp.category}</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900">{activeDictComp.name}</h3>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeDictComp.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleOpenEditCompModal(activeDictComp)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handlePromptDeleteComp(activeDictComp)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-xs font-bold text-slate-900 block">Indikator Perilaku 5-Level:</span>

                          {([1, 2, 3, 4, 5] as ProficiencyLevel[]).map((lvl) => {
                            const levelData = activeDictComp.levels?.[lvl];
                            const lvlNames: Record<number, string> = { 1: 'Awareness', 2: 'Basic', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };
                            return (
                              <div key={lvl} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                                      {lvl}
                                    </span>
                                    <span className="font-bold text-slate-900">Level {lvl} — {lvlNames[lvl]}</span>
                                  </div>
                                </div>

                                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1 pl-1">
                                  {(levelData?.behaviorIndicators || ['Mampu mendemonstrasikan perilaku standar sesuai level.']).map((ind, i) => (
                                    <li key={i} className="leading-relaxed">{ind}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW MODE 2: TABEL MASTER KAMUS KOMPETENSI (TABLE VIEW) */}
            {/* ----------------------------------------------------------------- */}
            {dictViewMode === 'table' && (
              <div className="space-y-4">
                {/* Search, Filter & Bulk Actions Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari kode atau nama kompetensi..."
                        value={dictSearchQuery}
                        onChange={(e) => setDictSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <select
                      value={filterCat}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">Semua Kategori</option>
                      {COMPETENCY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <span className="text-xs text-slate-500 font-semibold">
                    Menampilkan <strong className="text-slate-900">{filteredCompetencies.length}</strong> Kompetensi
                  </span>
                </div>

                {/* Floating Bulk Actions Bar for Competency Table */}
                {selectedDictRowIds.size > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                        {selectedDictRowIds.size}
                      </span>
                      <span className="font-bold">Kompetensi Terpilih</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkExportCompsSelected}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export Terpilih ({selectedDictRowIds.size})</span>
                      </button>

                      <button
                        onClick={() => setIsCompBulkDeleteConfirmOpen(true)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Terpilih ({selectedDictRowIds.size})</span>
                      </button>

                      <button
                        onClick={() => setSelectedDictRowIds(new Set())}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <th className="py-3.5 px-3 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedDictRowIds.size === filteredCompetencies.length && filteredCompetencies.length > 0}
                              onChange={handleToggleSelectAllComps}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Pilih Semua"
                            />
                          </th>
                          <th className="py-3.5 px-4">Kode &amp; Nama Kompetensi</th>
                          <th className="py-3.5 px-4">Kategori</th>
                          <th className="py-3.5 px-4">Deskripsi Kompetensi</th>
                          <th className="py-3.5 px-4 text-center">Level Kemahiran</th>
                          <th className="py-3.5 px-4 text-center">Aksi Manajemen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCompetencies.map((comp) => {
                          const isSelected = selectedDictRowIds.has(comp.id);
                          return (
                            <tr key={comp.id} className={`transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'}`}>
                              <td className="py-3.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectCompRow(comp.id)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-mono text-[10px] text-slate-400 block">{comp.code}</span>
                                <span className="font-bold text-slate-900 block text-xs">{comp.name}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {comp.category}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 max-w-sm">
                                <p className="text-[11px] text-slate-600 line-clamp-2">{comp.description}</p>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  5 Level Lengkap
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenCompDetailModal(comp)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                                    title="Lihat Detail Indikator 5-Level"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Detail</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditCompModal(comp)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                                    title="Edit Kompetensi"
                                  >
                                    <Edit2 className="w-3 h-3 text-blue-600" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handlePromptDeleteComp(comp)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                                    title="Hapus Kompetensi"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUDIT GAP KOMPETENSI & MATRIKS TNA */}
        {/* ========================================================================= */}
        {activeSubTab === 'gap-audit' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
            {isDemo && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Mode Demo (Read-Only):</strong> Modul Matriks Pelatihan &amp; Audit TNA dalam mode tinjauan. Penyesuaian konfigurasi dan bobot kualifikasi dikunci pada versi demo.</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase shrink-0">
                  READ-ONLY DEMO
                </span>
              </div>
            )}
            {/* Header Control & View Mode Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Audit &amp; Matrix Engine</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Audit Gap Kompetensi &amp; Matriks Pelatihan TNA
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                  Audit kesenjangan antara kemahiran riil karyawan vs standar jabatan untuk intervensi pelatihan dan pemenuhan kualifikasi.
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setGapAuditSubTab('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      gapAuditSubTab === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>

                  <button
                    onClick={() => setGapAuditSubTab('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      gapAuditSubTab === 'matrix'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Hanya Matriks Pelatihan</span>
                  </button>

                  <button
                    onClick={() => setGapAuditSubTab('gaps')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      gapAuditSubTab === 'gaps'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Daftar Gap ({competencyGaps.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gap Table (Collapsible Panel) */}
            {(gapAuditSubTab === 'all' || gapAuditSubTab === 'gaps') && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                      {competencyGaps.length}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Celah Kemahiran Kompetensi ({competencyGaps.length} Gap Aktif)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Intervensi langsung dengan klik <strong>Tutup Gap &amp; Luluskan</strong>.
                      </p>
                    </div>
                  </div>

                  {gapAuditSubTab === 'all' && (
                    <button
                      onClick={() => setIsGapPanelOpen((prev) => !prev)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs self-start sm:self-center"
                    >
                      {isGapPanelOpen ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sembunyikan Panel Gap</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          <span>Buka Panel Gap ({competencyGaps.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {(isGapPanelOpen || gapAuditSubTab === 'gaps') && (
                  <div className={`${gapAuditSubTab === 'all' ? 'max-h-72' : ''} overflow-y-auto custom-scrollbar`}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-100/90 backdrop-blur-xs text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2.5 px-4">Karyawan</th>
                          <th className="py-2.5 px-4">Kompetensi</th>
                          <th className="py-2.5 px-4 text-center">Standar Req</th>
                          <th className="py-2.5 px-4 text-center">Level Aktual</th>
                          <th className="py-2.5 px-4 text-center">Gap</th>
                          <th className="py-2.5 px-4">Rekomendasi Modul Pelatihan</th>
                          <th className="py-2.5 px-4 text-center">Aksi Closed-Loop</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {competencyGaps.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              ✓ Tidak ada gap kompetensi aktif. Seluruh personil memenuhi standar kemahiran!
                            </td>
                          </tr>
                        ) : (
                          competencyGaps.map((gap, i) => (
                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-4">
                                <span className="font-bold text-slate-900 block">{gap.employeeName}</span>
                                <span className="text-[11px] text-slate-500">{gap.jobTitle} • {gap.department}</span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="font-semibold text-slate-800 block">{gap.competencyName}</span>
                                <span className="text-[10px] text-slate-400">{gap.category}</span>
                              </td>
                              <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                                Level {gap.requiredLevel}
                              </td>
                              <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                                Level {gap.currentLevel}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                  gap.gap <= -2 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {gap.gap}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1.5 max-w-xs">
                                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{gap.recommendedTrainingName || 'Pelatihan Akselerasi Kompetensi'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <button
                                  onClick={() => closeGapWithTrainingDirect(gap.employeeId, gap.competencyId, gap.recommendedTrainingId)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Tutup Gap &amp; Luluskan</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Matrix View Embedded */}
            {(gapAuditSubTab === 'all' || gapAuditSubTab === 'matrix') && (
              <div className="pt-2">
                <TrainingMatrixView />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: BULK IMPORT EXCEL KAMUS KOMPETENSI (DEDUPLIKASI) */}
      {/* ========================================================================= */}
      {isCompImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk Import Kamus Kompetensi (Excel / CSV)
                </h3>
              </div>
              <button onClick={() => setIsCompImportModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Smart Deduplication (Anti-Duplikasi Aktif)</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Sistem otomatis mengecek nama &amp; kode kompetensi. Data yang <strong>sudah ada di kamus akan dilewati (skip)</strong> dan hanya kompetensi baru yang akan ditambahkan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Belum punya template kamus?</span>
                  <span className="text-[11px] text-slate-500">Unduh format Excel (.xlsx) dengan 5-level indikator.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCompTemplate}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Template</span>
                </button>
              </div>

              <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center space-y-2 bg-slate-50/50">
                <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Pilih File Excel (.xlsx, .xls, .csv)</span>
                  <span className="text-[11px] text-slate-500">Klik tombol di bawah untuk mengunggah file.</span>
                </div>

                <input
                  type="file"
                  ref={compFileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleCompFileUpload}
                  className="hidden"
                  id="excelCompFileInput"
                />

                <label
                  htmlFor="excelCompFileInput"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs mt-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih &amp; Mulai Import</span>
                </label>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setIsCompImportModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH / EDIT KAMUS KOMPETENSI (CRUD FORM) */}
      {/* ========================================================================= */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {compModalMode === 'create' ? 'Tambah Kompetensi Baru' : `Edit Kompetensi: ${formCompName}`}
                </h3>
              </div>
              <button onClick={() => setIsCompModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompetencyForm} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Kompetensi *</label>
                  <input
                    type="text"
                    required
                    value={formCompCode}
                    onChange={(e) => setFormCompCode(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kompetensi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Heavy Equipment Reliability"
                    value={formCompName}
                    onChange={(e) => setFormCompName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Kompetensi</label>
                <select
                  value={formCompCategory}
                  onChange={(e) => setFormCompCategory(e.target.value as CompetencyCategory)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                >
                  {COMPETENCY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formCompDesc}
                  onChange={(e) => setFormCompDesc(e.target.value)}
                  placeholder="Ringkasan ruang lingkup keahlian..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5 Levels Indicators Inputs */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-900 block">Indikator Perilaku 5-Level (Proficiency Indicators)</span>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Level 1 (Awareness)</label>
                  <textarea
                    rows={1}
                    value={formL1Indicators}
                    onChange={(e) => setFormL1Indicators(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Level 2 (Basic)</label>
                  <textarea
                    rows={1}
                    value={formL2Indicators}
                    onChange={(e) => setFormL2Indicators(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Level 3 (Competent)</label>
                  <textarea
                    rows={1}
                    value={formL3Indicators}
                    onChange={(e) => setFormL3Indicators(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Level 4 (Advanced)</label>
                  <textarea
                    rows={1}
                    value={formL4Indicators}
                    onChange={(e) => setFormL4Indicators(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Level 5 (Expert)</label>
                  <textarea
                    rows={1}
                    value={formL5Indicators}
                    onChange={(e) => setFormL5Indicators(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {compModalMode === 'create' ? 'Simpan Kompetensi' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DETAIL LENGKAP KOMPETENSI (VIEW DETAIL POPUP) */}
      {/* ========================================================================= */}
      {isCompDetailModalOpen && detailComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Kamus Kompetensi &amp; Indikator 5-Level
                </h3>
              </div>
              <button onClick={() => setIsCompDetailModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-700 font-mono">{detailComp.code}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">{detailComp.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{detailComp.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detailComp.description}</p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Indikator Perilaku 5-Level:</span>
                {([1, 2, 3, 4, 5] as ProficiencyLevel[]).map((lvl) => {
                  const levelData = detailComp.levels?.[lvl];
                  const lvlNames: Record<number, string> = { 1: 'Awareness', 2: 'Basic', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };
                  return (
                    <div key={lvl} className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {lvl}
                        </span>
                        <span className="font-bold text-slate-900">Level {lvl} — {lvlNames[lvl]}</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1 pl-1">
                        {(levelData?.behaviorIndicators || ['Mampu mendemonstrasikan perilaku standar sesuai level.']).map((ind, i) => (
                          <li key={i} className="leading-relaxed">{ind}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => {
                  setIsCompDetailModalOpen(false);
                  handleOpenEditCompModal(detailComp);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Kompetensi Ini</span>
              </button>

              <button
                onClick={() => setIsCompDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI HAPUS SINGLE KOMPETENSI */}
      {/* ========================================================================= */}
      {isCompDeleteConfirmOpen && deleteCompCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Kompetensi dari Kamus?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus kompetensi <strong className="text-slate-900">{deleteCompCandidate.name}</strong> ({deleteCompCandidate.code})?
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCompDeleteConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteComp}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Kompetensi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: KONFIRMASI HAPUS MASSAL KOMPETENSI (BULK DELETE) */}
      {/* ========================================================================= */}
      {isCompBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus {selectedDictRowIds.size} Kompetensi Terpilih?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong className="text-rose-700 font-bold">{selectedDictRowIds.size} kompetensi</strong> yang telah Anda centang secara serentak dari kamus master?
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCompBulkDeleteConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleBulkDeleteCompsConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus {selectedDictRowIds.size} Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: BULK IMPORT EXCEL STANDAR JABATAN (TAB 1) */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk Import Standar Jabatan (Excel / CSV)
                </h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Smart Deduplication (Anti-Duplikasi Aktif)</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Sistem otomatis mengecek nama jabatan pada file Excel. Data yang <strong>sudah ada di sistem akan dilewati (skip)</strong> dan hanya data jabatan baru yang akan ditambahkan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Belum memiliki template?</span>
                  <span className="text-[11px] text-slate-500">Unduh format Excel (.xlsx) dengan contoh data standar.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Template</span>
                </button>
              </div>

              <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center space-y-2 bg-slate-50/50">
                <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Pilih File Excel (.xlsx, .xls, .csv)</span>
                  <span className="text-[11px] text-slate-500">Klik tombol di bawah untuk memilih file dari komputer Anda.</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excelStandardFileInput"
                />

                <label
                  htmlFor="excelStandardFileInput"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs mt-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih &amp; Mulai Import</span>
                </label>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DETAIL STANDAR JABATAN (TAB 1) */}
      {/* ========================================================================= */}
      {isDetailModalOpen && detailStd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Standar Spesifikasi Jabatan
                </h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{detailStd.department}</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{detailStd.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                      {detailStd.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Grade {detailStd.grade}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Pemegang Jabatan:</span>
                  <strong className="text-xs text-slate-900 font-bold block mt-0.5">{detailStd.activeIncumbentName || 'Belum Ditugaskan'}</strong>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    Fit Rate: {detailStd.incumbentFitScore || 85}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">1. Syarat Administratif &amp; Kursus Wajib (TNA)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pendidikan Min:</span>
                    <strong className="text-slate-800">{detailStd.minEdu} (Sesuai Bidang)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Masa Kerja Min:</span>
                    <strong className="text-slate-800">{detailStd.minTenureYears} Tahun</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Sertifikasi &amp; Lisensi Wajib:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailStd.mandatoryCertifications.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold text-[11px]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Modul Kurikulum Wajib:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailStd.mandatoryTrainingModules.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-slate-700 text-[11px]">
                        • {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">2. Standar Kemahiran 5-Level Kompetensi ({detailStd.competencies.length})</span>
                <div className="space-y-2">
                  {detailStd.competencies.map((comp, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{comp.name}</span>
                          <span className="text-[10px] text-slate-400">{comp.category}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                          Target: Level {comp.requiredLevel} ({comp.levelName})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">"{comp.sampleIndicator}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEditModal(detailStd);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Standar Ini</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: KONFIRMASI HAPUS SINGLE STANDAR JABATAN (TAB 1) */}
      {/* ========================================================================= */}
      {isDeleteConfirmOpen && deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Standar Jabatan?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus standar untuk <strong className="text-slate-900">{deleteCandidate.title}</strong> ({deleteCandidate.department})?
                Tindakan ini akan menghapus spesifikasi TNA dan matriks kemahiran kompetensi jabatan ini.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Standar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: KONFIRMASI HAPUS MASSAL STANDAR JABATAN (TAB 1) */}
      {/* ========================================================================= */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus {selectedRowIds.size} Standar Terpilih?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong className="text-rose-700 font-bold">{selectedRowIds.size} standar jabatan</strong> yang telah Anda pilih secara serentak?
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus {selectedRowIds.size} Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: TAMBAH / EDIT STANDAR JABATAN HARMONISASI (TAB 1 FORM) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalMode === 'create' ? 'Tambah Standar Jabatan Baru' : `Edit Standar Jabatan: ${formTitle}`}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStandardForm} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Jabatan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mine Safety Superintendent"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as Department)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level Jabatan</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as JobLevel)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Pendidikan</label>
                  <select
                    value={formMinEdu}
                    onChange={(e) => setFormMinEdu(e.target.value as EducationLevel)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {EDUCATION_LEVELS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min. Pengalaman / Masa Kerja (Tahun)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={formMinTenure}
                  onChange={(e) => setFormMinTenure(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                <span className="text-[11px] font-bold text-blue-900 block">Bagian 1: Syarat Administratif &amp; Kursus Wajib (TNA)</span>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sertifikasi &amp; Lisensi Wajib (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="POP K3 Pratama, BNSP Lead Trainer"
                    value={formCertsText}
                    onChange={(e) => setFormCertsText(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modul Pelatihan Kurikulum Wajib (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="Leadership Management, Safety Mining, Budget Control"
                    value={formModulesText}
                    onChange={(e) => setFormModulesText(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900">Bagian 2: Standar Kemahiran 5-Level Kompetensi</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{formCompetencies.length} Kompetensi Ditentukan</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id="addCompSelect"
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  >
                    {competencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
                  </select>

                  <select
                    id="addCompLvlSelect"
                    className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-emerald-800"
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3} selected>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const selComp = (document.getElementById('addCompSelect') as HTMLSelectElement).value;
                      const selLvl = Number((document.getElementById('addCompLvlSelect') as HTMLSelectElement).value) as ProficiencyLevel;
                      handleAddCompetencyToForm(selComp, selLvl);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {formCompetencies.map((comp) => (
                    <div key={comp.id} className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{comp.name}</span>
                        <span className="text-[10px] text-slate-400">{comp.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Level {comp.requiredLevel} ({comp.levelName})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetencyFromForm(comp.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {modalMode === 'create' ? 'Simpan Standar Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11: INPUT ASESMEN KOMPETENSI KARYAWAN */}
      {/* ========================================================================= */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Input Asesmen Kompetensi Karyawan</h3>
              </div>
              <button onClick={() => setIsAssessmentModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Karyawan</label>
                <select
                  value={assessEmpId}
                  onChange={(e) => setAssessEmpId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} — {e.jobTitle} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kompetensi</label>
                <select
                  value={assessCompId}
                  onChange={(e) => setAssessCompId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                >
                  {competencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Level Aktual (1-5)</label>
                  <select
                    value={assessLevel}
                    onChange={(e) => setAssessLevel(Number(e.target.value) as ProficiencyLevel)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-emerald-800"
                  >
                    <option value={1}>Level 1 (Awareness)</option>
                    <option value={2}>Level 2 (Basic)</option>
                    <option value={3}>Level 3 (Competent)</option>
                    <option value={4}>Level 4 (Advanced)</option>
                    <option value={5}>Level 5 (Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode Asesmen</label>
                  <select
                    value={assessMethod}
                    onChange={(e) => setAssessMethod(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    <option value="Manager">Manager Evaluation</option>
                    <option value="Assessor">Lead Assessor</option>
                    <option value="Self">Self-Assessment</option>
                    <option value="Certification">Ujian Sertifikasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Bukti Perilaku</label>
                <textarea
                  rows={3}
                  value={assessNotes}
                  onChange={(e) => setAssessNotes(e.target.value)}
                  placeholder="Deskripsikan bukti perilaku nyata atau proyek yang telah diselesaikan..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAssessmentModalOpen(false)} className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer">
                  Simpan Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
