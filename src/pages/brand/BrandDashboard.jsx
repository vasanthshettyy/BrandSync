import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
    Users, Megaphone, FileText, IndianRupee, 
    TrendingUp, TrendingDown, Minus, ArrowUpRight 
} from 'lucide-react';
import { MICRO_INTERACTION, PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { cn } from '../../lib/utils';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

    useEffect(() => {
        let start = 0;
        const end = numericValue;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeProgress * end);
            
            setDisplayValue(value.includes('₹') ? `₹${currentCount.toLocaleString()}` : currentCount.toLocaleString());

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(value);
            }
        };

        requestAnimationFrame(animate);
    }, [value, numericValue]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={PREMIUM_SPRING}
            whileHover={{ scale: 1.01, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-3xl p-6 transition-colors duration-500 ${
                isHero 
                ? 'col-span-1 md:col-span-2 row-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-500/20' 
                : 'backdrop-blur-xl border border-white/10 bg-white/5 hover:border-indigo-500/30'
            }`}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isHero ? 'text-white/70' : 'text-zinc-400'}`}>
                        {title}
                    </span>
                    <motion.button
                        {...MICRO_INTERACTION}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                            isHero ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400'
                        }`}
                    >
                        <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                </div>

                <div>
                    <motion.h2 
                        layout
                        className={`text-4xl font-display font-bold mb-2 tracking-tighter ${isHero ? 'text-white' : 'text-white'}`}
                    >
                        {displayValue}
                    </motion.h2>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
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

            {/* Decorative Background Icon */}
            <div className="absolute -bottom-6 -right-6 pointer-events-none">
                <motion.div
                    initial={false}
                    animate={{ 
                        scale: 1, 
                        rotate: 0 
                    }}
                    whileHover={{ 
                        scale: 1.1, 
                        rotate: -12,
                        transition: PREMIUM_SPRING
                    }}
                >
                    <Icon className={cn(
                        "w-32 h-32 opacity-10 transition-opacity duration-500",
                        isHero ? "text-white" : "text-indigo-500"
                    )} />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default function BrandDashboard() {
    return (
        <PageWrapper 
            title="Overview" 
            subtitle="Monitor your campaign performance and creator activity."
        >
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={STAGGER_ITEM}>
                <KPICard 
                    title="Campaign Reach" 
                    value="125400" 
                    trend="up" 
                    trendValue="+12%" 
                    icon={Users} 
                    isHero 
                />
                </motion.div>
                <motion.div variants={STAGGER_ITEM}>
                <KPICard 
                    title="Active Gigs" 
                    value="12" 
                    trend="up" 
                    trendValue="+2" 
                    icon={Megaphone} 
                />
                </motion.div>
                <motion.div variants={STAGGER_ITEM}>
                <KPICard 
                    title="Total Spent" 
                    value="₹45000" 
                    trend="down" 
                    trendValue="-5%" 
                    icon={IndianRupee} 
                />
                </motion.div>
                <motion.div variants={STAGGER_ITEM}>
                <KPICard 
                    title="Contracts" 
                    value="28" 
                    trend="neutral" 
                    trendValue="0" 
                    icon={FileText} 
                />
                </motion.div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={PREMIUM_SPRING}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    variants={STAGGER_ITEM}
                    className="lg:col-span-2 backdrop-blur-xl border border-white/10 bg-white/5 rounded-3xl p-8 min-h-[400px]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-display font-bold text-white">Recent Activity</h2>
                        <motion.button
                            {...MICRO_INTERACTION}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                        >
                            View All
                        </motion.button>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <motion.div 
                            animate={{ 
                                y: [0, -10, 0],
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                            className="w-20 h-20 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6"
                        >
                            <FileText className="w-10 h-10 text-indigo-500/20" />
                        </motion.div>
                        <p className="text-zinc-500 text-sm font-medium">No recent activity to show.</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={PREMIUM_SPRING}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    variants={STAGGER_ITEM}
                    className="backdrop-blur-xl border border-white/10 bg-white/5 rounded-3xl p-8"
                >
                    <h2 className="text-xl font-display font-bold mb-8 text-white">Quick Actions</h2>
                    <div className="space-y-4">
                        {['Post a New Gig', 'Discover Creators', 'View Reports', 'Billing Settings'].map((action, idx) => (
                            <motion.button 
                                key={action} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...PREMIUM_SPRING, delay: idx * 0.08 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group cursor-pointer text-left"
                            >
                                <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{action}</span>
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
