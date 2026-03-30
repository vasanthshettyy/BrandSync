import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * ReviewPromptBanner — A highly visible CTA for completed contracts to prompt a review.
 * Shown to both brands and influencers after a contract is finished.
 */
export default function ReviewPromptBanner({ onReviewClick, partnerName, isBrand }) {
  const roleText = isBrand ? "influencer" : "brand";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden p-6 md:p-8 rounded-[2rem]",
        "bg-gradient-to-r from-amber-500/10 to-yellow-500/5",
        "border-2 border-dashed border-amber-500/20 hover:border-amber-500/40 transition-colors duration-500",
        "backdrop-blur-xl shadow-xl shadow-amber-500/5"
      )}
    >
      {/* Background Decorative Star */}
      <div className="absolute -right-8 -bottom-8 text-amber-500/10 transform rotate-12 scale-150">
        <Star size={160} fill="currentColor" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-5">
          {/* Animated Icon Area */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Star size={28} fill="currentColor" />
            </motion.div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Contract Completed!
              </h3>
              <div className="hidden sm:block px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                Action Required
              </div>
            </div>
            <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
              How was your experience working with <span className="text-amber-400 font-semibold">{partnerName}</span>? 
              Your feedback builds trust and helps the <span className="capitalize">{roleText}</span> grow.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05, x: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReviewClick}
          className={cn(
            "flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all",
            "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20",
            "group cursor-pointer shrink-0"
          )}
        >
          Leave a Review
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}
