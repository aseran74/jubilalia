import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import RoomCard from './RoomCard';
import { supabase } from '../../lib/supabase';
import PriceRangeSlider from '../common/PriceRangeSlider';
import MapViewControls, { MapOverlayHeader, CreateListingButton } from '../common/MapViewControls';
import ListingsMap from '../maps/ListingsMap';

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
  latitude?: number | null;
  longitude?: number | null;
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
          latitude,
          longitude,
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
            review_count: 0,
            latitude: listing.latitude,
            longitude: listing.longitude
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

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedCity ? 1 : 0) +
    (priceRange.min !== 0 || priceRange.max !== 2000 ? 1 : 0) +
    (filters.privateBathroom ? 1 : 0) +
    (filters.hasBalcony ? 1 : 0) +
    (filters.smokingAllowed ? 1 : 0) +
    (filters.petsAllowed ? 1 : 0);

  const createRoom = () => navigate('/dashboard/rooms/create');

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">Habitaciones</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {filteredRooms.length} anuncios
          </p>
        </div>
        <CreateListingButton onClick={createRoom} label="Crear anuncio de habitación" />
      </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
        </div>
      )}

      {viewMode === 'map' ? (
        <div className="relative h-[100dvh] min-h-[22rem] w-full">
          <ListingsMap
            items={filteredRooms.map((room) => ({
              id: room.id,
              title: room.title,
              city: room.city,
              address: room.address,
              latitude: room.latitude,
              longitude: room.longitude,
              price: room.price_per_month,
              imageUrl: room.images?.[0],
            }))}
            onSelect={(item) => navigate(`/dashboard/rooms/${item.id}`)}
            actionLabel="Ver habitación"
            markerLetter="H"
            compact
            className="h-full w-full"
          />
          <MapOverlayHeader
            title="Habitaciones"
            subtitle={`${filteredRooms.length} anuncios`}
            action={<CreateListingButton onClick={createRoom} label="Crear anuncio de habitación" />}
          />
        </div>
      ) : (
        <div className="p-4 pb-32">
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
      )}

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowAdvancedFilters(true)}
        filterCount={activeFilterCount}
      />


      {/* Modal de Filtros Avanzados */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50 p-4">
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar habitaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Ciudad</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

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
                  setSearchTerm('');
                  setSelectedCity('');
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