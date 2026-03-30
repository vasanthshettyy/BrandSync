import React, { useState } from 'react';
import { 
  Check, 
  RotateCcw, 
  X, 
  AlertCircle, 
  Loader2,
  MessageSquareQuote
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MilestoneReviewPanel = ({ 
  milestone, 
  onApprove, 
  onRequestRevision, 
  onCancel 
}) => {
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await onApprove();
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to approve milestone.');
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    setError(null);
    
    if (!feedback.trim()) {
      setError('Please provide feedback explaining what needs to be revised.');
      return;
    }

    setIsProcessing(true);
    try {
      await onRequestRevision(feedback);
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to request revision.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MessageSquareQuote size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Reviewing Milestone</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Current: <span className="text-zinc-200 font-medium">{milestone.milestone_name}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
          disabled={isProcessing}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Context */}
        <div className="p-4 rounded-lg bg-zinc-950/50 border border-white/5">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Review the submitted work. You can either approve this step to unlock the next one, or request changes if the requirements aren't met.
          </p>
        </div>

        {/* Feedback Area */}
        <div className="space-y-2">
          <label htmlFor="feedback" className="block text-sm font-medium text-zinc-300">
            Brand Feedback
          </label>
          <textarea
            id="feedback"
            rows={4}
            disabled={isProcessing}
            placeholder="Add comments or specific revision instructions here..."
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 outline-none transition-all resize-none",
              "focus:ring-2 focus:ring-primary/50 focus:border-primary",
              error && "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-rose-400 font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={handleRequestRevision}
            disabled={isProcessing}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-lg shadow-rose-900/20 transform active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RotateCcw size={18} />
            )}
            Request Revision
          </button>

          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-900/20 transform active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Approve Step
          </button>
        </div>

        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          Cancel Review
        </button>
      </div>
    </div>
  );
};

export default MilestoneReviewPanel;
