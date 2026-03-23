import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatRelativeTime } from '../../lib/utils';
import { 
    Users, ShieldCheck, ShieldAlert, Loader2, 
    Search, Filter, CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

/**
 * UserManagementPage (Admin)
 * Part 1 of 4: User Listing & Verification
 */
export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    async function fetchUsers() {
        setLoading(true);
        try {
            // Fetch users with their respective profiles in a single query
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    profiles_brand(company_name),
                    profiles_influencer(full_name, is_verified)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Normalize data for the table
            const normalizedUsers = data.map(u => {
                const name = u.role === 'brand' 
                    ? u.profiles_brand?.[0]?.company_name 
                    : u.profiles_influencer?.[0]?.full_name;
                
                return {
                    ...u,
                    displayName: name || u.email.split('@')[0],
                    isVerified: u.role === 'influencer' ? (u.profiles_influencer?.[0]?.is_verified || false) : null
                };
            });

            setUsers(normalizedUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function toggleVerification(userId, currentStatus) {
        try {
            const { error } = await supabase
                .from('profiles_influencer')
                .update({ is_verified: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;
            
            setUsers(prev => prev.map(u => 
                u.user_id === userId ? { ...u, isVerified: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Error updating verification:', err);
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <PageWrapper title="User Management" subtitle="Manage and verify platform participants.">
            <div className="space-y-6">
                {/* Search and Quick Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        {['all', 'brand', 'influencer', 'admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    filterRole === role 
                                    ? 'active-pill-glow text-white' 
                                    : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Glassmorphism Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-white/[0.03]">
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-white/10">Name</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-white/10">Role</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-white/10">Verification Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-white/10">Joined Date</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-white/10 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <p className="text-sm text-text-muted font-medium">Synchronizing user data...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <Users className="w-12 h-12 text-text-muted" />
                                                    <p className="text-sm text-text-muted font-medium">No users match your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, idx) => (
                                            <motion.tr 
                                                key={u.user_id}
                                                variants={STAGGER_ITEM}
                                                initial="hidden"
                                                animate="show"
                                                transition={{ ...PREMIUM_SPRING, delay: idx * 0.04 }}
                                                className="hover:bg-white/[0.03] transition-colors group relative"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-brand p-[1px] shadow-lg">
                                                            <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center font-bold text-white text-xs">
                                                                {u.displayName.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{u.displayName}</p>
                                                            <p className="text-[11px] text-text-muted leading-tight">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border ${
                                                        u.role === 'brand' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        u.role === 'influencer' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                                        'bg-warning/10 text-warning border-warning/20'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'influencer' ? (
                                                        <div className="flex items-center gap-2">
                                                            {u.isVerified ? (
                                                                <span className="flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    <ShieldCheck size={14} /> Verified
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2 text-[10px] font-bold text-error uppercase tracking-widest">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                                    <ShieldAlert size={14} /> Unverified
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Not Applicable</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-text-muted font-medium">
                                                    {new Date(u.created_at).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {u.role === 'influencer' ? (
                                                        <button 
                                                            onClick={() => toggleVerification(u.user_id, u.isVerified)}
                                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                                u.isVerified 
                                                                ? 'bg-error/10 text-error border-error/20 hover:bg-error/20' 
                                                                : 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                                                            }`}
                                                        >
                                                            {u.isVerified ? 'Unverify' : 'Verify'}
                                                        </button>
                                                    ) : (
                                                        <button className="p-2 text-text-muted hover:text-white transition-colors">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
