import React, { useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  GraduationCap, 
  Target, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Layers, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Flame,
  Check,
  Download
} from 'lucide-react';
import { generateExecutiveDashboardPDF } from '../../utils/pdfExport';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { AnimatedNumber, DonutLegendItem } from '../common/AnimatedVisuals';

export const ExecutiveDashboardView: React.FC = () => {
  const { 
    employees, 
    criticalPositions, 
    mppData, 
    executiveHealth, 
    setActiveTab, 
    setDomainSubTab,
    openExportImportModal,
    addToast
  } = useWorkforce();

  const h = executiveHealth;

  // Department Composition
  const deptComposition = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });

    const colors: Record<string, string> = {
      'Operations': '#0284c7',
      'Engineering': '#6366f1',
      'Supply Chain': '#0d9488',
      'Sales & Commercial': '#f59e0b',
      'Finance & IT': '#8b5cf6',
      'Human Resources': '#ec4899'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#64748b'
    }));
  }, [employees]);

  // Risk Radar Items
  const keyRisks = useMemo(() => {
    const list = [];
    if (h.workforceHealth.retirementRiskCount > 0) {
      list.push({
        domain: 'Workforce',
        title: `${h.workforceHealth.retirementRiskCount} Karyawan Mendekati Pensiun (≤ 2 Tahun)`,
        severity: 'High',
        actionLabel: 'Lihat Workforce Movement',
        action: () => {
          setActiveTab('workforce');
          setDomainSubTab('workforce', 'movement');
        }
      });
    }
    if (h.successionHealth.positionsWithoutSuccessorCount > 0) {
      list.push({
        domain: 'Succession',
        title: `${h.successionHealth.positionsWithoutSuccessorCount} Posisi Kritis Tanpa Calon Suksesor`,
        severity: 'High',
        actionLabel: 'Buka Succession Pipeline',
        action: () => {
          setActiveTab('talent-succession');
          setDomainSubTab('talentSuccession', 'succession');
        }
      });
    }
    if (h.competencyHealth.criticalCompetencyGapCount > 0) {
      list.push({
        domain: 'Competency',
        title: `${h.competencyHealth.criticalCompetencyGapCount} Critical Skill Gap Tingkat Berat (-2+)`,
        severity: 'Medium',
        actionLabel: 'Periksa Gap Matrix',
        action: () => {
          setActiveTab('competency-tna');
          setDomainSubTab('competencyTna', 'gap-matrix');
        }
      });
    }
    if (h.learningHealth.trainingComplianceRate < 85) {
      list.push({
        domain: 'Learning',
        title: `Kepatuhan Pelatihan Wajib ${h.learningHealth.trainingComplianceRate}% (Target 90%)`,
        severity: 'Medium',
        actionLabel: 'Lihat Annual Training Plan',
        action: () => {
          setActiveTab('learning-training');
          setDomainSubTab('learningTraining', 'annual-plan');
        }
      });
    }
    return list;
  }, [h, setActiveTab, setDomainSubTab]);

  const handlePrintPDF = () => {
    try {
      generateExecutiveDashboardPDF(executiveHealth, employees, criticalPositions, mppData);
      addToast(
        'Laporan PDF Berhasil Dibuat',
        'Laporan Eksekutif sedang diunduh ke perangkat Anda.',
        'success'
      );
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      addToast(
        'Gagal Membuat PDF',
        err?.message || 'Terjadi kesalahan saat memproses dokumen PDF.',
        'error'
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-50 font-sans">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 px-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">Executive Workforce Cockpit</h1>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                Live Enterprise Pulse
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Diagnostik komprehensif 5 pilar kesehatan tenaga kerja, kapabilitas kompetensi, dan mitigasi risiko suksesi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handlePrintPDF}
            title="Cetak Laporan Eksekutif Lengkap & Grafik (PDF)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('people-intelligence')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tanya AI Advisor</span>
          </button>
          <button
            onClick={() => openExportImportModal('employees', 'export')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* 5 HEALTH CLUSTERS KPI CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            5 Kelompok KPI Kesehatan Tenaga Kerja (Health Clusters)
          </h2>
          <span className="text-[11px] text-slate-400">Pembaruan data otomatis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* 1. Workforce Health */}
          <div 
            onClick={() => { setActiveTab('workforce'); setDomainSubTab('workforce', 'directory'); }}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Workforce Health</span>
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${h.workforceHealth.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {h.workforceHealth.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
                <AnimatedNumber value={h.workforceHealth.totalHeadcount} />
                <span className="text-xs font-normal text-slate-400">HC</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Target Budget</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.workforceHealth.budgetHeadcount} HC</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Lowongan Aktif</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.workforceHealth.vacancyCount} HC</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Pensiun (≤2th)</span>
                <span className="font-semibold text-rose-600 tabular-nums shrink-0">{h.workforceHealth.retirementRiskCount} org</span>
              </div>
            </div>
          </div>

          {/* 2. Learning Health */}
          <div 
            onClick={() => { setActiveTab('learning-training'); setDomainSubTab('learningTraining', 'annual-plan'); }}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Learning Health</span>
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${h.learningHealth.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {h.learningHealth.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline">
                <AnimatedNumber value={h.learningHealth.trainingComplianceRate} />
                <span>%</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Kepatuhan Wajib</span>
                <span className="font-semibold text-indigo-700 tabular-nums shrink-0">{h.learningHealth.mandatoryComplianceRate}%</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Total Jam Belajar</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.learningHealth.totalTrainingHours.toLocaleString()} Jam</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Sertifikasi Exp</span>
                <span className="font-semibold text-amber-600 tabular-nums shrink-0">{h.learningHealth.expiringCertificationsCount} org</span>
              </div>
            </div>
          </div>

          {/* 3. Competency Health */}
          <div 
            onClick={() => { setActiveTab('competency-tna'); setDomainSubTab('competencyTna', 'gap-matrix'); }}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Competency Health</span>
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${h.competencyHealth.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {h.competencyHealth.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline">
                <AnimatedNumber value={h.competencyHealth.qualificationRate} />
                <span>%</span>
                <span className="text-xs font-normal text-slate-400 ml-1">Fit</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Total Gap</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.competencyHealth.totalCompetencyGapCount} Item</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Gap Kritis (-2+)</span>
                <span className="font-semibold text-rose-600 tabular-nums shrink-0">{h.competencyHealth.criticalCompetencyGapCount}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Skill Coverage</span>
                <span className="font-semibold text-emerald-700 tabular-nums shrink-0">{h.competencyHealth.skillCoverageRate}%</span>
              </div>
            </div>
          </div>

          {/* 4. Talent Health */}
          <div 
            onClick={() => { setActiveTab('talent-succession'); setDomainSubTab('talentSuccession', 'ninebox'); }}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Talent Health</span>
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${h.talentHealth.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {h.talentHealth.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
                <AnimatedNumber value={h.talentHealth.highPotentialCount} />
                <span className="text-xs font-normal text-slate-400">HiPo</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">High Performer</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.talentHealth.highPerformerCount} org</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Key Talent</span>
                <span className="font-semibold text-amber-700 tabular-nums shrink-0">{h.talentHealth.keyTalentCount} org</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Flight Risk</span>
                <span className="font-semibold text-rose-600 tabular-nums shrink-0">{h.talentHealth.talentRiskCount} org</span>
              </div>
            </div>
          </div>

          {/* 5. Succession Health */}
          <div 
            onClick={() => { setActiveTab('talent-succession'); setDomainSubTab('talentSuccession', 'succession'); }}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">Succession Health</span>
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${h.successionHealth.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {h.successionHealth.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline">
                <AnimatedNumber value={h.successionHealth.successionCoverageRate} />
                <span>%</span>
                <span className="text-xs font-normal text-slate-400 ml-1">Bench</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Posisi Kritis</span>
                <span className="font-semibold text-slate-800 tabular-nums shrink-0">{h.successionHealth.criticalPositionsCount} Posisi</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Ready Now</span>
                <span className="font-semibold text-emerald-700 tabular-nums shrink-0">{h.successionHealth.readyNowSuccessorsCount} Posisi</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 truncate">Tanpa Suksesor</span>
                <span className="font-semibold text-rose-600 tabular-nums shrink-0">{h.successionHealth.positionsWithoutSuccessorCount} Posisi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC RISK RADAR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Radar & Critical Positions Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Workforce Strategic Risk Radar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pertanyaan Direksi: <span className="italic font-medium text-slate-700">"Apa risiko tenaga kerja perusahaan saat ini?"</span>
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
                {keyRisks.length} Perhatian Kritis
              </span>
            </div>

            <div className="space-y-2.5">
              {keyRisks.map((risk, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${risk.severity === 'High' ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-amber-500 ring-4 ring-amber-100'}`} />
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mr-2">[{risk.domain}]</span>
                      <span className="text-xs font-semibold text-slate-800">{risk.title}</span>
                    </div>
                  </div>
                  <button
                    onClick={risk.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 transition-all shadow-2xs"
                  >
                    <span>{risk.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Department Headcount Breakdown Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Karyawan & Status MPP Korporat</h3>
                <p className="text-xs text-slate-500">Perbandingan Headcount Aktual vs Target Kebutuhan per Divisi</p>
              </div>
              <button 
                onClick={() => setActiveTab('workforce-planning')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Buka Studio MPP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mppData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }} 
                  />
                  <Bar dataKey="currentHeadcount" name="Headcount Aktual" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="requiredDemand" name="Target Kebutuhan" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Department Composition Donut & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Donut Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Komposisi Tenaga Kerja</h3>
            <p className="text-xs text-slate-500 mb-3">Distribusi {employees.length} Karyawan per Departemen</p>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptComposition}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 mt-3">
              {deptComposition.map((dept, i) => (
                <DonutLegendItem
                  key={i}
                  label={dept.name}
                  value={dept.value}
                  total={employees.length}
                  color={dept.color}
                />
              ))}
            </div>
          </div>

          {/* Quick Domain Jump */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Akses Modul Utama</h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setActiveTab('workforce')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Workforce
              </button>
              <button 
                onClick={() => setActiveTab('competency-tna')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Competency &amp; TNA
              </button>
              <button 
                onClick={() => setActiveTab('learning-training')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Learning &amp; Training
              </button>
              <button 
                onClick={() => setActiveTab('talent-succession')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Talent &amp; 9-Box
              </button>
              <button 
                onClick={() => setActiveTab('performance-dev')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Performance &amp; IDP
              </button>
              <button 
                onClick={() => setActiveTab('workforce-planning')} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-left border border-slate-100 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Workforce MPP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
