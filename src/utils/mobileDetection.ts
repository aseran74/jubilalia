import { Capacitor } from '@capacitor/core';

/**
 * Solo la app nativa (APK/iOS). En escritorio y móvil web se muestra la landing original.
 * No basta con `window.Capacitor`: el SDK también existe en el navegador.
 */
export const isMobileApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};
