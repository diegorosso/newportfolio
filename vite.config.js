import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.PNG'],
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'ion-icon',
        },
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // El formulario de contacto envía a /send.php. En desarrollo se redirige a un PHP local
    // (php -S 127.0.0.1:8081 -t public); en el hosting lo atiende Hostinger directamente
    proxy: {
      '/send.php': {
        target: 'http://127.0.0.1:8081',
        // El script solo acepta pedidos del mismo sitio: se alinean Host y Origin
        changeOrigin: true,
        headers: { Origin: 'http://127.0.0.1:8081' },
      },
    },
  },
  optimizeDeps: {
    include: ['aos'], // Añade AOS a las dependencias optimizadas
  },
});
