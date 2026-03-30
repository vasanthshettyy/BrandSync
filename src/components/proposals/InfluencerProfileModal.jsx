import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Instagram, 
  Youtube, 
  Users, 
  Star, 
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { formatFollowers, formatINR, cn } from '../../lib/utils';

/**
 * InfluencerProfileModal
 * A detailed slide-up/fade-in modal for brands to review an influencer's public profile.
 * Uses React Portals to break out of parent stacking contexts.
 */
const InfluencerProfileModal = ({ influencer, onClose }) => {
  if (!influencer) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5"
          >
            <X size={20} />
          </button>

          {/* Banner / Header Background */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-zinc-900 to-zinc-900 border-b border-white/5 shrink-0" />

          <div className="px-8 pb-10 -mt-12 space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-brand p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[20px] bg-zinc-950 overflow-hidden">
                    {influencer.avatar_url ? (
                      <img 
                        src={influencer.avatar_url} 
                        alt={influencer.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/10">
                        {influencer.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {influencer.is_verified && (
                  <div className="absolute -right-2 -bottom-2 p-1.5 bg-zinc-900 rounded-xl border border-white/10 text-primary shadow-lg">
                    <ShieldCheck size={20} fill="currentColor" className="text-primary fill-primary/10" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {influencer.full_name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span className="text-primary">{influencer.niche}</span>
                  <span className="opacity-20">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {influencer.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 p-1 bg-white/5 rounded-[2rem] border border-white/5">
              <div className="flex flex-col items-center justify-center p-4 rounded-[1.75rem] bg-zinc-950/50 border border-white/5">
                <Users size={16} className="text-zinc-500 mb-1" />
                <span className="text-lg font-black text-white">{formatFollowers(influencer.followers_count)}</span>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Followers</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-[1.75rem] bg-zinc-950/50 border border-white/5">
                <TrendingUp size={16} className="text-emerald-500 mb-1" />
                <span className="text-lg font-black text-white">{influencer.engagement_rate}%</span>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Engagement</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-[1.75rem] bg-zinc-950/50 border border-white/5">
                <IndianRupee size={16} className="text-amber-500 mb-1" />
                <span className="text-lg font-black text-white">{formatINR(influencer.price_per_post).replace('₹', '')}</span>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Base Rate</span>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">About Influencer</h3>
              <div className="p-5 rounded-[1.5rem] bg-zinc-950 border border-white/5">
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  "{influencer.bio || 'No bio provided.'}"
                </p>
              </div>
            </div>

            {/* Social Handles */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {influencer.instagram_handle && (
                <a 
                  href={`https://instagram.com/${influencer.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-500 hover:scale-105 active:scale-95 transition-all group"
                >
                  <Instagram size={18} />
                  <span className="text-xs font-bold tracking-wider">@{influencer.instagram_handle}</span>
                </a>
              )}
              {influencer.youtube_handle && (
                <a 
                  href={`https://youtube.com/@${influencer.youtube_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:scale-105 active:scale-95 transition-all group"
                >
                  <Youtube size={18} />
                  <span className="text-xs font-bold tracking-wider">@{influencer.youtube_handle}</span>
                </a>
              )}
              {!influencer.instagram_handle && !influencer.youtube_handle && (
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No social handles linked</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default InfluencerProfileModal;
