import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { MICRO_INTERACTION, PREMIUM_SPRING } from '../../lib/motion';

export default function ProposalActions({ proposal, onAccept, onReject, loading }) {
    const [confirming, setConfirming] = useState(null); // 'accept' or 'reject'

    const handleAction = async (type) => {
        if (type === 'accept') {
            await onAccept(proposal.id);
        } else {
            await onReject(proposal.id);
        }
        setConfirming(null);
    };

    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <motion.button
                {...MICRO_INTERACTION}
                onClick={() => setConfirming('reject')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all disabled:opacity-50"
            >
                <XCircle size={14} />
                Reject
            </motion.button>
            <motion.button
                {...MICRO_INTERACTION}
                onClick={() => setConfirming('accept')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
                <CheckCircle size={14} />
                Accept
            </motion.button>

            {/* Confirmation Overlay */}
            <AnimatePresence>
                {confirming && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-md glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${confirming === 'accept' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-2xl ${confirming === 'accept' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {confirming === 'accept' ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white">
                                        {confirming === 'accept' ? 'Accept Proposal?' : 'Reject Proposal?'}
                                    </h3>
                                    <p className="text-sm text-text-muted">Are you sure you want to proceed?</p>
                                </div>
                            </div>

                            {confirming === 'accept' && (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        <span className="font-bold text-emerald-400">Important:</span> Accepting this proposal will automatically <span className="text-white font-bold">reject all other applicants</span> and <span className="text-white font-bold">close the gig</span>. A contract will be generated immediately.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirming(null)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-text-primary hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(confirming)}
                                    disabled={loading}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                                        confirming === 'accept' 
                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                                        : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                    }`}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Confirm {confirming === 'accept' ? 'Acceptance' : 'Rejection'}
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
