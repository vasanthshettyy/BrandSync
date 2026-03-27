import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, ExternalLink, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MilestoneReviewPanel({ milestone, onApprove, onRevision, loading }) {
    const [feedback, setFeedback] = useState('');
    const [showRevisionForm, setShowRevisionForm] = useState(false);

    const handleRevision = async () => {
        if (feedback.trim().length < 10) return;
        await onRevision(feedback);
        setShowRevisionForm(false);
        setFeedback('');
    };

    return (
        <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10">
            {/* Header: Deliverable Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Submitted Work</h4>
                    <span className="text-[8px] text-text-muted/60 uppercase font-medium">
                        {new Date(milestone.submitted_at).toLocaleDateString()}
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-text-primary font-medium">Asset Link</span>
                        <a 
                            href={milestone.submission_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                        >
                            Open File
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    {milestone.submission_notes && (
                        <div className="space-y-1 pt-2 border-t border-white/5">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Influencer Notes</span>
                            <p className="text-xs text-text-secondary leading-relaxed italic">"{milestone.submission_notes}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                {!showRevisionForm ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowRevisionForm(true)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Request Revision
                        </button>
                        <button 
                            onClick={onApprove}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {loading ? 'Approving...' : 'Approve Work'}
                        </button>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Revision Feedback (min 10 chars)</label>
                            <textarea 
                                required
                                minLength={10}
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="Describe the changes you'd like to see..."
                                rows={4}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-xs outline-none focus:border-rose-500 transition-colors resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setShowRevisionForm(false)}
                                className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRevision}
                                disabled={loading || feedback.trim().length < 10}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                                Send Feedback
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
