import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PromotionalBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { setSelectedCategory, setCurrentView } = useApp();

  if (!isVisible) return null;

  return (
    <div className="bg-[#1C1815] text-[#FAF8F5] text-xs sm:text-sm py-2 px-4 transition-all duration-300 relative border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="hidden sm:inline-flex items-center justify-center p-1 rounded-full bg-amber-500/20 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-amber-200">Festive Glow & Bridal Season</span>
            <span className="text-stone-500 hidden md:inline">·</span>
            <span className="text-stone-300 hidden md:inline">
              Flat 15% off at verified parlours across Mumbai, Delhi & Bengaluru
            </span>
            <span className="text-stone-500 hidden sm:inline">·</span>
            <span className="bg-amber-400/10 text-amber-300 font-mono text-xs px-2 py-0.5 rounded border border-amber-400/30">
              UTSAV25
            </span>
            <span className="text-stone-500 hidden lg:inline">·</span>
            <span className="text-stone-400 text-xs hidden lg:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 25% Advance Protection
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSelectedCategory('Bridal & Groom');
              setCurrentView('showcase');
            }}
            className="text-xs font-medium text-amber-300 hover:text-amber-200 underline decoration-amber-400/40 underline-offset-2 flex items-center gap-1"
          >
            <span>Explore Bridal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss banner"
            className="text-stone-400 hover:text-stone-200 p-1 rounded hover:bg-stone-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
