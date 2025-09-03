import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import RoomCard from './RoomCard';
import { supabase } from '../../lib/supabase';

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [filters, setFilters] = useState({
    privateBathroom: false,
    hasBalcony: false,
    smokingAllowed: false,
    petsAllowed: false,
    gender: 'any' as string
  });

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
            .order('image_order');

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

  // Mock data para demostración - en producción esto vendría de la API
  const mockRooms: Room[] = [
    {
      id: '1',
      title: 'Habitación luminosa en piso céntrico',
      description: 'Hermosa habitación en un piso completamente reformado, ubicado en el centro de Madrid. La habitación cuenta con mucha luz natural, armario empotrado y escritorio.',
      address: 'Calle Gran Vía 123',
      city: 'Madrid',
      price_per_month: 450,
      room_area: 18,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['perros pequeños', 'gatos'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop'
      ],
      owner: {
        full_name: 'María García',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      created_at: '2024-01-15T10:00:00Z',
      rating: 4.9,
      review_count: 8
    },
    {
      id: '2',
      title: 'Habitación tranquila con jardín',
      description: 'Habitación espaciosa en casa unifamiliar con jardín privado. Ideal para personas que buscan tranquilidad y contacto con la naturaleza.',
      address: 'Calle de la Paz 45',
      city: 'Barcelona',
      price_per_month: 380,
      room_area: 20,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 80,
      smoking_allowed: false,
      pets_allowed: false,
      images: [
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop'
      ],
      owner: {
        full_name: 'Juan López'
      },
      created_at: '2024-01-20T10:00:00Z',
      rating: 4.7,
      review_count: 5
    },
    {
      id: '3',
      title: 'Habitación moderna en residencia',
      description: 'Habitación completamente equipada en residencia de lujo con servicios incluidos. Incluye limpieza semanal y acceso a gimnasio.',
      address: 'Avenida del Puerto 67',
      city: 'Valencia',
      price_per_month: 520,
      room_area: 16,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: false,
      pets_allowed: false,
      images: [
        'https://images.unsplash.com/photo-1560448075-8b5b0b0b0b0b?w=800&h=600&fit=crop'
      ],
      owner: {
        full_name: 'Ana Martínez'
      },
      created_at: '2024-01-25T10:00:00Z',
      rating: 4.8,
      review_count: 12
    },
    {
      id: '4',
      title: 'Habitación con balcón y vistas',
      description: 'Habitación con balcón privado y vistas espectaculares a la ciudad. Ubicada en un piso alto con mucha luz natural.',
      address: 'Calle Sierpes 89',
      city: 'Sevilla',
      price_per_month: 420,
      room_area: 19,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'female',
      preferred_age_min: 58,
      preferred_age_max: 78,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['gatos'],
      images: [
        'https://images.unsplash.com/photo-1560448204-8b5b0b0b0b0b?w=800&h=600&fit=crop'
      ],
      owner: {
        full_name: 'Carlos Rodríguez'
      },
      created_at: '2024-01-30T10:00:00Z',
      rating: 4.6,
      review_count: 6
    },
    {
      id: '5',
      title: 'Habitación en chalet con montaña',
      description: 'Habitación en chalet independiente con vistas a la montaña. Perfecta para amantes de la naturaleza y el senderismo.',
      address: 'Camino de la Sierra 12',
      city: 'Málaga',
      price_per_month: 350,
      room_area: 22,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 85,
      smoking_allowed: true,
      pets_allowed: true,
      pet_types: ['perros', 'gatos'],
      images: [
        'https://images.unsplash.com/photo-1560448075-9b5b0b0b0b0b?w=800&h=600&fit=crop'
      ],
      owner: {
        full_name: 'Lucía González'
      },
      created_at: '2024-02-01T10:00:00Z',
      rating: 4.5,
      review_count: 4
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setRooms(propRooms || mockRooms);
      setLoading(false);
    }, 1000);
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
    
    const matchesPrice = room.price_per_month >= priceRange[0] && room.price_per_month <= priceRange[1];
    
    const matchesFilters = (!filters.privateBathroom || room.private_bathroom) &&
                          (!filters.hasBalcony || room.has_balcony) &&
                          (!filters.smokingAllowed || room.smoking_allowed) &&
                          (!filters.petsAllowed || room.pets_allowed) &&
                          (filters.gender === 'any' || room.preferred_gender === filters.gender);

    return matchesSearch && matchesCity && matchesPrice && matchesFilters;
  });

  const cities = Array.from(new Set(rooms.map(room => room.city)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Encuentra tu Habitación Ideal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre habitaciones perfectas para compartir vivienda y crear nuevas amistades
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/rooms/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Publicar Habitación
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Rango de precio */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Botón de filtros avanzados */}
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Search className="w-5 h-5 mr-2" />
              Filtros
            </button>
          </div>

          {/* Filtros adicionales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.privateBathroom}
                onChange={(e) => setFilters({...filters, privateBathroom: e.target.checked})}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Baño propio</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hasBalcony}
                onChange={(e) => setFilters({...filters, hasBalcony: e.target.checked})}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Balcón</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.smokingAllowed}
                onChange={(e) => setFilters({...filters, smokingAllowed: e.target.checked})}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Fumadores</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.petsAllowed}
                onChange={(e) => setFilters({...filters, petsAllowed: e.target.checked})}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Mascotas</span>
            </label>
            
            <select
              value={filters.gender}
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="any">Cualquier género</option>
              <option value="male">Solo hombres</option>
              <option value="female">Solo mujeres</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredRooms.length} habitación{filteredRooms.length !== 1 ? 'es' : ''} encontrada{filteredRooms.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm">
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="date">Más recientes</option>
                <option value="rating">Mejor valoradas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de habitaciones */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onFavorite={handleFavorite}
                isFavorite={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron habitaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o la búsqueda para encontrar más opciones
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setPriceRange([0, 1000]);
                setFilters({
                  privateBathroom: false,
                  hasBalcony: false,
                  smokingAllowed: false,
                  petsAllowed: false,
                  gender: 'any'
                });
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Paginación */}
        {filteredRooms.length > 0 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-2 bg-green-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
