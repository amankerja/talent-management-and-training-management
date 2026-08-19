import React, { useState } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Sparkles,
  Bot,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Layers,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  Flame,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { AIAdvisorView } from '../ai/AIAdvisorView';
import { generateExecutiveBriefingPDF } from '../../utils/pdfExport';
import { AgenticActionItem } from '../../types';

export const PeopleIntelligenceView: React.FC = () => {
  const {
    employees,
    criticalPositions,
    annualTrainingPlans,
    mppData,
    executiveHealth,
    agenticActions,
    executeAgenticAction,
    addAgenticAction,
    deleteAgenticAction,
    domainSubTabs,
    setDomainSubTab,
    setActiveTab,
    openExportImportModal,
    addToast
  } = useWorkforce();

  const activeSubTab = domainSubTabs.peopleIntelligence || 'ai-advisor';
  const setActiveSubTab = (tab: string) => setDomainSubTab('peopleIntelligence', tab);

  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Add Action Item Modal State
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newRiskType, setNewRiskType] = useState<AgenticActionItem['riskType']>('COMPETENCY RISK');
  const [newSeverity, setNewSeverity] = useState<AgenticActionItem['severity']>('HIGH');
  const [newActTitle, setNewActTitle] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newParticipants, setNewParticipants] = useState(15);
  const [newActBudget, setNewActBudget] = useState(25);
  const [newActDate, setNewActDate] = useState('Nov 2026');
  const [newBtnLabel, setNewBtnLabel] = useState('Jadwalkan ke ATP 2026');
  const [newActionType, setNewActionType] = useState<AgenticActionItem['actionType']>('create_atp');

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle.trim()) {
      addToast('Validasi', 'Judul rekomendasi aksi harus diisi.', 'error');
      return;
    }

    addAgenticAction({
      riskType: newRiskType,
      severity: newSeverity,
      title: newActTitle,
      description: newActDesc || 'Rekomendasi mitigasi strategis berbasis analisis AI.',
      participantsCount: newParticipants,
      estimatedBudgetMillionIDR: newActBudget,
      recommendedDate: newActDate,
      actionButtonLabel: newBtnLabel || 'Eksekusi Aksi',
      actionType: newActionType
    });

    setIsAddActionOpen(false);
    setNewActTitle('');
    setNewActDesc('');
  };

  const executiveBriefingText = `EXECUTIVE WORKFORCE & CAPABILITY BRIEFING
Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Perusahaan: PT WorkforceOS Enterprise

1. RINGKASAN KESEHATAN TENAGA KERJA (WORKFORCE HEALTH)
• Total Headcount Aktif: ${executiveHealth.workforceHealth.totalHeadcount} HC (Target Budget: ${executiveHealth.workforceHealth.budgetHeadcount} HC, Lowong: ${executiveHealth.workforceHealth.vacancyCount})
• Karyawan Memasuki Masa Pensiun (≤ 2 Tahun): ${executiveHealth.workforceHealth.retirementRiskCount} orang
• Tingkat Turnover Bulanan: ${executiveHealth.workforceHealth.turnoverRate}% (Status: ${executiveHealth.workforceHealth.status})

2. KEPATUHAN & AKSELERASI PELATIHAN (LEARNING HEALTH)
• Kepatuhan Pelatihan Wajib: ${executiveHealth.learningHealth.trainingComplianceRate}%
• Total Program Terjadwal (ATP 2026): ${annualTrainingPlans.length} Program
• Estimasi Anggaran Pembelajaran: Teralokasi penuh pada sistem

3. STATUS KOMPETENSI & KUALIFIKASI (COMPETENCY HEALTH)
• Tingkat Kesesuaian Kualifikasi (Job Fit): ${executiveHealth.competencyHealth.qualificationRate}%
• Total Kesenjangan Kompetensi Terdeteksi: ${executiveHealth.competencyHealth.totalCompetencyGapCount} Item (${executiveHealth.competencyHealth.criticalCompetencyGapCount} Critical Gaps)
• Skill Coverage Index: ${executiveHealth.competencyHealth.skillCoverageRate}%

4. PETA TALENTA & SUKSESI KEPEMIMPINAN (TALENT & SUCCESSION)
• Talenta Potensi Unggul (HiPo Pool): ${executiveHealth.talentHealth.highPotentialCount} Karyawan
• Posisi Kunci Kritis: ${executiveHealth.successionHealth.criticalPositionsCount} Jabatan
• Rasio Suksesor Siap Promosi (Ready-Now Bench): ${executiveHealth.successionHealth.successionCoverageRate}%
• Posisi Kritis Tanpa Calon Suksesor: ${executiveHealth.successionHealth.positionsWithoutSuccessorCount} Posisi

REKOMENDASI AKSI STRATEGIS:
1. Segera selenggarakan batch sertifikasi K3 & POP untuk menutup kesenjangan kompetensi divisi operasional.
2. Lakukan nominasi dan program akselerasi IDP untuk ${executiveHealth.successionHealth.positionsWithoutSuccessorCount} posisi kunci yang belum memiliki suksesor.`;

  const handleCopyBriefing = () => {
    navigator.clipboard.writeText(executiveBriefingText);
    setCopiedBriefing(true);
    addToast('Briefing Disalin', 'Laporan eksekutif berhasil disalin ke clipboard.', 'success');
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('ai-advisor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'ai-advisor'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Strategic Advisor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('risks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'risks'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Workforce Risks (2027 Forecast)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('action-engine')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'action-engine'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Agentic Action Engine ({agenticActions.filter(a => a.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('briefing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'briefing'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Briefing</span>
          </button>
        </div>

        <button
          onClick={() => openExportImportModal('employees', 'export')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition whitespace-nowrap cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          <span>Ekspor / Impor Hub</span>
        </button>
      </div>

      {/* Dynamic Subtab Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* SUBTAB 1: AI CHAT ADVISOR */}
        {activeSubTab === 'ai-advisor' && <AIAdvisorView />}

        {/* SUBTAB 2: WORKFORCE RISKS (DYNAMIC STRATEGIC RISKS FORECAST) */}
        {activeSubTab === 'risks' && (
          <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
            <div className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-purple-700 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">AI Predictive Risk Radar</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Tiga Risiko Tenaga Kerja Terbesar Perusahaan Tahun 2026-2027 (Live Data)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Diagnosa prediktif berbasis data riil dari 8 Domain untuk mendeteksi kerentanan suksesi, kepatuhan kompetensi, dan kapasitas tenaga kerja.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Risk 1: Succession Risk */}
              <div className="p-4 rounded-xl bg-white border-l-4 border-l-rose-600 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 uppercase tracking-wider">
                        1. SUCCESSION RISK — CRITICAL
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {executiveHealth.successionHealth.positionsWithoutSuccessorCount} dari {criticalPositions.length} Posisi Kunci Belum Memiliki Suksesor Ready Now
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    High Vulnerability ({executiveHealth.workforceHealth.retirementRiskCount} Karyawan Pensiun &le; 2 Thn)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                  Data menunjukkan rasio suksesi korporat berada di angka <strong>{executiveHealth.successionHealth.successionCoverageRate}%</strong>. 
                  Terdapat <strong>{executiveHealth.workforceHealth.retirementRiskCount} karyawan kunci</strong> mendekati masa pensiun dalam 24 bulan ke depan. Diperlukan akselerasi program IDP bagi {executiveHealth.talentHealth.highPotentialCount} kandidat HiPo.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('talent-succession');
                      setDomainSubTab('talentSuccession', 'succession');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Lihat Pipeline Suksesi ({criticalPositions.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('performance-dev');
                      setDomainSubTab('performanceDev', 'idp');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Buat Program IDP Suksesor</span>
                  </button>
                </div>
              </div>

              {/* Risk 2: Competency Risk */}
              <div className="p-4 rounded-xl bg-white border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase tracking-wider">
                      2. COMPETENCY &amp; COMPLIANCE RISK — HIGH
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      {executiveHealth.competencyHealth.criticalCompetencyGapCount} Critical Competency Gaps &amp; Tingkat Kepatuhan {executiveHealth.learningHealth.trainingComplianceRate}%
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Kesesuaian: {executiveHealth.competencyHealth.qualificationRate}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                  Terdeteksi total <strong>{executiveHealth.competencyHealth.totalCompetencyGapCount} kesenjangan kualifikasi</strong> ({executiveHealth.competencyHealth.criticalCompetencyGapCount} kritis). Tingkat kepatuhan pelatihan wajib berada pada <strong>{executiveHealth.learningHealth.trainingComplianceRate}%</strong> dengan {annualTrainingPlans.length} program terjadwal.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('competency-tna');
                      setDomainSubTab('competencyTna', 'gap-matrix');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Buka Matriks Gap TNA</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('learning-training');
                      setDomainSubTab('learningTraining', 'calendar');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadwalkan di Kalender</span>
                  </button>
                </div>
              </div>

              {/* Risk 3: Manpower Risk */}
              <div className="p-4 rounded-xl bg-white border-l-4 border-l-blue-600 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wider">
                      3. MANPOWER CAPACITY &amp; BUDGET RISK — HIGH
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      Defisit {executiveHealth.workforceHealth.vacancyCount} Headcount (Kebutuhan {executiveHealth.workforceHealth.budgetHeadcount} vs Eksisting {executiveHealth.workforceHealth.totalHeadcount})
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Turnover: {executiveHealth.workforceHealth.turnoverRate}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                  Kesenjangan operasional antara target kapasitas produksi vs pasokan riil mencapai <strong>{executiveHealth.workforceHealth.vacancyCount} headcount</strong> dengan perkiraan anggaran pemenuhan 4-Pilar sebesar <strong>Rp {mppData.reduce((a: number, c: any) => a + c.estimatedBudgetMillionIDR, 0)} Juta</strong>.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('workforce-planning');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Buka Simulator Skenario MPP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: AGENTIC ACTION ENGINE (ANALYZE ➔ RECOMMEND ➔ EXECUTE) */}
        {activeSubTab === 'action-engine' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Agentic Action Engine</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Analyze ➔ Recommend ➔ Execute
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI tidak hanya mendeteksi masalah, tetapi memberikan tindakan siap eksekusi (1-Click Trigger) ke jadwal ATP, suksesi, atau MPP.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  {agenticActions.filter(a => a.status === 'pending').length} Aksi Menunggu
                </div>
                <button
                  onClick={() => setIsAddActionOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Rekomendasi Aksi</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agenticActions.map((act) => {
                const isExecuted = act.status === 'executed';
                return (
                  <div
                    key={act.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                      isExecuted
                        ? 'bg-emerald-50/40 border-emerald-200 opacity-90'
                        : 'bg-white border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          act.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          act.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {act.riskType}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isExecuted ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Telah Dieksekusi</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Menunggu Tindakan</span>
                          )}
                          <button
                            onClick={() => deleteAgenticAction(act.id)}
                            title="Hapus Rekomendasi Aksi"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                      {act.estimatedBudgetMillionIDR && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>Peserta Terkena Dampak:</span>
                            <strong className="text-slate-800">{act.participantsCount} Orang</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Estimasi Alokasi Budget:</span>
                            <strong className="text-emerald-700">Rp {act.estimatedBudgetMillionIDR} Juta</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Jadwal Rekomendasi:</span>
                            <strong className="text-slate-800">{act.recommendedDate}</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {isExecuted ? (
                        <div className="text-center py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                          ✓ Berhasil diintegrasikan ke sistem
                        </div>
                      ) : (
                        <button
                          onClick={() => executeAgenticAction(act.id)}
                          className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{act.actionButtonLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD ACTION MODAL */}
            {isAddActionOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900">Buat Rekomendasi Aksi Baru</h3>
                    </div>
                    <button
                      onClick={() => setIsAddActionOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAction} className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tipe Risiko</label>
                        <select
                          value={newRiskType}
                          onChange={(e) => setNewRiskType(e.target.value as any)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        >
                          <option value="SUCCESSION RISK">SUCCESSION RISK</option>
                          <option value="COMPETENCY RISK">COMPETENCY RISK</option>
                          <option value="MANPOWER RISK">MANPOWER RISK</option>
                          <option value="CERTIFICATION EXPIRY">CERTIFICATION EXPIRY</option>
                          <option value="IDP REVIEW">IDP REVIEW</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tingkat Keparahan</label>
                        <select
                          value={newSeverity}
                          onChange={(e) => setNewSeverity(e.target.value as any)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Judul Rekomendasi Aksi</label>
                      <input
                        type="text"
                        value={newActTitle}
                        onChange={(e) => setNewActTitle(e.target.value)}
                        placeholder="Contoh: Selenggarakan Pelatihan Mandatori K3 Batch 2"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Rincian</label>
                      <textarea
                        rows={2}
                        value={newActDesc}
                        onChange={(e) => setNewActDesc(e.target.value)}
                        placeholder="Keterangan dasar dan tujuan tindakan ini..."
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Peserta (Org)</label>
                        <input
                          type="number" min={1}
                          value={newParticipants}
                          onChange={(e) => setNewParticipants(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Budget (Rp Jt)</label>
                        <input
                          type="number" min={0}
                          value={newActBudget}
                          onChange={(e) => setNewActBudget(Number(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jadwal Rekomendasi</label>
                        <input
                          type="text"
                          value={newActDate}
                          onChange={(e) => setNewActDate(e.target.value)}
                          placeholder="Nov 2026"
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Label Tombol Eksekusi</label>
                        <input
                          type="text"
                          value={newBtnLabel}
                          onChange={(e) => setNewBtnLabel(e.target.value)}
                          placeholder="Contoh: Jadwalkan ke ATP"
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tipe Aksi Eksekusi</label>
                        <select
                          value={newActionType}
                          onChange={(e) => setNewActionType(e.target.value as any)}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        >
                          <option value="create_atp">Buat Program ATP</option>
                          <option value="create_idp">Buka Form IDP</option>
                          <option value="open_succession">Buka Suksesi</option>
                          <option value="open_mpp">Buka Studio MPP</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddActionOpen(false)}
                        className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                      >
                        Simpan Rekomendasi Aksi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: EXECUTIVE BRIEFING GENERATOR */}
        {activeSubTab === 'briefing' && (
          <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Automated Executive Board Briefing Generator</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ringkasan instan siap pakai untuk rapat Direksi & Komite SDM yang di-generate otomatis dari data 8 Domain.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateExecutiveBriefingPDF(executiveBriefingText, executiveHealth)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Cetak PDF Briefing</span>
                </button>

                <button
                  onClick={handleCopyBriefing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {copiedBriefing ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBriefing ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>

            {/* Briefing Sheet */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed selection:bg-purple-100">
              {executiveBriefingText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
