import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { XCircle, Send, MessageCircle, User, Clock } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  listingId?: string;
  listingTitle?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  created_at: string;
  is_read: boolean;
  sender_name: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  listingId,
  listingTitle
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
    }
  }, [isOpen, user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener el perfil del usuario actual usando auth_user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile in fetchMessages:', profileError);
        return;
      }

      // Obtener mensajes entre los dos usuarios
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          message_text,
          created_at,
          is_read,
          profiles!messages_sender_id_fkey(full_name)
        `)
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transformar los datos para incluir el nombre del remitente
      const transformedMessages = messagesData?.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        message_text: msg.message_text,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender_name: msg.profiles?.[0]?.full_name || 'Usuario'
      })) || [];

      setMessages(transformedMessages);

      // Marcar mensajes como leídos
      if (transformedMessages.length > 0) {
        const unreadMessages = transformedMessages.filter(
          msg => msg.recipient_id === profile.id && !msg.is_read
        );
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg.id);
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', messageIds);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user || sending) return;

    try {
      setSending(true);
      
      // Obtener el perfil del usuario actual usando auth_user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Enviar el mensaje
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          recipient_id: recipientId,
          listing_id: listingId || null,
          subject: listingTitle ? `Consulta sobre: ${listingTitle}` : 'Consulta general',
          message_text: messageText.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      // Limpiar el campo de texto y recargar mensajes
      setMessageText('');
      await fetchMessages();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chat con {recipientName}
            </h3>
            {listingTitle && (
              <p className="text-sm text-gray-500">
                Sobre: {listingTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Inicia una conversación
              </h4>
              <p className="text-gray-500">
                Envía un mensaje para comenzar a chatear con {recipientName}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id !== recipientId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {!isOwnMessage && (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-xs opacity-75">
                        {isOwnMessage ? 'Tú' : message.sender_name}
                      </span>
                      <Clock className="w-3 h-3 opacity-75" />
                      <span className="text-xs opacity-75">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {message.message_text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input de mensaje */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!messageText.trim() || sending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
