import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    Users, Megaphone, FileText, IndianRupee,
    TrendingUp, TrendingDown, Minus, ArrowUpRight,
    Bell, Loader2
} from 'lucide-react';
import { MICRO_INTERACTION, PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { cn, formatINR, formatRelativeTime } from '../../lib/utils';

/**
 * BrandDashboard
 * Part 3 of 4: Dynamic KPIs and Activity Feed
 */
const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false, loading = false }) => {
    return (
        <motion.div
            layout
            variants={STAGGER_ITEM}
            whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-3xl p-6 transition-colors duration-500 ${isHero
                ? 'col-span-1 md:col-span-2 row-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-500/20'
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
                        <h2 className={`text-4xl font-display font-bold mb-2 tracking-tighter text-white`}>
                            {value}
                        </h2>
                    )}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                            trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-zinc-500/10 text-zinc-400'
                            }`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                                    <Minus className="w-3 h-3" />}
                            {trendValue}
                        </div>
                        <span className={`text-[10px] ${isHero ? 'text-white/50' : 'text-zinc-500'}`}>vs last month</span>
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
    );
};

export default function BrandDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        reach: 0,
        activeGigs: 0,
        totalSpent: 0,
        contracts: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchDashboardData() {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch Active Gigs count
            const { count: activeGigs } = await supabase
                .from('gigs')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', user.id)
                .eq('status', 'Open');

            // 2. Fetch Contracts with Influencer Reach and Milestones for Spending
            const { data: contractsData, error: contractsError } = await supabase
                .from('contracts')
                .select(`
                    *,
                    contract_milestones(status)
                `)
                .eq('brand_id', user.id);

            if (contractsError) throw contractsError;

            // Calculate Total Reach (Sum of followers from hired influencers)
            const reach = (contractsData || []).reduce((acc, c) => acc + (c.profiles_influencer?.followers_count || 0), 0);

            // Calculate Total Spent (Approved milestones = 1/3 of agreed price each)
            const spent = (contractsData || []).reduce((acc, c) => {
                const approvedCount = (c.contract_milestones || []).filter(m => m.status === 'Approved').length;
                // Each approved milestone releases 1/3 of the agreed price
                return acc + (c.agreed_price / 3) * approvedCount;
            }, 0);

            setStats({
                reach,
                activeGigs: activeGigs || 0,
                totalSpent: spent,
                contracts: (contractsData || []).length
            });

            // 3. Fetch Recent Activity (Top 5 Notifications)
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

        // Real-time listener for new notifications
        const channel = supabase
            .channel(`brand-dash-${user?.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user?.id}`
            }, (payload) => {
                setRecentActivity(prev => [payload.new, ...prev].slice(0, 5));
                // Optionally re-fetch stats if the notification indicates a state change
                if (payload.new.type === 'milestone_update' || payload.new.type === 'proposal_received') {
                    fetchDashboardData();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <PageWrapper title="Overview" subtitle="Monitor your campaign performance and creator activity.">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                <KPICard
                    title="Campaign Reach"
                    value={stats.reach.toLocaleString()}
                    trend="up"
                    trendValue="+12%"
                    icon={Users}
                    isHero
                    loading={loading}
                />
                <KPICard
                    title="Active Gigs"
                    value={stats.activeGigs}
                    trend="up"
                    trendValue="+2"
                    icon={Megaphone}
                    loading={loading}
                />
                <KPICard
                    title="Total Spent"
                    value={formatINR(stats.totalSpent)}
                    trend="down"
                    trendValue="-5%"
                    icon={IndianRupee}
                    loading={loading}
                />
                <KPICard
                    title="Contracts"
                    value={stats.contracts}
                    trend="neutral"
                    trendValue="0"
                    icon={FileText}
                    loading={loading}
                />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                <motion.div
                    variants={STAGGER_ITEM}
                    className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
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
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm font-medium">Fetching activity feed...</p>
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
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
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
                                <p className="text-sm font-bold uppercase tracking-widest">No recent activity found</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={STAGGER_ITEM}
                    className="glass-card p-8 bg-gradient-to-b from-white/[0.05] to-transparent"
                >
                    <h2 className="text-xl font-display font-bold mb-8 text-white">Quick Actions</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Post a New Gig', color: 'text-emerald-400' },
                            { label: 'Discover Creators', color: 'text-indigo-400' },
                            { label: 'View Reports', color: 'text-amber-400' },
                            { label: 'Billing Settings', color: 'text-zinc-400' }
                        ].map((action, idx) => (
                            <motion.button
                                key={action.label}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer text-left"
                            >
                                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{action.label}</span>
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                                    <ArrowUpRight className={cn("w-4 h-4 transition-colors", action.color)} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
