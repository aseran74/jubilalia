import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  MagnifyingGlassIcon, 
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  last_message_content?: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

const ConversationsList: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener conversaciones donde el usuario actual es user1 o user2
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!inner(
            content,
            created_at
          ),
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
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Procesar las conversaciones para obtener la información del otro usuario
      const processedConversations = data?.map(conv => {
        const isUser1 = conv.user1_id === user.id;
        const otherUser = isUser1 ? conv.profiles : conv.profiles;
        const lastMessage = conv.messages?.[0];

        return {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          last_message_at: conv.last_message_at,
          last_message_content: lastMessage?.content,
          other_user: {
            id: otherUser.id,
            full_name: otherUser.full_name || 'Usuario',
            avatar_url: otherUser.avatar_url
          }
        };
      }) || [];

      setConversations(processedConversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      setError(error.message || 'Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Actualizar la lista local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Ahora';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando conversaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mensajes
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus conversaciones
          </p>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza a chatear con otros usuarios'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/users"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Buscar usuarios
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <Link
                  to={`/chat/${conversation.id}`}
                  className="block p-4"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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

                    {/* Información de la conversación */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {conversation.other_user.full_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDate(conversation.last_message_at)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              deleteConversation(conversation.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar conversación"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {conversation.last_message_content && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.last_message_content}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
