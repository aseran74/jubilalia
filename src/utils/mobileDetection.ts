/**
 * Detecta si la aplicación se está ejecutando en un entorno móvil (Capacitor o PWA)
 */
export const isMobileApp = (): boolean => {
  // Verificar si Capacitor está disponible
  const isCapacitor = !!(window as any).Capacitor;
  
  // Verificar si estamos en un entorno móvil
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Verificar si es una PWA instalada
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as any).standalone === true;
  
  return isCapacitor || (isMobile && isPWA);
};
