// SRC: Design.md §4.5A, 00_MASTER §7 row 6, PRD §B4
// Mock data service for real-time staff availability based on salon operating hours

import { StaffMember, Parlour, Booking } from '../types';

export type AvailabilityStatus =
  | 'available_now'
  | 'in_session'
  | 'short_break'
  | 'fully_booked_today'
  | 'on_leave'
  | 'salon_closed';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "11:30 AM"
  timeMinutes: number; // minutes from midnight (e.g. 690)
  status: 'available' | 'in_session' | 'booked' | 'past' | 'break';
  clientHint?: string; // e.g. "Hair Spa & Scalp Therapy"
  durationMinutes: number;
}

export interface StaffAvailabilityResult {
  staffId: string;
  staffName: string;
  parlourId: string;
  parlourName: string;
  status: AvailabilityStatus;
  badgeText: string;
  badgeColor: string;
  dotColor: string;
  pulseAnimation: boolean;
  nextSlotDisplay: string; // e.g. "Today at 02:30 PM" or "Tomorrow at 10:00 AM"
  nextSlotTime: string; // e.g. "02:30 PM"
  nextSlotDateLabel: 'Today' | 'Tomorrow' | string;
  operatingHoursDisplay: string; // e.g. "10:00 AM – 08:30 PM IST"
  isAvailableToday: boolean;
  availableSlotCount: number;
  totalSlotsCount: number;
  currentSessionEndingInMinutes?: number;
  currentServiceInSession?: string;
  timeline: TimeSlot[];
  lastRefreshedAt: string;
}

/**
 * Helper to convert 12-hour time string ("10:30 AM" or "08:00 PM") into minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 600; // default 10:00 AM
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!match) return 600;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Helper to convert minutes from midnight back to 12-hour display string ("10:30 AM")
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60);
  let hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMins = String(mins).padStart(2, '0');
  return `${paddedHours}:${paddedMins} ${meridiem}`;
}

/**
 * Deterministic seed generator for realistic mock schedules based on staff ID and date
 */
