import React, { useState } from 'react';
import { UserConversation } from '../../types/supabase';
import { 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ChatSidebarProps {
  conversations: UserConversation[];
  selectedConversation: UserConversation | null;
  onSelectConversation: (conversation: UserConversation) => void;
  onStartNewConversation: (otherUserId: string, otherUserName: string, otherUserAvatar?: string) => void;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,

  loading,
  error,
  onRefresh
}) => {
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            title="Nueva conversación"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Buscador */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botón de nueva conversación */}
        {showNewChat && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 mb-2">
              Para iniciar una nueva conversación, busca a la persona en la búsqueda de usuarios.
            </p>
            <button
              onClick={() => setShowNewChat(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <ArrowPathIcon className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Cargando...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conversaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No se encontraron conversaciones con ese nombre.' : 'Inicia una conversación para comenzar a chatear.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.conversation_id === conversation.conversation_id
                    ? 'bg-blue-50 border-r-2 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
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

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.other_user_name || 'Usuario sin nombre'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>

                    {/* Último mensaje */}
                    {conversation.last_message_content && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.last_message_content}
                      </p>
                    )}

                    {/* Contador de mensajes no leídos */}
                    {conversation.unread_count > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {conversation.unread_count} {conversation.unread_count === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
