import React, { useState } from 'react';
import {
  Shield,
  Building,
  CheckCircle2,
  Clock,
  IndianRupee,
  Sliders,
  AlertCircle,
  Play,
  Check,
  Eye,
  Store,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, calculateCommission } from '../utils/formatters';

export const SuperAdminDashboard: React.FC = () => {
  const {
    parlours,
    bookings,
    payouts,
    platformSettings,
    updateParlourStatus,
    triggerDaily10PMPayout,
    updatePlatformSettings,
  } = useApp();

  const [payoutTriggered, setPayoutTriggered] = useState(false);
  const [selectedAdvancePercent, setSelectedAdvancePercent] = useState(
    platformSettings.advance_percent
  );
  const [selectedCommissionBps, setSelectedCommissionBps] = useState(
    platformSettings.commission_bps
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Platform Metrics
  const totalBookingsCount = bookings.length;
  const grossBookingValuePaise = bookings.reduce(
    (sum, b) => sum + (b.status !== 'cancelled' ? b.totalPaise : 0),
    0
  );
  const totalAdvancesCollectedPaise = bookings.reduce(
    (sum, b) => sum + (b.status !== 'cancelled' ? b.advancePaise : 0),
    0
  );
  const totalCommissionEarnedPaise = calculateCommission(
    totalAdvancesCollectedPaise,
    platformSettings.commission_bps
  );

  const pendingParlours = parlours.filter((p) => p.status === 'pending');
  const publishedParlours = parlours.filter((p) => p.status === 'published');

  const handleTriggerPayoutNow = () => {
    triggerDaily10PMPayout();
    setPayoutTriggered(true);
    setTimeout(() => setPayoutTriggered(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      advance_percent: Number(selectedAdvancePercent),
      commission_bps: Number(selectedCommissionBps),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full w-fit mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>BeautyZone Super Admin Console</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
            Platform Master Operations
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Supervise parlour approvals, enforce 25% advances, configure commission, and audit daily 10 PM IST settlements.
          </p>
        </div>

        {/* 10 PM Payout trigger button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPayoutNow}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            {payoutTriggered ? (
              <>
                <Check className="w-4 h-4" />
                <span>10 PM Payout Triggered!</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Simulate 10:00 PM Auto Payout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-medium">Gross Booking Value (GBV)</span>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {formatINR(grossBookingValuePaise)}
          </div>
          <p className="text-[11px] text-stone-400">Total appointments booked across India</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-medium">25% Advances Collected</span>
          <div className="text-2xl font-bold font-mono text-amber-900">
            {formatINR(totalAdvancesCollectedPaise)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Held securely in platform escrow</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-medium">Platform Commission (10%)</span>
          <div className="text-2xl font-bold font-mono text-purple-900">
            {formatINR(totalCommissionEarnedPaise)}
          </div>
          <p className="text-[11px] text-stone-400">Default rate: 1000 bps</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-medium">Parlours Network</span>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {publishedParlours.length}{' '}
            <span className="text-xs text-amber-700 font-normal">
              ({pendingParlours.length} pending review)
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Across 6 tier-1 Indian metros</p>
        </div>
      </div>

      {/* Parlour Approval Workflow (Draft -> Pending -> Approved -> Published) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Parlour Verification Queue ({pendingParlours.length} Pending)
            </h2>
            <p className="text-xs text-stone-500">
              Review parlour onboarding applications, verify GSTIN, and publish to public website.
            </p>
          </div>
        </div>

        {pendingParlours.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            All submitted parlours have been reviewed and approved!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingParlours.map((parlour) => (
              <div
                key={parlour.id}
                className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 font-serif-luxury">
                      {parlour.name}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                      PENDING REVIEW
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Owner: {parlour.ownerName} · WhatsApp: {parlour.whatsappNumber}
                  </p>
                  <p className="text-xs text-stone-500">
                    Location: {parlour.address}, {parlour.city} · Pincode: {parlour.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateParlourStatus(parlour.id, 'published')}
                    className="px-4 py-2 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve &amp; Publish Website</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Settings (Advance % and Commission bps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-stone-700" />
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              Platform Monetary Policies (R3 &amp; R8)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Customer Advance Percentage (%):
            </label>
            <input
              type="number"
              min={10}
              max={50}
              value={selectedAdvancePercent}
              onChange={(e) => setSelectedAdvancePercent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Default is 25%. Remaining 75% is collected at salon counter.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Platform Commission (bps):
            </label>
            <input
              type="number"
              min={500}
              max={2500}
              step={50}
              value={selectedCommissionBps}
              onChange={(e) => setSelectedCommissionBps(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              1000 bps = 10% standard platform commission deducted on daily settlements.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {settingsSaved && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
            >
              Update Settings
            </button>
          </div>
        </form>

        {/* Daily Payout Rules Information */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              Daily Auto Payout Architecture (R9)
            </h3>
          </div>

          <div className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
            <p>
              • <strong>Timing:</strong> Platform triggers automated batch settlements daily at <strong>10:00 PM IST</strong> via RazorpayX.
            </p>
            <p>
              • <strong>Formula:</strong> Payout = Gross Advance Collected − 10% Platform Commission − Refunds.
            </p>
            <p>
              • <strong>Clawback Prevention:</strong> Future appointment advances remain safely in escrow until the appointment date, ensuring zero clawback risk for cancellations.
            </p>
            <p>
              • <strong>GST Compliance:</strong> GST invoices are generated for both the customer service bill and the platform commission invoice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
