import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import AdminButtons from '../common/AdminButtons';
import { Search, MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Map } from 'lucide-react';

interface Room {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available_from: string;
  room_requirements: {
    bed_type: string;
    room_area: number;
    private_bathroom: boolean;
    has_balcony: boolean;
    preferred_gender: string;
    preferred_age_min: number;
    preferred_age_max: number;
    smoking_allowed: boolean;
    pets_allowed: boolean;
    pet_types?: string[];
  };
  owner: {
    full_name: string;
    avatar_url?: string;
  };
  images: string[];
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [genderFilter, setGenderFilter] = useState('');
  const [petsFilter, setPetsFilter] = useState<boolean | null>(null);
  const [smokingFilter, setSmokingFilter] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const { isAdmin, profile } = useAuth();

  // Debug: verificar si isAdmin se está obteniendo correctamente
  console.log('🔍 RoomList - isAdmin:', isAdmin, 'type:', typeof isAdmin);
  console.log('🔍 RoomList - profile:', profile);
  console.log('🔍 RoomList - profile.is_admin:', profile?.is_admin);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetch de habitaciones...');
      
      // Obtener habitaciones con sus requisitos y propietarios
      const { data: roomsData, error } = await supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          address,
          city,
          price,
          available_from,
          profile_id,
          listing_type,
          is_available
        `)
        .eq('listing_type', 'room_rental')
        .eq('is_available', true);

      console.log('📊 Datos de habitaciones obtenidos:', {
        count: roomsData?.length || 0,
        data: roomsData,
        error: error
      });

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      // Obtener los requisitos de las habitaciones por separado
      const roomIds = roomsData?.map(room => room.id) || [];
      console.log('🆔 IDs de habitaciones encontrados:', roomIds);
      
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .select('*')
        .in('listing_id', roomIds);

      console.log('📋 Datos de requisitos obtenidos:', {
        count: requirementsData?.length || 0,
        data: requirementsData,
        error: requirementsError
      });

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
        return;
      }

      // Obtener los perfiles de los propietarios
      const profileIds = roomsData?.map(room => room.profile_id).filter(Boolean) || [];
      console.log('👤 IDs de perfiles encontrados:', profileIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', profileIds);

      console.log('👤 Datos de perfiles obtenidos:', {
        count: profilesData?.length || 0,
        data: profilesData,
        error: profilesError
      });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Obtener las imágenes
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('listing_id, image_url')
        .in('listing_id', roomIds);

      console.log('🖼️ Datos de imágenes obtenidos:', {
        count: imagesData?.length || 0,
        data: imagesData,
        error: imagesError
      });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      // Crear un mapa de requisitos por listing_id
      const requirementsMap = new (globalThis as any).Map();
      requirementsData?.forEach(req => {
        requirementsMap.set(req.listing_id, req);
      });

      // Crear un mapa de perfiles por id
      const profilesMap = new (globalThis as any).Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Crear un mapa de imágenes por listing_id
      const imagesMap = new (globalThis as any).Map();
      imagesData?.forEach(img => {
        if (!imagesMap.has(img.listing_id)) {
          imagesMap.set(img.listing_id, []);
        }
        imagesMap.get(img.listing_id).push(img.image_url);
      });

      // Transformar los datos para que sean más fáciles de usar
      const transformedRooms = roomsData?.map(room => ({
        id: room.id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        price: room.price,
        available_from: room.available_from,
        room_requirements: requirementsMap.get(room.id) || {},
        owner: profilesMap.get(room.profile_id) || { full_name: 'Propietario' },
        images: imagesMap.get(room.id) || []
      })) || [];

      console.log('🔄 Habitaciones transformadas:', {
        count: transformedRooms.length,
        rooms: transformedRooms
      });

      setRooms(transformedRooms);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('room_rental_listings')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting room:', error);
        alert('Error al eliminar la habitación');
        return;
      }

      alert('Habitación eliminada correctamente');
      // Actualizar la lista de habitaciones
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error al eliminar la habitación');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || room.city === selectedCity;
    
    const matchesPrice = room.price >= priceRange.min && room.price <= priceRange.max;
    
    const matchesGender = !genderFilter || room.room_requirements.preferred_gender === genderFilter || room.room_requirements.preferred_gender === 'any';
    
    const matchesPets = petsFilter === null || room.room_requirements.pets_allowed === petsFilter;
    
    const matchesSmoking = smokingFilter === null || room.room_requirements.smoking_allowed === smokingFilter;

    const isMatch = matchesSearch && matchesCity && matchesPrice && matchesGender && matchesPets && matchesSmoking;
    
    if (!isMatch) {
      console.log('❌ Habitación filtrada:', {
        id: room.id,
        title: room.title,
        city: room.city,
        price: room.price,
        filters: {
          search: matchesSearch,
          city: matchesCity,
          price: matchesPrice,
          gender: matchesGender,
          pets: matchesPets,
          smoking: matchesSmoking
        }
      });
    }

    return isMatch;
  });

  console.log('🔍 Filtrado aplicado:', {
    total: rooms.length,
    filtered: filteredRooms.length,
    searchTerm,
    selectedCity,
    priceRange,
    genderFilter,
    petsFilter,
    smokingFilter
  });

  const cities = [...new Set(rooms.map(room => room.city))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'any': 'Cualquier género',
      'male': 'Solo hombres',
      'female': 'Solo mujeres'
    };
    return labels[gender] || gender;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Habitaciones Disponibles</h1>
            <p className="text-gray-600 mt-1">Encuentra tu habitación ideal</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/rooms/map')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Ver en Mapa
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/rooms/create')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Bed className="w-4 h-4" />
                Crear Habitación
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h2>
          <button
            onClick={fetchRooms}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Recargar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar habitaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de ciudad */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Filtro de precio */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min/€"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max/€"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtros adicionales */}
          <div className="flex space-x-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Cualquier género</option>
              <option value="male">Solo hombres</option>
              <option value="female">Solo mujeres</option>
              <option value="any">Cualquier género</option>
            </select>
          </div>
        </div>

        {/* Filtros de checkboxes */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={petsFilter === true}
              onChange={(e) => setPetsFilter(e.target.checked ? true : null)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Mascotas permitidas</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={smokingFilter === true}
              onChange={(e) => setSmokingFilter(e.target.checked ? true : null)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Fumadores permitidos</span>
          </label>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold text-green-600">{filteredRooms.length}</span> habitaciones
        </p>
      </div>

      {/* Lista de habitaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen */}
            <div className="h-48 bg-gray-200 relative">
              {room.images && room.images.length > 0 ? (
                <img
                  src={room.images[0]}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Bed className="w-12 h-12" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.room_requirements.preferred_gender === 'any' 
                    ? 'bg-blue-100 text-blue-800' 
                    : room.room_requirements.preferred_gender === 'male'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {getGenderLabel(room.room_requirements.preferred_gender)}
                </span>
                
                {room.room_requirements.pets_allowed && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Mascotas
                  </span>
                )}
              </div>

              {/* Botón de favorito */}
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {room.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {room.description}
              </p>

              {/* Ubicación */}
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{room.city}</span>
              </div>

              {/* Características */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span className="capitalize">{room.room_requirements.bed_type}</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{room.room_requirements.room_area}m²</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{room.room_requirements.private_bathroom ? 'Privado' : 'Compartido'}</span>
                </div>
              </div>

              {/* Precio y disponibilidad */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(room.price)}
                  </div>
                  <div className="text-sm text-gray-500">por mes</div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Disponible desde</div>
                  <div className="font-medium">{formatDate(room.available_from)}</div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Botones de administrador - DEBUG */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                  DEBUG: isAdmin = {String(isAdmin)} (tipo: {typeof isAdmin})
                </div>
                {isAdmin === true && (
                  <div>
                    <div className="text-xs text-green-600 mb-2">✅ Usuario es administrador</div>
                    <AdminButtons 
                      itemId={room.id}
                      itemType="room"
                      onDelete={handleDeleteRoom}
                    />
                  </div>
                )}
                {isAdmin !== true && (
                  <div className="text-xs text-red-600">
                    ❌ Usuario NO es administrador (valor: {String(isAdmin)})
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron habitaciones</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default RoomList;
