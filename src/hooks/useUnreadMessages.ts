import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useUnreadMessages = () => {
  const { user, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !profile) return;

    // Obtener mensajes no leídos inicialmente
    fetchUnreadCount();

    // Suscribirse a cambios en la tabla de mensajes
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${profile.id}`
        },
        () => {
          // Recargar el contador cuando hay cambios
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return;
      }

      // Actualizar el contador localmente
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('receiver_id', profile?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all messages as read:', error);
        return;
      }

      setUnreadCount(0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshCount: fetchUnreadCount
  };
};
