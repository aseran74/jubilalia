import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Notification {
  id: string;
  user_id: string;
  type: 'activity_nearby' | 'new_message' | 'group_post' | 'friend_request' | 'friend_accepted' | 'group_invitation';
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener notificaciones del usuario
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error fetching notifications:', fetchError);
        setError('Error al cargar notificaciones');
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', profile?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error in markAsRead:', err);
    }
  }, [profile?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
    }
  }, [profile?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', profile?.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error in deleteNotification:', err);
    }
  }, [profile?.id, notifications]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!profile?.id) return;

    fetchNotifications();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Notification change:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchNotifications]);

  const formatNotificationTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatNotificationTime
  };
};
