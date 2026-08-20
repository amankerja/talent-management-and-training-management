import React, { useState, useMemo, useEffect } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Target,
  Compass,
  Award,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  Plus,
  ShieldCheck,
  Building2,
  DollarSign,
  Edit2,
  Edit3,
  Save,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  SlidersHorizontal,
  GraduationCap,
  X,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Employee, 
  DetailedIDP, 
  CareerNode, 
  CareerFitAssessment, 
  Department, 
  JobLevel, 
  EducationLevel, 
  ProficiencyLevel 
} from '../../types';
import { DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/mockData';
import { generateEmployeeIDPPDF } from '../../utils/pdfExport';

// KPI Item structure for Goals tab
interface KPIItem {
  id: string;
  name: string;
  weight: number;
  target: number;
  actual: number;
  unit: string;
}

export const PerformanceDevView: React.FC = () => {
  const isDemo = useAuthStore((s) => s.isDemo());
  const {
    employees,
    detailedIdps,
    careerNodes,
    addCareerNode,
    updateCareerNode,
    deleteCareerNode,
    reorderCareerNodes,
    competencies,
    trainingModules,
    updateIDPTaskStatus,
    createOrUpdateIDP,
    updateEmployee,
    domainSubTabs,
    setDomainSubTab,
    setSelectedEmployee,
    setIsEmployeeModalOpen,
    setActiveTab,
    addToast
  } = useWorkforce();

  const activeSubTab = domainSubTabs.performanceDev || 'idp';
  const setActiveSubTab = (tab: string) => setDomainSubTab('performanceDev', tab);
  const isCareerSubTab = activeSubTab === 'career' || activeSubTab === 'career-ladder';

  const [selectedEmpId, setSelectedEmpId] = useState(employees[1]?.id || employees[0]?.id || '');
  const activeEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Selected IDP Plan for the active employee
  const activeIdp = detailedIdps.find((i) => i.employeeId === selectedEmpId);

  // ---------- IDP Creation Modal State ----------
  const [isCreateIdpOpen, setIsCreateIdpOpen] = useState(false);
  const [newIdpTarget, setNewIdpTarget] = useState('');
  const [newIdpGoal, setNewIdpGoal] = useState('');

  const handleCreateIdp = () => {
    if (!newIdpTarget.trim()) {
      addToast('Validasi', 'Masukkan target posisi terlebih dahulu.', 'error');
      return;
    }
    const newIdp: DetailedIDP = {
      id: `IDP-${activeEmp.id}-${Date.now()}`,
      employeeId: activeEmp.id,
      employeeName: activeEmp.name,
      currentPosition: activeEmp.jobTitle,
      targetPosition: newIdpTarget,
      targetReadiness: 20,
      durationMonths: 12,
      developmentGoal: newIdpGoal || `Akselerasi pengembangan ${activeEmp.name} menuju posisi ${newIdpTarget}.`,
      completionPercentage: 0,
      experience70: [
        { id: `EXP-01-${Date.now()}`, title: 'Penugasan proyek lintas-divisi untuk exposure operasional nyata', category: '70_experience', status: 'Pending', dueDate: 'Bulan 1-4' }
      ],
      exposure20: [
        { id: `EXP-02-${Date.now()}`, title: 'Program mentoring dengan Kepala Divisi / Senior Manager', category: '20_exposure', mentorOrLead: 'Senior Manager / Direktur', status: 'Pending', dueDate: 'Bulan 1-6' }
      ],
      education10: [
        { id: `EDU-01-${Date.now()}`, title: 'Pelatihan kepemimpinan dan sertifikasi kompetensi strategis', category: '10_education', status: 'Pending', dueDate: 'Bulan 2-3' }
      ],
      aiGuidance: `Rencana IDP 12 bulan dibuat untuk akselerasi ${activeEmp.name} menuju posisi ${newIdpTarget}. Fokus utama pada penguatan kompetensi leadership dan exposure lintas divisi.`,
      status: 'Active'
    };
    createOrUpdateIDP(newIdp);
    addToast('✅ IDP Dibuat', `Individual Development Plan untuk ${activeEmp.name} berhasil dibuat.`, 'success');
    setIsCreateIdpOpen(false);
    setNewIdpTarget('');
    setNewIdpGoal('');
  };

  // ---------- KPI Goals State ----------
  const getDefaultKPIs = (emp: Employee): KPIItem[] => [
    { id: 'KPI-01', name: 'Pencapaian Target Produksi / SLA', weight: 30, target: 100, actual: emp.performanceRating === 'High' ? 105 : emp.performanceRating === 'Medium' ? 92 : 78, unit: '%' },
    { id: 'KPI-02', name: 'Kepatuhan Program Pelatihan Wajib', weight: 20, target: 100, actual: emp.performanceRating === 'High' ? 100 : 75, unit: '%' },
    { id: 'KPI-03', name: 'Zero Accident & Kepatuhan HSE', weight: 25, target: 100, actual: emp.performanceRating === 'High' ? 98 : 85, unit: '%' },
    { id: 'KPI-04', name: 'Efisiensi Biaya Operasional', weight: 15, target: 100, actual: emp.performanceRating === 'High' ? 96 : 80, unit: '%' },
    { id: 'KPI-05', name: 'Skor Kepuasan Tim / Subordinat', weight: 10, target: 85, actual: emp.performanceRating === 'High' ? 88 : 75, unit: 'pts' }
  ];
  const [kpiItems, setKpiItems] = useState<KPIItem[]>(() => getDefaultKPIs(activeEmp));
  const [isEditingKPI, setIsEditingKPI] = useState(false);
  const [kpiYear, setKpiYear] = useState(new Date().getFullYear());

  // Recalculate KPIs when employee changes
  const currentKpis = useMemo(() => getDefaultKPIs(activeEmp), [activeEmp.id, activeEmp.performanceRating]);
  const weightedScore = useMemo(() => {
    return Math.round(kpiItems.reduce((acc, kpi) => {
      const achievement = Math.min((kpi.actual / kpi.target) * 100, 130);
      return acc + (achievement * kpi.weight / 100);
    }, 0));
  }, [kpiItems]);

  // =========================================================================
  // CAREER ARCHITECTURE ENGINE STATE & MULTI-TRACK MANAGEMENT
  // =========================================================================
  const careerTracks = useMemo(() => {
    const map = new Map<string, { id: string; name: string; dept?: Department; count: number }>();
    careerNodes.forEach((n) => {
      if (!map.has(n.trackId)) {
        map.set(n.trackId, { id: n.trackId, name: n.trackName, dept: n.department, count: 1 });
      } else {
        map.get(n.trackId)!.count += 1;
      }
    });
    return Array.from(map.values());
  }, [careerNodes]);

  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    return careerTracks[0]?.id || 'training-stream';
  });

  // Current Track's ordered nodes
  const currentTrackNodes = useMemo(() => {
    return careerNodes
      .filter((n) => n.trackId === selectedTrackId)
      .sort((a, b) => a.order - b.order);
  }, [careerNodes, selectedTrackId]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    return currentTrackNodes[0]?.id || '';
  });

  // Keep selectedNodeId valid when track changes
  useEffect(() => {
    if (currentTrackNodes.length > 0) {
      if (!currentTrackNodes.some((n) => n.id === selectedNodeId)) {
        setSelectedNodeId(currentTrackNodes[0].id);
      }
    }
  }, [currentTrackNodes, selectedNodeId]);

  const activeNode = currentTrackNodes.find((n) => n.id === selectedNodeId) || currentTrackNodes[0];

  // ---------- Drag & Drop / Reordering Handlers ----------
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...currentTrackNodes];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    reorderCareerNodes(selectedTrackId, updated);
    setDraggedIndex(null);
  };

  const handleMoveNode = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= currentTrackNodes.length) return;
    const updated = [...currentTrackNodes];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    reorderCareerNodes(selectedTrackId, updated);
  };

  // ---------- Career Node Form State (Add / Edit Position & Qualifications) ----------
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [nodeModalMode, setNodeModalMode] = useState<'create' | 'edit'>('create');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const [formNodeTitle, setFormNodeTitle] = useState('');
  const [formNodeLevel, setFormNodeLevel] = useState<JobLevel>('Staff');
  const [formNodeGrade, setFormNodeGrade] = useState('G5');
  const [formNodeEdu, setFormNodeEdu] = useState<EducationLevel>('S1');
  const [formNodeTenure, setFormNodeTenure] = useState<number>(2);
  const [formNodeSalaryMin, setFormNodeSalaryMin] = useState<number>(10);
  const [formNodeSalaryMax, setFormNodeSalaryMax] = useState<number>(16);
  const [formNodeLeadershipMin, setFormNodeLeadershipMin] = useState<number>(70);
  const [formNodePerfRating, setFormNodePerfRating] = useState<'Medium' | 'High'>('High');
  const [formNodeCompetencies, setFormNodeCompetencies] = useState<{ id: string; name: string; requiredLevel: ProficiencyLevel }[]>([]);
  const [formNodeTrainings, setFormNodeTrainings] = useState<{ moduleId: string; moduleName: string }[]>([]);

  // Modal temporary picker state
  const [modalCompId, setModalCompId] = useState<string>('');
  const [modalCompLevel, setModalCompLevel] = useState<ProficiencyLevel>(3);
  const [modalModuleId, setModalModuleId] = useState<string>('');

  const handleAddCompToNode = () => {
    if (!modalCompId) return;
    const compObj = competencies.find((c) => c.id === modalCompId);
    if (!compObj) return;
    if (formNodeCompetencies.some((c) => c.id === modalCompId)) {
      setFormNodeCompetencies((prev) =>
        prev.map((c) => (c.id === modalCompId ? { ...c, requiredLevel: modalCompLevel } : c))
      );
    } else {
      setFormNodeCompetencies((prev) => [
        ...prev,
        { id: compObj.id, name: compObj.name, requiredLevel: modalCompLevel }
      ]);
    }
  };

  const handleRemoveCompFromNode = (compId: string) => {
    setFormNodeCompetencies((prev) => prev.filter((c) => c.id !== compId));
  };

  const handleAddTrainingToNode = () => {
    if (!modalModuleId) return;
    const modObj = trainingModules.find((m) => m.id === modalModuleId);
    if (!modObj) return;
    if (!formNodeTrainings.some((t) => t.moduleId === modalModuleId)) {
      setFormNodeTrainings((prev) => [
        ...prev,
        { moduleId: modObj.id, moduleName: modObj.name }
      ]);
    }
  };

  const handleRemoveTrainingFromNode = (modId: string) => {
    setFormNodeTrainings((prev) => prev.filter((t) => t.moduleId !== modId));
  };

  // Open Create Node Modal
  const handleOpenCreateNode = () => {
    setNodeModalMode('create');
    setEditingNodeId(null);
    setFormNodeTitle('');
    setFormNodeLevel('Staff');
    setFormNodeGrade(`G${currentTrackNodes.length + 4}`);
    setFormNodeEdu('S1');
    setFormNodeTenure(1);
    setFormNodeSalaryMin(8);
    setFormNodeSalaryMax(14);
    setFormNodeLeadershipMin(60);
    setFormNodePerfRating('Medium');
    setFormNodeCompetencies([]);
    setFormNodeTrainings([]);
    setModalCompId(competencies[0]?.id || '');
    setModalCompLevel(3);
    setModalModuleId(trainingModules[0]?.id || '');
    setIsNodeModalOpen(true);
  };

  // Open Edit Node Modal
  const handleOpenEditNode = (node: CareerNode) => {
    setNodeModalMode('edit');
    setEditingNodeId(node.id);
    setFormNodeTitle(node.title);
    setFormNodeLevel(node.level);
    setFormNodeGrade(node.grade);
    setFormNodeEdu(node.educationReq);
    setFormNodeTenure(node.minTenureYears);
    setFormNodeSalaryMin(node.salaryRangeMillionIDR.min);
    setFormNodeSalaryMax(node.salaryRangeMillionIDR.max);
    setFormNodeLeadershipMin(node.leadershipMinScore);
    setFormNodePerfRating(node.performanceMinRating);
    setFormNodeCompetencies(node.requiredCompetencies || []);
    setFormNodeTrainings(node.requiredTrainings || []);
    setModalCompId(competencies[0]?.id || '');
    setModalCompLevel(3);
    setModalModuleId(trainingModules[0]?.id || '');
    setIsNodeModalOpen(true);
  };

  // Save Node (Create / Update)
  const handleSaveNode = () => {
    if (!formNodeTitle.trim()) {
      addToast('Validasi', 'Nama jabatan wajib diisi.', 'error');
      return;
    }

    const currentTrack = careerTracks.find((t) => t.id === selectedTrackId);
    const trackName = currentTrack?.name || 'Career Progression Track';
    const dept = currentTrack?.dept || 'Operations';

    if (nodeModalMode === 'create') {
      const newNode: CareerNode = {
        id: `CN-${Date.now()}`,
        trackId: selectedTrackId,
        trackName,
        department: dept,
        title: formNodeTitle.trim(),
        level: formNodeLevel,
        grade: formNodeGrade.trim() || 'G5',
        order: currentTrackNodes.length + 1,
        educationReq: formNodeEdu,
        minTenureYears: Number(formNodeTenure) || 1,
        requiredCompetencies: formNodeCompetencies,
        requiredTrainings: formNodeTrainings,
        leadershipMinScore: Number(formNodeLeadershipMin) || 60,
        performanceMinRating: formNodePerfRating,
        salaryRangeMillionIDR: {
          min: Number(formNodeSalaryMin) || 8,
          max: Number(formNodeSalaryMax) || 15
        }
      };
      addCareerNode(newNode);
      setSelectedNodeId(newNode.id);
    } else if (editingNodeId) {
      const existing = careerNodes.find((n) => n.id === editingNodeId);
      if (existing) {
        const updatedNode: CareerNode = {
          ...existing,
          title: formNodeTitle.trim(),
          level: formNodeLevel,
          grade: formNodeGrade.trim() || existing.grade,
          educationReq: formNodeEdu,
          minTenureYears: Number(formNodeTenure) || 1,
          requiredCompetencies: formNodeCompetencies,
          requiredTrainings: formNodeTrainings,
          leadershipMinScore: Number(formNodeLeadershipMin) || 60,
          performanceMinRating: formNodePerfRating,
          salaryRangeMillionIDR: {
            min: Number(formNodeSalaryMin) || 8,
            max: Number(formNodeSalaryMax) || 15
          }
        };
        updateCareerNode(updatedNode);
      }
    }
    setIsNodeModalOpen(false);
  };

  // ---------- Delete Node State & Handler ----------
  const [isDeleteNodeModalOpen, setIsDeleteNodeModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<CareerNode | null>(null);

  const handleConfirmDeleteNode = () => {
    if (!nodeToDelete) return;
    deleteCareerNode(nodeToDelete.id);
    setIsDeleteNodeModalOpen(false);
    setNodeToDelete(null);
  };

  // ---------- Add New Track Modal State & Handler ----------
  const [isNewTrackModalOpen, setIsNewTrackModalOpen] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDept, setNewTrackDept] = useState<Department>('Operations');

  const handleCreateNewTrack = () => {
    if (!newTrackName.trim()) {
      addToast('Validasi', 'Nama jalur / track karier wajib diisi.', 'error');
      return;
    }
    const newTrackId = `track-${Date.now()}`;
    const initialNode: CareerNode = {
      id: `CN-${Date.now()}`,
      trackId: newTrackId,
      trackName: newTrackName.trim(),
      department: newTrackDept,
      title: `Junior ${newTrackName.replace('Track', '').trim()} Officer`,
      level: 'Staff',
      grade: 'G5',
      order: 1,
      educationReq: 'S1',
      minTenureYears: 1,
      requiredCompetencies: [],
      requiredTrainings: [],
      leadershipMinScore: 60,
      performanceMinRating: 'Medium',
      salaryRangeMillionIDR: { min: 8, max: 13 }
    };
    addCareerNode(initialNode);
    setSelectedTrackId(newTrackId);
    setSelectedNodeId(initialNode.id);
    setIsNewTrackModalOpen(false);
    setNewTrackName('');
    addToast('Jalur Karier Baru Dibuat', `Track "${newTrackName}" berhasil ditambahkan.`, 'success');
  };

  // Compute 6-factor Career Fit Assessment dynamically for activeEmp against activeNode
  const nodeAssessment: CareerFitAssessment = useMemo(() => {
    if (!activeEmp || !activeNode) {
      return {
        nodeId: '',
        nodeTitle: '',
        educationMatch: false,
        experienceMatch: false,
        competencyScore: 0,
        trainingScore: 0,
        leadershipScore: 0,
        performanceScore: 0,
        overallFitScore: 0,
        aiDiagnosis: '',
        missingRequirements: []
      };
    }

    const educationMatch = true;
    const experienceMatch = activeEmp.tenureYears >= activeNode.minTenureYears;
    const leadershipScore = activeNode.leadershipMinScore <= 70 ? 85 : 72;
    const competencyScore = activeNode.requiredCompetencies.length > 0 ? 88 : 95;
    const trainingScore = activeNode.requiredTrainings.length > 0 ? 90 : 100;
    const performanceScore = activeEmp.performanceRating === 'High' ? 92 : 78;

    const overallFitScore = Math.round(
      (competencyScore * 0.3) +
      (trainingScore * 0.2) +
      (leadershipScore * 0.25) +
      (performanceScore * 0.25)
    );

    const missingReqs: string[] = [];
    if (leadershipScore < activeNode.leadershipMinScore) {
      missingReqs.push(`Skor Leadership (${leadershipScore}%) di bawah standar minimal (${activeNode.leadershipMinScore}%)`);
    }
    if (activeNode.requiredTrainings && activeNode.requiredTrainings.length > 0) {
      missingReqs.push(`Pelatihan Wajib: ${activeNode.requiredTrainings.map(t => t.moduleName).join(', ')}`);
    }

    return {
      nodeId: activeNode.id,
      nodeTitle: activeNode.title,
      educationMatch,
      experienceMatch,
      competencyScore,
      trainingScore,
      leadershipScore,
      performanceScore,
      overallFitScore,
      aiDiagnosis: `${activeEmp.name} memiliki kecocokan profil ${overallFitScore}% terhadap posisi target ${activeNode.title}. Disarankan penguatan pada modul kepemimpinan dan penyelesaian kualifikasi standar grade ${activeNode.grade}.`,
      missingRequirements: missingReqs
    };
  }, [activeEmp, activeNode]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 font-sans">
      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('idp')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'idp'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Individual Development Plan (IDP 70:20:10)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('career')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isCareerSubTab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Career Architecture Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('goals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'goals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Kinerja &amp; Appraisal</span>
          </button>
        </div>

        {/* Global Employee Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline font-medium">Evaluasi Karyawan:</span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            aria-label="Pilih Karyawan untuk Evaluasi Karier"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 cursor-pointer"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.jobTitle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* ========================================================================= */}
        {/* SUBTAB 1: IDP ENGINE (70:20:10) */}
        {/* ========================================================================= */}
        {activeSubTab === 'idp' && activeEmp && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

            {/* IDP Creation Modal */}
            {isCreateIdpOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Buat IDP Baru — {activeEmp.name}</h3>
                    </div>
                    <button onClick={() => setIsCreateIdpOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Target Posisi (Tujuan Karier)</label>
                      <input
                        type="text"
                        value={newIdpTarget}
                        onChange={(e) => setNewIdpTarget(e.target.value)}
                        placeholder="Contoh: Mining Superintendent, HR Manager..."
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Tujuan Pengembangan (opsional)</label>
                      <textarea
                        value={newIdpGoal}
                        onChange={(e) => setNewIdpGoal(e.target.value)}
                        placeholder="Deskripsikan tujuan pengembangan 12 bulan ke depan..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800">
                      IDP akan dibuat dengan template 70:20:10 (Experience / Exposure / Education) untuk durasi <strong>12 bulan</strong>.
                    </div>
                  </div>
                  <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
                    <button onClick={() => setIsCreateIdpOpen(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">Batal</button>
                    <button onClick={handleCreateIdp} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      Buat IDP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No IDP Banner */}
            {!activeIdp && (
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-blue-950">Belum Ada IDP untuk {activeEmp.name}</h3>
                  <p className="text-xs text-blue-800 mt-1">Karyawan ini belum memiliki Individual Development Plan. Buat sekarang untuk mulai program akselerasi 70:20:10.</p>
                </div>
                <button
                  onClick={() => setIsCreateIdpOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat IDP Sekarang
                </button>
              </div>
            )}

            {/* Header Hero Card: Connects Talent + Career + Competency Gap + Training */}
            {activeIdp && (<>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="flex items-center gap-3">
                  <img src={activeEmp.avatarUrl} alt={activeEmp.name} className="w-11 h-11 rounded-lg object-cover border border-slate-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Employee IDP Profile</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 font-medium">12-Month Acceleration Cycle</span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">{activeEmp.name}</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Posisi Saat Ini: <strong className="text-slate-700 font-semibold">{activeIdp?.currentPosition || activeEmp.jobTitle}</strong>
                    </p>
                  </div>
                </div>

                {/* Target Position & Readiness Status & PDF Export */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Target Posisi</span>
                      <span className="text-xs font-bold text-slate-900">{activeIdp?.targetPosition || 'Training Superintendent'}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Kesiapan</span>
                      <span className="text-xs font-bold font-mono text-emerald-600">{activeIdp?.targetReadiness || 76}%</span>
                    </div>
                  </div>

                  {activeIdp && (
                    <button
                      onClick={() => generateEmployeeIDPPDF(activeEmp, activeIdp)}
                      title="Cetak Dokumen Resmi IDP 70:20:10 (PDF)"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cetak IDP (PDF)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Development Goal Banner */}
              <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-950 font-medium">
                    <strong>Development Goal:</strong> {activeIdp?.developmentGoal || 'Ready for Training Superintendent'}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shrink-0 self-start sm:self-auto">
                  {activeIdp?.durationMonths || 12} Month Plan
                </span>
              </div>

              {/* Progress Bar: IDP Completion */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">IDP Completion Progress:</span>
                  <span className="font-bold text-slate-900">{activeIdp?.completionPercentage || 80}% Selesai</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${activeIdp?.completionPercentage || 80}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 70:20:10 Framework Detailed Action Checklists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 70% Experience */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      70%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Experience (On-the-Job)</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Penugasan Kerja & Proyek Khusus</h3>
                  
                  <div className="space-y-2.5">
                    {(activeIdp?.experience70 || []).map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            • {task.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[10px]">
                          <span className="text-slate-400">Target: {task.dueDate}</span>
                          <button
                            onClick={() => updateIDPTaskStatus(activeIdp.id, 'experience70', task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              task.status === 'Completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 20% Exposure */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      20%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Exposure (Mentoring)</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Coaching & Observasi Pemimpin</h3>
                  
                  <div className="space-y-2.5">
                    {(activeIdp?.exposure20 || []).map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            • {task.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[10px]">
                          <span className="text-slate-400">{task.mentorOrLead ? `Mentor: ${task.mentorOrLead}` : `Target: ${task.dueDate}`}</span>
                          <button
                            onClick={() => updateIDPTaskStatus(activeIdp.id, 'exposure20', task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              task.status === 'Completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10% Education */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      10%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Education (Formal)</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Sertifikasi & Kursus Terstruktur</h3>
                  
                  <div className="space-y-2.5">
                    {(activeIdp?.education10 || []).map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            • {task.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[10px]">
                          <span className="text-slate-400">Target: {task.dueDate}</span>
                          <button
                            onClick={() => updateIDPTaskStatus(activeIdp.id, 'education10', task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                              task.status === 'Completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Strategic Guidance Card */}
            {activeIdp?.aiGuidance && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3.5 shadow-xs">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-purple-950">Rekomendasi Diagnosis AI untuk Akselerasi IDP:</h4>
                  <p className="text-xs text-purple-900 leading-relaxed font-sans">{activeIdp.aiGuidance}</p>
                </div>
              </div>
            )}
            </>
          )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: CAREER ARCHITECTURE ENGINE (STANDALONE ENGINE) */}
        {/* ========================================================================= */}
        {isCareerSubTab && (
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
            {isDemo && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Mode Demo (Read-Only):</strong> Modul Career Architecture &amp; Progression Ladder dalam mode pratinjau. Penambahan posisi dan pengurutan tangga karier dikunci pada versi demo.</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase shrink-0">
                  READ-ONLY DEMO
                </span>
              </div>
            )}
            {/* Header Control & Track Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Career Architecture &amp; Progression Ladder Engine
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Peta tangga karier berbasis kualifikasi objektif per departemen. Atur urutan tingkatan dengan drag &amp; drop atau tombol panah.
                  </p>
                </div>
              </div>

              {/* Department & Track Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 h-9">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jalur / Track:</span>
                  <select
                    value={selectedTrackId}
                    onChange={(e) => {
                      setSelectedTrackId(e.target.value);
                      const targetTrackNodes = careerNodes.filter(n => n.trackId === e.target.value);
                      if (targetTrackNodes.length > 0) {
                        setSelectedNodeId(targetTrackNodes[0].id);
                      }
                    }}
                    aria-label="Pilih Jalur Karier Departemen"
                    className="text-xs font-semibold bg-transparent text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    {careerTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.dept || 'Umum'}) • {t.count} Tingkatan
                      </option>
                    ))}
                  </select>
                </div>

                {!isDemo && (
                  <button
                    onClick={() => setIsNewTrackModalOpen(true)}
                    className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition active:scale-98 cursor-pointer"
                    title="Tambah Jalur Karier / Track Baru"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">+ Track Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Split Screen: Left Ladder Hierarchy (Drag & Drop), Right 6-Factor Node Deep Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 5 Cols: Interactive Career Ladder with Drag & Drop */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Jenjang Tangga Karier
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 font-mono">
                      {currentTrackNodes.length} Tingkatan
                    </span>
                  </div>
                  {!isDemo && (
                    <button
                      onClick={handleOpenCreateNode}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer active:scale-98 shadow-2xs shrink-0 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tambah Posisi</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 relative pl-3 before:absolute before:left-1 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {currentTrackNodes.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                      Belum ada tingkatan posisi di track ini. Klik "Tambah Posisi" untuk memulai.
                    </div>
                  ) : (
                    currentTrackNodes.map((node, index) => {
                      const isSelected = node.id === selectedNodeId;
                      const isCurrent = activeEmp && (
                        node.title.toLowerCase() === activeEmp.jobTitle.toLowerCase() ||
                        activeEmp.jobTitle.toLowerCase().includes(node.title.toLowerCase())
                      );

                      return (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                            isSelected
                              ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                          } ${draggedIndex === index ? 'opacity-40 border-dashed border-blue-400 scale-98' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Drag Handle & Step Circle */}
                            <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
                              <span
                                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-0.5 transition"
                                title="Tahan &amp; geser untuk atur urutan"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : isCurrent
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {node.order}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Top Badges & Actions */}
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                                    {node.grade}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {node.level}
                                  </span>
                                </div>

                                {/* Right Tag or Actions */}
                                <div className="flex items-center gap-1">
                                  {isCurrent && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5" />
                                      Posisi Saat Ini
                                    </span>
                                  )}
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                    <button
                                      disabled={index === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveNode(index, index - 1);
                                      }}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                      title="Pindah ke Atas"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      disabled={index === currentTrackNodes.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveNode(index, index + 1);
                                      }}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                                      title="Pindah ke Bawah"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditNode(node);
                                      }}
                                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                      title="Edit Posisi &amp; Kualifikasi"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    {currentTrackNodes.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setNodeToDelete(node);
                                          setIsDeleteNodeModalOpen(true);
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                        title="Hapus Posisi"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight truncate">{node.title}</h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>Min {node.minTenureYears} Thn</span>
                                <span>•</span>
                                <span>Rp {node.salaryRangeMillionIDR.min} - {node.salaryRangeMillionIDR.max} Jt/bln</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right 7 Cols: Deep 6-Factor Node Requirements & AI Fit Assessment */}
              <div className="lg:col-span-7 space-y-4">
                {activeNode ? (
                  <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
                    {/* Node Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            TARGET REQUIREMENT ({activeNode.grade})
                          </span>
                          <button
                            onClick={() => handleOpenEditNode(activeNode)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-2.5 py-0.5 rounded-md transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-blue-600" />
                            <span>Edit Kualifikasi</span>
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1.5">{activeNode.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span>Gaji: <strong className="text-slate-700">Rp {activeNode.salaryRangeMillionIDR.min} - {activeNode.salaryRangeMillionIDR.max} Jt/bln</strong></span>
                          <span>•</span>
                          <span>Level: <strong className="text-slate-700">{activeNode.level}</strong></span>
                          <span>•</span>
                          <span>Evaluasi: <strong className="text-slate-700">{activeEmp.name}</strong></span>
                        </div>
                      </div>

                      {/* Overall Fit Score Box */}
                      <div className="text-center px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0 min-w-30">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">OVERALL JOB FIT</span>
                        <span className="text-2xl font-black text-emerald-700 leading-tight block">{nodeAssessment.overallFitScore}%</span>
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          {nodeAssessment.overallFitScore >= 80 ? 'Sangat Sesuai' : nodeAssessment.overallFitScore >= 65 ? 'Cukup Sesuai' : 'Perlu Kesiapan'}
                        </span>
                      </div>
                    </div>

                    {/* 6-Factor Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Pendidikan</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{activeNode.educationReq} (Min Req)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Aktual: {activeEmp.education}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Pengalaman</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Min {activeNode.minTenureYears} Thn ({activeEmp.tenureYears} Thn riil)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          {activeEmp.tenureYears >= activeNode.minTenureYears ? '✓ Memenuhi Syarat' : `Kurang ${activeNode.minTenureYears - activeEmp.tenureYears} Thn`}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Kompetensi</span>
                        <div className="font-black text-blue-700 text-base">{nodeAssessment.competencyScore}%</div>
                        <span className="text-[10px] text-slate-500 block">{activeNode.requiredCompetencies?.length || 0} Kompetensi Wajib</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Pelatihan (Training)</span>
                        <div className="font-black text-emerald-700 text-base">{nodeAssessment.trainingScore}%</div>
                        <span className="text-[10px] text-slate-500 block">{activeNode.requiredTrainings?.length || 0} Modul Pelatihan</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Leadership Min Score</span>
                        <div className="font-black text-amber-700 text-base">{activeNode.leadershipMinScore}%</div>
                        <span className="text-[10px] text-slate-500 block">Skor Karyawan: {nodeAssessment.leadershipScore}%</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Rating Kinerja Min</span>
                        <div className="font-black text-slate-900 text-base">{activeNode.performanceMinRating}</div>
                        <span className="text-[10px] text-slate-500 block">Aktual: {activeEmp.performanceRating}</span>
                      </div>
                    </div>

                    {/* Detailed Requirements (Competencies & Mandatory Trainings) */}
                    <div className="space-y-3 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Kompetensi Wajib ({activeNode.requiredCompetencies?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => handleOpenEditNode(activeNode)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          + Kelola
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(!activeNode.requiredCompetencies || activeNode.requiredCompetencies.length === 0) ? (
                          <span className="text-xs text-slate-400 italic">Belum ada kompetensi khusus yang disyaratkan.</span>
                        ) : (
                          activeNode.requiredCompetencies.map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/70 flex items-center gap-1.5"
                            >
                              <span>{comp.name}</span>
                              <strong className="text-blue-900 bg-blue-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                                Lv {comp.requiredLevel}
                              </strong>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          <span>Pelatihan Wajib / Mandatory ({activeNode.requiredTrainings?.length || 0})</span>
                        </span>
                        <button
                          onClick={() => handleOpenEditNode(activeNode)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          + Kelola
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(!activeNode.requiredTrainings || activeNode.requiredTrainings.length === 0) ? (
                          <span className="text-xs text-slate-400 italic">Belum ada modul pelatihan mandatori.</span>
                        ) : (
                          activeNode.requiredTrainings.map((tr, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{tr.moduleName}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* AI Diagnosis Box */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>AI Strategic Career Diagnosis:</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{nodeAssessment.aiDiagnosis}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setActiveSubTab('idp');
                          addToast('IDP Di-generate', `Rencana pengembangan IDP untuk posisi ${activeNode.title} siap dijalankan.`, 'success');
                        }}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Buat IDP untuk Target Posisi Ini</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('learning-training');
                        }}
                        className="py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition cursor-pointer"
                      >
                        Buka Katalog Pelatihan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                    Pilih salah satu tingkatan node pada tangga karier untuk melihat analisis kualifikasi.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: GOALS & PERFORMANCE APPRAISAL — INTERACTIVE KPI FORM */}
        {/* ========================================================================= */}
        {activeSubTab === 'goals' && activeEmp && (
          <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Target KPI &amp; Appraisal Tahunan {kpiYear}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeEmp.name} — {activeEmp.jobTitle} | Evaluasi kinerja &amp; potensi berbasis KPI berbobot.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={kpiYear}
                  onChange={(e) => setKpiYear(Number(e.target.value))}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                >
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button
                  onClick={() => setIsEditingKPI(!isEditingKPI)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isEditingKPI ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isEditingKPI ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                  {isEditingKPI ? 'Simpan KPI' : 'Edit KPI'}
                </button>
              </div>
            </div>

            {/* Overall Score Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skor KPI Tertimbang</span>
                <div className={`text-3xl font-black ${
                  weightedScore >= 100 ? 'text-emerald-600' : weightedScore >= 85 ? 'text-blue-600' : 'text-amber-600'
                }`}>{weightedScore}%</div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  weightedScore >= 100 ? 'bg-emerald-100 text-emerald-700' : weightedScore >= 85 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {weightedScore >= 100 ? 'Exceeds Target' : weightedScore >= 85 ? 'Meets Target' : 'Below Target'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating Kinerja</span>
                <div className={`text-2xl font-black ${
                  activeEmp.performanceRating === 'High' ? 'text-emerald-600' : activeEmp.performanceRating === 'Medium' ? 'text-amber-600' : 'text-red-600'
                }`}>{activeEmp.performanceRating}</div>
                <span className="text-[11px] text-slate-500">Performance Rating</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating Potensi</span>
                <div className={`text-2xl font-black ${
                  activeEmp.potentialRating === 'High' ? 'text-blue-600' : activeEmp.potentialRating === 'Medium' ? 'text-amber-600' : 'text-red-600'
                }`}>{activeEmp.potentialRating}</div>
                <span className="text-[11px] text-slate-500">Potential Rating</span>
              </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Detail KPI per Indikator</span>
                {isEditingKPI && (
                  <button
                    onClick={() => {
                      const newId = `KPI-${Date.now()}`;
                      setKpiItems(prev => [...prev, { id: newId, name: 'KPI Baru', weight: 5, target: 100, actual: 0, unit: '%' }]);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah KPI
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Indikator KPI</th>
                      <th className="text-center px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Bobot</th>
                      <th className="text-center px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Target</th>
                      <th className="text-center px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Aktual</th>
                      <th className="text-center px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Capaian</th>
                      {isEditingKPI && <th className="px-3 py-2.5"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kpiItems.map((kpi) => {
                      const achievement = Math.round((kpi.actual / kpi.target) * 100);
                      return (
                        <tr key={kpi.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            {isEditingKPI ? (
                              <input
                                value={kpi.name}
                                onChange={(e) => setKpiItems(prev => prev.map(k => k.id === kpi.id ? { ...k, name: e.target.value } : k))}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="font-semibold text-slate-800">{kpi.name}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {isEditingKPI ? (
                              <input
                                type="number" min={1} max={100}
                                value={kpi.weight}
                                onChange={(e) => setKpiItems(prev => prev.map(k => k.id === kpi.id ? { ...k, weight: Number(e.target.value) } : k))}
                                className="w-14 text-center px-1 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="font-bold text-slate-700">{kpi.weight}%</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {isEditingKPI ? (
                              <input
                                type="number" min={1}
                                value={kpi.target}
                                onChange={(e) => setKpiItems(prev => prev.map(k => k.id === kpi.id ? { ...k, target: Number(e.target.value) } : k))}
                                className="w-16 text-center px-1 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="text-slate-600 font-mono">{kpi.target}{kpi.unit}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {isEditingKPI ? (
                              <input
                                type="number" min={0}
                                value={kpi.actual}
                                onChange={(e) => setKpiItems(prev => prev.map(k => k.id === kpi.id ? { ...k, actual: Number(e.target.value) } : k))}
                                className="w-16 text-center px-1 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className={`font-bold font-mono ${
                                kpi.actual >= kpi.target ? 'text-emerald-600' : kpi.actual >= kpi.target * 0.85 ? 'text-amber-600' : 'text-red-600'
                              }`}>{kpi.actual}{kpi.unit}</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-slate-200 min-w-12">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    achievement >= 100 ? 'bg-emerald-500' : achievement >= 85 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(achievement, 100)}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-bold w-8 text-right ${
                                achievement >= 100 ? 'text-emerald-600' : achievement >= 85 ? 'text-amber-600' : 'text-red-600'
                              }`}>{achievement}%</span>
                            </div>
                          </td>
                          {isEditingKPI && (
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setKpiItems(prev => prev.filter(k => k.id !== kpi.id))}
                                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white">
                      <td className="px-4 py-3 font-bold text-xs">TOTAL / SKOR AKHIR</td>
                      <td className="px-3 py-3 text-center font-bold text-xs">{kpiItems.reduce((s, k) => s + k.weight, 0)}%</td>
                      <td className="px-3 py-3 text-center text-slate-400 text-xs">—</td>
                      <td className="px-3 py-3 text-center text-slate-400 text-xs">—</td>
                      <td className="px-3 py-3">
                        <span className={`font-black text-sm ${
                          weightedScore >= 100 ? 'text-emerald-400' : weightedScore >= 85 ? 'text-blue-400' : 'text-amber-400'
                        }`}>{weightedScore}%</span>
                      </td>
                      {isEditingKPI && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Save notice */}
            {isEditingKPI && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Mode edit aktif. Klik <strong>"Simpan KPI"</strong> di pojok kanan atas untuk menyimpan perubahan nilai aktual dan target.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT POSISI TANGGA KARIER & KUALIFIKASI DETAIL */}
      {/* ========================================================================= */}
      {isNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  {nodeModalMode === 'create' ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {nodeModalMode === 'create' ? 'Tambah Posisi Baru ke Tangga Karier' : 'Edit Posisi & Kualifikasi Standar'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track: <strong>{careerTracks.find(t => t.id === selectedTrackId)?.name || 'General Track'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNodeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
              {/* Row 1: Nama Jabatan & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Jabatan / Target Posisi *</label>
                  <input
                    type="text"
                    value={formNodeTitle}
                    onChange={(e) => setFormNodeTitle(e.target.value)}
                    placeholder="Contoh: Senior Field Safety Inspector"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Level Jabatan</label>
                  <select
                    value={formNodeLevel}
                    onChange={(e) => setFormNodeLevel(e.target.value as JobLevel)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                  >
                    {JOB_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Grade, Min Education & Min Tenure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Grade (G4 - G10)</label>
                  <input
                    type="text"
                    value={formNodeGrade}
                    onChange={(e) => setFormNodeGrade(e.target.value)}
                    placeholder="G7"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pendidikan Minimal</label>
                  <select
                    value={formNodeEdu}
                    onChange={(e) => setFormNodeEdu(e.target.value as EducationLevel)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                  >
                    {EDUCATION_LEVELS.map((edu) => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Syarat Masa Kerja (Thn)</label>
                  <input
                    type="number"
                    min={0}
                    value={formNodeTenure}
                    onChange={(e) => setFormNodeTenure(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Row 3: Rentang Gaji Pokok & Leadership & Performance Target */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gaji Min (Jt/bln)</label>
                  <input
                    type="number"
                    min={1}
                    value={formNodeSalaryMin}
                    onChange={(e) => setFormNodeSalaryMin(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gaji Max (Jt/bln)</label>
                  <input
                    type="number"
                    min={1}
                    value={formNodeSalaryMax}
                    onChange={(e) => setFormNodeSalaryMax(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Min Leadership (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formNodeLeadershipMin}
                    onChange={(e) => setFormNodeLeadershipMin(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Min Rating Kinerja</label>
                  <select
                    value={formNodePerfRating}
                    onChange={(e) => setFormNodePerfRating(e.target.value as 'Medium' | 'High')}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Kelola Kompetensi Wajib */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Syarat Kompetensi Wajib ({formNodeCompetencies.length})</span>
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={modalCompId}
                    onChange={(e) => setModalCompId(e.target.value)}
                    className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih Kompetensi...</option>
                    {competencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>

                  <select
                    value={modalCompLevel}
                    onChange={(e) => setModalCompLevel(Number(e.target.value) as ProficiencyLevel)}
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddCompToNode}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shrink-0"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formNodeCompetencies.map((comp) => (
                    <span
                      key={comp.id}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5"
                    >
                      <span>{comp.name}</span>
                      <strong className="text-blue-900 bg-blue-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        Lv {comp.requiredLevel}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompFromNode(comp.id)}
                        className="text-blue-400 hover:text-red-600 p-0.5 rounded transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formNodeCompetencies.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">Belum ada kompetensi yang ditambahkan.</span>
                  )}
                </div>
              </div>

              {/* Section 5: Kelola Pelatihan Mandatori */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Pelatihan Mandatori Wajib ({formNodeTrainings.length})</span>
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={modalModuleId}
                    onChange={(e) => setModalModuleId(e.target.value)}
                    className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Modul Pelatihan...</option>
                    {trainingModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name} ({m.category})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddTrainingToNode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shrink-0"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formNodeTrainings.map((tr) => (
                    <span
                      key={tr.moduleId}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{tr.moduleName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrainingFromNode(tr.moduleId)}
                        className="text-emerald-500 hover:text-red-600 p-0.5 rounded transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formNodeTrainings.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">Belum ada modul pelatihan mandatori.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsNodeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNode}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition active:scale-98 cursor-pointer"
              >
                {nodeModalMode === 'create' ? 'Simpan Posisi Baru' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI HAPUS POSISI */}
      {/* ========================================================================= */}
      {isDeleteNodeModalOpen && nodeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Tingkatan Posisi?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus node dari tangga karier.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              Posisi: <strong>{nodeToDelete.title}</strong> ({nodeToDelete.grade} • {nodeToDelete.level})
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteNodeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteNode}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH JALUR / TRACK KARIER BARU */}
      {/* ========================================================================= */}
      {isNewTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Buat Jalur / Track Karier Baru</h3>
              </div>
              <button
                onClick={() => setIsNewTrackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Jalur Karier (Track Name) *</label>
                <input
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="Contoh: HSE & Sustainability Leadership Track"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Departemen Terkait</label>
                <select
                  value={newTrackDept}
                  onChange={(e) => setNewTrackDept(e.target.value as Department)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsNewTrackModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateNewTrack}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Buat Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
