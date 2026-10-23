import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

export interface LightboxItem {
  id: string;
  url: string;
  title: string;
  category?: string;
  caption?: string;
  authorName?: string;
}

interface FullScreenLightboxProps {
  images: LightboxItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
  onBookAction?: () => void;
  bookActionLabel?: string;
  parlourName?: string;
}

export const FullScreenLightbox: React.FC<FullScreenLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onBookAction,
  bookActionLabel = 'Book Treatment',
  parlourName,
}) => {
  const [index, setIndex] = useState<number>(currentIndex);
  const [direction, setDirection] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpandedFit, setIsExpandedFit] = useState<boolean>(false);

  // Sync internal index when prop changes
  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const activeImage = images[index] || images[0];

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setDirection(-1);
    const prevIdx = index > 0 ? index - 1 : images.length - 1;
    setIndex(prevIdx);
    onNavigate?.(prevIdx);
  }, [index, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setDirection(1);
    const nextIdx = index < images.length - 1 ? index + 1 : 0;
    setIndex(nextIdx);
    onNavigate?.(nextIdx);
  }, [index, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Handle touch swipe gestures
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const handleShare = () => {
    if (activeImage?.url) {
      navigator.clipboard.writeText(activeImage.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !activeImage) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activeImage.title || 'Full-screen gallery lightbox'}
        className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden"
      >
        {/* Top Floating Control Bar */}
        <div className="relative z-20 px-4 sm:px-8 py-4 bg-gradient-to-b from-stone-950/90 to-transparent flex items-center justify-between text-white border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            {parlourName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{parlourName}</span>
              </span>
            )}

            <div>
              <h3 className="font-serif-luxury text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {activeImage.title}
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">
                Image {index + 1} of {images.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpandedFit((prev) => !prev)}
              className="p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center"
              title={isExpandedFit ? 'Fit to screen' : 'Expand full view'}
            >
              {isExpandedFit ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center"
              title="Copy image URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close lightbox"
              className="p-2.5 rounded-full bg-stone-800/90 hover:bg-stone-700 text-white transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center shadow-lg border border-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Viewport & Swipe Area */}
        <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
          {/* Navigation Arrow - Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white transition-all cursor-pointer shadow-xl border border-stone-700/80 min-h-11 min-w-11 flex items-center justify-center hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Swipeable Motion Frame */}
          <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeImage.id || index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing"
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className={`rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none select-none ${
                    isExpandedFit
                      ? 'w-full h-full object-cover'
                      : 'max-w-full max-h-full object-contain'
                  }`}
                />
              </motion.div>
            </AnimatePresence>

            {/* Mobile Touch Swipe Hint Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden flex items-center gap-1 text-[10px] text-stone-400 bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800 backdrop-blur-xs">
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>Swipe left or right to switch</span>
            </div>
          </div>

          {/* Navigation Arrow - Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white transition-all cursor-pointer shadow-xl border border-stone-700/80 min-h-11 min-w-11 flex items-center justify-center hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Details Footer & Thumbnail Strip */}
        <div className="relative z-20 bg-stone-950/90 border-t border-stone-800/80 p-4 sm:p-5 space-y-3">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {activeImage.category && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                    {activeImage.category}
                  </span>
                )}
                {activeImage.authorName && (
                  <span className="text-xs text-stone-300 font-medium">
                    By {activeImage.authorName}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-300 leading-relaxed max-w-2xl line-clamp-2">
                {activeImage.caption || activeImage.title}
              </p>
            </div>

            {/* Booking CTA Button */}
            {onBookAction && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookAction();
                }}
                className="px-5 py-2.5 bg-[#d4af37] text-stone-950 hover:bg-amber-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 min-h-11"
              >
                <Calendar className="w-4 h-4 text-stone-950" />
                <span>{bookActionLabel}</span>
              </button>
            )}
          </div>

          {/* Thumbnails Carousel */}
          {images.length > 1 && (
            <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
              {images.map((img, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={img.id || i}
                    type="button"
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                      onNavigate?.(i);
                    }}
                    className={`relative w-14 h-10 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400 scale-105 shadow-md opacity-100 ring-2 ring-amber-400/40'
                        : 'border-transparent opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
