// SRC: Design.md §4.5A, 00_MASTER §7 row 6, PRD §B4
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Coffee,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StaffMember, Parlour, Booking } from '../types';
import {
  StaffAvailabilityService,
  StaffAvailabilityResult,
  TimeSlot,
} from '../services/staffAvailabilityService';
import { useApp } from '../context/AppContext';

interface StaffAvailabilityCardProps {
  member: StaffMember;
  parlour: Parlour;
  bookings: Booking[];
}

export const StaffAvailabilityCard: React.FC<StaffAvailabilityCardProps> = ({
  member,
  parlour,
  bookings,
}) => {
  const { openBookingModal } = useApp();
  const [availability, setAvailability] = useState<StaffAvailabilityResult>(() =>
    StaffAvailabilityService.calculateAvailability(member, parlour, bookings)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Subscribe to real-time availability updates via the mock service
  useEffect(() => {
    const unsubscribe = StaffAvailabilityService.subscribe(
      member,
      parlour,
      bookings,
      (updated) => setAvailability(updated),
      25000 // periodic check every 25s
    );
    return () => unsubscribe();
  }, [member, parlour, bookings]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const updated = StaffAvailabilityService.calculateAvailability(member, parlour, bookings);
      setAvailability(updated);
      setIsRefreshing(false);
    }, 450);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      // Direct 1-click booking preloaded with this staff member & parlour
      openBookingModal(parlour.id, undefined, member.id);
    }
  };

  return (
    <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
      {/* Top Header: Live Status & Operating Hours */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3" aria-hidden="true">
              {availability.pulseAnimation && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${availability.dotColor}`}
                />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${availability.dotColor}`} />
            </span>
            <span className="text-xs font-bold text-stone-900 tracking-tight">
              Real-Time Availability:
            </span>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${availability.badgeColor}`}
          >
            {availability.badgeText}
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Salon Hours: {availability.operatingHoursDisplay}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh availability"
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Refresh real-time availability"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Next Slot Highlight Banner */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-stone-400 tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Next Available Booking Slot</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-stone-900 font-mono tracking-tight">
              {availability.nextSlotDisplay}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              (Confirmed with {member.fullName.split(' ')[0]})
            </span>
          </div>

          {availability.status === 'in_session' && availability.currentServiceInSession && (
            <p className="text-[11px] text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>
                Currently performing: <strong className="font-semibold">{availability.currentServiceInSession}</strong>
              </span>
            </p>
          )}

          {availability.status === 'on_leave' && (
            <p className="text-[11px] text-stone-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-stone-400" />
              <span>Beautician is off today. Earliest slot is reserved for tomorrow at opening.</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {availability.isAvailableToday && (
            <span className="text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
              {availability.availableSlotCount} open slots today
            </span>
          )}

          <button
            onClick={() => openBookingModal(parlour.id, undefined, member.id)}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-11 min-w-11"
          >
            <CheckCircle className="w-4 h-4 text-amber-200" />
            <span>Reserve Next Slot</span>
          </button>
        </div>
      </div>

      {/* Accordion Toggle: Full Operating Hours Schedule Timeline */}
      <div className="pt-1">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors focus:outline-none"
          aria-expanded={showTimeline}
        >
          {showTimeline ? (
            <>
              <ChevronUp className="w-4 h-4 text-stone-500" />
              <span>Hide Today's Operating Slot Timeline</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-stone-500" />
              <span>View Today's 30-Min Slot Timeline ({availability.operatingHoursDisplay})</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 pt-3 border-t border-stone-200/80 space-y-3"
            >
              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-stone-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Available (Click to book)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  In Session Now
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 inline-block" />
                  Booked / Past
                </span>
                <span className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-stone-400" />
                  Break
                </span>
              </div>

              {/* Slot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {availability.timeline.map((slot) => {
                  const isAvail = slot.status === 'available';
                  const isInSession = slot.status === 'in_session';
                  const isBreak = slot.status === 'break';
                  const isBooked = slot.status === 'booked';
                  const isPast = slot.status === 'past';

                  let cardStyle = 'bg-stone-100 text-stone-400 border-stone-200 opacity-60 cursor-not-allowed';
                  if (isAvail) {
                    cardStyle =
                      'bg-white text-stone-900 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-2xs cursor-pointer';
                  } else if (isInSession) {
                    cardStyle = 'bg-amber-100/80 text-amber-950 border-amber-400 font-semibold shadow-2xs';
                  } else if (isBreak) {
                    cardStyle = 'bg-stone-50 text-stone-400 border-dashed border-stone-300 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvail}
                      onClick={() => handleSlotClick(slot)}
                      className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between text-xs min-h-11 ${cardStyle}`}
                      title={slot.clientHint || (isAvail ? 'Available to book' : 'Slot unavailable')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-medium">{slot.time}</span>
                        {isInSession && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        )}
                      </div>

                      <div className="text-[10px] mt-1 font-sans">
                        {isAvail && <span className="text-emerald-700 font-semibold">Available</span>}
                        {isInSession && <span className="text-amber-800">In Chair</span>}
                        {isBooked && <span className="text-stone-400">Booked</span>}
                        {isPast && <span className="text-stone-400">Elapsed</span>}
                        {isBreak && <span className="text-stone-400 flex items-center gap-0.5"><Coffee className="w-2.5 h-2.5" /> Break</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-stone-400 italic">
                * Real-time slot status dynamically mirrors salon operating hours ({availability.operatingHoursDisplay}) and beauty technician appointments.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
