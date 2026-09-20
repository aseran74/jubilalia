import React from 'react';
import { Link } from 'react-router-dom';
import MobileTabBar from '../mobile/MobileTabBar';

const PublicFooter: React.FC = () => {
  return (
    <>
      <footer className="bg-white pt-20 pb-32 lg:pb-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/images/jubilogo.svg" alt="Jubilalia" loading="lazy" className="h-10 mx-auto mb-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 text-xs sm:text-sm font-bold text-gray-600">
            <Link to="/terms" className="hover:text-green-600 transition-colors">Términos de Servicio</Link>
            <Link to="/privacy" className="hover:text-green-600 transition-colors">Política de Privacidad</Link>
            <Link to="/cookies" className="hover:text-green-600 transition-colors">Política de Cookies</Link>
            <a 
              href="https://www.canva.com/design/DAG9W5ioZhY/fEJQvYVruMvv6O1-Ezg-8A/view?utm_content=DAG9W5ioZhY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors"
            >
              Pitch Deck
            </a>
          </div>
          <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} Jubilalia. Hecho con <span className="text-red-500">❤️</span> para nuestros mayores.</p>
        </div>
      </footer>

      <MobileTabBar />
    </>
  );
};

export default PublicFooter;
