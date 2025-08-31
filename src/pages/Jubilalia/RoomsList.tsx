import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Euro, Users, Calendar } from 'lucide-react';
import RoomCard from '../../components/properties/RoomCard';
import { supabase } from '../../lib/supabase';
import type { PropertyListing } from '../../types/properties';

const RoomsList: React.FC = () => {
  const [rooms, setRooms] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [genderPreference, setGenderPreference] = useState('');
  const [petsAllowed, setPetsAllowed] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Ciudades disponibles
  const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Toledo', 'Granada', 'Salamanca', 'Bilbao', 'Málaga', 'Zaragoza', 'Oviedo', 'Córdoba', 'San Sebastián', 'Pamplona', 'Santiago de Compostela', 'Vitoria-Gasteiz', 'Alicante'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('property_listings')
        .select(`
          *,
          room_rental_requirements (*),
          property_images (*),
          property_amenities (*)
        `)
        .eq('listing_type', 'room_rental')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      // Transformar los datos al formato esperado
      const transformedRooms: PropertyListing[] = data.map((listing: any) => ({
        listing: {
          id: listing.id,
          listing_type: listing.listing_type,
          title: listing.title,
          description: listing.description,
          property_type: listing.property_type,
          address: listing.address,
          city: listing.city,
          postal_code: listing.postal_code,
          country: listing.country,
          price: listing.price,
          price_type: listing.price_type,
          currency: listing.currency,
          available_from: listing.available_from,
          user_id: listing.user_id,
          profile_id: listing.profile_id,
          status: listing.status,
          created_at: listing.created_at,
          updated_at: listing.updated_at
        },
        roomRequirements: listing.room_rental_requirements?.[0] || null,
        images: listing.property_images || [],
        amenities: listing.property_amenities?.map((a: any) => a.amenity_name) || []
      }));

      setRooms(transformedRooms);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    // Filtro de búsqueda por texto
    if (searchTerm && !room.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !room.listing.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !room.listing.city.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro por ciudad
    if (selectedCity && room.listing.city !== selectedCity) {
      return false;
    }

    // Filtro por rango de precio
    if (priceRange.min && room.listing.price && room.listing.price < parseFloat(priceRange.min)) {
      return false;
    }
    if (priceRange.max && room.listing.price && room.listing.price > parseFloat(priceRange.max)) {
      return false;
    }

    // Filtro por preferencia de género
    if (genderPreference && room.roomRequirements?.preferred_gender !== 'any' && 
        room.roomRequirements?.preferred_gender !== genderPreference) {
      return false;
    }

    // Filtro por mascotas
    if (petsAllowed === 'yes' && !room.roomRequirements?.pets_allowed) {
      return false;
    }
    if (petsAllowed === 'no' && room.roomRequirements?.pets_allowed) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setPriceRange({ min: '', max: '' });
    setGenderPreference('');
    setPetsAllowed('');
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Habitaciones Disponibles
              </h1>
              <p className="text-lg text-gray-600">
                Encuentra tu compañero de habitación ideal
              </p>
            </div>
            
            <Link
              to="/properties/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Publicar Habitación</span>
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                  <p className="text-sm text-gray-600">Habitaciones</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(rooms.reduce((acc, room) => acc + (room.listing.price || 0), 0) / rooms.length)}€
                  </p>
                  <p className="text-sm text-gray-600">Precio promedio</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {cities.length}
                  </p>
                  <p className="text-sm text-gray-600">Ciudades</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.filter(room => room.listing.available_from).length}
                  </p>
                  <p className="text-sm text-gray-600">Disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar habitaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
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

                {/* Rango de precio mínimo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
                  <input
                    type="number"
                    placeholder="0€"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Rango de precio máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
                  <input
                    type="number"
                    placeholder="1000€"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Preferencia de género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquier género</option>
                    <option value="female">Solo mujeres</option>
                    <option value="male">Solo hombres</option>
                  </select>
                </div>

                {/* Mascotas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mascotas</label>
                  <select
                    value={petsAllowed}
                    onChange={(e) => setPetsAllowed(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquier opción</option>
                    <option value="yes">Solo con mascotas</option>
                    <option value="no">Sin mascotas</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              {filteredRooms.length} habitación{filteredRooms.length !== 1 ? 'es' : ''} encontrada{filteredRooms.length !== 1 ? 's' : ''}
            </p>
            
            {filteredRooms.length > 0 && (
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="recent">Más recientes</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="area">Por superficie</option>
              </select>
            )}
          </div>
        </div>

        {/* Grid de habitaciones */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.listing.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron habitaciones</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCity || priceRange.min || priceRange.max || genderPreference || petsAllowed
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay habitaciones disponibles en este momento'
              }
            </p>
            {searchTerm || selectedCity || priceRange.min || priceRange.max || genderPreference || petsAllowed && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsList;
