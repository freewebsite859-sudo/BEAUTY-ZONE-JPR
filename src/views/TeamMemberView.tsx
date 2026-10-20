import React from 'react';
import { ArrowLeft, Star, Calendar, ShieldCheck, Award, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';

export const TeamMemberView: React.FC = () => {
  const {
    selectedStaffSlug,
    staff,
    parlours,
    services,
    openBookingModal,
    setCurrentView,
    setSelectedParlourSlug,
  } = useApp();

  const member =
    staff.find((s) => s.slug === selectedStaffSlug) || staff[0];

  if (!member) return null;

  const parlour =
    parlours.find((p) => p.id === member.parlourId) || parlours[0];

  const specialistServices = services.filter(
    (s) => s.parlourId === parlour?.id && s.isActive
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => {
          if (parlour) {
            setSelectedParlourSlug(parlour.slug);
            setCurrentView('salon_detail');
          } else {
            setCurrentView('showcase');
          }
        }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {parlour?.name || 'Parlour'}</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-md">
              <img
                src={member.photo}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  {parlour?.name}
                </span>
                {member.isPresentToday && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Available in Salon Today
                  </span>
                )}
              </div>

              <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">
                {member.fullName}
              </h1>

              <p className="text-sm font-medium text-amber-950">
                {member.roleTitle}
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-stone-600 py-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-stone-900 text-sm">{member.rating}</span>
                <span className="text-stone-400">({member.reviewCount} client reviews)</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-800" />
                <span className="font-medium">{member.experienceYears} Years in Industry</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {member.bio}
            </p>

            {/* Specializations */}
            <div>
              <span className="text-xs font-semibold text-stone-800 block mb-2">
                Core Specializations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {member.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200/60"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Booking Action */}
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => openBookingModal(parlour?.id, undefined, member.id)}
                className="px-6 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book with {member.fullName.split(' ')[0]} (25% Advance)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Treatments handled by this stylist */}
      <div className="space-y-4">
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
          Services Offered by {member.fullName.split(' ')[0]}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialistServices.map((service) => (
            <div
              key={service.id}
              className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between"
            >
              <div>
                <h3 className="text-xs font-bold text-stone-900">{service.name}</h3>
                <span className="text-[11px] text-stone-500">
                  {service.durationMinutes} mins · {service.category}
                </span>
                <p className="text-[11px] text-emerald-700 font-medium">
                  25% advance: {formatINR(Math.ceil(service.pricePaise * 0.25))}
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-stone-900 block font-mono">
                  {formatINR(service.pricePaise)}
                </span>
                <button
                  onClick={() => openBookingModal(parlour?.id, service.id, member.id)}
                  className="mt-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
