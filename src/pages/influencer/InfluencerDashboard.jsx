import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import VerificationUpload from '../../components/profile/VerificationUpload';
import { 
    Users, Briefcase, IndianRupee, Star, 
    TrendingUp, TrendingDown, Minus, ArrowUpRight, 
    Clock, CheckCircle2, ShieldCheck
} from 'lucide-react';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, isHero = false }) => {
    // ... existing KPICard implementation ...
}

export default function InfluencerDashboard() {
    return (
        <PageWrapper 
            title="Creator Hub" 
            subtitle="Track your earnings and upcoming campaign deliverables."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* ... existing KPIs ... */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px] border border-white/5">
                    {/* ... existing milestones ... */}
                </div>

                <div className="space-y-6">
                    {/* Trust & Verification Section */}
                    <div className="glass-card p-6 border border-white/5 bg-indigo-500/[0.02]">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <ShieldCheck size={20} />
                            <h2 className="text-lg font-display font-bold text-white">Verification</h2>
                        </div>
                        <VerificationUpload />
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
            </div>
        </PageWrapper>
    );
}
