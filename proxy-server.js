import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

// Import the analytics service
const analyticsService = await import('./src/services/proxyAnalytics.cjs');

const app = express();

// Add CORS headers
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Handle analytics endpoints
app.get('/api/analytics', async (req, res) => {
  try {
    console.log('Getting analytics data...');
    const viewCounts = await analyticsService.default.getViewCounts();
    console.log('Analytics data:', viewCounts);
    res.json(viewCounts);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
});

// Handle analytics record endpoints
app.post('/api/analytics/record', async (req, res) => {
  try {
    console.log('Recording page view:', req.body);
    const { path } = req.body;
    const result = await analyticsService.default.recordPageView(path);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Analytics Record Error:', error);
    res.status(500).json({
      error: 'Failed to record page view',
      details: error.message
    });
  }
});

// Proxy CMS requests to the CMS proxy server
app.use('/api/v1', createProxyMiddleware({
  target: 'http://localhost:8083',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('CMS Proxy Error:', err);
  }
}));

// Serve static files from public directory
app.use(express.static('public'));

const PORT = 8082;
app.listen(PORT, () => {
  console.log(`API Proxy server running on http://localhost:${PORT}`);
});