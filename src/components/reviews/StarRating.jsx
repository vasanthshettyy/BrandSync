import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PREMIUM_SPRING } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * StarRating — Interactive 1-5 star selector with smooth hover effects.
 */
export default function StarRating({ rating, setRating, readOnly = false }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    whileHover={!readOnly ? { scale: 1.15 } : {}}
                    whileTap={!readOnly ? { scale: 0.95 } : {}}
                    transition={PREMIUM_SPRING}
                    onMouseEnter={() => !readOnly && setHoverRating(star)}
                    onMouseLeave={() => !readOnly && setHoverRating(0)}
                    onClick={() => !readOnly && setRating(star)}
                    className={cn(
                        "relative transition-colors duration-300 outline-none",
                        readOnly ? "cursor-default" : "cursor-pointer"
                    )}
                >
                    <Star
                        size={24}
                        className={cn(
                            "transition-all duration-300 ease-out",
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
                                : "text-white/20 fill-transparent"
                        )}
                    />
                    
                    {/* Subtle glow effect on hover */}
                    {!readOnly && hoverRating === star && (
                        <motion.div
                            layoutId="star-glow"
                            className="absolute inset-0 bg-yellow-400/10 blur-xl rounded-full -z-10"
                        />
                    )}
                </motion.button>
            ))}
            
            {!readOnly && rating > 0 && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={PREMIUM_SPRING}
                    className="ml-3 text-sm font-medium text-yellow-500/80"
                >
                    {rating}.0
                </motion.span>
            )}
        </div>
    );
}
