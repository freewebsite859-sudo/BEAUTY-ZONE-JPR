// SRC: Design.md §4.5A, Design.md §10, 00_MASTER §7 row 6, 11_SCREENS §A
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, Award, X, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';
import {
  sampleStaffWorkGallery,
  sampleStaffServices,
  StaffWorkGalleryItem,
} from '../data/staffProfileData';
import { StaffRatingScorecard } from '../components/StaffRatingScorecard';
import { StaffAvailabilityCard } from '../components/StaffAvailabilityCard';
import { StarRating } from '../components/StarRating';
import { FavoriteButton } from '../components/FavoriteButton';
import { FullScreenLightbox, LightboxItem } from '../components/FullScreenLightbox';

// Shared template component for /team/:slug and /salon/:slug/team/:staffId (00_MASTER §7 row 6)
export const TeamMemberView: React.FC = () => {
  const {
    selectedStaffSlug,
    staff,
    parlours,
    services,
    bookings,
    reviews,
    addReview,
    customerProfile,
    openBookingModal,
    setCurrentView,
    setSelectedParlourSlug,
  } = useApp();

  // Selected gallery image index for full-screen swipeable lightbox
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Match member by slug OR id (supporting both /team/:slug and /salon/:slug/team/:staffId)
  const member =
    staff.find((s) => s.slug === selectedStaffSlug || s.id === selectedStaffSlug) ||
    staff[0];

  const parlour =
    parlours.find((p) => p.id === member?.parlourId) || parlours[0];

  // Work gallery for this specific staff member (SRC: 05_SCHEMA staff_work_gallery)
  const memberGallery = sampleStaffWorkGallery.filter(
    (item) => item.staffId === member?.id
  );

  // Specific service expertise list for this staff member (SRC: 05_SCHEMA staff_services)
  const memberExpertise = sampleStaffServices.filter(
    (exp) => exp.staffId === member?.id
  );

  // Fallback to active parlour services if no specific expertise mapped
  const fallbackServices = services.filter(
    (s) => s.parlourId === parlour?.id && s.isActive
  );

  // Keyboard accessibility for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLightboxIndex !== null) {
        setActiveLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex]);

  if (!member) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb / Back Link to Team Section (SRC: Design.md §4.5A) */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <button
          onClick={() => {
            if (parlour) {
              setSelectedParlourSlug(parlour.slug);
              setCurrentView('salon_detail');
            } else {
              setCurrentView('showcase');
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-2 px-3 rounded-lg hover:bg-stone-100 min-h-11 min-w-11"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {parlour?.name || 'Parlour'}</span>
        </button>

        <span className="text-xs text-stone-400 font-mono">
          Route: /team/{member.slug}
        </span>
      </nav>

      {/* Staff Profile Header Card (SRC: Design.md §4.5A) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Portrait */}
          <div className="md:col-span-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-md border border-stone-200/80">
              <img
                src={member.photo}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info & Bio */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {parlour?.name}
                </span>
                {member.isPresentToday && (
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Available in Salon Today
                  </span>
                )}
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {member.fullName}
              </h1>

              <p className="text-sm font-medium text-amber-950">
                {member.roleTitle}
              </p>
            </div>

            {/* Experience & Star Ratings */}
            <div className="flex items-center gap-4 text-xs text-stone-600 py-1 flex-wrap">
              <a
                href="#staff-ratings-section"
                className="flex items-center gap-1.5 hover:bg-stone-100/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-stone-200"
                title="Jump to Customer Satisfaction & Star Ratings"
              >
                <StarRating
                  rating={member.rating}
                  size="sm"
                  showNumeric={true}
                  count={member.reviewCount}
                />
              </a>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-800" />
                <span className="font-medium">{member.experienceYears} Years Industry Experience</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              {member.bio}
            </p>

            {/* Concise Service-Expertise Tags (SRC: Design.md §4.5A) */}
            <div>
              <span className="text-xs font-semibold text-stone-800 block mb-2 uppercase tracking-wider">
                Expertise &amp; Specialties
              </span>
              <div className="flex flex-wrap gap-1.5">
                {member.specializations?.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs font-medium text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200/60"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Real-time Availability & Next Slot Indicator (Mock Data Service backed) */}
            <StaffAvailabilityCard
              member={member}
              parlour={parlour}
              bookings={bookings}
            />

            {/* Primary CTA: Book with [Staff Name] (SRC: Design.md §4.5A) & Bookmark Favorite */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openBookingModal(parlour?.id, undefined, member.id)}
                className="px-6 py-3 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 min-h-11 min-w-11"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book with {member.fullName.split(' ')[0]} (25% Advance)</span>
              </button>

              <FavoriteButton
                type="staff"
                id={member.id}
                name={member.fullName}
                variant="button"
                size="md"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Expertise Section: Services provided by this staff member (SRC: Design.md §4.5A) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Services &amp; Specializations
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Treatments performed by {member.fullName.split(' ')[0]} at {parlour?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(memberExpertise.length > 0 ? memberExpertise : fallbackServices).map((service: any) => {
            const isCustomExp = 'specializationLevel' in service;
            const pricePaise = service.pricePaise;
            const advancePaise = Math.ceil(pricePaise * 0.25);

            return (
              <div
                key={isCustomExp ? service.serviceId : service.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-stone-900">
                      {isCustomExp ? service.serviceName : service.name}
                    </h3>
                    {isCustomExp && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                        {service.specializationLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {service.durationMinutes} mins
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{service.category}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-stone-900 font-mono block">
                      {formatINR(pricePaise)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      25% advance: {formatINR(advancePaise)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      openBookingModal(
                        parlour?.id,
                        isCustomExp ? service.serviceId : service.id,
                        member.id
                      )
                    }
                    className="px-4 py-2 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-lg transition-all min-h-11 min-w-11"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personal Work Gallery (SRC: Design.md §4.5A) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
            Personal Work Gallery
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified styling, bridal looks, and hair transformations by {member.fullName}
          </p>
        </div>

        {memberGallery.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-xs text-stone-500">
            Work gallery photos being updated for {member.fullName}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberGallery.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveLightboxIndex(idx)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="aspect-4/3 overflow-hidden bg-stone-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-[#1C1815]/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    {item.serviceCategory}
                  </div>
                </div>

                <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold pt-2 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Click to enlarge
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Star-based Customer Satisfaction Scorecard (SRC: Design.md §4.5A, §4.6) */}
      <StaffRatingScorecard
        staffId={member.id}
        staffName={member.fullName}
        averageRating={member.rating}
        totalReviewCount={member.reviewCount}
        reviews={reviews.filter((r) => r.parlourId === parlour?.id)}
        onAddReview={(newRev) => {
          addReview({
            parlourId: parlour?.id || 'parlour-1',
            customerId: customerProfile?.id || 'cust-1',
            customerName: customerProfile?.fullName || 'Verified Client',
            rating: newRev.rating,
            comment: newRev.comment,
            serviceName: newRev.serviceName,
            verifiedBookingId: `BZ-VFD-${Math.floor(10000 + Math.random() * 90000)}`,
          });
        }}
      />

      {/* Full-Screen Swipeable Lightbox Modal */}
      <FullScreenLightbox
        images={memberGallery.map((g) => ({
          id: g.id,
          url: g.imageUrl,
          title: g.title,
          category: g.serviceCategory,
          caption: g.caption,
          authorName: member.fullName,
        }))}
        currentIndex={activeLightboxIndex ?? 0}
        isOpen={activeLightboxIndex !== null}
        onClose={() => setActiveLightboxIndex(null)}
        onNavigate={(newIndex) => setActiveLightboxIndex(newIndex)}
        parlourName={parlour?.name}
        bookActionLabel={`Book with ${member.fullName.split(' ')[0]}`}
        onBookAction={() => {
          openBookingModal(parlour?.id, undefined, member.id);
        }}
      />
    </div>
  );
};
