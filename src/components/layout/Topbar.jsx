import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
            className="h-[80px] flex items-center justify-between px-8 transition-all duration-300 glass-card !rounded-3xl border border-white/10"
        >
            {/* Left: Mobile Menu & Breadcrumb */}
            <div className="flex items-center gap-4">
                <button
                    className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-text-muted cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:block">
                    <p className="text-xs font-medium text-text-muted mb-0.5">Welcome back,</p>
                    <h1 className="text-lg font-display font-bold text-text-primary tracking-tight">
                        {pageTitle}
                    </h1>
                </div>
            </div>

            {/* Center: Search (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-md px-8">
                <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-full w-full transition-all duration-300 border focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 ${isDark
                        ? 'bg-white/5 border-white/5 text-text-secondary focus-within:bg-white/10'
                        : 'bg-black/5 border-black/5 text-text-dark-secondary focus-within:bg-white'
                        }`}
                >
                    <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-text-muted' : 'text-text-dark-muted'}`} />
                    <input
                        type="text"
                        placeholder="Search for influencers, gigs..."
                        className="bg-transparent outline-none w-full text-sm placeholder:text-current font-medium"
                    />
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-4">
                <button
                    className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer group ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                        }`}
                >
                    <Bell className="w-5 h-5 text-text-secondary icon-hover-effect" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full animate-pulse-dot shadow-[0_0_10px_rgb(225_29_72_/_0.6)]" />
                </button>

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-text-primary tracking-tight group-hover:text-primary transition-colors">{displayName}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {role}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-brand transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-surface-900 border-2 border-surface-900">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
