import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import RoomCard from './RoomCard';
import PropertySaleCard from './PropertySaleCard';
import PropertyRentalCard from './PropertyRentalCard';
import GroupCard from './GroupCard';
import ActivityCard from './ActivityCard';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CalendarIcon
} from '@heroicons/react/24/outline';

const FeaturedContent: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [saleProperties, setSaleProperties] = useState<any[]>([]);
  const [rentalProperties, setRentalProperties] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);

             // Fetch featured rooms (limit 1)
       const { data: roomsData } = await supabase
         .from('rooms')
         .select('*')
         .eq('is_available', true)
         .order('created_at', { ascending: false })
         .limit(1);

       // Fetch featured sale properties (limit 1)
       const { data: saleData } = await supabase
         .from('property_listings')
         .select('*')
         .eq('listing_type', 'property_purchase')
         .eq('is_available', true)
         .order('created_at', { ascending: false })
         .limit(1);

       // Fetch featured rental properties (limit 1)
       const { data: rentalData } = await supabase
         .from('property_listings')
         .select('*')
         .eq('listing_type', 'property_rental')
         .eq('is_available', true)
         .order('created_at', { ascending: false })
         .limit(1);

       // Fetch featured groups (limit 1)
       const { data: groupsData } = await supabase
         .from('groups')
         .select('*')
         .eq('is_public', true)
         .order('created_at', { ascending: false })
         .limit(1);

       // Fetch featured activities (limit 1)
       const { data: activitiesData } = await supabase
         .from('activities')
         .select('*')
         .gte('date', new Date().toISOString().split('T')[0])
         .order('created_at', { ascending: false })
         .limit(1);

      setRooms(roomsData || []);
      setSaleProperties(saleData || []);
      setRentalProperties(rentalData || []);
      setGroups(groupsData || []);
      setActivities(activitiesData || []);

    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando contenido destacado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título principal */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Contenido Destacado
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre las mejores opciones en habitaciones, propiedades, grupos y actividades
          </p>
        </div>

        {/* Grid de 5 cards centradas con mejor espaciado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          
          {/* Habitación */}
          {rooms.length > 0 ? (
            <div className="flex justify-center">
              <RoomCard room={rooms[0]} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center w-full max-w-sm border border-gray-100">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Habitaciones</h3>
                <p className="text-gray-500 text-sm mb-4">No hay habitaciones disponibles</p>
                <div className="bg-green-50 rounded-lg p-3">
                  <span className="text-green-700 text-sm font-medium">Próximamente</span>
                </div>
              </div>
            </div>
          )}

          {/* Propiedad en Venta */}
          {saleProperties.length > 0 ? (
            <div className="flex justify-center">
              <PropertySaleCard property={saleProperties[0]} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center w-full max-w-sm border border-gray-100">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <BuildingOfficeIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Propiedades en Venta</h3>
                <p className="text-gray-500 text-sm mb-4">No hay propiedades disponibles</p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <span className="text-blue-700 text-sm font-medium">Próximamente</span>
                </div>
              </div>
            </div>
          )}

          {/* Propiedad en Alquiler */}
          {rentalProperties.length > 0 ? (
            <div className="flex justify-center">
              <PropertyRentalCard property={rentalProperties[0]} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center w-full max-w-sm border border-gray-100">
                <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <BuildingOfficeIcon className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Propiedades en Alquiler</h3>
                <p className="text-gray-500 text-sm mb-4">No hay propiedades disponibles</p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <span className="text-purple-700 text-sm font-medium">Próximamente</span>
                </div>
              </div>
            </div>
          )}

          {/* Grupo */}
          {groups.length > 0 ? (
            <div className="flex justify-center">
              <GroupCard group={groups[0]} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center w-full max-w-sm border border-gray-100">
                <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Grupos</h3>
                <p className="text-gray-500 text-sm mb-4">No hay grupos disponibles</p>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <span className="text-indigo-700 text-sm font-medium">Próximamente</span>
                </div>
              </div>
            </div>
          )}

          {/* Actividad */}
          {activities.length > 0 ? (
            <div className="flex justify-center">
              <ActivityCard activity={activities[0]} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center w-full max-w-sm border border-gray-100">
                <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Actividades</h3>
                <p className="text-gray-500 text-sm mb-4">No hay actividades disponibles</p>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <span className="text-emerald-700 text-sm font-medium">Próximamente</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Enlaces para ver más */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Explora todas nuestras categorías
          </h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <Link
              to="/dashboard/rooms"
              className="group flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <HomeIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Ver todas las habitaciones
            </Link>
            <Link
              to="/dashboard/properties/sale"
              className="group flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <BuildingOfficeIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Ver propiedades en venta
            </Link>
            <Link
              to="/dashboard/properties/rental"
              className="group flex items-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <BuildingOfficeIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Ver propiedades en alquiler
            </Link>
            <Link
              to="/dashboard/groups"
              className="group flex items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <UserGroupIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Ver todos los grupos
            </Link>
            <Link
              to="/dashboard/activities"
              className="group flex items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <CalendarIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Ver todas las actividades
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeaturedContent;
