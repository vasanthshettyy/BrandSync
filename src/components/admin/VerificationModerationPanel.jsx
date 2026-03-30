import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  User, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * VerificationModerationPanel
 * Component for Admins to review pending influencer verification proofs.
 */
const VerificationModerationPanel = ({ pendingProofs = [], onReview }) => {
  const [processingId, setProcessingId] = useState(null);
  const [rejectionId, setRejectionId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState(null);

  const handleApprove = async (proofId) => {
    setProcessingId(proofId);
    setError(null);
    try {
      await onReview(proofId, 'Approved', null);
    } catch (err) {
      setError(err.message || 'Failed to approve submission.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proofId) => {
    if (!adminNotes.trim()) {
      setError('A reason for rejection is required to help the influencer fix their submission.');
      return;
    }
    
    setProcessingId(proofId);
    setError(null);
    try {
      await onReview(proofId, 'Rejected', adminNotes);
      setRejectionId(null);
      setAdminNotes('');
    } catch (err) {
      setError(err.message || 'Failed to reject submission.');
    } finally {
      setProcessingId(null);
    }
  };

  // Empty State
  if (pendingProofs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl text-center space-y-4">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">All Caught Up!</h3>
          <p className="text-sm text-zinc-500">No pending verification proofs to review at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {pendingProofs.map((proof) => (
        <div 
          key={proof.id} 
          className="group flex flex-col bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all hover:border-white/20"
        >
          {/* Header Card Section */}
          <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400">
                <User size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight">
                  {proof.profiles_influencer?.full_name || 'Unnamed Influencer'}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                    proof.platform === 'instagram' ? "bg-primary/20 text-primary" : "bg-rose-500/20 text-rose-500"
                  )}>
                    {proof.platform}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-bold">•</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Analytics Proof</span>
                </div>
              </div>
            </div>
            
            <a 
              href={proof.proof_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-primary hover:text-white transition-all bg-primary/10 hover:bg-primary px-3 py-2 rounded-lg border border-primary/20"
            >
              <ExternalLink size={14} />
              VIEW PROOF
            </a>
          </div>

          {/* Action and Context Section */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <Clock size={14} />
                Submitted {new Date(proof.submitted_at).toLocaleDateString()}
              </div>
              <div className="text-[10px] text-zinc-600 font-mono">
                ID: {proof.id.split('-')[0]}
              </div>
            </div>

            {rejectionId === proof.id ? (
              /* Rejection Feedback Flow */
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Reason for Rejection</span>
                </div>
                <textarea
                  className="w-full bg-zinc-950 border border-rose-500/30 rounded-xl p-3 text-sm text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                  rows={3}
                  placeholder="e.g., Screenshot is missing follower count, blurry, or incorrect platform..."
                  value={adminNotes}
                  onChange={(e) => {
                    setAdminNotes(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(proof.id)}
                    disabled={processingId === proof.id}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                  >
                    {processingId === proof.id ? <Loader2 size={14} className="animate-spin" /> : 'CONFIRM REJECTION'}
                  </button>
                  <button
                    onClick={() => {
                      setRejectionId(null);
                      setAdminNotes('');
                      setError(null);
                    }}
                    className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold py-2.5 rounded-lg transition-all"
                  >
                    CANCEL
                  </button>
                </div>
                {error && <p className="text-[10px] text-rose-500 font-bold italic">{error}</p>}
              </div>
            ) : (
              /* Main Action Buttons */
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(proof.id)}
                  disabled={processingId === proof.id}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {processingId === proof.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  APPROVE
                </button>
                <button
                  onClick={() => setRejectionId(proof.id)}
                  disabled={processingId === proof.id}
                  className="flex-1 bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white text-xs font-bold py-3 rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <XCircle size={16} />
                  REJECT
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerificationModerationPanel;
