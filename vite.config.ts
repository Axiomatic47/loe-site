import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Create a custom plugin to serve content directories
const contentDirectoryPlugin = () => ({
  name: 'content-directory-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Handle directory listing for content folders
      if (req.url?.startsWith('/content/')) {
        const contentPath = path.join(process.cwd(), req.url.split('?')[0]);

        try {
          if (fs.existsSync(contentPath) && fs.statSync(contentPath).isDirectory()) {
            const files = fs.readdirSync(contentPath);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
            return;
          }
        } catch (e) {
          console.error('Error serving content directory:', e);
        }
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), contentDirectoryPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    historyApiFallback: true,
    watch: {
      // Watch content directories for changes
      ignored: ['!**/content/**']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'public/admin/index.html'),
      },
    },
  },
  // Add explicit JSON support
  optimizeDeps: {
    include: ['*.json'],
  },
});