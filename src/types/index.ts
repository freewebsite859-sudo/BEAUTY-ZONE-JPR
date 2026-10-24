export type UserRole = 'customer' | 'owner' | 'super_admin' | 'guest';

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  dob: string; // YYYY-MM-DD format, must be 16+ years
  whatsappNumber: string; // e.g., +91 98200 12345
  createdAt: string;
  loyaltyPoints: number;
}

export interface SalonOwnerProfile {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  parlourId: string;
}

export type ParlourStatus = 'draft' | 'pending' | 'approved' | 'published' | 'suspended';

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface Parlour {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsappNumber: string;
  gstin?: string;
  coverImage: string;
  images: string[];
  lat?: number;
  lng?: number;
  rating: number;
  reviewCount: number;
  openingTime: string;
  closingTime: string;
  status: ParlourStatus;
  ownerId: string;
  ownerName: string;
  advancePercent: number; // default 25
  commissionBps: number; // default 1000 = 10%
  bankDetails: BankDetails;
  serviceCategories: string[];
  createdAt: string;
}

export type ServiceCategory =
  | 'Hair Care'
  | 'Facial & Skin'
  | 'Waxing & Threading'
  | 'Bridal & Groom'
  | 'Mehendi & Henna'
  | 'Spa & Massage'
  | 'Manicure & Pedicure'
  | 'Bleach & De-Tan';

export interface SalonService {
  id: string;
  parlourId: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  pricePaise: number; // Integer paise e.g. 149900 for ₹1,499
  isActive: boolean;
  image?: string;
  popular?: boolean;
}

export interface StaffMember {
  id: string;
  slug: string;
  parlourId: string;
  fullName: string;
  roleTitle: string; // e.g. Senior Hair Stylist, Master Beautician
  experienceYears: number;
  rating: number;
  reviewCount: number;
  photo: string;
  bio: string;
  specializations: string[];
  portfolioImages: string[];
  isPresentToday: boolean;
  commissionPercent: number; // e.g. 15%
}

export type BookingStatus = 'advance_paid' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type BalancePaymentStatus = 'pending' | 'paid_at_salon';

export interface BookingServiceItem {
  id: string;
  name: string;
  pricePaise: number;
  durationMinutes: number;
}

export interface Booking {
  id: string; // e.g. 'BZ-MUM-89241'
  parlourId: string;
  parlourName: string;
  parlourAddress: string;
  parlourCity: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerDob?: string;
  services: BookingServiceItem[];
  staffId?: string;
  staffName?: string;
  appointmentDate: string; // DD/MM/YYYY
  appointmentTime: string; // e.g. 10:30 AM
  totalPaise: number;
  advancePaise: number; // 25% of total
  balancePaise: number; // 75% payable at salon
  status: BookingStatus;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  paymentReference: string;
  balancePaymentStatus: BalancePaymentStatus;
  balancePaymentMode?: 'cash' | 'upi_at_salon' | 'card_at_salon';
  balancePaidAt?: string;
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  parlourId: string;
  customerId: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  serviceName: string;
  verifiedBookingId: string;
  reply?: {
    text: string;
    repliedAt: string;
  };
}

export interface InventoryItem {
  id: string;
  parlourId: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'units' | 'bottles' | 'kits' | 'tubes' | 'packs';
  reorderLevel: number;
  costPerUnitPaise: number;
  lastRestocked: string;
}

export interface PayoutRecord {
  id: string;
  parlourId: string;
  parlourName: string;
  date: string;
  grossAdvancePaise: number;
  platformCommissionPaise: number;
  refundsDeductedPaise: number;
  netPayoutPaise: number;
  status: 'scheduled' | 'processing' | 'paid';
  scheduledAt: string; // '22:00 IST'
  utrNumber?: string;
  bankOrUpi: string;
}

export interface FavoritesState {
  parlourIds: string[];
  staffIds: string[];
}

export interface PlatformSettings {
  advance_percent: number; // 25
  commission_bps: number; // 1000 = 10%
  daily_payout_time: string; // '10:00 PM IST'
  min_customer_age: number; // 16
}

