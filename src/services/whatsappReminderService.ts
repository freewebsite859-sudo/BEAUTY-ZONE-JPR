import { Booking } from '../types';

export interface WhatsAppReminderLog {
  id: string;
  bookingId: string;
  customerName: string;
  customerWhatsapp: string;
  parlourName: string;
  appointmentDate: string; // DD/MM/YYYY
  appointmentTime: string; // e.g., '10:30 AM'
  scheduledTimeIso: string; // ISO string when 2h reminder is due
  sentAtIso: string | null; // ISO string when sent
  status: 'scheduled' | 'sent' | 'failed';
  messageText: string;
}

const STORAGE_KEY = 'bz_whatsapp_reminder_logs';

export function getReminderLogs(): WhatsAppReminderLog[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function saveReminderLogs(logs: WhatsAppReminderLog[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Parses DD/MM/YYYY + '10:30 AM' or '02:15 PM' into a Date object.
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);

    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = timeStr.trim().match(timeRegex);
    if (!match) return new Date(year, month, day, 10, 0); // Default fallback 10:00 AM

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes);
  } catch {
    return null;
  }
}

/**
 * Calculates 2 hours prior to the appointment date/time.
 */
export function calculate2HourReminderTime(dateStr: string, timeStr: string): Date {
  const apptDate = parseAppointmentDateTime(dateStr, timeStr);
  if (!apptDate) return new Date();
  
  // Subtract 2 hours (2 * 60 * 60 * 1000 ms)
  return new Date(apptDate.getTime() - 2 * 60 * 60 * 1000);
}

/**
 * Formats a WhatsApp reminder message body according to Indian English luxury standards.
 */
export function formatWhatsAppReminderMessage(booking: Booking): string {
  const serviceList = booking.services.map((s) => `• ${s.name}`).join('\n');
  const balanceRupees = Math.ceil(booking.balancePaise / 100);

  return `✨ *BeautyZone Appointment Reminder* ✨

Hello *${booking.customerName}*,

This is an automated 2-hour reminder for your upcoming pampering session at *${booking.parlourName}*!

📅 *Date:* ${booking.appointmentDate}
⏰ *Time:* ${booking.appointmentTime} (in 2 hours)
📍 *Address:* ${booking.parlourAddress}, ${booking.parlourCity}

*Services Reserved:*
${serviceList}

💳 *Booking Status:*
• Booking Reference: *#${booking.id}*
• 25% Advance Paid: *₹${Math.ceil(booking.advancePaise / 100)}*
• Remaining Balance Payable at Salon: *₹${balanceRupees}*

Please arrive 10 minutes prior to your appointment time. For any reschedule request, contact the salon directly at ${booking.parlourName}.

Thank you for booking through BeautyZone! 🌸`;
}

/**
 * Generates an active WhatsApp click-to-chat deep link (`https://wa.me/91...`)
 */
export function generateWhatsAppDeepLink(phone: string, text: string): string {
  // Clean phone string to numeric digits only
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Evaluates active confirmed bookings and dispatches automated 2-hour WhatsApp reminders.
 */
export function processAutomatedWhatsAppReminders(
  bookings: Booking[],
  onReminderSent?: (log: WhatsAppReminderLog) => void
): WhatsAppReminderLog[] {
  const existingLogs = getReminderLogs();
  const now = new Date();
  let updated = false;

  const currentLogs = [...existingLogs];

  bookings.forEach((booking) => {
    // Only remind for confirmed or advance_paid bookings
    if (booking.status !== 'confirmed' && booking.status !== 'advance_paid') return;

    const reminderTime = calculate2HourReminderTime(booking.appointmentDate, booking.appointmentTime);
    const logId = `rem-2h-${booking.id}`;

    let log = currentLogs.find((l) => l.bookingId === booking.id);

    if (!log) {
      const msgText = formatWhatsAppReminderMessage(booking);
      log = {
        id: logId,
        bookingId: booking.id,
        customerName: booking.customerName,
        customerWhatsapp: booking.customerWhatsapp,
        parlourName: booking.parlourName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        scheduledTimeIso: reminderTime.toISOString(),
        sentAtIso: null,
        status: 'scheduled',
        messageText: msgText,
      };
      currentLogs.push(log);
      updated = true;
    }

    // Check if current time is within or past the 2-hour reminder window and log is not yet marked sent
    if (log.status === 'scheduled') {
      const apptTime = parseAppointmentDateTime(booking.appointmentDate, booking.appointmentTime);
      
      // Trigger if current time is within 2 hours of appointment (and appointment isn't older than 24 hours)
      if (apptTime && now >= reminderTime && now <= new Date(apptTime.getTime() + 24 * 60 * 60 * 1000)) {
        log.status = 'sent';
        log.sentAtIso = now.toISOString();
        updated = true;

        if (onReminderSent) {
          onReminderSent(log);
        }
      }
    }
  });

  if (updated) {
    saveReminderLogs(currentLogs);
  }

  return currentLogs;
}

/**
 * Manually trigger or re-send a 2-hour WhatsApp reminder for testing/verification.
 */
export function triggerManualWhatsAppReminder(
  booking: Booking,
  onSent?: (log: WhatsAppReminderLog) => void
): WhatsAppReminderLog {
  const currentLogs = getReminderLogs();
  const msgText = formatWhatsAppReminderMessage(booking);
  const now = new Date();

  const existingIndex = currentLogs.findIndex((l) => l.bookingId === booking.id);
  const newLog: WhatsAppReminderLog = {
    id: `rem-2h-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    customerName: booking.customerName,
    customerWhatsapp: booking.customerWhatsapp,
    parlourName: booking.parlourName,
    appointmentDate: booking.appointmentDate,
    appointmentTime: booking.appointmentTime,
    scheduledTimeIso: calculate2HourReminderTime(booking.appointmentDate, booking.appointmentTime).toISOString(),
    sentAtIso: now.toISOString(),
    status: 'sent',
    messageText: msgText,
  };

  if (existingIndex >= 0) {
    currentLogs[existingIndex] = newLog;
  } else {
    currentLogs.push(newLog);
  }

  saveReminderLogs(currentLogs);

  if (onSent) {
    onSent(newLog);
  }

  return newLog;
}
