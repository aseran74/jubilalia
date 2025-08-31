import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Users, Calendar, Clock, Heart, Eye, Activity, Plus } from 'lucide-react';

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetch de actividades...');
      
      // CONSULTA MUY SIMPLE PARA DEBUG
      console.log('🔍 Haciendo consulta básica...');
      const { data, error } = await supabase
        .from('activities')
        .select('*');

      console.log('📊 Resultado de consulta básica:', {
        count: data?.length || 0,
        data: data,
        error: error
      });

      if (error) {
        console.error('❌ Error en consulta básica:', error);
        setActivities([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No se encontraron actividades en consulta básica');
        setActivities([]);
        setLoading(false);
        return;
      }

      // Usar los datos básicos por ahora
      const activitiesWithBasicInfo = data.map(activity => ({
        ...activity,
        images: [],
        owner: { full_name: 'Usuario', avatar_url: undefined }
      }));

      console.log('🎉 Actividades procesadas:', activitiesWithBasicInfo.length);
      setActivities(activitiesWithBasicInfo);

    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold text-blue-600">{filteredActivities.length}</span> actividades
        </p>
      </div>

      {/* Lista de actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen */}
            <div className="h-48 bg-gray-200 relative">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Activity className="w-12 h-12" />
              </div>
              
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

      {filteredActivities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron actividades</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o crear una nueva actividad</p>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
