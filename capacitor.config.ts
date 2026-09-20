import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jubilalia',
  appName: 'Jubilalia',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    adjustMarginsForEdgeToEdge: 'disable'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000'
    }
  }
};

export default config;
