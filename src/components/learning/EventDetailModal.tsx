import React, { useState } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Calendar,
  Layers,
  MapPin,
  Clock,
  UserCheck,
  Users,
  DollarSign,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  Download,
  Bell,
  Check,
  Copy,
  ExternalLink,
  Edit2,
  Save,
  Plus
} from 'lucide-react';
import { TrainingEvent } from '../../types';
import { generateSingleEventICS, downloadICSFile, generateWhatsAppInvitation } from '../../utils/calendarExport';

interface EventDetailModalProps {
  event: TrainingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const {
    employees,
    updateTrainingEvent,
    enrollEmployeeToBatch,
    completeAttendeeTraining,
    addNotification,
    addToast
  } = useWorkforce();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editLocation, setEditLocation] = useState(event?.location || '');
  const [editStartDate, setEditStartDate] = useState(event?.startDate || '');
  const [editEndDate, setEditEndDate] = useState(event?.endDate || '');
  const [editTrainer, setEditTrainer] = useState(event?.trainerName || '');
  const [editQuota, setEditQuota] = useState(event?.quota || 20);

  if (!isOpen || !event) return null;

  const currentEnrolledCount = event.attendees?.length || event.participantIds?.length || 0;
  const quotaPercentage = Math.min(100, Math.round((currentEnrolledCount / (event.quota || 1)) * 100));

  const handleEnroll = () => {
    if (!selectedEmpId) return;
    enrollEmployeeToBatch(event.id, selectedEmpId);
    setSelectedEmpId('');
  };

  const handleSaveEdit = () => {
    updateTrainingEvent({
      ...event,
      location: editLocation,
      startDate: editStartDate,
      endDate: editEndDate,
      trainerName: editTrainer,
      quota: Number(editQuota)
    });
    setIsEditing(false);
  };

  const handleDownloadICS = () => {
    const ics = generateSingleEventICS(event);
    downloadICSFile(ics, `${event.batchCode.toLowerCase()}-schedule.ics`);
    addToast('File Kalender (.ics) Diunduh', 'Buka file untuk menyinkronkan ke Google Calendar / Outlook.', 'success');
  };

  const handleCopyInvite = () => {
    const text = generateWhatsAppInvitation(event);
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
    addToast('Teks Undangan Disalin', 'Siap dibagikan melalui WhatsApp, Email, atau Teams.', 'info');
  };

  const handleBroadcastReminder = (type: 'H-3' | 'H-1' | 'Hari-H') => {
    addNotification({
      category: 'training_event',
      severity: type === 'Hari-H' ? 'red' : 'yellow',
      title: `Pengingat ${type}: ${event.eventName}`,
      message: `Pelatihan "${event.eventName}" (${event.batchCode}) dijadwalkan pada ${event.startDate} di ${event.location}. Total ${currentEnrolledCount} peserta terdaftar.`,
      targetTab: 'learning-training',
      targetSubTab: 'calendar',
      actionLabel: 'Buka Jadwal',
      isRead: false
    });
  };

  const statusColors: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    Registration: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/90 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {event.batchCode}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[event.status] || 'bg-slate-100 text-slate-700'}`}>
                {event.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">Modul: {event.moduleId}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {event.eventName}
            </h2>
            <p className="text-xs text-slate-500">{event.moduleName}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Edit Data Jadwal"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Editing Mode Form */}
          {isEditing && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  Mode Edit Parameter Batch Pelatihan
                </span>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lokasi / Ruangan</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instruktur / Trainer</label>
                  <input
                    type="text"
                    value={editTrainer}
                    onChange={(e) => setEditTrainer(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Periode Jadwal
              </span>
              <div className="font-bold text-slate-900 text-xs mt-1">
                {event.startDate}
              </div>
              <span className="text-[10px] text-slate-400">s/d {event.endDate}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Lokasi / Ruang
              </span>
              <div className="font-bold text-slate-900 text-xs mt-1 truncate" title={event.location}>
                {event.location}
              </div>
              <span className="text-[10px] text-slate-400">{event.durationHours} Jam Pelatihan</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Instruktur
              </span>
              <div className="font-bold text-slate-900 text-xs mt-1 truncate" title={event.trainerName}>
                {event.trainerName}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{event.trainerType}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Total Biaya
              </span>
              <div className="font-bold font-mono text-slate-900 text-xs mt-1">
                Rp {(event.costIDR / 1000000).toFixed(0)} Jt
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Anggaran Disetujui</span>
            </div>
          </div>

          {/* Quota & Capacity Status */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Kapasitas & Kuota Peserta</span>
              </div>
              <span className="font-bold text-slate-900">
                {currentEnrolledCount} / {event.quota} Peserta ({quotaPercentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  quotaPercentage >= 100
                    ? 'bg-emerald-600'
                    : quotaPercentage >= 50
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
          </div>

          {/* Attendees List & Direct Enrollment */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Peserta Terdaftar ({event.attendees?.length || 0})
              </h4>

              {/* Quick Enroll Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 max-w-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="">➕ Pilih Karyawan untuk Didaftarkan...</option>
                  {employees
                    .filter((emp) => !event.attendees?.some((a) => a.employeeId === emp.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} - {emp.jobTitle})
                      </option>
                    ))}
                </select>

                <button
                  onClick={handleEnroll}
                  disabled={!selectedEmpId}
                  className="px-3 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Daftarkan
                </button>
              </div>
            </div>

            {(!event.attendees || event.attendees.length === 0) ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                Belum ada peserta yang didaftarkan ke batch ini. Pilih karyawan di atas untuk mendaftarkan peserta.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
                {event.attendees.map((att, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 block">{att.employeeName}</span>
                      <span className="text-[10px] text-slate-400">{att.department}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {att.status === 'Passed' ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            LULUS ({att.postTestScore || 90}/100)
                          </span>
                          {att.certificateNo && (
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                              {att.certificateNo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => completeAttendeeTraining(event.id, att.employeeId, { status: 'Passed', postTestScore: 92 })}
                          title="Luluskan peserta ini dan perbarui profil kompetensinya secara otomatis"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>⚡ Luluskan & Tutup Gap</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Reminder Dispatchers */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Kirim Pengingat Cepat (Instant Broadcast)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Kirimkan notifikasi pengingat ke lonceng Header untuk mengingatkan PIC dan peserta.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleBroadcastReminder('H-3')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                🔔 Kirim Pengingat H-3
              </button>
              <button
                onClick={() => handleBroadcastReminder('H-1')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                📢 Kirim Pengingat H-1
              </button>
              <button
                onClick={() => handleBroadcastReminder('Hari-H')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                ⚡ Alert Hari-H Sesi Dimulai
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadICS}
              title="Unduh jadwal format .ics untuk Google Calendar & Outlook"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor ke iCal / Google Calendar</span>
            </button>

            <button
              onClick={handleCopyInvite}
              title="Salin format pesan undangan WhatsApp / Email"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Undangan WhatsApp</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextStatus = 
                  event.status === 'Scheduled' ? 'In Progress' :
                  event.status === 'In Progress' ? 'Completed' : 'Scheduled';
                updateTrainingEvent({ ...event, status: nextStatus as any });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Ubah Status ({event.status === 'Scheduled' ? '▶ Mulai Sesi' : event.status === 'In Progress' ? '✓ Selesaikan Batch' : 'Reset ke Scheduled'})</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
