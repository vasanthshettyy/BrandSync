import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Instagram, 
  Youtube, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * VerificationStatus Component
 * Displays the current status of platform verification proofs.
 */
const VerificationStatus = ({ proofs = [] }) => {
  // Empty State: Prompt to upload
  if (proofs.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-zinc-900 border border-white/10 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-medium">Not Verified</h4>
          <p className="text-sm text-zinc-500 max-w-[280px] mx-auto">
            You are not verified. Upload analytics proof to get the verified badge and increase your visibility.
          </p>
        </div>
      </div>
    );
  }

  // Helper to get status-specific styles and icons
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: <ShieldCheck size={14} className="mr-1.5" />,
          label: 'Verified'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: <XCircle size={14} className="mr-1.5" />,
          label: 'Rejected'
        };
      case 'Pending':
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          icon: <Clock size={14} className="mr-1.5" />,
          label: 'In Review'
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Verification Status
        </h3>
        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded">
          {proofs.length} SUBMISSION{proofs.length !== 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid gap-3">
        {proofs.map((proof, index) => {
          const config = getStatusConfig(proof.status);
          const isInstagram = proof.platform?.toLowerCase() === 'instagram';

          return (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition-all hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-zinc-950 border border-white/5 shadow-inner",
                    isInstagram ? "text-primary" : "text-rose-500"
                  )}>
                    {isInstagram ? <Instagram size={20} /> : <Youtube size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white capitalize">
                      {proof.platform} Reach
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">Submitted for Manual Review</p>
                  </div>
                </div>

                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                  config.bg
                )}>
                  {config.icon}
                  {config.label.toUpperCase()}
                </div>
              </div>

              {/* Admin Feedback Box */}
              {proof.status === 'Rejected' && proof.admin_notes && (
                <div className="mt-4 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 flex gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">Admin Feedback</span>
                    <p className="text-xs text-rose-200/70 leading-relaxed italic">
                      "{proof.admin_notes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Success Badge Highlight */}
              {proof.status === 'Approved' && (
                <div className="absolute -right-6 -bottom-6 p-8 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerificationStatus;
