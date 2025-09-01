import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Bell,
  Search,
  Building,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const JubilaliaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Jubilalia</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Perfil del usuario */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.displayName || 'Usuario'}
                </span>
              </div>
              
              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Inicio', icon: Home },
              { id: 'roommates', label: 'Compartir Habitación', icon: Users },
              { id: 'housing', label: 'Alojamientos', icon: Building },
              { id: 'social', label: 'Red Social', icon: MessageCircle },
              { id: 'activities', label: 'Actividades', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Bienvenido a Jubilalia, {user?.displayName || 'Usuario'}!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Descubre nuevas oportunidades para compartir vivienda, hacer amigos y disfrutar de la vida juntos
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                  <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Compañeros</h3>
                  <p className="text-gray-600">Encuentra personas compatibles</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Viviendas</h3>
                  <p className="text-gray-600">Descubre alojamientos perfectos</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Comunidad</h3>
                  <p className="text-gray-600">Conecta con tu comunidad</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/roommates"
                  className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl text-center hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Search className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold">Buscar Compañeros</h4>
                </Link>
                
                <Link
                  to="/accommodations"
                  className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Building className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold">Ver Alojamientos</h4>
                </Link>
                
                <Link
                  to="/social"
                  className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-center hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold">Red Social</h4>
                </Link>
                
                <Link
                  to="/activities"
                  className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold">Actividades</h4>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Actividad Reciente</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Nuevo compañero disponible en Madrid</p>
                    <p className="text-gray-600 text-sm">María, 65 años, le gusta la jardinería</p>
                  </div>
                  <span className="text-gray-400 text-sm">Hace 2 horas</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Nuevo alojamiento en Barcelona</p>
                    <p className="text-gray-600 text-sm">Casa con jardín, 3 habitaciones, €800/mes</p>
                  </div>
                  <span className="text-gray-400 text-sm">Hace 5 horas</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Nueva actividad: Paseo por el Retiro</p>
                    <p className="text-gray-600 text-sm">Organizado por Juan, este domingo a las 10:00</p>
                  </div>
                  <span className="text-gray-400 text-sm">Hace 1 día</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roommates' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Compartir Habitación</h2>
            <p className="text-gray-600 mb-8">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {activeTab === 'housing' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Alojamientos</h2>
            <p className="text-gray-600 mb-8">
              Descubre alojamientos perfectos para compartir con otros jubilados. 
              Casas, pisos y residencias con todas las comodidades que necesitas.
            </p>
            <div className="text-center">
              <Link
                to="/accommodations"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Building className="w-5 h-5" />
                <span>Ver Alojamientos</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Red Social</h2>
            <p className="text-gray-600 mb-8">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Actividades</h2>
            <p className="text-gray-600 mb-8">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default JubilaliaDashboard;
