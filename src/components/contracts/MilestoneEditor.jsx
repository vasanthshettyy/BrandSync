import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, ListChecks, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MilestoneEditor({ 
    contractId, 
    existingMilestones, 
    onAdd, 
    onUpdate, 
    onDelete, 
    onClose 
}) {
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState(
        existingMilestones.length > 0 
        ? [...existingMilestones].sort((a, b) => a.sort_order - b.sort_order)
        : []
    );

    const handleAdd = () => {
        if (milestones.length >= 6) return;
        const newOrder = milestones.length + 1;
        setMilestones([...milestones, { id: 'temp-' + Date.now(), milestone_name: '', sort_order: newOrder, isNew: true }]);
    };

    const handleRemove = async (idx) => {
        const m = milestones[idx];
        if (!m.isNew) {
            setLoading(true);
            await onDelete(m.id);
            setLoading(false);
        }
        setMilestones(milestones.filter((_, i) => i !== idx).map((item, i) => ({ ...item, sort_order: i + 1 })));
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            for (const m of milestones) {
                if (m.isNew) {
                    if (m.milestone_name.trim()) {
                        await onAdd(contractId, { name: m.milestone_name, order: m.sort_order });
                    }
                } else {
                    const original = existingMilestones.find(ex => ex.id === m.id);
                    if (original && (original.milestone_name !== m.milestone_name || original.sort_order !== m.sort_order)) {
                        await onUpdate(m.id, { name: m.milestone_name, order: m.sort_order });
                    }
                }
            }
            onClose();
        } catch (err) {
            console.error('Failed to save milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    const suggestDefault = () => {
        const defaults = [
            { id: 'd1', milestone_name: 'Script', sort_order: 1, isNew: true },
            { id: 'd2', milestone_name: 'Draft', sort_order: 2, isNew: true },
            { id: 'd3', milestone_name: 'Final', sort_order: 3, isNew: true }
        ];
        setMilestones(defaults);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 rounded-3xl bg-surface-900/50 border border-white/10 space-y-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ListChecks className="text-primary w-5 h-5" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Manage Workflow</h3>
                </div>
                <div className="flex items-center gap-2">
                    {milestones.length === 0 && (
                        <button 
                            onClick={suggestDefault}
                            className="text-[10px] font-bold text-primary hover:text-indigo-300 transition-colors uppercase tracking-widest px-3 py-1 rounded-lg border border-primary/20 bg-primary/5"
                        >
                            Suggest Standard
                        </button>
                    )}
                    <button 
                        onClick={onAdd ? handleAdd : null}
                        disabled={milestones.length >= 6}
                        className="p-1.5 rounded-lg bg-white/5 text-text-muted hover:text-white transition-all disabled:opacity-20"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {milestones.map((m, idx) => (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                                {idx + 1}
                            </div>
                            <input 
                                type="text" 
                                value={m.milestone_name}
                                onChange={e => {
                                    const newMs = [...milestones];
                                    newMs[idx].milestone_name = e.target.value;
                                    setMilestones(newMs);
                                }}
                                disabled={!m.isNew && m.status !== 'Pending'}
                                placeholder="e.g. Script Review"
                                className="flex-1 px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-xs outline-none focus:border-primary transition-all disabled:opacity-50"
                            />
                            <button 
                                onClick={() => handleRemove(idx)}
                                disabled={!m.isNew && m.status !== 'Pending'}
                                className="p-2 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-0"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {milestones.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">No milestones defined</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button 
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveAll}
                    disabled={loading || milestones.some(m => !m.milestone_name.trim())}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-brand text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Workflow
                </button>
            </div>
        </motion.div>
    );
}
