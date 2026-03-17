import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard, Search, Megaphone, FileText, Star,
    Bell, Settings, LogOut, Sun, Moon, Users, Shield,
    Briefcase, Send, Leaf, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

const brandLinks = [
    { to: '/brand/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/brand/discover', icon: Search, label: 'Discover' },
    { to: '/brand/post-gig', icon: Megaphone, label: 'Post Gig' },
    { to: '/brand/contracts', icon: FileText, label: 'Contracts' },
];

const influencerLinks = [
    { to: '/influencer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/influencer/gigs', icon: Briefcase, label: 'Gig Feed' },
    { to: '/influencer/proposals', icon: Send, label: 'My Proposals' },
    { to: '/influencer/contracts', icon: FileText, label: 'Contracts' },
];

const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/gigs', icon: Megaphone, label: 'Gig Moderation' },
    { to: '/admin/verification', icon: Shield, label: 'Verification' },
];

export default function Sidebar() {
    const { role, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const links = role === 'brand' ? brandLinks
        : role === 'influencer' ? influencerLinks
            : role === 'admin' ? adminLinks
                : [];

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r transition-all duration-300 ease-in-out ${isHovered ? 'w-[260px]' : 'w-[80px]'
                } glass-card !rounded-none !border-y-0 !border-l-0 backdrop-blur-xl`}
            style={{
                background: isDark ? 'rgba(5, 5, 10, 0.6)' : 'rgba(250, 250, 250, 0.8)',
            }}
        >
            {/* Logo */}
            <div className="flex items-center px-6 h-[70px] transition-all duration-300 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${isHovered ? 'w-32 ml-3 opacity-100' : 'w-0 ml-0 opacity-0'}`}>
                    <span className="font-display font-bold text-xl text-gradient">
                        BrandSync
                    </span>
                </div>
            </div>

            <div className="px-6 mb-4">
                <div className={`h-px bg-white/5 transition-all duration-500 ease-out ${isHovered ? 'w-full scale-x-100' : 'w-0 scale-x-0'}`} />
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                {links.map(({ to, icon: Icon, label }, index) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `relative flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : isDark
                                    ? 'text-text-secondary hover:text-white'
                                    : 'text-text-dark-secondary hover:text-text-dark-primary'
                            }`
                        }
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {({ isActive }) => (
                            <>
                                {/* Sliding highlight background on hover */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                )}
                                <Icon className="w-6 h-6 shrink-0 relative z-10" />
                                <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap relative z-10 ${isHovered ? 'w-40 opacity-100' : 'w-0 opacity-0'}`}>
                                    {label}
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium w-full transition-all duration-300 cursor-pointer group relative overflow-hidden ${isDark
                        ? 'text-text-secondary hover:text-white'
                        : 'text-text-dark-secondary hover:text-text-dark-primary'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {isDark ? <Sun className="w-6 h-6 shrink-0 relative z-10" /> : <Moon className="w-6 h-6 shrink-0 relative z-10" />}
                    <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap relative z-10 text-left ${isHovered ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </div>
                </button>

                <button
                    onClick={signOut}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium w-full text-red-400 hover:text-red-300 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-[0_0_0_rgba(225,29,72,0)] hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-red-500/10"
                >
                    <LogOut className="w-6 h-6 shrink-0 relative z-10" />
                    <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap relative z-10 text-left ${isHovered ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                        Sign Out
                    </div>
                </button>
            </div>
        </aside>
    );
}
