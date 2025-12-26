import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { 
  MapPinIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'activity_nearby':
      return <CalendarIcon className="w-5 h-5 text-orange-500" />;
    case 'new_message':
      return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />;
    case 'group_post':
      return <UserGroupIcon className="w-5 h-5 text-green-500" />;
    case 'friend_request':
      return <UserPlusIcon className="w-5 h-5 text-purple-500" />;
    case 'friend_accepted':
      return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
    case 'group_invitation':
      return <UserGroupIcon className="w-5 h-5 text-indigo-500" />;
    default:
      return <MapPinIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'activity_nearby':
      return 'bg-orange-100 text-orange-600';
    case 'new_message':
      return 'bg-blue-100 text-blue-600';
    case 'group_post':
      return 'bg-green-100 text-green-600';
    case 'friend_request':
      return 'bg-purple-100 text-purple-600';
    case 'friend_accepted':
      return 'bg-emerald-100 text-emerald-600';
    case 'group_invitation':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    formatNotificationTime 
  } = useNotifications();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link_url) {
      navigate(notification.link_url);
      closeDropdown();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount > 0 ? "flex" : "hidden"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notificaciones
            </h5>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                title="Marcar todas como leídas"
              >
                Marcar todas
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </li>
          ) : notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-gray-500 text-sm">No hay notificaciones</p>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h6 className={`text-sm font-semibold text-gray-800 dark:text-white/90 ${!notification.is_read ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h6>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </div>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        {notifications.length > 0 && (
          <Link
            to="/dashboard/notifications"
            onClick={closeDropdown}
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Ver todas las notificaciones
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
