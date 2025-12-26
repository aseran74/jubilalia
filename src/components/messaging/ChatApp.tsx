import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChatMessage, UserConversation, CreateChatMessage } from '../../types/supabase';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { 
  UserCircleIcon,
  Bars3Icon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ChatApp: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debug: mostrar estado de autenticación
  console.log('ChatApp - Estado de autenticación:', { user, profile, loading });
  console.log('ChatApp - Estado de UI:', { isMobile, showSidebar, selectedConversation: !!selectedConversation });

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Función para iniciar nueva conversación (definida antes de los useEffects)
  const startNewConversation = useCallback((otherUserId: string, otherUserName: string, otherUserAvatar?: string) => {
    console.log('ChatApp - startNewConversation llamado con:', { otherUserId, otherUserName, otherUserAvatar });
    
    const newConversation: UserConversation = {
      conversation_id: `temp-${Date.now()}`,
      other_user_id: otherUserId,
      other_user_name: otherUserName,
      other_user_avatar: otherUserAvatar || null,
      last_message_content: null,
      last_message_at: new Date().toISOString(),
      unread_count: 0
    };

    console.log('ChatApp - Nueva conversación creada:', newConversation);
    setSelectedConversation(newConversation);
    setMessages([]);
    
    // En móvil, ocultar sidebar cuando se selecciona una conversación
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  // Cargar conversaciones del usuario
  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id]);

  // Manejar nueva conversación desde la búsqueda de usuarios o query params
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (!profile?.id) return;
    
    // Verificar si hay un user ID en los query params
    const userIdFromQuery = searchParams.get('user');
    
    if (userIdFromQuery) {
      console.log('ChatApp - Iniciando conversación desde query param:', userIdFromQuery);
      // Obtener el nombre del usuario
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userIdFromQuery)
        .single()
        .then(({ data: userProfile, error }) => {
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          if (userProfile && userProfile.id !== selectedConversation?.other_user_id) {
            startNewConversation(userProfile.id, userProfile.full_name || 'Usuario', userProfile.avatar_url || undefined);
            // Limpiar el query param
            window.history.replaceState({}, '', '/dashboard/messages');
          }
        });
      return;
    }
    
    // Verificar si hay estado de navegación
    console.log('ChatApp - location.state:', location.state);
    if (location.state?.startNewChat) {
      const { otherUserId, otherUserName, otherUserAvatar } = location.state;
      console.log('ChatApp - Iniciando nueva conversación desde state:', { otherUserId, otherUserName });
      
      // Solo iniciar si no es la conversación actual
      if (otherUserId !== selectedConversation?.other_user_id) {
        startNewConversation(otherUserId, otherUserName, otherUserAvatar);
        // Limpiar el estado de navegación
        window.history.replaceState({}, document.title);
      }
    }
  }, [searchParams, location.state, profile?.id, startNewConversation, selectedConversation]);

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

      // Mapear los datos de la función RPC a ChatMessage
      // La función retorna recipient_id, pero necesitamos asegurarnos de que se mapee correctamente
      const sortedMessages = (data || []).map((msg: any) => ({
        ...msg,
        recipient_id: msg.recipient_id || msg.receiver_id, // Compatibilidad con ambos nombres
        content: msg.content || msg.message_text
      })).sort((a: ChatMessage, b: ChatMessage) => 
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
        receiver_id: messageData.recipient_id,
        message_content: messageData.content,
        message_type: messageData.message_type || 'text'
      });

      if (error) throw error;

      // Recargar mensajes y conversaciones
      await loadMessages(messageData.recipient_id);
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


  const handleSelectConversation = (conversation: UserConversation) => {
    setSelectedConversation(conversation);
    
    // En móvil, ocultar sidebar cuando se selecciona una conversación
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
    if (isMobile) {
      setShowSidebar(true);
    }
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
              to="/login"
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
    <div className="flex h-screen bg-gray-100 relative">
      {/* Overlay móvil */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar con conversaciones */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            } w-80`
          : 'relative'
        }
      `}>
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          loading={loadingMessages}
          error={error}
          onRefresh={loadConversations}
          isMobile={isMobile}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>

      {/* Ventana principal de chat */}
      <div className={`
        flex-1 flex flex-col
        ${isMobile 
          ? (showSidebar ? 'hidden' : 'block')
          : 'block'
        }
      `}>
        {/* Header móvil */}
        {isMobile && selectedConversation && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
            <button
              onClick={handleBackToConversations}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              {selectedConversation.other_user_avatar ? (
                <img
                  src={selectedConversation.other_user_avatar}
                  alt={selectedConversation.other_user_name || 'Usuario'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedConversation.other_user_name || 'Usuario sin nombre'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.unread_count > 0 
                    ? `${selectedConversation.unread_count} mensaje${selectedConversation.unread_count === 1 ? '' : 's'} no leído${selectedConversation.unread_count === 1 ? '' : 's'}`
                    : 'En línea'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={sendMessage}
          loading={loadingMessages}
          error={error}
          currentUserId={profile.id}
          isMobile={isMobile}
        />
      </div>

      {/* Botón para mostrar sidebar en móvil cuando no hay conversación seleccionada */}
      {isMobile && !selectedConversation && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default ChatApp;
