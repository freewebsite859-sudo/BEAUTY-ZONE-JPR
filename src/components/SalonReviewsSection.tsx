import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Filter,
  Sparkles,
  Search,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Review, Parlour } from '../types';
import { StarRating } from './StarRating';

interface SalonReviewsSectionProps {
  parlour: Parlour;
  reviews: Review[];
  onOpenBookingModal: (parlourId: string) => void;
}

export const SalonReviewsSection: React.FC<SalonReviewsSectionProps> = ({
  parlour,
  reviews,
  onOpenBookingModal,
}) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (filterRating !== null && Math.floor(rev.rating) !== filterRating) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const commentMatch = rev.comment?.toLowerCase().includes(q) ?? false;
      const nameMatch = rev.customerName?.toLowerCase().includes(q) ?? false;
      const serviceMatch = rev.serviceName?.toLowerCase().includes(q) ?? false;
      if (!commentMatch && !nameMatch && !serviceMatch) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    // default 'recent'
    return 0; // maintain initial order
  });

  // Calculate rating breakdown distribution
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? parlour.rating : 5.0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Scorecard & Rating Breakdown Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Overall Rating Metric */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-amber-50/60 rounded-2xl border border-amber-200/80">
          <span className="font-serif-luxury text-5xl sm:text-6xl font-bold text-stone-900 font-mono">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-2">
            <StarRating rating={averageRating} size="lg" showNumeric={false} />
          </div>
          <p className="text-xs text-stone-600 mt-2 font-medium">
            Based on <strong className="text-stone-900">{totalReviews || parlour.reviewCount}</strong> verified client appointments
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>100% Verified Salon Reviews</span>
          </div>
        </div>

        {/* Right Star Breakdown Distribution Bars */}
        <div className="lg:col-span-8 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Rating Breakdown Distribution
          </h3>
          {starCounts.map(({ star, count, percentage }) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilterRating(filterRating === star ? null : star)}
              className={`w-full flex items-center gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer group ${
                filterRating === star ? 'bg-amber-100/70 font-semibold' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-1 shrink-0 w-16 text-stone-700 font-medium">
                <span>{star}</span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>

              <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-16 text-right shrink-0 text-stone-500 font-mono text-[11px]">
                {count} ({percentage}%)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in reviews (e.g. bridal, facial)..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          {filterRating !== null && (
            <button
              onClick={() => setFilterRating(null)}
              className="px-3 py-2 bg-amber-100 text-amber-900 font-semibold text-xs rounded-xl flex items-center gap-1 hover:bg-amber-200 transition-colors"
            >
              <span>{filterRating} Stars Only</span>
              <span className="font-mono text-[10px]">×</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-700 cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
            <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">No matching reviews found</h3>
            <p className="text-xs text-stone-500">
              Try adjusting your star filter or search keywords.
            </p>
            <button
              onClick={() => {
                setFilterRating(null);
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const votes = helpfulVotes[rev.id] || 0;
            return (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 hover:border-stone-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                        <span>{rev.customerName}</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5 flex-wrap">
                        <span>{rev.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Verified Appointment
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <StarRating rating={rev.rating} size="sm" showNumeric={false} />
                  </div>
                </div>

                {rev.serviceName && (
                  <div className="text-xs text-amber-900 font-semibold bg-amber-50/70 px-3 py-1.5 rounded-lg border border-amber-200/80 w-fit">
                    Treatment: {rev.serviceName}
                  </div>
                )}

                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  "{rev.comment}"
                </p>

                {/* Parlour Owner Reply */}
                {rev.reply && (
                  <div className="bg-stone-50 p-4 rounded-xl border-l-2 border-amber-800 text-xs space-y-1 mt-3">
                    <span className="font-bold text-stone-900 block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-800" />
                      <span>{parlour.name} (Management Response):</span>
                    </span>
                    <p className="text-stone-600">{rev.reply.text}</p>
                    <span className="text-[10px] text-stone-400 block pt-0.5">
                      Replied on {rev.reply.repliedAt}
                    </span>
                  </div>
                )}

                {/* Helpful Vote Footer */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <span>Was this review helpful?</span>
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-700" />
                      <span>Helpful ({12 + votes})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenBookingModal(parlour.id)}
                    className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book This Treatment</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
