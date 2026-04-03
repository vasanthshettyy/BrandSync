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
    Sparkles,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

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
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
};

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { role, profile, user, signOut } = useAuth();
    const { isDark } = useTheme();
    const location = useLocation();

    const navItems = ROLE_NAV_CONFIG[role] || ROLE_NAV_CONFIG.brand;
    const displayName = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.substring(0, 2).toUpperCase();

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
                "z-50 hidden md:flex flex-col h-full",
                "backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative",
                isDark ? "bg-black/20" : "bg-white/40"
            )}
        >
            {/* Logo Section */}
            <div className={cn("p-6 mb-4 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
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
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                className={cn(
                                    "relative flex items-center h-12 rounded-2xl transition-colors duration-500 px-3",
                                    isActive ? "text-white" : "text-slate-400 hover:text-emerald-400"
                                )}
                            >
                                {/* Hover Glow Backdrop */}
                                <motion.div
                                    variants={{
                                        rest: { opacity: 0, scale: 0.95 },
                                        hover: { opacity: 1, scale: 1 }
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="absolute inset-0 bg-emerald-500/10 rounded-2xl -z-10"
                                />
                                
                                <motion.div 
                                    variants={{
                                        rest: { scale: 1 },
                                        hover: { scale: 1.1, x: 2 }
                                    }}
                                    className={cn(
                                        "flex items-center justify-center transition-all duration-300",
                                        isCollapsed ? "w-full" : "w-6"
                                    )}
                                >
                                    <Icon size={20} />
                                </motion.div>

                                {!isCollapsed && (
                                    <motion.span
                                        variants={{
                                            rest: { x: 0 },
                                            hover: { x: 4 }
                                        }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-3 font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {/* Active Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-2xl -z-20 shadow-lg shadow-emerald-500/20"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
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
                    className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl transition-all"
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
                <motion.button
                    whileHover="hover"
                    initial="rest"
                    onClick={handleSignOut}
                    className={cn(
                        "w-full flex items-center h-12 rounded-2xl transition-colors duration-500 px-3 relative overflow-hidden",
                        "text-rose-400 hover:text-rose-300 group"
                    )}
                >
                    <motion.div
                        variants={{
                            rest: { opacity: 0 },
                            hover: { opacity: 1 }
                        }}
                        className="absolute inset-0 bg-rose-500/10 -z-10"
                    />
                    <motion.div 
                        variants={{
                            rest: { scale: 1, rotate: 0 },
                            hover: { scale: 1.1, rotate: -10 }
                        }}
                        className={cn("flex items-center justify-center transition-all duration-300", isCollapsed ? "w-full" : "w-6")}
                    >
                        <LogOut size={20} />
                    </motion.div>
                    {!isCollapsed && (
                        <motion.span
                            variants={{
                                rest: { x: 0 },
                                hover: { x: 4 }
                            }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-3 font-medium"
                        >
                            Sign Out
                        </motion.span>
                    )}
                </motion.button>
            </div>
        </motion.aside>
    );
}
