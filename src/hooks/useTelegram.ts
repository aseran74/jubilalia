import { useState, useCallback } from 'react';

interface TelegramMessage {
  id: number;
  chatId: string;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  messageType: 'text' | 'photo' | 'document';
  hasPhoto: boolean;
  hasDocument: boolean;
}

interface TelegramGroupInfo {
  id: string;
  title: string;
  type: string;
  memberCount: number;
  description: string;
  inviteLink: string;
}

interface UseTelegramReturn {
  messages: TelegramMessage[];
  groupInfo: TelegramGroupInfo | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  fetchMessages: (groupId: string) => Promise<void>;
  fetchGroupInfo: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, message: string) => Promise<boolean>;
  linkGroup: (jubilaliaGroupId: string, telegramGroupId: string) => Promise<boolean>;
  unlinkGroup: (jubilaliaGroupId: string) => Promise<boolean>;
}

const TELEGRAM_API_URL = 'http://localhost:3001';

export const useTelegram = (): UseTelegramReturn => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [groupInfo, setGroupInfo] = useState<TelegramGroupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchMessages = useCallback(async (groupId: string) => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/api/telegram/messages/${groupId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
        setIsConnected(true);
      } else {
        setError(data.error || 'Error obteniendo mensajes');
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error fetching Telegram messages:', err);
      setError('No se pudo conectar con el servidor de Telegram');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupInfo = useCallback(async (groupId: string) => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/api/telegram/group/${groupId}`);
      const data = await response.json();

      if (data.success) {
        setGroupInfo(data.data);
        setIsConnected(true);
      } else {
        setError(data.error || 'Error obteniendo información del grupo');
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error fetching group info:', err);
      setError('No se pudo obtener información del grupo');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (groupId: string, message: string): Promise<boolean> => {
    if (!groupId || !message.trim()) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/api/telegram/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        // Refrescar mensajes después de enviar
        setTimeout(() => fetchMessages(groupId), 1000);
        return true;
      } else {
        setError(data.error || 'Error enviando mensaje');
        return false;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('No se pudo enviar el mensaje');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  const linkGroup = useCallback(async (jubilaliaGroupId: string, telegramGroupId: string): Promise<boolean> => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.rpc('link_group_to_telegram', {
        group_uuid: jubilaliaGroupId,
        telegram_group_id_param: telegramGroupId
      });

      if (error) {
        console.error('Error linking group:', error);
        setError('Error vinculando el grupo con Telegram');
        return false;
      }

      return data;
    } catch (err) {
      console.error('Error linking group:', err);
      setError('Error vinculando el grupo con Telegram');
      return false;
    }
  }, []);

  const unlinkGroup = useCallback(async (jubilaliaGroupId: string): Promise<boolean> => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.rpc('unlink_group_from_telegram', {
        group_uuid: jubilaliaGroupId
      });

      if (error) {
        console.error('Error unlinking group:', error);
        setError('Error desvinculando el grupo de Telegram');
        return false;
      }

      return data;
    } catch (err) {
      console.error('Error unlinking group:', err);
      setError('Error desvinculando el grupo de Telegram');
      return false;
    }
  }, []);

  return {
    messages,
    groupInfo,
    loading,
    error,
    isConnected,
    fetchMessages,
    fetchGroupInfo,
    sendMessage,
    linkGroup,
    unlinkGroup
  };
};
