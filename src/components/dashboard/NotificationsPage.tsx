import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  ArrowLeftIcon,
  MapPinIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'activity_nearby':
      return <CalendarIcon className="w-6 h-6 text-orange-500" />;
    case 'new_message':
      return <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />;
    case 'group_post':
      return <UserGroupIcon className="w-6 h-6 text-green-500" />;
    case 'friend_request':
      return <UserPlusIcon className="w-6 h-6 text-purple-500" />;
    case 'friend_accepted':
      return <CheckCircleIcon className="w-6 h-6 text-emerald-500" />;
    case 'group_invitation':
      return <UserGroupIcon className="w-6 h-6 text-indigo-500" />;
    default:
      return <MapPinIcon className="w-6 h-6 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'activity_nearby':
      return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'new_message':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'group_post':
      return 'bg-green-100 text-green-600 border-green-200';
    case 'friend_request':
      return 'bg-purple-100 text-purple-600 border-purple-200';
    case 'friend_accepted':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'group_invitation':
      return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    formatNotificationTime 
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link_url) {
      navigate(notification.link_url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-stone-700 hover:text-stone-900 mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Notificaciones</h1>
            <p className="text-stone-600">
              {unreadCount > 0 
                ? `${unreadCount} ${unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}`
                : 'Todas las notificaciones están leídas'
              }
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <CheckIcon className="w-5 h-5" />
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">No hay notificaciones</h3>
          <p className="text-stone-600">Cuando tengas nuevas notificaciones, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                !notification.is_read 
                  ? 'border-blue-200 bg-blue-50/50' 
                  : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getNotificationColor(notification.type)} flex items-center justify-center border-2`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className={`text-base font-semibold text-stone-800 mb-1 ${!notification.is_read ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-stone-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>{formatNotificationTime(notification.created_at)}</span>
                        {notification.type && (
                          <span className="px-2 py-0.5 bg-stone-100 rounded-full">
                            {notification.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Indicador de no leído */}
                    {!notification.is_read && (
                      <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                    {notification.link_url && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver más →
                      </button>
                    )}
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-stone-600 hover:text-stone-700 font-medium ml-auto"
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
                      title="Eliminar notificación"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
