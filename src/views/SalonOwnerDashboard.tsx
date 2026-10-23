import React, { useState } from 'react';
import {
  Store,
  Calendar,
  Clock,
  CheckCircle,
  IndianRupee,
  Users,
  Package,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Plus,
  RefreshCw,
  QrCode,
  CreditCard,
  Send,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, calculateCommission } from '../utils/formatters';
import { WhatsAppReminderCenter } from '../components/WhatsAppReminderCenter';

export const SalonOwnerDashboard: React.FC = () => {
  const {
    ownerProfile,
    parlours,
    services,
    staff,
    bookings,
    reviews,
    inventory,
    payouts,
    toggleStaffAttendance,
    recordBalancePaymentAtSalon,
    updateInventoryQuantity,
    addReviewReply,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'appointments' | 'payouts' | 'services' | 'staff' | 'inventory' | 'marketing'
  >('appointments');

  // Active parlour for this owner
  const currentParlour =
    parlours.find((p) => p.id === ownerProfile?.parlourId) ||
    parlours[0];

  // Owner bookings
  const parlourBookings = bookings.filter(
    (b) => b.parlourId === currentParlour.id
  );

  // Financial calculations
  const totalAdvancesCollected = parlourBookings.reduce(
    (sum, b) => sum + (b.status !== 'cancelled' ? b.advancePaise : 0),
    0
  );
  const platformCommission = calculateCommission(
    totalAdvancesCollected,
    currentParlour.commissionBps || 1000
  );
  const netScheduledPayout = totalAdvancesCollected - platformCommission;

  // Filter low stock inventory
  const lowStockItems = inventory.filter(
    (item) => item.parlourId === currentParlour.id && item.quantity <= item.reorderLevel
  );

  // Marketing Assist state
  const [selectedFestival, setSelectedFestival] = useState('Wedding & Bridal Season');
  const [generatedPromo, setGeneratedPromo] = useState('');
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Balance payment modal in POS
  const [posBookingId, setPosBookingId] = useState<string | null>(null);
  const [posPaymentMode, setPosPaymentMode] = useState<'cash' | 'upi_at_salon' | 'card_at_salon'>('upi_at_salon');

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const generateAIPromo = (festival: string) => {
    const promo =
      `🌸 *Special ${festival} Offer at ${currentParlour.name}!*\n\n` +
      `Dearest Patrons,\n` +
      `Get glowing and bridal-ready with our exclusive festive treatments:\n` +
      `✨ Hydra-Glow Radiance Facial & De-Tan: Flat 15% off\n` +
      `💅 Rica White Chocolate Waxing + Threading Combo\n` +
      `💍 Luxury HD Bridal Makeup Trials available\n\n` +
      `Book online with a *booking deposit* to lock your preferred slot!\n` +
      `📞 WhatsApp us or book directly on BeautyZone.`;
    setGeneratedPromo(promo);
  };

  const handleRecordPosPayment = (bookingId: string) => {
    recordBalancePaymentAtSalon(bookingId, posPaymentMode);
    setPosBookingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Owner Console
            </span>

            {/* Approval Workflow Badge */}
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                currentParlour.status === 'published'
                  ? 'bg-emerald-100 text-emerald-900'
                  : currentParlour.status === 'approved'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Status: {currentParlour.status}
            </span>
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
            {currentParlour.name}
          </h1>

          <p className="text-xs text-stone-500">
            {currentParlour.address}, {currentParlour.city} · GSTIN: {currentParlour.gstin || '27AABCU9603R1ZM'}
          </p>
        </div>

        {/* Quick Daily 10 PM IST Payout Card */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 md:w-80 shrink-0 space-y-2 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Daily 10:00 PM IST Payout</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
              Auto-Settlement
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-600">Net Payable Today:</span>
            <span className="text-lg font-bold text-stone-900 font-mono">
              {formatINR(netScheduledPayout)}
            </span>
          </div>

          <div className="text-[11px] text-stone-500 border-t border-stone-200 pt-1.5 flex justify-between">
            <span>Commission (10%):</span>
            <span className="font-mono">{formatINR(platformCommission)}</span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockItems.length} product(s) ({lowStockItems.map((i) => i.name).join(', ')}) are at or below reorder level.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3 py-1 bg-amber-800 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Check Supplies
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Appointments &amp; POS ({parlourBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Daily 10 PM Payouts &amp; Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff &amp; Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Stock &amp; Supplies</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'marketing'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Marketing &amp; Review Replies</span>
        </button>
      </div>

      {/* TAB 1: Appointments & Counter POS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Appointments &amp; Salon Counter POS
            </h2>
            <span className="text-xs text-stone-500">
              Collect balance payments in cash or counter UPI
            </span>
          </div>

          <div className="space-y-4">
            {parlourBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-stone-100 text-stone-900 px-2 py-0.5 rounded">
                      {booking.id}
                    </span>
                    <span className="text-xs font-semibold text-stone-900">
                      {booking.customerName}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      ({booking.customerWhatsapp})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        booking.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {booking.status === 'completed'
                        ? 'Completed · Balance Paid'
                        : 'Slot Confirmed · Booking Deposit Paid'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Date &amp; Slot</span>
                    <span className="font-semibold text-stone-800">
                      {booking.appointmentDate} at {booking.appointmentTime} IST
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px]">Stylist</span>
                    <span className="font-medium text-stone-800">
                      {booking.staffName || 'Any stylist'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px]">Booking Deposit Paid</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {formatINR(booking.advancePaise)}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px]">Remaining Balance</span>
                    <span className="font-mono font-bold text-stone-900">
                      {formatINR(booking.balancePaise)}
                    </span>
                  </div>
                </div>

                {/* 2-Hour WhatsApp Reminder Dispatch Control */}
                <WhatsAppReminderCenter booking={booking} compact={true} />

                {/* Counter POS Payment Action */}
                {booking.status !== 'completed' && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-amber-900 font-medium">
                      Customer is visiting the parlour today.
                    </span>

                    <button
                      onClick={() => setPosBookingId(booking.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record {formatINR(booking.balancePaise)} Balance Collected</span>
                    </button>
                  </div>
                )}

                {/* POS Action Modal / Box */}
                {posBookingId === booking.id && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-3 mt-3">
                    <h4 className="text-xs font-bold text-emerald-950">
                      Record Salon Counter Balance Payment: {formatINR(booking.balancePaise)}
                    </h4>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode('upi_at_salon')}
                        className={`flex-1 py-1.5 text-xs rounded border font-medium ${
                          posPaymentMode === 'upi_at_salon'
                            ? 'bg-white border-emerald-700 text-emerald-900 font-bold'
                            : 'bg-emerald-100/60 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        UPI at Counter
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode('cash')}
                        className={`flex-1 py-1.5 text-xs rounded border font-medium ${
                          posPaymentMode === 'cash'
                            ? 'bg-white border-emerald-700 text-emerald-900 font-bold'
                            : 'bg-emerald-100/60 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode('card_at_salon')}
                        className={`flex-1 py-1.5 text-xs rounded border font-medium ${
                          posPaymentMode === 'card_at_salon'
                            ? 'bg-white border-emerald-700 text-emerald-900 font-bold'
                            : 'bg-emerald-100/60 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        Card POS Machine
                      </button>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setPosBookingId(null)}
                        className="px-3 py-1 text-xs text-stone-600 hover:text-stone-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRecordPosPayment(booking.id)}
                        className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Confirm Collection &amp; Generate GST Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Daily 10:00 PM Auto Payouts & Commission Ledger */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                  Daily 10:00 PM IST Auto Payout Ledger (R9)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Advances collected online are settled automatically every day at 22:00 IST. No withdrawal requests required.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-right">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">
                  Platform Commission
                </span>
                <span className="text-xs font-bold font-mono text-stone-900">
                  10% default ({currentParlour.commissionBps || 1000} bps)
                </span>
              </div>
            </div>

            {/* Bank details card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Account Holder</span>
                <span className="font-semibold text-stone-900">
                  {currentParlour.bankDetails?.accountHolder || currentParlour.name}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Bank Account Number</span>
                <span className="font-mono font-semibold text-stone-900">
                  {currentParlour.bankDetails?.accountNumber || '921020045561234'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">IFSC Code</span>
                <span className="font-mono font-semibold text-stone-900">
                  {currentParlour.bankDetails?.ifscCode || 'HDFC0000019'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">UPI ID for Instant Payout</span>
                <span className="font-mono font-semibold text-stone-900">
                  {currentParlour.bankDetails?.upiId || 'aurasalon@hdfcbank'}
                </span>
              </div>
            </div>
          </div>

          {/* Past Settlements History */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h4 className="font-serif-luxury text-base font-bold text-stone-900">
                Settlement History
              </h4>
              <span className="text-xs text-stone-500">
                RazorpayX Payouts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Gross Advances</th>
                    <th className="py-3 px-4">Commission (10%)</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Scheduled / Paid</th>
                    <th className="py-3 px-4">Status &amp; UTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payouts.map((record) => (
                    <tr key={record.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-mono">{record.date}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {formatINR(record.grossAdvancePaise)}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-900">
                        -{formatINR(record.platformCommissionPaise)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {formatINR(record.netPayoutPaise)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {record.scheduledAt}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            record.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.utrNumber && (
                          <span className="block font-mono text-[10px] text-stone-400 mt-0.5">
                            UTR: {record.utrNumber}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Staff & Attendance */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Stylists &amp; Beauticians Management
            </h2>
            <span className="text-xs text-stone-500">
              Toggle daily attendance for slot booking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff
              .filter((s) => s.parlourId === currentParlour.id)
              .map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photo}
                      alt={member.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {member.fullName}
                      </h4>
                      <p className="text-[11px] text-stone-500">{member.roleTitle}</p>
                      <span className="text-[10px] text-amber-800 font-medium">
                        Commission: {member.commissionPercent}% on services
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => toggleStaffAttendance(member.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        member.isPresentToday
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {member.isPresentToday ? 'Present Today' : 'On Leave'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: Stock & Supplies */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Salon Stock &amp; Consumables
            </h2>
            <span className="text-xs text-stone-500">
              Track facial kits, Rica wax, threads, and shampoos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory
              .filter((i) => i.parlourId === currentParlour.id)
              .map((item) => (
                <div
                  key={item.id}
                  className={`bg-white p-5 rounded-2xl border shadow-xs space-y-3 ${
                    item.quantity <= item.reorderLevel
                      ? 'border-amber-400 bg-amber-50/20'
                      : 'border-stone-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-medium">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-mono text-stone-900">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-stone-500 ml-1">
                        {item.unit}
                      </span>
                    </div>
                    {item.quantity <= item.reorderLevel && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Reorder Alert!
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-400 flex justify-between">
                    <span>Reorder at: {item.reorderLevel} {item.unit}</span>
                    <span>Cost: {formatINR(item.costPerUnitPaise)}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                    <button
                      onClick={() => updateInventoryQuantity(item.id, item.quantity - 1)}
                      className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded text-stone-800"
                    >
                      -1 Used
                    </button>
                    <button
                      onClick={() => updateInventoryQuantity(item.id, item.quantity + 5)}
                      className="flex-1 py-1 bg-[#1C1815] hover:bg-stone-800 text-xs font-semibold rounded text-[#FAF8F5]"
                    >
                      +5 Restock
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI Marketing Assist & Review Replies */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Marketing Broadcast Generator */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                WhatsApp Broadcast Generator
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Generate Indian festive broadcasts for Karwa Chauth, Diwali, and Wedding Season to engage past clients.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Occasion / Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Wedding & Bridal', 'Karwa Chauth Glow', 'Diwali Festive'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setSelectedFestival(f);
                        generateAIPromo(f);
                      }}
                      className={`py-2 px-2 text-xs rounded-xl border text-center font-medium ${
                        selectedFestival === f
                          ? 'bg-amber-100/70 border-amber-700 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {generatedPromo && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Generated WhatsApp Copy
                  </label>
                  <textarea
                    rows={6}
                    readOnly
                    value={generatedPromo}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPromo);
                      setCopiedPromo(true);
                      setTimeout(() => setCopiedPromo(false), 2000);
                    }}
                    className="mt-2 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{copiedPromo ? 'Copied to Clipboard!' : 'Copy for WhatsApp Broadcast'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Review Replies */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              Customer Reviews &amp; Replies
            </h3>
            <p className="text-xs text-stone-500">
              Reply to client feedback to maintain high salon ratings on BeautyZone.
            </p>

            <div className="space-y-3">
              {reviews
                .filter((r) => r.parlourId === currentParlour.id)
                .map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{rev.customerName}</span>
                      <span className="text-amber-600 font-bold">★ {rev.rating}</span>
                    </div>
                    <p className="text-stone-700">"{rev.comment}"</p>

                    {rev.reply ? (
                      <div className="p-2 bg-white rounded-lg border border-stone-200 text-[11px] text-stone-600">
                        <span className="font-bold text-stone-800">Your Reply: </span>
                        {rev.reply.text}
                      </div>
                    ) : (
                      <div className="pt-1">
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Thank you for visiting! We look forward..."
                              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="text-stone-500 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (replyText.trim()) {
                                    addReviewReply(rev.id, replyText.trim());
                                    setReplyingReviewId(null);
                                    setReplyText('');
                                  }
                                }}
                                className="px-3 py-1 bg-stone-900 text-white rounded text-xs"
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText(`Thank you ${rev.customerName}! We're thrilled you enjoyed your treatment.`);
                            }}
                            className="text-xs font-semibold text-amber-900 hover:underline"
                          >
                            + Reply with AI template
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
