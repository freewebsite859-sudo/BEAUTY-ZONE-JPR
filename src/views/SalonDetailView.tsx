import React, { useState } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Calendar,
  Share2,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';
import { FavoriteButton } from '../components/FavoriteButton';
import { StaticSalonMap } from '../components/StaticSalonMap';
import { SalonPhotoGallery } from '../components/SalonPhotoGallery';

export const SalonDetailView: React.FC = () => {
  const {
    selectedParlourSlug,
    parlours,
    services,
    staff,
    reviews,
    openBookingModal,
    setSelectedStaffSlug,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'services' | 'gallery' | 'staff' | 'reviews' | 'location'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedLink, setCopiedLink] = useState(false);

  const parlour =
    parlours.find((p) => p.slug === selectedParlourSlug) ||
    parlours[0];

  if (!parlour) return null;

  const parlourServices = services.filter(
    (s) => s.parlourId === parlour.id && s.isActive
  );
  const parlourStaff = staff.filter((s) => s.parlourId === parlour.id);
  const parlourReviews = reviews.filter((r) => r.parlourId === parlour.id);

  const serviceCategories = ['All', ...new Set(parlourServices.map((s) => s.category))];

  const filteredServices =
    selectedCategory === 'All'
      ? parlourServices
      : parlourServices.filter((s) => s.category === selectedCategory);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('showcase')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all parlours</span>
        </button>

        <div className="flex items-center gap-2">
          <FavoriteButton
            type="parlour"
            id={parlour.id}
            name={parlour.name}
            variant="pill"
            showLabel={true}
          />

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Parlour'}</span>
          </button>
        </div>
      </div>

      {/* Parlour Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
          {/* Photo Gallery Grid with Lookbook trigger */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-stone-100 group">
            <div className="md:col-span-2 aspect-16/10 rounded-2xl overflow-hidden relative">
              <img
                src={parlour.coverImage}
                alt={parlour.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-2 hidden md:grid">
              <div className="aspect-16/10 rounded-2xl overflow-hidden relative">
                <img
                  src={parlour.images?.[0] || parlour.coverImage}
                  alt={parlour.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-16/10 rounded-2xl overflow-hidden relative">
                <img
                  src={parlour.images?.[1] || parlour.coverImage}
                  alt={parlour.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quick action button to launch category-filtered photo gallery */}
            <button
              onClick={() => setActiveTab('gallery')}
              className="absolute bottom-4 right-4 bg-[#1C1815]/90 hover:bg-[#1C1815] backdrop-blur-xs text-[#FAF8F5] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700/80"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Browse Photo Gallery &amp; Categories</span>
            </button>
          </div>

          {/* Header Info */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                    Verified BeautyZone Partner
                  </span>
                  <span className="text-xs text-stone-500">
                    GSTIN: {parlour.gstin || '27AABCU9603R1ZM'}
                  </span>
                </div>

                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                  {parlour.name}
                </h1>

                <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                  {parlour.tagline}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-medium text-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    {parlour.address}, {parlour.city} · {parlour.pincode}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {parlour.openingTime} – {parlour.closingTime} (IST)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    {parlour.phone}
                  </span>
                </div>
              </div>

              {/* Direct Booking CTA Card */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 lg:w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-sm text-stone-900">{parlour.rating}</span>
                    <span className="text-xs text-stone-500">({parlour.reviewCount} reviews)</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Open Now
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Advance to book:</span>
                    <span className="font-bold text-amber-900 font-mono">25% Online</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-500">
                    <span>Balance payment:</span>
                    <span>75% at Salon</span>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal(parlour.id)}
                  className="w-full py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>Book Appointment Now</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-t border-stone-200 pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#1C1815] text-[#FAF8F5]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Services &amp; Rate Card ({parlourServices.length})
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-[#1C1815] text-[#FAF8F5]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Photo Gallery &amp; Categories</span>
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-[#1C1815] text-[#FAF8F5]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Stylists &amp; Beauticians ({parlourStaff.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#1C1815] text-[#FAF8F5]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Client Reviews ({parlourReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'location'
                    ? 'bg-[#1C1815] text-[#FAF8F5]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Location &amp; Map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TAB 1: Services */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900">
                            {service.name}
                          </h3>
                          {service.popular && (
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {service.category} · {service.durationMinutes} mins
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-bold text-stone-900 font-mono">
                          {formatINR(service.pricePaise)}
                        </span>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          25% advance: {formatINR(Math.ceil(service.pricePaise * 0.25))}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Balance: {formatINR(service.pricePaise - Math.ceil(service.pricePaise * 0.25))} at salon
                    </span>
                    <button
                      onClick={() => openBookingModal(parlour.id, service.id)}
                      className="px-4 py-1.5 bg-[#1C1815] hover:bg-stone-800 text-[#FAF8F5] text-xs font-semibold rounded-lg transition-all"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Salon Physical Location & Static Map Preview */}
            <div className="pt-8 border-t border-stone-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-stone-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-800" />
                    <span>Physical Salon Location &amp; Premises</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Navigate to {parlour.name} on the map before your appointment
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('location')}
                  className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Directions &amp; Transit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <StaticSalonMap parlour={parlour} height="h-72 sm:h-84" />
            </div>
          </div>
        )}

        {/* TAB 2: Photo Gallery & Categories */}
        {activeTab === 'gallery' && (
          <SalonPhotoGallery parlour={parlour} />
        )}

        {/* TAB 3: Staff / Beauticians */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parlourStaff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.photo}
                      alt={member.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-stone-200"
                    />
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                        {member.fullName}
                      </h3>
                      <p className="text-xs text-amber-900 font-medium">
                        {member.roleTitle}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-stone-800">{member.rating}</span>
                        <span>({member.experienceYears} yrs experience)</span>
                      </div>
                    </div>
                  </div>
                  <FavoriteButton
                    type="staff"
                    id={member.id}
                    name={member.fullName}
                    size="sm"
                  />
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {member.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {member.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedStaffSlug(member.slug);
                      setCurrentView('staff_profile');
                    }}
                    className="text-xs font-semibold text-stone-700 hover:text-amber-900"
                  >
                    View Full Profile
                  </button>

                  <button
                    onClick={() => openBookingModal(parlour.id, undefined, member.id)}
                    className="px-3.5 py-1.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-lg text-xs font-semibold"
                  >
                    Book with Stylist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-3xl">
            {parlourReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {rev.customerName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                        <span>{rev.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified Appointment
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-amber-900 font-medium">
                  Treatment: {rev.serviceName}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.reply && (
                  <div className="bg-stone-50 p-3 rounded-xl border-l-2 border-amber-800 text-xs space-y-1">
                    <span className="font-semibold text-stone-900 block">
                      Parlour Response:
                    </span>
                    <p className="text-stone-600">{rev.reply.text}</p>
                    <span className="text-[10px] text-stone-400 block">
                      Replied on {rev.reply.repliedAt}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Physical Location & Static Google Maps */}
        {activeTab === 'location' && (
          <div className="space-y-8">
            {/* Location Header Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full w-fit mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>Physical Salon Location &amp; Directions</span>
                </div>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
                  Find &amp; Visit {parlour.name}
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  Centrally located in {parlour.area}, {parlour.city}. Easy connectivity via metro, auto, and reserved client valet parking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${parlour.phone}`}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 min-h-11 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>Call Reception</span>
                </a>

                <button
                  onClick={() => openBookingModal(parlour.id)}
                  className="px-4 py-2 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 min-h-11"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>

            {/* Static Google Maps Replica Component */}
            <StaticSalonMap parlour={parlour} height="h-96 sm:h-[420px]" />

            {/* Location Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Card 1: Full Address & Landmarks */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  <h3 className="text-sm">Postal Address</h3>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {parlour.name}<br />
                  {parlour.address}<br />
                  {parlour.area}, {parlour.city} - {parlour.pincode}<br />
                  {parlour.state}, India
                </p>
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-800">GST Registration: </span>
                  <span className="font-mono">{parlour.gstin || '27AABCU9603R1ZM'}</span>
                </div>
              </div>

              {/* Card 2: Operating Hours */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <Clock className="w-4 h-4 text-amber-800" />
                  <h3 className="text-sm">Business Timings</h3>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Monday – Saturday:</span>
                    <span className="font-medium text-stone-900">{parlour.openingTime} – {parlour.closingTime} IST</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Sunday:</span>
                    <span className="font-medium text-stone-900">{parlour.openingTime} – 07:00 PM IST</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Bridal Sessions:</span>
                    <span className="font-medium text-emerald-800">Early slots by prior booking</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Arrival & Booking Economics */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm">Arrival &amp; Advance Policy</h3>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Lock your slot with a <strong>25% online advance</strong>. The remaining 75% balance is settled at the parlour after your styling or treatment is complete.
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                  ✓ Free cancellation up to 24 hours prior to appointment time.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
