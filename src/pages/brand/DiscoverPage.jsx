import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDiscovery } from '../../hooks/useDiscovery';
import { MICRO_INTERACTION } from '../../lib/motion';
import PageWrapper from '../../components/layout/PageWrapper';

// Modular Components
import SearchFilters from '../../components/discovery/SearchFilters';
import InfluencerGrid from '../../components/discovery/InfluencerGrid';
import InfluencerDetailModal from '../../components/discovery/InfluencerDetailModal';

export default function DiscoverPage() {
    const { 
        influencers, 
        loading, 
        totalCount, 
        totalPages, 
        filters, 
        updateFilter, 
        resetFilters, 
        setPage 
    } = useDiscovery();

    const [showFilters, setShowFilters] = useState(false);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (influencer) => {
        setSelectedInfluencer(influencer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // Delay clearing influencer to allow exit animation
        setTimeout(() => setSelectedInfluencer(null), 300);
    };

    return (
        <PageWrapper 
            title="Discover Influencers" 
            subtitle={`${totalCount} creators found matching your criteria`}
        >
            {/* Search and Filters Section */}
            <SearchFilters 
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
            />

            {/* Results Grid Section */}
            <InfluencerGrid 
                influencers={influencers}
                loading={loading}
                onCardClick={handleCardClick}
            />

            {/* Pagination Section */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-16 pb-8">
                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPage(filters.page - 1)} 
                        disabled={filters.page <= 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm font-bold cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </motion.button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Page</span>
                        <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                            {filters.page}
                        </div>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">of {totalPages}</span>
                    </div>

                    <motion.button
                        {...MICRO_INTERACTION}
                        onClick={() => setPage(filters.page + 1)} 
                        disabled={filters.page >= totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm font-bold cursor-pointer"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            )}

            {/* Quick-View Modal */}
            <InfluencerDetailModal 
                influencer={selectedInfluencer}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </PageWrapper>
    );
}
