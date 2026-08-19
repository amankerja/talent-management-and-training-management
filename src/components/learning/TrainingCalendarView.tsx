import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../../context/WorkforceContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Layers,
  MapPin,
  Clock,
  UserCheck,
  Users,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Check,
  Trash2,
  CalendarCheck,
  ListFilter,
  Eye,
  Info,
  Send,
  Building2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { TrainingEvent, AnnualTrainingPlanItem, TrainingReminder, Department, TrainingCategory } from '../../types';
import { DEPARTMENTS, TRAINING_CATEGORIES } from '../../data/mockData';
import { EventDetailModal } from './EventDetailModal';
import { AddReminderModal } from './AddReminderModal';
import { generateMultipleEventsICS, downloadICSFile } from '../../utils/calendarExport';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface TrainingCalendarViewProps {
  onOpenAddEventModal: (initialDate?: string) => void;
}

export const TrainingCalendarView: React.FC<TrainingCalendarViewProps> = ({
  onOpenAddEventModal
}) => {
  const {
    trainingEvents,
    annualTrainingPlans,
    trainingReminders,
    employees,
    trainers,
    toggleTrainingReminder,
    deleteTrainingReminder,
    addNotification,
    addToast
  } = useWorkforce();

  // Current viewed month and year (Default to March 2026 for rich mock data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 2, 1)); // March 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showATPForecast, setShowATPForecast] = useState<boolean>(true);
  const [showReminders, setShowReminders] = useState<boolean>(true);

  // Modals & Selected Event
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState<string>('');

  // Year and Month getters
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    // Jump to current active timeline month (March 2026)
    setCurrentDate(new Date(2026, 2, 1));
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return trainingEvents.filter((evt) => {
      const matchSearch =
        searchQuery === '' ||
        evt.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.trainerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' ||
        evt.moduleName.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchStatus =
        selectedStatus === 'All' || evt.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [trainingEvents, searchQuery, selectedCategory, selectedStatus]);

  // Calendar Grid Calculation (Days of month including padding for Monday start)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday as day 0 (Sunday is 6)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysArray: {
      date: Date;
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: TrainingEvent[];
      atpPlans: AnnualTrainingPlanItem[];
      reminders: TrainingReminder[];
    }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dateObj = new Date(currentYear, currentMonth - 1, dayNum);
      const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      daysArray.push({
        date: dateObj,
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        events: [],
        atpPlans: [],
        reminders: []
      });
    }

    // Current month days
    const todayStr = '2026-03-24'; // System simulation today
    const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthShort = monthShortNames[currentMonth];

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Events on this date (start <= date <= end)
      const dayEvents = filteredEvents.filter((evt) => {
        return dateString >= evt.startDate && dateString <= evt.endDate;
      });

      // ATP Forecast items on 1st day of month
      const dayATPPlans = (showATPForecast && d === 1)
        ? annualTrainingPlans.filter((p) => p.plannedMonth === currentMonthShort && (selectedDept === 'All' || p.department === selectedDept))
        : [];

      // Reminders on this exact date
      const dayReminders = showReminders
        ? trainingReminders.filter((r) => r.targetDate === dateString)
        : [];

      daysArray.push({
        date: dateObj,
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        events: dayEvents,
        atpPlans: dayATPPlans,
        reminders: dayReminders
      });
    }

    // Next month padding days to complete full grid (multiple of 7)
    const remainingDays = (7 - (daysArray.length % 7)) % 7;
    for (let n = 1; n <= remainingDays; n++) {
      const dateObj = new Date(currentYear, currentMonth + 1, n);
      const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      daysArray.push({
        date: dateObj,
        dateString,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: false,
        events: [],
        atpPlans: [],
        reminders: []
      });
    }

    return daysArray;
  }, [currentYear, currentMonth, filteredEvents, annualTrainingPlans, trainingReminders, showATPForecast, showReminders, selectedDept]);

  // Automated Smart Reminders (Upcoming batches D-7, low quota warnings, cert expiring)
  const smartAlerts = useMemo(() => {
    const alerts: {
      id: string;
      type: 'upcoming_batch' | 'low_quota' | 'cert_expiring';
      severity: 'Critical' | 'Warning' | 'Info';
      title: string;
      description: string;
      actionLabel?: string;
      eventId?: string;
      onAction?: () => void;
    }[] = [];

    // 1. Upcoming Batches (Scheduled in March/April 2026)
    filteredEvents.forEach((evt) => {
      if (evt.status === 'Scheduled') {
        const enrolled = evt.attendees?.length || 0;
        if (enrolled < (evt.quota * 0.5)) {
          alerts.push({
            id: `alert-quota-${evt.id}`,
            type: 'low_quota',
            severity: 'Warning',
            title: `⚠️ Kuota Rendah: ${evt.eventName}`,
            description: `Baru terisi ${enrolled}/${evt.quota} kursi (${Math.round((enrolled / evt.quota) * 100)}%). Tanggal mulai: ${evt.startDate}.`,
            actionLabel: 'Buka Batch & Daftarkan',
            eventId: evt.id,
            onAction: () => {
              setSelectedEvent(evt);
              setIsEventDetailOpen(true);
            }
          });
        }

        // H-3 / Upcoming notice
        alerts.push({
          id: `alert-upcoming-${evt.id}`,
          type: 'upcoming_batch',
          severity: 'Info',
          title: `🔔 Batch Mendatang: ${evt.eventName}`,
          description: `Jadwal: ${evt.startDate} s/d ${evt.endDate} di ${evt.location}. Instruktur: ${evt.trainerName}.`,
          actionLabel: 'Kirim Notifikasi',
          eventId: evt.id,
          onAction: () => {
            addNotification({
              category: 'training_event',
              severity: 'yellow',
              title: `Pengingat Pelatihan: ${evt.eventName}`,
              message: `Batch "${evt.batchCode}" akan berlangsung pada ${evt.startDate} di ${evt.location}.`,
              targetTab: 'learning-training',
              targetSubTab: 'calendar',
              actionLabel: 'Lihat Detail',
              isRead: false
            });
          }
        });
      }
    });

    return alerts;
  }, [filteredEvents, addNotification]);

  // Export All ICS
  const handleExportAllICS = () => {
    const icsContent = generateMultipleEventsICS(trainingEvents, 'Jadwal Pelatihan & Batch WorkforceOS');
    downloadICSFile(icsContent, `jadwal-pelatihan-${currentYear}.ics`);
    addToast('Kalender Pelatihan (.ics) Berhasil Diekspor', 'File kalender lengkap siap diimpor ke Google Calendar / Outlook.', 'success');
  };

  // Open Event Modal
  const handleEventClick = (event: TrainingEvent) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  // Category Color Badges
  const getCategoryColor = (moduleName: string) => {
    if (moduleName.includes('POP') || moduleName.includes('K3') || moduleName.includes('Safety') || moduleName.includes('Investigation')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    }
    if (moduleName.includes('Leadership') || moduleName.includes('BLP') || moduleName.includes('Coaching')) {
      return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
    }
    if (moduleName.includes('Maintenance') || moduleName.includes('Vibration') || moduleName.includes('Engineering')) {
      return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
    }
    if (moduleName.includes('Power BI') || moduleName.includes('Analytics') || moduleName.includes('Digital')) {
      return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    }
    return 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100';
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto font-sans">
      {/* Top Banner / Calendar Summary Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Kalender Pelatihan & Jadwal Interaktif</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {trainingEvents.length} Batch Terjadwal
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Visualisasi terpadu jadwal pelaksanaan kelas, ketersediaan ruangan, pemenuhan kuota peserta, dan pengingat (reminders).
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenAddEventModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Jadwalkan Batch Baru</span>
          </button>

          <button
            onClick={() => {
              setSelectedDateForNew(new Date().toISOString().split('T')[0]);
              setIsAddReminderOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Tambah Reminder</span>
          </button>

          <button
            onClick={handleExportAllICS}
            title="Ekspor seluruh jadwal ke file iCalendar (.ics)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Ekspor (.ics)</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left/Center Calendar + Right Reminders Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* Left/Center Area: Calendar Matrix (3 Columns on XL) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Calendar Controls & Navigation Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Month Navigator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                  <button
                    onClick={handlePrevMonth}
                    title="Bulan Sebelumnya"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={handleNextMonth}
                    title="Bulan Berikutnya"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentDate(new Date(currentYear, Number(e.target.value), 1))}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentMonth, 1))}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    viewMode === 'month'
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kalender Bulan
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Jadwal Mingguan
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    viewMode === 'agenda'
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Linimasa
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* Search Box */}
              <div className="relative flex-1 min-w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama event, instruktur, lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="All">Semua Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="All">Semua Kategori</option>
                {TRAINING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="All">Semua Dept</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Toggles */}
              <div className="flex items-center gap-3 ml-auto text-[11px] text-slate-600 font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showATPForecast}
                    onChange={(e) => setShowATPForecast(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Rencana ATP</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showReminders}
                    onChange={(e) => setShowReminders(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Reminder</span>
                </label>
              </div>
            </div>
          </div>

          {/* 1. MONTH VIEW MATRIX */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Day Header */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2.5">
                {DAY_NAMES.map((day, idx) => (
                  <div key={idx} className={idx >= 5 ? 'text-rose-500' : ''}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                {calendarDays.map((day, index) => {
                  const isCurrent = day.isCurrentMonth;
                  const isToday = day.isToday;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isCurrent) {
                          setSelectedDateForNew(day.dateString);
                        }
                      }}
                      className={`min-h-28 sm:min-h-32 p-1.5 sm:p-2 transition-colors flex flex-col justify-between group ${
                        !isCurrent
                          ? 'bg-slate-50/50 text-slate-300'
                          : isToday
                          ? 'bg-blue-50/20'
                          : 'bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : isCurrent
                              ? 'text-slate-800'
                              : 'text-slate-300'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {isCurrent && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAddEventModal(day.dateString);
                              }}
                              title={`Jadwalkan batch pada tanggal ${day.dateString}`}
                              className="p-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDateForNew(day.dateString);
                                setIsAddReminderOpen(true);
                              }}
                              title={`Tambah reminder pada ${day.dateString}`}
                              className="p-1 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-500 transition-colors"
                            >
                              <Bell className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Day Content: Event Chips & Reminders */}
                      <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-24 custom-scrollbar">
                        {/* 1. Scheduled Events */}
                        {day.events.map((evt) => {
                          const isStartDay = day.dateString === evt.startDate;
                          const enrolled = evt.attendees?.length || 0;

                          return (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(evt);
                              }}
                              title={`${evt.eventName} | ${evt.location} | ${evt.trainerName}`}
                              className={`p-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all shadow-2xs hover:scale-[1.02] flex flex-col gap-0.5 ${getCategoryColor(
                                evt.moduleName
                              )}`}
                            >
                              <div className="flex items-center justify-between gap-1 leading-tight">
                                <span className="font-bold truncate">{evt.eventName}</span>
                                <span className="font-mono text-[9px] px-1 rounded bg-white/70 text-slate-700 shrink-0">
                                  {enrolled}/{evt.quota}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-500">
                                <span className="truncate flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {evt.location}
                                </span>
                                <span className={`px-1 rounded font-bold ${
                                  evt.status === 'Completed' ? 'text-emerald-700' : 'text-blue-700'
                                }`}>
                                  {evt.status === 'Completed' ? '✓ Lulus' : 'Jadwal'}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* 2. Reminders on Date */}
                        {day.reminders.map((rem) => (
                          <div
                            key={rem.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrainingReminder(rem.id);
                            }}
                            title={`Reminder: ${rem.title} (Klik untuk tandai selesai)`}
                            className={`p-1 rounded-md border text-[10px] flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                              rem.isCompleted
                                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                                : rem.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <span className="truncate flex items-center gap-1 font-semibold">
                              <Bell className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                              {rem.title}
                            </span>
                            <span className="text-[8px] uppercase font-bold shrink-0">
                              {rem.isCompleted ? '✓' : rem.priority}
                            </span>
                          </div>
                        ))}

                        {/* 3. ATP Monthly Forecast Plan (on 1st of month) */}
                        {day.atpPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className="p-1 rounded-md border border-indigo-200 bg-indigo-50/70 text-indigo-900 text-[10px] flex items-center justify-between"
                            title={`Target ATP: ${plan.moduleName} (${plan.targetParticipantsCount} HC)`}
                          >
                            <span className="truncate font-semibold flex items-center gap-1">
                              <CalendarCheck className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                              ATP: {plan.moduleName}
                            </span>
                            <span className="font-mono text-[9px] text-indigo-700 font-bold shrink-0">
                              {plan.targetParticipantsCount} HC
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Quick Indicator */}
                      <div className="text-[9px] text-slate-400 text-right">
                        {day.events.length > 0 && `${day.events.length} Event`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. WEEK / SCHEDULE VIEW */}
          {viewMode === 'week' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800">
                  Agenda Pelatihan Terjadwal Bulan {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <span className="text-xs text-slate-400">
                  Total {filteredEvents.length} Batch Terjadwal
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleEventClick(evt)}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {evt.batchCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{evt.eventName}</h4>
                        <span className="text-xs text-slate-500">{evt.moduleName}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        evt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {evt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>{evt.startDate} s/d {evt.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate">{evt.trainerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{evt.attendees?.length || 0} / {evt.quota} Peserta</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. AGENDA / TIMELINE LIST VIEW */}
          {viewMode === 'agenda' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-mono text-center shrink-0 border border-blue-200">
                        <span className="text-[10px] uppercase font-bold block">Tgl</span>
                        <span className="text-base font-black">{evt.startDate.split('-')[2]}</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{evt.eventName}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-md bg-slate-100 text-slate-700">
                            {evt.batchCode}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.durationHours} Jam
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {evt.trainerName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleEventClick(evt)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Buka Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Smart Alerts & Reminders Hub (1 Column on XL) */}
        <div className="space-y-4">
          {/* Smart Alerts Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900">Smart Alert & Kesiapan Batch</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {smartAlerts.length}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {smartAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    alert.severity === 'Critical'
                      ? 'bg-rose-50/60 border-rose-200'
                      : alert.severity === 'Warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-blue-50/60 border-blue-200'
                  }`}
                >
                  <span className="font-bold text-slate-900 block">{alert.title}</span>
                  <p className="text-[11px] text-slate-600 leading-snug">{alert.description}</p>
                  {alert.actionLabel && (
                    <button
                      onClick={alert.onAction}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                    >
                      {alert.actionLabel} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Reminders List */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Daftar Reminder Pelatihan</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedDateForNew(new Date().toISOString().split('T')[0]);
                  setIsAddReminderOpen(true);
                }}
                className="p-1 rounded-md text-blue-600 hover:bg-blue-50 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {trainingReminders.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  Belum ada reminder yang dibuat.
                </div>
              ) : (
                trainingReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                      rem.isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={rem.isCompleted}
                          onChange={() => toggleTrainingReminder(rem.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span
                            className={`font-bold block text-slate-900 leading-tight ${
                              rem.isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {rem.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                            📅 {rem.targetDate} • {rem.targetRole || 'Semua'}
                          </span>
                        </div>
                      </label>

                      <button
                        onClick={() => deleteTrainingReminder(rem.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Hapus Reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {rem.notes && (
                      <p className="text-[11px] text-slate-500 pl-6 leading-tight">
                        {rem.notes}
                      </p>
                    )}

                    {!rem.isCompleted && (
                      <div className="pl-6 pt-1">
                        <button
                          onClick={() => {
                            addNotification({
                              category: 'training_event',
                              severity: rem.priority === 'Critical' ? 'red' : 'yellow',
                              title: `Reminder: ${rem.title}`,
                              message: `Target tanggal: ${rem.targetDate}. ${rem.notes || ''}`,
                              targetTab: 'learning-training',
                              targetSubTab: 'calendar',
                              actionLabel: 'Buka Kalender',
                              isRead: false
                            });
                          }}
                          className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Kirim ke Header Bell</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isEventDetailOpen && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={isEventDetailOpen}
          onClose={() => setIsEventDetailOpen(false)}
        />
      )}

      {isAddReminderOpen && (
        <AddReminderModal
          isOpen={isAddReminderOpen}
          onClose={() => setIsAddReminderOpen(false)}
          initialDate={selectedDateForNew}
        />
      )}
    </div>
  );
};
