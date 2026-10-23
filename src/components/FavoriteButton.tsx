import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export interface FavoriteButtonProps {
  type: 'parlour' | 'staff';
  id: string;
  name?: string;
  variant?: 'icon' | 'pill' | 'button';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onToggled?: (isFavorite: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  type,
  id,
  name,
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className = '',
  onToggled,
}) => {
  const { isFavoriteParlour, isFavoriteStaff, toggleFavoriteParlour, toggleFavoriteStaff } = useApp();

  const isFavorite = type === 'parlour' ? isFavoriteParlour(id) : isFavoriteStaff(id);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (type === 'parlour') {
      toggleFavoriteParlour(id);
    } else {
      toggleFavoriteStaff(id);
    }
    onToggled?.(!isFavorite);
  };

  const itemLabel = name || (type === 'parlour' ? 'salon' : 'beautician');
  const actionText = isFavorite ? `Remove ${itemLabel} from favorites` : `Save ${itemLabel} to favorites`;

  // Size configurations
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Variant styling
  if (variant === 'button') {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label={actionText}
        aria-pressed={isFavorite}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border min-h-11 ${
          isFavorite
            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80 shadow-xs'
            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-stone-900 shadow-xs'
        } ${className}`}
      >
        <Heart
          className={`${iconSizes[size]} transition-colors ${
            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400 group-hover:text-rose-500'
          }`}
        />
        <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
      </motion.button>
    );
  }

  if (variant === 'pill') {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label={actionText}
        aria-pressed={isFavorite}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
          isFavorite
            ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
            : 'bg-white/95 backdrop-blur-xs text-stone-600 border-stone-200 hover:text-rose-600 shadow-2xs'
        } ${className}`}
      >
        <Heart
          className={`${iconSizes[size]} transition-colors ${
            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
          }`}
        />
        {showLabel && <span>{isFavorite ? 'Saved' : 'Save'}</span>}
      </motion.button>
    );
  }

  // Default 'icon' button variant (standard on cards and image overlays)
  const iconPadding = {
    sm: 'p-1.5 min-w-[32px] min-h-[32px]',
    md: 'p-2 min-w-[38px] min-h-[38px]',
    lg: 'p-2.5 min-w-[44px] min-h-[44px]',
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.84 }}
      onClick={handleClick}
      aria-label={actionText}
      aria-pressed={isFavorite}
      title={isFavorite ? `Saved in favorites` : `Bookmark ${itemLabel}`}
      className={`relative inline-flex items-center justify-center rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-rose-400/40 ${
        isFavorite
          ? 'bg-rose-50/95 text-rose-500 border border-rose-200 shadow-sm'
          : 'bg-white/90 hover:bg-white text-stone-400 hover:text-rose-500 border border-stone-200/80 shadow-xs backdrop-blur-xs'
      } ${iconPadding[size]} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform duration-200 ${
          isFavorite
            ? 'fill-rose-500 text-rose-500 scale-105'
            : 'group-hover:scale-110 group-hover:text-rose-500'
        }`}
      />
      {showLabel && (
        <span
          className={`ml-1.5 text-xs font-medium ${
            isFavorite ? 'text-rose-700' : 'text-stone-600'
          }`}
        >
          {isFavorite ? 'Saved' : 'Favorite'}
        </span>
      )}
    </motion.button>
  );
};
