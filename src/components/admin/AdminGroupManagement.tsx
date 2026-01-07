import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface Group {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  max_members: number;
  member_count: number;
  created_at: string;
  created_by: string;
  creator_name: string;
}

const AdminGroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      fetchGroups();
    }
  }, [isAdmin, filter]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      console.log('🔍 AdminGroupManagement - Cargando grupos...');

      // Obtener todos los grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      console.log('🔍 AdminGroupManagement - Grupos obtenidos:', groupsData?.length || 0);

      if (!groupsData || groupsData.length === 0) {
        setGroups([]);
        return;
      }

      // Obtener los created_by únicos
      const creatorIds = [...new Set(groupsData.map(g => g.created_by).filter(Boolean))];
      
      // Obtener los perfiles de los creadores
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Crear un mapa de creadores
      const creatorsMap = new Map<string, string>();
      profilesData?.forEach((profile: any) => {
        creatorsMap.set(profile.id, profile.full_name || 'Usuario sin nombre');
      });

      // Obtener el conteo de miembros para cada grupo
      const groupIds = groupsData.map(g => g.id);
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      }

      // Contar miembros por grupo
      const memberCountMap = new Map<string, number>();
      membersData?.forEach((member: any) => {
        const count = memberCountMap.get(member.group_id) || 0;
        memberCountMap.set(member.group_id, count + 1);
      });

      const transformedGroups = groupsData.map((group: any) => ({
        ...group,
        creator_name: creatorsMap.get(group.created_by) || 'Creador desconocido',
        member_count: memberCountMap.get(group.id) || 0
      }));

      console.log('🎉 AdminGroupManagement - Grupos procesados:', transformedGroups.length);
      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert('Error al cargar los grupos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este grupo? Esto eliminará también todos los miembros, posts y comentarios asociados.')) {
      return;
    }

    try {
      // Eliminar miembros primero (aunque debería ser cascade)
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      if (membersError) {
        console.error('Error deleting members:', membersError);
      }

      // Eliminar posts del grupo (aunque debería ser cascade)
      const { error: postsError } = await supabase
        .from('group_posts')
        .delete()
        .eq('group_id', groupId);

      if (postsError) {
        console.error('Error deleting posts:', postsError);
      }

      // Eliminar el grupo
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (groupError) {
        console.error('Error deleting group:', groupError);
        alert('Error al eliminar el grupo');
        return;
      }

      // Actualizar la lista
      setGroups(prev => prev.filter(group => group.id !== groupId));
      alert('Grupo eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el grupo');
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedGroups.size === 0) {
      alert('Por favor, selecciona al menos un grupo para eliminar');
      return;
    }

    const count = selectedGroups.size;
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${count} ${count === 1 ? 'grupo' : 'grupos'}? Esto eliminará también todos los miembros, posts y comentarios asociados.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const groupIds = Array.from(selectedGroups);
      
      // Eliminar miembros primero
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .in('group_id', groupIds);

      if (membersError) {
        console.error('Error deleting members:', membersError);
      }

      // Eliminar posts
      const { error: postsError } = await supabase
        .from('group_posts')
        .delete()
        .in('group_id', groupIds);

      if (postsError) {
        console.error('Error deleting posts:', postsError);
      }

      // Eliminar los grupos
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .in('id', groupIds);

      if (groupError) {
        console.error('Error deleting groups:', groupError);
        alert('Error al eliminar los grupos');
        return;
      }

      // Actualizar la lista y limpiar selección
      setGroups(prev => prev.filter(group => !selectedGroups.has(group.id)));
      setSelectedGroups(new Set());
      alert(`${count} ${count === 1 ? 'grupo eliminado' : 'grupos eliminados'} exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar los grupos');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(new Set(filteredGroups.map(g => g.id)));
    } else {
      setSelectedGroups(new Set());
    }
  };

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (checked) {
      newSelected.add(groupId);
    } else {
      newSelected.delete(groupId);
    }
    setSelectedGroups(newSelected);
  };

  // Resetear selección cuando cambia el filtro
  useEffect(() => {
    setSelectedGroups(new Set());
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso restringido</h3>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const filteredGroups = filter === 'all' 
    ? groups 
    : groups.filter(g => 
        filter === 'public' ? g.is_public === true : g.is_public === false
      );

  const isAllSelected = filteredGroups.length > 0 && 
    filteredGroups.every(g => selectedGroups.has(g.id));
  const isIndeterminate = selectedGroups.size > 0 && 
    selectedGroups.size < filteredGroups.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos y Miembros</h1>
            <p className="text-gray-600 mt-1">Administra todos los grupos y sus miembros</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard/groups/create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Grupos Públicos</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.filter(g => g.is_public === true).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Grupos Privados</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.filter(g => g.is_public === false).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Miembros</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, g) => sum + g.member_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'public'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Públicos
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'private'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Privados
          </button>
        </div>
      </div>

      {/* Lista de grupos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Grupos ({filteredGroups.length})
          </h2>
          {selectedGroups.size > 0 && (
            <button
              onClick={handleDeleteMultiple}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              {isDeleting ? 'Eliminando...' : `Eliminar ${selectedGroups.size} ${selectedGroups.size === 1 ? 'seleccionado' : 'seleccionados'}`}
            </button>
          )}
        </div>
        
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos</h3>
            <p className="text-gray-500">No se encontraron grupos con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      title={isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miembros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr 
                    key={group.id} 
                    className={`hover:bg-gray-50 ${selectedGroups.has(group.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={(e) => handleSelectGroup(group.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {group.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {group.description || 'Sin descripción'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {group.member_count} / {group.max_members}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.creator_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        group.is_public
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {group.is_public ? 'Público' : 'Privado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(group.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/groups/${group.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/groups/${group.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroupManagement;


