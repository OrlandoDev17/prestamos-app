import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orlandodev.prestamos',
  appName: 'PrestamosApp',
  webDir: 'dist',
  server: {
    url: "http://192.168.1.8:3000",
    cleartext: true
  }
};

export default config;
