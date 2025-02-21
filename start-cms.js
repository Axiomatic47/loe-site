import { ProxyServer } from 'netlify-cms-proxy-server';

const server = new ProxyServer({
  port: 8083,
  publicFolder: 'public',
  debug: true,
  jwtSecret: "SECRET",
  allowedHosts: ['localhost'],
  logLevel: 'debug'
});

try {
  await server.start();
  console.log('CMS Proxy server running on port 8083');
} catch (err) {
  console.error('Failed to start CMS proxy server:', err);
  process.exit(1);
}