import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, User, MapPin, Heart, MessageCircle, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PotentialRoommate {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  city?: string;
  bio?: string;
  age?: number;
  interests?: string[];
  lifestyle_preferences?: {
    smoking: boolean;
    pets: boolean;
    partying: boolean;
    cleanliness: 'low' | 'medium' | 'high';
  };
  roommate_preferences?: {
    age_range: { min: number; max: number };
    gender_preference: 'any' | 'male' | 'female';
    smoking_allowed: boolean;
    pets_allowed: boolean;
  };
  created_at: string;
}

interface RoommateSearchFilters {
  city: string;
  ageRange: { min: number; max: number };
  gender: 'any' | 'male' | 'female';
  smoking: 'any' | 'yes' | 'no';
  pets: 'any' | 'yes' | 'no';
  cleanliness: 'any' | 'low' | 'medium' | 'high';
}

const RoommateSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [potentialRoommates, setPotentialRoommates] = useState<PotentialRoommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RoommateSearchFilters>({
    city: '',
    ageRange: { min: 18, max: 80 },
    gender: 'any',
    smoking: 'any',
    pets: 'any',
    cleanliness: 'any'
  });

  useEffect(() => {
    fetchPotentialRoommates();
  }, []);

  const fetchPotentialRoommates = async () => {
    try {
      setLoading(true);
      
      // Buscar usuarios que tengan la preferencia de vivir con alguien
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          lifestyle_preferences,
          roommate_preferences
        `)
        .eq('wants_to_find_roommate', true)
        .neq('id', user?.id); // Excluir al usuario actual

      if (error) throw error;

      setPotentialRoommates(profiles || []);
    } catch (error) {
      console.error('Error fetching potential roommates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoommates = potentialRoommates.filter(roommate => {
    const matchesSearch = !searchTerm || 
      roommate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roommate.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roommate.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !filters.city || roommate.city === filters.city;

    const matchesAge = roommate.age 
      ? roommate.age >= filters.ageRange.min && roommate.age <= filters.ageRange.max
      : true;

    const matchesGender = filters.gender === 'any' || 
      roommate.roommate_preferences?.gender_preference === 'any' ||
      roommate.roommate_preferences?.gender_preference === filters.gender;

    const matchesSmoking = filters.smoking === 'any' ||
      roommate.lifestyle_preferences?.smoking === (filters.smoking === 'yes');

    const matchesPets = filters.pets === 'any' ||
      roommate.lifestyle_preferences?.pets === (filters.pets === 'yes');

    const matchesCleanliness = filters.cleanliness === 'any' ||
      roommate.lifestyle_preferences?.cleanliness === filters.cleanliness;

    return matchesSearch && matchesCity && matchesAge && matchesGender && 
           matchesSmoking && matchesPets && matchesCleanliness;
  });

  const cities = [...new Set(potentialRoommates.map(r => r.city).filter(Boolean))];

  const handleContact = (roommateId: string) => {
    // Navegar al chat o crear conversación
    navigate(`/dashboard/messages?user=${roommateId}`);
  };

  const handleLike = async (roommateId: string) => {
    // Implementar sistema de likes/matches
    console.log('Liked roommate:', roommateId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buscar Compañero de Habitación
          </h1>
          <p className="text-gray-600">
            Encuentra personas que buscan compartir vivienda como tú
          </p>
        </div>

        {/* Filtros de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Búsqueda por texto */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="any">Cualquier género</option>
                    <option value="male">Hombres</option>
                    <option value="female">Mujeres</option>
                  </select>
                </div>

                {/* Fumar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fumar
                  </label>
                  <select
                    value={filters.smoking}
                    onChange={(e) => setFilters(prev => ({ ...prev, smoking: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="any">Indiferente</option>
                    <option value="yes">Sí fuma</option>
                    <option value="no">No fuma</option>
                  </select>
                </div>

                {/* Mascotas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mascotas
                  </label>
                  <select
                    value={filters.pets}
                    onChange={(e) => setFilters(prev => ({ ...prev, pets: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="any">Indiferente</option>
                    <option value="yes">Tiene mascotas</option>
                    <option value="no">Sin mascotas</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando {filteredRoommates.length} de {potentialRoommates.length} posibles compañeros
          </p>
        </div>

        {/* Lista de compañeros potenciales */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredRoommates.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron compañeros
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoommates.map((roommate) => (
              <div key={roommate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Avatar y nombre */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {roommate.avatar_url ? (
                        <img
                          src={roommate.avatar_url}
                          alt={roommate.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        roommate.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {roommate.full_name}
                      </h3>
                      {roommate.age && (
                        <p className="text-gray-600">{roommate.age} años</p>
                      )}
                      {roommate.city && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {roommate.city}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {roommate.bio && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {roommate.bio}
                    </p>
                  )}

                  {/* Preferencias de estilo de vida */}
                  {roommate.lifestyle_preferences && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Estilo de vida
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          roommate.lifestyle_preferences.smoking 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {roommate.lifestyle_preferences.smoking ? 'Fuma' : 'No fuma'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          roommate.lifestyle_preferences.pets 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {roommate.lifestyle_preferences.pets ? 'Tiene mascotas' : 'Sin mascotas'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Limpieza: {roommate.lifestyle_preferences.cleanliness}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => handleLike(roommate.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Me gusta
                  </button>
                  <button
                    onClick={() => handleContact(roommate.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateSearch;
