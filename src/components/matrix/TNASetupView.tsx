import React, { useState, useEffect, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  Sliders, 
  Save, 
  PlusCircle, 
  CheckCircle2, 
  GraduationCap, 
  Clock, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  AlertCircle, 
  Check, 
  RotateCcw,
  Search,
  Copy,
  ChevronRight,
  Briefcase,
  Users,
  Minus,
  Plus,
  HelpCircle,
  Download,
  Upload
} from 'lucide-react';
import { Department, JobLevel, EducationLevel, TNARule } from '../../types';
import { DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/mockData';
import { ExpandableDetail } from '../common/ui';

export const TNASetupView: React.FC = () => {
  const { 
    trainingModules, 
    tnaRules, 
    updateTnaRule, 
    employees, 
    checkQualification,
    setIsAddModuleModalOpen,
    setIsManageModulesModalOpen,
    openExportImportModal,
    addToast
  } = useWorkforce();

  // Active Selected Position
  const [selectedDept, setSelectedDept] = useState<Department>('Operations');
  const [selectedLevel, setSelectedLevel] = useState<JobLevel>('Manager');

  // Search & Filter in Master List
  const [searchPosQuery, setSearchPosQuery] = useState('');
  const [filterMasterDept, setFilterMasterDept] = useState<string>('All');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState<string>('All');

  // Form states for active position
  const [minEdu, setMinEdu] = useState<EducationLevel>('S1');
  const [minTenure, setMinTenure] = useState<number>(4);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceKey, setCopySourceKey] = useState<string>('');

  // Active Rule Key
  const ruleKey = `${selectedDept}_${selectedLevel}`;

  // Load active rule when Dept or Level changes
  useEffect(() => {
    const existingRule = tnaRules[ruleKey];
    if (existingRule) {
      setMinEdu(existingRule.minEdu);
      setMinTenure(existingRule.minTenureYears);
      setSelectedModuleIds(existingRule.requiredTrainingIds || []);
    } else {
      // Default template
      setMinEdu(selectedLevel === 'Manager' || selectedLevel === 'Director' ? 'S1' : selectedLevel === 'Supervisor' ? 'D3' : 'SMA');
      setMinTenure(selectedLevel === 'Manager' ? 4 : selectedLevel === 'Supervisor' ? 2 : 1);
      setSelectedModuleIds(['T02', 'T03']);
    }
  }, [selectedDept, selectedLevel, tnaRules, ruleKey]);

  // All Positions Master List
  const allPositions = useMemo(() => {
    const list: { dept: Department; level: JobLevel; key: string }[] = [];
    DEPARTMENTS.forEach((dept) => {
      JOB_LEVELS.forEach((level) => {
        list.push({ dept, level, key: `${dept}_${level}` });
      });
    });
    return list;
  }, []);

  // Filtered Positions Master List
  const filteredPositions = useMemo(() => {
    return allPositions.filter((pos) => {
      const matchDept = filterMasterDept === 'All' || pos.dept === filterMasterDept;
      const matchQuery = 
        pos.dept.toLowerCase().includes(searchPosQuery.toLowerCase()) ||
        pos.level.toLowerCase().includes(searchPosQuery.toLowerCase());
      return matchDept && matchQuery;
    });
  }, [allPositions, filterMasterDept, searchPosQuery]);

  // Module Categories
  const moduleCategories = useMemo(() => {
    const cats = Array.from(new Set(trainingModules.map((m) => m.category || 'Umum')));
    return ['All', ...cats];
  }, [trainingModules]);

  // Filtered Training Modules
  const filteredModules = useMemo(() => {
    if (moduleCategoryFilter === 'All') return trainingModules;
    return trainingModules.filter((m) => (m.category || 'Umum') === moduleCategoryFilter);
  }, [trainingModules, moduleCategoryFilter]);

  const handleToggleModule = (modId: string) => {
    if (selectedModuleIds.includes(modId)) {
      setSelectedModuleIds(selectedModuleIds.filter((id) => id !== modId));
    } else {
      setSelectedModuleIds([...selectedModuleIds, modId]);
    }
  };

  const handleSelectAllInView = () => {
    const currentViewIds = filteredModules.map((m) => m.id);
    const allSelected = currentViewIds.every((id) => selectedModuleIds.includes(id));

    if (allSelected) {
      // Unselect all in current view
      setSelectedModuleIds(selectedModuleIds.filter((id) => !currentViewIds.includes(id)));
    } else {
      // Select all in current view
      const combined = Array.from(new Set([...selectedModuleIds, ...currentViewIds]));
      setSelectedModuleIds(combined);
    }
  };

  const handleSave = () => {
    const updatedRule: TNARule = {
      id: tnaRules[ruleKey]?.id || `R_${Date.now()}`,
      department: selectedDept,
      level: selectedLevel,
      minEdu,
      minTenureYears: Number(minTenure),
      requiredTrainingIds: selectedModuleIds
    };
    updateTnaRule(ruleKey, updatedRule);
    addToast(
      'Konfigurasi TNA Disimpan',
      `Standar kualifikasi dan ${selectedModuleIds.length} modul wajib untuk ${selectedDept} - ${selectedLevel} berhasil diperbarui.`,
      'success'
    );
  };

  // Copy rule from another position
  const handleApplyCopy = () => {
    if (!copySourceKey) return;
    const sourceRule = tnaRules[copySourceKey];
    if (sourceRule) {
      setMinEdu(sourceRule.minEdu);
      setMinTenure(sourceRule.minTenureYears);
      setSelectedModuleIds(sourceRule.requiredTrainingIds || []);
      setIsCopyModalOpen(false);
      addToast(
        'Standar Disalin',
        `Konfigurasi dari ${copySourceKey.replace('_', ' - ')} berhasil diterapkan ke posisi aktif.`,
        'info'
      );
    }
  };

  // Reset to default baseline
  const handleResetToDefault = () => {
    const defaultEdu: EducationLevel = selectedLevel === 'Manager' || selectedLevel === 'Director' ? 'S1' : selectedLevel === 'Supervisor' ? 'D3' : 'SMA';
    const defaultTenure = selectedLevel === 'Manager' ? 4 : selectedLevel === 'Supervisor' ? 2 : 1;
    const defaultModules = selectedLevel === 'Manager' || selectedLevel === 'Director' ? ['T01', 'T02', 'T03', 'T04'] : ['T01', 'T02'];

    setMinEdu(defaultEdu);
    setMinTenure(defaultTenure);
    setSelectedModuleIds(defaultModules);
    addToast('Reset Berhasil', `Standar untuk ${selectedDept} - ${selectedLevel} dikembalikan ke template default.`, 'info');
  };

  // Find employees belonging to this Dept & Level to show impact preview
  const impactedEmployees = employees.filter(
    (e) => e.department === selectedDept && e.level === selectedLevel
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-7 bg-slate-50 space-y-5">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Pengaturan Standar Kualifikasi & Wajib Pelatihan (TNA)
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 hidden sm:inline">
                Master Konfigurasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih posisi jabatan di panel kiri, lalu atur syarat pendidikan, masa kerja, dan modul wajib di panel kanan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => openExportImportModal('tna_rules', 'export')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition active:scale-95 cursor-pointer border border-slate-200/80"
            title="Ekspor Seluruh Standar Kualifikasi TNA ke Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export TNA</span>
          </button>

          <button
            onClick={() => openExportImportModal('tna_rules', 'import')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition active:scale-95 cursor-pointer border border-slate-200/80"
            title="Impor Standar Kualifikasi TNA dari Excel / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import TNA</span>
          </button>

          <button
            onClick={() => setIsManageModulesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition active:scale-95 cursor-pointer border border-slate-200/80"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Kelola Katalog</span>
          </button>
          
          <button
            onClick={() => setIsAddModuleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Modul</span>
          </button>
        </div>
      </div>

      {/* 2. Master-Detail Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* SISI KIRI: MASTER DAFTAR POSISI JABATAN (4 Kolom / 35%) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Daftar Posisi Jabatan ({filteredPositions.length})</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">Klik untuk edit</span>
          </div>

          {/* Quick Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari level jabatan / departemen..."
              value={searchPosQuery}
              onChange={(e) => setSearchPosQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          {/* Dept Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-xs">
            <button
              onClick={() => setFilterMasterDept('All')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                filterMasterDept === 'All'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setFilterMasterDept(d)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                  filterMasterDept === d
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Position Cards List */}
          <div className="space-y-1.5 max-h-140 overflow-y-auto custom-scrollbar pr-1">
            {filteredPositions.map((pos) => {
              const isSelected = pos.dept === selectedDept && pos.level === selectedLevel;
              const rule = tnaRules[pos.key];
              const modCount = rule?.requiredTrainingIds?.length || 2;
              const empCount = employees.filter((e) => e.department === pos.dept && e.level === pos.level).length;

              return (
                <div
                  key={pos.key}
                  onClick={() => {
                    setSelectedDept(pos.dept);
                    setSelectedLevel(pos.level);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {pos.level}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium truncate">
                        {pos.dept}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{modCount} Modul Wajib</span>
                      <span>•</span>
                      <span>Min: {rule?.minEdu || 'S1'}</span>
                      <span>•</span>
                      <span>{rule?.minTenureYears ?? 2} Thn</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {empCount} HC
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Copy Presets Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin dari Posisi Lain</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
              title="Reset standar posisi ini ke template bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SISI KANAN: DETAIL FORM KONFIGURASI POSISI (8 Kolom / 65%) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-6">
          
          {/* Active Position Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Posisi Sedang Dikonfigurasi
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {selectedLevel} — <span className="text-slate-600 font-normal">{selectedDept}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
                Populasi Aktif: <strong className="text-slate-900">{impactedEmployees.length} Karyawan</strong>
              </span>
            </div>
          </div>

          {/* 1. KUALIFIKASI DASAR (Segmented Button Pills & Stepper) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>1. Kualifikasi Dasar Pendidikan & Masa Kerja</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Minimal Jenjang Pendidikan (Segmented Pills) */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Minimal Jenjang Pendidikan
                </label>
                <p className="text-[11px] text-slate-500">
                  Pilih tingkat ijazah minimum untuk menduduki jabatan ini:
                </p>

                {/* Segmented Button Pills */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {EDUCATION_LEVELS.map((edu) => {
                    const isEduActive = minEdu === edu;
                    return (
                      <button
                        key={edu}
                        type="button"
                        onClick={() => setMinEdu(edu)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                          isEduActive
                            ? 'bg-blue-600 text-white shadow-xs scale-102 ring-2 ring-blue-500/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {edu}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimal Masa Kerja (Interactive Stepper) */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Minimal Masa Kerja / Pengalaman
                </label>
                <p className="text-[11px] text-slate-500">
                  Batas minimal tahun kerja yang diakui:
                </p>

                {/* Stepper Control */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMinTenure(Math.max(0, minTenure - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base transition active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-center">
                    <span className="text-base font-black text-slate-900 font-mono mr-1.5">{minTenure}</span>
                    <span className="text-xs text-slate-500 font-medium">Tahun Relevan</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMinTenure(Math.min(30, minTenure + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base transition active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 2. MATRIKS WAJIB PELATIHAN (TNA Core Modules) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>2. Modul Pelatihan Wajib ({selectedModuleIds.length} Dipilih)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik modul di bawah untuk menjadikannya syarat kompetensi wajib posisi ini.
                </p>
              </div>

              {/* Category Filter Chips & Select All Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllInView}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {filteredModules.every((m) => selectedModuleIds.includes(m.id))
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua'}
                </button>
              </div>
            </div>

            {/* Category Filter Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {moduleCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setModuleCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    moduleCategoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            {/* Module Cards Grid (Compact & Clear) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {filteredModules.map((mod) => {
                const isSelected = selectedModuleIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-2 ring-blue-500/10'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {mod.code}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {mod.category || 'Umum'} • {mod.durationHours} Jam
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-snug line-clamp-1 ${
                        isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-800'
                      }`}>
                        {mod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {mod.description}
                      </p>
                    </div>

                    {/* Checkbox Visual Indicator */}
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. IMPACT & ACTION FOOTER (Clean & Accessible) */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Aturan ini akan langsung mengevaluasi <strong>{impactedEmployees.length} Karyawan</strong> di Matriks Pelatihan.
              </span>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Aturan Posisi Ini</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: SALIN STANDAR DARI POSISI LAIN (QUICK COPY PRESET) */}
      {/* ========================================================================= */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Salin Standar Kualifikasi</h3>
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih posisi sumber yang standarnya ingin Anda terapkan ke <strong>{selectedDept} - {selectedLevel}</strong>:
            </p>

            <select
              value={copySourceKey}
              onChange={(e) => setCopySourceKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="">-- Pilih Posisi Sumber --</option>
              {allPositions
                .filter((p) => p.key !== ruleKey)
                .map((p) => {
                  const r = tnaRules[p.key];
                  return (
                    <option key={p.key} value={p.key}>
                      {p.dept} - {p.level} ({r?.requiredTrainingIds?.length || 0} Modul • {r?.minEdu || 'S1'})
                    </option>
                  );
                })}
            </select>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!copySourceKey}
                onClick={handleApplyCopy}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-2xs"
              >
                Terapkan Standar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
