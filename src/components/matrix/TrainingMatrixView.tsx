import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  Search, 
  Download, 
  Upload,
  FileSpreadsheet,
  CheckCircle2, 
  Clock, 
  XCircle, 
  Minus, 
  LayoutGrid, 
  Flame, 
  X, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Hand, 
  MousePointer, 
  Sparkles, 
  BookOpen,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal
} from 'lucide-react';
import { Department, JobLevel, TrainingStatusType, Employee, TrainingModule } from '../../types';
import { DEPARTMENTS, JOB_LEVELS } from '../../data/mockData';
import { SkillGapHeatmap } from './SkillGapHeatmap';
import { generateTrainingMatrixPDF } from '../../utils/pdfExport';

export const TrainingMatrixView: React.FC = () => {
  const { 
    employees, 
    trainingModules, 
    getRuleFor, 
    checkQualification, 
    updateEmployeeTraining,
    setSelectedEmployee,
    setIsEmployeeModalOpen,
    setIsManageModulesModalOpen,
    openExportImportModal,
    searchQuery,
    setSearchQuery,
    filterDepartment,
    setFilterDepartment,
    filterQualification,
    setFilterQualification,
    addToast
  } = useWorkforce();

  const [matrixSubTab, setMatrixSubTab] = useState<'matrix' | 'heatmap'>('matrix');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState<'name' | 'nip' | 'dept' | 'level' | 'tnaStatus' | 'completedCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Interaction Tool Mode: 'select' (default) or 'pan' (hand tool)
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Zoom State (0.7 to 1.3)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Drag Panning State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number; hasMoved: boolean }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
    hasMoved: false
  });

  // Status Edit Popover State
  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    employeeName: string;
    moduleId: string;
    moduleName: string;
    currentStatus: TrainingStatusType;
    score?: number;
    certNo?: string;
  } | null>(null);

  const [editScore, setEditScore] = useState<string>('');
  const [editCert, setEditCert] = useState<string>('');

  // Spacebar listener for temporary Hand tool (Figma style) & Escape for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const isPanActive = toolMode === 'pan' || isSpacePressed;

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.3, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  // Smooth Pan button controls
  const handlePan = (dx: number, dy: number) => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
  };

  // Drag Panning Event Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only left click or middle click
    if (e.button !== 0 && e.button !== 1) return;
    if (!viewportRef.current) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
      hasMoved: false
    };

    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging || !viewportRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStartRef.current.hasMoved = true;
      }

      viewportRef.current.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
      viewportRef.current.scrollTop = dragStartRef.current.scrollTop - deltaY;
    };

    const handleWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  const openCellEdit = (emp: Employee, mod: TrainingModule) => {
    // If the user was dragging the canvas, don't trigger the modal
    if (dragStartRef.current.hasMoved) return;

    const current = emp.trainings[mod.id] || { status: 'not_done' };
    setEditingCell({
      employeeId: emp.id,
      employeeName: emp.name,
      moduleId: mod.id,
      moduleName: mod.name,
      currentStatus: current.status,
      score: current.score,
      certNo: current.certificateNo
    });
    setEditScore(current.score !== undefined ? String(current.score) : '');
    setEditCert(current.certificateNo || '');
  };

  const handleSaveCell = (status: TrainingStatusType) => {
    if (!editingCell) return;
    const scoreNum = editScore ? parseFloat(editScore) : undefined;
    updateEmployeeTraining(
      editingCell.employeeId,
      editingCell.moduleId,
      status,
      scoreNum,
      editCert || undefined
    );
    setEditingCell(null);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchNip = emp.nip.toLowerCase().includes(q);
        const matchJob = emp.jobTitle.toLowerCase().includes(q);
        if (!matchName && !matchNip && !matchJob) return false;
      }

      // Department Filter
      if (filterDepartment !== 'All' && emp.department !== filterDepartment) {
        return false;
      }

      // Qualification Filter
      if (filterQualification !== 'All') {
        const qual = checkQualification(emp);
        if (filterQualification === 'Qualified' && !qual.isQualified) return false;
        if (filterQualification === 'Gap' && qual.isQualified) return false;
      }

      return true;
    });
  }, [employees, searchQuery, filterDepartment, filterQualification, checkQualification]);

  // Sorted employees list
  const sortedEmployees = useMemo(() => {
    const list = [...filteredEmployees];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === 'nip') {
        cmp = a.nip.localeCompare(b.nip);
      } else if (sortField === 'dept') {
        cmp = a.department.localeCompare(b.department);
      } else if (sortField === 'level') {
        cmp = a.level.localeCompare(b.level);
      } else if (sortField === 'tnaStatus') {
        const qualA = checkQualification(a).isQualified ? 1 : 0;
        const qualB = checkQualification(b).isQualified ? 1 : 0;
        cmp = qualA - qualB;
      } else if (sortField === 'completedCount') {
        const countA = Object.values(a.trainings || {}).filter((t: any) => t?.status === 'completed').length;
        const countB = Object.values(b.trainings || {}).filter((t: any) => t?.status === 'completed').length;
        cmp = countA - countB;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredEmployees, sortField, sortOrder, checkQualification]);

  const handleToggleSort = (field: 'name' | 'nip' | 'dept' | 'level' | 'tnaStatus' | 'completedCount') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export PDF handler
  const handleExportPDF = () => {
    try {
      generateTrainingMatrixPDF(
        sortedEmployees,
        trainingModules,
        getRuleFor,
        checkQualification,
        {
          dept: filterDepartment,
          level: 'All',
          qualification: filterQualification,
          search: searchQuery
        }
      );
      addToast('PDF Berhasil Dibuat', 'Laporan Matriks TNA telah diunduh.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal Export PDF', 'Terjadi kesalahan saat memproses laporan.', 'error');
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden relative ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 w-screen h-screen' : ''
    }`}>
      {/* Top Filter & Control Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 lg:px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left: View Mode Tabs & Search */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Sub Tab Switcher */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs">
            <button
              onClick={() => setMatrixSubTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                matrixSubTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tabel Matriks</span>
            </button>
            <button
              onClick={() => setMatrixSubTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                matrixSubTab === 'heatmap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heatmap Kesenjangan</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / NIP..."
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none w-44 sm:w-52 transition"
            />
          </div>
        </div>

        {/* Right: Department Filter, Mode Tool, Zoom, Sort, Fullscreen, and Export */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            aria-label="Filter Departemen"
            className="text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">Semua Departemen</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Qualification Filter */}
          <select
            value={filterQualification}
            onChange={(e) => setFilterQualification(e.target.value as any)}
            aria-label="Filter Kualifikasi TNA"
            className="text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">Semua Status</option>
            <option value="Qualified">Memenuhi Syarat</option>
            <option value="Gap">Ada Gap Pelatihan</option>
          </select>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={`${sortField}_${sortOrder}`}
              onChange={(e) => {
                const parts = e.target.value.split('_');
                setSortField(parts[0] as any);
                setSortOrder(parts[1] as any);
              }}
              aria-label="Urutkan Data Matriks"
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
              <option value="tnaStatus_asc">Status TNA (Gap Terbanyak)</option>
              <option value="tnaStatus_desc">Status TNA (Lengkap Terlebih Dahulu)</option>
              <option value="completedCount_desc">Modul Selesai (Terbanyak)</option>
              <option value="completedCount_asc">Modul Selesai (Tersedikit)</option>
              <option value="dept_asc">Departemen (A - Z)</option>
              <option value="level_asc">Level Jabatan</option>
            </select>
          </div>

          {/* Tool Mode Toggle: Select vs Hand/Pan */}
          {matrixSubTab === 'matrix' && (
            <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200/70 p-0.5 text-xs">
              <button
                onClick={() => setToolMode('select')}
                title="Mode Pilih & Edit (Klik sel untuk ubah status)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  toolMode === 'select'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pilih</span>
              </button>
              <button
                onClick={() => setToolMode('pan')}
                title="Mode Geser / Pan (Klik & geser layar bebas)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  toolMode === 'pan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Geser (Pan)</span>
              </button>
            </div>
          )}

          {/* Clean Soft Zoom Controller Pill */}
          {matrixSubTab === 'matrix' && (
            <div className="flex items-center bg-slate-100/90 rounded-xl border border-slate-200/70 p-0.5 text-xs shadow-2xs">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.7}
                title="Zoom Out"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetZoom}
                title="Reset Zoom ke 100%"
                className="px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:text-blue-600 transition"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 1.3}
                title="Zoom In"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Manage Modules Catalog */}
          <button
            onClick={() => setIsManageModulesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition active:scale-98 cursor-pointer"
            title="Kelola & Tambah Modul Pelatihan"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Kelola Modul</span>
          </button>

          {/* Export & Import Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openExportImportModal('training_matrix', 'export')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition active:scale-98 cursor-pointer"
              title="Ekspor Matriks & Catatan Pelatihan (Excel / CSV / JSON)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={() => openExportImportModal('training_matrix', 'import')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition active:scale-98 cursor-pointer"
              title="Impor Status & Nilai Pelatihan Massal"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition active:scale-98 cursor-pointer"
              title="Cetak Dokumen PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-98 cursor-pointer ${
              isFullscreen
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Tampilan Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Body View */}
      {matrixSubTab === 'heatmap' ? (
        <SkillGapHeatmap />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Sub Header Legend & Pan Hint */}
          <div className="bg-slate-50 px-4 lg:px-6 py-2 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-500 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                {sortedEmployees.length} Karyawan
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Hand className="w-3 h-3 text-blue-500" />
                {isPanActive ? (
                  <strong className="text-blue-600 font-semibold">Mode Geser Aktif: Klik & tahan di mana saja untuk menggeser</strong>
                ) : (
                  <span>Tahan <strong>Spasi</strong> atau pilih <strong>Mode Geser</strong> untuk pan bebas</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
                <span>Sedang Jalan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300" />
                <span>Wajib (Gap)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" />
                <span>Opsional</span>
              </div>
            </div>
          </div>

          {/* Matrix Scrollable Viewport with Pan & Zoom */}
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            className={`flex-1 overflow-auto custom-scrollbar relative select-none ${
              isDragging ? 'cursor-grabbing' : isPanActive ? 'cursor-grab' : 'cursor-default'
            }`}
          >
            <div
              style={{
                fontSize: `${zoomLevel * 12}px`,
                minWidth: '100%',
                display: 'inline-block'
              }}
            >
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-white border-b border-slate-200/80 sticky top-0 z-20 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {/* Sticky Employee Header Column with Click-to-Sort */}
                    <th
                      style={{ width: `${zoomLevel * 240}px` }}
                      onClick={() => handleToggleSort('name')}
                      className="py-3 px-4 sticky left-0 bg-white z-30 shadow-[1px_0_0_#e2e8f0] cursor-pointer hover:bg-slate-50 transition-colors select-none"
                      title="Klik untuk mengurutkan berdasarkan nama"
                    >
                      <div className="flex items-center justify-between">
                        <span>Karyawan &amp; Posisi</span>
                        {sortField === 'name' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </th>
                    <th
                      style={{ width: `${zoomLevel * 110}px` }}
                      onClick={() => handleToggleSort('tnaStatus')}
                      className="py-3 px-3 text-center cursor-pointer hover:bg-slate-50 transition-colors select-none"
                      title="Klik untuk mengurutkan berdasarkan pemenuhan TNA"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Status TNA</span>
                        {sortField === 'tnaStatus' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>
                    {trainingModules.map((mod) => (
                      <th
                        key={mod.id}
                        style={{ minWidth: `${zoomLevel * 130}px`, maxWidth: `${zoomLevel * 160}px` }}
                        className="py-3 px-3 text-center"
                      >
                        <div className="truncate font-semibold text-slate-800" title={mod.name}>
                          {mod.code}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal truncate" title={mod.name}>
                          {mod.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedEmployees.map((emp) => {
                    const rule = getRuleFor(emp.department, emp.level);
                    const requiredIds = rule?.requiredTrainingIds || [];
                    const qual = checkQualification(emp);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sticky Left Column: Employee Profile */}
                        <td className="py-2.5 px-4 sticky left-0 bg-white hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0] z-10">
                          <div
                            onClick={(e) => {
                              if (isPanActive || dragStartRef.current.hasMoved) return;
                              setSelectedEmployee(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                            className={`flex items-center gap-2.5 text-left w-full group/btn ${
                              isPanActive ? 'cursor-grab' : 'cursor-pointer'
                            }`}
                          >
                            <img
                              src={emp.avatarUrl}
                              alt=""
                              style={{ width: `${zoomLevel * 28}px`, height: `${zoomLevel * 28}px` }}
                              className="rounded-full object-cover shrink-0 bg-slate-100 pointer-events-none"
                            />
                            <div className="min-w-0 pointer-events-none">
                              <p className="font-semibold text-slate-800 truncate group-hover/btn:text-blue-600 transition-colors">
                                {emp.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {emp.nip} • {emp.level}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status TNA Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${qual.badgeClass}`}>
                            {qual.statusText}
                          </span>
                        </td>

                        {/* Training Module Status Cells */}
                        {trainingModules.map((mod) => {
                          const isMandatory = requiredIds.includes(mod.id);
                          const record = emp.trainings[mod.id];
                          const status: TrainingStatusType = record?.status || 'not_done';

                          let cellClass = 'bg-slate-50/40 text-slate-300 hover:bg-slate-100 border border-transparent';
                          let icon = <Minus className="w-3.5 h-3.5" />;
                          let tooltip = 'Opsional / Belum Diambil';

                          if (status === 'done') {
                            cellClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100';
                            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                            tooltip = `Selesai ${record?.score ? `(Nilai: ${record.score})` : ''}`;
                          } else if (status === 'progress') {
                            cellClass = 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100';
                            icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
                            tooltip = 'Sedang Berlangsung';
                          } else if (isMandatory) {
                            cellClass = 'bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100';
                            icon = <XCircle className="w-3.5 h-3.5 text-rose-500" />;
                            tooltip = 'Wajib (Gap TNA)';
                          }

                          return (
                            <td key={mod.id} className="py-2 px-2 text-center">
                              <div
                                onClick={() => {
                                  if (!isPanActive) {
                                    openCellEdit(emp, mod);
                                  }
                                }}
                                title={`${emp.name} - ${mod.name}: ${tooltip}`}
                                className={`w-full py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition font-medium select-none ${
                                  isPanActive ? 'cursor-grab' : 'cursor-pointer'
                                } ${cellClass}`}
                              >
                                {icon}
                                {record?.score !== undefined && (
                                  <span className="text-[10px] font-semibold">{record.score}</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Pan Navigation Buttons (Bottom Right) */}
          <div className="absolute bottom-4 right-5 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/80 shadow-md">
            <button
              onClick={() => handlePan(-200, 0)}
              title="Geser ke Kiri (Pan Left)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePan(0, -150)}
              title="Geser ke Atas (Pan Up)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePan(0, 150)}
              title="Geser ke Bawah (Pan Down)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePan(200, 0)}
              title="Geser ke Kanan (Pan Right)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clean Modal Popover for Editing Cell Status */}
      {editingCell && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{editingCell.employeeName}</h4>
                <p className="text-xs text-slate-500 truncate">{editingCell.moduleName}</p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Optional Score and Certificate Inputs */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nilai Evaluasi (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value)}
                  placeholder="Contoh: 85"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Sertifikat (Opsional)</label>
                <input
                  type="text"
                  value={editCert}
                  onChange={(e) => setEditCert(e.target.value)}
                  placeholder="Contoh: CERT-2026-009"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status Options */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Pilih Status Baru:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSaveCell('done')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-98 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mb-1" />
                  <span>Selesai</span>
                </button>

                <button
                  onClick={() => handleSaveCell('progress')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition active:scale-98 text-xs font-medium"
                >
                  <Clock className="w-4 h-4 mb-1" />
                  <span>Jalan</span>
                </button>

                <button
                  onClick={() => handleSaveCell('not_done')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition active:scale-98 text-xs font-medium"
                >
                  <XCircle className="w-4 h-4 mb-1" />
                  <span>Belum</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
