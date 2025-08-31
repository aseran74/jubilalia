import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Componentes de autenticación
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';

// Componentes del dashboard
import DashboardSidebar from './components/dashboard/DashboardSidebar';
import Dashboard from './components/dashboard/Dashboard';

// Componentes de propiedades
import PropertySaleForm from './components/properties/PropertySaleForm';
import PropertyRentalForm from './components/properties/PropertyRentalForm';
import PropertyList from './components/properties/PropertyList';
import PropertyDetail from './components/properties/PropertyDetail';

// Componentes de actividades
import ActivityForm from './components/activities/ActivityForm';
import ActivityList from './components/activities/ActivityList';
import ActivityDetail from './components/activities/ActivityDetail';

// Componentes de posts
import PostForm from './components/posts/PostForm';
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import PostEdit from './components/posts/PostEdit';

// Componentes de perfil
import ProfileForm from './components/profile/ProfileForm';

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
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/create" element={<PropertySaleForm />} />
            <Route path="/properties/rental" element={<PropertyRentalForm />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/activities/create" element={<ActivityForm />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/create" element={<PostForm />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/posts/:id/edit" element={<PostEdit />} />
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
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/dashboard/*" element={<DashboardLayout />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
