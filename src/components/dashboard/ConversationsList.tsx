import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MessageCircle, User, Clock, MapPin, Bed } from 'lucide-react';
import ChatModal from './ChatModal';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  last_message_at: string;
  created_at: string;
  other_participant: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  listing?: {
    title: string;
    listing_type: string;
  };
  last_message?: {
    message_text: string;
    sender_id: string;
  };
  unread_count: number;
}

const ConversationsList: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener el perfil del usuario actual
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (!profile) return;

      // Obtener conversaciones del usuario
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant1_id,
          participant2_id,
          listing_id,
          last_message_at,
          created_at,
          property_listings!conversations_listing_id_fkey(title, listing_type)
        `)
        .or(`participant1_id.eq.${profile.id},participant2_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Obtener información de los otros participantes y últimos mensajes
      const conversationsWithDetails = await Promise.all(
        conversationsData?.map(async (conv) => {
          const otherParticipantId = conv.participant1_id === profile.id 
            ? conv.participant2_id 
            : conv.participant1_id;

          // Obtener perfil del otro participante
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherParticipantId)
            .single();

          // Obtener el último mensaje
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('message_text, sender_id')
            .or(`and(sender_id.eq.${conv.participant1_id},recipient_id.eq.${conv.participant2_id}),and(sender_id.eq.${conv.participant2_id},recipient_id.eq.${conv.participant1_id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Obtener conteo de mensajes no leídos
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', profile.id)
            .eq('sender_id', otherParticipantId)
            .eq('is_read', false);

          return {
            id: conv.id,
            participant1_id: conv.participant1_id,
            participant2_id: conv.participant2_id,
            listing_id: conv.listing_id,
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            other_participant: otherProfile || { id: otherParticipantId, full_name: 'Usuario' },
            listing: conv.property_listings,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        }) || []
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChatModal(true);
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

  const getListingIcon = (listingType?: string) => {
    switch (listingType) {
      case 'room_rental':
        return <Bed className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes conversaciones</h3>
        <p className="text-gray-500">Cuando envíes o recibas mensajes, aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Conversaciones</h2>
        <span className="text-sm text-gray-500">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => openChat(conversation)}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              {/* Avatar del otro participante */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {conversation.other_participant.avatar_url ? (
                  <img
                    src={conversation.other_participant.avatar_url}
                    alt={conversation.other_participant.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {conversation.other_participant.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              {/* Contenido de la conversación */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {conversation.other_participant.full_name || 'Usuario'}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(conversation.last_message_at)}</span>
                  </div>
                </div>

                {/* Información de la propiedad si existe */}
                {conversation.listing && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                    {getListingIcon(conversation.listing.listing_type)}
                    <span className="truncate">{conversation.listing.title}</span>
                  </div>
                )}

                {/* Último mensaje */}
                {conversation.last_message && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message.sender_id === conversation.other_participant.id ? '' : 'Tú: '}
                    {conversation.last_message.message_text}
                  </p>
                )}

                {/* Indicador de mensajes no leídos */}
                {conversation.unread_count > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {conversation.unread_count} mensaje{conversation.unread_count !== 1 ? 's' : ''} nuevo{conversation.unread_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedConversation(null);
            fetchConversations(); // Recargar conversaciones para actualizar contadores
          }}
          recipientId={selectedConversation.other_participant.id}
          recipientName={selectedConversation.other_participant.full_name}
          listingId={selectedConversation.listing_id}
          listingTitle={selectedConversation.listing?.title}
        />
      )}
    </div>
  );
};

export default ConversationsList;
