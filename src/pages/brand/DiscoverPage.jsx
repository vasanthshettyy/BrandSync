import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscovery } from '../../hooks/useDiscovery';
import { useReviews } from '../../hooks/useReviews';
import { NICHES, INDIAN_CITIES, LANGUAGES, PLATFORMS, FOLLOWER_TIERS } from '../../lib/constants';
import { MICRO_INTERACTION, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import { formatFollowers, formatINR } from '../../lib/utils';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    Search, SlidersHorizontal, X, MapPin, Users, Star,
    Instagram, Youtube, BadgeCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function DiscoverPage() {
    const { influencers, loading, totalCount, totalPages, filters, updateFilter, resetFilters, setPage } = useDiscovery();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <PageWrapper title="Discover Influencers" subtitle={`${totalCount} creators found`}>
            {/* Search + Filter Toggle */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        id="discover-search"
                        name="search"
                        type="text"
                        value={filters.search}
                        onChange={e => updateFilter('search', e.target.value)}
                        placeholder="Search by name, niche, or bio..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <motion.button
                    {...MICRO_INTERACTION}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${showFilters ? 'border-primary bg-primary/10 text-primary' : 'border-border-dark hover:border-primary/30'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                </motion.button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filter-bar animate-in fade-slide-up bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
                    <div className="flex w-full items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Advanced Filters</h3>
                        </div>
                        <button onClick={resetFilters} className="text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer">
                            Reset All
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                        <div className="filter-group">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Niche</label>
                            <select 
                                className="w-full bg-white/5 border border-border-dark rounded-lg p-2 text-xs outline-none focus:border-primary"
                                value={filters.niche} 
                                onChange={e => updateFilter('niche', e.target.value)}
                            >
                                <option value="">All Niches</option>
                                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">City</label>
                            <select 
                                className="w-full bg-white/5 border border-border-dark rounded-lg p-2 text-xs outline-none focus:border-primary"
                                value={filters.city} 
                                onChange={e => updateFilter('city', e.target.value)}
                            >
                                <option value="">All Cities</option>
                                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Language</label>
                            <select 
                                className="w-full bg-white/5 border border-border-dark rounded-lg p-2 text-xs outline-none focus:border-primary"
                                value={filters.language} 
                                onChange={e => updateFilter('language', e.target.value)}
                            >
                                <option value="">All Languages</option>
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Platform</label>
                            <select 
                                className="w-full bg-white/5 border border-border-dark rounded-lg p-2 text-xs outline-none focus:border-primary"
                                value={filters.platform} 
                                onChange={e => updateFilter('platform', e.target.value)}
                            >
                                <option value="">All Platforms</option>
                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Followers</label>
                            <select 
                                className="w-full bg-white/5 border border-border-dark rounded-lg p-2 text-xs outline-none focus:border-primary"
                                value={`${filters.minFollowers}-${filters.maxFollowers}`}
                                onChange={e => {
                                    const [min, max] = e.target.value.split('-').map(Number);
                                    updateFilter('minFollowers', min);
                                    setTimeout(() => updateFilter('maxFollowers', max), 0);
                                }}>
                                <option value="0-0">All Tiers</option>
                                {Object.values(FOLLOWER_TIERS).map(t => (
                                    <option key={t.label} value={`${t.min}-${t.max}`}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {loading ? (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                    variants={STAGGER_CONTAINER}
                    initial="hidden"
                    animate="show"
                >
                    {[...Array(10)].map((_, i) => (
                        <motion.div key={i} variants={STAGGER_ITEM} className="glass-card aspect-[16/20] animate-pulse overflow-hidden">
                            <div className="aspect-[16/10] bg-white/5 w-full" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/2" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : influencers.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Search className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">No influencers found</h3>
                    <p className="text-text-secondary">Try adjusting your filters or search term to see more creators.</p>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                    variants={STAGGER_CONTAINER}
                    initial="hidden"
                    animate="show"
                >
                    {influencers.map(inf => (
                        <InfluencerCard key={inf.user_id} inf={inf} />
                    ))}
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPage(filters.page - 1)} disabled={filters.page <= 1}
                        className="p-2 rounded-lg border border-border-dark hover:bg-white/5 disabled:opacity-30 cursor-pointer transition-colors text-white">
                        <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <span className="text-sm font-bold text-text-secondary px-3 tracking-widest uppercase">Page {filters.page} of {totalPages}</span>
                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPage(filters.page + 1)} disabled={filters.page >= totalPages}
                        className="p-2 rounded-lg border border-border-dark hover:bg-white/5 disabled:opacity-30 cursor-pointer transition-colors text-white">
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            )}
        </PageWrapper>
    );
}

function InfluencerCard({ inf }) {
    const { getUserRating } = useReviews();
    const [ratingData, setRatingData] = useState({ avg_rating: 0, total_reviews: 0 });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const data = await getUserRating(inf.user_id);
                setRatingData(data);
            } catch (err) {
                console.error('Error fetching rating for card:', err);
            }
        };
        fetchRating();
    }, [inf.user_id]);

    return (
        <Link to={`/influencer/${inf.user_id}`} className="block h-full">
            <motion.div
                variants={STAGGER_ITEM}
                whileHover={{ scale: 1.01, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card group hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full relative"
            >
                {/* Image Header 16:10 */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-800">
                    {inf.avatar_url ? (
                        <img 
                            src={inf.avatar_url} 
                            alt={inf.full_name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-brand opacity-20" />
                    )}

                    {/* Hover Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <div className="px-4 py-2 rounded-xl bg-white text-primary font-bold text-[10px] uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Profile
                        </div>
                    </motion.div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        Available
                    </span>
                    {inf.is_verified && (
                        <div className="bg-blue-500/20 backdrop-blur-md p-1 rounded-full border border-blue-500/20">
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/40 text-white border border-white/10">
                        {inf.niche}
                    </span>
                    {ratingData.total_reviews > 0 && (
                        <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            {ratingData.avg_rating.toFixed(1)} ({ratingData.total_reviews})
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-sm text-text-primary truncate transition-colors group-hover:text-primary">
                        {inf.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                        <MapPin className="w-3 h-3 text-accent" />
                        {inf.city}
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px] font-bold">{formatFollowers(inf.followers_count)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {inf.platform_primary === 'instagram' ? <Instagram className="w-3.5 h-3.5 text-rose-400" /> : <Youtube className="w-3.5 h-3.5 text-red-500" />}
                        <span className="text-[11px] font-bold capitalize">{inf.platform_primary}</span>
                    </div>
                </div>

                {/* Dual Pricing / CTA Section */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Est. Price</p>
                        <p className="text-sm font-display font-bold text-text-primary">
                            {formatINR(inf.price_per_post)}
                            <span className="text-[10px] font-normal text-text-muted"> /post</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Eng. Rate</p>
                        <p className="text-sm font-display font-bold text-accent">
                            {inf.engagement_rate > 0 ? `${inf.engagement_rate}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
            </motion.div>
            </Link>
            );
            }
