import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Use localhost backend during development
      '/api': 'http://localhost:5000',
    },
  },
  define: {
    // Add the Render backend URL as an environment variable for production
    'process.env.RENDER_BACKEND_URL': JSON.stringify('https://api.render.com/deploy/srv-cu2b0ml2ng1s73fuop9g?key=g7wLC5K8YCE'),
  },
});
