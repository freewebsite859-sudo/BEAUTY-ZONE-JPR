import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
  History,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';
import { FavoriteButton } from '../components/FavoriteButton';
import {
  SalonFilterSidebar,
  SalonFilters,
  defaultFilters,
} from '../components/SalonFilterSidebar';
import { useRecentSearches } from '../services/recentSearchesService';

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
    favorites,
  } = useApp();

  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close recent searches dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExecuteSearch = (queryToExecute?: string) => {
    const target = queryToExecute !== undefined ? queryToExecute : searchQuery;
    if (target.trim()) {
      addSearch(target);
      setSearchQuery(target);
    }
    setIsSearchFocused(false);
    const el = document.getElementById('parlours-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Primary filter state for the discover experience
  const [filters, setFilters] = useState<SalonFilters>(() => ({
    ...defaultFilters,
    city: selectedCity || 'All Cities',
    categories: selectedCategory && selectedCategory !== 'All' ? [selectedCategory] : [],
  }));

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync external changes from Hero City dropdown
  useEffect(() => {
    if (selectedCity && selectedCity !== filters.city) {
      setFilters((prev) => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  // Sync external changes from Treatment category pills
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'All') {
        setFilters((prev) => ({ ...prev, categories: [] }));
      } else {
        setFilters((prev) => ({
          ...prev,
          categories: prev.categories.includes(selectedCategory)
            ? prev.categories
            : [selectedCategory],
        }));
      }
    }
  }, [selectedCategory]);

  const handleFiltersChange = (newFilters: SalonFilters) => {
    setFilters(newFilters);
    if (newFilters.city !== selectedCity) {
      setSelectedCity(newFilters.city);
    }
    if (newFilters.categories.length === 1) {
      setSelectedCategory(newFilters.categories[0]);
    } else if (newFilters.categories.length === 0) {
      setSelectedCategory('All');
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSelectedCity('All Cities');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  // Pre-calculate parlour price ranges for fast filtering
  const parlourPriceMap = useMemo(() => {
    const map = new Map<string, { minPaise: number; maxPaise: number; prices: number[] }>();
    parlours.forEach((p) => {
      const pServices = services.filter((s) => s.parlourId === p.id && s.isActive);
      if (pServices.length > 0) {
        const prices = pServices.map((s) => s.pricePaise);
        map.set(p.id, {
          minPaise: Math.min(...prices),
          maxPaise: Math.max(...prices),
          prices,
        });
      } else {
        map.set(p.id, {
          minPaise: 14900,
          maxPaise: 250000,
          prices: [14900],
        });
      }
    });
    return map;
  }, [parlours, services]);

  // Filter and sort parlours according to all sidebar & search criteria
  const filteredAndSortedParlours = useMemo(() => {
    const results = parlours.filter((parlour) => {
      // 1. Only published parlours for public showcase
      if (parlour.status !== 'published') return false;

      // 2. City filter
      if (filters.city !== 'All Cities' && parlour.city !== filters.city) {
        return false;
      }

      // 3. Localities / Areas filter
      if (filters.selectedAreas.length > 0) {
        if (!parlour.area || !filters.selectedAreas.includes(parlour.area)) {
          return false;
        }
      }

      // 4. Categories filter (multi-select)
      if (filters.categories.length > 0) {
        const parlourServices = services.filter((s) => s.parlourId === parlour.id && s.isActive);
        const matchesCategory = filters.categories.some((cat) => {
          const inServiceList = parlourServices.some((s) => s.category === cat);
          const inParlourCategories = parlour.serviceCategories?.includes(cat);
          return inServiceList || inParlourCategories;
        });
        if (!matchesCategory) return false;
      }

      // 5. Customer Rating filter
      if (filters.minRating !== null && parlour.rating < filters.minRating) {
        return false;
      }

      // 6. Price range filter
      const priceInfo = parlourPriceMap.get(parlour.id) || {
        minPaise: 14900,
        maxPaise: 14900,
        prices: [14900],
      };
      const minRupees = priceInfo.minPaise / 100;
      const maxRupees = priceInfo.maxPaise / 100;

      if (filters.priceBracket === 'under-500') {
        const hasUnder500 = priceInfo.prices.some((p) => p / 100 <= 500);
        if (!hasUnder500 && minRupees > 500) return false;
      } else if (filters.priceBracket === '500-1500') {
        const hasIn500To1500 = priceInfo.prices.some((p) => {
          const r = p / 100;
          return r >= 500 && r <= 1500;
        });
        if (!hasIn500To1500 && (minRupees > 1500 || maxRupees < 500)) return false;
      } else if (filters.priceBracket === '1500-3000') {
        const hasIn1500To3000 = priceInfo.prices.some((p) => {
          const r = p / 100;
          return r >= 1500 && r <= 3000;
        });
        if (!hasIn1500To3000 && (minRupees > 3000 || maxRupees < 1500)) return false;
      } else if (filters.priceBracket === 'above-3000') {
        const hasAbove3000 = priceInfo.prices.some((p) => p / 100 >= 3000);
        if (!hasAbove3000 && maxRupees < 3000) return false;
      } else if (filters.priceBracket === 'custom') {
        const customMin = filters.customMinPrice ? Number(filters.customMinPrice) : null;
        const customMax = filters.customMaxPrice ? Number(filters.customMaxPrice) : null;

        if (customMin !== null && !isNaN(customMin)) {
          if (maxRupees < customMin) return false;
        }
        if (customMax !== null && !isNaN(customMax)) {
          if (minRupees > customMax) return false;
        }
      }

      // 7. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = parlour.name?.toLowerCase().includes(q) ?? false;
        const areaMatch = parlour.area?.toLowerCase().includes(q) ?? false;
        const cityMatch = parlour.city?.toLowerCase().includes(q) ?? false;
        const serviceMatch = services.some(
          (s) =>
            s.parlourId === parlour.id &&
            ((s.name?.toLowerCase().includes(q) ?? false) ||
              (s.category?.toLowerCase().includes(q) ?? false))
        );
        if (!nameMatch && !areaMatch && !cityMatch && !serviceMatch) {
          return false;
        }
      }

      // 8. Saved Favorites Only filter
      if (filters.onlyFavorites && !favorites.parlourIds.includes(parlour.id)) {
        return false;
      }

      // 9. Proximity Geolocation Radius filter (5km, 10km, 20km)
      if (filters.proximityRadius !== null && filters.userCoords && parlour.lat !== undefined && parlour.lng !== undefined) {
        const R = 6371; // Earth radius in km
        const dLat = ((parlour.lat - filters.userCoords.lat) * Math.PI) / 180;
        const dLon = ((parlour.lng - filters.userCoords.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((filters.userCoords.lat * Math.PI) / 180) *
            Math.cos((parlour.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        if (distanceKm > filters.proximityRadius) {
          return false;
        }
      }

      return true;
    });

    // Sort results
    return results.sort((a, b) => {
      if (filters.sortBy === 'rating_desc') {
        return b.rating - a.rating;
      }
      if (filters.sortBy === 'reviews_desc') {
        return b.reviewCount - a.reviewCount;
      }
      if (filters.sortBy === 'price_asc') {
        const priceA = parlourPriceMap.get(a.id)?.minPaise || 0;
        const priceB = parlourPriceMap.get(b.id)?.minPaise || 0;
        return priceA - priceB;
      }
      if (filters.sortBy === 'price_desc') {
        const priceA = parlourPriceMap.get(a.id)?.minPaise || 0;
        const priceB = parlourPriceMap.get(b.id)?.minPaise || 0;
        return priceB - priceA;
      }
      // 'recommended': default score by rating and popularity
      return (
        b.rating * Math.log10(b.reviewCount + 10) -
        a.rating * Math.log10(a.reviewCount + 10)
      );
    });
  }, [parlours, services, filters, searchQuery, parlourPriceMap, favorites]);

  // Compute active filters count for badge
  const activeFiltersCount =
    (filters.city !== 'All Cities' ? 1 : 0) +
    filters.selectedAreas.length +
    filters.categories.length +
    (filters.priceBracket !== 'all' ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.onlyFavorites ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

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
                Beauty &amp; Care, <br />
                <span className="italic font-display-luxury font-normal text-stone-800">
                  Book Your Parlour Slot Online.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                Discover top beauty parlours, beauticians, and bridal makeup artists in your city. Book your appointment easily online; pay the remaining balance at the salon after your service.
              </p>

              {/* Immediate Search Bar Hero with Recent Searches Persistence */}
              <div ref={searchContainerRef} className="relative max-w-xl">
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-stone-200/80 relative z-20">
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
                        <option value="Jaipur">Jaipur</option>
                      </select>
                    </div>

                    <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                    <div className="flex-1 w-full px-3 py-1.5 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleExecuteSearch();
                          }
                        }}
                        placeholder="Bridal, Facial, Rica Waxing..."
                        className="w-full text-xs text-stone-800 bg-transparent focus:outline-none placeholder:text-stone-400 pr-6"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 text-xs cursor-pointer"
                          aria-label="Clear search input"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleExecuteSearch()}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-sm cursor-pointer"
                    >
                      Find Parlour
                    </button>
                  </div>
                </div>

                {/* Dropdown for Recent Searches on Focus */}
                {isSearchFocused && recentSearches.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-3 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <History className="w-3.5 h-3.5 text-amber-800" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => clearSearches()}
                        className="text-[10px] text-amber-900 hover:underline capitalize font-normal cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="pt-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {recentSearches.map((query) => (
                        <div
                          key={query}
                          className="group flex items-center justify-between px-4 py-2 hover:bg-amber-50/60 transition-colors"
                        >
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleExecuteSearch(query)}
                            className="flex items-center gap-2.5 flex-1 text-left text-xs text-stone-700 hover:text-amber-950 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{query}</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearch(query);
                            }}
                            className="opacity-40 hover:opacity-100 text-stone-400 hover:text-red-700 p-1 rounded cursor-pointer"
                            aria-label={`Remove recent search ${query}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches Quick-Access Chips Row */}
                {recentSearches.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 mr-1">
                      <History className="w-3 h-3 text-amber-800" />
                      <span>Recent:</span>
                    </span>
                    {recentSearches.slice(0, 4).map((query) => (
                      <span
                        key={query}
                        className="inline-flex items-center gap-1.5 text-[11px] bg-white/90 hover:bg-white text-stone-700 px-2.5 py-1 rounded-full border border-stone-200/90 shadow-2xs transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleExecuteSearch(query)}
                          className="hover:text-amber-950 font-medium cursor-pointer"
                        >
                          {query}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(query)}
                          className="text-stone-400 hover:text-red-700 p-0.5 rounded cursor-pointer"
                          aria-label={`Remove ${query}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {recentSearches.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(true)}
                        className="text-[10px] text-amber-900 hover:underline font-medium px-1 cursor-pointer"
                      >
                        +{recentSearches.length - 4} more
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-2 text-xs text-stone-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Booking Deposit Guarantee</span>
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
                      Deposit Online · Balance at Salon
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
              onClick={() => {
                setSelectedCategory(category);
                if (category === 'All') {
                  setFilters((prev) => ({ ...prev, categories: [] }));
                } else {
                  setFilters((prev) => ({ ...prev, categories: [category] }));
                }
              }}
              className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                (category === 'All' && filters.categories.length === 0) ||
                filters.categories.includes(category)
                  ? 'bg-[#1C1815] text-[#FAF8F5] shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Verified Parlours Directory with Filter Sidebar */}
      <section id="parlours-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium uppercase tracking-wider">
              <span>Verified Directory</span>
              <span aria-hidden="true">·</span>
              <span>{filters.city}</span>
              {filters.selectedAreas.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-900 font-semibold">
                    {filters.selectedAreas.length === 1
                      ? filters.selectedAreas[0]
                      : `${filters.selectedAreas.length} Areas`}
                  </span>
                </>
              )}
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
              Popular Parlours &amp; Salons
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredAndSortedParlours.length} verified parlour{filteredAndSortedParlours.length === 1 ? '' : 's'} with online booking deposit
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-800" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-amber-900 text-[#FAF8F5] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs text-stone-500 font-medium">Sort:</span>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as SalonFilters['sortBy'],
                    }))
                  }
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-800 cursor-pointer shadow-2xs pr-8"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating_desc">Highest Rated (★ 5.0 → 4.0)</option>
                  <option value="reviews_desc">Most Popular (Reviews)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Strip */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-stone-100/70 rounded-xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
              Active Filters:
            </span>

            {/* City Tag */}
            {filters.city !== 'All Cities' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-400">City:</span>
                <span className="font-medium">{filters.city}</span>
                <button
                  onClick={() => handleFiltersChange({ ...filters, city: 'All Cities', selectedAreas: [] })}
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Remove city filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Area Tags */}
            {filters.selectedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 text-xs bg-white text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs"
              >
                <span className="text-stone-400">Area:</span>
                <span className="font-medium">{area}</span>
                <button
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      selectedAreas: filters.selectedAreas.filter((a) => a !== area),
                    })
                  }
                  className="hover:text-red-700 ml-0.5"
                  aria-label={`Remove area filter ${area}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Category Tags */}
            {filters.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
              >
                <span className="font-medium">{cat}</span>
                <button
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      categories: filters.categories.filter((c) => c !== cat),
                    })
                  }
                  className="hover:text-red-700 ml-0.5"
                  aria-label={`Remove category filter ${cat}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Price Range Tag */}
            {filters.priceBracket !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-400">Price:</span>
                <span className="font-medium">
                  {filters.priceBracket === 'under-500' && 'Under ₹500'}
                  {filters.priceBracket === '500-1500' && '₹500 – ₹1,500'}
                  {filters.priceBracket === '1500-3000' && '₹1,500 – ₹3,000'}
                  {filters.priceBracket === 'above-3000' && '₹3,000+'}
                  {filters.priceBracket === 'custom' &&
                    `₹${filters.customMinPrice || 0} – ₹${filters.customMaxPrice || 'Max'}`}
                </span>
                <button
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      priceBracket: 'all',
                      customMinPrice: '',
                      customMaxPrice: '',
                    })
                  }
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Rating Tag */}
            {filters.minRating !== null && (
              <span className="inline-flex items-center gap-1 text-xs bg-white text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="font-medium">≥ {filters.minRating}</span>
                <button
                  onClick={() => handleFiltersChange({ ...filters, minRating: null })}
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Remove rating filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Query Tag */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 text-xs bg-white text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-400">Keyword:</span>
                <span className="font-medium font-mono">"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-700 ml-0.5"
                  aria-label="Clear keyword search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Saved Only Filter Tag */}
            {filters.onlyFavorites && (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs font-medium">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>Saved Only</span>
                <button
                  onClick={() => handleFiltersChange({ ...filters, onlyFavorites: false })}
                  className="hover:text-rose-950 ml-0.5 cursor-pointer"
                  aria-label="Remove saved salons filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Reset All Button */}
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-900 hover:text-amber-950 font-semibold ml-auto flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* 2-Column Discover Layout: Sidebar + Parlour Cards */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filtering Sidebar & Mobile Drawer Modal */}
          <SalonFilterSidebar
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            totalResults={filteredAndSortedParlours.length}
            allParlours={parlours}
            allServices={services}
            savedParloursCount={favorites?.parlourIds?.length || 0}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            searchQuery={searchQuery}
            onSelectRecentSearch={(q) => handleExecuteSearch(q)}
          />

          {/* Salons Results Container */}
          <div className="flex-1 min-w-0 w-full">
            {filteredAndSortedParlours.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3 shadow-xs">
                <Sparkles className="w-8 h-8 text-amber-700 mx-auto" />
                <h3 className="text-base font-semibold text-stone-800">
                  No parlours match your filters
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Try broadening your price range, clearing selected neighbourhoods, or expanding categories to see top parlours.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedParlours.map((parlour) => {
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
                      className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col group"
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

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <div className="bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-semibold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{parlour.rating}</span>
                            <span className="text-stone-400 font-normal">
                              ({parlour.reviewCount})
                            </span>
                          </div>
                          <FavoriteButton
                            type="parlour"
                            id={parlour.id}
                            name={parlour.name}
                            size="sm"
                          />
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
                                (Deposit: {formatINR(Math.ceil(minPrice * 0.25))})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedParlourSlug(parlour.slug);
                                setCurrentView('salon_detail');
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => openBookingModal(parlour.id)}
                              className="px-3.5 py-1.5 bg-[#1C1815] hover:bg-stone-800 text-[#FAF8F5] text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
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
          </div>
        </div>
      </section>

      {/* Meet the Experts Section (SRC: Design.md §4.4A, §9.3) */}
      <motion.section
        id="barbers-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="bg-stone-100/70 py-16 border-y border-stone-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <span className="text-xs text-amber-900 font-semibold uppercase tracking-wider">
                Certified Talent
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
                Meet the Experts
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Our Stylists &amp; Beauticians
              </p>
            </div>
            <p className="text-xs text-stone-500 max-w-sm">
              Hand-picked bridal makeup artists, skin estheticians, and hair stylists across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.slice(0, 4).map((member) => (
              <motion.div
                key={member.id}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
                }}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={member.photo}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <FavoriteButton
                        type="staff"
                        id={member.id}
                        name={member.fullName}
                        size="sm"
                      />
                    </div>
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
                  
                  {/* Up to 2-3 expertise tags (SRC: Design.md §4.4A) */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {member.specializations?.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/50"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

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
                    className="text-xs font-semibold text-stone-700 hover:text-amber-900 underline decoration-stone-300 underline-offset-2"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openBookingModal(member.parlourId, undefined, member.id)}
                    className="px-3 py-1.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 text-xs font-semibold rounded-lg transition-all"
                  >
                    Book Slot
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

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