function getDeterministicScheduleSeed(staffId: string, dateStr: string): number {
  let hash = 0;
  const str = `${staffId}-${dateStr}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Staff Availability Mock Service
 * Calculates live availability, slot occupancy, next bookable slot, and session status
 * grounded strictly in the salon's operating hours and beautician's real-time schedule.
 */
export class StaffAvailabilityService {
  /**
   * Generates discrete 30-minute time slots between salon opening and closing hours.
   */
  public static generateSalonOperatingSlots(openingTime: string, closingTime: string): TimeSlot[] {
    const startMinutes = parseTimeToMinutes(openingTime || '10:00 AM');
    const endMinutes = parseTimeToMinutes(closingTime || '08:30 PM');
    const slots: TimeSlot[] = [];

    // Stop 30 minutes before closing to allow service completion
    for (let m = startMinutes; m <= endMinutes - 30; m += 30) {
      slots.push({
        id: `slot-${m}`,
        time: formatMinutesToTime(m),
        timeMinutes: m,
        status: 'available',
        durationMinutes: 30,
      });
    }

    return slots;
  }

  /**
   * Computes the real-time availability profile for a staff member.
   *
   * @param staff The beautician / stylist profile
   * @param parlour The salon entity (contains openingTime, closingTime)
   * @param bookings Active bookings in the system
   * @param simulatedCurrentMinutes Optional override for current time of day in minutes (default: IST current minute)
   */
  public static calculateAvailability(
    staff: StaffMember,
    parlour: Parlour,
    bookings: Booking[] = [],
    simulatedCurrentMinutes?: number
  ): StaffAvailabilityResult {
    const opening = parlour?.openingTime || '10:00 AM';
    const closing = parlour?.closingTime || '08:30 PM';
    const openMinutes = parseTimeToMinutes(opening);
    const closeMinutes = parseTimeToMinutes(closing);

    // Calculate current time in minutes (simulated during salon operating hours for realism)
    let currentMins: number;
    if (simulatedCurrentMinutes !== undefined) {
      currentMins = simulatedCurrentMinutes;
    } else {
      // Use IST time or clamp to a sensible mid-day time during demonstration
      const now = new Date();
      const istHours = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
      const istMinutes = (now.getUTCMinutes() + 30) % 60;
      const calculatedIstMins = istHours * 60 + istMinutes;

      // If outside operating hours in live wall clock, simulate active business hour (e.g. 11:45 AM / 705 mins)
      if (calculatedIstMins < openMinutes || calculatedIstMins >= closeMinutes) {
        currentMins = openMinutes + 105; // 1h 45m after opening
      } else {
        currentMins = calculatedIstMins;
      }
    }

    const operatingHoursDisplay = `${opening} – ${closing} IST`;

    // 1. Staff is marked on leave today
    if (!staff.isPresentToday) {
      const emptySlots = this.generateSalonOperatingSlots(opening, closing).map((s) => ({
        ...s,
        status: 'booked' as const,
        clientHint: 'Staff on weekly leave',
      }));

      return {
        staffId: staff.id,
        staffName: staff.fullName,
        parlourId: parlour.id,
        parlourName: parlour.name,
        status: 'on_leave',
        badgeText: 'On Leave Today',
        badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
        dotColor: 'bg-stone-400',
        pulseAnimation: false,
        nextSlotDisplay: `Tomorrow at ${opening}`,
        nextSlotTime: opening,
        nextSlotDateLabel: 'Tomorrow',
        operatingHoursDisplay,
        isAvailableToday: false,
        availableSlotCount: 0,
        totalSlotsCount: emptySlots.length,
        timeline: emptySlots,
        lastRefreshedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 2. Generate base timeline of slots
    const rawSlots = this.generateSalonOperatingSlots(opening, closing);
    const seed = getDeterministicScheduleSeed(staff.id, new Date().toISOString().slice(0, 10));

    // Match bookings from database/context
    const memberBookings = bookings.filter(
      (b) =>
        (b.staffId === staff.id || b.staffName === staff.fullName) &&
        b.status !== 'cancelled'
    );

    const bookedTimeMap = new Map<string, string>();
    memberBookings.forEach((b) => {
      const serviceName = b.services?.map((s) => s.name).join(', ') || 'Confirmed Appointment';
      bookedTimeMap.set(b.appointmentTime, serviceName);
    });

    // Simulated sample mock appointments for realism if no database bookings yet
    const mockServices = [
      'Bridal HD Consultation',
      'Keratin Therapy & Hair Trim',
      'Ayurvedic Scalp Massage',
      'Hydra Facial & Glow Treatment',
      'Nail Art & Gel Extensions',
      'Balayage Color Refresh',
    ];

    // Determine current active session slot
    const currentSlotIndex = rawSlots.findIndex(
      (s) => currentMins >= s.timeMinutes && currentMins < s.timeMinutes + 30
    );

    let activeInSession = false;
    let currentSessionEndingInMinutes = 0;
    let currentServiceInSession: string | undefined;

    // Build timeline with status
    const timeline: TimeSlot[] = rawSlots.map((slot, index) => {
      const isPast = slot.timeMinutes + 30 <= currentMins;
      const isCurrent = index === currentSlotIndex;

      // Check if slot has an explicit booking
      if (bookedTimeMap.has(slot.time)) {
        if (isCurrent) {
          activeInSession = true;
          currentServiceInSession = bookedTimeMap.get(slot.time);
          currentSessionEndingInMinutes = Math.max(5, slot.timeMinutes + 30 - currentMins);
          return {
            ...slot,
            status: 'in_session',
            clientHint: bookedTimeMap.get(slot.time),
          };
        }
        return {
          ...slot,
          status: isPast ? 'past' : 'booked',
          clientHint: bookedTimeMap.get(slot.time),
        };
      }

      // Procedural mock booked slots based on deterministic seed
      const isSimulatedBooked = (seed + index * 7) % 5 === 0;
      const isLunchBreak = slot.timeMinutes >= 810 && slot.timeMinutes < 840; // 01:30 PM - 02:00 PM

      if (isLunchBreak) {
        return {
          ...slot,
          status: 'break',
          clientHint: 'Sanitization & Tea Break',
        };
      }

      if (isSimulatedBooked) {
        const mockService = mockServices[(seed + index) % mockServices.length];
        if (isCurrent) {
          activeInSession = true;
          currentServiceInSession = mockService;
          currentSessionEndingInMinutes = Math.max(5, slot.timeMinutes + 30 - currentMins);
          return {
            ...slot,
            status: 'in_session',
            clientHint: mockService,
          };
        }
        return {
          ...slot,
          status: isPast ? 'past' : 'booked',
          clientHint: mockService,
        };
      }

      // Past slot
      if (isPast) {
        return {
          ...slot,
          status: 'past',
        };
      }

      return {
        ...slot,
        status: 'available',
      };
    });

    // Find available upcoming slots
    const openUpcomingSlots = timeline.filter((s) => s.status === 'available');

    let status: AvailabilityStatus;
    let badgeText: string;
    let badgeColor: string;
    let dotColor: string;
    let pulseAnimation: boolean;
    let nextSlotDisplay: string;
    let nextSlotTime: string;
    let nextSlotDateLabel: string;

    if (openUpcomingSlots.length === 0) {
      status = 'fully_booked_today';
      badgeText = 'Fully Booked Today';
      badgeColor = 'bg-stone-100 text-stone-700 border-stone-300';
      dotColor = 'bg-stone-500';
      pulseAnimation = false;
      nextSlotDisplay = `Tomorrow at ${opening}`;
      nextSlotTime = opening;
      nextSlotDateLabel = 'Tomorrow';
    } else if (activeInSession) {
      status = 'in_session';
      const earliestNext = openUpcomingSlots[0];
      badgeText = `In Session · Wraps in ~${currentSessionEndingInMinutes}m`;
      badgeColor = 'bg-amber-50 text-amber-900 border-amber-300';
      dotColor = 'bg-amber-500';
      pulseAnimation = true;
      nextSlotDisplay = `Today at ${earliestNext.time}`;
      nextSlotTime = earliestNext.time;
      nextSlotDateLabel = 'Today';
    } else {
      status = 'available_now';
      const earliestNext = openUpcomingSlots[0];
      badgeText = 'Available Now · Ready to Serve';
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      dotColor = 'bg-emerald-500';
      pulseAnimation = true;
      nextSlotDisplay = `Today at ${earliestNext.time}`;
      nextSlotTime = earliestNext.time;
      nextSlotDateLabel = 'Today';
    }

    return {
      staffId: staff.id,
      staffName: staff.fullName,
      parlourId: parlour.id,
      parlourName: parlour.name,
      status,
      badgeText,
      badgeColor,
      dotColor,
      pulseAnimation,
      nextSlotDisplay,
      nextSlotTime,
      nextSlotDateLabel,
      operatingHoursDisplay,
      isAvailableToday: openUpcomingSlots.length > 0,
      availableSlotCount: openUpcomingSlots.length,
      totalSlotsCount: timeline.length,
      currentSessionEndingInMinutes,
      currentServiceInSession,
      timeline,
      lastRefreshedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /**
   * Real-time subscription emulator.
   * Calls subscriber initially, then re-evaluates periodically to emulate live availability changes.
   */
  public static subscribe(
    staff: StaffMember,
    parlour: Parlour,
    bookings: Booking[],
    onUpdate: (result: StaffAvailabilityResult) => void,
    intervalMs: number = 30000
  ): () => void {
    // Immediate calculation
    onUpdate(this.calculateAvailability(staff, parlour, bookings));

    const timer = setInterval(() => {
      onUpdate(this.calculateAvailability(staff, parlour, bookings));
    }, intervalMs);

    return () => clearInterval(timer);
  }
}
