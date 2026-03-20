import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import StarRating from './StarRating';
import { PREMIUM_SPRING } from '../../lib/motion';
import { formatRelativeTime, cn } from '../../lib/utils';

/**
 * ReviewCard — Read-only UI component to display a fetched review.
 */
export default function ReviewCard({ review }) {
    if (!review) return null;

    const { 
        rating, 
        comment, 
        created_at, 
        reviewer_id, 
        profiles_brand, 
        profiles_influencer 
    } = review;

    // Determine reviewer details based on who left it
    const reviewerName = profiles_brand?.company_name || 
                        profiles_influencer?.full_name || 
                        'Anonymous User';
    
    const reviewerAvatar = profiles_brand?.logo_url || 
                          profiles_influencer?.avatar_url;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={PREMIUM_SPRING}
            whileHover={{ scale: 1.01, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative group overflow-hidden p-6 rounded-3xl",
                "backdrop-blur-xl border border-white/10 bg-white/5",
                "transition-all duration-300 hover:border-indigo-500/30"
            )}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Quote size={64} className="text-white rotate-180" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                {/* Reviewer Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {reviewerAvatar ? (
                            <img 
                                src={reviewerAvatar} 
                                alt={reviewerName} 
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/5 shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                {reviewerName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-tight">
                                {reviewerName}
                            </h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                {formatRelativeTime(created_at)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Rating display (read-only) */}
                    <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <StarRating rating={rating} readOnly />
                    </div>
                </div>

                {/* Comment */}
                <div className="relative">
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium italic">
                        "{comment}"
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
