import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  Network, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Crown, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Briefcase,
  Layers,
  ArrowRight,
  UserPlus,
  Check,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Star,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  X,
  UserCheck,
  ArrowUpRight,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  FileText,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { CriticalPosition, Employee, JobPosition, Department, JobLevel, EducationLevel } from '../../types';
import { DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/mockData';
import { generateOrgRestructuringPDF } from '../../utils/pdfExport';
import { TreantOrgChart } from './TreantOrgChart';

export const OrgDesignView: React.FC = () => {
  const isDemo = useAuthStore((s) => s.isDemo());
  const { 
    employees, 
    jobPositions,
    addNewJobPosition,
    updateJobPosition,
    deleteJobPosition,
    addWorkforceMovement,
    setSelectedEmployee, 
    setIsEmployeeModalOpen, 
    getDirectReportsFor,
    addToast 
  } = useWorkforce();

  // 2 Primary Tabs:
  // 1. 'positions' -> Master Peta Jabatan (Catalog, Filters, Grid/Table & CRUD)
  // 2. 'tree_studio' -> Bagan Struktur Organisasi & Visual Sandbox (Tree, Span, Hierarchy & Simulation)
  const [activeTab, setActiveTab] = useState<'positions' | 'tree_studio'>('positions');

  // Tree Studio View Mode: 'treant' (Bagan Pohon Treant.js) vs 'cards' (Peta Span of Control)
  const [treeViewMode, setTreeViewMode] = useState<'treant' | 'cards'>('treant');

  // View Mode inside Positions Tab: 'cards' vs 'table'
  const [posViewMode, setPosViewMode] = useState<'cards' | 'table'>('cards');

  // Position Filters
  const [posFilterDept, setPosFilterDept] = useState<Department | 'All'>('All');
  const [posFilterLevel, setPosFilterLevel] = useState<JobLevel | 'All'>('All');
  const [posSearchQuery, setPosSearchQuery] = useState<string>('');

  // Position Modal State (Create / Edit)
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState<Department>('Operations');
  const [formLevel, setFormLevel] = useState<JobLevel>('Staff');
  const [formGrade, setFormGrade] = useState('G3');
  const [formReportsToPosId, setFormReportsToPosId] = useState<string>('');
  const [formTargetHeadcount, setFormTargetHeadcount] = useState<number>(2);
  const [formMinEdu, setFormMinEdu] = useState<EducationLevel>('S1');
  const [formMinTenure, setFormMinTenure] = useState<number>(2);
  const [formIsCritical, setFormIsCritical] = useState<boolean>(false);
  const [formDescription, setFormDescription] = useState('');

  // Tree & Sandbox Studio State
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'base' | 'merger' | 'digital' | 'span_opt'>('base');
  const [expandedDeptKey, setExpandedDeptKey] = useState<string>('Operations');

  // Live Managers & Direct Reports
  const allManagers = useMemo(() => {
    return employees.filter((e) => e.level === 'Manager' || e.level === 'Director');
  }, [employees]);

  // Filtered Job Positions
  const filteredPositions = useMemo(() => {
    return jobPositions.filter((pos) => {
      const matchDept = posFilterDept === 'All' || pos.department === posFilterDept;
      const matchLevel = posFilterLevel === 'All' || pos.level === posFilterLevel;
      const matchSearch = pos.title.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                          pos.code.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                          pos.department.toLowerCase().includes(posSearchQuery.toLowerCase());
      return matchDept && matchLevel && matchSearch;
    });
  }, [jobPositions, posFilterDept, posFilterLevel, posSearchQuery]);

  // Handlers for Position CRUD
  const handleOpenAddModal = () => {
    setEditingPosId(null);
    setFormCode(`POS-${Date.now().toString().slice(-4)}`);
    setFormTitle('');
    setFormDept('Operations');
    setFormLevel('Staff');
    setFormGrade('G3');
    setFormReportsToPosId('');
    setFormTargetHeadcount(2);
    setFormMinEdu('S1');
    setFormMinTenure(2);
    setFormIsCritical(false);
    setFormDescription('');
    setIsPosModalOpen(true);
  };

  const handleOpenEditModal = (pos: JobPosition) => {
    setEditingPosId(pos.id);
    setFormCode(pos.code);
    setFormTitle(pos.title);
    setFormDept(pos.department);
    setFormLevel(pos.level);
    setFormGrade(pos.grade);
    setFormReportsToPosId(pos.reportsToPositionId || '');
    setFormTargetHeadcount(pos.targetHeadcount);
    setFormMinEdu(pos.minEdu || 'S1');
    setFormMinTenure(pos.minTenureYears || 2);
    setFormIsCritical(pos.isCritical || false);
    setFormDescription(pos.description || '');
    setIsPosModalOpen(true);
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('Validasi Gagal', 'Nama Jabatan wajib diisi.', 'error');
      return;
    }

    const posData: JobPosition = {
      id: editingPosId || `pos-${Date.now()}`,
      code: formCode,
      title: formTitle,
      department: formDept,
      level: formLevel,
      grade: formGrade,
      reportsToPositionId: formReportsToPosId || undefined,
      targetHeadcount: formTargetHeadcount,
      currentFilledCount: editingPosId ? jobPositions.find(p => p.id === editingPosId)?.currentFilledCount || 0 : 0,
      minEdu: formMinEdu,
      minTenureYears: formMinTenure,
      isCritical: formIsCritical,
      description: formDescription
    };

    if (editingPosId) {
      updateJobPosition(posData);
      addToast('Jabatan Diperbarui', `Jabatan ${formTitle} berhasil disimpan.`, 'success');
    } else {
      addNewJobPosition(posData);
      addToast('Jabatan Ditambahkan', `Jabatan ${formTitle} berhasil dibuat.`, 'success');
    }

    setIsPosModalOpen(false);
  };

  const handleDeletePos = (id: string, title: string) => {
    if (jobPositions.length <= 1) {
      addToast('Gagal Hapus', 'Harus ada minimal satu jabatan master.', 'error');
      return;
    }
    deleteJobPosition(id);
    addToast('Jabatan Dihapus', `Jabatan ${title} telah dihapus.`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50 font-sans p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Workforce Architecture &amp; Positions</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Struktur Organisasi &amp; Master Jabatan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Pusat manajemen master posisi jabatan, hierarki hubungan atasan-bawahan, evaluasi rentang kendali (span of control), dan simulasi restrukturisasi visual.
          </p>
        </div>

        {/* 2 Clean Main Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Master Peta Jabatan ({jobPositions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tree_studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tree_studio'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Bagan Struktur &amp; Sandbox</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER PETA JABATAN (CATALOG, FILTERS, GRID/TABLE & CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'positions' && (
        <div className="space-y-5 animate-fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Jabatan Terdaftar</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{jobPositions.length} Posisi</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Kuota Manpower</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {jobPositions.reduce((acc, p) => acc + p.targetHeadcount, 0)} HC
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Tingkatan Level Aktif</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{JOB_LEVELS.length} Level</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Peran Kritis / Key Roles</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {jobPositions.filter(p => p.isCritical).length} Posisi Kritis
              </div>
            </div>
          </div>

          {/* Filter & View Mode Controls */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-50 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode, nama jabatan, atau departemen..."
                  value={posSearchQuery}
                  onChange={(e) => setPosSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={posFilterDept}
                onChange={(e) => setPosFilterDept(e.target.value as any)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="All">Semua Departemen</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select
                value={posFilterLevel}
                onChange={(e) => setPosFilterLevel(e.target.value as any)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="All">Semua Level</option>
                {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Cards vs Table Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setPosViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    posViewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPosViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    posViewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Tabel Data"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jabatan Baru</span>
              </button>
            </div>
          </div>

          {/* 1. CARDS VIEW */}
          {posViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPositions.map((pos) => (
                <div key={pos.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{pos.code} • {pos.department}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{pos.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {pos.level}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Grade {pos.grade}
                        </span>
                        {pos.isCritical && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Kritis
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(pos)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePos(pos.id, pos.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Manpower Quota vs Actual Filled */}
                  {(() => {
                    const occupants = employees.filter(
                      (e) => e.jobTitle.toLowerCase() === pos.title.toLowerCase() && e.department === pos.department
                    );
                    const filledCount = occupants.length;
                    const diff = pos.targetHeadcount - filledCount;

                    return (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>Syarat Pendidikan / Tenure:</span>
                          <strong className="text-slate-800">{pos.minEdu || 'S1'} • Min. {pos.minTenureYears || 2} Thn</strong>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">Formasi Manpower:</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-slate-900">{filledCount} Terisi</span>
                            <span className="text-slate-400">/</span>
                            <span className="font-bold text-emerald-700">{pos.targetHeadcount} Kuota</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                          <span className="font-semibold text-slate-500">Status Kebutuhan:</span>
                          {diff > 0 ? (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Kurang {diff} Headcount
                            </span>
                          ) : diff < 0 ? (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Surplus {Math.abs(diff)} HC
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Formasi Terpenuhi
                            </span>
                          )}
                        </div>

                        {occupants.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-semibold block mb-1">Pejabat Saat Ini:</span>
                            <div className="flex flex-wrap items-center gap-1">
                              {occupants.map((occ) => (
                                <button
                                  key={occ.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmployee(occ);
                                    setIsEmployeeModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer shadow-2xs"
                                  title={`Buka Profil 360° ${occ.name}`}
                                >
                                  <img src={occ.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                                  <span className="truncate max-w-28">{occ.name.split(',')[0]}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <p className="text-[11px] text-slate-500 line-clamp-2">{pos.description || 'Deskripsi tugas dan tanggung jawab jabatan standar.'}</p>
                </div>
              ))}
            </div>
          )}

          {/* 2. TABLE VIEW */}
          {posViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Kode &amp; Jabatan</th>
                      <th className="py-3 px-4">Departemen</th>
                      <th className="py-3 px-4 text-center">Level / Grade</th>
                      <th className="py-3 px-4 text-center">Min. Edu / Tenure</th>
                      <th className="py-3 px-4 text-center">Formasi (Terisi / Kuota)</th>
                      <th className="py-3 px-4 text-center">Status Manpower</th>
                      <th className="py-3 px-4 text-center">Status Peran</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPositions.map((pos) => {
                      const occupants = employees.filter(
                        (e) => e.jobTitle.toLowerCase() === pos.title.toLowerCase() && e.department === pos.department
                      );
                      const filledCount = occupants.length;
                      const diff = pos.targetHeadcount - filledCount;

                      return (
                        <tr key={pos.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] text-slate-400 block">{pos.code}</span>
                            <span className="font-bold text-slate-900">{pos.title}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{pos.department}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-medium text-slate-800">{pos.level}</span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded ml-1">
                              {pos.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-slate-800">{pos.minEdu || 'S1'}</span>
                            <span className="text-slate-500 text-[11px]"> • {pos.minTenureYears || 2} Thn</span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold font-mono">
                            <span className="text-slate-900">{filledCount}</span>
                            <span className="text-slate-400"> / </span>
                            <span className="text-emerald-700">{pos.targetHeadcount} HC</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {diff > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Kurang {diff} HC
                              </span>
                            ) : diff < 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Surplus {Math.abs(diff)}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Terpenuhi
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {pos.isCritical ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Posisi Kritis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Standar
                              </span>
                            )}
                          </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(pos)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePos(pos.id, pos.title)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BAGAN STRUKTUR ORGANISASI & VISUAL SANDBOX (UNIFIED CANVAS) */}
      {/* ========================================================================= */}
      {activeTab === 'tree_studio' && (
        <div className="space-y-6 animate-fade-in">
          {isDemo && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Mode Demo (Read-Only):</strong> Bagan struktur organisasi dalam mode peninjauan. Fitur restrukturisasi dan penambahan posisi jabatan dinonaktifkan pada versi demo.</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase shrink-0">
                READ-ONLY DEMO
              </span>
            </div>
          )}
          {/* Header Sandbox & Scenario Selector */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Interactive Visual Org Canvas &amp; Simulation</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Pohon Hierarki Organisasi &amp; Evaluasi Span of Control
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lihat bagan struktural, identifikasi beban manajer (*span of control*), serta simulasikan skenario perombakan divisi dalam satu kanvas.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Tree View Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setTreeViewMode('treant')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    treeViewMode === 'treant'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bagan Pohon Treant.js</span>
                </button>
                <button
                  onClick={() => setTreeViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    treeViewMode === 'cards'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Peta Span (Cards)</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const summary = {
                    totalHeadcount: selectedScenarioKey === 'digital' ? 1887 : 1842,
                    headcountDelta: selectedScenarioKey === 'digital' ? 45 : 0,
                    payrollMonthlyBillionIDR: selectedScenarioKey === 'merger' ? 245.2 : selectedScenarioKey === 'digital' ? 255.2 : 247.0,
                    payrollDeltaBillionIDR: selectedScenarioKey === 'merger' ? -1.8 : selectedScenarioKey === 'digital' ? 8.2 : 0,
                    avgSpanOfControl: selectedScenarioKey === 'span_opt' ? '1:5.2 (100% Ideal)' : '1:6.8 (2 Over-Spanned)',
                    frictionRisk: selectedScenarioKey === 'merger' ? 'Sedang (4.1%)' : 'Rendah (1.8%)',
                    impactedDeptsCount: selectedScenarioKey === 'base' ? 0 : 3
                  };
                  const units = [
                    { deptName: 'Operations & Mining', headcount: selectedScenarioKey === 'merger' ? 1162 : 842, head: 'Budi Santoso', monthlyBudgetMillionIDR: selectedScenarioKey === 'merger' ? 158900 : 112500, spanRatio: '1:7', status: selectedScenarioKey === 'merger' ? 'Merger Unified' : 'Active' },
                    { deptName: 'Engineering & Reliability', headcount: selectedScenarioKey === 'merger' ? 0 : 320, head: 'Hendra Wijaya', monthlyBudgetMillionIDR: selectedScenarioKey === 'merger' ? 0 : 48200, spanRatio: '1:6', status: selectedScenarioKey === 'merger' ? 'Merged to Ops' : 'Active' },
                    { deptName: 'Human Capital & Learning', headcount: 145, head: 'Rina Marlina', monthlyBudgetMillionIDR: 22800, spanRatio: '1:5', status: 'Active' },
                    { deptName: 'Supply Chain & Logistics', headcount: 260, head: 'Agus Pratama', monthlyBudgetMillionIDR: 34000, spanRatio: '1:6', status: 'Active' },
                    { deptName: 'Digital & AI Automation', headcount: selectedScenarioKey === 'digital' ? 45 : 0, head: 'Ahmad Faqih Didin', monthlyBudgetMillionIDR: selectedScenarioKey === 'digital' ? 8200 : 0, spanRatio: '1:4', status: selectedScenarioKey === 'digital' ? 'New Unit Active' : 'Not Formed' },
                    { deptName: 'Sales & Commercial', headcount: 115, head: 'Maya Putri', monthlyBudgetMillionIDR: 16500, spanRatio: '1:4', status: 'Active' },
                    { deptName: 'Finance & Administration', headcount: 160, head: 'Rudi Hartono', monthlyBudgetMillionIDR: 21000, spanRatio: '1:5', status: 'Active' }
                  ];
                  generateOrgRestructuringPDF(
                    selectedScenarioKey === 'merger' ? 'Konsolidasi Divisi Teknis & Operasi' : selectedScenarioKey === 'digital' ? 'Pembentukan Direktorat Digital & AI' : selectedScenarioKey === 'span_opt' ? 'Optimalisasi Rentang Kendali (Span of Control)' : 'Struktur Organisasi Baseline',
                    summary,
                    units
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Proposal (PDF)</span>
              </button>
            </div>
          </div>

          {/* Skenario Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedScenarioKey('base')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedScenarioKey === 'base'
                  ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 block mb-0.5">Baseline Eksisting</span>
              <p className="text-[11px] text-slate-500">Struktur 6 departemen aktif tanpa modifikasi.</p>
            </button>

            <button
              onClick={() => setSelectedScenarioKey('merger')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedScenarioKey === 'merger'
                  ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-purple-900">Skenario A: Merger</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">-Rp 1.8 M</span>
              </div>
              <p className="text-[11px] text-slate-500">Konsolidasi Engineering ke dalam Operations.</p>
            </button>

            <button
              onClick={() => setSelectedScenarioKey('digital')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedScenarioKey === 'digital'
                  ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-indigo-900">Skenario B: New Unit</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">+45 HC</span>
              </div>
              <p className="text-[11px] text-slate-500">Direktorat Digital Transformation &amp; AI.</p>
            </button>

            <button
              onClick={() => setSelectedScenarioKey('span_opt')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedScenarioKey === 'span_opt'
                  ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-amber-900">Skenario C: Span Opt</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">100% Ideal</span>
              </div>
              <p className="text-[11px] text-slate-500">Bagi beban supervisi dengan layer Team Lead.</p>
            </button>
          </div>

          {/* Real-time Telemetry Impact Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Headcount</span>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {selectedScenarioKey === 'digital' ? '1,887' : '1,842'} HC
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Beban Payroll Bulanan</span>
              <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                Rp {selectedScenarioKey === 'merger' ? '245.2' : selectedScenarioKey === 'digital' ? '255.2' : '247.0'} M
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata-rata Span of Control</span>
              <div className="text-lg font-black font-mono text-indigo-300 mt-0.5">
                {selectedScenarioKey === 'span_opt' ? '1 : 5.2 (100% Ideal)' : '1 : 6.8 (Normal)'}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stabilitas Organisasi</span>
              <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                {selectedScenarioKey === 'merger' ? 'Risiko Transisi Sedang' : 'Terkontrol 98%'}
              </div>
            </div>
          </div>

          {/* Dynamic Hierarchy View: Treant.js vs Cards */}
          {treeViewMode === 'treant' ? (
            <div className="h-160 w-full">
              <TreantOrgChart 
                scenarioKey={selectedScenarioKey}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                  setIsEmployeeModalOpen(true);
                }}
              />
            </div>
          ) : (
            /* Interactive Visual Hierarchy Cards Canvas */
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            {/* Level 1: Executive Node */}
            <div className="flex justify-center">
              {(() => {
                const topExec = employees.find(e => e.level === 'Director' || !e.managerId) || employees[0];
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-slate-700 shadow-md text-center max-w-xs w-full">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pimpinan Eksekutif / Direksi</span>
                    <h3 className="text-sm font-bold mt-0.5">{topExec?.jobTitle || 'Direktur Utama & KTT'}</h3>
                    <p className="text-xs text-slate-300 font-semibold">{topExec?.name || 'Ahmad Faqih Didin, S.T., M.T.'}</p>
                    <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                      <span>Rentang Supervisi: {employees.filter(e => e.managerId === topExec?.id).length} Bawahan Langsung</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Vertical Connector Line */}
            <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

            {/* Level 2: Department Leaders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.filter(dept => employees.some(e => e.department === dept)).map((dept, i) => {
                const deptEmps = employees.filter(e => e.department === dept);
                const deptHead = deptEmps.find(e => e.level === 'Director' || e.level === 'Manager') || deptEmps[0];
                const subsCount = deptEmps.filter(e => e.id !== deptHead?.id).length;
                const isSelected = expandedDeptKey === dept;

                return (
                  <div
                    key={dept}
                    onClick={() => setExpandedDeptKey(dept)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dept}</span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{deptHead?.name || 'Belum Ada Pejabat'}</h4>
                        <p className="text-[11px] text-slate-500">{deptHead?.jobTitle || 'Posisi Kosong'}</p>
                      </div>

                      {/* In-Node Live Span Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        subsCount > 7 && selectedScenarioKey !== 'span_opt'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Span 1:{subsCount}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Klik untuk lihat {deptEmps.length} personil</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Level 3: Expanded Department Subordinates Drawer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Anggota Tim &amp; Posisi di Departemen: <strong className="text-purple-700">{expandedDeptKey}</strong>
                </span>
                <span className="text-[10px] text-slate-500">
                  {employees.filter(e => e.department === expandedDeptKey).length} Personil Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {employees
                  .filter(e => e.department === expandedDeptKey)
                  .slice(0, 6)
                  .map((emp) => (
                    <div key={emp.id} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2.5">
                      <img src={emp.avatarUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate block">{emp.name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{emp.jobTitle} • {emp.level}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          )}

          {/* 1-Click Agentic Enactment Action */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-purple-900 to-indigo-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Pengesahan Restrukturisasi Organisasi ke SK Resmi Direksi</span>
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Ekseskusi perubahan struktur divisi terpilih secara serentak dan terbitkan SK mutasi resmi.
              </p>
            </div>

            <button
              onClick={() => {
                const skNo = `SK/REORG/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`;
                addWorkforceMovement({
                  employeeId: 'EMP001',
                  employeeName: 'Budi Santoso',
                  type: 'Promotion',
                  fromPosition: 'Head of Plant Operations',
                  toPosition: 'Chief Operating Officer (Consolidated Ops & Engineering)',
                  fromDepartment: 'Operations',
                  toDepartment: 'Operations',
                  fromGrade: 'G6',
                  toGrade: 'G7',
                  effectiveDate: new Date().toISOString().split('T')[0],
                  skNumber: skNo,
                  reason: `Pengesahan Restrukturisasi Skenario: ${selectedScenarioKey.toUpperCase()}`,
                  approvedBy: 'Dewan Direksi & Pemegang Saham',
                  status: 'Executed'
                });
                addToast(
                  '⚡ [Restrukturisasi Disahkan]',
                  `SK Direksi No. ${skNo} resmi diterbitkan. Perubahan struktur telah tercatat di log mutasi.`,
                  'success'
                );
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>⚡ Sahkan Restrukturisasi Menjadi SK Resmi</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT MASTER JABATAN */}
      {/* ========================================================================= */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingPosId ? 'Edit Master Jabatan' : 'Tambah Jabatan Baru'}
                </h3>
              </div>
              <button onClick={() => setIsPosModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePosition} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen *</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as Department)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jabatan (Job Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mine Safety Superintendent"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Kuota HC</label>
                  <input
                    type="number"
                    min={1}
                    value={formTargetHeadcount}
                    onChange={(e) => setFormTargetHeadcount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Masa Kerja (Thn)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMinTenure}
                    onChange={(e) => setFormMinTenure(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="critCheckModal"
                  checked={formIsCritical}
                  onChange={(e) => setFormIsCritical(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="critCheckModal" className="text-xs text-slate-700 font-medium">
                  Tandai sebagai Posisi Kritis (*Key Role Suksesi*)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ringkasan peran dan tanggung jawab jabatan..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPosModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingPosId ? 'Simpan Perubahan' : 'Simpan Jabatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
