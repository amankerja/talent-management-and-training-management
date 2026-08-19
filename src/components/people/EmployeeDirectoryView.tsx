import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Award,
  ChevronRight,
  Eye,
  Edit2,
  Download,
  Upload
} from 'lucide-react';
import { DEPARTMENTS, JOB_LEVELS } from '../../data/mockData';
import { Employee } from '../../types';
import { Badge } from '../common/ui';
import { generateEmployeeDirectoryPDF } from '../../utils/pdfExport';

export const EmployeeDirectoryView: React.FC = () => {
  const { 
    employees, 
    setSelectedEmployee, 
    setIsEmployeeModalOpen, 
    setIsAddEmployeeModalOpen, 
    deleteEmployee,
    checkQualification,
    searchQuery,
    setSearchQuery,
    filterDepartment,
    setFilterDepartment,
    openExportImportModal,
    addToast
  } = useWorkforce();

  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = filterDepartment === 'All' || emp.department === filterDepartment;
      const matchLevel = selectedLevel === 'All' || emp.level === selectedLevel;
      const matchType = selectedType === 'All' || emp.employmentType.includes(selectedType);

      return matchSearch && matchDept && matchLevel && matchType;
    });
  }, [employees, searchQuery, filterDepartment, selectedLevel, selectedType]);

  const handleDelete = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    if (window.confirm(`Hapus data karyawan ${emp.name} (${emp.nip})?`)) {
      deleteEmployee(emp.id);
      addToast('Data Dihapus', `${emp.name} telah dihapus dari direktori.`, 'info');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-7 space-y-5 bg-slate-50">
      {/* Clean Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau posisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            aria-label="Filter Departemen"
            className="text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">Semua Departemen</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filter Level Jabatan"
            className="text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">Semua Level</option>
            {JOB_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter Status Kontrak"
            className="text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">Semua Status</option>
            <option value="PKWTT">Tetap (PKWTT)</option>
            <option value="PKWT">Kontrak (PKWT)</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              onClick={() => openExportImportModal('employees', 'export')}
              className="flex items-center gap-1.5 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md transition cursor-pointer"
              title="Ekspor Data Karyawan (Excel / CSV / JSON)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor</span>
            </button>
            <div className="w-px h-3.5 bg-slate-300" />
            <button
              onClick={() => openExportImportModal('employees', 'import')}
              className="flex items-center gap-1.5 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md transition cursor-pointer"
              title="Impor Data Karyawan dari Excel / CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Impor</span>
            </button>
          </div>

          <button
            onClick={() => generateEmployeeDirectoryPDF(employees, filterDepartment, selectedLevel)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition active:scale-98 cursor-pointer shadow-xs"
            title="Cetak Buku Sensus & Direktori Karyawan (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Modern Clean Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Level / Grade</th>
                <th className="py-3 px-4">Status Kerja</th>
                <th className="py-3 px-4 text-center">9-Box</th>
                <th className="py-3 px-4 text-center">Kualifikasi TNA</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada karyawan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const qual = checkQualification(emp);

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsEmployeeModalOpen(true);
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover bg-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{emp.name}</p>
                            <p className="text-[11px] text-slate-400">{emp.nip} • {emp.jobTitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600">
                        {emp.department}
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">{emp.level}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({emp.grade})</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600">
                          {emp.employmentType.split(' ')[0]}
                        </span>
                      </td>

                      {/* 9-Box Grid */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200/50">
                          B{emp.nineBoxGrid}
                        </span>
                      </td>

                      {/* TNA Qualification */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${qual.badgeClass}`}>
                          {qual.statusText}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                            title="Buka Profil 360"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                            title="Edit Data Karyawan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, emp)}
                            title="Hapus Karyawan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
