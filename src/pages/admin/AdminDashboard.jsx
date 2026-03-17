import PageWrapper from '../../components/layout/PageWrapper';

export default function AdminDashboard() {
    return (
        <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management controls.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: '0', color: 'text-primary' },
                    { label: 'Active Gigs', value: '0', color: 'text-accent' },
                    { label: 'Active Contracts', value: '0', color: 'text-info' },
                    { label: 'Platform GMV', value: '₹0', color: 'text-success' },
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
