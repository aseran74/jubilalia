import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  CalendarIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  city: string;
  location: string;
  max_participants: number;
  current_participants: number | null;
  price: number | null;
  is_free: boolean | null;
  is_active: boolean | null;
  created_at: string;
  owner_name: string;
}

const AdminActivityManagement: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      fetchActivities();
    }
  }, [isAdmin, filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('🔍 AdminActivityManagement - Cargando actividades...');

      // Obtener todas las actividades
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }

      console.log('🔍 AdminActivityManagement - Actividades obtenidas:', activitiesData?.length || 0);

      if (!activitiesData || activitiesData.length === 0) {
        setActivities([]);
        return;
      }

      // Obtener todos los profile_ids únicos
      const profileIds = [...new Set(activitiesData.map(a => a.profile_id).filter(Boolean))];
      
      // Obtener los perfiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Crear un mapa de perfiles
      const profilesMap = new Map<string, string>();
      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.id, profile.full_name || 'Usuario sin nombre');
      });

      const transformedActivities = activitiesData.map((activity: any) => ({
        ...activity,
        owner_name: profilesMap.get(activity.profile_id) || 'Organizador desconocido'
      }));

      console.log('🎉 AdminActivityManagement - Actividades procesadas:', transformedActivities.length);
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      alert('Error al cargar las actividades. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

    try {
      // Eliminar imágenes primero
      const { error: imagesError } = await supabase
        .from('activity_images')
        .delete()
        .eq('activity_id', activityId);

      if (imagesError) {
        console.error('Error deleting images:', imagesError);
      }

      // Eliminar participantes
      const { error: participantsError } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId);

      if (participantsError) {
        console.error('Error deleting participants:', participantsError);
      }

      // Eliminar la actividad
      const { error: activityError } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (activityError) {
        console.error('Error deleting activity:', activityError);
        alert('Error al eliminar la actividad');
        return;
      }

      // Actualizar la lista
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      alert('Actividad eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la actividad');
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedActivities.size === 0) {
      alert('Por favor, selecciona al menos una actividad para eliminar');
      return;
    }

    const count = selectedActivities.size;
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${count} ${count === 1 ? 'actividad' : 'actividades'}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const activityIds = Array.from(selectedActivities);
      
      // Eliminar imágenes primero
      const { error: imagesError } = await supabase
        .from('activity_images')
        .delete()
        .in('activity_id', activityIds);

      if (imagesError) {
        console.error('Error deleting images:', imagesError);
      }

      // Eliminar participantes
      const { error: participantsError } = await supabase
        .from('activity_participants')
        .delete()
        .in('activity_id', activityIds);

      if (participantsError) {
        console.error('Error deleting participants:', participantsError);
      }

      // Eliminar las actividades
      const { error: activityError } = await supabase
        .from('activities')
        .delete()
        .in('id', activityIds);

      if (activityError) {
        console.error('Error deleting activities:', activityError);
        alert('Error al eliminar las actividades');
        return;
      }

      // Actualizar la lista y limpiar selección
      setActivities(prev => prev.filter(activity => !selectedActivities.has(activity.id)));
      setSelectedActivities(new Set());
      alert(`${count} ${count === 1 ? 'actividad eliminada' : 'actividades eliminadas'} exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar las actividades');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedActivities(new Set(filteredActivities.map(a => a.id)));
    } else {
      setSelectedActivities(new Set());
    }
  };

  const handleSelectActivity = (activityId: string, checked: boolean) => {
    const newSelected = new Set(selectedActivities);
    if (checked) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedActivities(newSelected);
  };

  // Resetear selección cuando cambia el filtro
  useEffect(() => {
    setSelectedActivities(new Set());
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number | null, isFree: boolean | null) => {
    if (isFree) return 'Gratis';
    if (!price) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-red-600" />
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

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => 
        filter === 'active' ? a.is_active === true : a.is_active === false
      );

  const isAllSelected = filteredActivities.length > 0 && 
    filteredActivities.every(a => selectedActivities.has(a.id));
  const isIndeterminate = selectedActivities.size > 0 && 
    selectedActivities.size < filteredActivities.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Actividades</h1>
            <p className="text-gray-600 mt-1">Administra todas las actividades publicadas</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard/activities/create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nueva Actividad
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actividades Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.is_active === true).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actividades Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.is_active === false).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actividades</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
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
            Todas
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactivas
          </button>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Actividades ({filteredActivities.length})
          </h2>
          {selectedActivities.size > 0 && (
            <button
              onClick={handleDeleteMultiple}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              {isDeleting ? 'Eliminando...' : `Eliminar ${selectedActivities.size} ${selectedActivities.size === 1 ? 'seleccionada' : 'seleccionadas'}`}
            </button>
          )}
        </div>
        
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
            <p className="text-gray-500">No se encontraron actividades con los filtros seleccionados</p>
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
                      title={isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizador
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
                {filteredActivities.map((activity) => (
                  <tr 
                    key={activity.id} 
                    className={`hover:bg-gray-50 ${selectedActivities.has(activity.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedActivities.has(activity.id)}
                        onChange={(e) => handleSelectActivity(activity.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {activity.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {activity.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {activity.activity_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(activity.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.city}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {activity.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(activity.price, activity.is_free)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.current_participants || 0} / {activity.max_participants}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.owner_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/activities/${activity.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
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

export default AdminActivityManagement;


