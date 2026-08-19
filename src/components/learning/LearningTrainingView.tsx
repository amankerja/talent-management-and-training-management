import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  GraduationCap,
  Calendar,
  Layers,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building2,
  DollarSign,
  UserCheck,
  Check,
  X,
  ArrowUpRight
} from 'lucide-react';
import { 
  AnnualTrainingPlanItem, 
  AnnualPlanStatus, 
  TrainingEvent, 
  Trainer, 
  TrainingModule,
  Department,
  TrainingCategory 
} from '../../types';
import { generateAnnualTrainingPlanPDF } from '../../utils/pdfExport';
import { DEPARTMENTS, TRAINING_CATEGORIES } from '../../data/mockData';
import { TrainingCalendarView } from './TrainingCalendarView';

const MONTHS: ('Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec')[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const LearningTrainingView: React.FC = () => {
  const {
    annualTrainingPlans,
    trainingEvents,
    trainers,
    trainingModules,
    employees,
    addAnnualTrainingPlan,
    updateAnnualTrainingPlan,
    addTrainingEvent,
    updateTrainingEvent,
    addTrainer,
    enrollEmployeeToBatch,
    completeAttendeeTraining,
    domainSubTabs,
    setDomainSubTab,
    setIsManageModulesModalOpen,
    addToast
  } = useWorkforce();

  const activeSubTab = domainSubTabs.learningTraining || 'annual-plan';
  const setActiveSubTab = (tab: string) => setDomainSubTab('learningTraining', tab);

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal State: Add Annual Plan Item
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planModId, setPlanModId] = useState(trainingModules[0]?.id || 'T01');
  const [planDept, setPlanDept] = useState<Department | 'All'>('Operations');
  const [planMonth, setPlanMonth] = useState<'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'>('Mar');
  const [planTargets, setPlanTargets] = useState<number>(20);
  const [planBudget, setPlanBudget] = useState<number>(35);
  const [planTrainer, setPlanTrainer] = useState('');

  // Modal State: Add Event
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [evtPlanId, setEvtPlanId] = useState(annualTrainingPlans[0]?.id || '');
  const [evtName, setEvtName] = useState('');
  const [evtBatchCode, setEvtBatchCode] = useState('');
  const [evtLocation, setEvtLocation] = useState('Learning Center Room A');
  const [evtStartDate, setEvtStartDate] = useState('2026-03-15');
  const [evtEndDate, setEvtEndDate] = useState('2026-03-18');
  const [evtQuota, setEvtQuota] = useState(25);
  const [evtTrainerName, setEvtTrainerName] = useState('Ir. Bambang Suhartono');

  // Aggregations
  const totalBudgetPlan = useMemo(() => {
    return annualTrainingPlans.reduce((acc, p) => acc + p.estimatedBudgetMillionIDR, 0);
  }, [annualTrainingPlans]);

  const totalTargetParticipants = useMemo(() => {
    return annualTrainingPlans.reduce((acc, p) => acc + p.targetParticipantsCount, 0);
  }, [annualTrainingPlans]);

  const filteredPlans = useMemo(() => {
    return annualTrainingPlans.filter((p) => {
      const matchMonth = filterMonth === 'All' || p.plannedMonth === filterMonth;
      const matchDept = filterDept === 'All' || p.department === filterDept;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchMonth && matchDept && matchStatus;
    });
  }, [annualTrainingPlans, filterMonth, filterDept, filterStatus]);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const mod = trainingModules.find((m) => m.id === planModId);
    if (!mod) return;

    addAnnualTrainingPlan({
      year: 2026,
      moduleId: mod.id,
      moduleName: mod.name,
      category: mod.category,
      department: planDept,
      targetParticipantsCount: planTargets,
      plannedMonth: planMonth,
      estimatedBudgetMillionIDR: planBudget,
      status: 'Planned',
      trainerName: planTrainer || 'TBD (Instruktur Terakreditasi)'
    });

    setIsAddPlanOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = annualTrainingPlans.find((p) => p.id === evtPlanId);
    const modId = plan?.moduleId || 'T01';
    const modName = plan?.moduleName || evtName;

    addTrainingEvent({
      annualPlanId: plan?.id,
      moduleId: modId,
      moduleName: modName,
      batchCode: evtBatchCode || `BATCH-${Date.now().toString().slice(-4)}`,
      eventName: evtName || `${modName} Batch 1`,
      batchNumber: 1,
      trainerName: evtTrainerName,
      trainerType: 'External Vendor',
      location: evtLocation,
      startDate: evtStartDate,
      endDate: evtEndDate,
      durationHours: 24,
      quota: evtQuota,
      status: 'Scheduled',
      costIDR: (plan?.estimatedBudgetMillionIDR || 20) * 1000000,
      participantIds: []
    });

    setIsAddEventOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('annual-plan')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'annual-plan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Annual Training Plan (ATP)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'annual-plan' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {annualTrainingPlans.length} Program
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Pelatihan & Reminder</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {trainingEvents.length} Event
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('events')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'events'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch & Event Pelaksanaan ({trainingEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trainers')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'trainers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Instruktur & Vendor ({trainers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'annual-plan' && (
            <button
              onClick={() => setIsAddPlanOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rencana ATP</span>
            </button>
          )}

          {(activeSubTab === 'events' || activeSubTab === 'calendar') && (
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Jadwalkan Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Dynamic Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* CALENDAR & REMINDER VIEW */}
        {activeSubTab === 'calendar' && (
          <TrainingCalendarView
            onOpenAddEventModal={(initialDate) => {
              if (initialDate) {
                setEvtStartDate(initialDate);
                setEvtEndDate(initialDate);
              }
              setIsAddEventOpen(true);
            }}
          />
        )}

        {/* 1. ANNUAL TRAINING PLAN VIEW */}
        {activeSubTab === 'annual-plan' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header & Aggregates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Total Program ATP</span>
                <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">{annualTrainingPlans.length} Program</div>
                <span className="text-[11px] text-slate-400">Tahun Anggaran 2026/2027</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Target Peserta Dilatih</span>
                <div className="text-xl font-bold font-mono text-indigo-600 tracking-tight mt-1">{totalTargetParticipants} Orang</div>
                <span className="text-[11px] text-slate-400">Dari hasil diagnosa TNA gap</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Total Estimasi Budget</span>
                <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">Rp {totalBudgetPlan} Juta</div>
                <span className="text-[11px] text-emerald-600 font-medium">Teralokasi pada 6 Departemen</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter Rencana:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                >
                  <option value="All">Semua Bulan</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>Bulan {m}</option>
                  ))}
                </select>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                >
                  <option value="All">Semua Departemen</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                >
                  <option value="All">Semua Status</option>
                  <option value="Planned">Planned</option>
                  <option value="Approved">Approved</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Running">Running</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  Menampilkan {filteredPlans.length} dari {annualTrainingPlans.length} program
                </span>

                <button
                  onClick={() => generateAnnualTrainingPlanPDF(filteredPlans)}
                  title="Cetak Jadwal & Anggaran Resmi ATP 2026 (PDF)"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Cetak ATP (PDF)</span>
                </button>
              </div>
            </div>

            {/* Annual Training Plan Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Pelatihan & Kategori</th>
                      <th className="py-3 px-4">Target Departemen</th>
                      <th className="py-3 px-4 text-center">Bulan Rencana</th>
                      <th className="py-3 px-4 text-center">Peserta</th>
                      <th className="py-3 px-4 text-right">Budget (Jt IDR)</th>
                      <th className="py-3 px-4 text-center">Status Lifecycle</th>
                      <th className="py-3 px-4">Instruktur / Vendor</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlans.map((plan) => {
                      const statusBadges: Record<AnnualPlanStatus, string> = {
                        Planned: 'bg-slate-100 text-slate-700 border-slate-200',
                        Approved: 'bg-blue-50 text-blue-700 border-blue-200',
                        Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                        Running: 'bg-amber-50 text-amber-700 border-amber-200',
                        Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                      };

                      return (
                        <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{plan.moduleName}</span>
                            <span className="text-[10px] text-indigo-600 font-medium">{plan.category}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {plan.department}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px]">
                              {plan.plannedMonth} 2026
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">
                            {plan.targetParticipantsCount} HC
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            Rp {plan.estimatedBudgetMillionIDR} Jt
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadges[plan.status]}`}>
                              {plan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-40">
                            {plan.trainerName || 'Instruktur Terjadwal'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                const nextStatus: AnnualPlanStatus = 
                                  plan.status === 'Planned' ? 'Approved' :
                                  plan.status === 'Approved' ? 'Scheduled' :
                                  plan.status === 'Scheduled' ? 'Running' :
                                  plan.status === 'Running' ? 'Completed' : 'Approved';
                                updateAnnualTrainingPlan({ ...plan, status: nextStatus });
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              Next Status
                            </button>
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

        {/* 2. TRAINING EVENTS & BATCHES */}
        {activeSubTab === 'events' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Manajemen Kelas & Batch Pelaksanaan Pelatihan</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Monitoring batch aktif, kehadiran peserta, evaluasi pre/post test, dan sertifikat kelulusan.
                </p>
              </div>

              <button
                onClick={() => setIsAddEventOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buka Batch Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingEvents.map((evt) => (
                <div key={evt.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase font-mono">{evt.batchCode}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{evt.eventName}</h3>
                      <span className="text-xs text-slate-500 mt-0.5 block">{evt.location}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      evt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      evt.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {evt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jadwal</span>
                      <span className="font-semibold text-slate-700">{evt.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Instruktur</span>
                      <span className="font-semibold text-slate-700 truncate block">{evt.trainerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kuota Peserta</span>
                      <span className="font-semibold text-indigo-700">{evt.quota} Kursi</span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Peserta Terdaftar ({evt.attendees?.length || 0}):</span>
                      
                      {/* Quick Enroll Dropdown */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            enrollEmployeeToBatch(evt.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>➕ Daftarkan Karyawan...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    {(!evt.attendees || evt.attendees.length === 0) ? (
                      <div className="p-3 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                        Belum ada peserta yang didaftarkan ke batch ini.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {evt.attendees.map((att, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                              <span className="font-bold text-slate-900 block">{att.employeeName}</span>
                              <span className="text-[10px] text-slate-400">{att.department}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {att.status === 'Passed' ? (
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    LULUS ({att.postTestScore}/100)
                                  </span>
                                  {att.certificateNo && (
                                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{att.certificateNo}</span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => completeAttendeeTraining(evt.id, att.employeeId, { status: 'Passed', postTestScore: 90 })}
                                  title="Verifikasi Lulus: Otomatis terbitkan nomor sertifikat, tutup gap kompetensi dan perbarui Profil 360!"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>⚡ Luluskan & Tutup Gap</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TRAINER MANAGEMENT */}
        {activeSubTab === 'trainers' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>Database Instruktur & Vendor Pelatihan</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Daftar instruktur internal bersertifikasi dan lembaga vendor eksternal mitra perusahaan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainers.map((trn) => (
                <div key={trn.id} className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        trn.type === 'Internal' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {trn.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{trn.name}</h4>
                      <p className="text-xs text-slate-500">{trn.companyOrDept}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-600">⭐ {trn.rating}</span>
                      <span className="text-[10px] text-slate-400 block">{trn.totalBatchesConducted} Batch Dilatih</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {trn.specialization.map((spec, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD ANNUAL TRAINING PLAN ITEM */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Program Annual Training Plan (ATP)</h3>
              </div>
              <button onClick={() => setIsAddPlanOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Modul Pelatihan</label>
                <select
                  value={planModId}
                  onChange={(e) => setPlanModId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                >
                  {trainingModules.map((m) => (
                    <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Departemen</label>
                  <select
                    value={planDept}
                    onChange={(e) => setPlanDept(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    <option value="All">Seluruh Departemen</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bulan Rencana Pelaksanaan</label>
                  <select
                    value={planMonth}
                    onChange={(e) => setPlanMonth(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {MONTHS.map((m) => <option key={m} value={m}>Bulan {m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Jumlah Peserta</label>
                  <input
                    type="number"
                    min={1}
                    value={planTargets}
                    onChange={(e) => setPlanTargets(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Budget (Juta IDR)</label>
                  <input
                    type="number"
                    min={1}
                    value={planBudget}
                    onChange={(e) => setPlanBudget(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Instruktur / Lembaga Vendor</label>
                <input
                  type="text"
                  placeholder="Misal: PT Prima Safety Global / Tim Internal EHS"
                  value={planTrainer}
                  onChange={(e) => setPlanTrainer(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddPlanOpen(false)} className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs">
                  Simpan Rencana ATP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH EVENT */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Jadwalkan Batch Kelas Pelatihan</h3>
              </div>
              <button onClick={() => setIsAddEventOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Referensi Program ATP</label>
                <select
                  value={evtPlanId}
                  onChange={(e) => setEvtPlanId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                >
                  {annualTrainingPlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.moduleName} ({p.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Batch / Acara</label>
                <input
                  type="text"
                  placeholder="Misal: POP K3 Pertambangan Angkatan 2/2026"
                  value={evtName}
                  onChange={(e) => setEvtName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={evtStartDate}
                    onChange={(e) => setEvtStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={evtEndDate}
                    onChange={(e) => setEvtEndDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi / Ruangan</label>
                  <input
                    type="text"
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuota Maksimal</label>
                  <input
                    type="number"
                    min={1}
                    value={evtQuota}
                    onChange={(e) => setEvtQuota(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Instruktur Pelatih</label>
                <input
                  type="text"
                  value={evtTrainerName}
                  onChange={(e) => setEvtTrainerName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddEventOpen(false)} className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs">
                  Jadwalkan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
