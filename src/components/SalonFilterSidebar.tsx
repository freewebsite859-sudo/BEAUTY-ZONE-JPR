import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MapPin,
  IndianRupee,
  Sparkles,
  Star,
  Check,
  Tag,
  Building2,
  History,
  Clock,
  Heart,
} from 'lucide-react';
import { Parlour, SalonService } from '../types';
import { useRecentSearches } from '../services/recentSearchesService';

export interface SalonFilters {
  city: string;
  selectedAreas: string[];
  categories: string[];
  priceBracket: 'all' | 'under-500' | '500-1500' | '1500-3000' | 'above-3000' | 'custom';
  customMinPrice: string; // INR in Rupees
  customMaxPrice: string; // INR in Rupees
  minRating: number | null;
  onlyFavorites?: boolean;
  sortBy: 'recommended' | 'rating_desc' | 'reviews_desc' | 'price_asc' | 'price_desc';
}

export const defaultFilters: SalonFilters = {
  city: 'All Cities',
  selectedAreas: [],
  categories: [],
  priceBracket: 'all',
  customMinPrice: '',
  customMaxPrice: '',
  minRating: null,
  onlyFavorites: false,
  sortBy: 'recommended',
};

interface SalonFilterSidebarProps {
  filters: SalonFilters;
  onChange: (filters: SalonFilters) => void;
  onReset: () => void;
  totalResults: number;
  allParlours: Parlour[];
  allServices: SalonService[];
  savedParloursCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  searchQuery?: string;
  onSelectRecentSearch?: (query: string) => void;
}

