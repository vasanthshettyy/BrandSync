import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BadgeCheck } from 'lucide-react';
import { MICRO_INTERACTION } from '../../lib/motion';
import { NICHES, INDIAN_CITIES, LANGUAGES, PLATFORMS, FOLLOWER_TIERS } from '../../lib/constants';

export default function SearchFilters({ 
    filters, 
    updateFilter, 
    resetFilters, 
    showFilters, 
    setShowFilters 
}) {
    return (
        <div className="space-y-6 mb-8">
            {/* Search + Filter Toggle */}
            <div className="flex items-center gap-3">
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
            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="filter-bar bg-white/5 p-6 rounded-2xl border border-white/10"
                    >
                        <div className="flex w-full items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Advanced Filters</h3>
                            </div>
                            <button onClick={resetFilters} className="min-h-[44px] px-2 flex items-center justify-center text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer">
                                Reset All
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 w-full">
                            {/* Niche */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Niche</label>
                                <select 
                                    className="w-full bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary"
                                    value={filters.niche} 
                                    onChange={e => updateFilter('niche', e.target.value)}
                                >
                                    <option value="">All Niches</option>
                                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>

                            {/* City */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">City</label>
                                <select 
                                    className="w-full bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary"
                                    value={filters.city} 
                                    onChange={e => updateFilter('city', e.target.value)}
                                >
                                    <option value="">All Cities</option>
                                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Language */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Language</label>
                                <select 
                                    className="w-full bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary"
                                    value={filters.language} 
                                    onChange={e => updateFilter('language', e.target.value)}
                                >
                                    <option value="">All Languages</option>
                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* Platform */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Platform</label>
                                <select 
                                    className="w-full bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary"
                                    value={filters.platform} 
                                    onChange={e => updateFilter('platform', e.target.value)}
                                >
                                    <option value="">All Platforms</option>
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* Followers */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Followers</label>
                                <select 
                                    className="w-full bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary"
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

                            {/* Verified Toggle */}
                            <div className="filter-group">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Verification</label>
                                <button
                                    onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                                    className={`flex items-center justify-between w-full min-h-[44px] px-3 rounded-lg border text-xs font-medium transition-all ${
                                        filters.verifiedOnly 
                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                        : 'bg-white/5 border-border-dark text-text-muted hover:border-white/20'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <BadgeCheck className={`w-3.5 h-3.5 ${filters.verifiedOnly ? 'text-blue-400' : 'text-text-muted'}`} />
                                        Verified Only
                                    </span>
                                    <div className={`w-6 h-3 rounded-full relative transition-colors ${filters.verifiedOnly ? 'bg-blue-500' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${filters.verifiedOnly ? 'right-0.5' : 'left-0.5'}`} />
                                    </div>
                                </button>
                            </div>

                            {/* Budget Range */}
                            <div className="filter-group sm:col-span-2 lg:col-span-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Budget Range (₹)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice || ''}
                                        onChange={e => updateFilter('minPrice', Number(e.target.value))}
                                        className="w-full min-w-0 bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary placeholder:text-text-muted/30"
                                    />
                                    <span className="text-text-muted shrink-0 font-bold text-xs">to</span>
                                    <input 
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice || ''}
                                        onChange={e => updateFilter('maxPrice', Number(e.target.value))}
                                        className="w-full min-w-0 bg-white/5 border border-border-dark rounded-lg min-h-[44px] px-3 text-xs outline-none focus:border-primary placeholder:text-text-muted/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
