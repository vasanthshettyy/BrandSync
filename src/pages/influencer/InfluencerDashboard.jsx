import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
    Users, Briefcase, IndianRupee, Star, 
    TrendingUp, TrendingDown, Minus, ArrowUpRight, 
    Clock, CheckCircle2
} from 'lucide-react';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value.toString().replace(/[^0-9]/g, ''));
        if (start === end) return;
        
        let totalMiliseconds = 1000;
        let timer = setInterval(() => {
            start += Math.ceil(end / 20);
            if (start >= end) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(value.includes('₹') ? `₹${start.toLocaleString()}` : start.toLocaleString());
            }
        }, 50);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 ${
            isHero 
            ? 'col-span-1 md:col-span-2 row-span-1 bg-gradient-brand shadow-xl shadow-indigo-500/20' 
            : 'glass-card p-6 border border-white/5 hover:border-primary/30'
        }`}>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isHero ? 'text-white/70' : 'text-text-muted'}`}>
                        {title}
                    </span>
                    <button className={`p-2 rounded-full transition-all duration-300 ${
                        isHero ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-primary/10 text-text-secondary hover:text-primary'
                    }`}>
                        <ArrowUpRight className="w-4 h-4 icon-scale" />
                    </button>
                </div>

                <div>
                    <h2 className={`text-4xl font-display font-bold mb-2 tracking-tighter ${isHero ? 'text-white' : 'text-text-primary'}`}>
                        {displayValue}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
                            trend === 'down' ? 'bg-rose-500/10 text-rose-500' : 
                            'bg-zinc-500/10 text-zinc-500'
                        }`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                             trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                             <Minus className="w-3 h-3" />}
                            {trendValue}
                        </div>
                        <span className={`text-[10px] ${isHero ? 'text-white/50' : 'text-text-muted'}`}>vs last month</span>
                    </div>
                </div>
            </div>

            <Icon className={`absolute -bottom-4 -right-4 w-24 h-24 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 ${
                isHero ? 'text-white/10' : 'text-white/[0.02]'
            } animate-pulse-dot`} />
        </div>
    );
};

export default function InfluencerDashboard() {
    return (
        <PageWrapper 
            title="Creator Hub" 
            subtitle="Track your earnings and upcoming campaign deliverables."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard 
                    title="Total Earnings" 
                    value="₹84200" 
                    trend="up" 
                    trendValue="+15%" 
                    icon={IndianRupee} 
                    isHero 
                />
                <KPICard 
                    title="Active Gigs" 
                    value="4" 
                    trend="neutral" 
                    trendValue="0" 
                    icon={Briefcase} 
                />
                <KPICard 
                    title="Avg. Rating" 
                    value="4.9" 
                    trend="up" 
                    trendValue="+0.2" 
                    icon={Star} 
                />
                <KPICard 
                    title="Reach Growth" 
                    value="1200" 
                    trend="down" 
                    trendValue="-3%" 
                    icon={Users} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px] border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-display font-bold">Upcoming Milestones</h2>
                        <button className="text-xs font-bold text-primary hover:underline">View Schedule</button>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { title: 'Fashion Summer Lookbook', task: 'Upload Draft', deadline: 'Today', status: 'Pending' },
                            { title: 'Tech Review: X-Phone', task: 'Submit Final Script', deadline: 'In 2 days', status: 'Upcoming' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-primary icon-hover-effect" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">{item.title}</h4>
                                        <p className="text-xs text-text-muted">{item.task} • {item.deadline}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 border border-white/5">
                    <h2 className="text-lg font-display font-bold mb-6">Creator Actions</h2>
                    <div className="space-y-3">
                        {['Find New Gigs', 'Update Portfolio', 'Withdraw Earnings', 'Support Tickets'].map((action) => (
                            <button key={action} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer text-left">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">{action}</span>
                                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors icon-scale" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
