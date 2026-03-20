import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Star, 
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STAGGER_ITEM, MICRO_INTERACTION } from '../../lib/motion';
import { cn } from '../../lib/utils';

const NotificationItem = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();
  const isSupportedLink = (link) => {
    if (!link || typeof link !== 'string') return false;
    return (
      link.startsWith('/brand/') ||
      link.startsWith('/influencer/') ||
      link.startsWith('/admin/') ||
      link === '/login' ||
      link === '/select-role' ||
      link === '/onboarding'
    );
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'proposal_received':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'proposal_update':
        return notification.title.includes('Accepted') 
          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />;
      case 'milestone_update':
        if (notification.title.includes('Approved')) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (notification.title.includes('Revision')) return <RefreshCw className="w-4 h-4 text-orange-500" />;
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'contract_completed':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'review_received':
        return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    if (isSupportedLink(notification.link)) {
      navigate(notification.link);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <motion.div
      variants={STAGGER_ITEM}
      {...MICRO_INTERACTION}
      className={cn(
        "group relative flex gap-4 p-4 transition-colors hover:bg-muted/50 border-b last:border-0",
        !notification.is_read && "bg-muted/30"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border shadow-sm group-hover:shadow-md transition-shadow">
          {getIcon()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h4 className={cn(
            "text-sm font-medium leading-none truncate",
            !notification.is_read ? "text-foreground font-semibold" : "text-muted-foreground"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {timeAgo(notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
          {notification.message}
        </p>
      </div>

      {!notification.is_read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </motion.div>
  );
};

export default NotificationItem;
