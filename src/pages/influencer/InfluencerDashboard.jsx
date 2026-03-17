import PageWrapper from '../../components/layout/PageWrapper';

export default function InfluencerDashboard() {
    return (
        <PageWrapper title="Influencer Dashboard" subtitle="Track your gigs, proposals, and earnings.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Open Gigs', value: '0', color: 'text-primary' },
                    { label: 'My Proposals', value: '0', color: 'text-accent' },
                    { label: 'Active Contracts', value: '0', color: 'text-info' },
                    { label: 'Earnings', value: '₹0', color: 'text-success' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="glass-card p-5">
                        <p className="text-sm text-text-secondary">{label}</p>
                        <p className={`text-3xl font-display font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
}
