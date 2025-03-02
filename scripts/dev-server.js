// scripts/dev-server.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Start the Vite development server
const viteServer = spawn('npm', ['run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Start the API server
const apiServer = spawn('node', ['src/api/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start the Netlify CMS proxy server
const netlifyProxyServer = spawn('npx', ['@staticcms/proxy-server'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
const cleanup = () => {
  console.log('Shutting down servers...');
  viteServer.kill();
  apiServer.kill();
  netlifyProxyServer.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);