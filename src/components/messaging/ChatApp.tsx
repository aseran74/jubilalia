import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChatMessage, UserConversation, CreateChatMessage } from '../../types/supabase';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { 
  UserCircleIcon
} from '@heroicons/react/24/outline';

const ChatApp: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: mostrar estado de autenticación
  console.log('ChatApp - Estado de autenticación:', { user, profile, loading });

  // Cargar conversaciones del usuario
  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id]);

  // Manejar nueva conversación desde la búsqueda de usuarios
  useEffect(() => {
    if (location.state?.startNewChat && profile?.id) {
      const { otherUserId, otherUserName } = location.state;
      startNewConversation(otherUserId, otherUserName);
      // Limpiar el estado de navegación
      window.history.replaceState({}, document.title);
    }
  }, [location.state, profile?.id]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation && profile?.id) {
      loadMessages(selectedConversation.other_user_id);
    }
  }, [selectedConversation, profile?.id]);

  const loadConversations = async () => {
    try {
      setLoadingMessages(true);
      setError(null);

      // Llamar a la función RPC para obtener conversaciones
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id: profile!.id
      });

      if (error) throw error;

      setConversations(data || []);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Error al cargar conversaciones');
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!profile?.id) return;

    try {
      setLoadingMessages(true);
      setError(null);

      // Llamar a la función RPC para obtener mensajes
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        user1_id: profile.id,
        user2_id: otherUserId,
        limit_count: 50
      });

      if (error) throw error;

      // Ordenar mensajes por fecha (más recientes primero)
      const sortedMessages = (data || []).sort((a: ChatMessage, b: ChatMessage) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(sortedMessages);

      // Marcar mensajes como leídos
      await markMessagesAsRead(otherUserId);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Error al cargar mensajes');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (messageData: CreateChatMessage) => {
    if (!profile?.id) return;

    try {
      setError(null);

      // Llamar a la función RPC para enviar mensaje
      const { error } = await supabase.rpc('send_message', {
        sender_id: profile.id,
        receiver_id: messageData.receiver_id,
        message_content: messageData.content,
        message_type: messageData.message_type || 'text'
      });

      if (error) throw error;

      // Recargar mensajes y conversaciones
      await loadMessages(messageData.receiver_id);
      await loadConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Error al enviar mensaje');
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!profile?.id) return;

    try {
      await supabase.rpc('mark_messages_as_read', {
        user_id: profile.id,
        other_user_id: otherUserId
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const startNewConversation = (otherUserId: string, otherUserName: string, otherUserAvatar?: string) => {
    const newConversation: UserConversation = {
      conversation_id: `temp-${Date.now()}`,
      other_user_id: otherUserId,
      other_user_name: otherUserName,
      other_user_avatar: otherUserAvatar || null,
      last_message_content: null,
      last_message_at: new Date().toISOString(),
      unread_count: 0
    };

    setSelectedConversation(newConversation);
    setMessages([]);
  };

  // Mostrar estado de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de acceso restringido si no está autenticado
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <UserCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acceso restringido
          </h3>
          
          <p className="text-gray-600 mb-6">
            Para usar la mensajería, debes iniciar sesión en tu cuenta de Jubilalia.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ir al Dashboard
            </Link>
            
            <Link
              to="/signin"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar con conversaciones */}
      <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onStartNewConversation={startNewConversation}
        loading={loadingMessages}
        error={error}
        onRefresh={loadConversations}
      />

      {/* Ventana principal de chat */}
      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={sendMessage}
        loading={loadingMessages}
        error={error}
        currentUserId={profile.id}
      />
    </div>
  );
};

export default ChatApp;
