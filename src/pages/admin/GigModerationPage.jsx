import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { 
    Briefcase, CheckCircle, XCircle, Loader2, 
    Search, Filter, ExternalLink, Megaphone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGRO_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

export default function GigModerationPage() {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    async function fetchGigs() {
        setLoading(true);
        try {
            // Note: Since 'Pending' isn't in the roadmap enum, we'll assume 'Open' is the state to review
            // or we just fetch all and filter. For this module, we'll fetch all gigs.
            const { data, error } = await supabase
                .from('gigs')
                .select('*, profiles_brand(company_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGigs(data || []);
        } catch (err) {
            console.error('Error fetching gigs:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchGigs();
    }, []);

    async function updateStatus(gigId, status) {
        setActionLoading(gigId);
        try {
            const { error } = await supabase
                .from('gigs')
                .update({ status })
                .eq('id', gigId);

            if (error) throw error;
            
            setGigs(prev => prev.map(g => 
                g.id === gigId ? { ...g, status } : g
            ));
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <PageWrapper title="Gig Moderation" subtitle="Review and approve campaign listings.">
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-sm text-text-muted">Loading campaigns for review...</p>
                    </div>
                ) : gigs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <Megaphone className="w-12 h-12 text-text-muted mb-4 opacity-20" />
                        <p className="text-sm text-text-muted text-center max-w-xs">
                            No campaigns found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {gigs.map((gig, idx) => (
                                <motion.div
                                    key={gig.id}
                                    variants={STAGGER_ITEM}
                                    initial="hidden"
                                    animate="show"
                                    transition={{ ...AGRO_SPRING, delay: idx * 0.05 }}
                                    className="glass-card p-6 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white line-clamp-1">{gig.title}</h3>
                                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                                                        by {gig.profiles_brand?.company_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-widest ${
                                                gig.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                gig.status === 'Closed' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                {gig.status}
                                            </span>
                                        </div>

                                        <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                                            {gig.description}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mb-6">
                                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{formatINR(gig.budget)}</span>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{gig.platform}</span>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                                {formatRelativeTime(gig.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => updateStatus(gig.id, 'Cancelled')}
                                            disabled={actionLoading === gig.id || gig.status === 'Cancelled'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(gig.id, 'Open')}
                                            disabled={actionLoading === gig.id || gig.status === 'Open'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
