import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * AverageRatingBadge — Displays numerical rating and review count.
 * 
 * @param {number} rating - Average rating (1-5)
 * @param {number} totalReviews - Total number of reviews
 */
export default function AverageRatingBadge({ rating, totalReviews }) {
    if (!totalReviews || totalReviews === 0) {
        return (
            <div className="inline-flex items-center gap-1.5 text-text-muted text-xs font-medium italic px-1">
                <Star size={14} className="text-text-muted opacity-40" />
                <span>No reviews yet</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
            <Star size={14} className="fill-warning text-warning" />
            <span className="text-white font-bold text-sm">
                {Number(rating).toFixed(1)}
            </span>
            <span className="text-text-muted text-xs">
                ({totalReviews} reviews)
            </span>
        </div>
    );
}
