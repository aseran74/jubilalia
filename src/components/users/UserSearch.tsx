import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  MagnifyingGlassIcon, 
  UserIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  interests?: string[];
  created_at: string;
}

const UserSearch: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCities();
    fetchInterests();
  }, []);

  const startChat = (userId: string, userName: string) => {
    // Navegar al chat y crear una nueva conversación
    navigate('/dashboard/messages', { 
      state: { 
        startNewChat: true, 
        otherUserId: userId, 
        otherUserName: userName 
      } 
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('city')
        .not('city', 'is', null);

      if (!error && data) {
        const uniqueCities = [...new Set(data.map(item => item.city).filter(Boolean))];
        setCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('interests')
        .not('interests', 'is', null);

      if (!error && data) {
        const allInterests = data
          .flatMap(item => item.interests || [])
          .filter(Boolean);
        const uniqueInterests = [...new Set(allInterests)];
        setInterests(uniqueInterests);
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || user.city === selectedCity;
    
    const matchesInterest = !selectedInterest || 
      user.interests?.includes(selectedInterest);
    
    return matchesSearch && matchesCity && matchesInterest;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedInterest('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar Gente</h1>
          <p className="text-gray-600">
            Encuentra personas con intereses similares en tu área
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre, bio, ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las ciudades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Filtro por interés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interés
              </label>
              <select
                value={selectedInterest}
                onChange={(e) => setSelectedInterest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los intereses</option>
                {interests.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredUsers.length} usuarios encontrados
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="h-48 bg-gray-200 relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'Usuario'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del usuario */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {user.full_name || 'Usuario'}
                  </h3>
                  
                  {user.city && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">{user.city}</span>
                    </div>
                  )}

                  {user.bio && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {user.interests && user.interests.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {user.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {user.interests.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{user.interests.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Miembro desde {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <HeartIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startChat(user.id, user.full_name || 'Usuario')}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Iniciar chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/dashboard/users/${user.id}`}
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Ver perfil →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
