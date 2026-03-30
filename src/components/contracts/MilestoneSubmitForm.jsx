import React, { useState } from 'react';
import { Loader2, Link as LinkIcon, AlignLeft, Send, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const MilestoneSubmitForm = ({ milestoneId, onSubmit, onCancel }) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ 
        submission_link: submissionLink, 
        submission_notes: submissionNotes 
      });
      
      // Reset form and close
      setSubmissionLink('');
      setSubmissionNotes('');
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to submit milestone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/5">
        <div>
          <h3 className="text-lg font-semibold text-white">Submit Milestone Work</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Provide the required links and context for the brand's review.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Submission Link */}
        <div className="space-y-2">
          <label htmlFor="link" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <LinkIcon size={16} className="text-primary" />
            Submission Link <span className="text-rose-500">*</span>
          </label>
          <input
            id="link"
            type="url"
            required
            disabled={isSubmitting}
            placeholder="e.g., Google Drive or unlisted YouTube link"
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 outline-none transition-all",
              "focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Submission Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <AlignLeft size={16} className="text-primary" />
            Context / Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            disabled={isSubmitting}
            placeholder="Optional context, instructions, or specific details for the brand..."
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 outline-none transition-all resize-none",
              "focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !submissionLink}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/20 transform active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Work
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MilestoneSubmitForm;
