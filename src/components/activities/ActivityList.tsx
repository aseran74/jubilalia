import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Search, MapPin, Users, Calendar, Clock, Eye, Activity, Plus } from 'lucide-react';
import ActivityMap from './ActivityMap';
import Modal from '../common/Modal';
import MapViewControls, { MapOverlayHeader } from '../common/MapViewControls';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  city: string;
  max_participants: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  difficulty_level: string;
  tags: string[];
  images: string[];
  profile_id?: string;
  owner: {
    full_name: string;
    avatar_url?: string;
  };
}

const ActivityList: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const mineOnly = location.search.includes('mine');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minDuration, setMinDuration] = useState<number>(0);
  const [maxDuration, setMaxDuration] = useState<number>(30);
  const navigate = useNavigate();

  // Cargar dirección del perfil al inicio
  useEffect(() => {
    if (profile && profile.city) {
      const location = `${profile.city}${profile.state ? ', ' + profile.state : ''}`;
      setUserLocation(location);
      console.log('ActivityList - Dirección del perfil cargada:', location);
    }
  }, [profile]);

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('/activities') || path.endsWith('/activities/map')) {
      setViewMode('map');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetch de actividades...');
      
      // Verificar conectividad primero
      try {
        const { testSupabaseConnection } = await import('../../lib/supabase');
        const isConnected = await testSupabaseConnection();
        
        if (!isConnected) {
          console.error('❌ No hay conectividad con Supabase');
          setActivities([]);
          setLoading(false);
          return;
        }
      } catch (connectionError) {
        console.error('❌ Error verificando conectividad:', connectionError);
      }
      
      // CONSULTA DE ACTIVIDADES
      console.log('🔍 Haciendo consulta de actividades...');
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resultado de consulta:', {
        count: activitiesData?.length || 0,
        error: activitiesError
      });

      if (activitiesError) {
        console.error('❌ Error en consulta de actividades:', activitiesError);
        setActivities([]);
        setLoading(false);
        return;
      }

      if (!activitiesData || activitiesData.length === 0) {
        console.log('⚠️ No se encontraron actividades');
        setActivities([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Se encontraron ${activitiesData.length} actividades`);

      // Obtener imágenes para cada actividad (usando objeto plano en lugar de Map)
      const imagesByActivity: Record<string, string[]> = {};
      
      try {
        if (activitiesData && activitiesData.length > 0) {
          const activityIds = activitiesData.map(a => a.id);
          
          if (activityIds.length > 0) {
            const { data: imagesData, error: imagesError } = await supabase
              .from('activity_images')
              .select('activity_id, image_url, is_primary, image_order')
              .in('activity_id', activityIds)
              .order('image_order', { ascending: true });

            if (imagesError) {
              console.warn('⚠️ Error obteniendo imágenes (continuando sin imágenes):', imagesError);
            } else if (imagesData && Array.isArray(imagesData)) {
              // Agrupar imágenes por actividad
              imagesData.forEach(img => {
                if (img && img.activity_id && img.image_url) {
                  if (!imagesByActivity[img.activity_id]) {
                    imagesByActivity[img.activity_id] = [];
                  }
                  imagesByActivity[img.activity_id].push(img.image_url);
                }
              });
              console.log(`📸 Se obtuvieron imágenes para ${Object.keys(imagesByActivity).length} actividades`);
            }
          }
        }
      } catch (imagesError) {
        console.warn('⚠️ Error al procesar imágenes (continuando sin imágenes):', imagesError);
      }

      // Combinar actividades con sus imágenes
      const activitiesWithBasicInfo = activitiesData.map(activity => {
        // Asegurar que todos los campos requeridos existan
        return {
        ...activity,
          title: activity.title || 'Sin título',
          description: activity.description || '',
          city: activity.city || 'Sin ciudad',
          images: imagesByActivity[activity.id] || [],
          profile_id: activity.profile_id,
          owner: { full_name: 'Usuario', avatar_url: undefined },
          is_free: activity.is_free ?? false,
          price: activity.price ?? 0,
          current_participants: activity.current_participants ?? 0,
          max_participants: activity.max_participants ?? 50
        };
      });

      console.log('🎉 Actividades procesadas:', activitiesWithBasicInfo.length);
      console.log('📋 Primeras 3 actividades:', activitiesWithBasicInfo.slice(0, 3).map(a => ({
        id: a.id,
        title: a.title,
        city: a.city,
        images: a.images.length
      })));
      
      setActivities(activitiesWithBasicInfo);

    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    // Validar que la actividad tenga datos básicos
    if (!activity || !activity.title) {
      return false;
    }

    // Filtro de búsqueda por texto
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (activity.title && activity.title.toLowerCase().includes(searchLower)) ||
      (activity.description && activity.description.toLowerCase().includes(searchLower)) ||
      (activity.city && activity.city.toLowerCase().includes(searchLower));
    
    // Filtro por tipo de actividad (varias a la vez)
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(activity.activity_type);
    
    // Filtro por ciudad (varias a la vez)
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(activity.city);
    
    // Filtro por precio - diferente según si es viajes o no
    let matchesPrice = true;
    const isTravelSelected = selectedTypes.some((type) => {
      const typeLower = type.toLowerCase();
      return typeLower.includes('viaje') || typeLower === 'viajes';
    });
    const activityTypeLower = activity.activity_type?.toLowerCase() || '';
    const isTravelActivity = activityTypeLower.includes('viaje') || activityTypeLower === 'viajes';
    
    // Solo aplicar filtros de precio si el tipo seleccionado coincide con el tipo de actividad
    if (isTravelSelected && isTravelActivity) {
      // Para viajes: solo filtro por rango de precio (solo si se ha modificado el rango)
      const activityPrice = activity.price || 0;
      // Si los valores están en el rango por defecto (0-5000), no filtrar por precio
      if (minPrice > 0 || maxPrice < 5000) {
        matchesPrice = activityPrice >= minPrice && activityPrice <= maxPrice;
      }
    } else if (!isTravelSelected && !isTravelActivity) {
      // Para no-viajes: filtro por gratis/pago y rango de precio
      if (priceFilter === 'free') {
        matchesPrice = activity.is_free === true;
      } else if (priceFilter === 'paid') {
        const activityPrice = activity.price || 0;
        // Solo filtrar por rango si se ha modificado
        if (minPrice > 0 || maxPrice < 5000) {
          matchesPrice = activity.is_free === false && activityPrice >= minPrice && activityPrice <= maxPrice;
        } else {
          matchesPrice = activity.is_free === false;
        }
      }
    }
    
    // Filtro por duración (solo para viajes y solo si se ha modificado el rango)
    let matchesDuration = true;
    if (isTravelSelected && isTravelActivity && activity.duration) {
      // Solo filtrar por duración si se ha modificado el rango (no está en 0-30 por defecto)
      if (minDuration > 0 || maxDuration < 30) {
        matchesDuration = activity.duration >= minDuration && activity.duration <= maxDuration;
      }
    }
    
    const matchesMine = !mineOnly || activity.profile_id === profile?.id;

    return matchesSearch && matchesType && matchesCity && matchesPrice && matchesDuration && matchesMine;
  });

  // Obtener listas únicas para los filtros
  const activityTypes = Array.from(new Set(activities.map(a => a.activity_type))).sort();
  const cities = Array.from(new Set(activities.map(a => a.city))).sort();

  const handleActivitySelect = (activity: Activity | { id: string; title: string; [key: string]: any }) => {
    console.log('🔗 Navegando a detalles de actividad:', activity.title, 'ID:', activity.id);
    navigate(`/dashboard/activities/${activity.id}`);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city]
    );
  };

  const clearActivityFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedCities([]);
    setPriceFilter('all');
    setMinPrice(0);
    setMaxPrice(5000);
    setMinDuration(0);
    setMaxDuration(30);
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    selectedTypes.length +
    selectedCities.length +
    (priceFilter !== 'all' ? 1 : 0);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">
            {mineOnly ? 'Mis actividades' : 'Actividades'}
          </h1>
          {userLocation && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-500">
              <MapPin className="h-4 w-4 shrink-0" />
              Cerca de {userLocation}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-stone-600">
          {filteredActivities.length} actividades
        </span>
        <button
          type="button"
          onClick={() => navigate('/dashboard/activities/create')}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          Crear
        </button>
      </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
        </div>
      )}

      {/* Vista según el modo seleccionado */}
      {viewMode === 'list' ? (
        <div className="p-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen */}
            {activity.images && activity.images.length > 0 ? (
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src={activity.images[0]}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 backdrop-blur-sm bg-opacity-90">
                    {activity.activity_type}
                  </span>
                  {activity.difficulty_level && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 backdrop-blur-sm bg-opacity-90">
                      {activity.difficulty_level}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative flex items-center justify-center">
                <Activity className="w-12 h-12 text-white opacity-50" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activity.activity_type}
                </span>
                {activity.difficulty_level && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {activity.difficulty_level}
                  </span>
                )}
              </div>
            </div>
            )}

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {activity.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3">
                {activity.description}
              </p>

              {/* Ubicación */}
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{activity.city}</span>
              </div>

              {/* Fecha y hora */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(activity.date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{activity.current_participants}/{activity.max_participants}</span>
                </div>
              </div>

              {/* Etiquetas */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Precio */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {activity.is_free ? 'Gratis' : `€${activity.price}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.is_free ? 'Actividad gratuita' : 'Precio por persona'}
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <button 
                onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
        </div>
        </div>
      ) : (
        <div className="relative h-[100dvh] min-h-[22rem] w-full">
          <ActivityMap
            activities={filteredActivities}
            onActivitySelect={handleActivitySelect}
            compact
            className="h-full w-full"
          />
          <MapOverlayHeader
            title={mineOnly ? 'Mis actividades' : 'Actividades'}
            subtitle={userLocation ? `Cerca de ${userLocation} · ${filteredActivities.length}` : `${filteredActivities.length} actividades`}
            action={
              <button
                type="button"
                onClick={() => navigate('/dashboard/activities/create')}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                Crear
              </button>
            }
          />
        </div>
      )}

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowFilters(true)}
        filterCount={activeFilterCount}
      />

      {viewMode === 'list' && filteredActivities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron actividades</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o crear una nueva actividad</p>
        </div>
      )}

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filtros" size="lg">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar actividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tipo de actividad ({selectedTypes.length} seleccionados)
            </label>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => {
                const selected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                      selected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ciudad ({selectedCities.length} seleccionadas)
            </label>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => {
                const selected = selectedCities.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(city)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                      selected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={clearActivityFilters}
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
    </div>
  );
};

export default ActivityList;
