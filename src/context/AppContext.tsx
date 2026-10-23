import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  CustomerProfile,
  SalonOwnerProfile,
  Parlour,
  SalonService,
  StaffMember,
  Booking,
  Review,
  InventoryItem,
  PayoutRecord,
  PlatformSettings,
  ParlourStatus,
  FavoritesState,
} from '../types';
import {
  initialPlatformSettings,
  initialParlours,
  initialServices,
  initialStaff,
  initialBookings,
  initialReviews,
  initialInventory,
  initialPayouts,
} from '../data/initialData';
import { calculateAdvance, calculateCommission, generateBookingId } from '../utils/formatters';

interface AppContextType {
  // Navigation & Routing state
  currentView: 'showcase' | 'salon_detail' | 'staff_profile' | 'customer_portal' | 'owner_dashboard' | 'super_admin';
  setCurrentView: (view: 'showcase' | 'salon_detail' | 'staff_profile' | 'customer_portal' | 'owner_dashboard' | 'super_admin') => void;
  customerPortalActiveTab: 'upcoming' | 'past' | 'favorites' | 'profile';
  setCustomerPortalActiveTab: (tab: 'upcoming' | 'past' | 'favorites' | 'profile') => void;
  selectedParlourSlug: string | null;
  setSelectedParlourSlug: (slug: string | null) => void;
  selectedStaffSlug: string | null;
  setSelectedStaffSlug: (slug: string | null) => void;

  // Search & Filters (immediate search per rule 4)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // User & Role
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  customerProfile: CustomerProfile | null;
  setCustomerProfile: (profile: CustomerProfile | null) => void;
  ownerProfile: SalonOwnerProfile | null;
  setOwnerProfile: (profile: SalonOwnerProfile | null) => void;

  // Data Collections
  parlours: Parlour[];
  services: SalonService[];
  staff: StaffMember[];
  bookings: Booking[];
  reviews: Review[];
  inventory: InventoryItem[];
  payouts: PayoutRecord[];
  platformSettings: PlatformSettings;

  // Modals
  isBookingModalOpen: boolean;
  openBookingModal: (parlourId?: string, serviceId?: string, staffId?: string) => void;
  closeBookingModal: () => void;
  bookingModalPreload: { parlourId?: string; serviceId?: string; staffId?: string };

  isAuthModalOpen: boolean;
  openAuthModal: (defaultTab?: 'customer_signup' | 'owner_signup' | 'login') => void;
  closeAuthModal: () => void;
  authModalDefaultTab: 'customer_signup' | 'owner_signup' | 'login';

  // Favorites / Bookmarks
  favorites: FavoritesState;
  toggleFavoriteParlour: (parlourId: string) => void;
  toggleFavoriteStaff: (staffId: string) => void;
  isFavoriteParlour: (parlourId: string) => boolean;
  isFavoriteStaff: (staffId: string) => boolean;

  // Actions
  registerCustomer: (data: { fullName: string; email: string; dob: string; whatsappNumber: string }) => boolean;
  registerOwnerAndParlour: (ownerData: { fullName: string; email: string; whatsappNumber: string }, parlourData: Partial<Parlour>) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'balancePaymentStatus'>) => Booking;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  recordBalancePaymentAtSalon: (bookingId: string, paymentMode: 'cash' | 'upi_at_salon' | 'card_at_salon') => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
  updateParlourStatus: (parlourId: string, status: ParlourStatus) => void;
  toggleStaffAttendance: (staffId: string) => void;
  updateInventoryQuantity: (itemId: string, newQuantity: number) => void;
  triggerDaily10PMPayout: () => PayoutRecord[];
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

// Safe storage utilities for iframe and restricted storage environments
function getSafeStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    return fallback;
  }
}

