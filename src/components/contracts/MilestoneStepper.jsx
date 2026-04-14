import { motion } from 'framer-motion';
import { Check, Clock, Send, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MilestoneStepper({ milestones }) {
    // Sort milestones by order
    const sortedMilestones = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

    const getStatusIndex = (status) => {
        if (status === 'Approved') return 2;
        if (status === 'Submitted' || status === 'In_Review') return 1;
        return 0;
    };

    return (
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
            <div className="relative flex items-center justify-between min-w-[500px] md:min-w-full px-4 py-8">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
                
                {/* Progress Line */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                        width: `${(sortedMilestones.filter(m => m.status === 'Approved').length / (Math.max(1, sortedMilestones.length - 1))) * 100}%` 
                    }}
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500 -translate-y-1/2 z-0"
                />

                {sortedMilestones.map((m, idx) => {
                    const isApproved = m.status === 'Approved';
                    const isCurrent = !isApproved && (idx === 0 || sortedMilestones[idx - 1].status === 'Approved');
                    const isSubmitted = m.status === 'Submitted';
                    const isRevision = m.status === 'Revision_Requested';

                    return (
                        <div key={m.id} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    backgroundColor: isApproved ? '#10b981' : isSubmitted ? '#6366f1' : isRevision ? '#ef4444' : '#1e1e2e',
                                    borderColor: isCurrent ? '#6366f1' : 'rgba(255,255,255,0.1)'
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors duration-500",
                                    isCurrent && "shadow-indigo-500/20"
                                )}
                            >
                                {isApproved ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : isSubmitted ? (
                                    <Send className="w-5 h-5 text-white animate-pulse" />
                                ) : isRevision ? (
                                    <AlertCircle className="w-5 h-5 text-white" />
                                ) : (
                                    <span className="text-xs font-bold text-white/40">{idx + 1}</span>
                                )}
                            </motion.div>
                            <div className="absolute top-12 whitespace-nowrap text-center">
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    isApproved ? "text-emerald-400" : isCurrent ? "text-indigo-400" : "text-text-muted"
                                )}>
                                    {m.milestone_name}
                                </p>
                                <p className="text-[8px] text-text-muted/60 font-medium uppercase mt-0.5">
                                    {m.status.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
