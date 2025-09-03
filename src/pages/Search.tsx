import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, Building, MessageCircle, Calendar } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    // Simular búsqueda - aquí se integraría con la API real
    setTimeout(() => {
      const mockResults = [
        {
          type: 'accommodation',
          title: 'Piso compartido en Madrid',
          description: 'Hermoso piso de 3 habitaciones disponible para compartir',
          icon: Building,
          url: '/accommodations'
        },
        {
          type: 'roommate',
          title: 'María González',
          description: 'Busca compañero de habitación en Barcelona',
          icon: Users,
          url: '/roommates'
        },
        {
          type: 'activity',
          title: 'Paseo por el Retiro',
          description: 'Actividad grupal para conocer el parque',
          icon: Calendar,
          url: '/activities'
        },
        {
          type: 'social',
          title: 'Grupo de Ajedrez',
          description: 'Grupo temático para jugadores de ajedrez',
          icon: MessageCircle,
          url: '/social'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
        <PageMeta
          title="Búsqueda | Jubilalia"
          description="Busca en toda la plataforma de Jubilalia"
        />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ¿Qué estás buscando?
          </h1>
          <p className="text-xl text-gray-600">
            Usa la barra de búsqueda arriba para encontrar lo que necesitas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      <PageMeta
        title={`Búsqueda: ${query} | Jubilalia`}
        description={`Resultados de búsqueda para "${query}" en Jubilalia`}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header de búsqueda */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Resultados de búsqueda
          </h1>
          <p className="text-gray-600">
            Buscando: <span className="font-semibold text-green-600">"{query}"</span>
          </p>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => {
              const IconComponent = result.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {result.description}
                      </p>
                      <a
                        href={result.url}
                        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Ver más
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 mb-4">
              No encontramos nada que coincida con tu búsqueda "{query}"
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Intenta usar términos más generales</p>
              <p>• Verifica la ortografía</p>
              <p>• Prueba con sinónimos</p>
            </div>
          </div>
        )}

        {/* Sugerencias de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              También te puede interesar
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/accommodations" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Building className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-800">Ver todos los alojamientos</h4>
                <p className="text-sm text-gray-600">Explora opciones de vivienda compartida</p>
              </a>
              <a href="/activities" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-800">Ver todas las actividades</h4>
                <p className="text-sm text-gray-600">Descubre eventos y actividades</p>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
