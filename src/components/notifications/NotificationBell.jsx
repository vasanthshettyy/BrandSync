import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { MICRO_INTERACTION } from '../../lib/motion';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { isDark } = useTheme();

  return (
    <div className="relative z-[130]">
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.08, rotate: -3 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer group ${
          isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-text-secondary transition-all duration-300 group-hover:scale-110 group-hover:brightness-110" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.6)]"
            />
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown
            onClose={() => setIsOpen(false)}
            notifications={notifications}
            loading={loading}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllAsRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
