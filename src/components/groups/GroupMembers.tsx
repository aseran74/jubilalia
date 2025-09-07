import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UsersIcon,
  UserCircleIcon,
  XMarkIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface GroupMember {
  id: string;
  profile_id: string;
  group_id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    created_at: string;
  };
}

interface GroupMembersProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const GroupMembers: React.FC<GroupMembersProps> = ({
  groupId,
  groupName,
  isOpen,
  onClose,
  currentUserId
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar miembros del grupo
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          profile_id,
          group_id,
          role,
          joined_at,
          profile:profiles(
            id,
            full_name,
            avatar_url,
            bio,
            location,
            created_at
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      setMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching group members:', err);
      setError(err.message || 'Error al cargar los miembros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && groupId) {
      fetchMembers();
    }
  }, [isOpen, groupId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      case 'member':
        return 'Miembro';
      default:
        return 'Miembro';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Miembros de {groupName}
                </h2>
                <p className="text-sm text-gray-500">
                  {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Cargando miembros...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchMembers}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Reintentar
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay miembros
              </h3>
              <p className="text-gray-600">
                Este grupo aún no tiene miembros.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {member.profile.avatar_url ? (
                      <img
                        src={member.profile.avatar_url}
                        alt={member.profile.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Información del miembro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {member.profile.full_name || 'Usuario sin nombre'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                    
                    {member.profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {member.profile.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {member.profile.location && (
                        <div className="flex items-center space-x-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{member.profile.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Se unió {formatDate(member.joined_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de contacto (si no es el usuario actual) */}
                  {member.profile_id !== currentUserId && (
                    <button
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full"
                      title="Enviar mensaje"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total: {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;