function setSafeStorage(key: string, value: unknown): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    // Ignore storage quota or access denial errors
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'showcase' | 'salon_detail' | 'staff_profile' | 'customer_portal' | 'owner_dashboard' | 'super_admin'>('showcase');
  const [customerPortalActiveTab, setCustomerPortalActiveTab] = useState<'upcoming' | 'past' | 'favorites' | 'profile'>('upcoming');
  const [selectedParlourSlug, setSelectedParlourSlug] = useState<string | null>('aura-luxury-salon-bandra');
  const [selectedStaffSlug, setSelectedStaffSlug] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // User state
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('customer');
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>({
    id: 'cust-1',
    fullName: 'Sneha Kulkarni',
    email: 'sneha.k@gmail.com',
    dob: '1998-06-14',
    whatsappNumber: '+91 98200 44321',
    createdAt: '2024-05-10T12:00:00Z',
  });
  const [ownerProfile, setOwnerProfile] = useState<SalonOwnerProfile | null>({
    id: 'owner-1',
    fullName: 'Sunita Mehra',
    email: 'sunita@aurasalon.in',
    whatsappNumber: '+91 98201 44552',
    parlourId: 'parlour-1',
  });

  // Data collections from initial data with safe error guards
  const [parlours, setParlours] = useState<Parlour[]>(() => {
    return getSafeStorage('bz_parlours', initialParlours);
  });

  const [services, setServices] = useState<SalonService[]>(() => {
    return getSafeStorage('bz_services', initialServices);
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    return getSafeStorage('bz_staff', initialStaff);
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    return getSafeStorage('bz_bookings', initialBookings);
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return getSafeStorage('bz_reviews', initialReviews);
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return getSafeStorage('bz_inventory', initialInventory);
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    return getSafeStorage('bz_payouts', initialPayouts);
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    return getSafeStorage('bz_settings', initialPlatformSettings);
  });

  // Favorites / Bookmarks state with persistence
  const [favorites, setFavorites] = useState<FavoritesState>(() => {
    return getSafeStorage<FavoritesState>('bz_favorites', {
      parlourIds: ['parlour-1'],
      staffIds: ['staff-1'],
    });
  });

  useEffect(() => {
    setSafeStorage('bz_favorites', favorites);
  }, [favorites]);

  const toggleFavoriteParlour = (parlourId: string) => {
    setFavorites((prev) => {
      const exists = prev.parlourIds.includes(parlourId);
      const updatedParlours = exists
        ? prev.parlourIds.filter((id) => id !== parlourId)
        : [...prev.parlourIds, parlourId];
      return { ...prev, parlourIds: updatedParlours };
    });
  };

  const toggleFavoriteStaff = (staffId: string) => {
    setFavorites((prev) => {
      const exists = prev.staffIds.includes(staffId);
      const updatedStaff = exists
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId];
      return { ...prev, staffIds: updatedStaff };
    });
  };

  const isFavoriteParlour = (parlourId: string) => favorites.parlourIds.includes(parlourId);
  const isFavoriteStaff = (staffId: string) => favorites.staffIds.includes(staffId);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalPreload, setBookingModalPreload] = useState<{ parlourId?: string; serviceId?: string; staffId?: string }>({});

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'customer_signup' | 'owner_signup' | 'login'>('customer_signup');

  // Persistence with safe guard
  useEffect(() => {
    setSafeStorage('bz_parlours', parlours);
  }, [parlours]);

  useEffect(() => {
    setSafeStorage('bz_services', services);
  }, [services]);

  useEffect(() => {
    setSafeStorage('bz_staff', staff);
  }, [staff]);

  useEffect(() => {
    setSafeStorage('bz_bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    setSafeStorage('bz_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    setSafeStorage('bz_inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    setSafeStorage('bz_payouts', payouts);
  }, [payouts]);

  useEffect(() => {
    setSafeStorage('bz_settings', platformSettings);
  }, [platformSettings]);

  // Modal actions
  const openBookingModal = (parlourId?: string, serviceId?: string, staffId?: string) => {
    setBookingModalPreload({ parlourId, serviceId, staffId });
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingModalPreload({});
  };

  const openAuthModal = (defaultTab: 'customer_signup' | 'owner_signup' | 'login' = 'customer_signup') => {
    setAuthModalDefaultTab(defaultTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // User actions
  const registerCustomer = (data: { fullName: string; email: string; dob: string; whatsappNumber: string }): boolean => {
    const newCustomer: CustomerProfile = {
      id: `cust-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      dob: data.dob,
      whatsappNumber: data.whatsappNumber.startsWith('+91') ? data.whatsappNumber : `+91 ${data.whatsappNumber}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerProfile(newCustomer);
    setCurrentUserRole('customer');
    return true;
  };

  const registerOwnerAndParlour = (
    ownerData: { fullName: string; email: string; whatsappNumber: string },
    parlourData: Partial<Parlour>
  ) => {
    const parlourId = `parlour-${Date.now()}`;
    const ownerId = `owner-${Date.now()}`;

    const newParlour: Parlour = {
      id: parlourId,
      slug: (parlourData.name || 'new-salon').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: parlourData.name || 'New Beauty Parlour',
      tagline: parlourData.tagline || 'Verified beauty parlour on BeautyZone',
      description: parlourData.description || 'Welcome to our parlour. We offer premium beauty, hair, and bridal services.',
      address: parlourData.address || 'Street address',
      area: parlourData.area || 'City Area',
      city: parlourData.city || 'Mumbai',
      state: parlourData.state || 'Maharashtra',
      pincode: parlourData.pincode || '400001',
      phone: parlourData.phone || ownerData.whatsappNumber,
      whatsappNumber: ownerData.whatsappNumber,
      gstin: parlourData.gstin || '',
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      ],
      rating: 5.0,
      reviewCount: 0,
      openingTime: '10:00 AM',
      closingTime: '08:30 PM',
      status: 'pending', // Starts in pending for super admin review!
      ownerId: ownerId,
      ownerName: ownerData.fullName,
      advancePercent: 25,
      commissionBps: 1000,
      bankDetails: {
        accountHolder: ownerData.fullName,
        accountNumber: '918800112233',
        ifscCode: 'HDFC0001234',
        upiId: `${ownerData.fullName.toLowerCase().replace(/\s+/g, '')}@upi`,
      },
      serviceCategories: ['Hair Care', 'Facial & Skin', 'Waxing & Threading'],
      createdAt: new Date().toISOString(),
    };

    const newOwner: SalonOwnerProfile = {
      id: ownerId,
      fullName: ownerData.fullName,
      email: ownerData.email,
      whatsappNumber: ownerData.whatsappNumber,
      parlourId: parlourId,
    };

    setParlours((prev) => [newParlour, ...prev]);
    setOwnerProfile(newOwner);
    setCurrentUserRole('owner');
    setSelectedParlourSlug(newParlour.slug);
    setCurrentView('owner_dashboard');
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'balancePaymentStatus'>): Booking => {
    const newId = generateBookingId(bookingData.parlourCity || 'MUM');
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'confirmed',
      balancePaymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const recordBalancePaymentAtSalon = (
    bookingId: string,
    paymentMode: 'cash' | 'upi_at_salon' | 'card_at_salon'
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              balancePaymentStatus: 'paid_at_salon',
              balancePaymentMode: paymentMode,
              balancePaidAt: new Date().toISOString(),
              status: 'completed',
            }
          : b
      )
    );
  };

  const addReview = (review: Omit<Review, 'id' | 'date'>) => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: formattedDate,
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  const addReviewReply = (reviewId: string, replyText: string) => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply: { text: replyText, repliedAt: formattedDate } }
          : r
      )
    );
  };

  const updateParlourStatus = (parlourId: string, status: ParlourStatus) => {
    setParlours((prev) =>
      prev.map((p) => (p.id === parlourId ? { ...p, status } : p))
    );
  };

  const toggleStaffAttendance = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isPresentToday: !s.isPresentToday } : s))
    );
  };

  const updateInventoryQuantity = (itemId: string, newQuantity: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, newQuantity), lastRestocked: new Date().toLocaleDateString('en-GB') }
          : item
      )
    );
  };

  // Daily 10:00 PM IST Auto Payout trigger (R9 requirement)
  // Payout = advance collected - refunds - commission (10% default)
  const triggerDaily10PMPayout = (): PayoutRecord[] => {
    const todayStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const newRecords: PayoutRecord[] = [];

    parlours.forEach((parlour) => {
      // Find today's advance collections for this parlour
      const parlourBookings = bookings.filter((b) => b.parlourId === parlour.id && b.status !== 'cancelled');
      const grossAdvance = parlourBookings.reduce((sum, b) => sum + b.advancePaise, 0);

      if (grossAdvance > 0) {
        const commission = calculateCommission(grossAdvance, parlour.commissionBps || platformSettings.commission_bps);
        const refunds = 0;
        const netPayout = grossAdvance - refunds - commission;

        const payoutRecord: PayoutRecord = {
          id: `pay-${Date.now()}-${parlour.id}`,
          parlourId: parlour.id,
          parlourName: parlour.name,
          date: todayStr,
          grossAdvancePaise: grossAdvance,
          platformCommissionPaise: commission,
          refundsDeductedPaise: refunds,
          netPayoutPaise: netPayout,
          status: 'paid',
          scheduledAt: '10:00 PM IST',
          utrNumber: `RAZORPAYX${Math.floor(10000000 + Math.random() * 90000000)}`,
          bankOrUpi: `${parlour.bankDetails?.accountHolder || parlour.name} (${parlour.bankDetails?.upiId || parlour.bankDetails?.accountNumber})`,
        };
        newRecords.push(payoutRecord);
      }
    });

    if (newRecords.length > 0) {
      setPayouts((prev) => [...newRecords, ...prev]);
    }

    return newRecords;
  };

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        customerPortalActiveTab,
        setCustomerPortalActiveTab,
        selectedParlourSlug,
        setSelectedParlourSlug,
        selectedStaffSlug,
        setSelectedStaffSlug,
        searchQuery,
        setSearchQuery,
        selectedCity,
        setSelectedCity,
        selectedCategory,
        setSelectedCategory,
        currentUserRole,
        setCurrentUserRole,
        customerProfile,
        setCustomerProfile,
        ownerProfile,
        setOwnerProfile,
        parlours,
        services,
        staff,
        bookings,
        reviews,
        inventory,
        payouts,
        platformSettings,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingModalPreload,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalDefaultTab,
        favorites,
        toggleFavoriteParlour,
        toggleFavoriteStaff,
        isFavoriteParlour,
        isFavoriteStaff,
        registerCustomer,
        registerOwnerAndParlour,
        createBooking,
        updateBookingStatus,
        recordBalancePaymentAtSalon,
        addReview,
        addReviewReply,
        updateParlourStatus,
        toggleStaffAttendance,
        updateInventoryQuantity,
        triggerDaily10PMPayout,
        updatePlatformSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
