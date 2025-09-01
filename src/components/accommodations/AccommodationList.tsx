import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Users,
  Calendar,
  Euro,
  Home,
  Car,
  Wifi,
  Dog,
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Accommodation } from '../../types/accommodations';
import { getAccommodations } from '../../lib/accommodations';
import AccommodationCard from './AccommodationCard';

interface AccommodationListProps {
  onAccommodationSelect?: (accommodation: Accommodation) => void;
  showFilters?: boolean;
  maxItems?: number;
}

const AccommodationList: React.FC<AccommodationListProps> = ({
  onAccommodationSelect,
  showFilters = true,
  maxItems
}) => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de filtros
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);

  // Cargar alojamientos
  useEffect(() => {
    const fetchAccommodations = async () => {
      setLoading(true);
      try {
        const data = await getAccommodations();
        setAccommodations(data as unknown as Accommodation[]);
        setFilteredAccommodations(data as unknown as Accommodation[]);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
        setError('Error al cargar las acomodaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...accommodations];

    // Filtro de búsqueda por texto
    if (searchQuery) {
      filtered = filtered.filter(acc => 
        acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por ciudad
    if (filters.city) {
      filtered = filtered.filter(acc => 
        acc.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Filtro por precio mínimo
    if (filters.min_price !== undefined) {
      filtered = filtered.filter(acc => acc.price_per_month >= filters.min_price!);
    }

    // Filtro por precio máximo
    if (filters.max_price !== undefined) {
      filtered = filtered.filter(acc => acc.price_per_month <= filters.max_price!);
    }

    // Filtro por tipo de propiedad
    if (filters.property_type && filters.property_type.length > 0) {
      filtered = filtered.filter(acc => filters.property_type!.includes(acc.property_type));
    }

    // Filtro por número mínimo de habitaciones
    if (filters.min_rooms !== undefined) {
      filtered = filtered.filter(acc => acc.total_rooms >= filters.min_rooms!);
    }

    // Filtro por número máximo de habitaciones
    if (filters.max_rooms !== undefined) {
      filtered = filtered.filter(acc => acc.total_rooms <= filters.max_rooms!);
    }

    setFilteredAccommodations(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery]);

  // Obtener alojamientos de la página actual
  const getCurrentPageAccommodations = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAccommodations.slice(startIndex, endIndex);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Manejadores de eventos
  const handleFavorite = async (id: string) => {
    // TODO: Implementar lógica de favoritos
    console.log('Agregar a favoritos:', id);
  };

  const handleRequest = (id: string) => {
    // TODO: Implementar lógica de solicitud
    console.log('Solicitar alojamiento:', id);
  };

  const handleViewDetails = (id: string) => {
    const accommodation = accommodations.find(acc => acc.id === id);
    if (accommodation && onAccommodationSelect) {
      onAccommodationSelect(accommodation);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando alojamientos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">
          <Home className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => {
            const fetchAccommodations = async () => {
              setLoading(true);
              try {
                const data = await getAccommodations();
                setAccommodations(data as unknown as Accommodation[]);
                setFilteredAccommodations(data as unknown as Accommodation[]);
              } catch (error) {
                console.error('Error fetching accommodations:', error);
                setError('Error al cargar las acomodaciones');
              } finally {
                setLoading(false);
              }
            };
            fetchAccommodations();
          }}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const currentAccommodations = getCurrentPageAccommodations();

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar alojamientos por título, descripción o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          {/* Botón de filtros */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Filtros</span>
            </button>
            
            {(filters.city || filters.min_price || filters.max_price || filters.property_type?.length || filters.min_rooms || filters.max_rooms) && (
              <button
                onClick={clearFilters}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {showFiltersPanel && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Madrid, Barcelona..."
                    value={filters.city || ''}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Rango de precios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio mensual
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.min_price || ''}
                      onChange={(e) => setFilters({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.max_price || ''}
                      onChange={(e) => setFilters({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Tipo de propiedad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad
                  </label>
                  <select
                    multiple
                    value={filters.property_type || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, property_type: selected });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="casa">Casa</option>
                    <option value="piso">Piso</option>
                    <option value="residencia">Residencia</option>
                    <option value="chalet">Chalet</option>
                    <option value="duplex">Dúplex</option>
                  </select>
                </div>

                {/* Número de habitaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habitaciones
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.min_rooms || ''}
                      onChange={(e) => setFilters({ ...filters, min_rooms: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.max_rooms || ''}
                      onChange={(e) => setFilters({ ...filters, max_rooms: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Alojamientos disponibles
          </h2>
          <span className="text-gray-600">
            {filteredAccommodations.length} resultado{filteredAccommodations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista de alojamientos */}
      {currentAccommodations.length === 0 ? (
        <div className="text-center py-20">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron alojamientos</h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros o la búsqueda
          </p>
          <button
            onClick={clearFilters}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAccommodations.map((accommodation) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                onFavorite={handleFavorite}
                onRequest={handleRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg border ${
                    currentPage === page
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccommodationList;
