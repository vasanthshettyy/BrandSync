import { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    Briefcase,
    Send,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    User,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { cn } from '../../lib/utils';
import makerhqMark from '../../assets/makerhq-mark.png';

const ROLE_NAV_CONFIG = {
    brand: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/brand/dashboard' },
        { id: 'discovery', label: 'Discovery', icon: Search, path: '/brand/discover' },
        { id: 'gigs', label: 'My Gigs', icon: Briefcase, path: '/brand/gigs' },
        { id: 'contracts', label: 'Contracts', icon: FileText, path: '/brand/contracts' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/brand/messages' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/brand/settings' },
    ],
    influencer: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/influencer/dashboard' },
        { id: 'discovery', label: 'Discovery', icon: Search, path: '/influencer/gigs' },
        { id: 'proposals', label: 'Proposals', icon: Send, path: '/influencer/proposals' },
        { id: 'contracts', label: 'Contracts', icon: FileText, path: '/influencer/contracts' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/influencer/messages' },
    ],
    admin: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { id: 'users', label: 'Users', icon: User, path: '/admin/users' },
        { id: 'gigs', label: 'Gigs', icon: Briefcase, path: '/admin/gigs' },
        { id: 'verification', label: 'Verification', icon: FileText, path: '/admin/verification' },
    ],
};

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { role, profile, user, signOut } = useAuth();
    const { isDark } = useTheme();
    // eslint-disable-next-line no-unused-vars
    const { settings } = usePlatformSettings();
    const location = useLocation();

    // Phase 10 scaffold only; chat visibility can be gated by settings.enableChat
    const rawNavItems = ROLE_NAV_CONFIG[role] || ROLE_NAV_CONFIG.brand;

    // In next sprint, we can filter like this:
    // const navItems = rawNavItems.filter(item => item.id !== 'messages' || settings.enableChat);
    const navItems = rawNavItems;

    const displayName = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'User';

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                "z-50 hidden md:flex flex-col h-full page-enter",
                "backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative",
                isDark ? "bg-black/40" : "bg-white/30"
            )}
        >
            {/* Logo Section */}
            <div className={cn("p-6 mb-4 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
                <img
                    src={makerhqMark}
                    alt="MakerHQ"
                    className="w-10 h-10 object-contain shrink-0"
                />
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 tracking-tight"
                    >
                        MakerHQ
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <NavLink key={item.id} to={item.path} className="block relative group">
                            <motion.div
                                className={cn(
                                    "relative flex items-center h-12 rounded-2xl transition-all duration-200 px-3",
                                    isActive ? "text-white" : "text-white opacity-60 hover:opacity-100"
                                )}
                                style={isActive ? {
                                    background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
                                    borderLeft: '3px solid var(--color-primary)'
                                } : {}}
                            >
                                <div
                                    className={cn(
                                        "flex items-center justify-center group-hover:scale-110",
                                        isCollapsed ? "w-full" : "w-6"
                                    )}
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    <Icon size={20} />
                                </div>

                                {isCollapsed && (
                                    <span className="absolute left-full ml-3 px-2 py-1 text-xs font-bold text-white bg-surface-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-50 shadow-lg border border-white/10">
                                        {item.label}
                                    </span>
                                )}

                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-3 font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 space-y-4">
                {/* Mini Profile Card */}
                <Link
                    to={role === 'influencer' ? '/influencer/profile' : `/${role}/settings`}
                    className="block w-full min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl transition-all"
                    aria-label="View Profile"
                >
                    <motion.div
                        whileHover="hover"
                        initial="rest"
                        className={cn(
                            "relative overflow-hidden rounded-2xl p-2 transition-all duration-500",
                            "bg-white/5 border border-white/5 backdrop-blur-md",
                            isCollapsed ? "flex justify-center" : "flex items-center gap-3"
                        )}
                    >
                        <motion.div
                            variants={{
                                rest: { opacity: 0 },
                                hover: { opacity: 1 }
                            }}
                            className="absolute inset-0 bg-white/5 -z-10"
                        />
                        <motion.div
                            variants={{
                                rest: { scale: 1 },
                                hover: { scale: 1.05 }
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-inner overflow-hidden"
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </motion.div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex flex-col min-w-0"
                                >
                                    <span className="text-sm font-semibold text-white truncate">{displayName}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                        {role || 'Member'}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Link>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className={cn(
                        "w-full flex items-center h-12 rounded-2xl transition-all duration-200 px-3 relative overflow-hidden group",
                        "text-rose-400 opacity-60 hover:opacity-100 hover:bg-rose-500/10 cursor-pointer"
                    )}
                >
                    <div
                        className={cn("flex items-center justify-center group-hover:scale-110", isCollapsed ? "w-full" : "w-6")}
                        style={{ transition: 'all 0.2s ease' }}
                    >
                        <LogOut size={20} />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-3 font-medium"
                        >
                            Sign Out
                        </motion.span>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
