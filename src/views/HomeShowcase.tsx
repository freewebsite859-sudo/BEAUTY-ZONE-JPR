import React from 'react';
import {
  MapPin,
  Star,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Calendar,
  CheckCircle,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';

export const HomeShowcase: React.FC = () => {
  const {
    parlours,
    services,
    staff,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    openBookingModal,
    setSelectedParlourSlug,
    setSelectedStaffSlug,
    setCurrentView,
  } = useApp();

  const categories = [
    'All',
    'Facial & Skin',
    'Bridal & Groom',
    'Hair Care',
    'Waxing & Threading',
    'Mehendi & Henna',
    'Spa & Massage',
    'Manicure & Pedicure',
  ];

  // Filter parlours based on published status (or show pending in admin), city, category, and immediate search
  const filteredParlours = parlours.filter((parlour) => {
    // Only published parlours for public showcase
    if (parlour.status !== 'published') return false;

    // City filter
    if (selectedCity !== 'All Cities' && parlour.city !== selectedCity) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All') {
      const hasCategory = services.some(
        (s) => s.parlourId === parlour.id && s.category === selectedCategory
      );
      if (!hasCategory) return false;
    }

    // Immediate search query (parlour name, area, city, services)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = parlour.name?.toLowerCase().includes(q) ?? false;
      const areaMatch = parlour.area?.toLowerCase().includes(q) ?? false;
      const cityMatch = parlour.city?.toLowerCase().includes(q) ?? false;
      const serviceMatch = services.some(
        (s) => s.parlourId === parlour.id && ((s.name?.toLowerCase().includes(q) ?? false) || (s.category?.toLowerCase().includes(q) ?? false))
      );
      return nameMatch || areaMatch || cityMatch || serviceMatch;
    }

    return true;
  });

  return (
    <div className="space-y-16 pb-12">
      {/* Aura Reference Clone Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F5ECE1]/60 to-[#FAF8F5] pt-12 pb-20 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-300/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>Verified Salon &amp; Beauty Parlour Platform · India</span>
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-900 leading-[1.12]">
                Elegance &amp; Care, <br />
                <span className="italic font-display-luxury font-normal text-amber-950">
                  Reserved with 25% Advance.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                Discover curated beauty parlours, certified beauticians, and bridal makeup artists in your city. Lock your appointment with just a 25% advance in INR; pay the remaining 75% balance in person after your pampering ritual.
              </p>

              {/* Immediate Search Bar Hero */}
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-stone-200/80 max-w-xl">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full flex items-center px-3 py-1.5">
                    <MapPin className="w-4 h-4 text-amber-800 shrink-0 mr-2" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-xs font-medium text-stone-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="All Cities">All Indian Cities</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                    </select>
                  </div>

                  <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                  <div className="flex-1 w-full px-3 py-1.5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Bridal, Facial, Rica Waxing..."
                      className="w-full text-xs text-stone-800 bg-transparent focus:outline-none placeholder:text-stone-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const el = document.getElementById('parlours-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-sm"
                  >
                    Find Parlour
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-2 text-xs text-stone-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>25% Advance Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>100% Verified Beauticians</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Daily 10 PM IST Salon Settlements</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
                    alt="Aura Luxury Salon Mumbai"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Parlour Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200/80 max-w-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                      alt="Stylist Priya Sharma"
                      className="w-11 h-11 rounded-full object-cover border border-amber-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        Priya Sharma
                      </div>
                      <div className="text-[11px] text-amber-900 font-medium">
                        Senior Bridal Stylist · Bandra West
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-stone-800">4.95</span>
                        <span>(162 appointments)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Advance Badge */}
                <div className="absolute -top-4 -right-4 bg-[#1C1815] text-[#FAF8F5] px-4 py-2 rounded-xl shadow-lg border border-stone-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-medium">
                      Transparent Pricing
                    </div>
                    <div className="text-xs font-bold font-mono">
                      Pay 25% Now · 75% at Salon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills/Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">
            Browse by Treatment
          </h2>
          <span className="text-xs text-stone-500">
            {categories.length - 1} Speciality Categories
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#1C1815] text-[#FAF8F5] shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Verified Parlours Directory */}
      <section id="parlours-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium uppercase tracking-wider">
              <span>Verified Directory</span>
              <span aria-hidden="true">·</span>
              <span>{selectedCity}</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
              Popular Parlours &amp; Salons
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Showing {filteredParlours.length} verified parlour(s) accepting 25% advance
          </p>
        </div>

        {filteredParlours.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
            <Sparkles className="w-8 h-8 text-amber-700 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800">
              No parlours match your filters
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try clearing your search query or selecting 'All Cities' to see top verified parlours in Mumbai, Delhi, and Bengaluru.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('All Cities');
                setSelectedCategory('All');
              }}
              className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParlours.map((parlour) => {
              const parlourServices = services.filter(
                (s) => s.parlourId === parlour.id && s.isActive
              );
              const minPrice =
                parlourServices.length > 0
                  ? Math.min(...parlourServices.map((s) => s.pricePaise))
                  : 14900;

              return (
                <div
                  key={parlour.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Cover Image & Rating Badge */}
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                    <img
                      src={parlour.coverImage}
                      alt={parlour.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1C1815]/85 backdrop-blur-xs text-[#FAF8F5] text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Verified Parlour</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-semibold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{parlour.rating}</span>
                      <span className="text-stone-400 font-normal">
                        ({parlour.reviewCount})
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-mono px-2 py-0.5 rounded">
                      {parlour.openingTime} – {parlour.closingTime} IST
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {parlour.area}, {parlour.city} · {parlour.pincode}
                        </span>
                      </div>

                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {parlour.name}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {parlour.tagline}
                      </p>

                      {/* Service categories available */}
                      <div className="pt-2 flex flex-wrap gap-1">
                        {parlour.serviceCategories?.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                        {(parlour.serviceCategories?.length ?? 0) > 3 && (
                          <span className="text-[10px] text-stone-400 px-1 py-0.5">
                            +{(parlour.serviceCategories?.length ?? 0) - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pricing & Booking Action */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">
                          Starting from
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-stone-900 font-mono">
                            {formatINR(minPrice)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            (25% adv: {formatINR(Math.ceil(minPrice * 0.25))})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedParlourSlug(parlour.slug);
                            setCurrentView('salon_detail');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => openBookingModal(parlour.id)}
                          className="px-3.5 py-1.5 bg-[#1C1815] hover:bg-stone-800 text-[#FAF8F5] text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Beauticians & Stylists Spotlight */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <span className="text-xs text-amber-900 font-semibold uppercase tracking-wider">
                Certified Talent
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
                Top Beauticians &amp; Stylists
              </h2>
            </div>
            <p className="text-xs text-stone-500 max-w-sm">
              Hand-picked bridal makeup artists, skin estheticians, and hair stylists across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={member.photo}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                    {member.isPresentToday && (
                      <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Available Today
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{member.experienceYears} Years Exp.</span>
                    <div className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{member.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                    {member.fullName}
                  </h3>
                  <p className="text-xs text-stone-500 mb-2">
                    {member.roleTitle}
                  </p>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedStaffSlug(member.slug);
                      setCurrentView('staff_profile');
                    }}
                    className="text-xs font-semibold text-stone-700 hover:text-amber-900"
                  >
                    View Bio
                  </button>
                  <button
                    onClick={() => openBookingModal(member.parlourId, undefined, member.id)}
                    className="px-3 py-1 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-lg transition-all"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "Why BeautyZone" Platform Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs text-amber-900 font-semibold uppercase tracking-wider">
            Engineered for India
          </span>
          <h2 className="font-serif-luxury text-3xl font-semibold text-stone-900 mt-2">
            The Trust Standard in Beauty &amp; Wellness
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Eliminating parlour no-shows and booking uncertainty with fair, transparent Indian advance economics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold">
              25%
            </div>
            <h3 className="text-base font-semibold text-stone-900">
              25% Advance Protection
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Customers never have to prepay 100% upfront. Paying 25% locks your stylist and slot with no queues, while the balance is paid after treatment satisfaction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
              10 PM
            </div>
            <h3 className="text-base font-semibold text-stone-900">
              Daily 10:00 PM Auto Payouts
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Parlour owners don't need manual withdrawal requests. Every night at 10:00 PM IST, the platform settles all completed advance payments directly to owner bank/UPI accounts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-800 flex items-center justify-center font-bold">
              GST
            </div>
            <h3 className="text-base font-semibold text-stone-900">
              Indian English &amp; GST POS
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Built natively with everyday Indian English, authentic parlour treatments (Facial, Rica waxing, Mehendi), Indian currency format in paise, and GST-ready invoices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
