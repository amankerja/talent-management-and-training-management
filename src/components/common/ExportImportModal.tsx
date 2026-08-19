import React, { useState, useRef, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  RefreshCw, 
  FileCheck, 
  Layers, 
  Users, 
  BookOpen, 
  TableProperties, 
  SlidersHorizontal, 
  Grid3X3, 
  TrendingUp, 
  Crown, 
  ArrowDownUp, 
  Check, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  ExportImportEntity, 
  ExportFormat, 
  exportDataset, 
  downloadImportTemplate, 
  parseImportFile, 
  ImportPreviewResult 
} from '../../utils/dataExportImport';

interface EntityOption {
  id: ExportImportEntity;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  count: number;
}

export const ExportImportModal: React.FC = () => {
  const { 
    isExportImportModalOpen, 
    setIsExportImportModalOpen,
    exportImportEntity,
    setExportImportEntity,
    exportImportTab,
    setExportImportTab,
    employees,
    trainingModules,
    tnaRules,
    criticalPositions,
    mppData,
    competencies,
    annualTrainingPlans,
    workforceMovements,
    getRuleFor,
    checkQualification,
    importEmployees,
    importTrainingModules,
    importTrainingMatrix,
    importTnaRules,
    importNineBoxCalibrations,
    importMppPlans,
    importCriticalPositions,
    restoreFullDatabaseBackup,
    addToast
  } = useWorkforce();

  // Export Settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');

  // Import Settings
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed File State
  const [parsedResult, setParsedResult] = useState<ImportPreviewResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const ENTITY_OPTIONS: EntityOption[] = useMemo(() => [
    {
      id: 'employees',
      label: 'Data Karyawan & Profil 360',
      shortLabel: 'Data Karyawan',
      description: 'Profil lengkap, NIP, posisi, level, rating 9-box, dan kompetensi radar.',
      icon: Users,
      count: employees.length
    },
    {
      id: 'training_modules',
      label: 'Katalog Modul Pelatihan',
      shortLabel: 'Katalog Modul',
      description: 'Kurikulum standar, kode modul, kategori, durasi jam, dan provider.',
      icon: BookOpen,
      count: trainingModules.length
    },
    {
      id: 'competencies',
      label: 'Kamus Kompetensi (Domain 03)',
      shortLabel: 'Kamus Kompetensi',
      description: 'Kamus 5 level kemahiran, deskripsi, dan indikator perilaku per tingkat.',
      icon: ShieldCheck,
      count: competencies.length
    },
    {
      id: 'annual_training_plan',
      label: 'Rencana Pelatihan Tahunan (ATP)',
      shortLabel: 'Rencana ATP',
      description: 'Jadwal bulanan program pelatihan, target peserta, dan estimasi anggaran per modul.',
      icon: FileSpreadsheet,
      count: annualTrainingPlans.length
    },
    {
      id: 'workforce_movements',
      label: 'Riwayat Pergerakan Karyawan',
      shortLabel: 'Log Mutasi & Promosi',
      description: 'Catatan SK promosi, mutasi, rotasi, demosi, transfer, dan status pergerakan.',
      icon: ArrowDownUp,
      count: workforceMovements.length
    },
    {
      id: 'training_matrix',
      label: 'Matriks & Riwayat Pelatihan',
      shortLabel: 'Matriks Pelatihan',
      description: 'Status kelulusan (Done/Progress/Gap), nilai ujian, nomor sertifikat, dan tanggal.',
      icon: TableProperties,
      count: employees.reduce((acc, e) => acc + Object.keys(e.trainings || {}).length, 0)
    },
    {
      id: 'tna_rules',
      label: 'Standar Kualifikasi & TNA',
      shortLabel: 'Standar TNA',
      description: 'Syarat pendidikan minimum, masa kerja, dan daftar modul pelatihan wajib per level.',
      icon: SlidersHorizontal,
      count: Object.keys(tnaRules).length
    },
    {
      id: 'ninebox',
      label: '9-Box & Kalibrasi Talenta',
      shortLabel: '9-Box Talenta',
      description: 'Hasil penilaian Kinerja (Performance) vs Potensi (Potential) dan status suksesi.',
      icon: Grid3X3,
      count: employees.length
    },
    {
      id: 'mpp',
      label: 'Rencana Manpower (MPP)',
      shortLabel: 'Manpower (MPP)',
      description: 'Perhitungan Demand vs Supply, gap per departemen, dan alokasi 4-Pilar intervensi.',
      icon: TrendingUp,
      count: mppData.length
    },
    {
      id: 'critical_positions',
      label: 'Posisi Kritis & Suksesi',
      shortLabel: 'Posisi Kritis',
      description: 'Daftar posisi vital organisasi, tingkat risiko, dan pipeline suksesor internal.',
      icon: Crown,
      count: criticalPositions.length
    },
    {
      id: 'all',
      label: 'Semua Database (Full Backup)',
      shortLabel: 'Semua Data (Full)',
      description: 'Seluruh tabel dan master data sekaligus (Multi-Sheet Excel atau Snapshot JSON).',
      icon: Database,
      count: employees.length + trainingModules.length + Object.keys(tnaRules).length + criticalPositions.length + mppData.length
    }
  ], [employees, trainingModules, tnaRules, criticalPositions, mppData, competencies, annualTrainingPlans, workforceMovements]);

  const activeEntityOption = ENTITY_OPTIONS.find(e => e.id === exportImportEntity) || ENTITY_OPTIONS[0];

  if (!isExportImportModalOpen) return null;

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const handleExport = () => {
    try {
      exportDataset(
        exportImportEntity,
        exportFormat,
        {
          employees,
          trainingModules,
          tnaRules,
          criticalPositions,
          mppData,
          competencies,
          annualTrainingPlans,
          movements: workforceMovements,
          getRuleFor,
          checkQualification
        }
      );
      addToast(
        'Export Berhasil Diunduh',
        `File ${activeEntityOption.shortLabel} format .${exportFormat.toUpperCase()} siap digunakan.`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      addToast('Gagal Export Data', err.message || 'Terjadi kesalahan saat memproses data.', 'error');
    }
  };

  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    try {
      downloadImportTemplate(exportImportEntity, format);
      addToast(
        'Template Diunduh',
        `Template ${activeEntityOption.shortLabel} format .${format.toUpperCase()} siap diisi.`,
        'info'
      );
    } catch (err: any) {
      console.error(err);
      addToast('Gagal Mengunduh Template', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleFileUpload = async (file: File) => {
    setParseError(null);
    setParsedResult(null);
    try {
      const result = await parseImportFile(file, exportImportEntity, employees, trainingModules);
      setParsedResult(result);
      if (result.errors.length > 0) {
        addToast(
          'Peringatan Validasi File',
          `Ditemukan ${result.errors.length} baris yang memiliki kendala format. Silakan periksa tabel pratinjau.`,
          'warning'
        );
      } else {
        addToast(
          'File Berhasil Dipindai',
          `${result.validRows} data valid terdeteksi siap di-import.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Gagal membaca format file.');
      addToast('Gagal Membaca File', err.message || 'Format file tidak didukung atau korup.', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedResult || parsedResult.validRows === 0) return;
    setIsProcessingImport(true);

    try {
      const entity = parsedResult.entityType || exportImportEntity;

      switch (entity) {
        case 'employees':
          await importEmployees(parsedResult.data, importMode);
          break;
        case 'training_modules':
          await importTrainingModules(parsedResult.data, importMode);
          break;
        case 'training_matrix':
          await importTrainingMatrix(parsedResult.data);
          break;
        case 'tna_rules':
          await importTnaRules(parsedResult.data, importMode);
          break;
        case 'ninebox':
          await importNineBoxCalibrations(parsedResult.data);
          break;
        case 'mpp':
          await importMppPlans(parsedResult.data, importMode);
          break;
        case 'critical_positions':
          await importCriticalPositions(parsedResult.data, importMode);
          break;
        case 'all':
          await restoreFullDatabaseBackup(parsedResult.data, importMode);
          break;
      }

      setParsedResult(null);
      setIsExportImportModalOpen(false);
    } catch (err: any) {
      console.error(err);
      addToast('Gagal Menyimpan Data Import', err.message || 'Terjadi kesalahan sistem saat menyimpan ke database.', 'error');
    } finally {
      setIsProcessingImport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* ======================================================================= */}
        {/* MODAL HEADER */}
        {/* ======================================================================= */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ArrowDownUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Pusat Export &amp; Import Data Hub
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  WorkforceOS Data Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ekspor data ke Excel/CSV/JSON atau impor data baru untuk memperbarui seluruh database.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportImportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================================= */}
        {/* MAIN TAB SWITCHER (EXPORT vs IMPORT vs BACKUP RESTORE) */}
        {/* ======================================================================= */}
        <div className="px-6 pt-3 pb-0 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setExportImportTab('export');
                setParsedResult(null);
                setParseError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 transition ${
                exportImportTab === 'export'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>1. Ekspor Data (Export)</span>
            </button>

            <button
              onClick={() => {
                setExportImportTab('import');
                setParsedResult(null);
                setParseError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 transition ${
                exportImportTab === 'import'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>2. Impor Data (Import &amp; Sinkronisasi)</span>
            </button>

            <button
              onClick={() => {
                setExportImportTab('backup');
                setExportImportEntity('all');
                setParsedResult(null);
                setParseError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 transition ${
                exportImportTab === 'backup'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>3. Backup &amp; Restore Lengkap</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MODAL BODY */}
        {/* ======================================================================= */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          {/* ENTITY PICKER PILLS (Hide on full backup tab) */}
          {exportImportTab !== 'backup' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Tabel / Kategori Halaman Data:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ENTITY_OPTIONS.filter(e => e.id !== 'all').map((opt) => {
                  const isSelected = exportImportEntity === opt.id;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setExportImportEntity(opt.id);
                        setParsedResult(null);
                        setParseError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-blue-200/80 text-blue-900' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {opt.count}
                        </span>
                      </div>

                      <div>
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                          {opt.shortLabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 1: EXPORT DATA */}
          {/* ======================================================================= */}
          {exportImportTab === 'export' && (
            <div className="space-y-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <activeEntityOption.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeEntityOption.label}</h4>
                    <p className="text-xs text-slate-500">{activeEntityOption.description}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                  Populasi: <strong className="text-blue-600">{activeEntityOption.count} Baris Data</strong>
                </span>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pilih Format File Output:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Excel */}
                  <div
                    onClick={() => setExportFormat('xlsx')}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      exportFormat === 'xlsx'
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Microsoft Excel (.xlsx)</p>
                      <p className="text-[10px] text-slate-500">Spreadsheet terformat &amp; rapi</p>
                    </div>
                  </div>

                  {/* CSV */}
                  <div
                    onClick={() => setExportFormat('csv')}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      exportFormat === 'csv'
                        ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">CSV Universal (.csv)</p>
                      <p className="text-[10px] text-slate-500">UTF-8 BOM siap buka di Excel</p>
                    </div>
                  </div>

                  {/* JSON */}
                  <div
                    onClick={() => setExportFormat('json')}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      exportFormat === 'json'
                        ? 'bg-white border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Structured JSON (.json)</p>
                      <p className="text-[10px] text-slate-500">Format data mentah API</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Semua kolom tabel dan data relasi akan disertakan secara lengkap.</span>
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File {exportFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 2: IMPORT DATA */}
          {/* ======================================================================= */}
          {exportImportTab === 'import' && (
            <div className="space-y-5">
              
              {/* Top: Template Download Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Gunakan Template Standar untuk {activeEntityOption.shortLabel}
                    </h4>
                    <p className="text-[11px] text-blue-800/80 mt-0.5">
                      Unduh template resmi dengan kolom yang sudah disesuaikan sebelum mengunggah file Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-blue-200 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Template Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTemplate('csv')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-blue-200 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Template CSV</span>
                  </button>
                </div>
              </div>

              {/* Middle: Mode Toggle (Merge vs Replace) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Mode Penggabungan Data (Sinkronisasi):
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {importMode === 'merge'
                      ? 'Merge (Direkomendasikan): Menambahkan baris baru dan memperbarui data yang NIP/Kode-nya sama tanpa menghapus data lain.'
                      : 'Replace Total: Menghapus seluruh data lama pada entitas ini dan menggantikannya dengan isi file baru.'}
                  </p>
                </div>

                <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200/80 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                      importMode === 'merge'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gabung / Update (Merge)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timpa Total (Replace)
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              {!parsedResult ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50/70 scale-101 ring-4 ring-blue-500/10'
                      : 'border-slate-300 hover:border-blue-500 bg-slate-50/40 hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, .json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Klik untuk Memilih File atau Seret File ke Sini
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mendukung format <strong>.xlsx</strong> (Excel), <strong>.csv</strong>, dan <strong>.json</strong>
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                    Maksimum ukuran file: 25 MB
                  </span>
                </div>
              ) : (
                /* Parsed Results & Validation Preview */
                <div className="space-y-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5">
                  
                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900">{parsedResult.fileName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Target Entitas: <strong>{activeEntityOption.label}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{parsedResult.validRows} Baris Valid</span>
                      </span>

                      {parsedResult.errors.length > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{parsedResult.errors.length} Anomali</span>
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setParsedResult(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                      >
                        Ganti File
                      </button>
                    </div>
                  </div>

                  {/* Errors / Warnings List (if any) */}
                  {parsedResult.errors.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                      <p className="font-bold text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Daftar Kesalahan Baris (Akan dilewati saat import):</span>
                      </p>
                      {parsedResult.errors.map((err, i) => (
                        <p key={i} className="text-rose-700 text-[11px] font-mono">
                          • Baris {err.row} [{err.field}]: {err.message}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Pratinjau 5 Baris Data Teratas:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Total {parsedResult.validRows} baris siap diproses
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar max-h-56">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {parsedResult.previewRows.length > 0 && 
                              Object.keys(parsedResult.previewRows[0]).slice(0, 6).map((k) => (
                                <th key={k} className="py-2 px-3 whitespace-nowrap">{k}</th>
                              ))
                            }
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedResult.previewRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              {Object.values(row).slice(0, 6).map((v: any, cIdx) => (
                                <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Confirm Button */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Data akan langsung disinkronkan ke file database SQLite lokal.
                    </span>

                    <button
                      onClick={handleExecuteImport}
                      disabled={isProcessingImport || parsedResult.validRows === 0}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-98 cursor-pointer"
                    >
                      {isProcessingImport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke Database...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Proses &amp; Simpan {parsedResult.validRows} Data</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 3: BACKUP & RESTORE LENGKAP */}
          {/* ======================================================================= */}
          {exportImportTab === 'backup' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Full Backup Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Ekspor Backup Lengkap Seluruh Database
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unduh salinan penuh seluruh data: Karyawan, Katalog Modul, Catatan Pelatihan, Standar TNA, Manpower Planning, dan Posisi Kritis.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setExportImportEntity('all');
                        setExportFormat('xlsx');
                        handleExport();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Unduh Multi-Sheet Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => {
                        setExportImportEntity('all');
                        setExportFormat('json');
                        handleExport();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition active:scale-98 cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                      <span>Unduh Full JSON Snapshot (.json)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Full Restore Card */}
                <div className="bg-linear-to-b from-amber-50/80 to-white border border-amber-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Pulihkan (Restore) Seluruh Database
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unggah file snapshot JSON atau Multi-Sheet Excel hasil backup untuk memulihkan seluruh data aplikasi ke kondisi sebelumnya.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setExportImportEntity('all');
                        setExportImportTab('import');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-3 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Backup untuk Restore</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* MODAL FOOTER */}
        {/* ======================================================================= */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Database SQLite Terenkripsi &amp; Tersinkronisasi Otomatis</span>
          </div>

          <button
            onClick={() => setIsExportImportModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
