import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useMobileApp } from './hooks/useMobileApp';
import { Heart } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Landing Page
import LandingPage from './pages/LandingPage';
import AppSplash from './pages/AppSplash';

// Componentes de autenticación
import SignUpForm from './components/auth/SignUpForm';
import JubilaliaLogin from './pages/Jubilalia/Login';
import Register from './pages/Jubilalia/Register';
import AuthCallback from './pages/AuthCallback';

// Componentes del dashboard
import DashboardSidebar from './components/dashboard/DashboardSidebar';
import Dashboard from './components/dashboard/Dashboard';

// Componentes de propiedades
import PropertySaleForm from './components/properties/PropertySaleForm';
import PropertyRentalForm from './components/properties/PropertyRentalForm';
import PropertyDetail from './components/properties/PropertyDetail';
import PropertySaleList from './components/properties/PropertySaleList';
import PropertyRentalList from './components/properties/PropertyRentalList';

// Componentes de alquiler de habitaciones
import RoomList from './components/accommodations/RoomList';
import RoomDetail from './components/accommodations/RoomDetail';
import RoomForm from './components/accommodations/RoomForm';
import RoommateSearch from './components/accommodations/RoommateSearch';
import SociosList from './components/people/SociosList';

// Componentes de administración
import AdminRoomManagement from './components/admin/AdminRoomManagement';
import AdminPropertyManagement from './components/admin/AdminPropertyManagement';

// Componentes de actividades
import ActivityForm from './components/activities/ActivityForm';
import ActivityList from './components/activities/ActivityList';
import ActivityDetail from './components/activities/ActivityDetail';

// Componentes de posts
import PostForm from './components/posts/PostForm';
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import PostEdit from './components/posts/PostEdit';

// Componentes de perfil y usuarios
import ProfileForm from './components/profile/ProfileForm';
import UserProfile from './components/users/UserProfile';
import PeopleSearch from './components/people/PeopleSearch';
import Settings from './components/dashboard/Settings';

// Componentes de grupos
import Groups from './components/people/Groups';
import GroupForm from './components/groups/GroupForm';
import GroupDetail from './components/groups/GroupDetail';

// Componentes de mensajería
import ChatApp from './components/messaging/ChatApp';

// Componentes de debug
import ConnectionTest from './components/debug/ConnectionTest';
import GooglePlacesTest from './components/debug/GooglePlacesTest';
import DatabaseTest from './components/debug/DatabaseTest';
import RoomFormTest from './components/debug/RoomFormTest';
import AuthDiagnostic from './components/debug/AuthDiagnostic';
import DatabaseDiagnostic from './components/debug/DatabaseDiagnostic';
import VercelAuthFix from './components/debug/VercelAuthFix';
import GoogleAuthDiagnostic from './components/debug/GoogleAuthDiagnostic';
import RedirectFix from './components/debug/RedirectFix';
import GoogleMapsDiagnostic from './components/debug/GoogleMapsDiagnostic';
import MapDebug from './components/debug/MapDebug';

// Componentes de mapas
import RoomsMapView from './components/maps/RoomsMapView';
import PropertiesSaleMapView from './components/maps/PropertiesSaleMapView';
import PropertiesRentalMapView from './components/maps/PropertiesRentalMapView';

// Componentes de demo
import CalendarDemo from './components/demo/CalendarDemo';

