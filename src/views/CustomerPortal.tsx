import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Copy,
  Check,
  Star,
  RefreshCw,
  AlertCircle,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, getWhatsAppConfirmationMessage, calculateAge } from '../utils/formatters';

export const CustomerPortal: React.FC = () => {
  const {
    customerProfile,
    bookings,
    addReview,
    openBookingModal,
    openAuthModal,
    setCurrentView,
    setSelectedParlourSlug,
    parlours,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'profile'>('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Review modal state
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Filter customer bookings
  const myBookings = bookings.filter((b) =>
    customerProfile
      ? b.customerWhatsapp === customerProfile.whatsappNumber || b.customerEmail === customerProfile.email || b.customerId === customerProfile.id
      : true
  );

  const upcomingBookings = myBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'advance_paid'
  );
  const pastBookings = myBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const handleCopySlip = (booking: typeof bookings[0]) => {
    const msg = getWhatsAppConfirmationMessage({
      bookingId: booking.id,
      customerName: booking.customerName,
      parlourName: booking.parlourName,
      services: booking.services.map((s) => s.name),
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      advancePaise: booking.advancePaise,
      balancePaise: booking.balancePaise,
      parlourAddress: booking.parlourAddress,
    });
    navigator.clipboard.writeText(msg);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleReviewSubmit = (e: React.FormEvent, booking: typeof bookings[0]) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      parlourId: booking.parlourId,
      customerId: customerProfile?.id || 'cust-1',
      customerName: customerProfile?.fullName || booking.customerName,
      rating: reviewRating,
      comment: reviewComment.trim(),
      serviceName: booking.services[0]?.name || 'Parlour Treatment',
      verifiedBookingId: booking.id,
    });

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewBookingId(null);
      setReviewComment('');
      setReviewSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full w-fit mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
            Welcome, {customerProfile?.fullName || 'Valued Guest'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your parlour appointments, track 25% advances, and download WhatsApp slips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('showcase')}
            className="px-4 py-2 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Explore Parlours
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Appointments ({upcomingBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'past'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past Visits &amp; Reviews ({pastBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#1C1815] text-[#FAF8F5]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Details</span>
        </button>
      </div>

      {/* TAB 1: Upcoming Appointments */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
              <Calendar className="w-8 h-8 text-amber-700 mx-auto" />
              <h3 className="text-base font-semibold text-stone-900">
                No upcoming parlour visits
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ready for a glow facial or bridal styling? Browse verified parlours and lock your slot with 25% advance.
              </p>
              <button
                onClick={() => setCurrentView('showcase')}
                className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800"
              >
                Book Treatment Now
              </button>
            </div>
          ) : (
            upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 font-mono text-sm bg-stone-100 px-2 py-0.5 rounded">
                        {booking.id}
                      </span>
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        25% Advance Paid · Confirmed
                      </span>
                    </div>
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      {booking.parlourName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Total Price:</span>
                    <span className="text-base font-bold text-stone-900 font-mono">
                      {formatINR(booking.totalPaise)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-400 block text-[11px]">Appointment Slot</span>
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {booking.appointmentDate} at {booking.appointmentTime} (IST)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 block text-[11px]">Parlour Address</span>
                    <p className="text-stone-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{booking.parlourAddress}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 block text-[11px]">Assigned Stylist</span>
                    <p className="font-medium text-stone-800">
                      {booking.staffName || 'Any available beautician'}
                    </p>
                  </div>
                </div>

                {/* Treatment List */}
                <div className="bg-stone-50 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-stone-800 block mb-1">
                    Booked Treatments:
                  </span>
                  {booking.services.map((s) => (
                    <div key={s.id} className="flex justify-between text-stone-600">
                      <span>• {s.name} ({s.durationMinutes} mins)</span>
                      <span className="font-mono">{formatINR(s.pricePaise)}</span>
                    </div>
                  ))}
                </div>

                {/* Balance Payment Notice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-amber-900 font-semibold block">
                      Pay at Salon: {formatINR(booking.balancePaise)}
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      (25% advance of {formatINR(booking.advancePaise)} was paid online)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleCopySlip(booking)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedId === booking.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Slip!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy WhatsApp Slip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Past Visits & Reviews */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <p className="text-xs text-stone-500">No past completed visits yet.</p>
            </div>
          ) : (
            pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                      {booking.parlourName}
                    </h3>
                    <span className="text-xs text-stone-500">
                      Visited on {booking.appointmentDate} · Completed
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-800">
                    {formatINR(booking.totalPaise)}
                  </span>
                </div>

                <div className="text-xs text-stone-600">
                  <span className="font-medium text-stone-800">Services: </span>
                  {booking.services.map((s) => s.name).join(', ')}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openBookingModal(booking.parlourId)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-stone-600" />
                      <span>Book Again</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setReviewBookingId(booking.id)}
                    className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Leave a Review</span>
                  </button>
                </div>

                {/* Review Form Drawer */}
                {reviewBookingId === booking.id && (
                  <form
                    onSubmit={(e) => handleReviewSubmit(e, booking)}
                    className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3 mt-3"
                  >
                    <h4 className="text-xs font-bold text-stone-900">
                      Write a Review for {booking.parlourName}
                    </h4>

                    {reviewSuccess && (
                      <div className="p-2 bg-emerald-100 text-emerald-800 text-xs rounded flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Thank you! Your verified review has been submitted.</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Rating (1 to 5 Stars)
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Your Feedback / Experience
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="How was the styling, hygiene, and beautician service?"
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewBookingId(null)}
                        className="px-3 py-1 text-xs text-stone-600 hover:text-stone-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#1C1815] text-[#FAF8F5] text-xs font-semibold rounded-lg"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs max-w-xl space-y-4">
          <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
            Customer Profile Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
              <span className="text-stone-400 block text-[10px]">Full Name</span>
              <span className="font-semibold text-stone-900 text-sm">
                {customerProfile?.fullName || 'Sneha Kulkarni'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
              <span className="text-stone-400 block text-[10px]">Email Address</span>
              <span className="font-semibold text-stone-900">
                {customerProfile?.email || 'sneha.k@gmail.com'}
              </span>
            </div>

            {/* R4 & R10 Date of birth verification */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
              <div>
                <span className="text-stone-400 block text-[10px]">Date of birth</span>
                <span className="font-semibold text-stone-900">
                  {customerProfile?.dob || '1998-06-14'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                  Age: {customerProfile?.dob ? calculateAge(customerProfile.dob) : 28} years (16+ Verified)
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
              <span className="text-stone-400 block text-[10px]">WhatsApp number</span>
              <span className="font-mono font-semibold text-stone-900">
                {customerProfile?.whatsappNumber || '+91 98200 44321'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
