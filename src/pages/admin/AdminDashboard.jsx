import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { STAGGER_CONTAINER, STAGGER_ITEM, PREMIUM_SPRING } from '../../lib/motion';
import { formatINR } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import { AlertCircle, CheckCircle, XCircle, Clock, ExternalLink, IndianRupee, Users, Megaphone, FileText } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import SkeletonCard from '../../components/ui/SkeletonCard';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGigs: 0,
        activeContracts: 0,
        gmv: 0
    });
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const animatedUsers = useCountUp(stats.totalUsers);
    const animatedGigs = useCountUp(stats.activeGigs);
    const animatedContracts = useCountUp(stats.activeContracts);
    const animatedGMV = useCountUp(stats.gmv);

    async function fetchStats() {
        setLoading(true);
        try {
            const [usersRes, gigsRes, contractsRes, listRes] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('gigs').select('*', { count: 'exact', head: true }).eq('status', 'Open'),
                supabase.from('contracts').select('agreed_price, status, contract_milestones(status)'),
                supabase.from('contracts')
                    .select('id, status, agreed_price, created_at, gigs(title), profiles_brand(company_name), profiles_influencer(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(20)
            ]);

            const activeContracts = (contractsRes.data || []).filter(c => c.status === 'Active').length;

            // Calculate GMV based on approved milestones
            const gmv = (contractsRes.data || []).reduce((acc, c) => {
                const approvedCount = (c.contract_milestones || []).filter(m => m.status === 'Approved').length;
                return acc + (c.agreed_price / 3) * approvedCount;
            }, 0);

            setStats({
                totalUsers: usersRes.count || 0,
                activeGigs: gigsRes.count || 0,
                activeContracts,
                gmv
            });

            setContracts(listRes.data || []);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const resolveDispute = async (contractId) => {
        setActionLoading(contractId);
        try {
            const { error } = await supabase
                .from('contracts')
                .update({ status: 'Cancelled' })
                .eq('id', contractId);

            if (error) throw error;
            await fetchStats();
        } catch (err) {
            console.error('Error resolving dispute:', err);
            alert('Failed to resolve dispute');
        } finally {
            setActionLoading(null);
        }
    };

    const statCards = [
        { label: 'Total Users', value: animatedUsers, color: 'text-indigo-400', icon: Users, isHero: true, trend: '+4% this week' },
        { label: 'Active Gigs', value: animatedGigs, color: 'text-rose-400', icon: Megaphone },
        { label: 'Active Contracts', value: animatedContracts, color: 'text-sky-400', icon: Clock },
        { label: 'Platform GMV', value: formatINR(animatedGMV), color: 'text-emerald-400', icon: IndianRupee },
    ];

    const disputedContracts = contracts.filter(c => c.status === 'Disputed');

    return (
        <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management controls.">
            <motion.div
                className="space-y-8"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        statCards.map(({ label, value, color, icon: Icon, isHero, trend }) => (
                            <motion.div
                                key={label}
                                variants={STAGGER_ITEM}
                                whileHover={{ y: -8, transition: PREMIUM_SPRING, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)' }}
                                className={cn(
                                    "glass-card p-6 relative group overflow-hidden",
                                    isHero ? "md:col-span-2 shadow-primary-glow border-indigo-500/20" : "opacity-85"
                                )}
                            >
                                <div className="absolute inset-0 glossy-sheen opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
                                        <div className="p-2 rounded-xl bg-white/5 text-text-muted group-hover:text-white transition-colors">
                                            <Icon size={16} />
                                        </div>
                                    </div>
                                    <p className={cn("font-display font-black tracking-tight", isHero ? "text-5xl" : "text-4xl", color)}>
                                        {value}
                                    </p>
                                    {trend && (
                                        <p className="text-[10px] font-bold text-emerald-400 mt-2">↑ {trend}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Dispute Resolution Section */}
                {disputedContracts.length > 0 && (
                    <motion.section variants={STAGGER_ITEM} className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold text-white">⚠️ Disputed Contracts</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence mode='popLayout'>
                                {disputedContracts.map((contract) => (
                                    <motion.div
                                        key={contract.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-red-500/20 bg-red-500/5"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">{contract.gigs?.title}</h3>
                                            <p className="text-xs text-text-secondary mt-1">
                                                Brand: <span className="text-text-primary font-medium">{contract.profiles_brand?.company_name}</span> •
                                                Influencer: <span className="text-text-primary font-medium">{contract.profiles_influencer?.full_name}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-text-secondary">Amount</p>
                                                <p className="font-bold text-white">{formatINR(contract.agreed_price)}</p>
                                            </div>
                                            <button
                                                onClick={() => resolveDispute(contract.id)}
                                                disabled={actionLoading === contract.id}
                                                className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-900/20 py-2 px-4 text-xs"
                                            >
                                                {actionLoading === contract.id ? 'Processing...' : 'Resolve → Mark as Cancelled'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                )}

                {/* Contracts Table */}
                <motion.section variants={STAGGER_ITEM} className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-bold text-white">Contract Overview</h2>
                        <span className="text-xs text-text-muted uppercase tracking-widest font-bold">Latest 20</span>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Gig Title</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Brand</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Influencer</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted text-right">Amount</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</th>
                                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="border-b border-white/5 animate-pulse">
                                                {[...Array(6)].map((_, j) => (
                                                    <td key={j} className="p-4">
                                                        <div className="h-4 bg-white/5 rounded w-24"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : contracts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center opacity-40">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Clock size={32} />
                                                    <p className="text-xs font-bold uppercase tracking-widest">No contracts found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        contracts.map((contract) => (
                                            <tr key={contract.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4">
                                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{contract.gigs?.title}</p>
                                                </td>
                                                <td className="p-4 text-xs text-text-secondary">
                                                    {contract.profiles_brand?.company_name}
                                                </td>
                                                <td className="p-4 text-xs text-text-secondary">
                                                    {contract.profiles_influencer?.full_name}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-white text-right">
                                                    {formatINR(contract.agreed_price)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${STATUS_COLORS[contract.status] || 'bg-white/5 border-white/10 text-text-muted'}`}>
                                                        {contract.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[10px] text-text-muted font-medium">
                                                    {new Date(contract.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </PageWrapper>
    );
}
