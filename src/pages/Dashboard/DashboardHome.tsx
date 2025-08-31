import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Home, 
  Building, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Star
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  const quickActions = [
    {
      title: "Publicar Habitación",
      description: "Alquila tu habitación disponible",
      icon: <Plus className="w-6 h-6 sm:w-8 sm:h-8" />,
      href: "/dashboard/rooms/publish",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Buscar Habitaciones",
      description: "Encuentra tu próxima habitación",
      icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />,
      href: "/dashboard/rooms/search",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Publicar Propiedad",
      description: "Alquila o vende tu propiedad",
      icon: <Building className="w-6 h-6 sm:w-8 sm:h-8" />,
      href: "/dashboard/rental/publish",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Organizar Actividad",
      description: "Crea eventos para la comunidad",
      icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
      href: "/dashboard/activities/publish",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const stats = [
    { label: "Habitaciones publicadas", value: "0", change: "+0%", changeType: "positive" },
    { label: "Propiedades en alquiler", value: "0", change: "+0%", changeType: "positive" },
    { label: "Actividades organizadas", value: "0", change: "+0%", changeType: "positive" },
    { label: "Conexiones realizadas", value: "0", change: "+0%", changeType: "positive" }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">¡Bienvenido a Jubilalia!</h1>
            <p className="text-sm sm:text-base lg:text-lg opacity-90">
              Tu plataforma para encontrar compañía, ahorrar dinero y disfrutar de la vida
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Home className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full flex-shrink-0 ${
                stat.changeType === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-xs sm:text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">este mes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group block"
            >
              <div className={`${action.bgColor} rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${action.color} rounded-lg lg:rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Habitaciones y Propiedades */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Habitaciones y Propiedades
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/dashboard/rooms/search"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Buscar habitaciones</span>
            </Link>
            <Link
              to="/dashboard/rooms/publish"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Publicar habitación</span>
            </Link>
            <Link
              to="/dashboard/rental/search"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Buscar propiedades</span>
            </Link>
          </div>
        </div>

        {/* Actividades y Social */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
            Actividades y Red Social
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/dashboard/activities/search"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Buscar actividades</span>
            </Link>
            <Link
              to="/dashboard/activities/publish"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Organizar actividad</span>
            </Link>
            <Link
              to="/dashboard/social/search"
              className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-700">Explorar posts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Consejos y recomendaciones */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-yellow-200">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
              Consejos para empezar
            </h3>
            <ul className="text-yellow-700 space-y-1 text-xs sm:text-sm">
              <li>• Completa tu perfil para conectar mejor con otros usuarios</li>
              <li>• Publica fotos claras de tu habitación o propiedad</li>
              <li>• Sé específico sobre tus preferencias y requisitos</li>
              <li>• Participa en actividades para conocer a la comunidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
