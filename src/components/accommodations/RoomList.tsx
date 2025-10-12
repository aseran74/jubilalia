import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import RoomCard from './RoomCard';
import { supabase } from '../../lib/supabase';
import PriceRangeSlider from '../common/PriceRangeSlider';

interface Room {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price_per_month: number;
  room_area: number;
  private_bathroom: boolean;
  has_balcony: boolean;
  preferred_gender: 'any' | 'male' | 'female';
  preferred_age_min: number;
  preferred_age_max: number;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  pet_types?: string[];
  images: string[];
  owner: {
    full_name: string;
    avatar_url?: string;
  };
  created_at: string;
  rating?: number;
  review_count?: number;
}

interface RoomListProps {
  rooms?: Room[];
}

const RoomList: React.FC<RoomListProps> = ({ rooms: propRooms }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [filters, setFilters] = useState({
    privateBathroom: false,
    hasBalcony: false,
    smokingAllowed: false,
    petsAllowed: false,
    gender: 'male' as string
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Función para cargar datos reales de Supabase
  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando habitaciones desde Supabase...');

      // Obtener listings de habitaciones
      const { data: listingsData, error: listingsError } = await supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          address,
          city,
          postal_code,
          price,
          created_at,
          profile_id,
          is_available
        `)
        .eq('listing_type', 'room_rental')
        .eq('is_available', true);

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      console.log('📊 Listings obtenidos:', listingsData);

      // Obtener requisitos para cada listing
      const roomsWithDetails = await Promise.all(
        listingsData.map(async (listing) => {
          const { data: requirementsData, error: requirementsError } = await supabase
            .from('room_rental_requirements')
            .select('*')
            .eq('listing_id', listing.id)
            .single();

          if (requirementsError) {
            console.error('Error fetching requirements for listing', listing.id, requirementsError);
            return null;
          }

          // Obtener perfil del propietario
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', listing.profile_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile for listing', listing.id, profileError);
          }

          // Obtener imágenes
          const { data: imagesData, error: imagesError } = await supabase
            .from('property_images')
            .select('image_url')
            .eq('listing_id', listing.id)
            .order('order_index', { ascending: true });

          if (imagesError) {
            console.error('Error fetching images for listing', listing.id, imagesError);
          }

          return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            address: listing.address,
            city: listing.city,
            price_per_month: listing.price,
            room_area: requirementsData.room_area,
            private_bathroom: requirementsData.private_bathroom,
            has_balcony: requirementsData.has_balcony,
            preferred_gender: requirementsData.preferred_gender,
            preferred_age_min: requirementsData.preferred_age_min,
            preferred_age_max: requirementsData.preferred_age_max,
            smoking_allowed: requirementsData.smoking_allowed,
            pets_allowed: requirementsData.pets_allowed,
            pet_types: requirementsData.pet_types || [],
            images: imagesData?.map(img => img.image_url) || [],
            owner: {
              full_name: profileData?.full_name || 'Propietario',
              avatar_url: profileData?.avatar_url
            },
            created_at: listing.created_at,
            rating: 4.5, // Mock rating por ahora
            review_count: 0
          };
        })
      );

      const validRooms = roomsWithDetails.filter(room => room !== null);
      console.log('🎉 Habitaciones procesadas:', validRooms);
      setRooms(validRooms);

    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando el componente se monte
  useEffect(() => {
    if (propRooms) {
      setRooms(propRooms);
      setLoading(false);
    } else {
      fetchRooms();
    }
  }, [propRooms]);

  const handleFavorite = async (roomId: string) => {
    // Aquí iría la lógica para marcar como favorito
    console.log('Habitación marcada como favorita:', roomId);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || room.city === selectedCity;
    
    const matchesPrice = (priceRange.min === 0 || room.price_per_month >= priceRange.min) && 
                        (priceRange.max === 0 || room.price_per_month <= priceRange.max);
    
    const matchesFilters = (!filters.privateBathroom || room.private_bathroom) &&
                          (!filters.hasBalcony || room.has_balcony) &&
                          (!filters.smokingAllowed || room.smoking_allowed) &&
                          (!filters.petsAllowed || room.pets_allowed) &&
                          (room.preferred_gender === filters.gender || room.preferred_gender === 'any');

    return matchesSearch && matchesCity && matchesPrice && matchesFilters;
  });

  const cities = [...new Set(rooms.map(room => room.city))];


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Habitaciones Disponibles</h1>
              <p className="text-gray-600 mt-2">Encuentra tu hogar ideal para la jubilación</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/rooms/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Publicar Habitación
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar habitaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Ciudad */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Botón de filtros avanzados */}
            <button 
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Más filtros
            </button>
          </div>

          {/* Filtros adicionales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.privateBathroom}
                onChange={(e) => setFilters(prev => ({ ...prev, privateBathroom: e.target.checked }))}
                className="mr-2"
              />
              Baño privado
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasBalcony}
                onChange={(e) => setFilters(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                className="mr-2"
              />
              Balcón
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.smokingAllowed}
                onChange={(e) => setFilters(prev => ({ ...prev, smokingAllowed: e.target.checked }))}
                className="mr-2"
              />
              Fumar permitido
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.petsAllowed}
                onChange={(e) => setFilters(prev => ({ ...prev, petsAllowed: e.target.checked }))}
                className="mr-2"
              />
              Mascotas permitidas
            </label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="male">Soy un hombre</option>
              <option value="female">Soy una mujer</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando {filteredRooms.length} de {rooms.length} habitaciones
          </p>
        </div>

        {/* Lista de habitaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onFavorite={handleFavorite}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron habitaciones</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Filtros Avanzados */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-2xl font-bold text-gray-900">Filtros Avanzados</h2>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Rango de Precio (€/mes)
                </label>
                <PriceRangeSlider
                  min={0}
                  max={2000}
                  value={priceRange}
                  onChange={setPriceRange}
                  step={50}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Características de la Habitación
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.privateBathroom}
                      onChange={(e) => setFilters(prev => ({ ...prev, privateBathroom: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    Baño privado
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasBalcony}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    Balcón
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.smokingAllowed}
                      onChange={(e) => setFilters(prev => ({ ...prev, smokingAllowed: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    Fumar permitido
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.petsAllowed}
                      onChange={(e) => setFilters(prev => ({ ...prev, petsAllowed: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    Mascotas permitidas
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Género
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="male">Soy un hombre</option>
                  <option value="female">Soy una mujer</option>
                </select>
              </div>
            </div>
          
            {/* Footer del Modal */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setPriceRange({ min: 0, max: 2000 });
                  setFilters({
                    privateBathroom: false,
                    hasBalcony: false,
                    smokingAllowed: false,
                    petsAllowed: false,
                    gender: 'male'
                  });
                }}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;