import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Grid3X3,
  Award,
  Crown,
  ShieldAlert,
  Star,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Filter,
  Sparkles,
  AlertTriangle,
  Zap,
  Activity,
  FileText,
  Download,
  Check,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Briefcase,
  Plus,
  Trash2,
  X,
  Lock
} from 'lucide-react';
import { NineBoxTalentEngine } from '../ninebox/NineBoxTalentEngine';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  CriticalPosition, 
  CrisisExitReason, 
  EmergencySuccessionSimulation, 
  DetailedIDP,
  WorkforceMovement,
  Department
} from '../../types';
import { DEPARTMENTS } from '../../data/mockData';
import { generateEmergencySuccessionPDF, generateSuccessionPipelinePDF } from '../../utils/pdfExport';

export const TalentSuccessionView: React.FC = () => {
  const isDemo = useAuthStore((s) => s.isDemo());
  const {
    employees,
    criticalPositions,
    detailedIdps,
    domainSubTabs,
    setDomainSubTab,
    setSelectedEmployee,
    setIsEmployeeModalOpen,
    setActiveTab,
    addWorkforceMovement,
    createOrUpdateIDP,
    addCriticalPosition,
    deleteCriticalPosition,
    nominateSuccessor,
    removeSuccessor,
    addToast
  } = useWorkforce();

  const activeSubTab = domainSubTabs.talentSuccession || 'ninebox';
  const setActiveSubTab = (tab: string) => setDomainSubTab('talentSuccession', tab);

  // HiPo Employees (Box 9, 8, 6)
  const hipoEmployees = employees.filter((e) => e.nineBoxGrid === 9 || e.nineBoxGrid === 8 || e.nineBoxGrid === 6);

  // --------------------------------------------------------------------------
  // ADD CRITICAL POSITION MODAL STATE
  // --------------------------------------------------------------------------
  const [isAddPosOpen, setIsAddPosOpen] = useState(false);
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosDept, setNewPosDept] = useState<Department>('Operations');
  const [newPosHolder, setNewPosHolder] = useState('');
  const [newPosRisk, setNewPosRisk] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newPosRetireYears, setNewPosRetireYears] = useState(2);
  const [newPosVacancyRisk, setNewPosVacancyRisk] = useState('Critical operation disruption');

  const handleCreateCriticalPos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosTitle.trim()) {
      addToast('Validasi', 'Nama posisi kritis harus diisi.', 'error');
      return;
    }
    addCriticalPosition({
      title: newPosTitle,
      department: newPosDept,
      currentHolder: newPosHolder || 'Belum Ditentukan',
      currentHolderId: `EMP-${Date.now()}`,
      riskLevel: newPosRisk,
      retirementYearsRemaining: newPosRetireYears,
      businessImpact: newPosVacancyRisk || 'Operasional terganggu jika posisi lowong'
    });
    setIsAddPosOpen(false);
    setNewPosTitle('');
    setNewPosHolder('');
  };

  // --------------------------------------------------------------------------
  // NOMINATION MODAL STATE
  // --------------------------------------------------------------------------
  const [isNominationOpen, setIsNominationOpen] = useState(false);
  const [nominatePosId, setNominatePosId] = useState(criticalPositions[0]?.id || '');
  const [nominateEmpId, setNominateEmpId] = useState('');
  const [nominateReadiness, setNominateReadiness] = useState<'Ready Now' | 'Ready in 1 Year' | 'Ready in 2-3 Years'>('Ready in 1 Year');

  const handleSubmitNomination = () => {
    if (!nominatePosId || !nominateEmpId) {
      addToast('Validasi Gagal', 'Pilih posisi kritis dan kandidat suksesor terlebih dahulu.', 'error');
      return;
    }
    const emp = employees.find((e) => e.id === nominateEmpId);
    const pos = criticalPositions.find((p) => p.id === nominatePosId);
    nominateSuccessor(nominatePosId, nominateEmpId, nominateReadiness);
    addToast(
      '✅ Suksesor Dinominasikan',
      `${emp?.name} berhasil dinominasikan sebagai suksesor untuk posisi ${pos?.title} (${nominateReadiness}).`,
      'success'
    );
    setIsNominationOpen(false);
    setNominateEmpId('');
  };

  // --------------------------------------------------------------------------
  // EMERGENCY SUCCESSION FLIGHT SIMULATOR STATE & ENGINE
  // --------------------------------------------------------------------------
  const [selectedPosId, setSelectedPosId] = useState<string>(criticalPositions[0]?.id || 'CP01');
  const [crisisReason, setCrisisReason] = useState<CrisisExitReason>('Sudden Resignation (2-Weeks Notice)');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activePos = criticalPositions.find((p) => p.id === selectedPosId) || criticalPositions[0];

  // Dynamic Stress-Test Simulation Result Computation
  const simulationResult: EmergencySuccessionSimulation = useMemo(() => {
    if (!activePos) {
      return {
        positionId: '',
        positionTitle: '',
        department: 'Operations',
        currentHolder: '',
        crisisReason,
        operationalVulnerabilityScore: 0,
        dailyRevenueRiskMillionIDR: 0,
        complianceImpactNote: '',
        subordinatesImpactedCount: 0,
        bestSuccessor: null,
        secondarySuccessors: [],
        aiContingencyGuidance: ''
      };
    }

    const hasReadyNow = activePos.successors.some((s) => s.readiness === 'Ready Now');
    const succCount = activePos.successors.length;

    let vulnerabilityScore = 45;
    let dailyRisk = 250;

    if (activePos.riskLevel === 'High') {
      vulnerabilityScore += 30;
      dailyRisk += 450;
    }
    if (!hasReadyNow) {
      vulnerabilityScore += 20;
      dailyRisk += 200;
    }
    if (crisisReason === 'Disciplinary Termination' || crisisReason === 'Sudden Resignation (2-Weeks Notice)') {
      vulnerabilityScore += 5;
    }

    vulnerabilityScore = Math.min(98, vulnerabilityScore);

    // Pick top successor or fallback from Star Talents
    let bestSuccObj: EmergencySuccessionSimulation['bestSuccessor'] = null;
    if (succCount > 0) {
      const top = activePos.successors[0];
      bestSuccObj = {
        employeeId: top.employeeId,
        name: top.name,
        readiness: top.readiness,
        fitScore: top.fitScore || 85,
        leadershipScore: top.fitScore > 80 ? 86 : 74,
        technicalScore: 92,
        onboardingVelocityDays: top.readiness === 'Ready Now' ? 7 : 30,
        transitionGapNote: top.readiness === 'Ready Now' 
          ? 'Kandidat siap mengambil alih komando harian segera. Diperlukan briefing delegasi persetujuan CAPEX > Rp 500 Jt.'
          : 'Kandidat memiliki kapasitas teknis tinggi namun memerlukan pendampingan manajerial selama 30 hari pertama.'
      };
    } else {
      // Fallback cross-department Star Talent
      const star = hipoEmployees[0] || employees[0];
      bestSuccObj = {
        employeeId: star.id,
        name: star.name,
        readiness: 'Ready in 1 Year',
        fitScore: 72,
        leadershipScore: 78,
        technicalScore: 80,
        onboardingVelocityDays: 45,
        transitionGapNote: 'Tidak ada suksesor internal langsung. Penunjukan darurat lintas divisi dengan masa transisi intensif.'
      };
    }

    const secondary = activePos.successors.slice(1).map((s) => ({
      employeeId: s.employeeId,
      name: s.name,
      readiness: s.readiness,
      fitScore: s.fitScore
    }));

    return {
      positionId: activePos.id,
      positionTitle: activePos.title,
      department: activePos.department,
      currentHolder: activePos.currentHolder,
      crisisReason,
      operationalVulnerabilityScore: vulnerabilityScore,
      dailyRevenueRiskMillionIDR: dailyRisk,
      complianceImpactNote: activePos.department === 'Operations' 
        ? 'Kekosongan Kepala Teknik Tambang (KTT) berpotensi melanggar Kepmen ESDM No. 1827/2018 jika tidak ditunjuk Plt dalam 14 hari.'
        : 'Risiko kepatuhan pelaporan berkala dan tata kelola persetujuan finansial kuartalan.',
      subordinatesImpactedCount: activePos.department === 'Operations' ? 42 : 18,
      bestSuccessor: bestSuccObj,
      secondarySuccessors: secondary,
      aiContingencyGuidance: `Dewan Direksi direkomendasikan segera mengesahkan penunjukan Plt Sementara (Acting Appointment) kepada ${bestSuccObj.name} dengan masa transisi ${bestSuccObj.onboardingVelocityDays} hari, didampingi program percepatan Emergency IDP 30-Hari.`
    };
  }, [activePos, crisisReason, hipoEmployees, employees]);

  // Handler: Appoint Emergency Acting Plt
  const handleAppointActing = () => {
    if (!simulationResult.bestSuccessor || !activePos) return;

    const empId = simulationResult.bestSuccessor.employeeId;
    const targetEmp = employees.find((e) => e.id === empId) || employees[0];
    const skNo = `SK/ACT/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`;

    addWorkforceMovement({
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      type: 'Acting Position',
      fromPosition: targetEmp.jobTitle,
      toPosition: `Acting ${activePos.title}`,
      fromDepartment: targetEmp.department,
      toDepartment: activePos.department,
      fromGrade: targetEmp.grade,
      toGrade: targetEmp.grade,
      effectiveDate: new Date().toISOString().split('T')[0],
      skNumber: skNo,
      reason: `Penunjukan Plt Darurat atas skenario krisis ${crisisReason} pada posisi ${activePos.title} (Incumbent: ${activePos.currentHolder})`,
      approvedBy: 'Direktur Utama & Komite Suksesi',
      status: 'Executed'
    });

    addToast(
      '⚡ [SK Plt Diterbitkan]',
      `SK Nomor ${skNo} resmi disahkan. ${targetEmp.name} kini menjabat Plt ${activePos.title}.`,
      'success'
    );
  };

  // Handler: Auto-generate Emergency 30-Day Transition IDP
  const handleCreateEmergencyIDP = () => {
    if (!simulationResult.bestSuccessor || !activePos) return;

    const empId = simulationResult.bestSuccessor.employeeId;
    const targetEmp = employees.find((e) => e.id === empId) || employees[0];

    const emergencyIdp: DetailedIDP = {
      id: `IDP-EMERGENCY-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      currentPosition: targetEmp.jobTitle,
      targetPosition: activePos.title,
      targetReadiness: 90,
      durationMonths: 1, // 30-Day plan
      developmentGoal: `Emergency 30-Day Operational Command Transition for ${activePos.title}`,
      completionPercentage: 25,
      experience70: [
        {
          id: 'EMG-EXP-01',
          title: `Pengambilalihan komando harian dan daily production briefing ${activePos.department}`,
          category: '70_experience',
          status: 'In Progress',
          dueDate: 'Minggu 1'
        },
        {
          id: 'EMG-EXP-02',
          title: 'Review dan penandatanganan delegasi SOP keselamatan kerja & audit kepatuhan K3',
          category: '70_experience',
          status: 'Pending',
          dueDate: 'Minggu 2'
        },
        {
          id: 'EMG-EXP-03',
          title: 'Rapat koordinasi lintas divisi dengan General Manager & Chief Operating Officer',
          category: '70_experience',
          status: 'Pending',
          dueDate: 'Minggu 3'
        }
      ],
      exposure20: [
        {
          id: 'EMG-EXP-04',
          title: 'Daily 1-on-1 Mentoring darurat bersama VP Operations terkait tata kelola CAPEX',
          category: '20_exposure',
          mentorOrLead: 'VP Human Capital & Operations Head',
          status: 'In Progress',
          dueDate: 'Minggu 1-4'
        }
      ],
      education10: [
        {
          id: 'EMG-EDU-01',
          title: 'Executive Crash Course: Crisis Leadership & Statutory Compliance (KTT/POU)',
          category: '10_education',
          status: 'Completed',
          dueDate: 'Minggu 1'
        }
      ],
      aiGuidance: `IDP Transisi Darurat 30 Hari dibuat otomatis untuk mengamankan operasional ${activePos.title}. Fokus pada stabilitas tim dan otorisasi anggaran.`,
      status: 'Active'
    };

    createOrUpdateIDP(emergencyIdp);
    setActiveTab('performance-dev');
    setDomainSubTab('performanceDev', 'idp');
    addToast(
      '⚡ [Emergency IDP Aktif]',
      `Rencana Transisi Darurat 30 Hari untuk ${targetEmp.name} langsung aktif di Domain 06.`,
      'success'
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Sub Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('ninebox')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'ninebox'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>9-Box Talent Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('succession')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'succession'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Succession Bench Pipeline ({criticalPositions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hipo')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'hipo'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>High-Potential (HiPo) Pool ({hipoEmployees.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Emergency Succession Simulator</span>
          </button>
        </div>
      </div>

      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="mx-4 lg:mx-6 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Mode Demo (Read-Only):</strong> Modul 9-Box Matrix &amp; Succession Bench dalam mode tinjauan. Nominasi suksesor dan simulasi darurat hanya bersifat evaluasi.</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase shrink-0">
            READ-ONLY DEMO
          </span>
        </div>
      )}

      {/* Subtab Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* SUBTAB 1: 9-BOX TALENT ENGINE */}
        {activeSubTab === 'ninebox' && <NineBoxTalentEngine />}

        {/* SUBTAB 2: SUCCESSION BENCH PIPELINE */}
        {activeSubTab === 'succession' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                  <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">Succession Pipeline &amp; Bench Strength</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Pemetaan kesiapan kandidat suksesor untuk posisi kunci dan jabatan berisiko tinggi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddPosOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Posisi Kritis</span>
                </button>

                <button
                  onClick={() => {
                    setNominatePosId(criticalPositions[0]?.id || '');
                    setIsNominationOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Nominasi Suksesor</span>
                </button>

                <button
                  onClick={() => generateSuccessionPipelinePDF(criticalPositions, employees)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Cetak Peta Suksesi Posisi Kritis & Bench Strength (PDF)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak PDF</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('simulator')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulator Krisis</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {criticalPositions.map((pos) => (
                <div key={pos.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pos.department}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{pos.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Pemegang: <span className="font-semibold text-slate-800">{pos.currentHolder}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setNominatePosId(pos.id); setIsNominationOpen(true); }}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-2.5 h-2.5" />
                        <span>+ Suksesor</span>
                      </button>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        pos.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Risiko {pos.riskLevel}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus posisi kritis "${pos.title}" dari peta suksesi?`)) {
                            deleteCriticalPosition(pos.id);
                          }
                        }}
                        title="Hapus Posisi Kritis"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between text-slate-600">
                    <span>Sisa Waktu Pensiun:</span>
                    <span className="font-bold text-slate-800">{pos.retirementYearsRemaining} Tahun</span>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-700 block">Kandidat Suksesor ({pos.successors.length}):</span>
                    {pos.successors.length === 0 ? (
                      <div className="p-3 text-center bg-rose-50/60 rounded-xl border border-rose-200 text-rose-700 text-xs font-medium">
                        ⚠️ Belum ada suksesor. Klik <strong>"+ Suksesor"</strong> untuk nominasikan kandidat.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {pos.successors.map((succ, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                            <span className="font-semibold text-slate-800">{succ.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Fit {succ.fitScore}%
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                succ.readiness === 'Ready Now' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {succ.readiness}
                              </span>
                              <button
                                onClick={() => removeSuccessor(pos.id, succ.employeeId)}
                                title="Keluarkan suksesor ini dari pipeline"
                                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ================================================================ */}
            {/* ADD CRITICAL POSITION MODAL */}
            {/* ================================================================ */}
            {isAddPosOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Tambah Posisi Kritis Baru</h3>
                    </div>
                    <button onClick={() => setIsAddPosOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCriticalPos} className="p-5 space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Nama Posisi Kunci / Jabatan</label>
                      <input
                        type="text"
                        value={newPosTitle}
                        onChange={(e) => setNewPosTitle(e.target.value)}
                        placeholder="Contoh: Mine Geology Superintendent"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Departemen</label>
                        <select
                          value={newPosDept}
                          onChange={(e) => setNewPosDept(e.target.value as Department)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Tingkat Risiko</label>
                        <select
                          value={newPosRisk}
                          onChange={(e) => setNewPosRisk(e.target.value as any)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="High">High Risk</option>
                          <option value="Medium">Medium Risk</option>
                          <option value="Low">Low Risk</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Pemegang Saat Ini (Incumbent)</label>
                        <input
                          type="text"
                          value={newPosHolder}
                          onChange={(e) => setNewPosHolder(e.target.value)}
                          placeholder="Nama pejabat saat ini"
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Sisa Waktu Pensiun (Thn)</label>
                        <input
                          type="number" min={0} max={20}
                          value={newPosRetireYears}
                          onChange={(e) => setNewPosRetireYears(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Dampak Jika Posisi Lowong</label>
                      <input
                        type="text"
                        value={newPosVacancyRisk}
                        onChange={(e) => setNewPosVacancyRisk(e.target.value)}
                        placeholder="Contoh: Operasional pabrik & perizinan terhenti"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddPosOpen(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Simpan Posisi Kritis
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* NOMINATION MODAL */}
            {/* ================================================================ */}
            {isNominationOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">Nominasi Kandidat Suksesor</h3>
                    </div>
                    <button onClick={() => setIsNominationOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition cursor-pointer">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Posisi Kritis</label>
                      <select
                        value={nominatePosId}
                        onChange={(e) => setNominatePosId(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-amber-500"
                      >
                        {criticalPositions.map((p) => (
                          <option key={p.id} value={p.id}>{p.title} — {p.department}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Kandidat Suksesor</label>
                      <select
                        value={nominateEmpId}
                        onChange={(e) => setNominateEmpId(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Pilih Karyawan --</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>{e.name} — {e.jobTitle} ({e.department})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Tingkat Kesiapan (Readiness)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Ready Now', 'Ready in 1 Year', 'Ready in 2-3 Years'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setNominateReadiness(r)}
                            className={`py-2 px-2 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              nominateReadiness === r
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
                      <strong>Catatan:</strong> Fit Score dihitung otomatis berdasarkan profil kompetensi dan 9-Box placement kandidat.
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100">
                    <button
                      onClick={() => setIsNominationOpen(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitNomination}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Nominasikan Suksesor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: HIPO TALENT POOL */}
        {activeSubTab === 'hipo' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>High Potential (HiPo) & Accelerated Talent Pool</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kumpulan {hipoEmployees.length} talenta berkinerja dan berpotensi tinggi (Box 6/8/9) untuk program akselerasi kepemimpinan.
                </p>
              </div>
              <button
                onClick={() => {
                  setNominatePosId(criticalPositions[0]?.id || '');
                  setIsNominationOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Nominasi ke Pipeline Suksesi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hipoEmployees.map((emp) => {
                const hasIdp = detailedIdps.some((i) => i.employeeId === emp.id);
                return (
                  <div key={emp.id} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatarUrl} alt={emp.name} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{emp.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{emp.jobTitle}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                        <span className="text-[9px] text-amber-700 font-bold uppercase block">9-Box</span>
                        <span className="font-black text-amber-900 text-sm">Box {emp.nineBoxGrid}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Performance</span>
                        <span className={`font-bold text-xs ${
                          emp.performanceRating === 'High' ? 'text-emerald-700' :
                          emp.performanceRating === 'Medium' ? 'text-amber-700' : 'text-rose-700'
                        }`}>{emp.performanceRating}</span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg ${
                      hasIdp ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {hasIdp ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{hasIdp ? 'IDP Aktif' : 'Belum ada IDP'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsEmployeeModalOpen(true);
                        }}
                        className="py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 cursor-pointer"
                      >
                        Profil 360°
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('performance-dev');
                          setDomainSubTab('performanceDev', 'idp');
                          addToast('Navigasi IDP', `Beralih ke halaman IDP untuk ${emp.name}.`, 'info');
                        }}
                        className={`py-1.5 text-[11px] font-semibold rounded-lg transition-colors border cursor-pointer ${
                          hasIdp
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-100'
                            : 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {hasIdp ? 'Lihat IDP' : '+ Buat IDP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 4: ⚡ EMERGENCY SUCCESSION FLIGHT SIMULATOR (WHAT-IF INCUMBENT LEAVES) */}
        {activeSubTab === 'simulator' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header Simulator Banner */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Board Succession Stress-Test Simulator</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Emergency Succession Flight Simulator ("What-If Incumbent Leaves?")
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uji ketahanan operasional dan simulasi penunjukan darurat Plt seketika jika incumbent kunci mengundurkan diri atau berhalangan tetap.
                </p>
              </div>

              {/* Action: Export PDF Report */}
              <button
                onClick={() => generateEmergencySuccessionPDF(simulationResult)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Laporan Audit Krisis (PDF)</span>
              </button>
            </div>

            {/* Crisis Configuration Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900 text-white shadow-md">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  1. Pilih Posisi Kritis yang Diuji:
                </label>
                <select
                  value={selectedPosId}
                  onChange={(e) => setSelectedPosId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  {criticalPositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title} — {pos.department} (Incumbent: {pos.currentHolder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  2. Pilih Skenario Pemicu Krisis (Exit Reason):
                </label>
                <select
                  value={crisisReason}
                  onChange={(e) => setCrisisReason(e.target.value as CrisisExitReason)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="Sudden Resignation (2-Weeks Notice)">🚨 Sudden Resignation / Headhunted (2-Weeks Notice)</option>
                  <option value="Emergency Medical Leave (90 Days)">🏥 Emergency Medical Leave (90 Days Out)</option>
                  <option value="Accelerated Retirement">⏳ Accelerated / Sudden Retirement</option>
                  <option value="Disciplinary Termination">⚖️ Disciplinary Termination (Immediate Vacancy)</option>
                </select>
              </div>
            </div>

            {/* Stress-Test Diagnostic Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 Cols: Operational Vulnerability Index (OVI) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Operational Vulnerability Index (OVI)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 uppercase">
                      Stress Level
                    </span>
                  </div>

                  {/* Meter Card */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-rose-700">
                        {simulationResult.operationalVulnerabilityScore}%
                      </div>
                      <span className="text-[11px] font-bold text-rose-900 uppercase">
                        {simulationResult.operationalVulnerabilityScore > 80 ? 'CRITICAL EXPOSURE' : 'HIGH RISK'}
                      </span>
                    </div>
                    <Flame className="w-10 h-10 text-rose-500 opacity-80" />
                  </div>

                  {/* Impact Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Estimasi Risiko Finansial / Hari:</span>
                      <strong className="text-rose-700 font-mono">Rp {simulationResult.dailyRevenueRiskMillionIDR} Jt/Hari</strong>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Bawahan Langsung Terdampak:</span>
                      <strong className="text-slate-800 font-mono">{simulationResult.subordinatesImpactedCount} Personil</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Dampak Regulasi & Kepatuhan:</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                        {simulationResult.complianceImpactNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Emergency Successor Bench Match & 1-Click Execution */}
              <div className="lg:col-span-7 space-y-4">
                {simulationResult.bestSuccessor && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Rekomendasi Suksesor Darurat Terbaik AI</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{simulationResult.bestSuccessor.name}</h3>
                        <p className="text-xs text-slate-500">Kesiapan: <strong className="text-emerald-700">{simulationResult.bestSuccessor.readiness}</strong></p>
                      </div>

                      <div className="text-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 block uppercase">Overall Match</span>
                        <span className="text-lg font-black text-emerald-700">{simulationResult.bestSuccessor.fitScore}%</span>
                      </div>
                    </div>

                    {/* Competency Readiness Metrics */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Leadership</span>
                        <span className="text-sm font-black text-slate-900">{simulationResult.bestSuccessor.leadershipScore}%</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Technical</span>
                        <span className="text-sm font-black text-indigo-700">{simulationResult.bestSuccessor.technicalScore}%</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Waktu Onboarding</span>
                        <span className="text-sm font-black text-emerald-700">{simulationResult.bestSuccessor.onboardingVelocityDays} Hari</span>
                      </div>
                    </div>

                    {/* Diagnostic Gap Note */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-slate-800 block">Celah Transisi & Mitigasi:</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{simulationResult.bestSuccessor.transitionGapNote}</p>
                    </div>

                    {/* 1-Click Agentic Action Triggers */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleAppointActing}
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>⚡ Terbitkan SK Plt Sementara (Acting Appointment)</span>
                      </button>

                      <button
                        onClick={handleCreateEmergencyIDP}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ Auto-Generate Emergency 30-Day Transition IDP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
