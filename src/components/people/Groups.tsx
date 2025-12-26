import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import GroupPosts from '../groups/GroupPosts';
import GroupMembers from '../groups/GroupMembers';
import GroupsMap from '../groups/GroupsMap';
import AdminButtons from '../common/AdminButtons';
import { 
  PlusIcon,
  UsersIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  MapPinIcon,
  TagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapIcon
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
  category: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  country: string;
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, isAdmin } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroupPosts, setShowGroupPosts] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    isPublic: true
  });

  // Detectar si estamos en la ruta del mapa
  useEffect(() => {
    if (location.pathname === '/dashboard/groups/map') {
      setViewMode('map');
    } else {
      setViewMode('list');
    }
  }, [location.pathname]);

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...groups];

    // Filtro por búsqueda (nombre o descripción)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(group => group.category === filters.category);
    }

    // Filtro por ciudad
    if (filters.city) {
      filtered = filtered.filter(group => 
        group.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtro por visibilidad
    if (filters.isPublic !== null) {
      filtered = filtered.filter(group => group.is_public === filters.isPublic);
    }

    setFilteredGroups(filtered);
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [groups, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      isPublic: true
    });
  };

  // Cargar grupos - Solo los grupos en los que el usuario está integrado
  const fetchGroups = async () => {
    if (!profile?.id) {
      setLoading(false);
      setGroups([]);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Cargando grupos del usuario:', profile.id);
      
      // Obtener solo los grupos de los que es miembro
      const { data: groupMembersData, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          groups (
            id,
            name,
            description,
            image_url,
            created_by,
            is_public,
            max_members,
            category,
            city,
            address,
            latitude,
            longitude,
            postal_code,
            country,
            created_at
          )
        `)
        .eq('profile_id', profile.id);

      console.log('👥 Grupos como miembro:', { data: groupMembersData, error: memberError });

      if (memberError) {
        console.error('❌ Error al cargar grupos como miembro:', memberError);
        throw memberError;
      }

      if (groupMembersData && groupMembersData.length > 0) {
        // Procesar los datos para extraer los grupos
        const processedGroups: Group[] = groupMembersData
          .map((gm: any) => {
            const group = Array.isArray(gm.groups) ? gm.groups[0] : gm.groups;
            if (!group) return null;
            
            return {
              ...group,
              is_member: true,
              role: gm.role || null,
              current_members: 0 // Se puede calcular después si es necesario
            };
          })
          .filter((g): g is Group => g !== null);

        setGroups(processedGroups);
        console.log('✅ Grupos cargados exitosamente:', processedGroups.length);
      } else {
        setGroups([]);
        console.log('ℹ️ Usuario no está en ningún grupo');
      }
    } catch (error: any) {
      console.error('❌ Error fetching groups:', error);
      setGroups([]);
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

      // El trigger actualiza automáticamente el contador de miembros
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

  // Ver miembros del grupo
  const viewGroupMembers = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupMembers(true);
  };

  // Manejar selección de grupo desde el mapa
  const handleGroupSelect = (group: Group) => {
    console.log('🔗 Navegando a detalles de grupo:', group.name);
    navigate(`/dashboard/groups/${group.id}`);
  };

  // Volver a la lista de grupos
  const backToGroups = () => {
    setShowGroupPosts(false);
    setSelectedGroup(null);
  };

  // Cerrar vista de miembros
  const closeGroupMembers = () => {
    setShowGroupMembers(false);
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

      // El trigger actualiza automáticamente el contador de miembros
      fetchGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // Eliminar un grupo (solo administradores)
  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error deleting group:', error);
        alert('Error al eliminar el grupo');
        return;
      }

      // Actualizar la lista de grupos
      setGroups(groups.filter(group => group.id !== groupId));
      alert('Grupo eliminado correctamente');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error al eliminar el grupo');
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

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtros
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FunnelIcon className="w-4 h-4 mr-1" />
                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
              </button>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Limpiar
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Nombre o descripción..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  <option value="Retiros">Retiros</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Hobbies">Hobbies</option>
                  <option value="Comida">Comida</option>
                  <option value="Cartas">Cartas</option>
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Madrid, Barcelona..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Visibilidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibilidad
                </label>
                <select
                  value={filters.isPublic ? 'public' : 'private'}
                  onChange={(e) => handleFilterChange('isPublic', e.target.value === 'public')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="public">Públicos</option>
                  <option value="private">Privados</option>
                </select>
              </div>
            </div>
          )}

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredGroups.length} de {groups.length} grupos
          </div>
        </div>

        {/* Controles de vista */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Mapa
            </button>
          </div>
        </div>

        {/* Vista según el modo seleccionado */}
        {viewMode === 'list' ? (
          /* Lista de grupos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredGroups.map((group) => (
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

                {/* Categoría y Localización */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {group.category}
                    </span>
                  )}
                  {group.city && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      {group.city}
                    </span>
                  )}
                </div>

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
                        onClick={() => viewGroupMembers(group)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        <span>Miembros</span>
                      </button>
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Salir
                      </button>
                    </>
                  ) : (
                    <>
                    <button
                      onClick={() => joinGroup(group.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Unirse
                    </button>
                      <button
                        onClick={() => viewGroupMembers(group)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                        title="Ver miembros"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Botones de administrador */}
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <AdminButtons 
                      itemId={group.id}
                      itemType="group"
                      onDelete={handleDeleteGroup}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        ) : (
          /* Vista del mapa */
          <GroupsMap 
            groups={filteredGroups}
            onGroupSelect={handleGroupSelect}
            className="w-full h-96 mb-8"
          />
        )}

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {groups.length === 0 ? 'No hay grupos disponibles' : 'No se encontraron grupos'}
            </h3>
            <p className="text-gray-500 mb-6">
              {groups.length === 0 
                ? 'Sé el primero en crear un grupo y conectar con otros usuarios.'
                : 'Intenta ajustar los filtros para encontrar grupos que coincidan con tus criterios.'
              }
            </p>
            <button
              onClick={() => navigate('/dashboard/groups/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Primer Grupo
            </button>
          </div>
        )}
      </div>

      {/* Vista de miembros del grupo */}
      {showGroupMembers && selectedGroup && (
        <GroupMembers
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          isOpen={showGroupMembers}
          onClose={closeGroupMembers}
          currentUserId={profile?.id}
        />
      )}
    </div>
  );
};

export default Groups;