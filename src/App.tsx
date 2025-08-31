import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import AppLayout from './layout/AppLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Páginas de Jubilalia
import JubilaliaLogin from './pages/Jubilalia/Login';
import JubilaliaRegister from './pages/Jubilalia/Register';
import JubilaliaDashboard from './pages/Jubilalia/Dashboard';
import JubilaliaAccommodations from './pages/Jubilalia/Accommodations';
import JubilaliaRoommates from './pages/Jubilalia/Roommates';
import JubilaliaSocial from './pages/Jubilalia/Social';
import JubilaliaActivities from './pages/Jubilalia/Activities';
import JubilaliaTest from './pages/Jubilalia/FormComparison';
import Properties from './pages/Jubilalia/Properties';
import PropertyListingForm from './components/properties/PropertyListingForm';
import PropertyListingFormSimple from './components/properties/PropertyListingFormSimple';
import SearchPage from './pages/Search';
import LandingPage from './pages/LandingPage';

// Páginas del Dashboard
import Home from './pages/Dashboard/Home';

// Nuevo Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import RoomSearch from './pages/dashboard/RoomSearch';
import RoomPublish from './pages/dashboard/RoomPublish';
import RoomDetailPage from './pages/dashboard/RoomDetailPage';
import Conversations from './pages/dashboard/Conversations';
import PropertyRentalSearch from './pages/dashboard/PropertyRentalSearch';
import PropertyRentalPublish from './pages/dashboard/PropertyRentalPublish';
import PropertySaleSearch from './pages/dashboard/PropertySaleSearch';
import PropertySalePublish from './pages/dashboard/PropertySalePublish';

// Componentes de Actividades
import ActivityList from './components/activities/ActivityList';
import ActivityForm from './components/activities/ActivityForm';
import ActivityDetail from './components/activities/ActivityDetail';

// Componentes de Posts
import PostList from './components/posts/PostList';
import PostForm from './components/posts/PostForm';
import PostDetail from './components/posts/PostDetail';
import PostEdit from './components/posts/PostEdit';

// Componentes de protección
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Landing Page pública - ambas rutas apuntan a la misma página */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Rutas de Jubilalia */}
              <Route path="/login" element={<JubilaliaLogin />} />
              <Route path="/register" element={<JubilaliaRegister />} />
              
                      {/* Rutas del nuevo Dashboard */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<DashboardHome />} />
                        
                        {/* Habitaciones */}
                        <Route path="rooms/search" element={<RoomSearch />} />
                        <Route path="rooms/publish" element={<RoomPublish />} />
                        <Route path="rooms/:id" element={<RoomDetailPage />} />
                        
                                        {/* Alquiler de propiedades */}
                <Route path="properties/search" element={<PropertyRentalSearch />} />
                <Route path="properties/publish" element={<PropertyRentalPublish />} />
                
                {/* Compra de propiedades */}
                <Route path="purchase/search" element={<PropertySaleSearch />} />
                <Route path="purchase/publish" element={<PropertySalePublish />} />
                        

                        
                        {/* Actividades */}
                        <Route path="activities" element={<ActivityList />} />
                        <Route path="activities/search" element={<ActivityList />} />
                        <Route path="activities/create" element={<ActivityForm />} />
                        <Route path="activities/publish" element={<ActivityForm />} />
                        <Route path="activities/:id" element={<ActivityDetail />} />
                        
                        {/* Red Social - Posts */}
                        <Route path="posts" element={<PostList />} />
                        <Route path="posts/create" element={<PostForm />} />
                        <Route path="posts/:id" element={<PostDetail />} />
                        <Route path="posts/:id/edit" element={<PostEdit />} />
                        
                        {/* Red Social (legacy) */}
                        <Route path="social/search" element={<div className="p-6"><h1>Buscar Posts</h1><p>Página en desarrollo...</p></div>} />
                        <Route path="social/publish" element={<div className="p-6"><h1>Publicar Post</h1><p>Página en desarrollo...</p></div>} />
                        
                        {/* Gente y Perfil */}
                        <Route path="people/search" element={<div className="p-6"><h1>Buscar Gente</h1><p>Página en desarrollo...</p></div>} />
                        <Route path="profile/edit" element={<div className="p-6"><h1>Editar Perfil</h1><p>Página en desarrollo...</p></div>} />
                        
                        {/* Mensajes */}
                        <Route path="messages" element={<Conversations />} />
                      </Route>
              <Route path="/accommodations" element={
                <ProtectedRoute>
                  <JubilaliaAccommodations />
                </ProtectedRoute>
              } />
              <Route path="/roommates" element={
                <ProtectedRoute>
                  <JubilaliaRoommates />
                </ProtectedRoute>
              } />
              <Route path="/social" element={
                <ProtectedRoute>
                  <JubilaliaSocial />
                </ProtectedRoute>
              } />
              <Route path="/activities" element={
                <ProtectedRoute>
                  <JubilaliaActivities />
                </ProtectedRoute>
              } />
              <Route path="/properties" element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } />
              <Route path="/properties/create" element={
                <ProtectedRoute>
                  <PropertyListingForm />
                </ProtectedRoute>
              } />
              <Route path="/properties/create-simple" element={
                <ProtectedRoute>
                  <PropertyListingFormSimple />
                </ProtectedRoute>
              } />
              <Route path="/properties/compare" element={
                <ProtectedRoute>
                  <JubilaliaTest />
                </ProtectedRoute>
              } />
              
              {/* Dashboard principal */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Página de búsqueda */}
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
