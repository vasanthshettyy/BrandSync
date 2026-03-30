import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigs } from '../../hooks/useGigs';
import PageWrapper from '../../components/layout/PageWrapper';
import CreateGigModal from '../../components/gigs/CreateGigModal';
import { 
    Plus, Megaphone, DollarSign, Globe, 
    ArrowRight, Loader2, Calendar, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';

/**
 * BrandGigsPage — A dedicated dashboard for brands to manage their campaigns.
 * Features a list of active/closed gigs and a button to launch the quick-post modal.
 */
export default function BrandGigsPage() {
    const navigate = useNavigate();
    const { gigs, loading, fetchGigs } = useGigs();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter or sort can be added here if needed, but useGigs handles basic brand_id filtering
    const activeGigs = gigs.filter(g => g.status === 'Open');
    const closedGigs = gigs.filter(g => g.status !== 'Open');

    return (
        <PageWrapper 
            title="My Campaigns" 
            subtitle="Manage your active gigs and track influencer applications."
        >
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        Campaign Overview
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            {gigs.length} Total
                        </span>
                    </h2>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                    <Plus size={16} strokeWidth={3} />
                    New Campaign
                </motion.button>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Loading campaigns...</p>
                </div>
            ) : gigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {gigs.map((gig, idx) => (
                            <motion.div
                                key={gig.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/brand/gigs/${gig.id}/applications`)}
                                className="group glass-card p-6 flex flex-col h-full cursor-pointer hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Subtle Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Status & Platform */}
                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-primary">
                                            <Globe size={14} />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{gig.platform}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[gig.status] || 'bg-white/5 text-zinc-400 border-white/10'}`}>
                                        {gig.status}
                                    </span>
                                </div>

                                {/* Gig Details */}
                                <div className="flex-1 mb-6 relative z-10">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {gig.title}
                                    </h3>
                                    <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed opacity-80">
                                        {gig.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3 mt-auto">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-emerald-400">
                                            <DollarSign size={12} />
                                            {formatINR(gig.budget)}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-zinc-400">
                                            <Calendar size={12} />
                                            {formatRelativeTime(gig.created_at)}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid size={14} className="text-zinc-500" />
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">View Pipeline</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 glass-card bg-white/[0.02] border-dashed border-white/10">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600 mb-6">
                        <Megaphone size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Campaigns</h3>
                    <p className="text-text-muted text-sm mb-8 text-center max-w-sm">
                        You haven't posted any gigs yet. Start by creating a campaign to connect with top-tier influencers.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-zinc-200 transition-colors"
                    >
                        Create Your First Gig
                    </motion.button>
                </div>
            )}

            {/* Modals */}
            <CreateGigModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchGigs(); // Refresh list after creation
                }} 
            />
        </PageWrapper>
    );
}
