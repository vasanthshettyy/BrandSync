import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Settings, BellOff } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import EmptyNotifications from './EmptyNotifications';
import { STAGGER_CONTAINER, PAGE_SLIDE_FADE } from '../../lib/motion';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        {...PAGE_SLIDE_FADE}
        className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[500px] flex flex-col bg-background border rounded-xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b bg-muted/20">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-primary tooltip"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button className="p-1.5 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-primary">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading && notifications.length === 0 ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="show"
            >
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyNotifications />
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t text-center bg-muted/10">
            <button className="text-xs font-medium text-primary hover:underline">
              View all activity
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;
