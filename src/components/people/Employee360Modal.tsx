import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  X, 
  User, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ChevronRight, 
  Mail, 
  Target,
  Sparkles,
  TrendingUp,
  BookOpen,
  History,
  Compass,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Save,
  UserCheck,
  Download,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { generateEmployee360ProfilePDF } from '../../utils/pdfExport';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { NINE_BOX_DEFINITIONS, DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS, computeNineBoxGrid } from '../../data/mockData';
import { Employee, Department, JobLevel, EducationLevel, EmploymentType } from '../../types';
import { Badge } from '../common/ui';

export const Employee360Modal: React.FC = () => {
  const isDemo = useAuthStore((s) => s.isDemo());
  const { 
    selectedEmployee, 
    setSelectedEmployee,
    employees,
    isEmployeeModalOpen, 
    setIsEmployeeModalOpen,
    trainingModules,
    workforceMovements,
    updateEmployee,
    getRuleFor,
    checkQualification,
    addToast
  } = useWorkforce();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'trainings' | 'career' | 'movement' | 'idp'>('profile');

  // Edit Mode State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form Fields State
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState<Department>('Operations');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formLevel, setFormLevel] = useState<JobLevel>('Operator');
  const [formGrade, setFormGrade] = useState('G3');
  const [formEducation, setFormEducation] = useState<EducationLevel>('SMA');
  const [formTenure, setFormTenure] = useState<number>(4);
  const [formEmploymentType, setFormEmploymentType] = useState<EmploymentType>('PKWTT (Permanent)');
  const [formManagerId, setFormManagerId] = useState<string>('');
  const [formPerfRating, setFormPerfRating] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formPotRating, setFormPotRating] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formIsKeyTalent, setFormIsKeyTalent] = useState<boolean>(false);
  const [formIsSuccessorReady, setFormIsSuccessorReady] = useState<boolean>(false);
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  if (!isEmployeeModalOpen || !selectedEmployee) return null;

  const rule = getRuleFor(selectedEmployee.department, selectedEmployee.level);
  const qual = checkQualification(selectedEmployee);
  const nineBoxInfo = NINE_BOX_DEFINITIONS[selectedEmployee.nineBoxGrid || 5] || NINE_BOX_DEFINITIONS[5];

  // Employee Specific Movement History
  const empMovements = workforceMovements.filter(
    (m) => m.employeeId === selectedEmployee.id || m.employeeName === selectedEmployee.name
  );

  const radar = selectedEmployee.radar || {
    performance: selectedEmployee.performanceRating === 'High' ? 88 : selectedEmployee.performanceRating === 'Medium' ? 75 : 60,
    leadership: selectedEmployee.potentialRating === 'High' ? 85 : selectedEmployee.potentialRating === 'Medium' ? 70 : 55,
    technical: 80,
    adaptability: 75,
    cultureFit: 85
  };

  // Radar Data
  const radarData = [
    { subject: 'Kinerja', score: radar.performance ?? 75, fullMark: 100 },
    { subject: 'Kepemimpinan', score: radar.leadership ?? 70, fullMark: 100 },
    { subject: 'Teknis', score: radar.technical ?? 75, fullMark: 100 },
    { subject: 'Adaptabilitas', score: radar.adaptability ?? 70, fullMark: 100 },
    { subject: 'Budaya Kerja', score: radar.cultureFit ?? 80, fullMark: 100 },
  ];

  const overallReadinessScore = Math.round(
    ((radar.performance ?? 75) * 0.3) +
    ((radar.leadership ?? 70) * 0.25) +
    ((radar.technical ?? 75) * 0.25) +
    ((radar.adaptability ?? 70) * 0.1) +
    ((radar.cultureFit ?? 80) * 0.1)
  );

  // Initialize edit form with current employee data
  const handleOpenEditModal = () => {
    setFormName(selectedEmployee.name);
    setFormNip(selectedEmployee.nip);
    setFormEmail(selectedEmployee.email || `${selectedEmployee.nip.toLowerCase()}@alkara.co.id`);
    setFormDepartment(selectedEmployee.department);
    setFormJobTitle(selectedEmployee.jobTitle);
    setFormLevel(selectedEmployee.level);
    setFormGrade(selectedEmployee.grade);
    setFormEducation(selectedEmployee.education);
    setFormTenure(selectedEmployee.tenureYears);
    setFormEmploymentType(selectedEmployee.employmentType);
    setFormManagerId(selectedEmployee.managerId || '');
    setFormPerfRating(selectedEmployee.performanceRating);
    setFormPotRating(selectedEmployee.potentialRating);
    setFormIsKeyTalent(!!selectedEmployee.isKeyTalent);
    setFormIsSuccessorReady(!!selectedEmployee.isSuccessorReady);
    setFormAvatarUrl(selectedEmployee.avatarUrl);
    setFormNotes(selectedEmployee.notes || '');
    setIsEditModalOpen(true);
  };

  // Save changes handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNip.trim()) {
      addToast('Validasi Gagal', 'Nama dan NIP karyawan wajib diisi.', 'error');
      return;
    }

    const calculatedGrid = computeNineBoxGrid(formPerfRating, formPotRating);
    const selectedMgr = employees.find((m) => m.id === formManagerId);

    const updatedEmp: Employee = {
      ...selectedEmployee,
      name: formName.trim(),
      nip: formNip.trim(),
      email: formEmail.trim(),
      department: formDepartment,
      jobTitle: formJobTitle.trim(),
      level: formLevel,
      grade: formGrade.trim(),
      education: formEducation,
      tenureYears: Number(formTenure),
      employmentType: formEmploymentType,
      managerId: selectedMgr ? selectedMgr.id : undefined,
      managerName: selectedMgr ? selectedMgr.name : undefined,
      performanceRating: formPerfRating,
      potentialRating: formPotRating,
      nineBoxGrid: calculatedGrid,
      isKeyTalent: formIsKeyTalent,
      isSuccessorReady: formIsSuccessorReady,
      avatarUrl: formAvatarUrl.trim() || selectedEmployee.avatarUrl,
      notes: formNotes.trim()
    };

    updateEmployee(updatedEmp);
    setSelectedEmployee(updatedEmp);
    setIsEditModalOpen(false);
    addToast('⚡ [Profil Diperbarui]', `Data karyawan ${formName} berhasil disimpan.`, 'success');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in my-auto">
          
          {/* Profile Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0 space-y-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-center sm:items-start gap-4 min-w-0 flex-1">
                <img
                  src={selectedEmployee.avatarUrl}
                  alt={selectedEmployee.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm bg-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedEmployee.name}</h2>
                    <Badge tone="neutral">{selectedEmployee.employmentType.split(' ')[0]}</Badge>
                    {selectedEmployee.isKeyTalent && (
                      <Badge tone="warning">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Key Talent</span>
                      </Badge>
                    )}
                    {selectedEmployee.isSuccessorReady && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready Successor</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium truncate">
                    {selectedEmployee.jobTitle} • <span className="text-slate-500 font-semibold">{selectedEmployee.department}</span>
                  </p>
                </div>
              </div>

              {/* Header Actions: Print PDF, Edit & Close */}
              <div className="flex items-center gap-2 shrink-0 self-start">
                <button
                  onClick={() => generateEmployee360ProfilePDF(selectedEmployee, rule, qual, nineBoxInfo, trainingModules)}
                  title="Cetak Dossier Profil 360 & Grafik Radar (PDF)"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Cetak Dossier</span>
                </button>

                {isDemo ? (
                  <span
                    title="Akun demo: mode hanya lihat (read-only)"
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Mode Demo (Read-Only)</span>
                  </span>
                ) : (
                  <button
                    onClick={handleOpenEditModal}
                    title="Edit Data & Profil Karyawan Ini"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Edit Profil</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Structured Metadata Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">NIP</span>
                <span className="font-bold text-slate-800 font-mono text-xs">{selectedEmployee.nip}</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">Level / Grade</span>
                <span className="font-bold text-slate-800 text-xs">{selectedEmployee.level} ({selectedEmployee.grade})</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Atasan Langsung</span>
                <span className="font-bold text-blue-700 text-xs truncate block" title={selectedEmployee.managerName || 'Top Level (Direksi)'}>
                  {selectedEmployee.managerName || 'Top Level (Direksi)'}
                </span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">Masa Kerja</span>
                <span className="font-bold text-slate-800 text-xs">{selectedEmployee.tenureYears} Tahun</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">Pendidikan</span>
                <span className="font-bold text-slate-800 text-xs">{selectedEmployee.education}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-6 border-b border-slate-100 bg-white flex items-center gap-6 text-xs font-medium shrink-0 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`py-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kompetensi & Radar 360
            </button>
            <button
              onClick={() => setActiveSubTab('trainings')}
              className={`py-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'trainings'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Riwayat Pelatihan TNA
            </button>
            <button
              onClick={() => setActiveSubTab('movement')}
              className={`py-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'movement'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Riwayat Pergerakan ({empMovements.length})
            </button>
            <button
              onClick={() => setActiveSubTab('idp')}
              className={`py-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'idp'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              IDP (70:20:10)
            </button>
            <button
              onClick={() => setActiveSubTab('career')}
              className={`py-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'career'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rekomendasi Jalur Karir
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/40">
            {/* TAB 1: RADAR & 9-BOX */}
            {activeSubTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar Chart Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Radar Kompetensi</h4>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                        Skor Kesiapan: {overallReadinessScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Evaluasi 5 dimensi profil kompetensi individu</p>

                    <div className="h-60 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <Radar name="Skor" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-100 text-center text-xs">
                    {radarData.map((d, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-50">
                        <p className="text-[10px] text-slate-400 truncate">{d.subject}</p>
                        <p className="font-bold text-slate-800">{d.score}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9-Box & Status Card */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Kualifikasi TNA</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${qual.badgeClass}`}>
                        {qual.statusText}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pendidikan:</span>
                        <span className="font-semibold">{selectedEmployee.education} (Syarat: {rule?.minEdu || 'SMA'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Masa Kerja:</span>
                        <span className="font-semibold">{selectedEmployee.tenureYears} Thn (Syarat: {rule?.minTenureYears || 0} Thn)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Modul Selesai:</span>
                        <span className="font-semibold">{qual.completedTrainingsCount} / {qual.requiredTrainingsCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Penempatan 9-Box Grid</span>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Kuadran {selectedEmployee.nineBoxGrid}: {nineBoxInfo.title}</h4>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {selectedEmployee.performanceRating} Perf / {selectedEmployee.potentialRating} Pot
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {nineBoxInfo.strategicDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RIWAYAT PELATIHAN */}
            {activeSubTab === 'trainings' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Modul Pelatihan</h4>
                <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                  {trainingModules.map((mod) => {
                    const rec = selectedEmployee.trainings[mod.id];
                    const isDone = rec?.status === 'done';
                    const isInProgress = rec?.status === 'progress';

                    return (
                      <div key={mod.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400">{mod.code}</span>
                            <span className="font-bold text-slate-900">{mod.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{mod.category} • {mod.durationHours} Jam ({mod.provider})</span>
                        </div>

                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isInProgress ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {isDone ? 'Selesai (Done)' : isInProgress ? 'Sedang Berjalan' : 'Belum Diambil'}
                          </span>
                          {rec?.certificateNo && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              No: {rec.certificateNo} (Skor: {rec.score})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: RIWAYAT PERGERAKAN KARIER (TIMELINE) */}
            {activeSubTab === 'movement' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kronologi Mutasi, Promosi & Riwayat Penugasan
                </h4>

                {empMovements.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                    Belum ada log pergerakan resmi yang tercatat untuk karyawan ini.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {empMovements.map((mov) => (
                      <div key={mov.id} className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                        <div className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 block uppercase">
                            {mov.effectiveDate} • {mov.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{mov.skNumber}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-slate-500">{mov.fromPosition}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">{mov.toPosition}</span>
                          <span className="text-slate-400">({mov.toDepartment})</span>
                        </div>

                        {mov.reason && (
                          <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-md">
                            "{mov.reason}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: INDIVIDUAL DEVELOPMENT PLAN (IDP 70:20:10) */}
            {activeSubTab === 'idp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Framework Rencana Pengembangan Individu (70:20:10)
                  </h4>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    IDP Siklus 2026/2027
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-[11px]">70%</span>
                    <h5 className="text-xs font-bold text-slate-900">On-the-Job Assignment</h5>
                    <p className="text-[11px] text-slate-600">Lead Gugus Tugas efisiensi operasional & inspeksi keselamatan berkala.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">20%</span>
                    <h5 className="text-xs font-bold text-slate-900">Coaching & Mentorship</h5>
                    <p className="text-[11px] text-slate-600">Mentoring 1-on-1 bersama Manager & sesi job shadowing berkala.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">10%</span>
                    <h5 className="text-xs font-bold text-slate-900">Formal Learning</h5>
                    <p className="text-[11px] text-slate-600">Penyelesaian modul sertifikasi wajib dan masterclass kompetensi.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: JALUR KARIER */}
            {activeSubTab === 'career' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alternatif Jalur Karier &amp; Job Fit</h4>
                  <button
                    onClick={() => {
                      setIsEmployeeModalOpen(false);
                      setActiveTab('career');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition cursor-pointer border border-blue-200/60"
                  >
                    <span>Buka Career Architecture Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(selectedEmployee.careerPaths || []).map((path) => (
                    <div key={path.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase">{path.trackType}</span>
                          <h5 className="text-xs font-bold text-slate-900">{path.targetRole} (Grade {path.targetGrade})</h5>
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Fit {path.fitPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{path.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT DATA PROFIL KARYAWAN */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Data Profil Karyawan: {selectedEmployee.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              {/* Row 1: Nama & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Agus Setiawan, SMA"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Nomor Induk Pegawai) *</label>
                  <input
                    type="text"
                    required
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: NIP-2021-089"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Jabatan & Departemen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan (Job Title) *</label>
                  <input
                    type="text"
                    required
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="Contoh: Packaging Line Operator"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as Department)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Level, Grade, Pendidikan */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level Jabatan</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Min. Pendidikan</label>
                  <select
                    value={formEducation}
                    onChange={(e) => setFormEducation(e.target.value as EducationLevel)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    {EDUCATION_LEVELS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Masa Kerja, Status Kerja, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Masa Kerja (Tahun)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={formTenure}
                    onChange={(e) => setFormTenure(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Karyawan</label>
                  <select
                    value={formEmploymentType}
                    onChange={(e) => setFormEmploymentType(e.target.value as EmploymentType)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  >
                    <option value="PKWTT (Permanent)">PKWTT (Tetap)</option>
                    <option value="PKWT (Contract)">PKWT (Kontrak)</option>
                    <option value="Outsource">Outsource</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Perusahaan</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@alkara.co.id"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Row 4.5: Atasan Langsung (Hierarki / Org Structure) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atasan Langsung (Manager / Supervisor)</label>
                <select
                  value={formManagerId}
                  onChange={(e) => setFormManagerId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Tidak Ada Atasan Langsung (Top Level / Direksi) --</option>
                  {employees
                    .filter((e) => e.id !== selectedEmployee.id)
                    .map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.name} — {mgr.jobTitle} ({mgr.department})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Menentukan penempatan posisi karyawan ini di bawah atasan pada Bagan Struktur Organisasi (Org Chart).
                </p>
              </div>

              {/* Row 5: 9-Box Assessment Ratings */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 block">Evaluasi Kinerja &amp; Penempatan 9-Box Grid</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rating Kinerja (Performance)</label>
                    <select
                      value={formPerfRating}
                      onChange={(e) => setFormPerfRating(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800"
                    >
                      <option value="High">High (Kinerja Sangat Tinggi)</option>
                      <option value="Medium">Medium (Sesuai Ekspektasi)</option>
                      <option value="Low">Low (Perlu Peningkatan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rating Potensi (Potential)</label>
                    <select
                      value={formPotRating}
                      onChange={(e) => setFormPotRating(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800"
                    >
                      <option value="High">High (Potensi Kepemimpinan Tinggi)</option>
                      <option value="Medium">Medium (Potensi Menengah)</option>
                      <option value="Low">Low (Kapasitas Peran Saat Ini)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formIsKeyTalent}
                      onChange={(e) => setFormIsKeyTalent(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>⭐ Tandai sebagai Key Talent (Posisi Kritis)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formIsSuccessorReady}
                      onChange={(e) => setFormIsSuccessorReady(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🎯 Ready Successor (Kandidat Suksesi)</span>
                  </label>
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
