import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Users, Calendar, Clock, Eye, Activity, Plus, Map, Menu, X } from 'lucide-react';
import ActivityMap from './ActivityMap';
import { useAuth } from '../../hooks/useAuth';
import DashboardSidebar from '../dashboard/DashboardSidebar';

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

const ActivityListWithSidebar: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { } = useAuth();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          console.error('❌ No hay conexión a Supabase');
          return;
        }
      } catch (connectionError) {
        console.error('❌ Error verificando conexión:', connectionError);
        return;
      }

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_profile_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching activities:', error);
        throw error;
      }

      console.log('✅ Actividades obtenidas:', data?.length || 0);
      
      // Transformar los datos para incluir owner
      const activitiesData = data?.map(activity => ({
        ...activity,
        owner: activity.profiles ? {
          full_name: activity.profiles.full_name,
          avatar_url: activity.profiles.avatar_url
        } : {
          full_name: 'Usuario desconocido',
          avatar_url: null
        }
      })) || [];

      setActivities(activitiesData);
    } catch (error) {
      console.error('❌ Error en fetchActivities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        bg-white border-r border-gray-200 transition-all duration-300
        ${isMobile 
          ? `fixed top-0 left-0 h-full z-50 transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } w-80`
          : 'relative w-64'
        }
      `}>
        <DashboardSidebar />
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 mx-4 md:mx-8 lg:mx-16 xl:mx-24">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
                <button
                  onClick={() => navigate('/dashboard/activities/create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Actividad
                </button>
              </div>
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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

            {/* Contenido según vista */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleActivitySelect(activity)}
                  >
                    {/* Imagen */}
                    {activity.images && activity.images.length > 0 ? (
                      <div className="h-48 bg-gray-200 relative">
                        <img
                          src={activity.images[0]}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Activity className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {activity.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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
                        <span className="text-lg font-bold text-green-600">
                          {activity.is_free ? 'Gratis' : `€${activity.price}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {activity.difficulty_level}
                        </span>
                      </div>

                      {/* Botón de acción */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivitySelect(activity);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityMap activities={filteredActivities} onActivitySelect={handleActivitySelect} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityListWithSidebar;
