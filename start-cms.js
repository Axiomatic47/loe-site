import { ProxyServer } from 'netlify-cms-proxy-server';

const server = new ProxyServer({
  port: 8082,
  publicFolder: 'public',
  debug: true,
  jwtSecret: "SECRET", // Add a JWT secret for authentication
  allowedHosts: ['localhost']
});

server.start().then(() => {
  console.log('Proxy server running on port 8082');
}).catch(err => {
  console.error('Failed to start proxy server:', err);
});