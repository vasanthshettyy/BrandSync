import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Instagram, Youtube, BadgeCheck, Globe, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatFollowers, formatINR } from '../../lib/utils';
import { MICRO_INTERACTION } from '../../lib/motion';

export default function InfluencerDetailModal({ influencer, isOpen, onClose }) {
    if (!influencer) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-surface-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left: Image & Quick Stats (Mobile Top) */}
                        <div className="w-full md:w-2/5 relative aspect-square md:aspect-auto bg-surface-700">
                            {influencer.avatar_url ? (
                                <img
                                    src={influencer.avatar_url}
                                    alt={influencer.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-brand opacity-20">
                                    <Users className="w-12 h-12 text-white" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent to-transparent md:hidden" />
                        </div>

                        {/* Right: Detailed Info */}
                        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-display font-bold text-text-primary">
                                        {influencer.full_name}
                                    </h2>
                                    {influencer.is_verified && (
                                        <BadgeCheck className="w-6 h-6 text-blue-400" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-secondary">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        {influencer.city}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-4 h-4 text-primary" />
                                        {influencer.language}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Followers</p>
                                    <p className="text-lg font-display font-bold text-text-primary">
                                        {formatFollowers(influencer.followers_count)}
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Eng. Rate</p>
                                    <p className="text-lg font-display font-bold text-emerald-400">
                                        {influencer.engagement_rate}%
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Base Price</p>
                                    <p className="text-lg font-display font-bold text-primary">
                                        {formatINR(influencer.price_per_post)}
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Platform</p>
                                    <div className="flex items-center gap-2 text-text-primary">
                                        {influencer.platform_primary === 'instagram' ? (
                                            <>
                                                <Instagram className="w-4 h-4 text-rose-400" />
                                                <span className="text-sm font-bold">Instagram</span>
                                            </>
                                        ) : (
                                            <>
                                                <Youtube className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-bold">YouTube</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">About Creator</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {influencer.bio || "No bio provided."}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Niche</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                                        {influencer.niche}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-auto">
                                <Link 
                                    to={`/influencer/${influencer.user_id}`}
                                    className="flex-1 btn-primary py-3"
                                >
                                    Full Profile
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-bold hover:bg-white/10 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
