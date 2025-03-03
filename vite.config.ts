import { defineConfig, loadEnv } from 'vite';
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

// API proxy configuration
const apiProxyPlugin = (env) => ({
  name: 'api-proxy-plugin',
  configureServer(server) {
    const apiBaseUrl = env.VITE_API_URL || 'http://localhost:4041';
    console.log(`Proxying API requests to: ${apiBaseUrl}`);

    // Create a proxy for API requests
    server.middlewares.use('/api', (req, res, next) => {
      const target = `${apiBaseUrl}${req.url}`;
      console.log(`Proxying request to: ${target}`);

      // Forward the request to the FastAPI server
      fetch(target, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // Forward other headers as needed
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      })
      .then(apiRes => {
        // Copy status and headers
        res.statusCode = apiRes.status;
        apiRes.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });

        // Stream the response body
        return apiRes.text();
      })
      .then(body => {
        res.end(body);
      })
      .catch(err => {
        console.error('API proxy error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'API proxy error', details: err.message }));
      });
    });
  }
});

export default defineConfig(({ mode }) => {
  // Load env files based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      contentDirectoryPlugin(),
      apiProxyPlugin(env)
    ],
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
  };
});