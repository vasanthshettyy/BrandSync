import { useState } from 'react';
import { motion } from 'framer-motion';
import MilestoneStepper from './MilestoneStepper';
import MilestoneCard from './MilestoneCard';
import MilestoneEditor from './MilestoneEditor';
import { Settings2 } from 'lucide-react';

export default function MilestoneWorkflow({ 
    contractId,
    milestones, 
    isBrand, 
    onSubmit, 
    onApprove, 
    onRevision,
    onAddMilestone,
    onUpdateMilestone,
    onDeleteMilestone
}) {
    const [isEditing, setIsEditing] = useState(false);
    // 1. Sort milestones by sequence (sort_order: 1=Script, 2=Draft, 3=Final)
    const sortedMilestones = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                    Campaign Workflow
                </h4>
                {isBrand && !isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-indigo-300 transition-colors uppercase tracking-widest"
                    >
                        <Settings2 size={12} />
                        Manage Workflow
                    </button>
                )}
            </div>

            {isEditing ? (
                <MilestoneEditor 
                    contractId={contractId}
                    existingMilestones={sortedMilestones}
                    onAdd={onAddMilestone}
                    onUpdate={onUpdateMilestone}
                    onDelete={onDeleteMilestone}
                    onClose={() => setIsEditing(false)}
                />
            ) : (
                <>
                    {/* Visual Progress Stepper */}
                    <div className="glass-card bg-white/[0.02] border-white/5 p-2 rounded-3xl">
                        <MilestoneStepper milestones={sortedMilestones} />
                    </div>

                    {/* Detailed Milestone Cards */}
                    <div className="space-y-3">
                        {sortedMilestones.map((m, idx) => {
                            // 2. Sequential Lock Logic: 
                            // Milestone N is locked if N-1 is NOT 'Approved'
                            const isFirst = idx === 0;
                            const prevApproved = isFirst || sortedMilestones[idx - 1].status === 'Approved';
                            const isLocked = !prevApproved;

                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <MilestoneCard 
                                        milestone={m}
                                        isBrand={isBrand}
                                        isLocked={isLocked}
                                        onSubmit={onSubmit}
                                        onApprove={onApprove}
                                        onRevision={onRevision}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
