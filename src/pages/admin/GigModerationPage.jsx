import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { 
    Briefcase, CheckCircle, XCircle, Loader2, 
    Megaphone, AlertCircle, IndianRupee, Globe, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMIUM_SPRING, STAGGER_ITEM } from '../../lib/motion';

/**
 * GigModerationPage (Admin)
 * Enhanced for MVP: Gig status updates with feedback.
 */
export default function GigModerationPage() {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Open');
    const [message, setMessage] = useState(null);

    async function fetchGigs() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select(`
                    *,
                    profiles_brand(company_name, logo_url)
                `)
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

    async function updateStatus(gigId, newStatus) {
        setActionLoading(gigId);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('gigs')
                .update({ status: newStatus })
                .eq('id', gigId);

            if (error) throw error;
            
            setGigs(prev => prev.map(g => 
                g.id === gigId ? { ...g, status: newStatus } : g
            ));
            setMessage({ type: 'success', text: `Gig ${newStatus} successfully.` });
        } catch (err) {
            console.error('Error updating gig status:', err);
            setMessage({ type: 'error', text: 'Failed to update gig status.' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage(null), 3000);
        }
    }

    const filteredGigs = gigs.filter(g => filterStatus === 'all' || g.status === filterStatus);

    return (
        <PageWrapper title="Gig Moderation" subtitle="Verify and manage campaign quality.">
            <div className="space-y-8">
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-24 right-8 z-[200] px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
                                message.type === 'success' 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <p className="text-sm font-bold tracking-tight">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Actions & Tabs */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        {['all', 'Open', 'Closed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    filterStatus === status 
                                    ? 'active-pill-glow text-white' 
                                    : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <AlertCircle size={14} className="text-primary" />
                        {filteredGigs.length} Campaigns Found
                    </div>
                </div>

                {/* Gigs Grid */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32"
                            >
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                <p className="text-sm text-text-muted font-medium">Fetching campaigns...</p>
                            </motion.div>
                        ) : filteredGigs.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-32 glass-card border-dashed border-white/10"
                            >
                                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                                    <Megaphone className="w-8 h-8 text-text-muted opacity-20" />
                                </div>
                                <p className="text-sm text-text-muted font-medium">No campaigns match this status.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredGigs.map((gig, idx) => (
                                    <motion.div
                                        key={gig.id}
                                        variants={STAGGER_ITEM}
                                        initial="hidden"
                                        animate="show"
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ ...PREMIUM_SPRING, delay: idx * 0.05 }}
                                        className="glass-card group hover:shadow-card-hover hover:-translate-y-1 p-6 flex flex-col h-full overflow-hidden relative"
                                    >
                                        {/* Status Badge Overlay */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-widest backdrop-blur-md ${
                                                gig.status === 'Open' ? 'bg-success/10 text-success border-success/20' :
                                                gig.status === 'Closed' ? 'bg-white/10 text-text-muted border-white/20' :
                                                'bg-error/10 text-error border-error/20'
                                            }`}>
                                                {gig.status}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            {/* Brand Info */}
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-brand p-[1px] shadow-lg overflow-hidden flex-shrink-0">
                                                    {gig.profiles_brand?.logo_url ? (
                                                        <img src={gig.profiles_brand.logo_url} alt="" className="w-full h-full object-cover rounded-[15px]" />
                                                    ) : (
                                                        <div className="w-full h-full bg-surface-800 rounded-[15px] flex items-center justify-center font-bold text-white text-sm">
                                                            {gig.profiles_brand?.company_name?.charAt(0) || 'B'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{gig.title}</h3>
                                                    <p className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-bold line-clamp-1">
                                                        {gig.profiles_brand?.company_name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description Snippet */}
                                            <p className="text-xs text-text-secondary line-clamp-3 mb-6 leading-relaxed">
                                                {gig.description}
                                            </p>

                                            {/* Stats/Tags */}
                                            <div className="grid grid-cols-2 gap-3 mb-8">
                                                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1">
                                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                                                        <IndianRupee size={10} className="text-primary" /> Budget
                                                    </span>
                                                    <span className="text-xs font-bold text-white">{formatINR(gig.budget)}</span>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1">
                                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                                                        <Globe size={10} className="text-secondary" /> Platform
                                                    </span>
                                                    <span className="text-xs font-bold text-white">{gig.platform}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="flex gap-2 pt-5 border-t border-white/10">
                                            <button 
                                                onClick={() => updateStatus(gig.id, 'Cancelled')}
                                                disabled={actionLoading === gig.id || gig.status === 'Cancelled'}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error/10 text-error border border-error/20 hover:bg-error/20 active:scale-[0.98] transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                <XCircle size={14} className="icon-scale" /> Reject
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(gig.id, 'Open')}
                                                disabled={actionLoading === gig.id || gig.status === 'Open'}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 active:scale-[0.98] transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                            >
                                                {actionLoading === gig.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} className="icon-scale" />}
                                                Approve
                                            </button>
                                        </div>

                                        {/* Timestamp overlay */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] text-text-muted font-bold uppercase tracking-tighter flex items-center gap-1">
                                                <Clock size={8} /> Posted {formatRelativeTime(gig.created_at)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    );
}
