import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Users,
  Search,
  Plus,
  Network,
  Briefcase,
  AlertTriangle,
  History,
  ArrowRight,
  TrendingUp,
  Award,
  Filter,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Layers,
  X,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { Employee, JobPosition, MovementType, Department, JobLevel, EducationLevel, WorkforceMovement } from '../../types';
import { DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/mockData';
import { EmployeeDirectoryView } from '../people/EmployeeDirectoryView';
import { OrgDesignView } from '../org/OrgDesignView';

export const WorkforceDomainView: React.FC = () => {
  const {
    employees,
    jobPositions,
    criticalPositions,
    workforceMovements,
    addWorkforceMovement,
    updateWorkforceMovement,
    deleteWorkforceMovement,
    domainSubTabs,
    setDomainSubTab,
    setSelectedEmployee,
    setIsEmployeeModalOpen,
    setIsAddEmployeeModalOpen,
    openExportImportModal,
    addToast
  } = useWorkforce();

  const activeSubTab = domainSubTabs.workforce || 'directory';
  const setActiveSubTab = (tab: string) => setDomainSubTab('workforce', tab);

  // Workforce Movement State & Modal
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [movType, setMovType] = useState<MovementType>('Promotion');
  const [toPosTitle, setToPosTitle] = useState('');
  const [toDept, setToDept] = useState<Department>('Operations');
  const [toGrade, setToGrade] = useState('G4');
  const [skNumber, setSkNumber] = useState('');
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Movement Filter
  const [filterMovEmp, setFilterMovEmp] = useState<string>('All');
  const [filterMovType, setFilterMovType] = useState<string>('All');

  // Edit Movement State & Modal
  const [isEditMovementOpen, setIsEditMovementOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<WorkforceMovement | null>(null);
  const [editToPos, setEditToPos] = useState('');
  const [editToDept, setEditToDept] = useState<Department>('Operations');
  const [editToGrade, setEditToGrade] = useState('G4');
  const [editEffectiveDate, setEditEffectiveDate] = useState('');
  const [editSkNumber, setEditSkNumber] = useState('');
  const [editReason, setEditReason] = useState('');

  const handleOpenEditMovement = (mov: WorkforceMovement) => {
    setEditingMovement(mov);
    setEditToPos(mov.toPosition);
    setEditToDept(mov.toDepartment);
    setEditToGrade(mov.toGrade || 'G4');
    setEditEffectiveDate(mov.effectiveDate);
    setEditSkNumber(mov.skNumber || '');
    setEditReason(mov.reason || '');
    setIsEditMovementOpen(true);
  };

  const handleSaveEditMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement) return;

    updateWorkforceMovement({
      ...editingMovement,
      toPosition: editToPos,
      toDepartment: editToDept,
      toGrade: editToGrade,
      effectiveDate: editEffectiveDate,
      skNumber: editSkNumber,
      reason: editReason
    });

    setIsEditMovementOpen(false);
    setEditingMovement(null);
  };

  const handleDeleteMovement = (mov: WorkforceMovement) => {
    if (window.confirm(`Hapus catatan pergerakan ${mov.type} untuk ${mov.employeeName}?`)) {
      deleteWorkforceMovement(mov.id);
    }
  };

  const filteredMovements = useMemo(() => {
    return workforceMovements.filter((m) => {
      const matchEmp = filterMovEmp === 'All' || m.employeeId === filterMovEmp;
      const matchType = filterMovType === 'All' || m.type === filterMovType;
      return matchEmp && matchType;
    });
  }, [workforceMovements, filterMovEmp, filterMovType]);

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === selectedEmpId);
    if (!emp) return;

    addWorkforceMovement({
      employeeId: emp.id,
      employeeName: emp.name,
      type: movType,
      fromPosition: emp.jobTitle,
      toPosition: toPosTitle || `${movType} of ${emp.jobTitle}`,
      fromDepartment: emp.department,
      toDepartment: toDept,
      fromGrade: emp.grade,
      toGrade,
      effectiveDate,
      skNumber: skNumber || `SK/DIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`,
      reason: reason || `Penyesuaian pergerakan karier (${movType}) karyawan`,
      approvedBy: 'Direksi / HR Management',
      status: 'Executed'
    });

    setIsAddMovementOpen(false);
    setToPosTitle('');
    setSkNumber('');
    setReason('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Top Domain Sub-Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Employee Directory ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('movement')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'movement'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Workforce Movement & Timeline</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'movement' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {workforceMovements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('org-structure')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'org-structure'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Org Structure & Positions</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'movement' && (
            <button
              onClick={() => setIsAddMovementOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Pergerakan</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic View Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSubTab === 'directory' && <EmployeeDirectoryView />}

        {activeSubTab === 'org-structure' && <OrgDesignView />}

        {activeSubTab === 'movement' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                  <History className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Workforce Movement &amp; Career Journey Engine</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Rekam jejak promosi, demosi, rotasi, mutasi, acting position, hingga terminasi untuk dasar analisis suksesi dan AI.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Filter Karyawan:</span>
                  <select
                    value={filterMovEmp}
                    onChange={(e) => setFilterMovEmp(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All">Semua Karyawan</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.nip})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Tipe:</span>
                  <select
                    value={filterMovType}
                    onChange={(e) => setFilterMovType(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All">Semua Tipe</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Rotation">Rotation</option>
                    <option value="Mutation">Mutation</option>
                    <option value="Acting Position">Acting Position</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Demotion">Demotion</option>
                    <option value="Resignation">Resignation</option>
                    <option value="Retirement">Retirement</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Visual Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Timeline History */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kronologi Pergerakan ({filteredMovements.length} Catatan)
                </h3>

                <div className="space-y-3">
                  {filteredMovements.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                      Tidak ada data pergerakan untuk filter yang dipilih.
                    </div>
                  ) : (
                    filteredMovements.map((mov) => {
                      const badgeTone = 
                        mov.type === 'Promotion' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        mov.type === 'Acting Position' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        mov.type === 'Rotation' || mov.type === 'Mutation' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <div 
                          key={mov.id}
                          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {mov.employeeName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{mov.employeeName}</h4>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>Efektif: {mov.effectiveDate}</span>
                                  {mov.skNumber && <span>• SK: {mov.skNumber}</span>}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeTone}`}>
                                {mov.type}
                              </span>
                              <button
                                onClick={() => handleOpenEditMovement(mov)}
                                title="Edit Catatan Pergerakan"
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMovement(mov)}
                                title="Hapus Catatan"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Movement Pathway */}
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">Jabatan Asal</span>
                              <span className="font-semibold text-slate-700 truncate block">{mov.fromPosition}</span>
                              <span className="text-[11px] text-slate-500">{mov.fromDepartment}</span>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                              <ArrowRight className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 text-right">
                              <span className="text-[10px] text-blue-600 block uppercase font-medium">Jabatan Baru</span>
                              <span className="font-bold text-blue-900 truncate block">{mov.toPosition}</span>
                              <span className="text-[11px] text-slate-500">{mov.toDepartment} {mov.toGrade && `(${mov.toGrade})`}</span>
                            </div>
                          </div>

                          {mov.reason && (
                            <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-md border border-slate-100">
                              "{mov.reason}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Col: Career Fast-Track Spotlight (e.g. Ahmad Faqih Journey) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contoh Kasus Perjalanan Karier
                </h3>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      AF
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ahmad Faqih</h4>
                      <p className="text-[11px] text-slate-500">Talent Progression Pathway</p>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 ring-4 ring-white" />
                      <span className="text-[10px] font-bold text-slate-400 block">2023 • Promotion</span>
                      <span className="text-xs font-bold text-slate-800">Training Officer</span>
                      <p className="text-[11px] text-slate-500">Digitalisasi modul LMS</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <span className="text-[10px] font-bold text-blue-600 block">2025 • Promotion</span>
                      <span className="text-xs font-bold text-slate-800">Senior Training & OD Officer</span>
                      <p className="text-[11px] text-slate-500">Penyusunan TNA Matrix & 9-Box</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <span className="text-[10px] font-bold text-emerald-600 block">2026 • Acting Position</span>
                      <span className="text-xs font-bold text-slate-900">Training Superintendent Candidate</span>
                      <p className="text-[11px] text-slate-500">Program suksesi pimpinan akademi</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-900">
                    <span className="font-bold block mb-0.5">🧠 AI Career Insights:</span>
                    Ahmad Faqih menunjukkan kecepatan promosi 1.8x rata-rata industri dengan skor kompetensi leadership siap suksesi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD MOVEMENT MODAL */}
      {isAddMovementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Catat Pergerakan Karyawan (Workforce Movement)</h3>
              </div>
              <button 
                onClick={() => setIsAddMovementOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Karyawan</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.jobTitle} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Pergerakan</label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value as MovementType)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Rotation">Rotation</option>
                    <option value="Mutation">Mutation</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Acting Position">Acting Position</option>
                    <option value="Demotion">Demotion</option>
                    <option value="Resignation">Resignation</option>
                    <option value="Retirement">Retirement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Efektif</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen Tujuan</label>
                  <select
                    value={toDept}
                    onChange={(e) => setToDept(e.target.value as Department)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade Baru</label>
                  <select
                    value={toGrade}
                    onChange={(e) => setToGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="G1">G1 (Operator)</option>
                    <option value="G2">G2 (Admin/Junior)</option>
                    <option value="G3">G3 (Staff)</option>
                    <option value="G4">G4 (Senior Staff / Spv)</option>
                    <option value="G5">G5 (Superintendent / Manager)</option>
                    <option value="G6">G6 (Director)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jabatan Baru</label>
                <input
                  type="text"
                  placeholder="Misal: Senior Operations Superintendent"
                  value={toPosTitle}
                  onChange={(e) => setToPosTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor SK / Referensi</label>
                <input
                  type="text"
                  placeholder="Misal: SK/HR-DIR/2026/088"
                  value={skNumber}
                  onChange={(e) => setSkNumber(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan & Catatan Pergerakan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan dasar pertimbangan promosi / rotasi..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMovementOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Simpan Pergerakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MOVEMENT MODAL */}
      {isEditMovementOpen && editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Catatan Pergerakan — {editingMovement.employeeName}
                </h3>
              </div>
              <button
                onClick={() => setIsEditMovementOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMovement} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Karyawan</span>
                  <span className="font-bold text-slate-800">{editingMovement.employeeName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tipe Pergerakan</span>
                  <span className="font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">{editingMovement.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen Tujuan</label>
                  <select
                    value={editToDept}
                    onChange={(e) => setEditToDept(e.target.value as Department)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade Baru</label>
                  <select
                    value={editToGrade}
                    onChange={(e) => setEditToGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Baru</label>
                <input
                  type="text"
                  value={editToPos}
                  onChange={(e) => setEditToPos(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Efektif</label>
                  <input
                    type="date"
                    value={editEffectiveDate}
                    onChange={(e) => setEditEffectiveDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor SK / Ref</label>
                  <input
                    type="text"
                    value={editSkNumber}
                    onChange={(e) => setEditSkNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan & Catatan</label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditMovementOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Perbarui Pergerakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
