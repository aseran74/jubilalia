import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeftIcon,
  UserIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

const ChatModal: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation();
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles!conversations_user1_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          profiles!conversations_user2_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Determinar cuál es el otro usuario
      const isUser1 = data.user1_id === user?.id;
      const otherUser = isUser1 ? data.profiles : data.profiles;

      setConversation({
        id: data.id,
        user1_id: data.user1_id,
        user2_id: data.user2_id,
        other_user: {
          id: otherUser.id,
          full_name: otherUser.full_name || 'Usuario',
          avatar_url: otherUser.avatar_url
        }
      });
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      setError(error.message || 'Error al cargar la conversación');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedMessages = data?.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
        sender: {
          id: msg.profiles.id,
          full_name: msg.profiles.full_name || 'Usuario',
          avatar_url: msg.profiles.avatar_url
        }
      })) || [];

      setMessages(processedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Obtener información del remitente
          fetchMessageSender(newMessage);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchMessageSender = async (message: Message) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', message.sender_id)
        .single();

      if (!error && data) {
        const processedMessage: Message = {
          ...message,
          sender: {
            id: data.id,
            full_name: data.full_name || 'Usuario',
            avatar_url: data.avatar_url
          }
        };

        setMessages(prev => [...prev, processedMessage]);
      }
    } catch (error) {
      console.error('Error fetching message sender:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversationId) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar last_message_at de la conversación
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Conversación no encontrada'}
          </div>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Mensajes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* Header del chat */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {conversation.other_user.avatar_url ? (
                <img
                  src={conversation.other_user.avatar_url}
                  alt={conversation.other_user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {conversation.other_user.full_name}
              </h2>
            </div>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No hay mensajes aún. ¡Comienza la conversación!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {message.sender.avatar_url ? (
                            <img
                              src={message.sender.avatar_url}
                              alt={message.sender.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {message.sender.full_name}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de mensaje */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
