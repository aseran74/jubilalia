import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();

  const dashboardCards = [
    {
      title: 'Propiedades en Venta',
      description: 'Busca y publica propiedades para comprar y jubilarte tranquilamente',
      icon: BuildingOfficeIcon,
      href: '/dashboard/properties/sale',
      color: 'bg-blue-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/properties/sale', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/properties/sale/create', icon: PlusIcon }
      ]
    },
    {
      title: 'Propiedades en Alquiler',
      description: 'Busca y publica propiedades para alquilar y jubilarte tranquilamente',
      icon: BuildingOfficeIcon,
      href: '/dashboard/properties/rental',
      color: 'bg-green-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/properties/rental', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/properties/rental/create', icon: PlusIcon }
      ]
    },
    {
      title: 'Habitaciones',
      description: 'Busca y publica habitaciones para alquilar',
      icon: BuildingOfficeIcon,
      href: '/dashboard/rooms',
      color: 'bg-yellow-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/rooms', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/rooms/create', icon: PlusIcon }
      ]
    },
    {
      title: 'Actividades',
      description: 'Organiza y participa en actividades comunitarias',
      icon: CalendarIcon,
      href: '/dashboard/activities',
      color: 'bg-purple-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/activities', icon: MagnifyingGlassIcon },
        { name: 'Crear', href: '/dashboard/activities/create', icon: PlusIcon }
      ]
    },
    {
      title: 'Posts',
      description: 'Comparte tus pensamientos con la comunidad',
      icon: DocumentTextIcon,
      href: '/dashboard/posts',
      color: 'bg-indigo-500',
      actions: [
        { name: 'Ver todos', href: '/dashboard/posts', icon: MagnifyingGlassIcon },
        { name: 'Crear', href: '/dashboard/posts/create', icon: PlusIcon }
      ]
    },
    {
      title: 'Buscar Gente',
      description: 'Conecta con personas afines en tu área',
      icon: UserIcon,
      href: '/dashboard/users',
      color: 'bg-pink-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/users', icon: MagnifyingGlassIcon },
        { name: 'Mensajes', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon }
      ]
    },
    {
      title: 'Mensajes',
      description: 'Gestiona tus conversaciones',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard/messages',
      color: 'bg-teal-500',
      actions: [
        { name: 'Ver todos', href: '/dashboard/messages', icon: MagnifyingGlassIcon },
        { name: 'Buscar gente', href: '/dashboard/users', icon: UserIcon }
      ]
    },
    {
      title: 'Mi Perfil',
      description: 'Gestiona tu información personal y preferencias',
      icon: UserIcon,
      href: '/dashboard/profile',
      color: 'bg-orange-500',
      actions: [
        { name: 'Editar', href: '/dashboard/profile', icon: UserIcon },
        { name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a Jubilalia!
          </h1>
          <p className="mt-2 text-gray-600">
            Tu plataforma para conectar, compartir y disfrutar de la jubilación
          </p>
        </div>

        {/* User Welcome */}
        {profile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Usuario'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Hola, {profile.full_name || user?.email || 'Usuario'}!
                </h2>
                <p className="text-gray-600">
                  ¿Qué te gustaría hacer hoy?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {card.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link
                          key={action.name}
                          to={action.href}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <ActionIcon className="w-4 h-4 mr-2" />
                          {action.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen Rápido
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Propiedades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Actividades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Mensajes</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">
            ¿Primera vez en Jubilalia?
          </h3>
          <p className="text-blue-100 mb-4">
            Completa tu perfil y comienza a explorar todas las funcionalidades disponibles
          </p>
          <div className="flex space-x-3">
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Completar Perfil
            </Link>
            <Link
              to="/dashboard/activities"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Explorar Actividades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
