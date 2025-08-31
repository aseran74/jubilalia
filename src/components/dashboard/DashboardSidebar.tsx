import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Home, 
  Building, 
  ShoppingCart, 
  Calendar, 
  MessageSquare, 
  MessageCircle,
  Users, 
  User,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const sidebarSections: SidebarSection[] = [
    {
      title: "Habitaciones",
      items: [
        {
          title: "Buscar habitaciones",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/rooms/search",
          description: "Encuentra habitaciones disponibles"
        },
        {
          title: "Publicar habitación",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/rooms/publish",
          description: "Alquila tu habitación"
        }
      ]
    },
    {
      title: "Alquiler de Propiedades",
      items: [
        {
          title: "Buscar alquiler",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/properties/search",
          description: "Encuentra propiedades para alquilar"
        },
        {
          title: "Publicar alquiler",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/properties/publish",
          description: "Alquila tu propiedad"
        }
      ]
    },
    {
      title: "Compra de Propiedades",
      items: [
        {
          title: "Buscar compra",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/purchase/search",
          description: "Encuentra propiedades para comprar"
        },
        {
          title: "Publicar venta",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/purchase/publish",
          description: "Vende tu propiedad"
        }
      ]
    },
    {
      title: "Actividades",
      items: [
        {
          title: "Buscar actividades",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/activities/search",
          description: "Encuentra actividades y eventos"
        },
        {
          title: "Publicar actividad",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/activities/publish",
          description: "Organiza una actividad"
        }
      ]
    },
    {
      title: "Posts",
      items: [
        {
          title: "Ver posts",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/posts",
          description: "Explora publicaciones"
        },
        {
          title: "Crear post",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/posts/create",
          description: "Comparte con la comunidad"
        }
      ]
    },
    {
      title: "Red Social (Legacy)",
      items: [
        {
          title: "Buscar posts",
          icon: <Search className="w-5 h-5" />,
          href: "/dashboard/social/search",
          description: "Explora publicaciones"
        },
        {
          title: "Publicar post",
          icon: <Plus className="w-5 h-5" />,
          href: "/dashboard/social/publish",
          description: "Comparte con la comunidad"
        }
      ]
    },
    {
      title: "Mensajes",
      items: [
        {
          title: "Conversaciones",
          icon: <MessageCircle className="w-5 h-5" />,
          href: "/dashboard/messages",
          description: "Gestiona tus mensajes"
        }
      ]
    },
    {
      title: "Perfil y Gente",
      items: [
        {
          title: "Buscar gente",
          icon: <Users className="w-5 h-5" />,
          href: "/dashboard/people/search",
          description: "Conecta con otros usuarios"
        },
        {
          title: "Completar perfil",
          icon: <User className="w-5 h-5" />,
          href: "/dashboard/profile/edit",
          description: "Actualiza tu información"
        }
      ]
    }
  ];

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const handleItemClick = () => {
    // En móvil/tablet, cerrar el sidebar al hacer clic en un elemento
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay para móvil/tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 bg-white border-r border-gray-200 h-full overflow-y-auto
        lg:block
      `}>
        <div className="p-4 lg:p-6">
          {/* Header con botón de cerrar en móvil */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Dashboard</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestiona tu experiencia en Jubilalia</p>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Secciones del sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1 lg:space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.href}
                      onClick={handleItemClick}
                      className={`group flex items-center p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className={`mr-2 lg:mr-3 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.title}</div>
                        <div className={`text-xs truncate ${
                          isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 flex-shrink-0 ${
                        isActive(item.href) ? 'text-blue-600 rotate-90' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer del sidebar */}
          <div className="mt-8 lg:mt-12 pt-4 lg:pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-2 lg:mb-3 flex items-center justify-center">
                <Home className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Jubilalia</p>
              <p className="text-xs text-gray-400">Tu plataforma de confianza</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
