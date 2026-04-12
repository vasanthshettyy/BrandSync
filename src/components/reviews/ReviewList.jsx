import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ReviewCard from './ReviewCard';
import { cn } from '../../lib/utils';

/**
 * ReviewList — Fetches and displays reviews for a target user.
 * 
 * @param {string} targetId - UUID of the user being reviewed.
 */
export default function ReviewList({ targetId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            if (!targetId) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        profiles_brand:reviewer_id (company_name, logo_url),
                        profiles_influencer:reviewer_id (full_name, avatar_url)
                    `)
                    .eq('target_id', targetId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchReviews();
    }, [targetId]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 animate-pulse border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10" />
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-white/10 rounded" />
                                <div className="h-2 w-16 bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-white/5 rounded" />
                            <div className="h-3 w-3/4 bg-white/5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 glass-card border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Star size={32} className="text-text-muted opacity-20" />
                </div>
                <h3 className="text-white font-bold mb-1">No reviews yet</h3>
                <p className="text-text-muted text-sm text-center max-w-[200px]">
                    This profile hasn't received any reviews for completed work yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}
