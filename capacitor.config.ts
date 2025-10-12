import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jubilalia.app',
  appName: 'Jubilalia',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
