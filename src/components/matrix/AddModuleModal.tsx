import React, { useState } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { X, Save, BookOpen, Clock } from 'lucide-react';
import { TrainingModule, TrainingCategory } from '../../types';
import { TRAINING_CATEGORIES } from '../../data/mockData';

export const AddModuleModal: React.FC = () => {
  const { isAddModuleModalOpen, setIsAddModuleModalOpen, addTrainingModule, addToast } = useWorkforce();

  const [code, setCode] = useState(`T${Math.floor(10 + Math.random() * 90)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TrainingCategory>('Leadership');
  const [provider, setProvider] = useState('Corporate L&D Academy');
  const [durationHours, setDurationHours] = useState(16);
  const [description, setDescription] = useState('');

  if (!isAddModuleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newModule: TrainingModule = {
      id: `T_${Date.now()}`,
      code,
      name,
      category,
      durationHours: Number(durationHours),
      provider: provider || 'Corporate L&D Academy',
      description: description || 'Pelatihan pengembangan kompetensi standar.'
    };

    addTrainingModule(newModule);
    setIsAddModuleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-auto animate-fade-in">
        
        {/* Clean Soft Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tambah Modul Pelatihan TNA</h3>
              <p className="text-xs text-slate-500">Daftarkan kurikulum atau sertifikasi kompetensi baru</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModuleModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-medium text-slate-700 mb-1">Kode Modul (Contoh: MOD-ENG-04)</label>
            <input
              type="text"
              required
              placeholder="MOD-..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-500 focus:outline-none transition uppercase"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Nama Modul Pelatihan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemeliharaan Sistem Hidrolik Lanjutan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kategori Modul</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TrainingCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              >
                {TRAINING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Lembaga / Provider</label>
              <input
                type="text"
                required
                placeholder="Internal / Lembaga Sertifikasi"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Durasi Pelatihan (Jam)</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="200"
                required
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Deskripsi & Sasaran Kompetensi</label>
            <textarea
              rows={3}
              placeholder="Jelaskan silabus singkat dan target pencapaian peserta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModuleModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs active:scale-98 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Modul</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
