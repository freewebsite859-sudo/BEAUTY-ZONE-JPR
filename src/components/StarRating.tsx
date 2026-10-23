// SRC: Design.md §4.5A, Design.md §4.6, Design.md §10
import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number; // 0 to 5 (e.g. 4.8)
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showNumeric?: boolean;
  numericClassName?: string;
  count?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 'w-3 h-3', text: 'text-[11px]' },
  sm: { icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { icon: 'w-4 h-4', text: 'text-sm' },
  lg: { icon: 'w-5 h-5', text: 'text-base' },
  xl: { icon: 'w-6 h-6', text: 'text-xl' },
};

/**
 * Precision Star Rating Component with support for fractional fills (e.g., 4.7 stars),
 * accessible ARIA labels, and interactive rating selection.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showNumeric = false,
  numericClassName = 'font-bold text-stone-900 font-mono',
  count,
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const activeRating = hoverRating !== null ? hoverRating : rating;
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${rating.toFixed(1)} out of ${maxStars} stars`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const fillPercentage = Math.max(
            0,
            Math.min(100, Math.round((activeRating - index) * 100))
          );

          if (interactive) {
            return (
              <button
                key={index}
                type="button"
                role="radio"
                aria-checked={Math.round(rating) === starNumber}
                aria-label={`${starNumber} Star${starNumber > 1 ? 's' : ''}`}
                onMouseEnter={() => setHoverRating(starNumber)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onRate?.(starNumber)}
                className="p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded transition-transform hover:scale-110 min-h-6 min-w-6 flex items-center justify-center cursor-pointer"
              >
                <Star
                  className={`${sizeConfig.icon} transition-colors ${
                    fillPercentage > 0
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              </button>
            );
          }

          // Non-interactive precision fractional rendering
          return (
            <div key={index} className="relative inline-block" aria-hidden="true">
              {/* Background empty star */}
              <Star className={`${sizeConfig.icon} text-stone-200 fill-stone-100`} />

              {/* Foreground filled star with exact width clipping */}
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden h-full"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${sizeConfig.icon} text-amber-500 fill-amber-500`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNumeric && (
        <span className={`${sizeConfig.text} ${numericClassName}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className={`${sizeConfig.text} text-stone-400 font-normal`}>
          ({count})
        </span>
      )}
    </div>
  );
};
