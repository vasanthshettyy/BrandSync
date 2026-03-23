import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatRelativeTime } from '../../lib/utils';
import { 
    Users, ShieldCheck, ShieldAlert, Loader2, 
    Search, Filter, CheckCircle, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGRO_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    async function fetchUsers() {
        setLoading(true);
        try {
            // Fetch core users
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (userError) throw userError;

            // Fetch profiles in parallel
            const [brandRes, influencerRes] = await Promise.all([
                supabase.from('profiles_brand').select('user_id, company_name'),
                supabase.from('profiles_influencer').select('user_id, full_name, is_verified')
            ]);

            const brands = brandRes.data || [];
            const influencers = influencerRes.data || [];

            // Merge data
            const mergedUsers = userData.map(u => {
                const brand = brands.find(b => b.user_id === u.user_id);
                const influencer = influencers.find(i => i.user_id === u.user_id);
                return {
                    ...u,
                    displayName: brand?.company_name || influencer?.full_name || u.email,
                    isVerified: influencer?.is_verified || false,
                    profileTable: u.role === 'brand' ? 'profiles_brand' : 'profiles_influencer'
                };
            });

            setUsers(mergedUsers);
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
        <PageWrapper title="User Management" subtitle="Monitor and verify platform users.">
            <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'brand', 'influencer', 'admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                                    filterRole === role 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">User</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Joined</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                                                <p className="text-sm text-text-muted">Fetching users...</p>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <Users className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
                                                <p className="text-sm text-text-muted">No users found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, idx) => (
                                            <motion.tr 
                                                key={u.user_id}
                                                variants={STAGGER_ITEM}
                                                initial="hidden"
                                                animate="show"
                                                transition={{ ...AGRO_SPRING, delay: idx * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/10">
                                                            {u.displayName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{u.displayName}</p>
                                                            <p className="text-[10px] text-text-muted">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-widest border ${
                                                        u.role === 'brand' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                        u.role === 'influencer' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'influencer' ? (
                                                        <div className="flex items-center gap-2">
                                                            {u.isVerified ? (
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                                                    <ShieldCheck size={14} /> Verified
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                                                                    <ShieldAlert size={14} /> Unverified
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                                    {formatRelativeTime(u.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {u.role === 'influencer' && (
                                                        <button 
                                                            onClick={() => toggleVerification(u.user_id, u.isVerified)}
                                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                                u.isVerified 
                                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                            }`}
                                                        >
                                                            {u.isVerified ? 'Unverify' : 'Verify'}
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
