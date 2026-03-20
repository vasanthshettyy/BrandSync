import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => {
            // Guard against duplicate insert events/resubscribe edge-cases
            if (prev.some((n) => n.id === payload.new.id)) return prev;
            const next = [payload.new, ...prev];
            setUnreadCount(next.filter((n) => !n.is_read).length);
            return next;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => {
            const next = prev.map((n) => (n.id === payload.new.id ? payload.new : n));
            setUnreadCount(next.filter((n) => !n.is_read).length);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!user?.id) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    const wasUnread = previousNotifications.find((n) => n.id === notificationId && !n.is_read);
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.is_read).length);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};
