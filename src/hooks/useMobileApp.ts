import { useState, useEffect } from 'react';
import { isMobileApp as checkMobileApp } from '../utils/mobileDetection';

export const useMobileApp = () => {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = checkMobileApp();
    setIsMobileApp(checkMobile);
    setIsLoading(false);
  }, []);

  return { isMobileApp, isLoading };
};
