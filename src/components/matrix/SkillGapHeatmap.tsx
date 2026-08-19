import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { Department, JobLevel } from '../../types';
import { DEPARTMENTS, JOB_LEVELS } from '../../data/mockData';
import { 
  Flame, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Target, 
  ArrowUpRight, 
  Filter, 
  Zap, 
  SlidersHorizontal,
  ChevronRight,
  UserCheck
} from 'lucide-react';

// Standard expected competency benchmarks by job level (0 - 100 scale)
export const LEVEL_TARGET_BENCHMARKS: Record<JobLevel, {
  performance: number;
  leadership: number;
  technical: number;
  adaptability: number;
  cultureFit: number;
}> = {
  Director: { performance: 90, leadership: 95, technical: 85, adaptability: 90, cultureFit: 95 },
  Manager: { performance: 85, leadership: 85, technical: 85, adaptability: 85, cultureFit: 90 },
  Supervisor: { performance: 80, leadership: 75, technical: 80, adaptability: 80, cultureFit: 85 },
  'Senior Staff': { performance: 80, leadership: 65, technical: 85, adaptability: 75, cultureFit: 80 },
  Staff: { performance: 75, leadership: 50, technical: 75, adaptability: 75, cultureFit: 80 },
  Admin: { performance: 75, leadership: 45, technical: 75, adaptability: 75, cultureFit: 80 },
  Operator: { performance: 70, leadership: 40, technical: 70, adaptability: 70, cultureFit: 75 },
};

export const COMPETENCY_LABELS = [
  { key: 'performance', label: 'Performance / Hasil Kerja', shortLabel: 'Kinerja', icon: Target },
  { key: 'leadership', label: 'Leadership & People Mgmt', shortLabel: 'Leadership', icon: Award },
  { key: 'technical', label: 'Technical & Functional Skill', shortLabel: 'Teknis', icon: Zap },
  { key: 'adaptability', label: 'Agility & Problem Solving', shortLabel: 'Adaptasi', icon: SlidersHorizontal },
  { key: 'cultureFit', label: 'Core Values & Culture Fit', shortLabel: 'Budaya', icon: UserCheck },
] as const;

export interface RoleGapSummary {
  roleKey: string;
  department: Department;
  level: JobLevel;
  jobTitle: string;
  incumbentsCount: number;
  avgProficiency: number;
  targetBenchmark: number;
  overallGap: number; // targetBenchmark - avgProficiency (positive means deficiency)
  trainingNeedPriority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'OPTIMAL';
  competencies: {
    key: string;
    label: string;
    shortLabel: string;
    currentAvg: number;
    target: number;
    gap: number;
  }[];
  unmetTrainingPercentage: number;
  topMissingTrainings: string[];
}

