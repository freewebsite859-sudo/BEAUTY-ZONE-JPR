import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  Bell,
  Sparkles,
  Smartphone,
  Info,
  Calendar,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Booking } from '../types';
import {
  WhatsAppReminderLog,
  getReminderLogs,
  processAutomatedWhatsAppReminders,
  triggerManualWhatsAppReminder,
  generateWhatsAppDeepLink,
  calculate2HourReminderTime,
} from '../services/whatsappReminderService';

interface WhatsAppReminderCenterProps {
  booking: Booking;
  className?: string;
  compact?: boolean;
}

export const WhatsAppReminderCenter: React.FC<WhatsAppReminderCenterProps> = ({
  booking,
  className = '',
  compact = false,
}) => {
  const [logs, setLogs] = useState<WhatsAppReminderLog[]>(() => getReminderLogs());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Poll automated background checker every 10 seconds
  useEffect(() => {
    const runCheck = () => {
      const updated = processAutomatedWhatsAppReminders([booking], (newLog) => {
        setToastMessage(`Automated 2-Hour WhatsApp Reminder sent to ${newLog.customerWhatsapp}`);
      });
      setLogs(updated);
    };

    runCheck();
    const interval = setInterval(runCheck, 10000);
    return () => clearInterval(interval);
  }, [booking]);

  const currentLog = logs.find((l) => l.bookingId === booking.id);
  const reminderDueTime = calculate2HourReminderTime(
    booking.appointmentDate,
    booking.appointmentTime
  );

  const handleSendTestReminder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sentLog = triggerManualWhatsAppReminder(booking, () => {
        setToastMessage(`Test 2-Hour WhatsApp Reminder sent successfully to ${booking.customerWhatsapp}`);
      });
      setLogs(getReminderLogs());
      setIsProcessing(false);

      // Auto clear toast after 4s
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const handleOpenWhatsApp = () => {
    const text = currentLog?.messageText || '';
    const link = generateWhatsAppDeepLink(booking.customerWhatsapp, text);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div className={`bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 text-xs space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Automated 2h WhatsApp Reminder</span>
          </div>
          {currentLog?.status === 'sent' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Sent</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>Scheduled</span>
            </span>
          )}
        </div>

        <div className="text-[11px] text-stone-600 flex items-center justify-between">
          <span>Target Number: <strong className="font-mono text-stone-900">{booking.customerWhatsapp}</strong></span>
          <button
            type="button"
            onClick={handleSendTestReminder}
            disabled={isProcessing}
            className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>{isProcessing ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden ${className}`}>
      {/* Banner Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white text-xs cursor-pointer font-mono"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>2-Hour Auto Reminder</span>
            </span>
            <span className="text-xs text-stone-300 font-mono">
              #{booking.id}
            </span>
          </div>
          <h4 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            WhatsApp Notification Dispatcher
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {currentLog?.status === 'sent' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reminder Sent</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Scheduled for 2h Prior</span>
            </span>
          )}
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Recipient &amp; Appointment
            </div>
            <div className="text-xs font-bold text-stone-900">
              {booking.customerName} (<span className="font-mono">{booking.customerWhatsapp}</span>)
            </div>
            <div className="text-xs text-stone-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{booking.appointmentDate} at {booking.appointmentTime}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
            <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
              Automated 2-Hour Trigger Time
            </div>
            <div className="text-xs font-bold text-emerald-950 font-mono">
              {reminderDueTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}{' '}
              IST ({reminderDueTime.toLocaleDateString('en-GB')})
            </div>
            <div className="text-[11px] text-emerald-800">
              {currentLog?.sentAtIso ? (
                <span>
                  Dispatched at{' '}
                  {new Date(currentLog.sentAtIso).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ) : (
                <span>System automatically dispatches 2 hours before start</span>
              )}
            </div>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>WhatsApp Message Payload Preview</span>
            </span>
            <span className="text-[11px] font-mono text-stone-400">Indian English</span>
          </div>

          <div className="bg-[#EFEAE2] p-4 rounded-xl border border-stone-300/80 text-xs text-stone-800 font-sans whitespace-pre-wrap leading-relaxed shadow-inner max-h-52 overflow-y-auto scrollbar-thin">
            {currentLog?.messageText || 'Generating WhatsApp template...'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Opted-in WhatsApp Alerts (+91 format verified)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendTestReminder}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200 min-h-11"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Dispatching...' : 'Trigger Test Reminder'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-11"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
