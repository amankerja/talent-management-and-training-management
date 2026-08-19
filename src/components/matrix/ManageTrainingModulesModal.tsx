import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Clock, 
  Search, 
  Check, 
  Save, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  Building2, 
  Users,
  Download,
  Upload
} from 'lucide-react';
import { TrainingModule, TrainingCategory } from '../../types';
import { TRAINING_CATEGORIES } from '../../data/mockData';

export const ManageTrainingModulesModal: React.FC = () => {
  const { 
    trainingModules, 
    isManageModulesModalOpen, 
    setIsManageModulesModalOpen, 
    addNewTrainingModule, 
    updateTrainingModule, 
    deleteTrainingModule,
    tnaRules,
    employees,
    openExportImportModal,
    addToast 
  } = useWorkforce();

  // Mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Selected Module for Edit
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TrainingCategory>('Leadership');
  const [durationHours, setDurationHours] = useState(16);
  const [provider, setProvider] = useState('Corporate L&D Academy');
  const [description, setDescription] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Open Add Mode
  const handleOpenAdd = () => {
    const autoCode = `T${String(trainingModules.length + 1).padStart(2, '0')}`;
    setCode(autoCode);
    setName('');
    setCategory('Leadership');
    setDurationHours(16);
    setProvider('Corporate L&D Academy');
    setDescription('');
    setViewMode('add');
  };

  // Open Edit Mode
  const handleOpenEdit = (mod: TrainingModule) => {
    setEditingModule(mod);
    setCode(mod.code);
    setName(mod.name);
    setCategory(mod.category as TrainingCategory);
    setDurationHours(mod.durationHours);
    setProvider(mod.provider || 'Corporate L&D Academy');
    setDescription(mod.description || '');
    setViewMode('edit');
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (viewMode === 'add') {
      addNewTrainingModule({
        code,
        name,
        category,
        durationHours: Number(durationHours),
        provider,
        description: description || 'Pelatihan pengembangan kompetensi standar.'
      });
      setViewMode('list');
    } else if (viewMode === 'edit' && editingModule) {
      updateTrainingModule({
        ...editingModule,
        code,
        name,
        category,
        durationHours: Number(durationHours),
        provider,
        description
      });
      setViewMode('list');
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = (id: string) => {
    deleteTrainingModule(id);
    setDeletingId(null);
  };

  // Filtered list
  const filteredModules = useMemo(() => {
    return trainingModules.filter((mod) => {
      const matchCat = categoryFilter === 'All' || mod.category === categoryFilter;
      const matchQuery = 
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mod.description && mod.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [trainingModules, categoryFilter, searchQuery]);

  if (!isManageModulesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-auto animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {viewMode === 'list' ? 'Kelola Katalog Modul Pelatihan (TNA)' : viewMode === 'add' ? 'Tambah Modul Pelatihan Baru' : 'Edit Modul Pelatihan'}
              </h3>
              <p className="text-xs text-slate-500">
                {viewMode === 'list' 
                  ? 'Daftar seluruh kurikulum kompetensi, durasi jam, dan penggunaannya pada jabatan'
                  : 'Lengkapi informasi kurikulum standar pelatihan'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (viewMode !== 'list') setViewMode('list');
              else setIsManageModulesModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {viewMode === 'list' ? (
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama modul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden"
                >
                  <option value="All">Semua Kategori ({trainingModules.length})</option>
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  onClick={() => openExportImportModal('training_modules', 'export')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                  title="Ekspor Katalog Modul Pelatihan ke Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={() => openExportImportModal('training_modules', 'import')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                  title="Impor Modul Pelatihan dari Excel / CSV"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Import</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Modul</span>
                </button>
              </div>
            </div>

            {/* Modules Table / Cards */}
            <div className="space-y-2 pt-1">
              {filteredModules.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  Tidak ada modul pelatihan yang cocok dengan kriteria pencarian.
                </div>
              ) : (
                filteredModules.map((mod) => {
                  // Count positions requiring this module
                  const reqPositionsCount = Object.values(tnaRules).filter((r) =>
                    r.requiredTrainingIds?.includes(mod.id)
                  ).length;

                  // Count completed employees
                  const completedEmpsCount = employees.filter(
                    (e) => e.trainings[mod.id]?.status === 'done'
                  ).length;

                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          {mod.code}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {mod.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                              {mod.category}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {mod.description || 'Tidak ada deskripsi modul.'}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {mod.durationHours} Jam
                            </span>
                            <span>•</span>
                            <span>Wajib di {reqPositionsCount} Posisi</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{completedEmpsCount} Karyawan Lulus</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleOpenEdit(mod)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Modul"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {deletingId === mod.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                            <span className="text-[10px] font-bold text-rose-700 px-1">Hapus?</span>
                            <button
                              onClick={() => handleConfirmDelete(mod.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-1.5 py-0.5 text-slate-600 text-[10px] font-medium"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(mod.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Modul"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        ) : (
          /* Form Mode: Add or Edit */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Modul</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono text-center focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Kategori Pelatihan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TrainingCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition font-medium"
                >
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Modul Pelatihan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Digital Transformation & Strategic Execution"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Durasi Pelatihan (Jam)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lembaga / Provider</label>
                <input
                  type="text"
                  placeholder="Contoh: Internal Academy / BNSP"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deskripsi & Target Kompetensi</label>
              <textarea
                rows={3}
                placeholder="Jelaskan silabus singkat dan target pencapaian peserta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            {/* Form Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs active:scale-98 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{viewMode === 'add' ? 'Simpan Modul Baru' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer (When in List Mode) */}
        {viewMode === 'list' && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Total: <strong>{trainingModules.length} Modul Terdaftar</strong></span>
            <button
              onClick={() => setIsManageModulesModalOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
