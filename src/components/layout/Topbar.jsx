import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
            className={`h-[80px] flex items-center justify-between px-8 transition-all duration-500 ease-apple backdrop-blur-xl border-white/20 !rounded-3xl shadow-xl border-[1px] ${
                isDark ? 'bg-black/20' : 'bg-white/40'
            }`}
        >
            {/* Left: Mobile Menu & Breadcrumb */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-text-muted cursor-pointer active:scale-90"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-0.5">Welcome back,</p>
                    <h1 className="text-lg font-display font-bold text-text-primary tracking-tight group cursor-default">
                        {pageTitle}
                        <span className="inline-block w-1 h-1 bg-primary rounded-full ml-1 animate-pulse" />
                    </h1>
                </div>
            </div>

            {/* Center: Search (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-md px-8">
                <div
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-full w-full transition-all duration-500 ease-apple border-[1px] group ${
                        isDark
                            ? 'bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:border-primary/50'
                            : 'bg-black/5 border-black/10 focus-within:bg-white focus-within:border-primary/50 shadow-sm'
                    }`}
                >
                    <Search className={`w-4 h-4 shrink-0 transition-transform duration-300 group-focus-within:scale-110 ${isDark ? 'text-text-muted' : 'text-text-dark-muted'}`} />
                    <input
                        type="text"
                        placeholder="Search for influencers, gigs..."
                        className="bg-transparent outline-none w-full text-sm placeholder:text-text-muted/60 font-medium"
                    />
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-6">
                <NotificationBell />

                <div className="flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all duration-300">
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
                </div>
            </div>
        </header>
    );
}
