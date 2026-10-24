import { Booking } from '../types';
import { parseAppointmentDateTime } from './whatsappReminderService';

const STORAGE_KEY = 'bz_browser_notification_logs';

interface NotificationLog {
  bookingId: string;
  triggered24h: boolean;
  triggered1h: boolean;
}

function getNotificationLogs(): NotificationLog[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function saveNotificationLogs(logs: NotificationLog[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {
    // Ignore storage issues
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export function processBrowserNotifications(bookings: Booking[]) {
  const logs = getNotificationLogs();
  const now = new Date();

  bookings.forEach((booking) => {
    if (booking.status !== 'confirmed' && booking.status !== 'advance_paid') return;

    const apptDate = parseAppointmentDateTime(booking.appointmentDate, booking.appointmentTime);
    if (!apptDate) return;

    let log = logs.find((l) => l.bookingId === booking.id) || {
      bookingId: booking.id,
      triggered24h: false,
      triggered1h: false,
    };

    const timeUntilAppt = apptDate.getTime() - now.getTime();
    let updated = false;
    
    // 24 hours check
    if (!log.triggered24h && timeUntilAppt <= 24 * 60 * 60 * 1000 && timeUntilAppt > 0) {
      sendBrowserNotification(
        'Upcoming Appointment',
        `Reminder: Your appointment at ${booking.parlourName} is in 24 hours.`
      );
      log.triggered24h = true;
      updated = true;
    }

    // 1 hour check
    if (!log.triggered1h && timeUntilAppt <= 1 * 60 * 60 * 1000 && timeUntilAppt > 0) {
      sendBrowserNotification(
        'Upcoming Appointment',
        `Reminder: Your appointment at ${booking.parlourName} is in 1 hour.`
      );
      log.triggered1h = true;
      updated = true;
    }

    if (updated) {
      const logIdx = logs.findIndex(l => l.bookingId === booking.id);
      if (logIdx >= 0) logs[logIdx] = log;
      else logs.push(log);
      saveNotificationLogs(logs);
    }
  });
}
