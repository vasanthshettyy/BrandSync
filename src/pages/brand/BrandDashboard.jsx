import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
    Users, Megaphone, FileText, IndianRupee, 
    TrendingUp, TrendingDown, Minus, ArrowUpRight 
} from 'lucide-react';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value.replace(/[^0-9]/g, ''));
        if (start === end) return;
        
        let totalMiliseconds = 1000;
        let incrementTime = (totalMiliseconds / end);
        
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
        <div className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
            isHero 
            ? 'col-span-1 md:col-span-2 row-span-1 bg-gradient-brand shadow-xl shadow-indigo-500/20' 
            : 'glass-card p-6'
        }`}>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isHero ? 'text-white/70' : 'text-text-muted'}`}>
                        {title}
                    </span>
                    <button className={`p-2 rounded-full transition-colors ${
                        isHero ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-white/5'
                    }`}>
                        <ArrowUpRight className={`w-4 h-4 ${isHero ? 'text-white' : 'text-text-secondary'}`} />
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

            {/* Decorative Background Icon */}
            <Icon className={`absolute -bottom-4 -right-4 w-24 h-24 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 ${
                isHero ? 'text-white/10' : 'text-white/[0.02]'
            } animate-pulse-dot`} />
        </div>
    );
};

export default function BrandDashboard() {
    return (
        <PageWrapper 
            title="Overview" 
            subtitle="Monitor your campaign performance and creator activity."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard 
                    title="Campaign Reach" 
                    value="125400" 
                    trend="up" 
                    trendValue="+12%" 
                    icon={Users} 
                    isHero 
                />
                <KPICard 
                    title="Active Gigs" 
                    value="12" 
                    trend="up" 
                    trendValue="+2" 
                    icon={Megaphone} 
                />
                <KPICard 
                    title="Total Spent" 
                    value="₹45000" 
                    trend="down" 
                    trendValue="-5%" 
                    icon={IndianRupee} 
                />
                <KPICard 
                    title="Contracts" 
                    value="28" 
                    trend="neutral" 
                    trendValue="0" 
                    icon={FileText} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-display font-bold">Recent Activity</h2>
                        <button className="text-xs font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[300px] text-text-muted">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 opacity-20" />
                        </div>
                        <p className="text-sm">No recent activity to show.</p>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h2 className="text-lg font-display font-bold mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        {['Post a New Gig', 'Discover Creators', 'View Reports', 'Billing Settings'].map((action) => (
                            <button key={action} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer text-left">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">{action}</span>
                                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