export const SkillGapHeatmap: React.FC = () => {
  const { 
    employees, 
    trainingModules, 
    getRuleFor, 
    setSelectedEmployee, 
    setIsEmployeeModalOpen,
    setActiveTab
  } = useWorkforce();

  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'highest-gap' | 'lowest-proficiency' | 'headcount'>('highest-gap');
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);

  // Compute Skill Gap per Role (Grouped by Department & JobTitle/Level)
  const roleGaps: RoleGapSummary[] = useMemo(() => {
    const roleMap: Record<string, {
      department: Department;
      level: JobLevel;
      jobTitle: string;
      employees: typeof employees;
    }> = {};

    employees.forEach((emp) => {
      const key = `${emp.department}___${emp.jobTitle}___${emp.level}`;
      if (!roleMap[key]) {
        roleMap[key] = {
          department: emp.department,
          level: emp.level,
          jobTitle: emp.jobTitle,
          employees: []
        };
      }
      roleMap[key].employees.push(emp);
    });

    const results: RoleGapSummary[] = Object.entries(roleMap).map(([roleKey, data]) => {
      const { department, level, jobTitle, employees: roleEmps } = data;
      const target = LEVEL_TARGET_BENCHMARKS[level] || {
        performance: 75,
        leadership: 60,
        technical: 75,
        adaptability: 75,
        cultureFit: 80
      };

      const empCount = roleEmps.length;

      // Average actual proficiencies from employee radar
      const currentPerf = Math.round(roleEmps.reduce((acc, e) => acc + (e.radar?.performance ?? 70), 0) / empCount);
      const currentLead = Math.round(roleEmps.reduce((acc, e) => acc + (e.radar?.leadership ?? 60), 0) / empCount);
      const currentTech = Math.round(roleEmps.reduce((acc, e) => acc + (e.radar?.technical ?? 70), 0) / empCount);
      const currentAdapt = Math.round(roleEmps.reduce((acc, e) => acc + (e.radar?.adaptability ?? 70), 0) / empCount);
      const currentCult = Math.round(roleEmps.reduce((acc, e) => acc + (e.radar?.cultureFit ?? 75), 0) / empCount);

      const compList = [
        {
          key: 'performance',
          label: 'Performance / Hasil Kerja',
          shortLabel: 'Kinerja',
          currentAvg: currentPerf,
          target: target.performance,
          gap: Math.max(0, target.performance - currentPerf)
        },
        {
          key: 'leadership',
          label: 'Leadership & People Mgmt',
          shortLabel: 'Leadership',
          currentAvg: currentLead,
          target: target.leadership,
          gap: Math.max(0, target.leadership - currentLead)
        },
        {
          key: 'technical',
          label: 'Technical & Functional Skill',
          shortLabel: 'Teknis',
          currentAvg: currentTech,
          target: target.technical,
          gap: Math.max(0, target.technical - currentTech)
        },
        {
          key: 'adaptability',
          label: 'Agility & Problem Solving',
          shortLabel: 'Adaptasi',
          currentAvg: currentAdapt,
          target: target.adaptability,
          gap: Math.max(0, target.adaptability - currentAdapt)
        },
        {
          key: 'cultureFit',
          label: 'Core Values & Culture Fit',
          shortLabel: 'Budaya',
          currentAvg: currentCult,
          target: target.cultureFit,
          gap: Math.max(0, target.cultureFit - currentCult)
        }
      ];

      const avgTarget = Math.round(
        (target.performance + target.leadership + target.technical + target.adaptability + target.cultureFit) / 5
      );
      const avgCurrent = Math.round(
        (currentPerf + currentLead + currentTech + currentAdapt + currentCult) / 5
      );
      const overallGap = Math.max(0, avgTarget - avgCurrent);

      // Analyze TNA Rule gaps for these incumbents
      const rule = getRuleFor(department, level);
      let missingModuleCounts: Record<string, number> = {};
      let totalRequiredSlots = 0;
      let uncompletedRequiredSlots = 0;

      if (rule && rule.requiredTrainingIds.length > 0) {
        rule.requiredTrainingIds.forEach((modId) => {
          roleEmps.forEach((emp) => {
            totalRequiredSlots++;
            const status = emp.trainings[modId]?.status;
            if (status !== 'done') {
              uncompletedRequiredSlots++;
              missingModuleCounts[modId] = (missingModuleCounts[modId] || 0) + 1;
            }
          });
        });
      }

      const unmetTrainingPercentage = totalRequiredSlots > 0 
        ? Math.round((uncompletedRequiredSlots / totalRequiredSlots) * 100) 
        : 0;

      const topMissingTrainings = Object.entries(missingModuleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => {
          const mod = trainingModules.find((m) => m.id === id);
          return mod ? `${mod.code} (${mod.name})` : id;
        });

      // Training Need Priority formula based on Skill Gap + Unmet Training %
      let trainingNeedPriority: RoleGapSummary['trainingNeedPriority'] = 'LOW';
      if (overallGap >= 15 || unmetTrainingPercentage >= 60) {
        trainingNeedPriority = 'CRITICAL';
      } else if (overallGap >= 10 || unmetTrainingPercentage >= 40) {
        trainingNeedPriority = 'HIGH';
      } else if (overallGap >= 5 || unmetTrainingPercentage >= 20) {
        trainingNeedPriority = 'MODERATE';
      } else if (overallGap <= 0 && unmetTrainingPercentage === 0) {
        trainingNeedPriority = 'OPTIMAL';
      }

      return {
        roleKey,
        department,
        level,
        jobTitle,
        incumbentsCount: empCount,
        avgProficiency: avgCurrent,
        targetBenchmark: avgTarget,
        overallGap,
        trainingNeedPriority,
        competencies: compList,
        unmetTrainingPercentage,
        topMissingTrainings
      };
    });

    return results;
  }, [employees, trainingModules, getRuleFor]);

  // Filter & Sort
  const filteredRoles = useMemo(() => {
    return roleGaps
      .filter((r) => {
        if (selectedDept !== 'All' && r.department !== selectedDept) return false;
        if (selectedLevel !== 'All' && r.level !== selectedLevel) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'highest-gap') {
          return b.overallGap - a.overallGap || b.unmetTrainingPercentage - a.unmetTrainingPercentage;
        }
        if (sortOrder === 'lowest-proficiency') {
          return a.avgProficiency - b.avgProficiency;
        }
        if (sortOrder === 'headcount') {
          return b.incumbentsCount - a.incumbentsCount;
        }
        return 0;
      });
  }, [roleGaps, selectedDept, selectedLevel, sortOrder]);

  // Priority Stats Summary
  const prioritySummary = useMemo(() => {
    const critical = roleGaps.filter((r) => r.trainingNeedPriority === 'CRITICAL').length;
    const high = roleGaps.filter((r) => r.trainingNeedPriority === 'HIGH').length;
    const moderate = roleGaps.filter((r) => r.trainingNeedPriority === 'MODERATE').length;
    const optimal = roleGaps.filter((r) => r.trainingNeedPriority === 'OPTIMAL' || r.trainingNeedPriority === 'LOW').length;
    return { critical, high, moderate, optimal };
  }, [roleGaps]);

  // Selected detailed role
  const activeRoleDetail = useMemo(() => {
    if (!selectedRoleKey) return filteredRoles[0] || null;
    return roleGaps.find((r) => r.roleKey === selectedRoleKey) || filteredRoles[0] || null;
  }, [selectedRoleKey, roleGaps, filteredRoles]);

  // Heatmap Cell Color Logic (Delta between Current vs Target)
  const getGapCellColor = (gap: number, current: number, target: number) => {
    if (gap >= 16) {
      return {
        bg: 'bg-rose-600 text-white font-bold',
        badge: 'bg-rose-900/40 text-rose-100 border-rose-400',
        intensity: 'Critical Deficiency',
        dot: 'bg-rose-500'
      };
    }
    if (gap >= 9) {
      return {
        bg: 'bg-orange-500 text-white font-bold',
        badge: 'bg-orange-900/40 text-orange-100 border-orange-400',
        intensity: 'High Gap',
        dot: 'bg-orange-500'
      };
    }
    if (gap >= 4) {
      return {
        bg: 'bg-amber-400 text-slate-900 font-semibold',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        intensity: 'Moderate Gap',
        dot: 'bg-amber-400'
      };
    }
    if (gap > 0) {
      return {
        bg: 'bg-emerald-200 text-emerald-950 font-medium',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        intensity: 'Minor Gap',
        dot: 'bg-emerald-400'
      };
    }
    return {
      bg: 'bg-emerald-600 text-white font-bold',
      badge: 'bg-emerald-900/40 text-emerald-100 border-emerald-400',
      intensity: 'Target Achieved',
      dot: 'bg-emerald-400'
    };
  };

  const getPriorityBadge = (priority: RoleGapSummary['trainingNeedPriority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
            <Flame className="w-3 h-3 text-rose-600" />
            Critical Need
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            High Need
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Moderate
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Low Priority
          </span>
        );
      case 'OPTIMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Optimal
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* 1. HEATMAP HEADER & STRATEGIC OVERVIEW */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-white">
              Visual Skill Gap & Training Need Heatmap
            </h2>
            <span className="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Proficiency vs Benchmark Target
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Menyoroti jabatan/posisi kerja dengan defisit kompetensi tertinggi terhadap standar target jabatan, serta mengidentifikasi prioritas kurikulum pelatihan yang wajib diintervensi.
          </p>
        </div>

        {/* Priority Quick Counter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-rose-950/60 border border-rose-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-bold text-rose-300 uppercase">Critical Needs</span>
            <span className="text-lg font-black text-rose-400 leading-none">{prioritySummary.critical} Roles</span>
          </div>
          <div className="bg-orange-950/60 border border-orange-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-bold text-orange-300 uppercase">High Priority</span>
            <span className="text-lg font-black text-orange-400 leading-none">{prioritySummary.high} Roles</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Moderate / Low</span>
            <span className="text-lg font-black text-slate-200 leading-none">{prioritySummary.moderate + prioritySummary.optimal} Roles</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SORT CONTROLS BAR */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Departemen:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as Department | 'All')}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Semua Departemen</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Golongan:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as JobLevel | 'All')}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Semua Level</option>
              {JOB_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Urutkan:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="highest-gap">Defisit / Kesenjangan Tertinggi</option>
              <option value="lowest-proficiency">Rata-rata Skor Terendah</option>
              <option value="headcount">Jumlah Karyawan Terbanyak</option>
            </select>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Tingkat Defisit:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-rose-600"></span>
            <span>Kritis (&gt;15 poin)</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-3 h-3 rounded-xs bg-orange-500"></span>
            <span>Tinggi (9-15)</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-3 h-3 rounded-xs bg-amber-400"></span>
            <span>Sedang (4-8)</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
            <span>Memenuhi Target</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN HEATMAP TABLE + DETAILS SPLIT VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-200">
        
        {/* HEATMAP MATRIX TABLE (8 cols on XL) */}
        <div className="xl:col-span-8 overflow-x-auto p-4 custom-scrollbar">
          <div className="min-w-170">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3 rounded-tl-lg min-w-45">Posisi &amp; Departemen</th>
                  <th className="p-3 text-center min-w-17.5">Headcount</th>
                  {COMPETENCY_LABELS.map((c) => (
                    <th key={c.key} className="p-3 text-center min-w-22.5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-800">{c.shortLabel}</span>
                        <span className="text-[9px] font-normal text-slate-400">Target</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-25">Overall Gap</th>
                  <th className="p-3 rounded-tr-lg text-center min-w-27.5">TNA Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRoles.map((role) => {
                  const isSelected = activeRoleDetail?.roleKey === role.roleKey;
                  return (
                    <tr
                      key={role.roleKey}
                      onClick={() => setSelectedRoleKey(role.roleKey)}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-50/80 ring-1 ring-indigo-500/30' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Role and Department */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{role.jobTitle}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                              {role.level}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{role.department}</span>
                        </div>
                      </td>

                      {/* Headcount */}
                      <td className="p-3 text-center font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">
                          {role.incumbentsCount} org
                        </span>
                      </td>

                      {/* 5 Competency Heatmap Cells */}
                      {role.competencies.map((comp) => {
                        const style = getGapCellColor(comp.gap, comp.currentAvg, comp.target);
                        return (
                          <td key={comp.key} className="p-2 text-center">
                            <div
                              className={`rounded-lg py-1.5 px-2 flex flex-col items-center justify-center transition-transform hover:scale-105 shadow-2xs ${style.bg}`}
                              title={`${comp.label}\nAktual: ${comp.currentAvg}/100 | Target: ${comp.target}/100\nKesenjangan: -${comp.gap} poin`}
                            >
                              <span className="text-xs leading-tight font-black">{comp.currentAvg}</span>
                              <span className="text-[9px] opacity-85 leading-tight">
                                {comp.gap > 0 ? `-${comp.gap} gap` : '✓ OK'}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      {/* Overall Average Gap */}
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            role.overallGap >= 15 ? 'bg-rose-100 text-rose-700' :
                            role.overallGap >= 8 ? 'bg-orange-100 text-orange-700' :
                            role.overallGap > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {role.overallGap > 0 ? `-${role.overallGap} Pts` : 'Met Target'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            Aktual {role.avgProficiency} / {role.targetBenchmark}
                          </span>
                        </div>
                      </td>

                      {/* Training Need Priority */}
                      <td className="p-3 text-center">
                        {getPriorityBadge(role.trainingNeedPriority)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: SELECTED ROLE INTERVENTION CARD (4 cols on XL) */}
        <div className="xl:col-span-4 p-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
          {activeRoleDetail ? (
            <div className="space-y-4">
              
              {/* Header Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {activeRoleDetail.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {activeRoleDetail.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Golongan {activeRoleDetail.level} • {activeRoleDetail.incumbentsCount} Karyawan Aktif
                    </p>
                  </div>
                  <div>
                    {getPriorityBadge(activeRoleDetail.trainingNeedPriority)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rata-rata Skor</span>
                    <span className="text-base font-black text-slate-800">{activeRoleDetail.avgProficiency} / 100</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kesenjangan Target</span>
                    <span className={`text-base font-black ${activeRoleDetail.overallGap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {activeRoleDetail.overallGap > 0 ? `-${activeRoleDetail.overallGap} Pts` : 'Met'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown per 5 Competencies */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Profil 5 Pilar Kompetensi</span>
                  <span className="text-[10px] text-slate-400 font-normal">Target vs Aktual</span>
                </h4>

                <div className="space-y-2">
                  {activeRoleDetail.competencies.map((c) => {
                    const pct = Math.min(100, Math.round((c.currentAvg / c.target) * 100));
                    return (
                      <div key={c.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span className="truncate">{c.label}</span>
                          <span className="font-mono text-slate-900 font-bold">
                            {c.currentAvg} <span className="text-slate-400 font-normal">/ {c.target}</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, (c.currentAvg / 100) * 100)}%` }}
                            className={`h-full rounded-full transition-all ${
                              c.gap >= 15 ? 'bg-rose-500' :
                              c.gap >= 8 ? 'bg-orange-500' :
                              c.gap > 0 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Training Modules to Close Gap */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4>Rekomendasi Modul Intervensi TNA</h4>
                </div>

                {activeRoleDetail.topMissingTrainings.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {activeRoleDetail.topMissingTrainings.map((modStr, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{modStr}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-medium">
                    Semua modul wajib kurikulum TNA untuk posisi ini telah terpenuhi secara optimal.
                  </div>
                )}
              </div>

              {/* Incumbent Staff List */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Karyawan Pemegang Jabatan ({activeRoleDetail.incumbentsCount})
                </h4>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                  {employees
                    .filter((e) => e.department === activeRoleDetail.department && e.jobTitle === activeRoleDetail.jobTitle)
                    .map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsEmployeeModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-1.5 rounded-lg text-left transition-all group"
                      >
                        <img src={emp.avatarUrl} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                        <div className="leading-tight pr-1">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block truncate max-w-30">
                            {emp.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.nip}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Pilih salah satu baris posisi pada heatmap untuk melihat analisis mendalam.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
