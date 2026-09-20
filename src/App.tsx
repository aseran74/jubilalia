import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
  </div>
);

const ColivingExplanation = lazy(() => import('./pages/ColivingExplanation'));
const PublicSearch = lazy(() => import('./pages/PublicSearch'));
const VerifyIdentity = lazy(() => import('./pages/VerifyIdentity'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const PropertySearch = lazy(() => import('./pages/PropertySearch'));
const SignUpForm = lazy(() => import('./components/auth/SignUpForm'));
const JubilaliaLogin = lazy(() => import('./pages/Jubilalia/Login'));
const Register = lazy(() => import('./pages/Jubilalia/Register'));
const DashboardSidebar = lazy(() => import('./components/dashboard/DashboardSidebar'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const MobileTabBar = lazy(() => import('./components/mobile/MobileTabBar'));
const PropertySaleForm = lazy(() => import('./components/properties/PropertySaleForm'));
const PropertyRentalForm = lazy(() => import('./components/properties/PropertyRentalForm'));
const PropertyDetail = lazy(() => import('./components/properties/PropertyDetail'));
const PropertySaleList = lazy(() => import('./components/properties/PropertySaleList'));
const PropertyRentalList = lazy(() => import('./components/properties/PropertyRentalList'));
const RoomList = lazy(() => import('./components/accommodations/RoomList'));
const RoomDetail = lazy(() => import('./components/accommodations/RoomDetail'));
const RoomForm = lazy(() => import('./components/accommodations/RoomForm'));
const RoommateSearch = lazy(() => import('./components/accommodations/RoommateSearch'));
const AdminRoomManagement = lazy(() => import('./components/admin/AdminRoomManagement'));
const AdminPropertyManagement = lazy(() => import('./components/admin/AdminPropertyManagement'));
const AdminActivityManagement = lazy(() => import('./components/admin/AdminActivityManagement'));
const AdminGroupManagement = lazy(() => import('./components/admin/AdminGroupManagement'));
const ActivityForm = lazy(() => import('./components/activities/ActivityForm'));
const ActivityList = lazy(() => import('./components/activities/ActivityList'));
const ActivityDetail = lazy(() => import('./components/activities/ActivityDetail'));
const PostForm = lazy(() => import('./components/posts/PostForm'));
const PostList = lazy(() => import('./components/posts/PostList'));
const PostDetail = lazy(() => import('./components/posts/PostDetail'));
const PostEdit = lazy(() => import('./components/posts/PostEdit'));
const ColivingPostsList = lazy(() => import('./components/coliving/ColivingPostsList'));
const ColivingPostForm = lazy(() => import('./components/coliving/ColivingPostForm'));
const ProfileForm = lazy(() => import('./components/profile/ProfileForm'));
const PeopleSearch = lazy(() => import('./components/people/PeopleSearch'));
const PersonDetail = lazy(() => import('./components/people/PersonDetail'));
const Settings = lazy(() => import('./components/dashboard/Settings'));
const FriendsList = lazy(() => import('./components/friends/FriendsList'));
const NotificationsPage = lazy(() => import('./components/dashboard/NotificationsPage'));
const Groups = lazy(() => import('./components/people/Groups'));
const GroupForm = lazy(() => import('./components/groups/GroupForm'));
const GroupDetail = lazy(() => import('./components/groups/GroupDetail'));
const ChatApp = lazy(() => import('./components/messaging/ChatApp'));
const ConnectionTest = lazy(() => import('./components/debug/ConnectionTest'));
const GooglePlacesTest = lazy(() => import('./components/debug/GooglePlacesTest'));
const DatabaseTest = lazy(() => import('./components/debug/DatabaseTest'));
const RoomFormTest = lazy(() => import('./components/debug/RoomFormTest'));
const AuthDiagnostic = lazy(() => import('./components/debug/AuthDiagnostic'));
const DatabaseDiagnostic = lazy(() => import('./components/debug/DatabaseDiagnostic'));
const VercelAuthFix = lazy(() => import('./components/debug/VercelAuthFix'));
const GoogleAuthDiagnostic = lazy(() => import('./components/debug/GoogleAuthDiagnostic'));
const RedirectFix = lazy(() => import('./components/debug/RedirectFix'));
const GoogleMapsDiagnostic = lazy(() => import('./components/debug/GoogleMapsDiagnostic'));
const MapDebug = lazy(() => import('./components/debug/MapDebug'));
const RoomsMapView = lazy(() => import('./components/maps/RoomsMapView'));
const PropertiesSaleMapView = lazy(() => import('./components/maps/PropertiesSaleMapView'));
const PropertiesRentalMapView = lazy(() => import('./components/maps/PropertiesRentalMapView'));
const CalendarDemo = lazy(() => import('./components/demo/CalendarDemo'));
const MobileLandingPage = lazy(() => import('./pages/MobileLandingPage'));

// Componente principal del dashboard
const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<PageFallback />}>
    <>
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 app-safe-header">
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
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Propiedades - Venta */}
            <Route path="/properties/sale" element={<PropertySaleList />} />
            <Route path="/properties/sale/map" element={<PropertiesSaleMapView />} />
            <Route path="/properties/sale/create" element={<PropertySaleForm />} />
            <Route path="/properties/sale/:id" element={<PropertyDetail />} />
            <Route path="/properties/sale/:id/edit" element={<PropertySaleForm />} />
            
            {/* Publicaciones de Venta */}
            <Route path="/properties/sale/posts" element={<ColivingPostsList />} />
            <Route path="/properties/sale/posts/create" element={<ColivingPostForm />} />
            <Route path="/properties/sale/posts/:id/edit" element={<ColivingPostForm />} />
            
            {/* Propiedades - Alquiler */}
            <Route path="/properties/rental" element={<PropertyRentalList />} />
            <Route path="/properties/rental/map" element={<PropertiesRentalMapView />} />
            <Route path="/properties/rental/create" element={<PropertyRentalForm />} />
            <Route path="/properties/rental/:id" element={<PropertyDetail />} />
            <Route path="/properties/rental/:id/edit" element={<PropertyRentalForm />} />
            
            {/* Publicaciones de Alquiler */}
            <Route path="/properties/rental/posts" element={<ColivingPostsList />} />
            <Route path="/properties/rental/posts/create" element={<ColivingPostForm />} />
            <Route path="/properties/rental/posts/:id/edit" element={<ColivingPostForm />} />
            
            {/* Alquiler de Habitaciones */}
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/rooms/roommates" element={<RoommateSearch />} />
            <Route path="/rooms/map" element={<RoomsMapView />} />
            <Route path="/rooms/create" element={<RoomForm />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/rooms/:id/edit" element={<RoomForm />} />
            
            {/* Publicaciones de Habitaciones */}
            <Route path="/rooms/posts" element={<ColivingPostsList />} />
            <Route path="/rooms/posts/create" element={<ColivingPostForm />} />
            <Route path="/rooms/posts/:id/edit" element={<ColivingPostForm />} />
            
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
            <Route path="/users/:id" element={<PersonDetail />} />
            <Route path="/dashboard/users" element={<PeopleSearch />} />
            <Route path="/dashboard/users/map" element={<PeopleSearch />} />
            <Route path="/dashboard/users/:id" element={<PersonDetail />} />
            <Route path="friends" element={<FriendsList />} />
            
            {/* Notificaciones */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Grupos */}
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/map" element={<Groups />} />
            <Route path="/groups/create" element={<GroupForm />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/groups/:id/edit" element={<GroupForm />} />
            <Route path="/dashboard/groups" element={<Groups />} />
            <Route path="/dashboard/groups/map" element={<Groups />} />
            <Route path="/dashboard/groups/create" element={<GroupForm />} />
            <Route path="/dashboard/groups/:id" element={<GroupDetail />} />
            <Route path="/dashboard/groups/:id/edit" element={<GroupForm />} />
            
            {/* Mensajería */}
            <Route path="/messages" element={<ChatApp />} />
            
            {/* Administración */}
            <Route path="/admin/rooms" element={<AdminRoomManagement />} />
            <Route path="/admin/properties" element={<AdminPropertyManagement />} />
            <Route path="/admin/activities" element={<AdminActivityManagement />} />
            <Route path="/admin/groups" element={<AdminGroupManagement />} />
            
            {/* Perfil y Configuración */}
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/dashboard/profile" element={<ProfileForm />} />
            <Route path="/profiles/:id/edit" element={<ProfileForm />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Demo */}
            <Route path="/calendar-demo" element={<CalendarDemo />} />
          </Routes>
        </main>
      </div>
    </div>
    <MobileTabBar />
    </>
    </Suspense>
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
  const isMobileApp = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let stopOAuthListener = () => {};

    const setupNativeChrome = async () => {
      const platform = Capacitor.getPlatform();
      document.documentElement.classList.add('native-app', platform);
      document.body.classList.add('native-app', platform);

      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#00000000' });

        const info = await StatusBar.getInfo();
        const measuredHeight = Number((info as { height?: number }).height);
        const safeTop = Number.isFinite(measuredHeight) && measuredHeight > 0 ? measuredHeight : 32;
        document.documentElement.style.setProperty('--status-bar-height', `${safeTop}px`);
        document.documentElement.style.setProperty('--safe-top', `${safeTop}px`);
      } catch (error) {
        document.documentElement.style.setProperty('--status-bar-height', '32px');
        document.documentElement.style.setProperty('--safe-top', '32px');
        console.error('Error configurando StatusBar:', error);
      }

      const { listenForNativeOAuthReturn } = await import('./lib/googleAuth');
      stopOAuthListener = listenForNativeOAuthReturn();
    };

    setupNativeChrome();
    return () => stopOAuthListener();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={isMobileApp ? <MobileLandingPage /> : <LandingPage />} />
          <Route path="/app" element={isMobileApp ? <MobileLandingPage /> : <LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/mobile" element={<MobileLandingPage />} />
          <Route path="/verificar-identidad" element={<VerifyIdentity />} />
          <Route path="/coliving" element={<ColivingExplanation />} />
          <Route path="/signin" element={<JubilaliaLogin />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<JubilaliaLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Página pública de búsqueda */}
          <Route path="/search" element={<PublicSearch />} />
          <Route path="/properties/search" element={<PropertySearch />} />
          
          {/* Rutas públicas de propiedades y habitaciones */}
          <Route path="/properties/rental/:id" element={<PropertyDetail />} />
          <Route path="/properties/sale/:id" element={<PropertyDetail />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          
          {/* Páginas legales */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          
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
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
