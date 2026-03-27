import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, Send, CheckCircle, AlertCircle, 
    ChevronDown, ChevronUp, Lock, ArrowRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MilestoneSubmitForm from './MilestoneSubmitForm';
import MilestoneReviewPanel from './MilestoneReviewPanel';

export default function MilestoneCard({ 
    milestone, 
    isBrand, 
    isLocked, 
    onSubmit, 
    onApprove, 
    onRevision 
}) {
    const [isExpanded, setIsExpanded] = useState(milestone.status === 'Submitted' || (milestone.status === 'Revision_Requested' && !isBrand));
    const [loading, setLoading] = useState(false);

    const statusConfig = {
        Pending: { color: 'text-text-muted', bg: 'bg-white/5', icon: Clock },
        Submitted: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Send },
        Approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
        Revision_Requested: { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
    };

    const config = statusConfig[milestone.status] || statusConfig.Pending;
    const Icon = config.icon;
    const isApproved = milestone.status === 'Approved';

    const handleAction = async (actionFn, ...args) => {
        setLoading(true);
        try {
            await actionFn(...args);
        } catch (err) {
            console.error('Milestone action failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn(
            "glass-card overflow-hidden transition-all duration-300",
            isLocked ? "opacity-40 grayscale" : "opacity-100",
            milestone.status === 'Approved' ? "border-emerald-500/20" : "border-white/5"
        )}>
            {/* Header */}
            <div 
                onClick={() => !isLocked && setIsExpanded(!isExpanded)}
                className={cn(
                    "p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors",
                    isLocked && "cursor-not-allowed"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-xl", config.bg)}>
                        {isLocked ? <Lock className="w-4 h-4 text-text-muted" /> : <Icon className={cn("w-4 h-4", config.color)} />}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {milestone.milestone_name}
                            {isApproved && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest", config.color)}>
                                {milestone.status.replace('_', ' ')}
                            </span>
                            {isLocked && (
                                <span className="text-[8px] text-text-muted uppercase font-medium">Locked until previous approved</span>
                            )}
                        </div>
                    </div>
                </div>

                {!isLocked && (
                    <div className="flex items-center gap-3">
                        {isBrand && milestone.status === 'Submitted' && (
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <AnimatePresence>
                {isExpanded && !isLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                    >
                        <div className="p-4 space-y-4">
                            {/* Revision Note (Always show if present) */}
                            {milestone.brand_feedback && (
                                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Brand Feedback</span>
                                    </div>
                                    <p className="text-xs text-text-secondary italic">"{milestone.brand_feedback}"</p>
                                </div>
                            )}

                            {/* Influencer Submission View */}
                            {!isBrand && (milestone.status === 'Pending' || milestone.status === 'Revision_Requested') && (
                                <MilestoneSubmitForm 
                                    loading={loading}
                                    onSubmit={(data) => handleAction(onSubmit, milestone.id, data)}
                                />
                            )}

                            {/* Brand Review View */}
                            {isBrand && milestone.status === 'Submitted' && (
                                <MilestoneReviewPanel 
                                    milestone={milestone}
                                    loading={loading}
                                    onApprove={() => handleAction(onApprove, milestone.id)}
                                    onRevision={(feedback) => handleAction(onRevision, milestone.id, feedback)}
                                />
                            )}

                            {/* Post-submission Details (Influencer viewing submitted or anyone viewing approved) */}
                            {((!isBrand && milestone.status === 'Submitted') || milestone.status === 'Approved') && (
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Submitted Asset</span>
                                        <a 
                                            href={milestone.submission_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            View Work <ArrowRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                    {milestone.submission_notes && (
                                        <p className="text-xs text-text-secondary italic">"{milestone.submission_notes}"</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
