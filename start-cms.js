import { ProxyServer } from 'netlify-cms-proxy-server';

const server = new ProxyServer({
  port: 8083, // Changed to 8083 to avoid conflict
  publicFolder: 'public',
  debug: true,
  jwtSecret: "SECRET",
  allowedHosts: ['localhost']
});

server.start().then(() => {
  console.log('CMS Proxy server running on port 8083');
}).catch(err => {
  console.error('Failed to start CMS proxy server:', err);
});