import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import GroupPosts from './GroupPosts';
import { 
  ArrowLeftIcon,
  UsersIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  current_members: number;
  created_at: string;
  category: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  country: string;
  telegram_group_name?: string;
  is_member?: boolean;
  role?: string;
}

interface GroupMember {
  id: string;
  profile_id: string;
  group_id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    created_at: string;
  };
}

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showPosts, setShowPosts] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroup();
      fetchMembers();
    }
  }, [id]);

  const fetchGroup = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(
            id,
            profile_id,
            role,
            joined_at
          )
        `)
        .eq('id', id)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        return;
      }

      // Verificar si el usuario es miembro
      const isMember = groupData.group_members.some(
        (member: any) => member.profile_id === profile?.id
      );

      const userRole = groupData.group_members.find(
        (member: any) => member.profile_id === profile?.id
      )?.role;

      setGroup({
        ...groupData,
        current_members: groupData.group_members.length,
        is_member: isMember,
        role: userRole
      });
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          profile_id,
          group_id,
          role,
          joined_at,
          profiles!inner(
            id,
            full_name,
            avatar_url,
            bio,
            city,
            country,
            created_at
          )
        `)
        .eq('group_id', id);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }

      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!group || !profile) return;

    setJoining(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          profile_id: profile.id,
          role: 'member'
        });

      if (error) {
        console.error('Error joining group:', error);
        return;
      }

      // Actualizar el estado del grupo
      setGroup(prev => prev ? {
        ...prev,
        is_member: true,
        current_members: prev.current_members + 1
      } : null);

      // Recargar miembros
      fetchMembers();
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || !profile) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('profile_id', profile.id);

      if (error) {
        console.error('Error leaving group:', error);
        return;
      }

      // Actualizar el estado del grupo
      setGroup(prev => prev ? {
        ...prev,
        is_member: false,
        current_members: prev.current_members - 1
      } : null);

      // Recargar miembros
      fetchMembers();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // Ver posts del grupo
  const viewGroupPosts = () => {
    setShowPosts(true);
  };

  // Cerrar vista de posts
  const closeGroupPosts = () => {
    setShowPosts(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Grupo no encontrado</h1>
          <button
            onClick={() => navigate('/groups')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Volver a grupos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a grupos
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-start space-x-6">
                {group.image_url ? (
                  <img
                    src={group.image_url}
                    alt={group.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center">
                    <UserGroupIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <TagIcon className="w-4 h-4 mr-1" />
                      {group.category}
                    </span>
                    
                    {group.city && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {group.city}, {group.country}
                      </span>
                    )}
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {group.current_members}/{group.max_members} miembros
                    </span>
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Creado {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {group.is_member ? (
                      <>
                        <button
                          onClick={viewGroupPosts}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                          Ver Posts
                        </button>
                        
                        {group.telegram_group_name && (
                          <a
                            href={`https://t.me/${group.telegram_group_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <LinkIcon className="w-5 h-5 mr-2" />
                            Unirse a Telegram
                          </a>
                        )}
                        
                        <button
                          onClick={handleLeaveGroup}
                          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Abandonar grupo
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleJoinGroup}
                        disabled={joining || group.current_members >= group.max_members}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joining ? 'Uniéndose...' : 'Unirse al grupo'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Miembros del grupo */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Miembros del grupo</h2>
          
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay miembros en este grupo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.profiles?.avatar_url ? (
                      <img
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UsersIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{member.profiles?.full_name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                    {member.profiles?.city && (
                      <p className="text-xs text-gray-500">{member.profiles.city}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vista de Posts del Grupo */}
      {showPosts && group && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-5/6 flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Posts de {group.name}
              </h2>
              <button
                onClick={closeGroupPosts}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex-1 overflow-hidden">
              <GroupPosts 
                groupId={group.id}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupDetail;
