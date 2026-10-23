export interface SalonGalleryImage {
  id: string;
  parlourId: string;
  url: string;
  title: string;
  category: 'Interior' | 'Haircuts' | 'Nail Art' | 'Facial & Skin' | 'Bridal & Makeup';
  caption: string;
}

export const sampleSalonGalleryImages: SalonGalleryImage[] = [
  // Aura Luxury Salon (parlour-1)
  {
    id: 'sg-101',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
    title: 'Main Styling Floor & Private Suites',
    category: 'Interior',
    caption: 'Spacious marble-finished styling stations with ergonomic hydraulic chairs and ring lighting.',
  },
  {
    id: 'sg-102',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80',
    title: 'Herbal Hair Spa & Wash Basin Suite',
    category: 'Interior',
    caption: 'Relaxing soundproof shampoo station with recliners and aromatherapy diffusers.',
  },
  {
    id: 'sg-103',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
    title: 'Balayage & Caramel Highlights',
    category: 'Haircuts',
    caption: 'Custom hand-painted seamless balayage with Olaplex bond repair therapy.',
  },
  {
    id: 'sg-104',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
    title: 'Pastel Floral Gel Extensions',
    category: 'Nail Art',
    caption: 'Precision nail shaping with UV-cured gel extensions and hand-drawn floral art.',
  },
  {
    id: 'sg-105',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    title: '24K Gold Hydra-Facial Suite',
    category: 'Facial & Skin',
    caption: 'Deep pore vacuum extraction followed by 24K gold foil ultrasound massage.',
  },
  {
    id: 'sg-106',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    title: 'Royal Sabyasachi Bridal Look',
    category: 'Bridal & Makeup',
    caption: 'Traditional warm golden glow with defined eyes and authentic Matha Patti styling.',
  },
  {
    id: 'sg-107',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
    title: 'Airbrush Reception Makeup',
    category: 'Bridal & Makeup',
    caption: 'Sweat-resistant soft glam with cascading glossy waves for reception evening.',
  },
  {
    id: 'sg-108',
    parlourId: 'parlour-1',
    url: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=1000&q=80',
    title: 'French Ombre Chrome Nails',
    category: 'Nail Art',
    caption: 'Soft blush pink gradient fading into reflective metallic silver tips.',
  },

  // Roop Shringar (parlour-2)
  {
    id: 'sg-201',
    parlourId: 'parlour-2',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    title: 'Traditional Bridal Suite',
    category: 'Interior',
    caption: 'Private mirrors and dressing space dedicated for brides and immediate family.',
  },
  {
    id: 'sg-202',
    parlourId: 'parlour-2',
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
    title: 'Bridal Mehendi & Glitter Acrylics',
    category: 'Nail Art',
    caption: 'Intricate Rajasthani mehendi paired with gold foil encapsulation nails.',
  },
  {
    id: 'sg-203',
    parlourId: 'parlour-2',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
    title: 'Feathered Layers & Blowout',
    category: 'Haircuts',
    caption: 'Voluminous step cut with inward curtain bangs and heat protection spray.',
  },

  // Glow Botanica (parlour-3)
  {
    id: 'sg-301',
    parlourId: 'parlour-3',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80',
    title: 'Botanical Greenery Lounge',
    category: 'Interior',
    caption: 'Eco-conscious parlour setup with living plant walls and organic tea service.',
  },
  {
    id: 'sg-302',
    parlourId: 'parlour-3',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    title: 'Organic Korean Glass Skin Treatment',
    category: 'Facial & Skin',
    caption: 'Phyto-active enzyme peel with cooling jade roller drainage massage.',
  },
];
