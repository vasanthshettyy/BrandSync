import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

export default function AdminDashboard() {
    return (
        <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management controls.">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                {[
                    { label: 'Total Users', value: '0', color: 'text-primary' },
                    { label: 'Active Gigs', value: '0', color: 'text-accent' },
                    { label: 'Active Contracts', value: '0', color: 'text-info' },
                    { label: 'Platform GMV', value: '₹0', color: 'text-success' },
                ].map(({ label, value, color }) => (
                    <motion.div
                        key={label}
                        variants={STAGGER_ITEM}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="glass-card p-5"
                    >
                        <p className="text-sm text-text-secondary">{label}</p>
                        <p className={`text-3xl font-display font-bold mt-1 ${color}`}>{value}</p>
                    </motion.div>
                ))}
            </motion.div>
        </PageWrapper>
    );
}
