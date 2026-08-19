import { TrainingEvent } from '../types';

/**
 * Formats a date string (YYYY-MM-DD) into iCal date format (YYYYMMDDTHHmmSSZ or YYYYMMDD)
 */
function formatICalDate(dateStr: string, isAllDay: boolean = true): string {
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (isAllDay) {
    return clean.slice(0, 8);
  }
  return `${clean.slice(0, 8)}T090000Z`;
}

/**
 * Escapes characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an iCalendar (.ics) string for a single TrainingEvent
 */
export function generateSingleEventICS(event: TrainingEvent): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const start = formatICalDate(event.startDate);
  // iCal DTEND for all-day is exclusive, so add 1 day or use same date
  const end = formatICalDate(event.endDate);

  const description = [
    `Modul: ${event.moduleName}`,
    `Batch: ${event.batchCode}`,
    `Instruktur: ${event.trainerName} (${event.trainerType})`,
    `Lokasi/Ruang: ${event.location}`,
    `Durasi: ${event.durationHours} Jam`,
    `Kuota: ${event.quota} Peserta`,
    `Status: ${event.status}`,
    `Peserta Terdaftar: ${event.attendees?.length || 0} orang`
  ].join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WorkforceOS//Corporate Training System//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id || Date.now()}@workforceos.id`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICalText(event.eventName)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeICalText(event.location)}`,
    `STATUS:${event.status === 'Completed' ? 'CONFIRMED' : 'CONFIRMED'}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pengingat Pelatihan WorkforceOS',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Generates an iCalendar (.ics) string for multiple TrainingEvents
 */
export function generateMultipleEventsICS(events: TrainingEvent[], calendarName: string = 'Jadwal Pelatihan WorkforceOS'): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const eventsICS = events.map((event) => {
    const start = formatICalDate(event.startDate);
    const end = formatICalDate(event.endDate);

    const description = [
      `Modul: ${event.moduleName}`,
      `Batch: ${event.batchCode}`,
      `Instruktur: ${event.trainerName}`,
      `Lokasi: ${event.location}`,
      `Durasi: ${event.durationHours} Jam | Kuota: ${event.quota} Peserta`
    ].join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${event.id}@workforceos.id`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeICalText(event.eventName)}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${escapeICalText(event.location)}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Pengingat Pelatihan',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WorkforceOS//Corporate Training System//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    eventsICS,
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers download of an .ics file in the browser
 */
export function downloadICSFile(icsContent: string, filename: string = 'jadwal-pelatihan.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates structured invitation broadcast message (for WhatsApp, Email, or Slack)
 */
export function generateWhatsAppInvitation(event: TrainingEvent): string {
  const startDateFormatted = new Date(event.startDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const endDateFormatted = new Date(event.endDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `📢 *UNDANGAN PELATIHAN KORPORAT - WORKFORCE OS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 *Program:* ${event.eventName}
🏷️ *Kode Batch:* ${event.batchCode}
📚 *Modul:* ${event.moduleName}

📅 *Tanggal:* ${startDateFormatted} s/d ${endDateFormatted}
⏰ *Durasi:* ${event.durationHours} Jam Pelatihan
📍 *Lokasi:* ${event.location}
👨‍🏫 *Instruktur:* ${event.trainerName} (${event.trainerType})
👥 *Kuota:* ${event.quota} Kursi (${event.attendees?.length || 0} Terdaftar)

📌 *Catatan Penting:*
1. Harap hadir 15 menit sebelum sesi dimulai.
2. Siapkan modul pra-baca dan perlengkapan safety (jika on-site).
3. Kelulusan akan otomatis menutup gap kompetensi di Profil 360 Anda.

_Informasi & Konfirmasi: Learning & Development Division_`;
}
