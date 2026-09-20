import { isMobileApp as checkMobileApp } from '../utils/mobileDetection';

export const useMobileApp = () => {
  const isMobileApp = checkMobileApp();
  return { isMobileApp, isLoading: false };
};
