import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, User, MapPin, Heart, MessageCircle, Filter, Home, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Socio {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  city?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  interests?: string[];
  phone?: string;
  has_room_to_share?: boolean;
  wants_to_find_roommate?: boolean;
  created_at: string;
}

interface SociosFilters {
  city: string;
  ageRange: { min: number; max: number };
  gender: 'any' | 'male' | 'female';
}

const SociosList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SociosFilters>({
    city: '',
    ageRange: { min: 60, max: 85 },
    gender: 'any'
  });

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      setLoading(true);
      
      // Buscar todos los usuarios con perfil público
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .neq('id', user?.id || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error en query:', error);
        throw error;
      }

      console.log('Socios encontrados:', profiles?.length);
      setSocios(profiles || []);
    } catch (error) {
      console.error('Error fetching socios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSocios = socios.filter(socio => {
    const matchesSearch = !searchTerm || 
      socio.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !filters.city || socio.city === filters.city;

    // Calcular edad a partir de date_of_birth
    const age = socio.date_of_birth 
      ? Math.floor((new Date().getTime() - new Date(socio.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const matchesAge = !age || (age >= filters.ageRange.min && age <= filters.ageRange.max);

    const matchesGender = filters.gender === 'any' || socio.gender === filters.gender;

    return matchesSearch && matchesCity && matchesAge && matchesGender;
  });

  const cities = [...new Set(socios.map(s => s.city).filter(Boolean))];

  const handleContact = (socioId: string) => {
    navigate(`/dashboard/messages?user=${socioId}`);
  };

  const handleLike = async (socioId: string) => {
    console.log('Liked socio:', socioId);
  };

  const getStatusBadge = (socio: Socio) => {
    if (socio.has_room_to_share && socio.wants_to_find_roommate) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Ofrece y busca</span>;
    } else if (socio.has_room_to_share) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Tiene habitación disponible</span>;
    } else if (socio.wants_to_find_roommate) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Busca compañero</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Socios de Jubilalia
          </h1>
          <p className="text-gray-600">
            Conoce a otros socios de la comunidad Jubilalia
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

                {/* Edad mínima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad mínima
                  </label>
                  <input
                    type="number"
                    value={filters.ageRange.min}
                    onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { ...prev.ageRange, min: parseInt(e.target.value) || 60 } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="60"
                    max="85"
                  />
                </div>

                {/* Edad máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad máxima
                  </label>
                  <input
                    type="number"
                    value={filters.ageRange.max}
                    onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { ...prev.ageRange, max: parseInt(e.target.value) || 85 } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="60"
                    max="85"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando {filteredSocios.length} de {socios.length} socios
          </p>
        </div>

        {/* Lista de socios */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredSocios.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron socios
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocios.map((socio) => {
              const age = socio.date_of_birth 
                ? Math.floor((new Date().getTime() - new Date(socio.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : null;

              return (
                <div key={socio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Avatar y nombre */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                        {socio.avatar_url ? (
                          <img
                            src={socio.avatar_url}
                            alt={socio.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          socio.full_name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {socio.full_name}
                        </h3>
                        {age && (
                          <p className="text-gray-600">{age} años</p>
                        )}
                        {socio.city && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {socio.city}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {socio.bio && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {socio.bio}
                      </p>
                    )}

                    {/* Información adicional */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {socio.gender && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            socio.gender === 'male' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {socio.gender === 'male' ? 'Hombre' : 'Mujer'}
                          </span>
                        )}
                        {getStatusBadge(socio)}
                        {socio.interests && socio.interests.length > 0 && (
                          socio.interests.slice(0, 2).map(interest => (
                            <span key={interest} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {interest}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => handleLike(socio.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Me gusta
                    </button>
                    <button
                      onClick={() => handleContact(socio.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contactar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SociosList;

