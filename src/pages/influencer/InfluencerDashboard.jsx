import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import { useCountUp } from '../../hooks/useCountUp';
import SkeletonCard from '../../components/ui/SkeletonCard';
import {
    Users, Briefcase, IndianRupee, Star,
    TrendingUp, TrendingDown, Minus, ArrowUpRight,
    Clock, CheckCircle2, FileText, Bell,
    Loader2
} from 'lucide-react';
import { MICRO_INTERACTION, PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { cn, formatINR, formatRelativeTime } from '../../lib/utils';

/**
 * InfluencerDashboard
 * Part 3 of 4: Dynamic KPIs and Activity Feed
 */
const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false, loading = false }) => {
    return (
        <div style={isHero ? { "--scale": 1.05 } : { opacity: 0.85 }} className={cn(isHero ? "col-span-1 md:col-span-2 row-span-1 shadow-primary-glow rounded-2xl" : "")}>
            <motion.div
                layout
                variants={STAGGER_ITEM}
                whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
                    borderColor: 'rgba(99, 102, 241, 0.4)'
                }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-colors duration-500 h-full ${isHero
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-500/20'
                        : 'backdrop-blur-xl border border-white/10 bg-white/5 hover:border-indigo-500/30'
                    }`}
            >
                <div className="absolute inset-0 glossy-sheen opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isHero ? 'text-white/70' : 'text-zinc-400'}`}>
                            {title}
                        </span>
                        <motion.button
                            {...MICRO_INTERACTION}
                            className={`p-2 rounded-xl transition-all duration-300 ${isHero ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400'
                                }`}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div>
                        {loading ? (
                            <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg mb-2" />
                        ) : (
                            <h2 className={`${isHero ? 'text-5xl' : 'text-4xl'} font-display font-black mb-2 tracking-tighter text-white`}>
                                {value}
                            </h2>
                        )}
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                                    trend === 'down' ? 'bg-red-500/10 text-red-400' :
                                        'bg-zinc-500/10 text-zinc-400'
                                }`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}
                                {trendValue}
                            </div>
                            <span className={`text-[10px] ${isHero ? 'text-white/50' : 'text-zinc-500'}`}>this week</span>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-6 -right-6 pointer-events-none">
                    <Icon className={cn(
                        "w-32 h-32 opacity-10 transition-opacity duration-500",
                        isHero ? "text-white" : "text-indigo-500"
                    )} />
                </div>
            </motion.div>
        </div>
    );
};

export default function InfluencerDashboard() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({
        reach: 0,
        activeContracts: 0,
        totalEarnings: 0,
        rating: '0.0'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const animatedReach = useCountUp(stats.reach);
    const animatedActiveContracts = useCountUp(stats.activeContracts);
    const animatedTotalEarnings = useCountUp(stats.totalEarnings);

    async function fetchDashboardData() {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Total Reach (from profile)
            const reach = profile?.followers_count || 0;

            // 2. Contracts and Earnings
            const { data: contractsData, error: contractsError } = await supabase
                .from('contracts')
                .select(`
                    id, 
                    agreed_price, 
                    status,
                    contract_milestones(status)
                `)
                .eq('influencer_id', user.id);

            if (contractsError) throw contractsError;

            const activeContracts = (contractsData || []).filter(c => c.status === 'Active').length;

            // 3. Total Earnings (Sum of approved milestones = 1/3 of agreed price each)
            const earnings = (contractsData || []).reduce((acc, c) => {
                const approvedCount = (c.contract_milestones || []).filter(m => m.status === 'Approved').length;
                return acc + (c.agreed_price / 3) * approvedCount;
            }, 0);

            // 4. Rating (Average from reviews)
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('rating')
                .eq('target_id', user.id);

            if (reviewsError) throw reviewsError;

            const avgRating = reviewsData?.length
                ? (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1)
                : '0.0';

            setStats({
                reach, // Used for Profile Views placeholder as per roadmap logic
                activeContracts,
                totalEarnings: earnings,
                rating: avgRating
            });

            // 5. Recent Activity (Notifications)
            const { data: notifications, error: notifError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (notifError) throw notifError;
            setRecentActivity(notifications || []);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();

        // Real-time notifications listener
        const channel = supabase
            .channel(`influencer-dash-${user?.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user?.id}`
            }, (payload) => {
                setRecentActivity(prev => [payload.new, ...prev].slice(0, 5));
                // Re-fetch stats on relevant updates
                if (payload.new.type === 'milestone_update' || payload.new.type === 'contract_completed') {
                    fetchDashboardData();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, profile]);

    if (loading) return (
        <PageWrapper title="Creator Hub" subtitle="Track your earnings and upcoming campaign deliverables.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 page-enter">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper title="Creator Hub" subtitle="Track your earnings and upcoming campaign deliverables.">
            <div className="page-enter">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
                    variants={STAGGER_CONTAINER}
                    initial="hidden"
                    animate="show"
                >
                    <KPICard
                        title="Profile Views"
                        value={animatedReach.toLocaleString()}
                        trend="up"
                        trendValue="+15%"
                        icon={Users}
                        isHero
                    />
                    <KPICard
                        title="Active Contracts"
                        value={animatedActiveContracts}
                        trend="up"
                        trendValue="+1"
                        icon={Briefcase}
                    />
                    <KPICard
                        title="Total Earnings"
                        value={formatINR(animatedTotalEarnings)}
                        trend="up"
                        trendValue="+12%"
                        icon={IndianRupee}
                    />
                    <KPICard
                        title="Creator Rating"
                        value={stats.rating}
                        trend="neutral"
                        trendValue="0.0"
                        icon={Star}
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        variants={STAGGER_ITEM}
                        className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-secondary rounded-full" />
                                <h2 className="text-xl font-display font-bold text-white">Recent Activity</h2>
                            </div>
                            <motion.button
                                {...MICRO_INTERACTION}
                                className="text-[10px] font-bold text-primary hover:text-indigo-300 transition-colors uppercase tracking-[0.2em] border border-primary/20 px-4 py-2 rounded-xl bg-primary/5"
                            >
                                View All
                            </motion.button>
                        </div>

                        <div className="flex-1 space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                                    <p className="text-sm font-medium">Fetching creator activity...</p>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((activity, idx) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...PREMIUM_SPRING, delay: idx * 0.08 }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 group-hover:scale-110 transition-transform">
                                            <Bell size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{activity.title}</p>
                                            <p className="text-[11px] text-text-muted line-clamp-1">{activity.message}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter shrink-0">
                                            {formatRelativeTime(activity.created_at)}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-20">
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No recent notifications</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            variants={STAGGER_ITEM}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <h2 className="text-lg font-display font-bold mb-6 text-white">Creator Actions</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Find New Gigs', color: 'text-emerald-400' },
                                    { label: 'Update Portfolio', color: 'text-indigo-400' },
                                    { label: 'Withdraw Earnings', color: 'text-amber-400' },
                                    { label: 'Support Tickets', color: 'text-zinc-400' }
                                ].map((action, idx) => (
                                    <motion.button
                                        key={action.label}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer text-left"
                                    >
                                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{action.label}</span>
                                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                                            <ArrowUpRight className={cn("w-4 h-4 transition-colors", action.color)} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
