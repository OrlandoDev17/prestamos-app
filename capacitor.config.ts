import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orlandodev.prestamos',
  appName: 'PrestamosApp',
  webDir: '.output/public',
  android: {
    backgroundColor: '#f8f9fa',
    allowMixedContent: true,
  },
};

export default config;
