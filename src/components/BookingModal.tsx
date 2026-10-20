import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Calendar,
  Clock,
  Sparkles,
  User,
  CreditCard,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatINR,
  calculateAdvance,
  formatDateIST,
  getWhatsAppConfirmationMessage,
} from '../utils/formatters';
import { SalonService, StaffMember } from '../types';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingModalPreload,
    parlours,
    services,
    staff,
    customerProfile,
    platformSettings,
    createBooking,
    setCurrentView,
  } = useApp();

  // Active parlour
  const activeParlour =
    parlours.find((p) => p.id === bookingModalPreload.parlourId) ||
    parlours[0];

  // Available services for this parlour
  const parlourServices = services.filter(
    (s) => s.parlourId === activeParlour?.id && s.isActive
  );

  // Available staff for this parlour
  const parlourStaff = staff.filter(
    (s) => s.parlourId === activeParlour?.id
  );

  // Steps: 1: Service & Staff, 2: Date & Slot, 3: Customer Details, 4: 25% Advance Payment, 5: Confirmed
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('11:00 AM');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiApp, setUpiApp] = useState<string>('gpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pre-load logic when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setConfirmedBookingId(null);
      setErrorMessage('');

      // Pre-select service if provided
      if (bookingModalPreload.serviceId) {
        setSelectedServiceIds([bookingModalPreload.serviceId]);
      } else if (parlourServices.length > 0) {
        setSelectedServiceIds([parlourServices[0].id]);
      }

      // Pre-select staff if provided
      if (bookingModalPreload.staffId) {
        setSelectedStaffId(bookingModalPreload.staffId);
      } else {
        setSelectedStaffId('any');
      }

      // Pre-select tomorrow as default appointment date in DD/MM/YYYY
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const year = tomorrow.getFullYear();
      setAppointmentDate(`${day}/${month}/${year}`);

      // Pre-fill customer details if logged in
      if (customerProfile) {
        setCustomerName(customerProfile.fullName || '');
        setCustomerWhatsapp(customerProfile.whatsappNumber?.replace(/^\+91\s*/, '') || '');
        setCustomerEmail(customerProfile.email || '');
      }
    }
  }, [isBookingModalOpen, bookingModalPreload, customerProfile]);

  if (!isBookingModalOpen || !activeParlour) return null;

  // Selected services objects
  const selectedServicesList = parlourServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  // Financial calculations
  const totalPaise = selectedServicesList.reduce(
    (sum, s) => sum + s.pricePaise,
    0
  );
  const advancePercent = activeParlour.advancePercent || platformSettings.advance_percent || 25;
  const { advancePaise, balancePaise } = calculateAdvance(totalPaise, advancePercent);
  const totalDuration = selectedServicesList.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  const selectedStaffObj =
    selectedStaffId === 'any'
      ? null
      : parlourStaff.find((s) => s.id === selectedStaffId);

  // Time slots in Asia/Kolkata (IST)
  const availableTimeSlots = [
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '01:30 PM',
    '02:30 PM',
    '03:30 PM',
    '04:30 PM',
    '05:30 PM',
    '06:30 PM',
    '07:00 PM',
  ];

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((sId) => sId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleProceedToDetails = () => {
    if (selectedServiceIds.length === 0) {
      setErrorMessage('Please select at least one treatment or service.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleProceedToCustomerInfo = () => {
    if (!appointmentDate) {
      setErrorMessage('Please select an appointment date.');
      return;
    }
    setErrorMessage('');
    setStep(3);
  };

  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerWhatsapp || customerWhatsapp.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    setErrorMessage('');
    setStep(4);
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setErrorMessage('');

    // Simulate payment gateway verification (Razorpay / UPI webhook)
    setTimeout(() => {
      setIsProcessingPayment(false);

      const formattedWhatsapp = customerWhatsapp.startsWith('+91')
        ? customerWhatsapp
        : `+91 ${customerWhatsapp.trim()}`;

      const newBooking = createBooking({
        parlourId: activeParlour.id,
        parlourName: activeParlour.name,
        parlourAddress: activeParlour.address,
        parlourCity: activeParlour.city,
        customerId: customerProfile?.id || `cust-guest-${Date.now()}`,
        customerName: customerName.trim(),
        customerWhatsapp: formattedWhatsapp,
        customerEmail: customerEmail.trim() || 'guest@beautyzone.in',
        services: selectedServicesList.map((s) => ({
          id: s.id,
          name: s.name,
          pricePaise: s.pricePaise,
          durationMinutes: s.durationMinutes,
        })),
        staffId: selectedStaffObj ? selectedStaffObj.id : undefined,
        staffName: selectedStaffObj ? selectedStaffObj.fullName : 'Any available beautician',
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        totalPaise: totalPaise,
        advancePaise: advancePaise,
        balancePaise: balancePaise,
        paymentMethod: paymentMethod,
        paymentReference: `RAZORPAY-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        notes: customerNotes,
      });

      setConfirmedBookingId(newBooking.id);
      setStep(5);
    }, 1200);
  };

  const handleCopyWhatsApp = () => {
    if (!confirmedBookingId) return;
    const msg = getWhatsAppConfirmationMessage({
      bookingId: confirmedBookingId,
      customerName: customerName,
      parlourName: activeParlour.name,
      services: selectedServicesList.map((s) => s.name),
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      advancePaise: advancePaise,
      balancePaise: balancePaise,
      parlourAddress: activeParlour.address,
    });
    navigator.clipboard.writeText(msg);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#1C1815] text-[#FAF8F5] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-lg font-semibold tracking-tight text-white">
                {activeParlour.name}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-400/30">
                {activeParlour.city}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {step === 5
                ? 'Booking Confirmed'
                : `Step ${step} of 4 · 25% Advance Lock`}
            </p>
          </div>
          <button
            onClick={closeBookingModal}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator (Steps 1-4) */}
        {step < 5 && (
          <div className="bg-stone-100 px-6 py-2 border-b border-stone-200 shrink-0">
            <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-1 ${
                  step === 1 ? 'text-amber-800 font-semibold' : ''
                }`}
              >
                <span>1. Services</span>
              </button>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <button
                onClick={() => selectedServiceIds.length > 0 && setStep(2)}
                className={`flex items-center gap-1 ${
                  step === 2 ? 'text-amber-800 font-semibold' : ''
                }`}
              >
                <span>2. Date &amp; Slot</span>
              </button>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <button
                onClick={() => appointmentDate && setStep(3)}
                className={`flex items-center gap-1 ${
                  step === 3 ? 'text-amber-800 font-semibold' : ''
                }`}
              >
                <span>3. Details</span>
              </button>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <button
                onClick={() => customerName && setStep(4)}
                className={`flex items-center gap-1 ${
                  step === 4 ? 'text-amber-800 font-semibold' : ''
                }`}
              >
                <span>4. 25% Advance</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Services & Beautician */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-stone-900">
                    Select Parlour Services
                  </h3>
                  <span className="text-xs text-stone-500">
                    {selectedServiceIds.length} treatment(s) chosen
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {parlourServices.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleToggleService(service.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50/60 border-amber-600 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-stone-900">
                              {service.name}
                            </h4>
                            {service.popular && (
                              <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-stone-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {service.durationMinutes} mins
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Category: {service.category}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <span className="text-sm font-bold text-stone-900">
                            {formatINR(service.pricePaise)}
                          </span>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            25% advance: {formatINR(Math.ceil(service.pricePaise * 0.25))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Beautician / Stylist Choice */}
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2">
                  Choose Stylist / Beautician
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStaffId('any')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedStaffId === 'any'
                        ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-semibold text-xs">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          Any Available Beautician
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Fastest slot allocation
                        </div>
                      </div>
                    </div>
                  </button>

                  {parlourStaff.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStaffId(st.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedStaffId === st.id
                          ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.photo}
                          alt={st.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-stone-900 truncate">
                            {st.fullName}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {st.roleTitle} · ★ {st.rating}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Slot (IST) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Select Appointment Date (DD/MM/YYYY)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAppointmentDate(formatDateIST(e.target.value));
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
                {appointmentDate && (
                  <p className="text-[11px] text-amber-900 font-medium mt-1">
                    Selected appointment date: <span className="font-mono">{appointmentDate}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Select Time Slot (Asia/Kolkata IST)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                        appointmentTime === slot
                          ? 'bg-[#1C1815] text-[#FAF8F5] border-[#1C1815] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Estimated parlour visit duration: ~{totalDuration} minutes
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sneha Kulkarni"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  WhatsApp Number * (for instant confirmation &amp; slip)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 text-xs text-stone-600 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerWhatsapp}
                    onChange={(e) =>
                      setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="98200 12345"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-stone-200 rounded-r-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Appointment confirmation and directions will be sent directly to this WhatsApp number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Email Address (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Special Notes or Allergies (optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Sensitive skin, bridal trial, preferred nail shade..."
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: 25% Advance Payment */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Payment Bill Breakdown */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Selected Services ({selectedServicesList.length}):</span>
                  <span className="font-semibold text-stone-900">
                    {formatINR(totalPaise)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-100/70 p-2.5 rounded-lg font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>25% Advance Required to Lock Slot:</span>
                  </div>
                  <span className="font-bold text-sm text-amber-950 font-mono">
                    {formatINR(advancePaise)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                  <span>Remaining 75% Balance (Pay at Salon):</span>
                  <span className="font-semibold text-stone-800 font-mono">
                    {formatINR(balancePaise)}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  * Note: The balance of {formatINR(balancePaise)} is payable directly at the parlour counter via UPI, Cash, or Card upon completion of service.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Select Advance Payment Mode ({formatINR(advancePaise)})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 text-amber-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                    <span className="text-xs block">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 text-amber-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                    <span className="text-xs block">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 text-amber-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                    <span className="text-xs block">NetBanking</span>
                  </button>
                </div>

                {/* UPI Sub-options */}
                {paymentMethod === 'upi' && (
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <p className="text-[11px] text-stone-600 font-medium">
                      Select UPI App / Handle:
                    </p>
                    <div className="flex gap-2">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiApp(app)}
                          className={`flex-1 py-1.5 px-2 text-[11px] rounded uppercase font-mono font-medium border ${
                            upiApp === app
                              ? 'bg-white border-amber-700 text-amber-900 shadow-xs'
                              : 'bg-stone-100 border-stone-200 text-stone-600'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] text-stone-500 pt-1">
                      Platform integrates with Razorpay UPI Intent for seamless 1-tap authorization on your mobile.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Booking Confirmed Screen */}
          {step === 5 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Payment Successful · 25% Advance Paid
                </span>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-stone-600">
                  Your slot has been reserved at{' '}
                  <span className="font-semibold text-stone-900">
                    {activeParlour.name}
                  </span>
                  .
                </p>
              </div>

              {/* Confirmation Slip Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm text-left space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs text-stone-500">Booking ID</span>
                  <span className="text-sm font-bold font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {confirmedBookingId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Date &amp; Time (IST)</span>
                    <span className="font-semibold text-stone-800">
                      {appointmentDate} at {appointmentTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Stylist / Beautician</span>
                    <span className="font-semibold text-stone-800">
                      {selectedStaffObj ? selectedStaffObj.fullName : 'Any available beautician'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Customer WhatsApp</span>
                    <span className="font-semibold text-stone-800 font-mono">
                      {customerWhatsapp.startsWith('+91') ? customerWhatsapp : `+91 ${customerWhatsapp}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">25% Advance Paid</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {formatINR(advancePaise)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block text-[10px]">Confirmed Treatments</span>
                  <ul className="mt-1 space-y-0.5 text-xs text-stone-700">
                    {selectedServicesList.map((s) => (
                      <li key={s.id} className="flex justify-between">
                        <span>• {s.name}</span>
                        <span className="font-mono text-stone-500">{formatINR(s.pricePaise)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-700 font-medium">Balance to Pay at Salon:</span>
                  <span className="text-base font-bold text-stone-900 font-mono">
                    {formatINR(balancePaise)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {copiedWhatsApp ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy WhatsApp Booking Slip</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    closeBookingModal();
                    setCurrentView('customer_portal');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
                >
                  View My Appointments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 5 && (
          <div className="bg-white px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[11px] text-stone-500 block">
                Total Treatment Value:
              </span>
              <span className="text-sm font-bold text-stone-900">
                {formatINR(totalPaise)}
              </span>
              <span className="text-[10px] text-amber-800 font-medium ml-2">
                (Advance: {formatINR(advancePaise)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleProceedToDetails}
                  className="px-5 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Continue to Date
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleProceedToCustomerInfo}
                  className="px-5 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Enter Your Details
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-5 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Review &amp; Pay 25% Advance
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessPayment}
                  className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing UPI...</span>
                    </>
                  ) : (
                    <span>Pay {formatINR(advancePaise)} Advance</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
