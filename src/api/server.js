// src/api/server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes with specific origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root directory (assuming this file is in src/api)
const rootDir = path.resolve(__dirname, '../../');
const contentDir = path.join(rootDir, 'content');

// Ensure content directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(contentDir, 'manuscript'),
    path.join(contentDir, 'data'),
    path.join(rootDir, 'public', 'uploads')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

ensureDirectories();

// Import debug router
import debugRouter from './debug.js';

// Use debug router
app.use('/api', debugRouter);

// Basic status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    contentDirs: {
      manuscript: fs.existsSync(path.join(contentDir, 'manuscript')),
      data: fs.existsSync(path.join(contentDir, 'data'))
    }
  });
});

// API endpoints to get collections
app.get('/api/collections/:collectionType', (req, res) => {
  const { collectionType } = req.params;
  const collectionPath = path.join(contentDir, collectionType);

  console.log(`Fetching collection: ${collectionType} from ${collectionPath}`);

  try {
    if (!fs.existsSync(collectionPath)) {
      console.log(`Collection directory not found: ${collectionPath}`);
      return res.json([]);
    }

    const files = fs.readdirSync(collectionPath)
      .filter(file => file.endsWith('.json'));

    const collections = files.map(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}:`, error);
        return null;
      }
    }).filter(Boolean);

    console.log(`Found ${collections.length} items in ${collectionType}`);
    res.json(collections);
  } catch (error) {
    console.error(`Error fetching collection ${collectionType}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Setup Netlify CMS proxy for local development
if (process.env.NODE_ENV === 'development') {
  const proxy = createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    pathRewrite: { '^/api/netlify': '' },
  });

  app.use('/api/netlify', proxy);
  console.log('Netlify CMS proxy configured');
}

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/collections/manuscript`);
  console.log(`API status check: http://localhost:${PORT}/api/status`);
});

export default app;