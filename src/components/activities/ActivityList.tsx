import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Search, MapPin, Users, Calendar, Clock, Eye, Activity, Plus, Map, ArrowLeft } from 'lucide-react';
import ActivityMap from './ActivityMap';

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
  owner: {
    full_name: string;
    avatar_url?: string;
  };
}

const ActivityList: React.FC = () => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showSearchInMap, setShowSearchInMap] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
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
    
    // Filtro por tipo de actividad
    const matchesType = !selectedType || activity.activity_type === selectedType;
    
    // Filtro por ciudad
    const matchesCity = !selectedCity || activity.city === selectedCity;
    
    // Filtro por precio
    let matchesPrice = true;
    if (priceFilter === 'free') {
      matchesPrice = activity.is_free === true;
    } else if (priceFilter === 'paid') {
      matchesPrice = activity.is_free === false && (activity.price || 0) <= maxPrice;
    }
    
    return matchesSearch && matchesType && matchesCity && matchesPrice;
  });

  // Obtener listas únicas para los filtros
  const activityTypes = Array.from(new Set(activities.map(a => a.activity_type))).sort();
  const cities = Array.from(new Set(activities.map(a => a.city))).sort();

  const handleActivitySelect = (activity: Activity) => {
    console.log('🔗 Navegando a detalles de actividad:', activity.title, 'ID:', activity.id);
    navigate(`/activities/${activity.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-4 md:mx-8 lg:mx-16 xl:mx-24">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {/* Botón volver */}
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Volver</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
              {userLocation && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Cerca de: {userLocation} (50 km)
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/activities/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Actividad
          </button>
        </div>
        
        {/* Búsqueda - oculto en móvil cuando está en modo mapa */}
        <div className={`relative ${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${viewMode === 'map' ? 'hidden lg:grid' : 'grid'}`}>
          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Actividad
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Filtro por ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Filtro por precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="free">Gratis</option>
              <option value="paid">De pago</option>
            </select>
          </div>
        </div>

        {/* Slider de precio máximo - solo visible cuando se selecciona "De pago" */}
        {priceFilter === 'paid' && (
          <div className={`mt-4 ${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio máximo: €{maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>€0</span>
              <span>€200</span>
            </div>
          </div>
        )}

        {/* Botón para limpiar filtros */}
        {(selectedType || selectedCity || priceFilter !== 'all') && (
          <div className={`mt-4 ${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedCity('');
                setPriceFilter('all');
                setMaxPrice(100);
              }}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Botón de recargar */}
        <div className="mt-4">
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Recargar Actividades
          </button>
        </div>
      </div>

      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Search className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Map className="w-4 h-4" />
            Mapa
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold text-blue-600">{filteredActivities.length}</span> actividades
        </p>
      </div>

      {/* Vista según el modo seleccionado */}
      {viewMode === 'list' ? (
        /* Lista de actividades */
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
      ) : (
        /* Vista del mapa */
        <div className="relative">
          <ActivityMap 
            activities={filteredActivities}
            onActivitySelect={handleActivitySelect}
            className="w-full"
          />
          
          {/* Botón flotante para búsqueda en modo mapa - solo móvil */}
          <div className="lg:hidden absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={() => setShowSearchInMap(!showSearchInMap)}
              className="bg-white rounded-full shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Buscar</span>
              {searchTerm && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {filteredActivities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron actividades</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o crear una nueva actividad</p>
        </div>
      )}

      {/* Modal de búsqueda para móvil en modo mapa */}
      {viewMode === 'map' && showSearchInMap && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowSearchInMap(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Buscar Actividades</h3>
                <button
                  onClick={() => setShowSearchInMap(false)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSearchInMap(false)}
                className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
