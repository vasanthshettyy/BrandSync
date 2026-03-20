import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send } from 'lucide-react';
import StarRating from './StarRating';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/AuthContext';
import { MICRO_INTERACTION, PREMIUM_SPRING } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * ReviewFormModal — Floating modal to leave a review for a contract.
 */
export default function ReviewFormModal({ 
    isOpen, 
    onClose, 
    contractId, 
    targetId, 
    targetName, 
    onSuccess 
}) {
    const { user, role } = useAuth();
    const { submitReview } = useReviews();
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitReview(
                contractId,
                user.id,
                targetId,
                rating,
                comment,
                role
            );
            
            // Clean up and close
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Submit review error:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={PREMIUM_SPRING}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={PREMIUM_SPRING}
                    className={cn(
                        "relative w-full max-w-md overflow-hidden rounded-3xl",
                        "backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50",
                        "bg-white/5" // Default dark glass feel
                    )}
                >
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-display font-bold text-white tracking-tight">
                                    Review for {targetName}
                                </h3>
                                <p className="text-zinc-500 text-sm mt-1">
                                    Share your experience with this contract.
                                </p>
                            </div>
                            <motion.button
                                {...MICRO_INTERACTION}
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300">
                                    Rating
                                </label>
                                <StarRating rating={rating} setRating={setRating} />
                            </div>

                            {/* Comment Textarea */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300">
                                    Your Feedback
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write your review here..."
                                    className={cn(
                                        "w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10",
                                        "text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50",
                                        "transition-all resize-none text-sm leading-relaxed"
                                    )}
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={PREMIUM_SPRING}
                                    className="text-xs font-medium text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4">
                                <motion.button
                                    type="button"
                                    {...MICRO_INTERACTION}
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    {...MICRO_INTERACTION}
                                    className={cn(
                                        "flex-[2] py-4 rounded-2xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20",
                                        "flex items-center justify-center gap-2 transition-all hover:bg-indigo-600",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Review
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
