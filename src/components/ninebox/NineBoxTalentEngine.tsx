import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  GitGraph, 
  Star, 
  Filter, 
  Download, 
  Upload,
  FileSpreadsheet,
  BookOpen, 
  ExternalLink, 
  Play, 
  ArrowRight, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  ChevronRight 
} from 'lucide-react';
import { NINE_BOX_DEFINITIONS, DEPARTMENTS } from '../../data/mockData';
import { Employee, NineBoxInfo } from '../../types';
import { generateNineBoxPDF } from '../../utils/pdfExport';
import { ExpandableDetail } from '../common/ui';

export const NineBoxTalentEngine: React.FC = () => {
  const { 
    employees, 
    setSelectedEmployee, 
    setIsEmployeeModalOpen, 
    getNineBoxBox,
    openExportImportModal,
    addToast 
  } = useWorkforce();

  const [selectedBoxNumber, setSelectedBoxNumber] = useState<number>(9); // default to Box 9 (Star)
  const [filterDept, setFilterDept] = useState<string>('All');

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => filterDept === 'All' || e.department === filterDept);
  }, [employees, filterDept]);

  // Group employees by 9-box
  const boxEmployeesMap = useMemo(() => {
    const map: Record<number, Employee[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    };
    filteredEmployees.forEach((emp) => {
      const boxNum = emp.nineBoxGrid || 5;
      if (map[boxNum]) map[boxNum].push(emp);
    });
    return map;
  }, [filteredEmployees, getNineBoxBox]);

  const activeBoxInfo: NineBoxInfo = NINE_BOX_DEFINITIONS[selectedBoxNumber] || NINE_BOX_DEFINITIONS[9];
  const activeEmployeesInBox: Employee[] = boxEmployeesMap[selectedBoxNumber] || [];

  // Matrix cell layout order:
  // Row 1 (High Performance): Box 7 (Low Pot), Box 8 (Med Pot), Box 9 (High Pot)
  // Row 2 (Med Performance): Box 4 (Low Pot), Box 5 (Med Pot), Box 6 (High Pot)
  // Row 3 (Low Performance): Box 1 (Low Pot), Box 2 (Med Pot), Box 3 (High Pot)
  const gridRows = [
    [7, 8, 9],
    [4, 5, 6],
    [1, 2, 3]
  ];

  const handleApplyPolicy = () => {
    if (activeEmployeesInBox.length === 0) return;
    addToast(
      'Kebijakan Talenta Diterapkan',
      `Paket intervensi suksesi & pengembangan untuk ${activeEmployeesInBox.length} karyawan di Box ${activeBoxInfo.title} berhasil diaktifkan.`,
      'success'
    );
  };

  const handleDownloadPDF = async () => {
    try {
      generateNineBoxPDF(filteredEmployees, filterDept, boxEmployeesMap);
      addToast(
        'Laporan PDF Siap',
        `Dokumen kalibrasi 9-Box Talent & Succession (${filterDept === 'All' ? 'Seluruh Departemen' : filterDept}) berhasil diunduh.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Gagal Mengunduh PDF', 'Terjadi kesalahan saat membuat dokumen PDF.', 'error');
    }
  };

  // Helper to get box theme styling
  const getBoxStyle = (boxNum: number, isSelected: boolean) => {
    let base = 'rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ';
    
    // Row 1: High Performance
    if (boxNum === 7) {
      base += 'bg-[#DFF6E9]/40 border border-[#178A55]/20 hover:bg-[#DFF6E9]/60 hover:shadow-md ';
    } else if (boxNum === 8) {
      base += 'bg-[#DFF6E9]/60 border border-[#178A55]/30 hover:bg-[#DFF6E9]/80 hover:shadow-md ';
    } else if (boxNum === 9) {
      base += 'bg-white border-2 border-[#00694e] shadow-sm hover:shadow-lg ';
    }
    // Row 2: Medium Performance
    else if (boxNum === 4) {
      base += 'bg-white border border-[#dee4df] hover:border-[#6d7a73]/40 hover:shadow-md ';
    } else if (boxNum === 5) {
      base += 'bg-[#FDF0DA]/40 border border-[#B67207]/20 hover:bg-[#FDF0DA]/60 hover:shadow-md ';
    } else if (boxNum === 6) {
      base += 'bg-[#FDF0DA]/60 border border-[#B67207]/30 hover:bg-[#FDF0DA]/80 hover:shadow-md ';
    }
    // Row 3: Low Performance
    else if (boxNum === 1) {
      base += 'bg-[#FBE4E4]/40 border border-[#D8433C]/20 hover:bg-[#FBE4E4]/60 hover:shadow-md ';
    } else if (boxNum === 2) {
      base += 'bg-[#FBE4E4]/60 border border-[#D8433C]/30 hover:bg-[#FBE4E4]/80 hover:shadow-md ';
    } else if (boxNum === 3) {
      base += 'bg-white border border-[#dee4df] hover:border-[#6d7a73]/40 hover:shadow-md ';
    }

    if (isSelected) {
      base += ' ring-4 ring-[#00694e]/20 border-[#00694e] shadow-lg scale-[1.02] z-10';
    }

    return base;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-[#f5fbf6] text-[#171d1a] space-y-6">
      
      {/* 1. Context Header Card */}
      <div className="bg-white rounded-xl border border-[#dee4df] p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00694e] mb-1">
            <GitGraph className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Strategic Talent Grid</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#171d1a] tracking-tight mb-1">
            9-Box Talent & Succession Engine
          </h1>
          <p className="text-xs text-[#6d7a73] max-w-2xl leading-relaxed">
            Matriks evaluasi Kinerja (Performance) vs Potensi (Potential) dengan rekomendasi aksi pengembangan berbasis strategi.
          </p>
        </div>

        {/* Dept Filter & Export Actions */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <div className="flex items-center gap-2 bg-[#F3F8F5] border border-[#dee4df] rounded-full px-3.5 py-1.5 shadow-xs">
            <Filter className="w-4 h-4 text-[#6d7a73]" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171d1a] outline-hidden cursor-pointer pr-2"
            >
              <option value="All">Semua Departemen ({employees.length})</option>
              {DEPARTMENTS.map((d) => {
                const count = employees.filter((e) => e.department === d).length;
                return (
                  <option key={d} value={d}>
                    {d} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => openExportImportModal('ninebox', 'export')}
            className="flex items-center gap-1.5 bg-[#F3F8F5] hover:bg-[#dee4df] text-[#171d1a] text-xs font-bold px-3.5 py-2 rounded-full border border-[#dee4df] shadow-xs transition active:scale-95 cursor-pointer"
            title="Ekspor Data Kalibrasi 9-Box ke Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00694e]" />
            <span>Export 9-Box</span>
          </button>

          <button
            onClick={() => openExportImportModal('ninebox', 'import')}
            className="flex items-center gap-1.5 bg-[#F3F8F5] hover:bg-[#dee4df] text-[#171d1a] text-xs font-bold px-3.5 py-2 rounded-full border border-[#dee4df] shadow-xs transition active:scale-95 cursor-pointer"
            title="Impor Kalibrasi Rating Kinerja & Potensi dari Excel / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            id="btn-ninebox-download-pdf"
            className="flex items-center gap-2 bg-[#00694e] hover:bg-[#00513c] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Download formatted enterprise PDF report for 9-Box talent distribution"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Main Layout: 9-Box Matrix Grid + Strategic HR Playbook Panel */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
        
        {/* Left: 9-Box Interactive Matrix Area */}
        <div className="flex-1 bg-white rounded-xl border border-[#dee4df] shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div className="p-5 flex justify-between items-center border-b border-[#dee4df] shrink-0">
            <h2 className="text-xs font-bold text-[#6d7a73] tracking-widest uppercase">
              Performance vs Potential Matrix
            </h2>
            <span className="text-xs text-[#6d7a73]">
              Klik kotak mana pun untuk melihat detail
            </span>
          </div>

          <div className="p-5 lg:p-6 flex gap-3 sm:gap-4 relative items-stretch">
            
            {/* Y-Axis Label (Performance) */}
            <div className="flex flex-col justify-between items-center py-6 text-xs font-black uppercase tracking-wider shrink-0 w-12 select-none">
              <span className="text-[10px] text-[#178A55] bg-[#DFF6E9] font-extrabold tracking-wider px-2 py-0.5 rounded-md shadow-2xs">
                TINGGI
              </span>
              <div className="flex items-center gap-1.5 -rotate-90 whitespace-nowrap text-[#171d1a] text-[11px] font-black tracking-widest my-auto origin-center">
                <span>PERFORMANCE (KINERJA)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00694e]" />
              </div>
              <span className="text-[10px] text-[#D8433C] bg-[#FBE4E4] font-extrabold tracking-wider px-2 py-0.5 rounded-md shadow-2xs">
                RENDAH
              </span>
            </div>

            {/* 3x3 Matrix Grid Container */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3 min-h-115">
                {gridRows.map((row) =>
                  row.map((boxNum) => {
                    const info = NINE_BOX_DEFINITIONS[boxNum];
                    const emps = boxEmployeesMap[boxNum] || [];
                    const isSelected = selectedBoxNumber === boxNum;

                    // Parse short title & subtitle from definition
                    const titleParts = info.title.split('(');
                    const cleanTitle = titleParts[0].trim();
                    const subLabel = titleParts[1] ? `(${titleParts[1]}` : '';

                    return (
                      <div
                        key={boxNum}
                        onClick={() => setSelectedBoxNumber(boxNum)}
                        className={getBoxStyle(boxNum, isSelected)}
                      >
                        {/* Header Box & Icon */}
                        <div className="flex items-start justify-between gap-1 relative z-10">
                          <div className="text-xs font-bold text-[#171d1a] leading-snug">
                            <span>{cleanTitle}</span>
                            {subLabel && (
                              <span className="block text-[10px] font-normal text-[#6d7a73] mt-0.5 opacity-80">
                                {subLabel}
                              </span>
                            )}
                          </div>
                          {boxNum === 9 && (
                            <Star className="w-4 h-4 text-[#B67207] fill-[#F59E0B] shrink-0" />
                          )}
                        </div>

                        {/* Center Employee Count */}
                        <div className="my-3 flex items-baseline gap-1 relative z-10">
                          <span className={`text-3xl font-extrabold leading-none ${emps.length === 0 ? 'text-[#6d7a73]/40' : 'text-[#171d1a]'}`}>
                            {emps.length}
                          </span>
                          <span className={`text-xs font-medium ${emps.length === 0 ? 'text-[#6d7a73]/40' : 'text-[#6d7a73]'}`}>
                            orang
                          </span>
                        </div>

                        {/* Avatars Stack Preview */}
                        <div className="flex items-center -space-x-2 overflow-hidden py-1 relative z-10">
                          {emps.slice(0, 3).map((e) => (
                            <img
                              key={e.id}
                              src={e.avatarUrl}
                              alt={e.name}
                              className="w-7 h-7 rounded-full border-2 border-white object-cover shrink-0 shadow-xs"
                              title={`${e.name} (${e.jobTitle})`}
                            />
                          ))}
                          {emps.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-[#dee4df] text-[#171d1a] text-[10px] font-bold flex items-center justify-center border-2 border-white shrink-0">
                              +{emps.length - 3}
                            </div>
                          )}
                          {emps.length === 0 && (
                            <span className="text-[10px] text-[#6d7a73]/50 italic">Kosong</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* X-Axis Label (Potential) */}
              <div className="flex items-center justify-between pt-3 px-4 text-[#6d7a73] text-xs font-bold uppercase tracking-widest">
                <span className="text-[10px] font-extrabold text-[#D8433C] bg-[#FBE4E4] px-2 py-0.5 rounded-md shadow-2xs">
                  POTENSI RENDAH
                </span>
                <span className="text-[#171d1a] text-[11px] font-black tracking-widest flex items-center gap-1.5">
                  POTENTIAL (POTENSI) <ArrowRight className="w-3.5 h-3.5 text-[#00694e]" />
                </span>
                <span className="text-[10px] font-extrabold text-[#178A55] bg-[#DFF6E9] px-2 py-0.5 rounded-md shadow-2xs">
                  POTENSI TINGGI
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Action Playbook Side Panel (Deep Forest Futuristic Theme) */}
        <div className="w-full xl:w-96 shrink-0 bg-[#0E3B2E] text-white rounded-xl p-5 lg:p-6 flex flex-col justify-between gap-4 shadow-xl border border-[#00694e]/30 relative">
          
          {/* Subtle gradient effect */}
          <div className="absolute inset-0 bg-linear-to-br from-[#00694e]/20 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-4 flex-1 flex flex-col min-h-0">
            
            {/* Header Playbook */}
            <div className="flex items-center gap-2 text-[#97f5d0] shrink-0">
              <BookOpen className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Playbook Aksi Strategis</span>
            </div>

            <div className="flex items-start justify-between gap-2 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                  {activeBoxInfo.title}
                </h3>
              </div>
              <div className="bg-white/10 border border-white/20 text-[#86f7cd] rounded-full px-3 py-1 text-center shrink-0">
                <div className="font-extrabold text-sm">{activeEmployeesInBox.length}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/80">Karyawan</div>
              </div>
            </div>

            {/* Expandable Strategic Detail & Recommendations */}
            <div className="shrink-0">
              <ExpandableDetail 
                dark 
                title="Panduan Strategi & Aksi" 
                badge="Detail Kebijakan"
                defaultOpen={false}
              >
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-white/80 leading-relaxed pb-2 border-b border-white/10">
                    {activeBoxInfo.strategicDescription}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-[#86f7cd] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#86f7cd]" />
                      <span>Langkah Tindakan:</span>
                    </h4>
                    {activeBoxInfo.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex gap-2 items-start text-[11px] text-white/90 leading-relaxed"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#00694e] text-[#86f7cd] flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableDetail>
            </div>

            {/* List of Employees in This Category */}
            <div className="flex-1 flex flex-col min-h-0 pt-1">
              <div className="flex justify-between items-center mb-2 shrink-0">
                <h4 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                  Daftar Karyawan di Kategori Ini:
                </h4>
                <span className="text-[10px] text-[#86f7cd] font-bold">
                  {activeEmployeesInBox.length} Orang
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-60 min-h-36">
                {activeEmployeesInBox.length === 0 ? (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center text-xs text-white/50 italic">
                    Tidak ada karyawan di kategori ini untuk departemen yang dipilih.
                  </div>
                ) : (
                  activeEmployeesInBox.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsEmployeeModalOpen(true);
                      }}
                      className="group bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white group-hover:text-[#86f7cd] truncate">
                            {emp.name}
                          </h5>
                          <p className="text-[10px] text-white/60 truncate">
                            {emp.jobTitle} • {emp.department}
                          </p>
                        </div>
                      </div>

                      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#86f7cd] shrink-0 transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Fixed Action CTA */}
          <div className="relative z-10 pt-3 border-t border-white/15 shrink-0">
            <button
              onClick={handleApplyPolicy}
              disabled={activeEmployeesInBox.length === 0}
              className="w-full bg-[#86f7cd] hover:bg-[#69dbb1] disabled:opacity-40 text-[#002116] font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Terapkan Kebijakan ke Grup Ini ({activeEmployeesInBox.length})</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
