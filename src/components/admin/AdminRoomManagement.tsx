import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  available_from: string;
  owner_name: string;
  created_at: string;
}

const AdminRoomManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchRooms();
    }
  }, [isAdmin]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🔍 AdminRoomManagement - Cargando habitaciones...');

      // Obtener todas las habitaciones - consulta simplificada con timeout
      console.log('🔍 AdminRoomManagement - Ejecutando consulta a property_listings...');
      
      const queryPromise = supabase
        .from('property_listings')
        .select('*')
        .eq('listing_type', 'room_rental')
        .order('created_at', { ascending: false });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La consulta tardó demasiado')), 10000)
      );
      
      const { data: listings, error: listingsError } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      console.log('🔍 AdminRoomManagement - Consulta completada, procesando resultados...');

      if (listingsError) {
        console.error('Error fetching rooms:', listingsError);
        throw listingsError;
      }

      console.log('📊 AdminRoomManagement - Listings obtenidos:', listings);

      // Obtener información de los propietarios
      const profileIds = listings?.map((listing: any) => listing.profile_id).filter(Boolean) || [];
      let profilesMap: { [key: string]: string } = {};

      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', profileIds);

        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError);
        } else {
          profilesMap = profiles?.reduce((acc: { [key: string]: string }, profile: any) => {
            acc[profile.id] = profile.full_name || 'Usuario';
            return acc;
          }, {}) || {};
        }
      }

      // Procesar los datos
      const processedRooms: Room[] = listings?.map((listing: any) => ({
        id: listing.id,
        title: listing.title || 'Sin título',
        description: listing.description || 'Sin descripción',
        price: listing.price || 0,
        location: listing.city || 'Sin ubicación',
        available_from: listing.available_from || 'No especificado',
        owner_name: profilesMap[listing.profile_id] || 'Propietario desconocido',
        created_at: listing.created_at
      })) || [];

      console.log('🎉 AdminRoomManagement - Habitaciones procesadas:', processedRooms);
      setRooms(processedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Error al cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      return;
    }

    try {
      // Eliminar de room_rental_requirements primero (si existe)
      const { error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .delete()
        .eq('listing_id', roomId);

      if (requirementsError) {
        console.warn('Error eliminando requisitos:', requirementsError);
      }

      // Eliminar de room_rental_images (si existe)
      const { error: imagesError } = await supabase
        .from('room_rental_images')
        .delete()
        .eq('listing_id', roomId);

      if (imagesError) {
        console.warn('Error eliminando imágenes:', imagesError);
      }

      // Eliminar el listing principal
      const { error: listingError } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', roomId);

      if (listingError) {
        console.error('Error eliminando listing:', listingError);
        throw listingError;
      }

      // Actualizar la lista local
      setRooms(rooms.filter(room => room.id !== roomId));
      console.log('✅ Habitación eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando habitación:', error);
      setError('Error al eliminar la habitación');
    }
  };

  const handleEditRoom = (roomId: string) => {
    navigate(`/dashboard/rooms/${roomId}/edit`);
  };

  const handleViewRoom = (roomId: string) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

  const handleCreateRoom = () => {
    navigate('/dashboard/rooms/create');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos de administrador para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administración de Habitaciones</h1>
              <p className="text-gray-600 mt-2">Gestiona todas las habitaciones publicadas en la plataforma</p>
            </div>
            <button
              onClick={handleCreateRoom}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Habitación
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Habitaciones</h3>
            <p className="text-3xl font-bold text-blue-600">{rooms.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Precio Promedio</h3>
            <p className="text-3xl font-bold text-green-600">
              {rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length) : 0}€
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Esta Semana</h3>
            <p className="text-3xl font-bold text-purple-600">
              {rooms.filter(room => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(room.created_at) > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Habitaciones</h2>
          </div>
          
          {rooms.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay habitaciones registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Habitación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{room.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{room.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.owner_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.price}€/mes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(room.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRoom(room.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditRoom(room.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default AdminRoomManagement;
