import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  ShieldOff, 
  Search, 
  Loader2, 
  User, 
  Mail, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';

const UserModerationTable = ({ users = [], onToggleStatus, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleToggle = async (userId, newStatus) => {
    setProcessingId(userId);
    try {
      await onToggleStatus(userId, newStatus);
    } finally {
      setProcessingId(null);
    }
  };

  const RoleBadge = ({ role }) => {
    const isBrand = role === 'brand';
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors",
        isBrand 
          ? "bg-primary/10 border-primary/20 text-primary" 
          : "bg-teal-500/10 border-teal-500/20 text-teal-400"
      )}>
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-white/5 rounded-lg text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/30 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8">
                    <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr 
                  key={user.user_id} 
                  className={cn(
                    "group transition-colors hover:bg-white/5",
                    !user.is_active && "opacity-60 bg-rose-500/[0.02]"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                          {user.email}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {user.user_id.split('-')[0]}...
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Calendar size={14} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        user.is_active ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {user.is_active ? 'Active' : 'Banned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(user.user_id, !user.is_active)}
                      disabled={processingId === user.user_id}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all transform active:scale-95",
                        user.is_active 
                          ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" 
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      )}
                    >
                      {processingId === user.user_id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : user.is_active ? (
                        <ShieldOff size={14} />
                      ) : (
                        <Shield size={14} />
                      )}
                      {user.is_active ? 'BAN' : 'UNBAN'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserModerationTable;
