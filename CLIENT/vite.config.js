import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'], // Explicitly include required polyfills
    }),
  ],
  define: {
    global: 'window', // Fixes "global is not defined" errors
  },
});