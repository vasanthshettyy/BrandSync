import React, { useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationItem from './NotificationItem';
import EmptyNotifications from './EmptyNotifications';
import { STAGGER_CONTAINER, PAGE_SLIDE_FADE } from '../../lib/motion';

const NotificationDropdown = ({ isOpen, onClose, notifications, loading, onMarkRead, onMarkAllRead }) => {
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();

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
        className={`absolute right-0 top-full mt-4 w-80 md:w-96 max-h-[500px] flex flex-col backdrop-blur-2xl border rounded-3xl shadow-2xl z-[200] overflow-hidden border-white/10 ${
          isDark ? 'bg-black/80' : 'bg-white/90'
        }`}
      >
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
        }`}>
          <h3 className="font-display font-bold text-lg tracking-tight">Notifications</h3>
          <div className="flex gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={onMarkAllRead}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90 ${
                  isDark ? 'hover:bg-white/10 text-text-muted hover:text-white' : 'hover:bg-black/5 text-text-dark-muted hover:text-black'
                }`}
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90 ${
              isDark ? 'hover:bg-white/10 text-text-muted hover:text-white' : 'hover:bg-black/5 text-text-dark-muted hover:text-black'
            }`}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {loading && notifications.length === 0 ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1"
            >
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyNotifications />
          )}
        </div>

        {notifications.length > 0 && (
          <div className={`p-3 border-t text-center ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
          }`}>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:brightness-110 transition-all">
              View all activity
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;
