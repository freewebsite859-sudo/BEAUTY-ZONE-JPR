// SRC: 05_SCHEMA staff_services & staff_work_gallery, Design.md §4.5A
// Sample data behind a data module
// TODO-DOC: Wire to Supabase staff_services and staff_work_gallery tables

export interface StaffWorkGalleryItem {
  id: string;
  staffId: string;
  imageUrl: string;
  title: string;
  serviceCategory: string;
  caption: string;
}

export interface StaffServiceExpertise {
  staffId: string;
  serviceId: string;
  specializationLevel: 'Master Specialist' | 'Senior Artist' | 'Lead Stylist';
  serviceName: string;
  durationMinutes: number;
  pricePaise: number;
  category: string;
}

// Sample work gallery items curated per staff member (Schema: staff_work_gallery)
export const sampleStaffWorkGallery: StaffWorkGalleryItem[] = [
  // Priya Sharma (staff-1 / priya-sharma)
  {
    id: 'gal-101',
    staffId: 'staff-1',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    title: 'Bridal HD Sabyasachi Look',
    serviceCategory: 'Bridal & Groom',
    caption: 'Traditional warm golden glow with defined eyes and authentic Matha Patti styling.',
  },
  {
    id: 'gal-102',
    staffId: 'staff-1',
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    title: 'Cocktail Glam & Hollywood Waves',
    serviceCategory: 'Bridal & Groom',
    caption: 'Sweat-resistant soft glam with cascading glossy waves for reception evening.',
  },
  {
    id: 'gal-103',
    staffId: 'staff-1',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    title: 'Minimalist Glass Skin Bride',
    serviceCategory: 'Bridal & Groom',
    caption: 'Airbrush base with dewy cheeks, delicate winged eyeliner, and rose blush.',
  },

  // Ananya Iyer (staff-2 / ananya-iyer)
  {
    id: 'gal-201',
    staffId: 'staff-2',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    title: '24K Gold Hydra-Infusion Result',
    serviceCategory: 'Facial & Skin',
    caption: 'Deep pore vacuum extraction followed by hyaluronic ultrasound infusion.',
  },
  {
    id: 'gal-202',
    staffId: 'staff-2',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    title: 'Ayurvedic Kumkumadi Radiance',
    serviceCategory: 'Facial & Skin',
    caption: 'Herbal kansa wand lymphatic drainage and saffron mask revitalization.',
  },

  // Rahul Verma (staff-3 / rahul-verma)
  {
    id: 'gal-301',
    staffId: 'staff-3',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    title: 'Caramel Balayage & Blowout',
    serviceCategory: 'Hair Care',
    caption: 'Seamless dimensional honey tones customized for Indian dark hair bases.',
  },
  {
    id: 'gal-302',
    staffId: 'staff-3',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    title: 'Keratin Smoothing Transformation',
    serviceCategory: 'Hair Care',
    caption: 'Frizz-free silk finish designed to withstand humid coastal monsoon conditions.',
  },

  // Nisha Patel (staff-4 / nisha-patel)
  {
    id: 'gal-401',
    staffId: 'staff-4',
    imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80',
    title: 'French Chrome Gel Extensions',
    serviceCategory: 'Manicure & Pedicure',
    caption: 'Russian cuticle alignment with glazed doughnut chrome finish.',
  },
];

// Sample staff expertise linkages (Schema: staff_services)
export const sampleStaffServices: StaffServiceExpertise[] = [
  // Priya Sharma
  {
    staffId: 'staff-1',
    serviceId: 'srv-105',
    specializationLevel: 'Master Specialist',
    serviceName: 'Royal Bridal HD Makeup & Draping',
    durationMinutes: 150,
    pricePaise: 1850000,
    category: 'Bridal & Groom',
  },
  {
    staffId: 'staff-1',
    serviceId: 'srv-104',
    specializationLevel: 'Senior Artist',
    serviceName: 'Eyebrow & Upper Lip Threading',
    durationMinutes: 20,
    pricePaise: 14900,
    category: 'Waxing & Threading',
  },

  // Ananya Iyer
  {
    staffId: 'staff-2',
    serviceId: 'srv-101',
    specializationLevel: 'Master Specialist',
    serviceName: 'Hydra-Glow Brightening Facial',
    durationMinutes: 60,
    pricePaise: 249900,
    category: 'Facial & Skin',
  },
  {
    staffId: 'staff-2',
    serviceId: 'srv-107',
    specializationLevel: 'Lead Stylist',
    serviceName: 'O3+ Bridal D-Tan & Radiance Pack',
    durationMinutes: 35,
    pricePaise: 99900,
    category: 'Bleach & De-Tan',
  },

  // Rahul Verma
  {
    staffId: 'staff-3',
    serviceId: 'srv-102',
    specializationLevel: 'Master Specialist',
    serviceName: 'Keratin Smooth & Hair Spa Ritual',
    durationMinutes: 75,
    pricePaise: 299900,
    category: 'Hair Care',
  },

  // Nisha Patel
  {
    staffId: 'staff-4',
    serviceId: 'srv-103',
    specializationLevel: 'Lead Stylist',
    serviceName: 'Full Body Rica White Chocolate Waxing',
    durationMinutes: 50,
    pricePaise: 189900,
    category: 'Waxing & Threading',
  },
  {
    staffId: 'staff-4',
    serviceId: 'srv-106',
    specializationLevel: 'Senior Artist',
    serviceName: 'Rose Petal Manicure & Pedicure Duo',
    durationMinutes: 60,
    pricePaise: 139900,
    category: 'Manicure & Pedicure',
  },
];
