import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  TrendingUp, 
  UserPlus, 
  RefreshCw, 
  GraduationCap, 
  Cpu, 
  Save, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Download, 
  Upload,
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Minus, 
  Plus, 
  Equal, 
  ArrowLeftRight, 
  TableProperties, 
  SlidersHorizontal, 
  Info, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3,
  Briefcase,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Department, ManpowerDeptPlan, MPPScenario } from '../../types';
import { generateMppPDF } from '../../utils/pdfExport';

export const ManpowerPlanningView: React.FC = () => {
  const { employees, mppData, mppScenarios, addMppScenario, jobPositions, setActiveTab, updateMppPlan, openExportImportModal, addToast } = useWorkforce();
  const [selectedDept, setSelectedDept] = useState<Department>('Operations');
  const [viewMode, setViewMode] = useState<'studio' | 'matrix' | 'scenarios'>('studio');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCN-BASE');
  const [chartScope, setChartScope] = useState<'dept' | 'corporate'>('dept');

  // New Scenario Modal State
  const [isAddScenarioOpen, setIsAddScenarioOpen] = useState(false);
  const [newScnCode, setNewScnCode] = useState('OPTION_D');
  const [newScnLabel, setNewScnLabel] = useState('');
  const [newScnDesc, setNewScnDesc] = useState('');
  const [newRecruit, setNewRecruit] = useState(20);
  const [newUpskill, setNewUpskill] = useState(30);
  const [newContract, setNewContract] = useState(15);
  const [newAuto, setNewAuto] = useState(15);
  const [newCost, setNewCost] = useState(252);
  const [newCapability, setNewCapability] = useState(88);
  const [newRisk, setNewRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [newMonths, setNewMonths] = useState(6);
  const [newTag, setNewTag] = useState<'Lowest Cost' | 'Best Capability' | 'Lowest Risk' | 'Fastest Implementation' | 'Baseline'>('Lowest Risk');

  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScnLabel.trim()) {
      addToast('Validasi', 'Nama skenario harus diisi.', 'error');
      return;
    }

    const totalHc = newRecruit + newUpskill + newContract + newAuto;
    const newScn: MPPScenario = {
      id: `SCN-${Date.now()}`,
      name: newScnCode,
      label: newScnLabel,
      description: newScnDesc || `Skenario kustom dengan komposisi Build ${newUpskill}, Buy ${newRecruit}, Borrow ${newContract}, Bot ${newAuto}.`,
      totalHeadcount: totalHc,
      totalCostBillionIDR: newCost,
      capabilityScore: newCapability,
      riskScore: newRisk,
      implementationTimeMonths: newMonths,
      breakdown: {
        recruitCount: newRecruit,
        upskillCount: newUpskill,
        contractCount: newContract,
        automationCount: newAuto
      },
      aiTradeoff: {
        pros: [`Efisiensi kapabilitas (${newCapability}%)`, `Waktu ${newMonths} bulan`],
        cons: [`Total estimasi biaya Rp ${newCost} M`],
        recommendationTag: newTag
      }
    };

    addMppScenario(newScn);
    setSelectedScenarioId(newScn.id);
    setIsAddScenarioOpen(false);
    setNewScnLabel('');
    setNewScnDesc('');
    addToast('✅ Skenario Dibuat', `Skenario "${newScn.label}" berhasil disimpan ke sistem simulator.`, 'success');
  };

  const activePlan = mppData.find((p) => p.department === selectedDept) || mppData[0];

  // Aggregated Totals
  const totalDemand = mppData.reduce((acc, curr) => acc + curr.requiredDemand, 0);
  const totalSupply = mppData.reduce((acc, curr) => acc + curr.projectedSupply, 0);
  const totalGap = mppData.reduce((acc, curr) => acc + curr.gap, 0);
  const totalBudget = mppData.reduce((acc, curr) => acc + curr.estimatedBudgetMillionIDR, 0);

  // Active Plan Intervention Total
  const totalInterventions = 
    activePlan.interventions.recruitmentCount +
    activePlan.interventions.internalMobilityCount +
    activePlan.interventions.upskillingCount +
    activePlan.interventions.automationEfficiencyCount;

  const gapDifference = totalInterventions - activePlan.gap;
  const isGapBalanced = gapDifference === 0;

  // Chart Data 1: Komposisi Alokasi Headcount 4-Pilar Intervensi
  const pillarHeadcountData = useMemo(() => {
    if (chartScope === 'corporate') {
      const totals = mppData.reduce(
        (acc, plan) => ({
          rec: acc.rec + plan.interventions.recruitmentCount,
          mob: acc.mob + plan.interventions.internalMobilityCount,
          up: acc.up + plan.interventions.upskillingCount,
          auto: acc.auto + plan.interventions.automationEfficiencyCount
        }),
        { rec: 0, mob: 0, up: 0, auto: 0 }
      );
      return [
        { name: 'Pilar 1: Rekrutmen Eksternal', value: totals.rec, color: '#D8433C', rate: 'Rp 25 Jt/HC' },
        { name: 'Pilar 2: Mobilitas Internal', value: totals.mob, color: '#4F46E5', rate: 'Rp 10 Jt/HC' },
        { name: 'Pilar 3: Upskilling TNA', value: totals.up, color: '#B67207', rate: 'Rp 15 Jt/HC' },
        { name: 'Pilar 4: Otomasi Digital', value: totals.auto, color: '#00694e', rate: 'Rp 40 Jt/P' }
      ];
    }
    const p = activePlan.interventions;
    return [
      { name: 'Pilar 1: Rekrutmen Eksternal', value: p.recruitmentCount, color: '#D8433C', rate: 'Rp 25 Jt/HC' },
      { name: 'Pilar 2: Mobilitas Internal', value: p.internalMobilityCount, color: '#4F46E5', rate: 'Rp 10 Jt/HC' },
      { name: 'Pilar 3: Upskilling TNA', value: p.upskillingCount, color: '#B67207', rate: 'Rp 15 Jt/HC' },
      { name: 'Pilar 4: Otomasi Digital', value: p.automationEfficiencyCount, color: '#00694e', rate: 'Rp 40 Jt/P' }
    ];
  }, [activePlan, mppData, chartScope]);

  // Chart Data 2: Distribusi Anggaran Biaya Intervensi (Rp Juta)
  const pillarBudgetData = useMemo(() => {
    if (chartScope === 'corporate') {
      const totals = mppData.reduce(
        (acc, plan) => ({
          rec: acc.rec + plan.interventions.recruitmentCount * 25,
          mob: acc.mob + plan.interventions.internalMobilityCount * 10,
          up: acc.up + plan.interventions.upskillingCount * 15,
          auto: acc.auto + plan.interventions.automationEfficiencyCount * 40
        }),
        { rec: 0, mob: 0, up: 0, auto: 0 }
      );
      return [
        { name: 'Budget Rekrutmen', value: totals.rec, color: '#D8433C' },
        { name: 'Budget Mobilitas', value: totals.mob, color: '#4F46E5' },
        { name: 'Budget Upskilling', value: totals.up, color: '#B67207' },
        { name: 'Budget Otomasi', value: totals.auto, color: '#00694e' }
      ];
    }
    const p = activePlan.interventions;
    return [
      { name: 'Budget Rekrutmen', value: p.recruitmentCount * 25, color: '#D8433C' },
      { name: 'Budget Mobilitas', value: p.internalMobilityCount * 10, color: '#4F46E5' },
      { name: 'Budget Upskilling', value: p.upskillingCount * 15, color: '#B67207' },
      { name: 'Budget Otomasi', value: p.automationEfficiencyCount * 40, color: '#00694e' }
    ];
  }, [activePlan, mppData, chartScope]);

  // Chart Data 3: Komposisi Populasi Karyawan per Departemen (Live Database)
  const deptCompositionData = useMemo(() => {
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

    const totalCount = employees.length;

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#64748b',
      pct: totalCount > 0 ? Math.round((value / totalCount) * 100) : 0
    })).sort((a, b) => b.value - a.value);
  }, [employees]);

  // Chart Data 4: Progress Pemenuhan Target 100% Demand vs Terisi vs Belum Terisi (Gap %)
  const fulfillmentSummary = useMemo(() => {
    const activeDemand = chartScope === 'dept' ? activePlan.requiredDemand : totalDemand;
    const activeSupply = chartScope === 'dept' ? activePlan.projectedSupply : totalSupply;
    const activeGap = chartScope === 'dept' ? activePlan.gap : totalGap;

    const filledPct = activeDemand > 0 ? Math.round((activeSupply / activeDemand) * 100) : 0;
    const gapPct = activeDemand > 0 ? Math.max(0, 100 - filledPct) : 0;

    const chartData = [
      { name: 'Sudah Terisi (Supply)', value: activeSupply, color: '#10b981', pct: filledPct },
      { name: 'Belum Terisi (Gap Target)', value: activeGap, color: '#ef4444', pct: gapPct }
    ];

    return {
      demand: activeDemand,
      supply: activeSupply,
      gap: activeGap,
      filledPct,
      gapPct,
      chartData
    };
  }, [activePlan, chartScope, totalDemand, totalSupply, totalGap]);

  // Chart Data 5: Komposisi Struktur Manpower (Supply vs Attrition vs Gap)
  const workforceStructureData = useMemo(() => {
    if (chartScope === 'corporate') {
      const totalTurnover = mppData.reduce((a, c) => a + c.projectedTurnover + c.projectedRetirements, 0);
      return [
        { name: 'Supply Bertahan (Net)', value: totalSupply, color: '#16A34A' },
        { name: 'Pensiun & Turnover', value: totalTurnover, color: '#F59E0B' },
        { name: 'Defisit Gap Baru', value: totalGap, color: '#D8433C' }
      ];
    }
    const attrition = activePlan.projectedTurnover + activePlan.projectedRetirements;
    return [
      { name: 'Supply Bertahan (Net)', value: activePlan.projectedSupply, color: '#16A34A' },
      { name: 'Pensiun & Turnover', value: attrition, color: '#F59E0B' },
      { name: 'Defisit Gap Baru', value: activePlan.gap, color: '#D8433C' }
    ];
  }, [activePlan, mppData, chartScope, totalSupply, totalGap]);

  // Handler for 4-Pillar Intervention Changes
  const handleInterventionChange = (
    field: 'recruitmentCount' | 'internalMobilityCount' | 'upskillingCount' | 'automationEfficiencyCount',
    val: number
  ) => {
    const updatedInterventions = {
      ...activePlan.interventions,
      [field]: Math.max(0, val)
    };

    // Calculate approximate budget:
    // Recruitment = 25M/person, Mobility = 10M/person, Upskilling = 15M/person, Automation = 40M/process
    const estBudget = 
      updatedInterventions.recruitmentCount * 25 +
      updatedInterventions.internalMobilityCount * 10 +
      updatedInterventions.upskillingCount * 15 +
      updatedInterventions.automationEfficiencyCount * 40;

    updateMppPlan(activePlan.department, {
      interventions: updatedInterventions,
      estimatedBudgetMillionIDR: estBudget
    });
  };

  // Handler for Demand target change
  const handleDemandChange = (newDemand: number) => {
    const demand = Math.max(0, newDemand);
    const gap = Math.max(0, demand - activePlan.projectedSupply);
    updateMppPlan(activePlan.department, {
      requiredDemand: demand,
      gap
    });
  };

  // AI Auto-Balancing recommendation based on enterprise best practices
  const handleAutoBalance = () => {
    const gap = activePlan.gap;
    if (gap === 0) {
      updateMppPlan(activePlan.department, {
        interventions: {
          recruitmentCount: 0,
          internalMobilityCount: 0,
          upskillingCount: 0,
          automationEfficiencyCount: 0
        },
        estimatedBudgetMillionIDR: 0
      });
      addToast('Auto-Distribusi AI', `Gap departemen ${activePlan.department} adalah 0. Intervensi disesuaikan ke 0.`, 'info');
      return;
    }

    // Standard Strategic Allocation Ratio:
    // ~40% External Recruitment, ~25% Mobility, ~25% Upskilling, ~10% Automation
    let recruit = Math.round(gap * 0.4);
    let mobility = Math.round(gap * 0.25);
    let upskill = Math.round(gap * 0.25);
    let auto = Math.max(0, gap - (recruit + mobility + upskill));

    // Refine in case rounding causes small mismatch
    let sum = recruit + mobility + upskill + auto;
    if (sum < gap) {
      recruit += (gap - sum);
    } else if (sum > gap) {
      if (recruit > (sum - gap)) {
        recruit -= (sum - gap);
      } else {
        upskill = Math.max(0, upskill - (sum - gap));
      }
    }

    const estBudget = recruit * 25 + mobility * 10 + upskill * 15 + auto * 40;

    updateMppPlan(activePlan.department, {
      interventions: {
        recruitmentCount: recruit,
        internalMobilityCount: mobility,
        upskillingCount: upskill,
        automationEfficiencyCount: auto
      },
      estimatedBudgetMillionIDR: estBudget
    });

    addToast(
      'Formulasi AI Berhasil Diterapkan',
      `Alokasi 4-Pilar untuk ${activePlan.department} telah dioptimalkan secara otomatis (Total: ${gap} orang).`,
      'success'
    );
  };

  // Reset to initial baseline
  const handleReset = () => {
    const initialBaselineMap: Record<string, { demand: number; recruit: number; mob: number; up: number; auto: number; budget: number }> = {
      'Operations': { demand: 152, recruit: 8, mob: 4, up: 4, auto: 2, budget: 420 },
      'Engineering': { demand: 52, recruit: 3, mob: 2, up: 2, auto: 1, budget: 280 },
      'Human Resources': { demand: 16, recruit: 1, mob: 1, up: 1, auto: 0, budget: 95 },
      'Supply Chain': { demand: 40, recruit: 4, mob: 2, up: 1, auto: 1, budget: 190 },
      'Sales & Commercial': { demand: 32, recruit: 5, mob: 2, up: 1, auto: 0, budget: 260 },
      'Finance & IT': { demand: 25, recruit: 2, mob: 0, up: 1, auto: 1, budget: 140 }
    };

    const base = initialBaselineMap[activePlan.department] || { demand: activePlan.projectedSupply, recruit: 0, mob: 0, up: 0, auto: 0, budget: 0 };
    const gap = Math.max(0, base.demand - activePlan.projectedSupply);

    updateMppPlan(activePlan.department, {
      requiredDemand: base.demand,
      gap,
      interventions: {
        recruitmentCount: base.recruit,
        internalMobilityCount: base.mob,
        upskillingCount: base.up,
        automationEfficiencyCount: base.auto
      },
      estimatedBudgetMillionIDR: base.budget
    });

    addToast('Reset Berhasil', `Konfigurasi MPP untuk ${activePlan.department} dikembalikan ke baseline standar.`, 'info');
  };

  // PDF Export
  const handleExportPDF = () => {
    generateMppPDF(mppData, selectedDept);
    addToast('Laporan PDF Siap', 'Laporan Manpower Planning & Formulasi 4-Pilar berhasil diunduh.', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-[#f5fbf6] text-[#171d1a] space-y-6">
      
      {/* 1. Hero Card */}
      <div className="bg-white rounded-xl border border-[#dee4df] p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        {/* Subtle geometric aesthetic background */}
        <div 
          className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(#00694e 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        <div className="z-10 relative max-w-2xl">
          <div className="flex items-center gap-2 text-[#00694e] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Strategic Manpower Planning Studio</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#171d1a] tracking-tight mb-2">
            Kalkulator & Formulasi Intervensi Manpower (MPP)
          </h1>
          <p className="text-sm text-[#6d7a73] leading-relaxed">
            Analisis kesenjangan Demand vs Supply dan pembagian strategi pemenuhan tenaga kerja 4-Pilar terintegrasi.
          </p>
        </div>

        {/* Aggregate Stats Card (Dark Deep Forest Theme) */}
        <div className="bg-[#0E3B2E] rounded-xl p-5 text-white flex items-center justify-between gap-6 z-10 w-full sm:w-auto shadow-md">
          <div>
            <p className="text-[11px] font-bold text-[#97f5d0] uppercase tracking-wider mb-1 opacity-90">
              Total Gap Korporat
            </p>
            <p className="text-3xl font-black text-[#f87171] flex items-baseline gap-1.5">
              {totalGap} <span className="text-sm font-semibold text-white/90">Headcount</span>
            </p>
          </div>

          <div className="w-px h-12 bg-white/20" />

          <div>
            <p className="text-[11px] font-bold text-[#97f5d0] uppercase tracking-wider mb-1 opacity-90">
              Estimasi Budget Intervensi
            </p>
            <p className="text-2xl lg:text-3xl font-black text-[#86f7cd]">
              Rp {totalBudget} Juta
            </p>
          </div>
        </div>
      </div>

      {/* 2. Department Selector & View Mode Switcher */}
      <div className="bg-white rounded-xl border border-[#dee4df] p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Department Pills List */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-[#6d7a73] text-xs font-bold uppercase tracking-wider min-w-max mr-2">
            <Layers className="w-4 h-4 text-[#00694e]" />
            <span>Pilih Departemen:</span>
          </div>

          <div className="flex items-center gap-2 min-w-max">
            {mppData.map((plan) => {
              const active = plan.department === selectedDept;
              return (
                <button
                  key={plan.department}
                  onClick={() => {
                    setSelectedDept(plan.department);
                    if (viewMode !== 'studio') setViewMode('studio');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2.5 ${
                    active && viewMode === 'studio'
                      ? 'bg-[#00694e] text-white shadow-sm ring-2 ring-[#00694e]/20'
                      : 'bg-[#F3F8F5] text-[#3d4943] hover:bg-[#dee4df] hover:text-[#171d1a]'
                  }`}
                >
                  <span>{plan.department}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    active && viewMode === 'studio'
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#dee4df] text-[#3d4943]'
                  }`}>
                    Gap: {plan.gap}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
          <div className="bg-[#F3F8F5] p-1 rounded-xl flex items-center gap-1 border border-[#dee4df]">
            <button
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'studio'
                  ? 'bg-white text-[#00694e] shadow-xs'
                  : 'text-[#6d7a73] hover:text-[#171d1a]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Studio 4-Pilar</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#00694e] shadow-xs'
                  : 'text-[#6d7a73] hover:text-[#171d1a]'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Matriks Korporat (6 Dept)</span>
            </button>

            <button
              onClick={() => setViewMode('scenarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'scenarios'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-[#6d7a73] hover:text-[#171d1a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Simulator Skenario (A/B/C)</span>
            </button>
          </div>

          <button
            onClick={() => openExportImportModal('mpp', 'export')}
            title="Ekspor Rencana Manpower Planning ke Excel / CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#dee4df] bg-white text-[#3d4943] hover:text-[#00694e] hover:bg-[#F3F8F5] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00694e]" />
            <span>Export MPP</span>
          </button>

          <button
            onClick={() => openExportImportModal('mpp', 'import')}
            title="Impor Rencana Manpower Planning dari Excel / CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#dee4df] bg-white text-[#3d4943] hover:text-blue-600 hover:bg-[#F3F8F5] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import</span>
          </button>

          <button
            onClick={handleExportPDF}
            title="Ekspor Laporan MPP ke PDF"
            className="p-2.5 rounded-xl border border-[#dee4df] bg-white text-[#3d4943] hover:text-[#00694e] hover:bg-[#F3F8F5] transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'studio' ? (
        <>
          {/* 3. Step 1: Kesenjangan (Supply vs Demand Equation) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#6d7a73] uppercase tracking-widest">
                1. Perhitungan Kesenjangan (Supply vs Demand) untuk {selectedDept}
              </h3>
              <span className="text-xs font-semibold text-[#00694e] bg-[#DFF6E9] px-2.5 py-1 rounded-full">
                Status Departemen: {activePlan.gap > 0 ? `Defisit ${activePlan.gap} HC` : 'Optimal (Zero Gap)'}
              </span>
            </div>

            {/* 5 Connected Equation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative items-stretch">
              
              {/* Card 1: Headcount Eksisting */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center flex flex-col justify-center shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Headcount Eksisting
                </p>
                <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight mb-0.5">
                  {activePlan.currentHeadcount}
                </p>
                <p className="text-[11px] text-slate-400">Populasi Saat Ini</p>
              </div>

              {/* Card 2: Turnover + Pensiun */}
              <div className="bg-[#FDF0DA]/60 rounded-xl border border-[#B67207]/30 p-3.5 text-center flex flex-col justify-center relative shadow-2xs">
                {/* Connector Badge */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center z-10 text-slate-500 shadow-2xs">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-[11px] font-semibold text-[#B67207] uppercase tracking-wider mb-1.5">
                  Turnover + Pensiun
                </p>
                <p className="text-2xl font-bold font-mono text-[#B67207] tracking-tight mb-0.5">
                  -{activePlan.projectedTurnover + activePlan.projectedRetirements}
                </p>
                <p className="text-[11px] text-[#B67207]/80">
                  Turnover ({activePlan.projectedTurnover}) | Pensiun ({activePlan.projectedRetirements})
                </p>
              </div>

              {/* Card 3: Proyeksi Supply */}
              <div className="bg-[#EEF2FF] rounded-xl border border-[#C7D2FE] p-3.5 text-center flex flex-col justify-center relative shadow-2xs">
                {/* Connector Badge */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center z-10 text-slate-500 shadow-2xs">
                  <Equal className="w-3 h-3" />
                </div>
                <p className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider mb-1.5">
                  Proyeksi Supply
                </p>
                <p className="text-2xl font-bold font-mono text-[#4F46E5] tracking-tight mb-0.5">
                  {activePlan.projectedSupply}
                </p>
                <p className="text-[11px] text-[#4F46E5]/80">Tersedia di Lapangan</p>
              </div>

              {/* Card 4: Target Demand (Interactive Input) */}
              <div className="bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] p-3.5 text-center flex flex-col justify-center relative shadow-2xs">
                {/* Connector Badge */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center z-10 text-slate-500 shadow-2xs">
                  <ArrowLeftRight className="w-3 h-3 text-[#16A34A]" />
                </div>
                <p className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider mb-1.5">
                  Target Demand
                </p>
                
                {/* Interactive Demand Stepper */}
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <button
                    onClick={() => handleDemandChange(activePlan.requiredDemand - 1)}
                    className="w-6 h-6 rounded-md bg-white border border-[#BBF7D0] text-[#16A34A] hover:bg-[#dcfce7] flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Kurangi 1 Demand"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    value={activePlan.requiredDemand}
                    onChange={(e) => handleDemandChange(parseInt(e.target.value) || 0)}
                    className="w-16 bg-white border border-[#16A34A]/40 rounded-md py-0.5 text-center font-bold font-mono text-xl text-[#16A34A] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 outline-hidden"
                  />

                  <button
                    onClick={() => handleDemandChange(activePlan.requiredDemand + 1)}
                    className="w-6 h-6 rounded-md bg-white border border-[#BBF7D0] text-[#16A34A] hover:bg-[#dcfce7] flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Tambah 1 Demand"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-[#16A34A]/80">Target Beban Kerja</p>
              </div>

              {/* Card 5: Kesenjangan (Gap) */}
              <div className="bg-[#FBE4E4] rounded-xl border border-[#D8433C]/30 p-3.5 text-center flex flex-col justify-center relative shadow-2xs">
                {/* Connector Badge */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center z-10 text-slate-500 shadow-2xs">
                  <Equal className="w-3 h-3 text-[#D8433C]" />
                </div>
                <p className="text-[11px] font-semibold text-[#D8433C] uppercase tracking-wider mb-1.5">
                  Kesenjangan (Gap)
                </p>
                <p className="text-2xl font-bold font-mono text-[#D8433C] tracking-tight mb-0.5">
                  {activePlan.gap}
                </p>
                <p className="text-[11px] font-semibold text-[#D8433C]/80">Perlu Intervensi</p>
              </div>

            </div>
          </div>

          {/* 4. Step 2: Alokasi 4-Pilar Intervensi Strategis */}
          <div className="space-y-4 pt-2">
            
            {/* Step 2 Header with Left Accent Line */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-l-4 border-[#00694e] pl-4 py-1 gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#171d1a] tracking-tight">
                  2. Alokasi 4-Pilar Intervensi Strategis untuk Menutup Gap ({activePlan.gap} Orang)
                </h3>
                <p className="text-xs text-[#6d7a73] mt-0.5">
                  Kombinasikan rekrutmen eksternal, mobilitas internal, percepatan upskilling TNA, dan digitalisasi otomatisasi.
                </p>
              </div>

              {/* Intervention Status Pill & Auto-Action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAutoBalance}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DFF6E9] hover:bg-[#cbf1dc] text-[#00694e] rounded-full text-xs font-bold transition border border-[#00694e]/20 active:scale-95"
                  title="Otomatis sesuaikan alokasi 4-Pilar sesuai rasio standar"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Distribusi AI</span>
                </button>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                  isGapBalanced
                    ? 'bg-[#DFF6E9] text-[#178A55] border-[#178A55]/30'
                    : gapDifference > 0
                      ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/30'
                      : 'bg-[#FDF0DA] text-[#B67207] border-[#B67207]/30'
                }`}>
                  {isGapBalanced ? (
                    <CheckCircle2 className="w-4 h-4 text-[#178A55]" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>Total Intervensi: <strong>{totalInterventions} / {activePlan.gap}</strong></span>
                  <span className="text-[10px] uppercase font-bold opacity-80">
                    {isGapBalanced ? '• Sesuai Target' : gapDifference > 0 ? `• Surplus (+${gapDifference})` : `• Kurang (${activePlan.gap - totalInterventions})`}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Pilar 1: Rekrutmen Eksternal */}
              <div className="bg-white rounded-xl border border-[#D8433C]/30 p-5 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#FBE4E4] flex items-center justify-center text-[#D8433C]">
                      <UserPlus className="w-4.5 h-4.5" />
                    </div>
                    <span className="bg-[#FBE4E4] text-[#D8433C] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      Pilar 1
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#171d1a] mb-1.5">
                    Rekrutmen Eksternal
                  </h4>
                  <p className="text-xs text-[#6d7a73] leading-relaxed mb-3">
                    Perekrutan kandidat baru untuk peran spesifik yang tidak tersedia talenta internalnya.
                  </p>

                  <div className="text-[11px] text-[#6d7a73] bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between mb-4">
                    <span>Est. Cost Ref:</span>
                    <span className="font-semibold text-slate-700">~Rp 25 Jt / orang</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#dee4df] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3d4943]">Jumlah Headcount:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInterventionChange('recruitmentCount', activePlan.interventions.recruitmentCount - 1)}
                      className="w-7 h-7 rounded-lg bg-[#FBE4E4]/60 hover:bg-[#FBE4E4] text-[#D8433C] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activePlan.interventions.recruitmentCount}
                      onChange={(e) => handleInterventionChange('recruitmentCount', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 rounded-lg border border-[#D8433C]/40 text-center font-black text-base text-[#D8433C] bg-[#FBE4E4]/30 focus:ring-2 focus:ring-[#D8433C]/20 outline-hidden"
                    />
                    <button
                      onClick={() => handleInterventionChange('recruitmentCount', activePlan.interventions.recruitmentCount + 1)}
                      className="w-7 h-7 rounded-lg bg-[#FBE4E4]/60 hover:bg-[#FBE4E4] text-[#D8433C] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pilar 2: Mobilitas Internal */}
              <div className="bg-white rounded-xl border border-[#4F46E5]/30 p-5 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                      <RefreshCw className="w-4.5 h-4.5" />
                    </div>
                    <span className="bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      Pilar 2
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#171d1a] mb-1.5">
                    Mobilitas Internal (Transfer)
                  </h4>
                  <p className="text-xs text-[#6d7a73] leading-relaxed mb-3">
                    Redeployment dan transfer karyawan surplus dari divisi lain untuk mengoptimalkan headcount.
                  </p>

                  <div className="text-[11px] text-[#6d7a73] bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between mb-4">
                    <span>Est. Cost Ref:</span>
                    <span className="font-semibold text-slate-700">~Rp 10 Jt / orang</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#dee4df] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3d4943]">Jumlah Headcount:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInterventionChange('internalMobilityCount', activePlan.interventions.internalMobilityCount - 1)}
                      className="w-7 h-7 rounded-lg bg-[#EEF2FF] hover:bg-[#e0e7ff] text-[#4F46E5] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activePlan.interventions.internalMobilityCount}
                      onChange={(e) => handleInterventionChange('internalMobilityCount', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 rounded-lg border border-[#4F46E5]/40 text-center font-black text-base text-[#4F46E5] bg-[#EEF2FF]/50 focus:ring-2 focus:ring-[#4F46E5]/20 outline-hidden"
                    />
                    <button
                      onClick={() => handleInterventionChange('internalMobilityCount', activePlan.interventions.internalMobilityCount + 1)}
                      className="w-7 h-7 rounded-lg bg-[#EEF2FF] hover:bg-[#e0e7ff] text-[#4F46E5] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pilar 3: Upskilling & Fast TNA */}
              <div className="bg-white rounded-xl border border-[#B67207]/30 p-5 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#FDF0DA] flex items-center justify-center text-[#B67207]">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <span className="bg-[#FDF0DA] text-[#B67207] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      Pilar 3
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#171d1a] mb-1.5">
                    Upskilling & Fast TNA
                  </h4>
                  <p className="text-xs text-[#6d7a73] leading-relaxed mb-3">
                    Peningkatan kompetensi talenta eksisting (reskilling/upskilling) untuk naik peran.
                  </p>

                  <div className="text-[11px] text-[#6d7a73] bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between mb-4">
                    <span>Est. Cost Ref:</span>
                    <span className="font-semibold text-slate-700">~Rp 15 Jt / orang</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#dee4df] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3d4943]">Jumlah Headcount:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInterventionChange('upskillingCount', activePlan.interventions.upskillingCount - 1)}
                      className="w-7 h-7 rounded-lg bg-[#FDF0DA] hover:bg-[#fae7c4] text-[#B67207] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activePlan.interventions.upskillingCount}
                      onChange={(e) => handleInterventionChange('upskillingCount', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 rounded-lg border border-[#B67207]/40 text-center font-black text-base text-[#B67207] bg-[#FDF0DA]/50 focus:ring-2 focus:ring-[#B67207]/20 outline-hidden"
                    />
                    <button
                      onClick={() => handleInterventionChange('upskillingCount', activePlan.interventions.upskillingCount + 1)}
                      className="w-7 h-7 rounded-lg bg-[#FDF0DA] hover:bg-[#fae7c4] text-[#B67207] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pilar 4: Otomasi & Efisiensi Digital */}
              <div className="bg-white rounded-xl border border-[#00694e]/30 p-5 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#DFF6E9] flex items-center justify-center text-[#00694e]">
                      <Cpu className="w-4.5 h-4.5" />
                    </div>
                    <span className="bg-[#DFF6E9] text-[#00694e] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      Pilar 4
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#171d1a] mb-1.5">
                    Otomasi & Efisiensi Digital
                  </h4>
                  <p className="text-xs text-[#6d7a73] leading-relaxed mb-3">
                    Pengurangan beban kerja manual melalui sistem otomasi workflow / RPA tanpa tambah orang.
                  </p>

                  <div className="text-[11px] text-[#6d7a73] bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between mb-4">
                    <span>Est. Cost Ref:</span>
                    <span className="font-semibold text-slate-700">~Rp 40 Jt / proses</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#dee4df] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3d4943]">Setara Headcount:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInterventionChange('automationEfficiencyCount', activePlan.interventions.automationEfficiencyCount - 1)}
                      className="w-7 h-7 rounded-lg bg-[#DFF6E9] hover:bg-[#cbf1dc] text-[#00694e] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activePlan.interventions.automationEfficiencyCount}
                      onChange={(e) => handleInterventionChange('automationEfficiencyCount', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 rounded-lg border border-[#00694e]/40 text-center font-black text-base text-[#00694e] bg-[#DFF6E9]/50 focus:ring-2 focus:ring-[#00694e]/20 outline-hidden"
                    />
                    <button
                      onClick={() => handleInterventionChange('automationEfficiencyCount', activePlan.interventions.automationEfficiencyCount + 1)}
                      className="w-7 h-7 rounded-lg bg-[#DFF6E9] hover:bg-[#cbf1dc] text-[#00694e] flex items-center justify-center font-bold transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4.3. RINCIAN STRUKTUR POSISI & LEVEL MANAJEMEN DEPARTEMEN */}
          <div className="bg-white rounded-xl border border-[#dee4df] p-6 lg:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dee4df] pb-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Peta Jabatan &amp; Level Departemen</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Struktur Posisi &amp; Kuota Kebutuhan: {selectedDept}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian alokasi kebutuhan manpower per jabatan, level manajemen (Admin, Supervisor, Manager), dan rantai atasan langsung.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('org')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition shrink-0 cursor-pointer"
              >
                <span>Kelola Master Jabatan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Position Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {jobPositions.filter(p => p.department === selectedDept).map((pos) => {
                const filled = employees.filter(e => e.department === selectedDept && (e.jobTitle.toLowerCase() === pos.title.toLowerCase() || e.jobTitle.toLowerCase().includes(pos.title.toLowerCase().substring(0, 10)))).length;
                const isOver = filled > pos.targetHeadcount;
                const isUnder = filled < pos.targetHeadcount;

                return (
                  <div key={pos.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {pos.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                          {pos.level}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{pos.title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <span className="text-slate-400">Atasan:</span>
                        <span className="font-medium text-slate-700 truncate">{pos.reportsToTitle || 'Dewan Direksi'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 text-[11px]">Realisasi / Target</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {filled} / {pos.targetHeadcount} HC
                          {isUnder && <span className="text-rose-600 text-[10px] ml-1 font-semibold">(-{pos.targetHeadcount - filled} Lowong)</span>}
                          {isOver && <span className="text-amber-600 text-[10px] ml-1 font-semibold">(+{filled - pos.targetHeadcount} Berlebih)</span>}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${filled >= pos.targetHeadcount ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(100, Math.round((filled / (pos.targetHeadcount || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4.5. DIAGRAM LINGKARAN (VISUALISASI KOMPOSISI INTERVENSI & ANGGARAN MPP) */}
          <div className="bg-white rounded-xl border border-[#dee4df] p-6 lg:p-7 shadow-sm space-y-6">
            
            {/* Header with Scope Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dee4df] pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#00694e] mb-1">
                  <PieChartIcon className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Visual Analytics & Diagram Lingkaran</span>
                </div>
                <h3 className="text-lg font-bold text-[#171d1a] tracking-tight">
                  Analisis Komposisi Intervensi, Anggaran & Struktur Manpower
                </h3>
                <p className="text-xs text-[#6d7a73] mt-0.5">
                  Diagram lingkaran interaktif mencerminkan perbandingan porsi 4-Pilar dan alokasi biaya secara proporsional.
                </p>
              </div>

              {/* Scope Switcher: Departemen vs Konsolidasi Korporat */}
              <div className="flex items-center bg-[#F3F8F5] p-1 rounded-xl border border-[#dee4df] self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setChartScope('dept')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartScope === 'dept'
                      ? 'bg-[#00694e] text-white shadow-xs'
                      : 'text-[#6d7a73] hover:text-[#171d1a]'
                  }`}
                >
                  Dept: {selectedDept}
                </button>
                <button
                  onClick={() => setChartScope('corporate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartScope === 'corporate'
                      ? 'bg-[#00694e] text-white shadow-xs'
                      : 'text-[#6d7a73] hover:text-[#171d1a]'
                  }`}
                >
                  Total Korporat (6 Dept)
                </button>
              </div>
            </div>

            {/* Target 100% Demand vs Terisi vs Belum Terisi (Gap Rate Meter Banner) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00694e]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Status Pemenuhan Tenaga Kerja: Target Kebutuhan 100% vs Keterisian Riil ({chartScope === 'dept' ? selectedDept : 'Konsolidasi Korporat'})
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold font-mono">
                  <span className="text-emerald-700">Terisi: {fulfillmentSummary.supply} HC ({fulfillmentSummary.filledPct}%)</span>
                  <span className="text-rose-600">Gap Target: {fulfillmentSummary.gap} HC ({fulfillmentSummary.gapPct}%)</span>
                  <span className="text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    Target 100%: {fulfillmentSummary.demand} HC
                  </span>
                </div>
              </div>

              {/* Dual Tone Progress Bar */}
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300/60 p-0.5 shadow-inner">
                <div
                  style={{ width: `${fulfillmentSummary.filledPct}%` }}
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-bold"
                  title={`Terisi: ${fulfillmentSummary.supply} HC (${fulfillmentSummary.filledPct}%)`}
                />
                <div
                  style={{ width: `${fulfillmentSummary.gapPct}%` }}
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-bold"
                  title={`Belum Terisi (Gap): ${fulfillmentSummary.gap} HC (${fulfillmentSummary.gapPct}%)`}
                />
              </div>
            </div>

            {/* 4 Donut Charts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              
              {/* Chart 1: Komposisi Alokasi Headcount 4-Pilar */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 truncate">
                    1. Alokasi 4-Pilar
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Headcount
                  </span>
                </div>

                <div className="relative h-44 flex items-center justify-center my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pillarHeadcountData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {pillarHeadcountData.map((entry, index) => (
                          <Cell key={`cell-hc-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} Orang`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Statistic */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {chartScope === 'dept' 
                        ? totalInterventions 
                        : pillarHeadcountData.reduce((a, c) => a + c.value, 0)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">
                      Total Intervensi
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px]">
                  {pillarHeadcountData.map((item, idx) => {
                    const totalVal = pillarHeadcountData.reduce((a, c) => a + c.value, 0);
                    const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 truncate font-medium text-[10px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-900 text-[10px]">{item.value} HC</span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-1 rounded border border-slate-200">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Distribusi Anggaran Biaya Intervensi */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 truncate">
                    2. Anggaran Intervensi
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Juta IDR
                  </span>
                </div>

                <div className="relative h-44 flex items-center justify-center my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pillarBudgetData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {pillarBudgetData.map((entry, index) => (
                          <Cell key={`cell-budget-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`Rp ${val} Juta`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Budget */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-base font-black text-slate-900 leading-tight">
                      Rp {chartScope === 'dept' ? activePlan.estimatedBudgetMillionIDR : totalBudget}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 mt-0.5">
                      Juta IDR
                    </span>
                  </div>
                </div>

                {/* Legend List for Budget */}
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px]">
                  {pillarBudgetData.map((item, idx) => {
                    const totalVal = pillarBudgetData.reduce((a, c) => a + c.value, 0);
                    const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 truncate font-medium text-[10px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-900 text-[10px]">Rp {item.value} Jt</span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-1 rounded border border-slate-200">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 3: Komposisi Karyawan per Departemen (Diagram Lingkaran Komposisi) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 truncate">
                    3. Komposisi Dept
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Database Riil
                  </span>
                </div>

                <div className="relative h-44 flex items-center justify-center my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptCompositionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {deptCompositionData.map((entry, index) => (
                          <Cell key={`cell-dept-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} Orang`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Dept Employees */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {employees.length}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">
                      Karyawan
                    </span>
                  </div>
                </div>

                {/* Legend List for Dept Composition */}
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px] max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {deptCompositionData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 truncate font-medium text-[10px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-slate-900 text-[10px]">{item.value} HC</span>
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-1 rounded border border-slate-200">
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 4: Dinamika Demand vs Supply (Target 100% vs Gap) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 truncate">
                    4. Demand vs Supply
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Target 100%
                  </span>
                </div>

                <div className="relative h-44 flex items-center justify-center my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workforceStructureData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {workforceStructureData.map((entry, index) => (
                          <Cell key={`cell-dyn-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} Orang`, name]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Demand */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {chartScope === 'dept' ? activePlan.requiredDemand : totalDemand}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">
                      Target Demand
                    </span>
                  </div>
                </div>

                {/* Legend List for Dynamics */}
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px]">
                  {workforceStructureData.map((item, idx) => {
                    const totalVal = workforceStructureData.reduce((a, c) => a + c.value, 0);
                    const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 truncate font-medium text-[10px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-900 text-[10px]">{item.value} HC</span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-1 rounded border border-slate-200">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 5. Footer Action & Budget Card */}
          <div className="bg-[#0E3B2E] rounded-xl p-6 text-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 shadow-lg border border-[#00694e]/30">
            <div>
              <p className="text-[11px] font-bold text-[#97f5d0] uppercase tracking-wider mb-1 opacity-90">
                Estimasi Anggaran Intervensi ({selectedDept})
              </p>
              <h3 className="text-3xl font-black text-[#86f7cd] mb-1">
                RP {activePlan.estimatedBudgetMillionIDR} JUTA
              </h3>
              <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                Kalkulasi mencakup biaya onboarding rekrutmen (~Rp 25 Jt), paket training TNA (~Rp 15 Jt), biaya relokasi (~Rp 10 Jt), dan implementasi otomasi (~Rp 40 Jt).
              </p>

              {/* Pillar Cost Breakdown Mini-chips */}
              <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white/90">
                  Rekrutmen: <strong>Rp {activePlan.interventions.recruitmentCount * 25} Jt</strong>
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white/90">
                  Mobilitas: <strong>Rp {activePlan.interventions.internalMobilityCount * 10} Jt</strong>
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white/90">
                  Upskilling: <strong>Rp {activePlan.interventions.upskillingCount * 15} Jt</strong>
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white/90">
                  Otomasi: <strong>Rp {activePlan.interventions.automationEfficiencyCount * 40} Jt</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Baseline</span>
              </button>

              <button
                onClick={() => {
                  addToast(
                    'Rencana Intervensi MPP Disahkan',
                    `Rencana MPP untuk departemen ${selectedDept} berhasil disimpan & disahkan ke anggaran korporat.`,
                    'success'
                  );
                }}
                className="bg-[#22B58C] hover:bg-[#1fa37e] text-[#0E3B2E] font-bold text-sm px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-95"
              >
                <Save className="w-5 h-5 text-[#0E3B2E]" />
                <span>Sahkan Rencana Intervensi MPP</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* 6. Matriks Korporat (Cross-Department Table Mode) */
        <div className="bg-white rounded-xl border border-[#dee4df] shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dee4df] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#171d1a]">
                Matriks Perencanaan Manpower Seluruh Departemen
              </h3>
              <p className="text-xs text-[#6d7a73] mt-0.5">
                Monitoring komparatif kesenjangan Demand vs Supply dan alokasi 4-Pilar untuk 6 departemen korporat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#00694e] text-white rounded-xl text-xs font-bold hover:bg-[#00513c] transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan PDF</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto custom-scrollbar border border-[#dee4df] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3F8F5] text-[#3d4943] border-b border-[#dee4df] font-bold">
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-3 text-center">Eksisting</th>
                  <th className="py-3 px-3 text-center">Turnover/Pensiun</th>
                  <th className="py-3 px-3 text-center">Supply</th>
                  <th className="py-3 px-3 text-center">Demand</th>
                  <th className="py-3 px-3 text-center text-[#D8433C]">Gap</th>
                  <th className="py-3 px-3 text-center bg-[#FBE4E4]/40 text-[#D8433C]">P1: Rekrutmen</th>
                  <th className="py-3 px-3 text-center bg-[#EEF2FF]/40 text-[#4F46E5]">P2: Mobilitas</th>
                  <th className="py-3 px-3 text-center bg-[#FDF0DA]/40 text-[#B67207]">P3: Upskilling</th>
                  <th className="py-3 px-3 text-center bg-[#DFF6E9]/40 text-[#00694e]">P4: Otomasi</th>
                  <th className="py-3 px-3 text-center">Status Alokasi</th>
                  <th className="py-3 px-4 text-right">Est. Budget</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee4df]">
                {mppData.map((plan) => {
                  const planTotal = 
                    plan.interventions.recruitmentCount +
                    plan.interventions.internalMobilityCount +
                    plan.interventions.upskillingCount +
                    plan.interventions.automationEfficiencyCount;
                  const isPlanBalanced = planTotal === plan.gap;

                  return (
                    <tr 
                      key={plan.department}
                      className={`hover:bg-[#F3F8F5] transition-colors ${
                        plan.department === selectedDept ? 'bg-[#DFF6E9]/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#171d1a] flex items-center gap-2">
                        <span>{plan.department}</span>
                        {plan.department === selectedDept && (
                          <span className="text-[10px] bg-[#00694e] text-white px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">{plan.currentHeadcount}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-[#B67207]">
                        -{plan.projectedTurnover + plan.projectedRetirements}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-[#4F46E5]">{plan.projectedSupply}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-[#16A34A]">{plan.requiredDemand}</td>
                      <td className="py-3.5 px-3 text-center font-mono font-black text-[#D8433C] text-sm">
                        {plan.gap}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#D8433C] bg-[#FBE4E4]/20">
                        {plan.interventions.recruitmentCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#4F46E5] bg-[#EEF2FF]/20">
                        {plan.interventions.internalMobilityCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#B67207] bg-[#FDF0DA]/20">
                        {plan.interventions.upskillingCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#00694e] bg-[#DFF6E9]/20">
                        {plan.interventions.automationEfficiencyCount}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPlanBalanced 
                            ? 'bg-[#DFF6E9] text-[#178A55]' 
                            : planTotal > plan.gap 
                              ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                              : 'bg-[#FDF0DA] text-[#B67207]'
                        }`}>
                          {isPlanBalanced ? '100% Sesuai' : planTotal > plan.gap ? `Surplus (+${planTotal - plan.gap})` : `Kurang (-${plan.gap - planTotal})`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#171d1a]">
                        Rp {plan.estimatedBudgetMillionIDR} Jt
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedDept(plan.department);
                            setViewMode('studio');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-[#dee4df] hover:border-[#00694e] hover:text-[#00694e] transition"
                        >
                          Buka Studio
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Grand Total Row */}
              <tfoot>
                <tr className="bg-[#0E3B2E] text-white font-bold text-xs border-t-2 border-[#00694e]">
                  <td className="py-3.5 px-4 text-[#97f5d0] uppercase tracking-wider font-extrabold">
                    TOTAL KORPORAT
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    {mppData.reduce((a, b) => a + b.currentHeadcount, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-[#FDF0DA]">
                    -{mppData.reduce((a, b) => a + b.projectedTurnover + b.projectedRetirements, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-[#97f5d0]">
                    {totalSupply}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-[#86f7cd]">
                    {totalDemand}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-black text-[#f87171] text-sm">
                    {totalGap}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-200">
                    {mppData.reduce((a, b) => a + b.interventions.recruitmentCount, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-indigo-200">
                    {mppData.reduce((a, b) => a + b.interventions.internalMobilityCount, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-200">
                    {mppData.reduce((a, b) => a + b.interventions.upskillingCount, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-200">
                    {mppData.reduce((a, b) => a + b.interventions.automationEfficiencyCount, 0)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
                      {mppData.reduce((a, b) => 
                        a + b.interventions.recruitmentCount + b.interventions.internalMobilityCount + b.interventions.upskillingCount + b.interventions.automationEfficiencyCount, 0
                      ) === totalGap ? '100% Balanced' : 'Perlu Review'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#86f7cd] text-sm">
                    Rp {totalBudget} Juta
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[10px] text-white/70">—</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. SCENARIO SIMULATION STUDIO VIEW (BASELINE VS OPTION A/B/C) */}
      {viewMode === 'scenarios' && (
        <div className="space-y-6 animate-fade-in">
          {/* Scenario Header */}
          <div className="bg-white rounded-2xl border border-[#dee4df] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Multi-Criteria Strategic Simulator</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Simulasi Skenario Strategi Manpower ({mppScenarios.length} Skenario)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Bandingkan trade-off biaya, kapabilitas organisasi, risiko gesekan, dan kecepatan implementasi untuk menutup defisit headcount.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* AI Best Recommendation Badge */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Rekomendasi AI Terpilih:</span>
                <span className="font-bold text-purple-950">Option B (Best Capability &amp; Low Risk)</span>
              </div>

              <button
                onClick={() => setIsAddScenarioOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Skenario Kustom</span>
              </button>
            </div>
          </div>

          {/* 4 Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mppScenarios.map((scn) => {
              const isSelected = scn.id === selectedScenarioId;
              return (
                <div
                  key={scn.id}
                  onClick={() => setSelectedScenarioId(scn.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {scn.name}
                      </span>
                      {scn.aiTradeoff?.recommendationTag && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {scn.aiTradeoff.recommendationTag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{scn.label}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{scn.description}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Headcount:</span>
                      <strong className="text-slate-800 font-mono">{scn.totalHeadcount} HC</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimasi Total Cost:</span>
                      <strong className="text-slate-800 font-mono">Rp {scn.totalCostBillionIDR} M</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capability Score:</span>
                      <strong className="text-emerald-700">{scn.capabilityScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Waktu Implementasi:</span>
                      <strong className="text-slate-700">{scn.implementationTimeMonths === 0 ? 'Saat Ini' : `${scn.implementationTimeMonths} Bulan`}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Multi-Criteria Trade-off Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Matriks Evaluasi Komparasi AI (Trade-off Matrix)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Kriteria Evaluasi</th>
                    {mppScenarios.map((scn) => (
                      <th key={scn.id} className={`py-3 px-4 ${scn.id === selectedScenarioId ? 'bg-purple-50 text-purple-900 font-extrabold' : ''}`}>
                        {scn.label} {scn.id === 'SCN-OPT-B' && '⭐'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Total Biaya (Cost)</td>
                    {mppScenarios.map((scn) => (
                      <td key={scn.id} className={`py-3 px-4 font-mono ${scn.id === selectedScenarioId ? 'bg-purple-50/40 font-bold' : ''}`}>
                        Rp {scn.totalCostBillionIDR} M
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Capability Readiness</td>
                    {mppScenarios.map((scn) => (
                      <td key={scn.id} className={`py-3 px-4 font-bold ${scn.id === selectedScenarioId ? 'bg-purple-50/40' : ''} ${scn.capabilityScore >= 90 ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {scn.capabilityScore}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Risiko Organisasi</td>
                    {mppScenarios.map((scn) => (
                      <td key={scn.id} className={`py-3 px-4 ${scn.id === selectedScenarioId ? 'bg-purple-50/40' : ''} ${scn.riskScore === 'Low' ? 'text-emerald-700 font-bold' : scn.riskScore === 'Medium' ? 'text-amber-700' : 'text-rose-700'}`}>
                        {scn.riskScore}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Kecepatan Eksekusi</td>
                    {mppScenarios.map((scn) => (
                      <td key={scn.id} className={`py-3 px-4 ${scn.id === selectedScenarioId ? 'bg-purple-50/40' : ''} text-slate-700 font-medium`}>
                        {scn.implementationTimeMonths === 0 ? 'Saat Ini' : `${scn.implementationTimeMonths} Bulan`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
              <span className="text-xs text-slate-500">
                Skenario aktif: <strong>{mppScenarios.find(s => s.id === selectedScenarioId)?.label || 'Baseline'}</strong>
              </span>

              <button
                onClick={() => {
                  setViewMode('studio');
                  addToast('Skenario Diterapkan', 'Formulasi 4-Pilar telah disesuaikan dengan Skenario terpilih.', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terapkan Skenario ke Studio MPP</span>
              </button>
            </div>
          </div>

          {/* ADD SCENARIO MODAL */}
          {isAddScenarioOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Buat Skenario Strategi MPP Kustom</h3>
                  </div>
                  <button
                    onClick={() => setIsAddScenarioOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateScenario} className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kode Skenario</label>
                      <input
                        type="text"
                        value={newScnCode}
                        onChange={(e) => setNewScnCode(e.target.value)}
                        placeholder="Contoh: OPTION_D"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tag Rekomendasi</label>
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Best Capability">Best Capability</option>
                        <option value="Lowest Cost">Lowest Cost</option>
                        <option value="Lowest Risk">Lowest Risk</option>
                        <option value="Fastest Implementation">Fastest Implementation</option>
                        <option value="Baseline">Baseline</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Judul / Label Skenario</label>
                    <input
                      type="text"
                      value={newScnLabel}
                      onChange={(e) => setNewScnLabel(e.target.value)}
                      placeholder="Contoh: Option D (Hybrid Automation + Internal Mobility)"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi Skenario</label>
                    <textarea
                      rows={2}
                      value={newScnDesc}
                      onChange={(e) => setNewScnDesc(e.target.value)}
                      placeholder="Keterangan strategi pemenuhan tenaga kerja..."
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <span className="font-bold text-purple-950 block">Alokasi Headcount 4-Pilar:</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Buy (Recruit)</span>
                        <input
                          type="number" min={0}
                          value={newRecruit}
                          onChange={(e) => setNewRecruit(Number(e.target.value))}
                          className="w-full h-8 text-center rounded border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Build (Upskill)</span>
                        <input
                          type="number" min={0}
                          value={newUpskill}
                          onChange={(e) => setNewUpskill(Number(e.target.value))}
                          className="w-full h-8 text-center rounded border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Borrow (Contract)</span>
                        <input
                          type="number" min={0}
                          value={newContract}
                          onChange={(e) => setNewContract(Number(e.target.value))}
                          className="w-full h-8 text-center rounded border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Bot (Otomasi)</span>
                        <input
                          type="number" min={0}
                          value={newAuto}
                          onChange={(e) => setNewAuto(Number(e.target.value))}
                          className="w-full h-8 text-center rounded border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Total Biaya (Rp M)</label>
                      <input
                        type="number" min={0} step="0.1"
                        value={newCost}
                        onChange={(e) => setNewCost(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Skor Kapabilitas (%)</label>
                      <input
                        type="number" min={0} max={100}
                        value={newCapability}
                        onChange={(e) => setNewCapability(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Waktu (Bulan)</label>
                      <input
                        type="number" min={0}
                        value={newMonths}
                        onChange={(e) => setNewMonths(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddScenarioOpen(false)}
                      className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                    >
                      Simpan Skenario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
