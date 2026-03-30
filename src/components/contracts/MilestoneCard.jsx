import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Send, 
  Search, 
  MessageSquare 
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Helper to render status badges based on milestone status
 */
const StatusBadge = ({ status }) => {
  const configs = {
    'Pending': {
      bg: 'bg-zinc-800/50 border-zinc-700 text-zinc-400',
      icon: <Clock size={14} className="mr-1.5" />,
      label: 'Pending'
    },
    'Submitted': {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      icon: <Send size={14} className="mr-1.5" />,
      label: 'Submitted'
    },
    'In_Review': {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      icon: <Search size={14} className="mr-1.5" />,
      label: 'In Review'
    },
    'Approved': {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      icon: <CheckCircle size={14} className="mr-1.5" />,
      label: 'Approved'
    },
    'Revision_Requested': {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      icon: <AlertCircle size={14} className="mr-1.5" />,
      label: 'Revision Requested'
    }
  };

  const config = configs[status] || configs['Pending'];

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
      config.bg
    )}>
      {config.icon}
      {config.label}
    </div>
  );
};

const MilestoneCard = ({ milestone, role, onActionClick }) => {
  const { 
    milestone_name, 
    status, 
    submission_link, 
    submission_notes, 
    brand_feedback 
  } = milestone;

  // Determine if action button should be shown
  const showInfluencerAction = role === 'influencer' && (status === 'Pending' || status === 'Revision_Requested');
  const showBrandAction = role === 'brand' && (status === 'Submitted' || status === 'In_Review');

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-md p-5 shadow-xl transition-all hover:border-white/20"
    >
      {/* Background Glow Effect */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-white tracking-tight">
              {milestone_name}
            </h4>
            <StatusBadge status={status} />
          </div>
          
          {(showInfluencerAction || showBrandAction) && (
            <button
              onClick={() => onActionClick(milestone)}
              className="px-4 py-2 rounded-lg bg-primary/90 hover:bg-primary text-white text-sm font-medium transition-all transform active:scale-95 shadow-lg shadow-primary/20"
            >
              {role === 'influencer' ? 'Submit Work' : 'Review Work'}
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {/* Submission Details */}
          {submission_link && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Submission Link</label>
              <a 
                href={submission_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors w-fit group/link"
              >
                <span className="truncate max-w-[200px] sm:max-w-md">{submission_link}</span>
                <ExternalLink size={14} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              </a>
            </div>
          )}

          {submission_notes && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Influencer Notes</label>
              <p className="text-sm text-zinc-300 leading-relaxed italic">
                "{submission_notes}"
              </p>
            </div>
          )}

          {/* Brand Feedback Block */}
          {brand_feedback && (
            <div className="mt-4 p-4 rounded-lg bg-zinc-950/50 border-l-2 border-rose-500/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-400">
                <MessageSquare size={14} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Brand Feedback</span>
              </div>
              <blockquote className="text-sm text-zinc-400 leading-relaxed">
                {brand_feedback}
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MilestoneCard;
