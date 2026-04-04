import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import UserModerationTable from '../../components/admin/UserModerationTable';
import { Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UserManagementPage (Admin)
 * Enhanced for MVP: User activation/ban toggles with feedback.
 */
export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    async function fetchUsers() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function toggleUserStatus(userId, newStatus) {
        setMessage(null);
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_active: newStatus })
                .eq('user_id', userId);

            if (error) throw error;
            
            setUsers(prev => prev.map(u => 
                u.user_id === userId ? { ...u, is_active: newStatus } : u
            ));
            setMessage({ type: 'success', text: `User ${newStatus ? 'activated' : 'deactivated'} successfully.` });
        } catch (err) {
            console.error('Error updating user status:', err);
            setMessage({ type: 'error', text: 'Failed to update user status.' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    }

    return (
        <PageWrapper title="User Management" subtitle="Manage and moderate platform participants.">
            <div className="space-y-6">
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-24 right-8 z-[200] px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
                                message.type === 'success' 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <p className="text-sm font-bold tracking-tight">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Platform Users</h2>
                        <p className="text-sm text-text-muted">Total registered accounts: {users.length}</p>
                    </div>
                </div>

                <UserModerationTable 
                    users={users} 
                    onToggleStatus={toggleUserStatus} 
                    isLoading={loading} 
                />
            </div>
        </PageWrapper>
    );
}