// Componente principal del dashboard
const DashboardLayout: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug info
  console.log('DashboardLayout - Estado de autenticación:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, full_name: profile.full_name } : null,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('DashboardLayout - No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Propiedades - Venta */}
            <Route path="/properties/sale" element={<PropertySaleList />} />
            <Route path="/properties/sale/map" element={<PropertiesSaleMapView />} />
            <Route path="/properties/sale/create" element={<PropertySaleForm />} />
            <Route path="/properties/sale/:id" element={<PropertyDetail />} />
            <Route path="/properties/sale/:id/edit" element={<PropertySaleForm />} />
            
            {/* Propiedades - Alquiler */}
            <Route path="/properties/rental" element={<PropertyRentalList />} />
            <Route path="/properties/rental/map" element={<PropertiesRentalMapView />} />
            <Route path="/properties/rental/create" element={<PropertyRentalForm />} />
            <Route path="/properties/rental/:id" element={<PropertyDetail />} />
            <Route path="/properties/rental/:id/edit" element={<PropertyRentalForm />} />
            
            {/* Alquiler de Habitaciones */}
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/rooms/roommates" element={<RoommateSearch />} />
            <Route path="/rooms/map" element={<RoomsMapView />} />
            <Route path="/rooms/create" element={<RoomForm />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            
            {/* Socios */}
            <Route path="/socios" element={<SociosList />} />
            <Route path="/dashboard/socios" element={<SociosList />} />
            <Route path="/rooms/:id/edit" element={<RoomForm />} />
            
            {/* Actividades */}
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/activities/map" element={<ActivityList />} />
            <Route path="/activities/create" element={<ActivityForm />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/activities/:id/edit" element={<ActivityForm />} />
            
            {/* Posts */}
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/create" element={<PostForm />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/posts/:id/edit" element={<PostEdit />} />
            
            {/* Búsqueda de Usuarios */}
            <Route path="/users" element={<PeopleSearch />} />
            <Route path="/users/map" element={<PeopleSearch />} />
            <Route path="/users/:id" element={<UserProfile />} />
            
            {/* Grupos */}
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/create" element={<GroupForm />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/groups/:id/edit" element={<GroupForm />} />
            
            {/* Mensajería */}
            <Route path="/messages" element={<ChatApp />} />
            
            {/* Administración */}
            <Route path="/admin/rooms" element={<AdminRoomManagement />} />
            <Route path="/admin/properties" element={<AdminPropertyManagement />} />
            
            {/* Perfil y Configuración */}
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/profiles/:id/edit" element={<ProfileForm />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Demo */}
            <Route path="/calendar-demo" element={<CalendarDemo />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Componente de depuración temporal
const DebugAuth: React.FC = () => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Pendiente');
  const [testingConnection, setTestingConnection] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const { testSupabaseConnection } = await import('./lib/supabase');
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? '✅ Conectado' : '❌ Error de conexión');
    } catch (error) {
      setConnectionStatus('❌ Error de conexión');
      console.error('Error testing connection:', error);
    } finally {
      setTestingConnection(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug de Autenticación</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado actual:</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
            <p><strong>Usuario:</strong> {user ? `Sí (${user.email})` : 'No'}</p>
            <p><strong>Perfil:</strong> {profile ? `Sí (${profile.full_name})` : 'No'}</p>
            <p><strong>Conexión Supabase:</strong> {connectionStatus}</p>
          </div>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={testConnection}
              disabled={testingConnection}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {testingConnection ? 'Probando...' : 'Probar Conexión Supabase'}
            </button>
            
            {user && !profile && (
              <button
                onClick={async () => {
                  setCreatingProfile(true);
                  try {
                    await refreshProfile();
                  } catch (error) {
                    console.error('Error creating profile:', error);
                  } finally {
                    setCreatingProfile(false);
                  }
                }}
                disabled={creatingProfile}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {creatingProfile ? 'Creando...' : 'Crear Perfil'}
              </button>
            )}
          </div>
          
          {user && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Información del usuario:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          {profile && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Información del perfil:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6 space-x-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ir al Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/rooms'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Ir a Habitaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App: React.FC = () => {
  const { isMobileApp, isLoading } = useMobileApp();

  // Configurar StatusBar para Android - Configuración limpia
  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          // Agregar clase 'android' al body
          document.body.classList.add('android');
          
          // Configuración simple y limpia
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          
          console.log('✅ StatusBar configurado correctamente');
        } catch (error) {
          console.error('Error configurando StatusBar:', error);
        }
      }
    };
    setupStatusBar();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={isMobileApp ? <AppSplash /> : <LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signin" element={<JubilaliaLogin />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<JubilaliaLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Rutas accesibles desde landing page */}
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/activities/map" element={<ActivityList />} />
          <Route path="/activities/create" element={<ActivityForm />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/activities/:id/edit" element={<ActivityForm />} />
          
          <Route path="/debug" element={<DebugAuth />} />
          <Route path="/test-connection" element={<ConnectionTest />} />
          <Route path="/test-google-places" element={<GooglePlacesTest />} />
          <Route path="/test-database" element={<DatabaseTest />} />
          <Route path="/test-room-form" element={<RoomFormTest />} />
                    <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
          <Route path="/database-diagnostic" element={<DatabaseDiagnostic />} />
          <Route path="/vercel-auth-fix" element={<VercelAuthFix />} />
          <Route path="/google-auth-diagnostic" element={<GoogleAuthDiagnostic />} />
          <Route path="/auth-debug" element={<GoogleAuthDiagnostic />} />
          <Route path="/redirect-fix" element={<RedirectFix />} />
          <Route path="/google-maps-diagnostic" element={<GoogleMapsDiagnostic />} />
          <Route path="/map-debug" element={<MapDebug />} />
          <Route path="/dashboard/*" element={<DashboardLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
