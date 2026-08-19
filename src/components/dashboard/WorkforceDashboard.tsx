import React, { useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { Card, StatCard, Badge, SectionLabel } from '../common/ui';
import {
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle2,
  FileText,
  Building2,
  Target,
  ArrowUpRight,
  Layers,
  PieChart as PieChartIcon,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
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

export const WorkforceDashboard: React.FC = () => {
  const {
    employees,
    trainingModules,
    criticalPositions,
    mppData,
    getRuleFor,
    setActiveTab,
    stats
  } = useWorkforce();

  // 1. Module Stats Calculation for Bar Chart
  const moduleChartData = useMemo(() => {
    const statsMap: Record<string, { name: string; code: string; done: number; progress: number; not_done: number }> = {};

    trainingModules.slice(0, 6).forEach((m) => {
      statsMap[m.id] = {
        name: m.name.length > 18 ? m.name.substring(0, 18) + '...' : m.name,
        code: m.code,
        done: 0,
        progress: 0,
        not_done: 0
      };
    });

    employees.forEach((emp) => {
      const rule = getRuleFor(emp.department, emp.level);
      if (!rule) return;

      rule.requiredTrainingIds.forEach((modId) => {
        if (!statsMap[modId]) return;
        const status = emp.trainings[modId]?.status || 'not_done';
        if (status === 'done') statsMap[modId].done++;
        else if (status === 'progress') statsMap[modId].progress++;
        else statsMap[modId].not_done++;
      });
    });

    return Object.values(statsMap);
  }, [employees, trainingModules, getRuleFor]);

  // 2. Overall TNA Status Donut Data
  const pieData = useMemo(() => {
    let qualified = 0;
    let gap = 0;

    employees.forEach((emp) => {
      const rule = getRuleFor(emp.department, emp.level);
      if (!rule) {
        qualified++;
        return;
      }
      const required = rule.requiredTrainingIds || [];
      const completed = required.filter(id => emp.trainings[id]?.status === 'done').length;
      if (completed === required.length) qualified++;
      else gap++;
    });

    return [
      { name: 'Memenuhi Kualifikasi', value: qualified, color: '#10b981' },
      { name: 'Kesenjangan Pelatihan', value: gap, color: '#f59e0b' }
    ];
  }, [employees, getRuleFor]);

  // 3. Department Composition Pie Chart Data (Komposisi Karyawan per Departemen)
  const deptCompositionData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });

    const colors: Record<string, string> = {
      'Operations': '#0284c7', // Sky Blue
      'Engineering': '#6366f1', // Indigo
      'Supply Chain': '#0d9488', // Teal
      'Sales & Commercial': '#f59e0b', // Amber
      'Finance & IT': '#8b5cf6', // Purple
      'Human Resources': '#ec4899' // Pink
    };

    const totalCount = employees.length;

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#64748b',
      pct: totalCount > 0 ? Math.round((value / totalCount) * 100) : 0
    })).sort((a, b) => b.value - a.value);
  }, [employees]);

  // 4. Fulfillment vs Gap Progress Data (Target 100% vs Terisi vs Belum Terisi)
  const fulfillmentSummary = useMemo(() => {
    const totalDemand = mppData.reduce((a, c) => a + c.requiredDemand, 0);
    const totalFilled = mppData.reduce((a, c) => a + c.projectedSupply, 0);
    const totalGap = mppData.reduce((a, c) => a + c.gap, 0);

    const filledPct = totalDemand > 0 ? Math.round((totalFilled / totalDemand) * 100) : 0;
    const gapPct = totalDemand > 0 ? Math.max(0, 100 - filledPct) : 0;

    const chartData = [
      { name: 'Sudah Terisi (Supply Eksisting)', value: totalFilled, color: '#10b981', pct: filledPct },
      { name: 'Belum Terisi (Kebutuhan Gap)', value: totalGap, color: '#ef4444', pct: gapPct }
    ];

    const deptBreakdown = mppData.map((d) => {
      const dPct = d.requiredDemand > 0 ? Math.round((d.projectedSupply / d.requiredDemand) * 100) : 0;
      return {
        dept: d.department,
        demand: d.requiredDemand,
        supply: d.projectedSupply,
        gap: d.gap,
        filledPct: Math.min(100, dPct),
        gapPct: Math.max(0, 100 - dPct)
      };
    });

    return {
      totalDemand,
      totalFilled,
      totalGap,
      filledPct,
      gapPct,
      chartData,
      deptBreakdown
    };
  }, [mppData]);

  // Critical positions without successor
  const criticalAlerts = useMemo(() => {
    return criticalPositions.filter(p => p.riskLevel === 'High' || p.successors.length === 0).slice(0, 4);
  }, [criticalPositions]);

  // Expiring contracts
  const expiringContracts = useMemo(() => {
    return employees.filter(e => e.employmentType === 'PKWT (Contract)' && e.contractEndDate).slice(0, 4);
  }, [employees]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-7 space-y-6 bg-slate-50">
      
      {/* 4 Clean Soft KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Karyawan"
          value={stats.totalEmployees}
          icon={Users}
          tone="signal"
          footer={<span className="text-slate-500">{deptCompositionData.length} Departemen Aktif</span>}
          onClick={() => setActiveTab('employees')}
        />
        <StatCard
          label="Kepatuhan TNA"
          value={`${stats.complianceRate}%`}
          icon={Award}
          tone="success"
          progress={stats.complianceRate}
          footer={<span className="text-emerald-700">Rasio Standar Kompetensi</span>}
          onClick={() => setActiveTab('matrix')}
        />
        <StatCard
          label="Kesenjangan TNA"
          value={stats.totalGapCount}
          icon={AlertTriangle}
          tone="warning"
          footer={<span className="text-amber-700">Perlu Penjadwalan Pelatihan</span>}
          onClick={() => setActiveTab('matrix')}
        />
        <StatCard
          label="Pemenuhan Manpower (MPP)"
          value={`${fulfillmentSummary.filledPct}%`}
          icon={Target}
          tone={fulfillmentSummary.filledPct >= 90 ? 'success' : 'warning'}
          progress={fulfillmentSummary.filledPct}
          footer={<span className="text-blue-700">Gap: {fulfillmentSummary.totalGap} HC ({fulfillmentSummary.gapPct}%)</span>}
          onClick={() => setActiveTab('mpp')}
        />
      </div>

      {/* SECTION BARU: KOMPOSISI DEPARTEMEN & TARGET PEMENUHAN MANPOWER (100% vs GAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. Diagram Lingkaran Komposisi Karyawan per Departemen */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Komposisi Karyawan per Departemen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribusi populasi talenta aktif di seluruh unit kerja perusahaan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('employees')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
              >
                <span>Lihat Talenta</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart with Center Metric */}
            <div className="h-56 w-full flex items-center justify-center relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {deptCompositionData.map((entry, index) => (
                      <Cell key={`cell-dept-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Karyawan`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {employees.length}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">
                  Total Karyawan
                </span>
              </div>
            </div>
          </div>

          {/* Department Breakdown Legend Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
            {deptCompositionData.map((item, i) => (
              <div
                key={i}
                className="bg-slate-50/80 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/60 flex flex-col justify-between transition"
              >
                <div className="flex items-center gap-1.5 min-w-0 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium truncate text-[11px]">{item.name}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 text-xs">{item.value} Orang</span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Grafik Pemenuhan Target 100% vs Keterisian & Gap Tenaga Kerja */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Progress Target Manpower vs Gap (100% Demand)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target 100% pemenuhan tenaga kerja, rasio keterisian riil, dan defisit gap
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('mpp')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
              >
                <span>Studio MPP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Aggregate Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Target Kebutuhan (100%)</p>
                <p className="text-base sm:text-lg font-black text-slate-900">{fulfillmentSummary.totalDemand} HC</p>
              </div>
              <div className="border-x border-slate-200 px-2">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Sudah Terisi ({fulfillmentSummary.filledPct}%)</p>
                <p className="text-base sm:text-lg font-black text-emerald-600">{fulfillmentSummary.totalFilled} HC</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-600">Belum Terisi ({fulfillmentSummary.gapPct}%)</p>
                <p className="text-base sm:text-lg font-black text-rose-600">{fulfillmentSummary.totalGap} HC</p>
              </div>
            </div>

            {/* Visual Dual-Color 100% Target Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Terisi: {fulfillmentSummary.filledPct}%</span>
                </span>
                <span className="text-rose-700 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Defisit Gap: {fulfillmentSummary.gapPct}%</span>
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5 shadow-inner">
                <div
                  style={{ width: `${fulfillmentSummary.filledPct}%` }}
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold"
                  title={`Sudah Terisi: ${fulfillmentSummary.totalFilled} HC (${fulfillmentSummary.filledPct}%)`}
                />
                <div
                  style={{ width: `${fulfillmentSummary.gapPct}%` }}
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold"
                  title={`Belum Terisi (Gap): ${fulfillmentSummary.totalGap} HC (${fulfillmentSummary.gapPct}%)`}
                />
              </div>
            </div>

            {/* Department Breakdown Mini Progress Bars */}
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {fulfillmentSummary.deptBreakdown.map((dept) => (
                <div key={dept.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{dept.dept}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-emerald-700 font-bold">{dept.supply}/{dept.demand} HC ({dept.filledPct}%)</span>
                      <span className={`px-1.5 py-0.2 rounded-md font-bold ${dept.gap > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'}`}>
                        {dept.gap > 0 ? `Gap: -${dept.gap}` : 'Optimal'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${dept.filledPct}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${dept.gapPct}%` }}
                      className="h-full bg-rose-400 transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Pemenuhan Korporat: 100% Target Demand</span>
            <button
              onClick={() => setActiveTab('mpp')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Formulasi 4-Pilar Intervensi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

      </div>

      {/* 2 Clean Analytics Charts (TNA & Modul Training) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Bar Chart of Module Completion */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Realisasi Pelatihan per Modul Wajib</h3>
                <p className="text-xs text-slate-500">Jumlah karyawan yang telah menyelesaikan pelatihan wajib posisi</p>
              </div>
              <button
                onClick={() => setActiveTab('matrix')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Matriks <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Bar dataKey="done" name="Selesai (Done)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="progress" name="Sedang Jalan" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="not_done" name="Belum Ikut" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Sedang Jalan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
              <span>Belum</span>
            </div>
          </div>
        </Card>

        {/* Right: Pie Distribution (TNA Qualification) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Status Kualifikasi Karyawan</h3>
            <p className="text-xs text-slate-500 mb-4">Persentase pemenuhan syarat TNA posisi</p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value} Karyawan</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 2 Clean Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Positions Alert */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3.5">
            <SectionLabel icon={AlertTriangle}>Posisi Kritis & Risiko Suksesi</SectionLabel>
            <button
              onClick={() => setActiveTab('org')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {criticalAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Semua posisi kritis memiliki suksesor siap pakai.</p>
            ) : (
              criticalAlerts.map((pos) => (
                <div key={pos.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{pos.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Pemegang: {pos.currentHolder} • <span className="text-slate-400">{pos.department}</span>
                    </p>
                  </div>
                  <Badge tone={pos.successors.length === 0 ? 'danger' : 'warning'}>
                    {pos.successors.length === 0 ? 'Tanpa Suksesor' : `${pos.successors.length} Suksesor`}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Expiring Contracts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3.5">
            <SectionLabel icon={Clock}>Kontrak PKWT Menjelang Berakhir</SectionLabel>
            <button
              onClick={() => setActiveTab('employees')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Semua Karyawan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {expiringContracts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Tidak ada kontrak PKWT yang akan habis dalam waktu dekat.</p>
            ) : (
              expiringContracts.map((emp) => (
                <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {emp.jobTitle} • <span className="text-slate-400">{emp.department}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      {emp.contractEndDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};
