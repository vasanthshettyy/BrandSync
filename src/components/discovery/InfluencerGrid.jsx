import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';
import InfluencerCard from './InfluencerCard';

export default function InfluencerGrid({ influencers, loading, onCardClick }) {
    if (loading) {
        return (
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
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
                            <div className="pt-4 flex justify-between">
                                <div className="h-8 bg-white/10 rounded w-1/3" />
                                <div className="h-8 bg-white/10 rounded w-1/3" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    if (influencers.length === 0) {
        return (
            <div className="glass-card p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Search className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">No influencers found</h3>
                <p className="text-text-secondary">Try adjusting your filters or search term to see more creators.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
        >
            {influencers.map(inf => (
                <InfluencerCard 
                    key={inf.user_id} 
                    inf={inf} 
                    onClick={onCardClick}
                />
            ))}
        </motion.div>
    );
}
