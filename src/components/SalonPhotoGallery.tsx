import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  Scissors,
  Sparkle,
  Building,
  Heart,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Parlour } from '../types';
import { sampleSalonGalleryImages, SalonGalleryImage } from '../data/salonGalleryData';
import { useApp } from '../context/AppContext';
import { FullScreenLightbox, LightboxItem } from './FullScreenLightbox';

interface SalonPhotoGalleryProps {
  parlour: Parlour;
  className?: string;
  onBookService?: () => void;
}

export const SalonPhotoGallery: React.FC<SalonPhotoGalleryProps> = ({
  parlour,
  className = '',
  onBookService,
}) => {
  const { openBookingModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Filter gallery images for this specific parlour (or fall back to sample gallery)
  const parlourGallery = useMemo(() => {
    const specific = sampleSalonGalleryImages.filter((img) => img.parlourId === parlour.id);
    if (specific.length > 0) return specific;

    // Fallback template gallery images mapped for new or other parlours
    return [
      {
        id: `sg-fallback-1`,
        parlourId: parlour.id,
        url: parlour.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
        title: `${parlour.name} Reception & Ambience`,
        category: 'Interior' as const,
        caption: 'Welcoming reception and sanitized private suites.',
      },
      {
        id: `sg-fallback-2`,
        parlourId: parlour.id,
        url: parlour.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        title: 'Bridal Makeover & Styling Suite',
        category: 'Bridal & Makeup' as const,
        caption: 'Spacious vanity setups for bridal trials and family makeover sessions.',
      },
      {
        id: `sg-fallback-3`,
        parlourId: parlour.id,
        url: parlour.images?.[1] || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
        title: 'Precision Cut & Blowout',
        category: 'Haircuts' as const,
        caption: 'Expert hair shaping, layering, and heat styling with premium products.',
      },
      {
        id: `sg-fallback-4`,
        parlourId: parlour.id,
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
        title: 'Nail Extension & Gel Art Station',
        category: 'Nail Art' as const,
        caption: 'Custom nail shaping, gel overlays, and intricate hand-painted artwork.',
      },
      {
        id: `sg-fallback-5`,
        parlourId: parlour.id,
        url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
        title: 'Hydra-Facial & Skin Care Room',
        category: 'Facial & Skin' as const,
        caption: 'Dermat-certified skin treatment suites equipped with vacuum extraction.',
      },
    ];
  }, [parlour]);

  // Gallery categories list
  const categories = ['All', 'Interior', 'Haircuts', 'Nail Art', 'Facial & Skin', 'Bridal & Makeup'];

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: parlourGallery.length };
    categories.slice(1).forEach((cat) => {
      counts[cat] = parlourGallery.filter((img) => img.category === cat).length;
    });
    return counts;
  }, [parlourGallery]);

  // Filtered gallery items
  const filteredGallery = useMemo(() => {
    if (selectedCategory === 'All') return parlourGallery;
    return parlourGallery.filter((img) => img.category === selectedCategory);
  }, [parlourGallery, selectedCategory]);

  // Lightbox keyboard controls (Escape to close, Left/Right arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;

      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredGallery.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => (prev !== null && prev < filteredGallery.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredGallery.length]);

  const activeImage = activeLightboxIndex !== null ? filteredGallery[activeLightboxIndex] : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit mb-1 border border-amber-200/60">
            <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>Verified Photo Gallery</span>
          </div>
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
            Explore {parlour.name} Lookbook
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Filter photos by interior ambience, haircuts, nail art, facials, and bridal makeovers.
          </p>
        </div>

        {/* Category Segmented Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/60">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#1C1815] text-[#FAF8F5] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Photo Grid */}
      {filteredGallery.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3 shadow-xs">
          <ImageIcon className="w-8 h-8 text-amber-700 mx-auto" />
          <h4 className="text-sm font-semibold text-stone-900">
            No photos found in category "{selectedCategory}"
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try switching to another category or select "All" to browse the full salon photo collection.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Show All Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGallery.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setActiveLightboxIndex(idx)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-[#1C1815]/85 backdrop-blur-xs text-[#FAF8F5] text-[10px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{img.category}</span>
                </div>

                {/* Hover Maximize Overlay */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 text-stone-900 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Larger</span>
                  </div>
                </div>
              </div>

              {/* Photo Caption */}
              <div className="p-4 space-y-1">
                <h4 className="font-serif-luxury text-sm font-bold text-stone-900 group-hover:text-amber-950 transition-colors">
                  {img.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {img.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full-Screen Swipeable Lightbox Modal */}
      <FullScreenLightbox
        images={filteredGallery}
        currentIndex={activeLightboxIndex ?? 0}
        isOpen={activeLightboxIndex !== null}
        onClose={() => setActiveLightboxIndex(null)}
        onNavigate={(newIndex) => setActiveLightboxIndex(newIndex)}
        parlourName={parlour.name}
        bookActionLabel="Book Treatment (25% Advance)"
        onBookAction={() => {
          if (onBookService) {
            onBookService();
          } else {
            openBookingModal(parlour.id);
          }
        }}
      />
    </div>
  );
};
