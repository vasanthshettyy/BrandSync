import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
    Users, Star, Globe, Instagram, Youtube, MapPin, 
    BadgeCheck, Share2, Send, Loader2, AlertCircle,
    ChevronLeft, Heart, ExternalLink, Briefcase, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { formatFollowers, formatINR, cn } from '../../lib/utils';

/**
 * PublicProfile Page
 * Displays a premium, high-end profile for influencers.
 */
export default function PublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [campaignsCount, setCampaignsCount] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Placeholder Portfolio Data
    const PORTFOLIO_PLACEHOLDERS = [
        { id: 1, title: 'Summer Campaign', type: 'Lifestyle', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&auto=format&fit=crop' },
        { id: 2, title: 'Tech Review', type: 'Gadgets', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop' },
        { id: 3, title: 'Morning Routine', type: 'Vlog', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop' },
    ];

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                // 1. Fetch user role/email
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role, email')
                    .eq('user_id', id)
                    .maybeSingle();

                if (userError) throw userError;
                if (!userData) {
                    setError('User not found');
                    return;
                }
                setUserRole(userData.role);

                // 2. Fetch influencer profile details
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles_influencer')
                    .select('*')
                    .eq('user_id', id)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profileData) {
                    setError('Influencer profile not complete');
                    return;
                }

                setProfile(profileData);

                // 3. Fetch completed campaigns count
                const { count, error: countError } = await supabase
                    .from('contracts')
                    .select('*', { count: 'exact', head: true })
                    .eq('influencer_id', id)
                    .eq('status', 'Completed');
                
                if (!countError) setCampaignsCount(count || 0);

                // 4. Fetch most recent 3 reviews
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from('reviews')
                    .select('*, profiles_brand(company_name, logo_url)')
                    .eq('target_id', id)
                    .order('created_at', { ascending: false })
                    .limit(3);
                
                if (!reviewsError) setReviews(reviewsData || []);

            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchProfile();
    }, [id]);

    const handleInvite = () => {
        navigate('/brand/post-gig', { 
            state: { 
                influencerId: id, 
                influencerName: profile.full_name 
            } 
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 opacity-40">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
                <p className="text-xs font-bold uppercase tracking-widest">Architecting Profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                    <AlertCircle size={40} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{error || 'Profile Not Found'}</h1>
                <p className="text-text-secondary max-w-xs mb-8">
                    The influencer profile you're looking for doesn't exist or is still being set up.
                </p>
                <button 
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                >
                    <ChevronLeft size={18} />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <PageWrapper>
            <motion.div 
                variants={STAGGER_CONTAINER}
                initial="initial"
                animate="animate"
                className="max-w-5xl mx-auto space-y-8 pb-20"
            >
                {/* Hero Section */}
                <motion.div variants={STAGGER_ITEM} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10 opacity-50" />
                    <div className="glass-card p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-10">
                        {/* Avatar with Animated Border */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-brand p-1.5 shadow-2xl shadow-indigo-500/30">
                                <div className="w-full h-full rounded-full bg-surface-900 overflow-hidden border-4 border-surface-900">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                            <span className="text-4xl font-bold text-white opacity-20">{profile.full_name?.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {profile.is_verified && (
                                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-primary p-1.5 md:p-2 rounded-full shadow-lg border-4 border-surface-900 text-white">
                                    <BadgeCheck size={16} className="md:w-5 md:h-5" fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3">
                                    {profile.full_name}
                                    {!profile.is_verified && <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-text-muted font-bold uppercase tracking-widest">Rising Star</span>}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-2">
                                    <span className="text-gradient font-bold text-base md:text-lg">{profile.niche}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="text-sm font-medium">{profile.city || 'Remote'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                <button onClick={handleInvite} className="btn-primary min-w-full md:min-w-[180px]">
                                    <Send size={18} />
                                    Invite to Campaign
                                </button>
                                <button className="btn-secondary min-w-full md:min-w-0">
                                    <Share2 size={18} />
                                    Share Profile
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="glass-card bg-white/5 p-4 md:p-5 text-center min-w-[100px] md:min-w-[120px]">
                                <p className="text-xl md:text-2xl font-black text-white">{formatFollowers(profile.followers_count || 0)}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Followers</p>
                            </div>
                            <div className="glass-card bg-white/5 p-4 md:p-5 text-center min-w-[100px] md:min-w-[120px]">
                                <p className="text-xl md:text-2xl font-black text-success">{profile.engagement_rate || '0.0'}%</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Engagement</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Links */}
                    <motion.div variants={STAGGER_ITEM} className="space-y-6 order-2 md:order-1">
                        {/* Social Links */}
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 px-1">Social Channels</h3>
                            {profile.instagram_handle && (
                                <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-transparent border border-pink-500/20 group hover:border-pink-500/40 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Instagram className="text-pink-500" size={20} />
                                        <span className="text-sm font-bold text-white">@{profile.instagram_handle}</span>
                                    </div>
                                    <Globe size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                            {profile.youtube_handle && (
                                <a href={`https://youtube.com/@${profile.youtube_handle}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 group hover:border-red-500/40 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Youtube className="text-red-500" size={20} />
                                        <span className="text-sm font-bold text-white">{profile.youtube_handle}</span>
                                    </div>
                                    <Globe size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>

                        {/* Pricing / Language */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Pricing</h3>
                                <div className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">ESTIMATED</div>
                            </div>
                            <p className="text-3xl font-display font-black text-white">{formatINR(profile.price_per_post || 0)} <span className="text-xs font-normal text-text-muted">/ post</span></p>
                            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Language</span>
                                    <span className="text-white font-bold">{profile.language || 'English'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Platform Primary</span>
                                    <span className="text-white font-bold capitalize">{profile.platform_primary || 'Instagram'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        {reviews.length > 0 && (
                            <div className="glass-card p-6 space-y-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Recent Feedback</h3>
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="space-y-2 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-white truncate">{review.profiles_brand?.company_name}</p>
                                                <div className="flex items-center gap-0.5 text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-text-secondary italic leading-relaxed line-clamp-3">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Bio / About */}
                    <motion.div variants={STAGGER_ITEM} className="md:col-span-2 space-y-8 order-1 md:order-2">
                        <div className="glass-card p-6 md:p-10 relative overflow-hidden backdrop-blur-3xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <Users size={24} className="text-primary" />
                                About the Influencer
                            </h2>
                            
                            {/* Deep-Dive Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Followers</p>
                                    <p className="text-xl font-display font-black text-white">{formatFollowers(profile.followers_count || 0)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Engagement</p>
                                    <p className="text-xl font-display font-black text-primary">{profile.engagement_rate || '0.0'}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avg. Likes</p>
                                    <p className="text-xl font-display font-black text-pink-500">
                                        <span className="flex items-center gap-1"><Heart size={16} fill="currentColor" /> {formatFollowers((profile.followers_count || 0) * 0.05)}</span>
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Campaigns</p>
                                    <p className="text-xl font-display font-black text-success">{campaignsCount}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">
                                    {profile.bio || "No biography provided yet."}
                                </p>
                            </div>

                            {/* Achievement Tags */}
                            <div className="flex flex-wrap gap-3 mt-10">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white uppercase tracking-wider">
                                    <Star size={14} className="text-yellow-500" />
                                    Top 1% Niche
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white uppercase tracking-wider">
                                    <Users size={14} className="text-blue-400" />
                                    Fast Growing
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white uppercase tracking-wider">
                                    <Globe size={14} className="text-emerald-400" />
                                    Global Reach
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Gallery */}
                        <div className="glass-card p-6 md:p-10 backdrop-blur-3xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                    <Camera size={24} className="text-secondary" />
                                    Featured Work
                                </h2>
                                {profile.portfolio_url && (
                                    <a 
                                        href={profile.portfolio_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                                    >
                                        Live Portfolio
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {PORTFOLIO_PLACEHOLDERS.map((item) => (
                                    <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-surface-800">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{item.type}</p>
                                            <p className="text-sm font-display font-bold text-white">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </PageWrapper>
    );
}
