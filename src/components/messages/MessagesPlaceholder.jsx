import { motion } from 'framer-motion';
import { MessageSquare, Circle } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import { MICRO_INTERACTION, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

const MOCK_THREADS = [
    { id: 1, name: 'GlowSkin Labs', snippet: 'Loved your last draft. Can we adjust the CTA placement?', time: '2m ago' },
    { id: 2, name: 'UrbanBrew', snippet: 'Campaign brief shared. Confirm once you review it.', time: '12m ago' },
    { id: 3, name: 'NovaFit', snippet: 'Milestone approved. Ready for final submission.', time: '39m ago' },
    { id: 4, name: 'PixelNest', snippet: 'Let us align on deliverables before kickoff.', time: '1h ago' },
];

export default function MessagesPlaceholder() {
    return (
        <PageWrapper title="Messages" subtitle="Conversation threads with brands and creators.">
            <motion.div
                className="space-y-3"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                {MOCK_THREADS.map((thread) => (
                    <motion.button
                        key={thread.id}
                        variants={STAGGER_ITEM}
                        {...MICRO_INTERACTION}
                        className="w-full text-left glass-card p-4 border border-white/10 hover:border-primary/40"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="font-semibold text-sm text-text-primary truncate">{thread.name}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-text-muted">{thread.time}</p>
                                </div>
                                <p className="text-xs text-text-secondary line-clamp-1">{thread.snippet}</p>
                            </div>
                            <Circle className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 mt-1" />
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </PageWrapper>
    );
}
