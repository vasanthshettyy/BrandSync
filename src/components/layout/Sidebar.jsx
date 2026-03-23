import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    Briefcase,
    Send,
    FileText,
    MessageSquare,
    Settings,
    Sparkles,
    Minimize2,
    Layout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MICRO_INTERACTION, PREMIUM_SPRING, AGRO_SPRING, FLUID_SPRING, SUPER_SMOOTH } from '../../lib/motion';
import { cn } from '../../lib/utils';

const ROLE_NAV_CONFIG = {
    brand: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/brand/dashboard' },
        { id: 'discovery', label: 'Discovery', icon: Search, path: '/brand/discover' },
        { id: 'gigs', label: 'My Gigs', icon: Briefcase, path: '/brand/post-gig' },
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
        { id: 'settings', label: 'Settings', icon: Settings, path: '/influencer/settings' },
    ],
    admin: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { id: 'users', label: 'Users', icon: Search, path: '/admin/users' },
        { id: 'gigs', label: 'Gig Moderation', icon: Briefcase, path: '/admin/gigs' },
        { id: 'verification', label: 'Verification', icon: FileText, path: '/admin/verification' },
    ],
};

const NavItem = ({ item, state, isActive }) => {
    const Icon = item.icon;
    const isDock = state === 'dock';
    const isCollapsed = state === 'collapsed';
    const isExpanded = state === 'expanded';

    return (
        <NavLink to={item.path} className={cn(isDock ? 'px-1' : 'w-full')}>
            <motion.div
                whileHover="hover"
                className={cn(
                    'group relative flex items-center h-12 rounded-xl transition-all duration-300',
                    isDock ? 'px-4' : 'px-3 w-full',
                    isActive ? 'bg-white/10 shadow-sm text-white' : 'text-white/60 hover:text-white'
                )}
            >
                {/* Hover Backdrop Sliding Effect */}
                <motion.div
                    className="absolute inset-0 bg-white/5 rounded-xl -z-10 origin-left"
                    initial={{ scaleX: 0 }}
                    variants={{
                        hover: { scaleX: 1 }
                    }}
                    transition={AGRO_SPRING}
                />

                <motion.div
                    animate={{ x: isCollapsed ? 12 : 0 }}
                    transition={AGRO_SPRING}
                    className="flex items-center justify-center"
                >
                    <Icon
                        className={cn(
                            'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                            isDock ? 'mx-auto' : ''
                        )}
                    />
                </motion.div>

                <AnimatePresence mode="wait">
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ ...AGRO_SPRING, delay: 0.1 }}
                            className="ml-3 font-medium whitespace-nowrap overflow-hidden"
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {isActive && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl -z-10"
                        transition={AGRO_SPRING}
                    />
                )}
            </motion.div>
        </NavLink>
    );
};

export default function Sidebar() {
    const [state, setState] = useState('expanded');
    const { role } = useAuth();
    const { isDark } = useTheme();
    const location = useLocation();

    const navItems = ROLE_NAV_CONFIG[role] || ROLE_NAV_CONFIG.brand;

    const handleMouseEnter = () => {
        if (state === 'collapsed') {
            setState('expanded');
        }
    };

    const handleMouseLeave = () => {
        if (state === 'expanded') {
            setState('collapsed');
        }
    };

    const toggleDock = () => {
        setState(prev => (prev === 'dock' ? 'collapsed' : 'dock'));
    };

    const isDock = state === 'dock';
    const isCollapsed = state === 'collapsed';
    const isExpanded = state === 'expanded';

    return (
        <LayoutGroup>
            <motion.div
                layout
                initial={false}
                animate={state}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                variants={{
                    expanded: { width: 260, height: '100%', borderRadius: '24px', x: 0, y: 0, bottom: 'auto', left: 0 },
                    collapsed: { width: 80, height: '100%', borderRadius: '24px', x: 0, y: 0, bottom: 'auto', left: 0 },
                    dock: { width: 'fit-content', height: 72, borderRadius: '99px', x: '-50%', y: -24, bottom: 0, left: '50%' },
                }}
                transition={FLUID_SPRING}
                className={cn(
                    'z-50 backdrop-blur-xl border border-white/20 shadow-2xl flex transition-colors duration-500 overflow-hidden',
                    isDock ? 'fixed flex-row items-center px-4' : 'flex-col py-6 relative',
                    isDark ? 'bg-black/20' : 'bg-white/40'
                )}
            >
                <AnimatePresence mode="wait">
                    {!isDock && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={PREMIUM_SPRING}
                            className={cn('px-6 mb-8 flex flex-col gap-6 transition-all duration-300', isCollapsed && 'px-0 items-center')}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-3 overflow-hidden transition-all duration-300',
                                    isCollapsed && 'justify-center w-full'
                                )}
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <AnimatePresence mode="wait">
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={PREMIUM_SPRING}
                                            className="text-xl font-bold text-white tracking-tight"
                                        >
                                            BrandSync
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.nav
                    layout
                    transition={SUPER_SMOOTH}
                    className={cn('flex-1 px-3 flex gap-2 overflow-hidden', isDock ? 'flex-row items-center' : 'flex-col')}
                >
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            item={item}
                            state={state}
                            isActive={location.pathname === item.path}
                        />
                    ))}

                    <div className={cn('mt-auto flex gap-2', isDock ? 'ml-4 pl-4 border-l border-white/10' : 'flex-col')}>
                        <motion.button
                            {...MICRO_INTERACTION}
                            onClick={toggleDock}
                            className="flex items-center justify-center w-full h-10 rounded-xl hover:bg-white/10 transition-colors text-white/60"
                            title={isDock ? 'Back to Sidebar' : 'Dock Mode'}
                        >
                            {isDock ? <Layout size={20} /> : <Minimize2 size={20} />}
                        </motion.button>
                    </div>
                </motion.nav>
            </motion.div>
        </LayoutGroup>
    );
}
