import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Car,
  Train,
  Clock,
  Phone,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { Parlour } from '../types';

interface StaticSalonMapProps {
  parlour: Parlour;
  className?: string;
  height?: string;
  interactive?: boolean; // Default false for pure static non-interactive luxury placeholder
}

// Coordinate & landmark lookup for major parlour locations in India
const CITY_COORDINATES: Record<string, { lat: number; lng: number; landmark: string; transit: string }> = {
  Mumbai: {
    lat: 19.0596,
    lng: 72.8295,
    landmark: 'Near Waterfield Junction & Turner Road',
    transit: '8 mins from Bandra Railway Station · West',
  },
  'Delhi NCR': {
    lat: 28.5700,
    lng: 77.2200,
    landmark: 'Opposite Metro Gate 2, Main Market',
    transit: '2 mins walk from South Extension Metro (Pink Line)',
  },
  Bengaluru: {
    lat: 12.9784,
    lng: 77.6408,
    landmark: '100ft Road cross junction, HAL 2nd Stage',
    transit: '5 mins from Indiranagar Metro Station (Purple Line)',
  },
  Hyderabad: {
    lat: 17.4319,
    lng: 78.4073,
    landmark: 'Road No. 36, Near Peddamma Temple',
    transit: 'Peddamma Gudi Metro Station (Blue Line)',
  },
  Pune: {
    lat: 18.5362,
    lng: 73.8940,
    landmark: 'Lane 7, Near North Main Road',
    transit: '15 mins from Pune Junction Railway Station',
  },
  Jaipur: {
    lat: 26.9124,
    lng: 75.7873,
    landmark: 'Near Panch Batti & MI Road, C Scheme',
    transit: '10 mins from Jaipur Junction Railway Station',
  },
};