export const SalonFilterSidebar: React.FC<SalonFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
  allParlours,
  allServices,
  savedParloursCount = 0,
  isMobileOpen = false,
  onCloseMobile,
  searchQuery,
  onSelectRecentSearch,
}) => {
  const { recentSearches, removeSearch, clearSearches } = useRecentSearches();

  // Collapsible section state for compact navigation
  const [openSections, setOpenSections] = useState({
    recent: true,
    price: true,
    location: true,
    category: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Extract unique cities from published parlours
  const availableCities = [
    'All Cities',
    ...Array.from(new Set(allParlours.map((p) => p.city))).filter(Boolean),
  ];

  // Extract localities based on current city filter
  const relevantParloursForAreas =
    filters.city === 'All Cities'
      ? allParlours
      : allParlours.filter((p) => p.city === filters.city);

  const availableAreasWithCounts = Array.from(
    relevantParloursForAreas.reduce((acc, p) => {
      if (p.area) {
        const key = p.area;
        acc.set(key, (acc.get(key) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  // Extract all unique service categories with counts
  const allAvailableCategories = [
    'Facial & Skin',
    'Bridal & Groom',
    'Hair Care',
    'Waxing & Threading',
    'Mehendi & Henna',
    'Spa & Massage',
    'Manicure & Pedicure',
    'Bleach & De-Tan',
  ];

  // Calculate count of parlours offering each category
  const categoryCounts = allAvailableCategories.reduce((acc, cat) => {
    const count = allParlours.filter((p) => {
      const hasFromServiceList = allServices.some(
        (s) => s.parlourId === p.id && s.category === cat && s.isActive
      );
      const hasFromCategories = p.serviceCategories?.includes(cat);
      return hasFromServiceList || hasFromCategories;
    }).length;
    acc[cat] = count;
    return acc;
  }, {} as Record<string, number>);

  // Compute active filters count (excluding default sortBy)
  const activeFiltersCount =
    (filters.city !== 'All Cities' ? 1 : 0) +
    filters.selectedAreas.length +
    filters.categories.length +
    (filters.priceBracket !== 'all' ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.onlyFavorites ? 1 : 0);

  // Handlers
  const handleCityChange = (newCity: string) => {
    onChange({
      ...filters,
      city: newCity,
      // Clear selected areas if they don't belong to the new city
      selectedAreas: [],
    });
  };

  const handleAreaToggle = (area: string) => {
    const nextAreas = filters.selectedAreas.includes(area)
      ? filters.selectedAreas.filter((a) => a !== area)
      : [...filters.selectedAreas, area];
    onChange({ ...filters, selectedAreas: nextAreas });
  };

  const handleCategoryToggle = (category: string) => {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: nextCategories });
  };

  const handlePriceBracketChange = (
    bracket: SalonFilters['priceBracket']
  ) => {
    onChange({
      ...filters,
      priceBracket: bracket,
    });
  };

  const handleCustomPriceChange = (
    field: 'customMinPrice' | 'customMaxPrice',
    val: string
  ) => {
    const sanitized = val.replace(/\D/g, '');
    onChange({
      ...filters,
      priceBracket: 'custom',
      [field]: sanitized,
    });
  };

  const handleRatingChange = (rating: number | null) => {
    onChange({
      ...filters,
      minRating: filters.minRating === rating ? null : rating,
    });
  };

  // Content of the filter sidebar (reused in desktop and mobile drawer)
  const filterContent = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-800" />
          <h3 className="font-serif-luxury text-base font-bold text-stone-900">
            Refine Salons
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-amber-900 text-[#FAF8F5] text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-amber-900 hover:text-amber-950 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Saved / Bookmarked Quick Filter */}
      <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
        <button
          type="button"
          onClick={() => onChange({ ...filters, onlyFavorites: !filters.onlyFavorites })}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Heart
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                filters.onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-stone-400 group-hover:text-rose-500'
              }`}
            />
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                Saved Salons Only
              </span>
              <span className="text-[10px] text-stone-500">
                Filter by your bookmarked parlours
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              filters.onlyFavorites
                ? 'bg-rose-500 text-white'
                : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            {savedParloursCount}
          </span>
        </button>
      </div>

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <div className="border-b border-stone-100 pb-5">
          <button
            onClick={() => toggleSection('recent')}
            className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-800" />
              Recent Searches
            </span>
            <span className="text-stone-400 group-hover:text-stone-700">
              {openSections.recent ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {openSections.recent && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Quick navigate back</span>
                <button
                  type="button"
                  onClick={() => clearSearches()}
                  className="text-[10px] text-amber-900 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {recentSearches.map((query) => {
                  const isCurrent =
                    searchQuery &&
                    searchQuery.trim().toLowerCase() === query.trim().toLowerCase();
                  return (
                    <div
                      key={query}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? 'bg-amber-100/70 text-amber-950 font-semibold border border-amber-300/80'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRecentSearch?.(query)}
                        className="flex items-center gap-2 flex-1 text-left truncate mr-2 cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{query}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(query);
                        }}
                        className="opacity-60 hover:opacity-100 text-stone-400 hover:text-red-700 p-0.5 rounded transition-opacity cursor-pointer"
                        title="Remove from history"
                        aria-label={`Remove recent search ${query}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Location & Neighbourhood Section */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-800" />
            Location &amp; Area
          </span>
          <span className="text-stone-400 group-hover:text-stone-700">
            {openSections.location ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {openSections.location && (
          <div className="mt-3 space-y-3">
            {/* City Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
                City / Region
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 transition-colors cursor-pointer"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Neighbourhood / Localities checkboxes */}
            {availableAreasWithCounts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase">
                  <span>Neighbourhood</span>
                  {filters.selectedAreas.length > 0 && (
                    <button
                      onClick={() => onChange({ ...filters, selectedAreas: [] })}
                      className="text-[10px] text-amber-900 hover:underline capitalize font-normal cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {availableAreasWithCounts.map(([area, count]) => {
                    const isChecked = filters.selectedAreas.includes(area);
                    return (
                      <label
                        key={area}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-50 text-amber-950 font-medium'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAreaToggle(area)}
                            className="rounded text-amber-800 focus:ring-amber-800 border-stone-300 w-3.5 h-3.5"
                          />
                          <span>{area}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Price Range Filter Section */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-amber-800" />
            Price Range
          </span>
          <span className="text-stone-400 group-hover:text-stone-700">
            {openSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-stone-500">
              Filter by service starting price or treatments offered.
            </p>

            {/* Price bracket options */}
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Budgets', desc: 'Any treatment cost' },
                { id: 'under-500', label: 'Under ₹500', desc: 'Touch-ups & basic care' },
                { id: '500-1500', label: '₹500 – ₹1,500', desc: 'Standard parlour care' },
                { id: '1500-3000', label: '₹1,500 – ₹3,000', desc: 'Premium & spa facials' },
                { id: 'above-3000', label: '₹3,000+', desc: 'Luxury hair & bridal' },
              ].map((bracket) => {
                const isSelected = filters.priceBracket === bracket.id;
                return (
                  <button
                    key={bracket.id}
                    type="button"
                    onClick={() =>
                      handlePriceBracketChange(
                        bracket.id as SalonFilters['priceBracket']
                      )
                    }
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C1815] text-[#FAF8F5] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{bracket.label}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-amber-300' : 'text-stone-400'
                        }`}
                      >
                        {bracket.desc}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Price Inputs */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-stone-500 uppercase mb-1.5">
                Or Custom Range (₹)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      type="text"
                      placeholder="Min"
                      value={filters.customMinPrice}
                      onChange={(e) =>
                        handleCustomPriceChange('customMinPrice', e.target.value)
                      }
                      className="w-full text-xs pl-6 pr-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-stone-400 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      type="text"
                      placeholder="Max"
                      value={filters.customMaxPrice}
                      onChange={(e) =>
                        handleCustomPriceChange('customMaxPrice', e.target.value)
                      }
                      className="w-full text-xs pl-6 pr-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Service Category Multi-Select Section */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            Service Categories
          </span>
          <span className="text-stone-400 group-hover:text-stone-700">
            {openSections.category ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {openSections.category && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Select all that apply</span>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => onChange({ ...filters, categories: [] })}
                  className="text-[10px] text-amber-900 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {allAvailableCategories.map((category) => {
                const isSelected = filters.categories.includes(category);
                const count = categoryCounts[category] || 0;
                return (
                  <label
                    key={category}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-medium'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded text-amber-800 focus:ring-amber-800 border-stone-300 w-3.5 h-3.5"
                      />
                      <span>{category}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Minimum Customer Rating */}
      <div className="pb-2">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Customer Rating
          </span>
          <span className="text-stone-400 group-hover:text-stone-700">
            {openSections.rating ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {openSections.rating && (
          <div className="mt-3 space-y-1.5">
            {[
              { val: null, label: 'All Ratings' },
              { val: 4.5, label: '4.5★ & Above' },
              { val: 4.8, label: '4.8★ & Above (Top Rated)' },
            ].map((r) => {
              const isSelected = filters.minRating === r.val;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleRatingChange(r.val)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100/70 text-amber-950 font-semibold border border-amber-300/80'
                      : 'hover:bg-stone-50 text-stone-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {r.val && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                    <span>{r.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-900" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Transparency Guarantee Card */}
      <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
        <div className="font-semibold text-stone-900 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-amber-800" />
          <span>Aura Platform Guarantee</span>
        </div>
        <p className="text-[10px] text-stone-500 leading-relaxed">
          All listed parlours accept a locked 25% advance. Remaining 75% balance is paid directly at the salon after service delivery.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 self-start bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
        {filterContent}
      </aside>

      {/* Mobile Drawer Backdrop & Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                  Filter Parlours
                </h3>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {filterContent}
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
              <button
                onClick={onReset}
                className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={onCloseMobile}
                className="flex-1 py-2.5 px-4 bg-[#1C1815] hover:bg-stone-800 text-[#FAF8F5] text-xs font-bold rounded-xl transition-colors shadow-xs text-center cursor-pointer"
              >
                Show {totalResults} Parlour{totalResults === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
