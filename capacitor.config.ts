import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orlandodev.tuprestamo',
  appName: 'TuPrestamo',
  webDir: '.output/public',
  android: {
    backgroundColor: '#f8f9fa',
    allowMixedContent: true,
  },
};

export default config;
