import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import GroupPosts from '../groups/GroupPosts';
import { 
  PlusIcon,
  UsersIcon,

  ArrowLeftIcon
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
  is_member?: boolean;
  role?: string;
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroupPosts, setShowGroupPosts] = useState(false);

  // Cargar grupos
  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Obtener grupos públicos
      const { data: publicGroups, error: publicError } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true);

      if (publicError) throw publicError;

      // Obtener grupos de los que es miembro
      const { data: memberGroups, error: memberError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(profile_id, role)
        `)
        .eq('group_members.profile_id', profile?.id || '');

      if (memberError) throw memberError;

      // Combinar los grupos y eliminar duplicados
      const allGroups = [...(publicGroups || [])];
      (memberGroups || []).forEach(group => {
        if (!allGroups.find(g => g.id === group.id)) {
          allGroups.push(group);
        }
      });

      const groupsData = allGroups;

      // Procesar los datos para marcar si el usuario es miembro
      const processedGroups = groupsData.map(group => {
        const memberData = memberGroups.find(mg => mg.id === group.id);
        return {
          ...group,
          is_member: memberData ? true : false,
          role: memberData?.group_members?.[0]?.role || null
        };
      });

      setGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unirse a un grupo
  const joinGroup = async (groupId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: profile.id,
          role: 'member'
        });

      if (error) throw error;

      // Actualizar el contador de miembros
      await supabase
        .from('groups')
        .update({ current_members: (groups.find(g => g.id === groupId)?.current_members || 0) + 1 })
        .eq('id', groupId);

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Ver posts de un grupo
  const viewGroupPosts = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupPosts(true);
  };

  // Volver a la lista de grupos
  const backToGroups = () => {
    setShowGroupPosts(false);
    setSelectedGroup(null);
  };

  // Abandonar un grupo
  const leaveGroup = async (groupId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('profile_id', profile.id);

      if (error) throw error;

      // Actualizar el contador de miembros
      await supabase
        .from('groups')
        .update({ current_members: (groups.find(g => g.id === groupId)?.current_members || 0) - 1 })
        .eq('id', groupId);

      fetchGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  // Si estamos viendo posts de un grupo
  if (showGroupPosts && selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header con botón de volver */}
          <div className="flex items-center mb-6">
            <button
              onClick={backToGroups}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver a Grupos
            </button>
          </div>

          {/* Información del grupo */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              {selectedGroup.image_url ? (
                <img
                  src={selectedGroup.image_url}
                  alt={selectedGroup.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-8 h-8 text-green-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h1>
                <p className="text-gray-600">{selectedGroup.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    {selectedGroup.current_members || 0} miembros
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedGroup.is_public ? 'Público' : 'Privado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts del grupo */}
          <GroupPosts groupId={selectedGroup.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
            <p className="text-gray-600 mt-2">Conecta con personas que comparten tus intereses</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/groups/create')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Grupo
          </button>
        </div>

        {/* Lista de grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.is_public ? 'Público' : 'Privado'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    {group.current_members}/{group.max_members} miembros
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(group.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div className="flex gap-2">
                  {group.is_member ? (
                    <>
                      <button
                        onClick={() => viewGroupPosts(group)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Ver Posts
                      </button>
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Salir
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => joinGroup(group.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Unirse
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos disponibles</h3>
            <p className="text-gray-500 mb-6">Sé el primero en crear un grupo y conectar con otros usuarios.</p>
            <button
              onClick={() => navigate('/dashboard/groups/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Primer Grupo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;