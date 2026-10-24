import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  User,
  Shield,
  Store,
  ChevronDown,
  Menu,
  X,
  Clock,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addStoredRecentSearch } from '../services/recentSearchesService';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    currentUserRole,
    setCurrentUserRole,
    customerProfile,
    bookings,
    favorites,
    customerPortalActiveTab,
    setCustomerPortalActiveTab,
    openAuthModal,
    openBookingModal,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const indianCities = [
    'All Cities',
    'Mumbai',
    'Delhi NCR',
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Jaipur',
  ];

  const upcomingBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'advance_paid'
  ).length;

  const totalFavoritesCount = (favorites?.parlourIds?.length || 0) + (favorites?.staffIds?.length || 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => setCurrentView('showcase')}
              className="text-left group flex flex-col justify-center"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                  Aura
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium border border-stone-200">
                  BeautyZone
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-medium">
                Verified Beauty Parlours &amp; Salons · India
              </span>
            </button>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-stone-100/90 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg border border-stone-200/60 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50">
                  {indianCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        selectedCity === city
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Immediate search per rule 4 */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'showcase') setCurrentView('showcase');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.trim()) {
                      addStoredRecentSearch(searchQuery);
                    }
                    const el = document.getElementById('parlours-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder="Search beauty parlours, facials, hair spa, bridal makeup..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 placeholder:text-stone-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('showcase')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'showcase'
                  ? 'text-amber-900 bg-amber-100/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Find Parlours
            </button>

            <button
              onClick={() => {
                setCustomerPortalActiveTab('upcoming');
                setCurrentView('customer_portal');
              }}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'customer_portal' && customerPortalActiveTab !== 'favorites'
                  ? 'text-amber-900 bg-amber-100/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Appointments</span>
              {upcomingBookingsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] flex items-center justify-center font-bold">
                  {upcomingBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCustomerPortalActiveTab('favorites');
                setCurrentView('customer_portal');
              }}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'customer_portal' && customerPortalActiveTab === 'favorites'
                  ? 'text-rose-900 bg-rose-100/70 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title="Quick access to bookmarked salons and beauticians in customer portal"
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${totalFavoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
              <span>Saved Salons</span>
              {totalFavoritesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalFavoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('owner_dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                currentView === 'owner_dashboard'
                  ? 'text-amber-900 bg-amber-100/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-stone-500" />
              <span>Parlour Owner Portal</span>
            </button>

            <button
              onClick={() => setCurrentView('super_admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                currentView === 'super_admin'
                  ? 'text-amber-900 bg-amber-100/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-stone-500" />
              <span>Admin Console</span>
            </button>
          </nav>

          {/* Right Action: Role Switcher & Book Now CTA */}
          <div className="flex items-center gap-2">
            {/* Quick Role Tester Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md border border-stone-200/80 flex items-center gap-1 transition-colors"
                title="Switch active role for testing"
              >
                <User className="w-3 h-3 text-stone-500" />
                <span className="capitalize">{currentUserRole.replace('_', ' ')}</span>
                <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-stone-200 py-1 z-50">
                  <div className="px-3 py-1 border-b border-stone-100 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                    Test As Role
                  </div>
                  <button
                    onClick={() => {
                      setCurrentUserRole('customer');
                      setCurrentView('showcase');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Customer (Sneha)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUserRole('owner');
                      setCurrentView('owner_dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-700" />
                    <span>Salon Owner (Sunita)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUserRole('super_admin');
                      setCurrentView('super_admin');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-700" />
                    <span>Super Admin</span>
                  </button>
                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    onClick={() => {
                      openAuthModal('customer_signup');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 font-medium"
                  >
                    Register New Account
                  </button>
                </div>
              )}
            </div>

            {/* Quick Book Now Button */}
            <button
              onClick={() => openBookingModal('parlour-1')}
              className="px-4 py-2 text-xs font-semibold text-[#FAF8F5] bg-[#1C1815] hover:bg-stone-800 rounded-full transition-all shadow-sm hover:shadow flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 space-y-3">
            {/* Mobile search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parlour, facial, bridal..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg"
              />
            </div>

            {/* Mobile city selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-stone-400 shrink-0">City:</span>
              {indianCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-2.5 py-1 rounded whitespace-nowrap ${
                    selectedCity === city
                      ? 'bg-amber-900 text-white font-medium'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Mobile links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setCurrentView('showcase');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-left bg-stone-50 rounded-lg"
              >
                Browse Parlours
              </button>
              <button
                onClick={() => {
                  setCustomerPortalActiveTab('upcoming');
                  setCurrentView('customer_portal');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-left bg-stone-50 rounded-lg flex items-center justify-between"
              >
                <span>My Appointments</span>
                {upcomingBookingsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {upcomingBookingsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setCustomerPortalActiveTab('favorites');
                  setCurrentView('customer_portal');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-left bg-rose-50/70 border border-rose-200/60 rounded-lg flex items-center justify-between text-stone-900"
              >
                <div className="flex items-center gap-1.5">
                  <Heart className={`w-3.5 h-3.5 ${totalFavoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                  <span>Saved Favorites</span>
                </div>
                {totalFavoritesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {totalFavoritesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setCurrentView('owner_dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-left bg-stone-50 rounded-lg"
              >
                Parlour Owner Portal
              </button>
              <button
                onClick={() => {
                  setCurrentView('super_admin');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-left bg-stone-50 rounded-lg"
              >
                Super Admin Console
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
