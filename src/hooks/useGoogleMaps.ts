import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya está cargado, no hacer nada
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Si ya se está cargando, no hacer nada
    if (window.googleMapsLoaded || isLoading) {
      return;
    }

    // Verificar si ya hay un script cargándose
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Esperar a que se cargue
      existingScript.addEventListener('load', () => {
        setIsLoaded(true);
        setIsLoading(false);
      });
      existingScript.addEventListener('error', () => {
        setError('Error cargando Google Maps');
        setIsLoading(false);
      });
      setIsLoading(true);
      return;
    }

    // Cargar Google Maps
    const loadGoogleMaps = () => {
      setIsLoading(true);
      setError(null);
      window.googleMapsLoaded = true;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        console.log('✅ Google Maps cargado exitosamente');
      };

      script.onerror = () => {
        setError('Error cargando Google Maps API');
        setIsLoading(false);
        window.googleMapsLoaded = false;
        console.error('❌ Error cargando Google Maps API');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [isLoading]);

  return { isLoaded, isLoading, error };
};

