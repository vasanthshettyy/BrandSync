import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, Instagram, Youtube, BadgeCheck } from 'lucide-react';
import { useReviews } from '../../hooks/useReviews';
import { MICRO_INTERACTION, STAGGER_ITEM } from '../../lib/motion';
import { formatFollowers, formatINR } from '../../lib/utils';

export default function InfluencerCard({ inf, onClick }) {
    const { getUserRating } = useReviews();
    const [ratingData, setRatingData] = useState({ avg_rating: 0, total_reviews: 0 });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const data = await getUserRating(inf.user_id);
                setRatingData(data);
            } catch (err) {
                console.error('Error fetching rating for card:', err);
            }
        };
        fetchRating();
    }, [inf.user_id, getUserRating]);

    return (
        <motion.div
            variants={STAGGER_ITEM}
            whileHover={{ scale: 1.01, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick?.(inf)}
            className="glass-card group hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full relative"
        >
            {/* Image Header 16:10 */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-800">
                {inf.avatar_url ? (
                    <img
                        src={inf.avatar_url}
                        alt={inf.full_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-brand opacity-20" />
                )}

                {/* Hover Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <div className="px-4 py-2 rounded-xl bg-white text-primary font-bold text-[10px] uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Profile
                    </div>
                </motion.div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        Available
                    </span>
                    {inf.is_verified && (
                        <div className="bg-blue-500/20 backdrop-blur-md p-1 rounded-full border border-blue-500/20">
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/40 text-white border border-white/10">
                        {inf.niche}
                    </span>
                    {ratingData.total_reviews > 0 && (
                        <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            {ratingData.avg_rating.toFixed(1)} ({ratingData.total_reviews})
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-sm text-text-primary truncate transition-colors group-hover:text-primary">
                        {inf.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                        <MapPin className="w-3 h-3 text-accent" />
                        {inf.city}
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px] font-bold">{formatFollowers(inf.followers_count)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {inf.platform_primary === 'instagram' ? <Instagram className="w-3.5 h-3.5 text-rose-400" /> : <Youtube className="w-3.5 h-3.5 text-red-500" />}
                        <span className="text-[11px] font-bold capitalize">{inf.platform_primary}</span>
                    </div>
                </div>

                {/* Dual Pricing / CTA Section */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Est. Price</p>
                        <p className="text-sm font-display font-bold text-text-primary">
                            {formatINR(inf.price_per_post)}
                            <span className="text-[10px] font-normal text-text-muted"> /post</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Eng. Rate</p>
                        <p className="text-sm font-display font-bold text-accent">
                            {inf.engagement_rate > 0 ? `${inf.engagement_rate}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
