import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Home,
  Building,
  Plus,
  Star
} from 'lucide-react';
import AccommodationList from '../../components/accommodations/AccommodationList';
import { getAccommodations } from '../../lib/accommodations';
import type { Accommodation } from '../../types/accommodations';

const Accommodations: React.FC = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        const data = await getAccommodations();
        setAccommodations(data as unknown as Accommodation[]);
      } catch (err) {
        setError('Failed to fetch accommodations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
    const interval = setInterval(fetchAccommodations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAccommodationSelect = () => {
    // Handle accommodation selection
  };

  const handleCreateNew = () => {
    // Handle create new accommodation
  };

  if (loading && accommodations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Cargando alojamientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <p className="text-2xl text-red-600">{error}</p>
      </div>
    );
  }

  if (accommodations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">No hay alojamientos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-800">Alojamientos</h1>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Publicar Alojamiento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Encuentra tu 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"> hogar ideal</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Descubre alojamientos perfectos para compartir con otros jubilados. 
            Casas, pisos y residencias con todas las comodidades que necesitas.
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">150+</div>
              <div className="text-sm text-gray-600">Alojamientos</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">25+</div>
              <div className="text-sm text-gray-600">Ciudades</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">500+</div>
              <div className="text-sm text-gray-600">Usuarios</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">4.8</div>
              <div className="text-sm text-gray-600">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Información sobre el servicio */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  ¿Por qué elegir Jubilalia para tu alojamiento?
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alojamientos verificados y seguros</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comunidad de jubilados con intereses similares</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Precios competitivos y sin comisiones ocultas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Soporte personalizado durante todo el proceso</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  ¿Eres propietario?
                </h4>
                <p className="text-gray-600 mb-4">
                  Publica tu alojamiento y encuentra inquilinos ideales para compartir.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Publicar Ahora
                </button>
              </div>
            </div>
          </div>

                      {/* Lista de alojamientos */}
            <AccommodationList 
              onAccommodationSelect={handleAccommodationSelect}
              showFilters={true}
            />
        </div>
      </section>

      {/* Modal de detalles del alojamiento */}
      {/* This section was removed as per the new_code, as selectedAccommodation state was removed */}
    </div>
  );
};

export default Accommodations;
