import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Landing Page
import LandingPage from './pages/LandingPage';

// Componentes de autenticación
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';

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
import UserSearch from './components/users/UserSearch';
import UserProfile from './components/users/UserProfile';

// Componentes de mensajería
import ChatApp from './components/messaging/ChatApp';

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
    return <Navigate to="/signin" replace />;
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
            <Route path="/properties/sale/create" element={<PropertySaleForm />} />
            <Route path="/properties/sale/:id" element={<PropertyDetail />} />
            
            {/* Propiedades - Alquiler */}
            <Route path="/properties/rental" element={<PropertyRentalList />} />
            <Route path="/properties/rental/create" element={<PropertyRentalForm />} />
            <Route path="/properties/rental/:id" element={<PropertyDetail />} />
            
            {/* Alquiler de Habitaciones */}
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/rooms/create" element={<RoomForm />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            
            {/* Actividades */}
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/activities/create" element={<ActivityForm />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            
            {/* Posts */}
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/create" element={<PostForm />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/posts/:id/edit" element={<PostEdit />} />
            
            {/* Búsqueda de Usuarios */}
            <Route path="/users" element={<UserSearch />} />
            <Route path="/users/:id" element={<UserProfile />} />
            
            {/* Mensajería */}
            <Route path="/messages" element={<ChatApp />} />
            
            {/* Perfil y Configuración */}
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/settings" element={<div className="p-6">Configuración</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/dashboard/*" element={<DashboardLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
