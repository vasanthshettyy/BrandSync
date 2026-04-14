import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Menu, ArrowUpRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationBell from '../notifications/NotificationBell';

export default function Topbar({ onMenuClick }) {
    const { profile, role } = useAuth();
    const { isDark } = useTheme();
    const location = useLocation();

    // Format path to title
    const pathParts = location.pathname.split('/').filter(Boolean);
    const pageTitle = pathParts.length > 1
        ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace('-', ' ')
        : 'Dashboard';

    const displayName = role === 'brand'
        ? profile?.company_name || 'Brand'
        : role === 'influencer'
            ? profile?.full_name || 'Influencer'
            : 'Admin';

    const avatarUrl = role === 'brand'
        ? profile?.logo_url
        : profile?.avatar_url;

    return (
        <header
            style={{ backdropFilter: 'blur(10px)' }}
            className={`relative z-[120] overflow-visible h-[80px] flex items-center justify-between px-8 transition-all duration-500 ease-apple border-white/20 !rounded-3xl shadow-xl border-[1px] ${isDark ? 'bg-black/20' : 'bg-white/40'
                }`}
        >
            {/* Left: Mobile Menu & Breadcrumb */}
            <div className="flex items-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.08, rotate: -3 }}
                    onClick={onMenuClick}
                    className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-text-muted cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
                <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-0.5">Welcome back,</p>
                    <h1 className="text-lg font-display font-bold text-text-primary tracking-tight group cursor-default">
                        {pageTitle}
                        <span className="inline-block w-1 h-1 bg-primary rounded-full ml-1 animate-pulse" />
                    </h1>
                </div>
            </div>

            {/* Center: Search (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-md px-8 relative group/search">
                <div
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease'
                    }}
                    className="flex items-center gap-3 px-6 min-h-[44px] w-full group focus-within:shadow-[0_0_0_2px_rgba(124,58,237,0.4)] focus-within:border-transparent"
                >
                    <Search className={`w-4 h-4 shrink-0 transition-transform duration-300 group-focus-within:scale-110 ${isDark ? 'text-text-muted' : 'text-text-dark-muted'}`} />
                    <input
                        type="text"
                        placeholder="Search for influencers, gigs..."
                        className="bg-transparent outline-none w-full text-sm placeholder:text-text-muted/60 font-medium"
                    />
                </div>

                {/* Search Suggestions Dropdown (Apple-style instant feedback) */}
                <div className="absolute top-full left-8 right-8 mt-2 glass-card opacity-0 translate-y-2 pointer-events-none group-focus-within/search:opacity-100 group-focus-within/search:translate-y-0 group-focus-within/search:pointer-events-auto transition-all duration-300 z-50 p-2">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest p-2 mb-1">Recommended Gigs</div>
                    <div className="flex flex-col gap-1">
                        {['Social Media Campaign', 'Product Photography', 'Short Film Production'].map((item) => (
                            <button key={item} className="text-left px-3 min-h-[44px] text-xs hover:bg-white/5 rounded-lg transition-colors text-white/80 hover:text-white flex items-center justify-between group/item">
                                {item}
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-6">
                <NotificationBell />

                <motion.div
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-4 group cursor-pointer transition-all duration-300"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">{displayName}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                            {role}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-brand transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full rounded-full overflow-hidden bg-surface-900 border-2 border-surface-900">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                        {displayName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-surface-900 rounded-full shadow-sm" />
                    </div>
                </motion.div>
            </div>
        </header>
    );
}