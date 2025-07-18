import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-maps': path.resolve(__dirname, 'src/components/react-native-maps.web.tsx'),
      '@/services/locationService': path.resolve(__dirname, 'src/services/locationService.web.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  define: {
    global: 'globalThis',
    __DEV__: process.env.NODE_ENV === 'development',
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-native-web'],
  },
});