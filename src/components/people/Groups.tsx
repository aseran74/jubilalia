import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import GroupPosts from '../groups/GroupPosts';
import GroupMembers from '../groups/GroupMembers';
import GroupsMap from '../groups/GroupsMap';
import AdminButtons from '../common/AdminButtons';
import Modal from '../common/Modal';
import MapViewControls, { MapOverlayHeader, NearbyButton, detectNearbyLocation } from '../common/MapViewControls';
import DistanceFilter from '../common/DistanceFilter';
import { formatDistanceLabel, isWithinDistance, resolveCoordinates, resolveProfileOrigin } from '../../utils/geo';
import { 
  PlusIcon,
  UsersIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [nearbyOnly, setNearbyOnly] = useState(location.search.includes('nearby'));
  const [detectingNearby, setDetectingNearby] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [origin, setOrigin] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    categories: [] as string[],
    city: '',
    isPublic: null as boolean | null  // null = mostrar todos, true = solo públicos, false = solo privados
  });

  // Detectar el modo de visualización
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('/groups') || path.endsWith('/groups/map')) {
      setViewMode('map');
    }
  }, [location.pathname]);

  const isExplore = location.search.includes('explore');
  const groupsTitle = nearbyOnly ? 'Grupos cercanos' : isExplore ? 'Grupos' : 'Mis grupos';

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

    // Filtro por categoría (varias a la vez)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(group => filters.categories.includes(group.category));
    }

    // Filtro por ciudad
    if (filters.city) {
      filtered = filtered.filter(group => 
        group.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    filtered = filtered.filter((group) =>
      isWithinDistance(
        origin,
        resolveCoordinates(group.latitude, group.longitude, group.city),
        maxDistance
      )
    );

    // Filtro por visibilidad - solo aplicar si se ha cambiado explícitamente
    // Por defecto, mostrar todos los grupos (no filtrar por isPublic)
    // Este filtro solo se aplica si el usuario lo cambia manualmente

    setFilteredGroups(filtered);
  };

  // Cargar grupos cuando cambie el modo o el perfil
  useEffect(() => {
    fetchGroups();
  }, [profile?.id, location.search, location.pathname]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [groups, filters, nearbyOnly, origin, maxDistance, profile?.city]);

  // Manejar cambios en filtros
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(item => item !== category)
        : [...prev.categories, category]
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      city: '',
      isPublic: true
    });
    setNearbyOnly(false);
    setMaxDistance(50);
    const profileOrigin = resolveProfileOrigin(profile);
    setOrigin(profileOrigin ? { ...profileOrigin, label: profile?.city || undefined } : null);
  };

  useEffect(() => {
    const profileOrigin = resolveProfileOrigin(profile);
    if (profileOrigin) {
      setOrigin((prev) => prev ?? { ...profileOrigin, label: profile?.city || undefined });
    }
  }, [profile]);

  const handleDetectNearby = async () => {
    if (nearbyOnly) {
      setNearbyOnly(false);
      const profileOrigin = resolveProfileOrigin(profile);
      setOrigin(profileOrigin ? { ...profileOrigin, label: profile?.city || undefined } : null);
      return;
    }

    setDetectingNearby(true);
    const locationResult = await detectNearbyLocation();
    if (locationResult) {
      setOrigin({
        lat: locationResult.lat,
        lng: locationResult.lng,
        label: locationResult.formattedAddress || locationResult.city,
      });
      if (locationResult.city) {
        setFilters((prev) => ({ ...prev, city: locationResult.city }));
      }
    } else {
      const profileOrigin = resolveProfileOrigin(profile);
      setOrigin(profileOrigin ? { ...profileOrigin, label: profile?.city || undefined } : null);
    }
    setNearbyOnly(true);
    setDetectingNearby(false);
  };

  // Cargar grupos - Diferencia entre "Mis Grupos" y "Explorar"
  const fetchGroups = async () => {
    if (!profile?.id) {
      setLoading(false);
      setGroups([]);
      return;
    }

    try {
      setLoading(true);
      
      // Detectar si es exploración o mis grupos
      const isExplore = location.search.includes('explore');
      console.log('📍 Modo detectado:', { 
        pathname: location.pathname, 
        search: location.search, 
        isExplore,
        profileId: profile.id 
      });
      
      // Si es "Mis Grupos" (no tiene ?explore), cargar solo los grupos donde el usuario es miembro
      if (!isExplore) {
        console.log('🔍 Cargando MIS grupos del usuario:', profile.id);
        
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

        if (memberError) {
          console.error('❌ Error al cargar grupos como miembro:', memberError);
          throw memberError;
        }

        if (groupMembersData && groupMembersData.length > 0) {
          const processedGroups: Group[] = groupMembersData
            .map((gm: any) => {
              const group = Array.isArray(gm.groups) ? gm.groups[0] : gm.groups;
              if (!group) return null;
              
              return {
                ...group,
                is_member: true,
                role: gm.role || null,
                current_members: 0
              };
            })
            .filter((g): g is Group => g !== null);

          setGroups(processedGroups);
          console.log('✅ Mis grupos cargados exitosamente:', processedGroups.length);
        } else {
          setGroups([]);
          console.log('ℹ️ Usuario no está en ningún grupo');
        }
      } else {
        // Si es exploración, cargar TODOS los grupos públicos
        console.log('🔍 Cargando TODOS los grupos públicos para explorar');
        
        const { data: allGroupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        console.log('📊 Grupos públicos encontrados:', allGroupsData?.length || 0);

        if (groupsError) {
          console.error('❌ Error al cargar todos los grupos:', groupsError);
          throw groupsError;
        }

        if (allGroupsData && allGroupsData.length > 0) {
          // Verificar cuáles son los grupos donde el usuario es miembro
          const { data: userMemberships } = await supabase
            .from('group_members')
            .select('group_id, role')
            .eq('profile_id', profile.id);

          const membershipMap = new Map(
            (userMemberships || []).map((m: any) => [m.group_id, m.role])
          );

          const processedGroups: Group[] = allGroupsData.map((group: any) => ({
            ...group,
            is_member: membershipMap.has(group.id),
            role: membershipMap.get(group.id) || null,
            current_members: 0
          }));

          setGroups(processedGroups);
          console.log('✅ Todos los grupos cargados exitosamente:', processedGroups.length);
        } else {
          setGroups([]);
          console.log('ℹ️ No hay grupos públicos disponibles');
        }
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

  const activeFilterCount =
    (filters.search ? 1 : 0) + filters.categories.length + (filters.city ? 1 : 0) + (nearbyOnly ? 1 : 0) + (maxDistance !== 50 ? 1 : 0);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">{groupsTitle}</h1>
          {groups.length > 0 && (
            <p className="mt-0.5 text-sm text-stone-500">
              {filteredGroups.length} de {groups.length} grupos
              {origin ? ` · ${formatDistanceLabel(maxDistance)}` : ''}
            </p>
          )}
        </div>

        <NearbyButton active={nearbyOnly} loading={detectingNearby} onClick={handleDetectNearby} />
        <button
          type="button"
          onClick={() => navigate('/dashboard/groups/create')}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <PlusIcon className="h-4 w-4" />
          Crear
        </button>
      </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
        </div>
      )}

      {viewMode === 'map' && (
        <div className="relative h-[100dvh] min-h-[22rem] w-full">
          <GroupsMap
            groups={filteredGroups}
            onGroupSelect={handleGroupSelect}
            compact
            className="h-full w-full"
          />
          <MapOverlayHeader
            title={groupsTitle}
            subtitle={groups.length > 0 ? `${filteredGroups.length} de ${groups.length} grupos${origin ? ` · ${formatDistanceLabel(maxDistance)}` : ''}` : undefined}
            action={
              <div className="flex shrink-0 items-center gap-2">
                <NearbyButton active={nearbyOnly} loading={detectingNearby} onClick={handleDetectNearby} />
                <button
                type="button"
                onClick={() => navigate('/dashboard/groups/create')}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-800"
              >
                <PlusIcon className="h-4 w-4" />
                Crear
              </button>
              </div>
            }
          />
        </div>
      )}

      {viewMode === 'list' && (
        <div className="p-4 pb-32">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                      <UsersIcon className="h-12 w-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 space-y-2">
                    {group.category && (
                      <span className="rounded-full bg-blue-100/90 px-2 py-1 text-xs font-medium text-blue-800 backdrop-blur-sm">
                        {group.category}
                      </span>
                    )}
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-800">
                    {group.is_public ? 'Público' : 'Privado'}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">{group.description}</p>

                  {group.city && (
                    <div className="mb-3 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="mr-1 h-4 w-4" />
                      <span>{group.city}</span>
                    </div>
                  )}

                  <div className="mb-4 flex items-center text-sm text-gray-600">
                    <UsersIcon className="mr-1 h-4 w-4" />
                    <span>
                      {group.current_members}/{group.max_members} miembros
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {group.is_member ? (
                      <>
                        <button
                          onClick={() => viewGroupPosts(group)}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
                        >
                          Ver Posts
                        </button>
                        <button
                          onClick={() => viewGroupMembers(group)}
                          className="flex flex-1 items-center justify-center space-x-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                          <span>Miembros</span>
                        </button>
                        <button
                          onClick={() => leaveGroup(group.id)}
                          className="rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          Salir
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => joinGroup(group.id)}
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          Unirse
                        </button>
                        <button
                          onClick={() => viewGroupMembers(group)}
                          className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
                          title="Ver miembros"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
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

          {filteredGroups.length === 0 && (
            <div className="py-12 text-center">
              <UsersIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {groups.length === 0 ? 'No hay grupos disponibles' : 'No se encontraron grupos'}
              </h3>
              <p className="mb-6 text-gray-500">
                {groups.length === 0
                  ? 'Sé el primero en crear un grupo y conectar con otros usuarios.'
                  : 'Intenta ajustar los filtros para encontrar grupos que coincidan con tus criterios.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/groups/create')}
                className="rounded-lg bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
              >
                Crear grupo
              </button>
            </div>
          )}
        </div>
      )}

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowFilters(true)}
        filterCount={activeFilterCount}
      />

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filtros" size="lg">
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleDetectNearby}
            className={`flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
              nearbyOnly ? 'bg-emerald-700 text-white' : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <MapPinIcon className="h-5 w-5" />
            {nearbyOnly ? 'Mostrando los más cercanos' : 'Detectar más cercanos'}
          </button>
          <DistanceFilter value={maxDistance} onChange={setMaxDistance} />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nombre o descripción..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Categoría ({filters.categories.length} seleccionadas)
            </label>
            <div className="flex flex-wrap gap-2">
              {['Retiros', 'Deportes', 'Hobbies', 'Comida', 'Cartas'].map((category) => {
                const selected = filters.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                      selected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ciudad</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Madrid, Barcelona..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-3 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Ver resultados
            </button>
          </div>
        </div>
      </Modal>

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