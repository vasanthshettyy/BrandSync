import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { STAGGER_CONTAINER, STAGGER_ITEM, PREMIUM_SPRING } from '../../lib/motion';
import { formatINR } from '../../lib/utils';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGigs: 0,
        activeContracts: 0,
        gmv: 0
    });
    const [loading, setLoading] = useState(true);

    async function fetchStats() {
        setLoading(true);
        try {
            const [usersRes, gigsRes, contractsRes] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('gigs').select('*', { count: 'exact', head: true }).eq('status', 'Open'),
                supabase.from('contracts').select('agreed_price, status, contract_milestones(status)')
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
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, color: 'text-primary' },
        { label: 'Active Gigs', value: stats.activeGigs, color: 'text-accent' },
        { label: 'Active Contracts', value: stats.activeContracts, color: 'text-info' },
        { label: 'Platform GMV', value: formatINR(stats.gmv), color: 'text-success' },
    ];

    return (
        <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management controls.">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={{
                    ...STAGGER_CONTAINER,
                    show: {
                        ...STAGGER_CONTAINER.show,
                        transition: {
                            ...PREMIUM_SPRING,
                            staggerChildren: 0.1
                        }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                {statCards.map(({ label, value, color }) => (
                    <motion.div
                        key={label}
                        variants={STAGGER_ITEM}
                        whileHover={{ y: -4, transition: PREMIUM_SPRING }}
                        whileTap={{ scale: 0.98 }}
                        className="glass-card p-5"
                    >
                        <p className="text-sm text-text-secondary">{label}</p>
                        <p className={`text-3xl font-display font-bold mt-1 ${color}`}>
                            {loading ? '...' : value}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </PageWrapper>
    );
}
