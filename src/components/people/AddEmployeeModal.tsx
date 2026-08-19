import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { X, UserPlus, Save, Building, Briefcase, GraduationCap, Calendar, Mail, User, ShieldCheck } from 'lucide-react';
import { Department, JobLevel, EducationLevel, EmploymentType, Employee } from '../../types';
import { DEPARTMENTS, JOB_LEVELS, EDUCATION_LEVELS, computeNineBoxGrid, NINE_BOX_DEFINITIONS } from '../../data/mockData';

export const AddEmployeeModal: React.FC = () => {
  const { employees, jobPositions, isAddEmployeeModalOpen, setIsAddEmployeeModalOpen, addEmployee, addToast } = useWorkforce();

  const [name, setName] = useState('');
  const [nip, setNip] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Operations');
  const [level, setLevel] = useState<JobLevel>('Staff');
  const [education, setEducation] = useState<EducationLevel>('S1');
  const [tenureYears, setTenureYears] = useState(2);
  const [birthYear, setBirthYear] = useState(1994);
  const [grade, setGrade] = useState('G3');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('PKWTT (Permanent)');
  const [contractEndDate, setContractEndDate] = useState('2026-12-31');
  const [performanceRating, setPerformanceRating] = useState<'Low' | 'Medium' | 'High'>('High');
  const [potentialRating, setPotentialRating] = useState<'Low' | 'Medium' | 'High'>('High');
  const [managerId, setManagerId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  // Positions available in the selected department
  const deptPositions = useMemo(() => {
    return jobPositions.filter((p) => p.department === department);
  }, [jobPositions, department]);

  // List of active managers in the system (prioritizing same department)
  const managerOptions = useMemo(() => {
    const mgrs = employees.filter(e => e.level === 'Manager' || e.level === 'Director' || e.level === 'Supervisor');
    return mgrs.sort((a, b) => (a.department === department ? -1 : 1));
  }, [employees, department]);

  // Handler when selecting a master position from dropdown
  const handleSelectPosition = (selectedPosTitle: string) => {
    setJobTitle(selectedPosTitle);
    const matched = deptPositions.find((p) => p.title === selectedPosTitle);
    if (matched) {
      setLevel(matched.level);
      setGrade(matched.grade);
      if (matched.minEdu) setEducation(matched.minEdu);
      if (matched.minTenureYears) setTenureYears(matched.minTenureYears);

      // Auto-suggest manager in same department
      if (matched.reportsToTitle) {
        const potentialMgr = employees.find(
          (e) => e.department === department && (e.jobTitle.toLowerCase().includes(matched.reportsToTitle!.toLowerCase()) || e.level === matched.reportsToLevel)
        );
        if (potentialMgr) {
          setManagerId(potentialMgr.id);
        }
      }
    }
  };

  // Compute 9-Box dynamically
  const calculatedBoxNumber = useMemo(() => {
    return computeNineBoxGrid(performanceRating, potentialRating);
  }, [performanceRating, potentialRating]);

  const boxInfo = NINE_BOX_DEFINITIONS[calculatedBoxNumber] || NINE_BOX_DEFINITIONS[9];

  if (!isAddEmployeeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !jobTitle.trim()) {
      addToast('Input Tidak Lengkap', 'Nama lengkap dan Posisi/Jabatan wajib diisi.', 'warning');
      return;
    }

    const selectedMgr = employees.find(e => e.id === managerId);

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      nip: nip.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@corporate.id`,
      avatarUrl: avatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department,
      jobTitle: jobTitle.trim(),
      level,
      grade: grade.trim() || (level === 'Director' ? 'G8' : level === 'Manager' ? 'G6' : level === 'Supervisor' ? 'G4' : 'G3'),
      education,
      tenureYears: Number(tenureYears) || 0,
      joinDate: new Date().toISOString().split('T')[0],
      birthYear: Number(birthYear) || 1994,
      employmentType,
      contractEndDate: employmentType.includes('Contract') ? contractEndDate : undefined,
      managerId: selectedMgr ? selectedMgr.id : undefined,
      managerName: selectedMgr ? `${selectedMgr.name} (${selectedMgr.jobTitle})` : undefined,
      performanceRating,
      potentialRating,
      nineBoxGrid: calculatedBoxNumber,
      isKeyTalent: calculatedBoxNumber >= 8,
      directReportsCount: level === 'Manager' || level === 'Director' ? 4 : 0,
      trainings: {},
      careerPaths: [
        {
          id: `cp_${Date.now()}`,
          trackType: 'Management Track',
          targetRole: `Senior ${jobTitle.trim()}`,
          targetGrade: 'G4',
          targetDept: department,
          fitPercentage: 80,
          description: 'Promosi vertikal kepemimpinan struktural.',
          requiredCompetencies: ['Strategic Decision Making', 'People Development'],
          gapsToClose: ['People Management Cert']
        }
      ],
      radar: {
        performance: performanceRating === 'High' ? 88 : performanceRating === 'Medium' ? 75 : 60,
        leadership: potentialRating === 'High' ? 85 : potentialRating === 'Medium' ? 70 : 55,
        technical: 80,
        adaptability: 75,
        cultureFit: 85
      }
    };

    addEmployee(newEmp);
    setIsAddEmployeeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto animate-fade-in">
        
        {/* Clean Soft Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tambah Karyawan Baru</h3>
              <p className="text-xs text-slate-500">Daftarkan profil talenta ke dalam organisasi</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddEmployeeModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Rian Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP</label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-center font-mono focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700">Posisi / Jabatan</label>
                {deptPositions.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-semibold">{deptPositions.length} Posisi Tersedia</span>
                )}
              </div>
              <input
                type="text"
                list="dept-positions-list"
                required
                placeholder="Pilih atau ketik jabatan..."
                value={jobTitle}
                onChange={(e) => handleSelectPosition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
              <datalist id="dept-positions-list">
                {deptPositions.map((pos) => (
                  <option key={pos.id} value={pos.title}>
                    {pos.level} • Grade {pos.grade}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Departemen</label>
              <select
                value={department}
                onChange={(e) => {
                  const newDept = e.target.value as Department;
                  setDepartment(newDept);
                  const firstPos = jobPositions.find(p => p.department === newDept);
                  if (firstPos) {
                    handleSelectPosition(firstPos.title);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as JobLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                {JOB_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pendidikan</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value as EducationLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                {EDUCATION_LEVELS.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Masa Kerja (Thn)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-center focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Atasan Langsung (Manager/Director)</label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">-- Tanpa Atasan Langsung (Top Level) --</option>
                {managerOptions.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} ({mgr.jobTitle} - {mgr.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tahun Lahir (Usia: {2026 - birthYear} thn)</label>
              <input
                type="number"
                min="1960"
                max="2008"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status Ikatan Kerja</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                <option value="PKWTT (Permanent)">Tetap (PKWTT)</option>
                <option value="PKWT (Contract)">Kontrak (PKWT)</option>
                <option value="Outsource">Outsource</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Grade / Golongan</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Contoh: G3, G5, G8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {employmentType.includes('Contract') && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal Berakhir Kontrak (PKWT)</label>
              <input
                type="date"
                required
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
                className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          )}

          {/* Dynamic 9-Box Matrix Input */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Evaluasi 9-Box Grid (Dihitung Otomatis)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Box {calculatedBoxNumber}: {boxInfo.title.split('(')[0].trim()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Rating Kinerja (Performance)</label>
                <select
                  value={performanceRating}
                  onChange={(e) => setPerformanceRating(e.target.value as 'Low' | 'Medium' | 'High')}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="High">High (Target Terlampaui)</option>
                  <option value="Medium">Medium (Target Tercapai)</option>
                  <option value="Low">Low (Perlu Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Rating Potensi (Potential)</label>
                <select
                  value={potentialRating}
                  onChange={(e) => setPotentialRating(e.target.value as 'Low' | 'Medium' | 'High')}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="High">High (Siap Naik 2 Level)</option>
                  <option value="Medium">Medium (Siap Naik 1 Level)</option>
                  <option value="Low">Low (Optimal di Level Saat Ini)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddEmployeeModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs active:scale-98 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
