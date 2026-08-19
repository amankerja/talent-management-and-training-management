import React, { useState } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import { Bell, Calendar, X, AlertTriangle, CheckCircle2, Info, Sparkles, Send } from 'lucide-react';
import { TrainingReminder } from '../../types';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialEventId?: string;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialEventId
}) => {
  const {
    trainingEvents,
    addTrainingReminder,
    addNotification
  } = useWorkforce();

  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [eventId, setEventId] = useState(initialEventId || '');
  const [targetRole, setTargetRole] = useState<'Peserta' | 'Instruktur' | 'Panitia HR' | 'All'>('Panitia HR');
  const [priority, setPriority] = useState<'Critical' | 'Warning' | 'Info'>('Warning');
  const [notes, setNotes] = useState('');
  const [alsoSendNotification, setAlsoSendNotification] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedEvent = trainingEvents.find((evt) => evt.id === eventId);

    addTrainingReminder({
      eventId: eventId || undefined,
      eventName: selectedEvent?.eventName,
      title: title.trim(),
      targetDate,
      targetRole,
      priority,
      isCompleted: false,
      notes: notes.trim()
    });

    if (alsoSendNotification) {
      addNotification({
        category: 'training_event',
        severity: priority === 'Critical' ? 'red' : priority === 'Warning' ? 'yellow' : 'blue',
        title: `Reminder: ${title.trim()}`,
        message: `${selectedEvent ? `[${selectedEvent.eventName}] ` : ''}Jadwal: ${targetDate}. ${notes ? `Catatan: ${notes}` : ''}`,
        targetTab: 'learning-training',
        targetSubTab: 'calendar',
        actionLabel: 'Buka Kalender',
        isRead: false
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tambah Reminder & Pengingat Pelatihan</h3>
              <p className="text-[11px] text-slate-500">Jadwalkan pengingat otomatis untuk event, instruktur, atau peserta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Reminder / Pengingat *</label>
            <input
              type="text"
              placeholder="Contoh: Konfirmasi kehadiran instruktur & kirim modul pra-baca"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengingat *</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Critical">🔴 Kritis (Critical / Mendesak)</option>
                <option value="Warning">🟡 Peringatan (Warning / Penting)</option>
                <option value="Info">🔵 Informasi (Info / Rutin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hubungkan ke Event (Opsional)</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 truncate"
              >
                <option value="">-- Tanpa Event Spesifik --</option>
                {trainingEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.batchCode} - {evt.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Sasaran</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Panitia HR">Panitia HR & Training Lead</option>
                <option value="Peserta">Peserta Pelatihan</option>
                <option value="Instruktur">Instruktur / Trainer</option>
                <option value="All">Semua Pihak Terkait</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan / Detail Instruksi</label>
            <textarea
              rows={3}
              placeholder="Tuliskan detail tindakan, perlengkapan yang perlu disiapkan, atau tautan briefing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Broadcast Notifikasi Langsung</span>
                <span className="text-[10px] text-slate-500">Kirimkan notifikasi ke lonceng Header sistem secara real-time</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={alsoSendNotification}
              onChange={(e) => setAlsoSendNotification(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Simpan Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
