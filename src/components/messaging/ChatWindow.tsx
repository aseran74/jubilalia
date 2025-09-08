import React, { useState, useRef, useEffect } from 'react';
import { UserConversation, ChatMessage, CreateChatMessage } from '../../types/supabase';
import { 
  PaperAirplaneIcon,
  UserCircleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface ChatWindowProps {
  conversation: UserConversation | null;
  messages: ChatMessage[];
  onSendMessage: (message: CreateChatMessage) => void;
  loading: boolean;
  error: string | null;
  currentUserId: string;
  isMobile?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  loading,
  error,
  currentUserId,
  isMobile = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conversation || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const messageData: CreateChatMessage = {
        receiver_id: conversation.other_user_id,
        content: newMessage.trim(),
        message_type: 'text'
      };

      await onSendMessage(messageData);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  console.log('ChatWindow - conversation:', conversation);
  
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Selecciona una conversación</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isMobile 
              ? 'Toca el botón de menú para ver tus conversaciones.'
              : 'Elige una conversación del panel izquierdo para comenzar a chatear.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header de la conversación - solo en desktop */}
      {!isMobile && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {conversation.other_user_avatar ? (
                <img
                  src={conversation.other_user_avatar}
                  alt={conversation.other_user_name || 'Usuario'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900">
                {conversation.other_user_name || 'Usuario sin nombre'}
              </h3>
              <p className="text-sm text-gray-500">
                {conversation.unread_count > 0 
                  ? `${conversation.unread_count} mensaje${conversation.unread_count === 1 ? '' : 's'} no leído${conversation.unread_count === 1 ? '' : 's'}`
                  : 'En línea'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${isMobile ? 'p-3' : 'p-4'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <ArrowPathIcon className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Cargando mensajes...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <p className="text-gray-500 text-sm">No se pudieron cargar los mensajes.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No hay mensajes aún.</p>
            <p className="text-xs text-gray-400">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${isMobile ? 'max-w-[85%]' : 'max-w-xs lg:max-w-md'} px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Contenido del mensaje */}
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Hora del mensaje */}
                  <div className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.created_at)}
                    {message.is_read && isOwnMessage && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Referencia para auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario para enviar mensajes */}
      <div className={`border-t border-gray-200 bg-gray-50 ${isMobile ? 'p-3' : 'p-4'}`}>
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${isMobile ? 'text-base' : ''}`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`${isMobile ? 'px-3 py-2' : 'px-4 py-2'} bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {sending ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
