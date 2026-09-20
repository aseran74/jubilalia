import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import MobileTabBar from '../mobile/MobileTabBar';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar en pantallas grandes por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    // Establecer estado inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <div className="flex h-screen relative" style={{ background: 'linear-gradient(to bottom, #2672BF, #5571AB)' }}>
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        
          {/* Área de contenido con fondo degradado visible */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6" style={{ background: 'linear-gradient(to bottom, #2672BF, #5571AB)' }}>
          <Outlet />
        </main>
      </div>
    </div>

      <MobileTabBar />
    </>
  );
};

export default DashboardLayout;
