// scripts/check-proxy.js
import http from 'http';

console.log('Checking Netlify CMS proxy server...');

// Try to connect to the proxy server (port 8081)
const checkProxy = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8081/api/v1', {
      timeout: 2000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
};

const main = async () => {
  try {
    const result = await checkProxy();
    console.log('Proxy server is running!');
    console.log('Status code:', result.status);
    console.log('Response:', result.data);
  } catch (error) {
    console.error('Error connecting to proxy server:', error.message);
    console.log('\nThe Netlify CMS proxy server might not be running.');
    console.log('To start it, run: npx netlify-cms-proxy-server');
    console.log('\nAlternatively, run: npm run dev:all');
  }
};

main();