export const StaticSalonMap: React.FC<StaticSalonMapProps> = ({
  parlour,
  className = '',
  height = 'h-80 sm:h-96',
  interactive = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [copied, setCopied] = useState<boolean>(false);

  const locInfo = CITY_COORDINATES[parlour.city] || {
    lat: 19.0760,
    lng: 72.8777,
    landmark: `${parlour.area}, near city centre`,
    transit: 'Local auto & taxi stands directly outside',
  };

  const handleCopyAddress = () => {
    const fullAddress = `${parlour.name}, ${parlour.address}, ${parlour.area}, ${parlour.city} - ${parlour.pincode}`;
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openGoogleMapsDirections = () => {
    const query = encodeURIComponent(`${parlour.name}, ${parlour.address}, ${parlour.city} ${parlour.pincode}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Zoom scale calculation for SVG vector map
  const scale = 1 + (zoomLevel - 15) * 0.18;

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-[#FAF8F5] font-sans select-none ${className}`}
      role="region"
      aria-label={`Static map location for ${parlour.name}`}
    >
      {/* Luxury Static Map Canvas with Vector Street Grid */}
      <div
        className={`relative w-full ${height} overflow-hidden transition-colors duration-500 ${
          mapType === 'satellite' ? 'bg-[#1b232a]' : 'bg-[#f4efe8]'
        }`}
      >
        <svg
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
        >
          {mapType === 'roadmap' ? (
            <>
              {/* Luxury Warm Canvas Base */}
              <rect width="800" height="450" fill="#f6f2eb" />

              {/* Park & Botanical Zones */}
              <path
                d="M 50 20 Q 120 40 180 30 T 260 90 T 200 160 T 110 140 Z"
                fill="#e2efe0"
                opacity="0.9"
              />
              <path
                d="M 560 280 Q 640 260 720 310 T 780 410 T 640 430 Z"
                fill="#e2efe0"
                opacity="0.8"
              />
              <text x="140" y="85" fontSize="10" fill="#5c8261" fontFamily="serif" fontWeight="500" fontStyle="italic">
                Botanical Garden
              </text>

              {/* Water Canal */}
              <path
                d="M 0 380 Q 200 370 400 420 T 800 410 L 800 450 L 0 450 Z"
                fill="#d8e8ed"
              />

              {/* Minor Residential Streets */}
              <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="80" y1="0" x2="80" y2="450" />
                <line x1="220" y1="0" x2="220" y2="450" />
                <line x1="360" y1="0" x2="360" y2="450" />
                <line x1="500" y1="0" x2="500" y2="450" />
                <line x1="640" y1="0" x2="640" y2="450" />
                <line x1="0" y1="100" x2="800" y2="100" />
                <line x1="0" y1="210" x2="800" y2="210" />
                <line x1="0" y1="310" x2="800" y2="310" />
              </g>

              {/* Secondary Avenues (Warm Sand Fill) */}
              <g stroke="#e8dcce" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 0 160 Q 250 170 400 230 T 800 260" fill="none" />
                <path d="M 400 0 Q 380 180 400 230 T 420 450" fill="none" />
              </g>

              {/* Gold Accent Arterial Highway */}
              <path
                d="M 0 70 Q 220 120 400 230 T 800 360"
                fill="none"
                stroke="#d4af37"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <path
                d="M 0 70 Q 220 120 400 230 T 800 360"
                fill="none"
                stroke="#fff6d6"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Luxury Road Labels */}
              <text x="120" y="60" fontSize="10" fill="#8c7762" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
                {parlour.city.toUpperCase()} ARTERIAL ROAD
              </text>
              <text x="415" y="110" fontSize="10" fill="#9e8e7c" fontFamily="sans-serif" fontWeight="500">
                {parlour.area} Boulevard
              </text>
            </>
          ) : (
            <>
              {/* Satellite Aerial Map View */}
              <rect width="800" height="450" fill="#1b252d" />
              <g fill="#283540" stroke="#1c262f" strokeWidth="1">
                <rect x="70" y="30" width="70" height="50" rx="3" />
                <rect x="150" y="30" width="50" height="50" rx="3" />
                <rect x="240" y="40" width="90" height="40" rx="3" />
                <rect x="420" y="30" width="70" height="70" rx="3" />
                <rect x="520" y="40" width="100" height="50" rx="3" />
                <rect x="70" y="120" width="60" height="70" rx="3" />
                <rect x="150" y="120" width="80" height="60" rx="3" />
                <rect x="250" y="120" width="70" height="70" rx="3" />
              </g>
              <g stroke="#3a4b56" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <line x1="80" y1="0" x2="80" y2="450" />
                <line x1="360" y1="0" x2="360" y2="450" />
                <path d="M 0 70 Q 220 120 400 230 T 800 360" stroke="#5a6b76" strokeWidth="12" />
              </g>
            </>
          )}

          {/* Central Pulsing Radar Halo */}
          <circle cx="400" cy="230" r="32" fill="#d4af37" opacity="0.15" />
          <circle cx="400" cy="230" r="16" fill="#1c1815" opacity="0.1" />
        </svg>

        {/* Luxury Gold & Deep Burgundy Location Pin Marker (Static Pin) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10"
          style={{ marginTop: '-4px' }}
        >
          <div className="relative flex flex-col items-center">
            {/* Elegant Luxury Badge Pin */}
            <div className="w-11 h-11 rounded-full bg-[#1C1815] border-2 border-amber-300 shadow-2xl flex items-center justify-center text-amber-300 relative">
              <MapPin className="w-6 h-6 fill-amber-300 text-[#1C1815] drop-shadow-xs" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[9px] font-bold flex items-center justify-center border border-white">
                ★
              </span>
            </div>
            {/* Teardrop Tip */}
            <div className="w-2.5 h-3.5 bg-[#1C1815] -mt-1 rounded-b-full shadow-md border-x border-b border-amber-300/60" />
            {/* Ground Reflection Shadow */}
            <div className="w-7 h-2 bg-stone-900/30 rounded-full blur-2xs mt-0.5" />
          </div>
        </div>

        {/* Top-Left: Luxury Badge Overlay */}
        <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 bg-[#1C1815]/90 backdrop-blur-md text-[#FAF8F5] px-3.5 py-1.5 rounded-xl border border-stone-700/80 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold block leading-none">
              Physical Location
            </span>
            <span className="text-xs font-serif-luxury font-bold leading-tight block">
              {parlour.name}
            </span>
          </div>
        </div>

        {/* Optional Interactive Controls (Only shown if interactive=true) */}
        {interactive && (
          <>
            <div className="absolute top-3.5 right-3.5 z-20 flex rounded-lg shadow-sm bg-white/95 backdrop-blur-xs border border-stone-200/80 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-[#1C1815] text-white font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-[#1C1815] text-white font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Satellite
              </button>
            </div>

            <div className="absolute bottom-6 right-3.5 z-20 flex flex-col rounded-lg shadow-md bg-white border border-stone-200/90 overflow-hidden divide-y divide-stone-100">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(18, prev + 1))}
                className="p-2 hover:bg-stone-50 text-stone-700 cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(12, prev - 1))}
                className="p-2 hover:bg-stone-50 text-stone-700 cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Bottom-Left Watermark */}
        <div className="absolute bottom-2 left-3 z-20 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-serif-luxury font-bold tracking-wider text-stone-700 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-stone-200/60 shadow-2xs">
            BeautyZone Location Map
          </span>
        </div>
      </div>

      {/* Static Luxury Details Footer Card */}
      <div className="p-5 bg-white border-t border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif-luxury text-sm font-bold text-stone-900">
              {parlour.name}
            </span>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200/60">
              {parlour.area}, {parlour.city}
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
            <span>
              {parlour.address}, {parlour.area}, {parlour.city} - {parlour.pincode}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-0.5">
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Navigation className="w-3 h-3 text-amber-800" />
              <span>{locInfo.landmark}</span>
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-stone-600">
              <Train className="w-3 h-3 text-stone-400" />
              <span>{locInfo.transit}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-11"
            title="Copy address to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Address Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={openGoogleMapsDirections}
            className="px-4 py-2 bg-[#1C1815] text-[#FAF8F5] hover:bg-stone-800 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer min-h-11"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-300" />
            <span>Get Directions</span>
            <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
