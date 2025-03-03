// scripts/check-system.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('Performing system check...');
console.log('Current date/time:', new Date().toISOString());
console.log('Running from directory:', rootDir);

// Check content directories
const contentDirs = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content/manuscript'),
  path.join(rootDir, 'content/data'),
  path.join(rootDir, 'public/uploads'),
  path.join(rootDir, 'public/admin')
];

console.log('\nChecking directories:');
contentDirs.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      const stats = fs.statSync(dir);
      const modeStr = stats.mode.toString(8);
      const filesCount = fs.readdirSync(dir).length;
      console.log(`✅ ${dir} exists (mode: ${modeStr}, files: ${filesCount})`);
    } else {
      console.log(`❌ ${dir} does not exist`);
    }
  } catch (error) {
    console.error(`❌ Error checking ${dir}:`, error.message);
  }
});

// Check key files
const keyFiles = [
  { path: path.join(rootDir, 'public/admin/index.html'), name: 'Admin index.html' },
  { path: path.join(rootDir, 'public/admin/config.yml'), name: 'Admin config.yml' },
  { path: path.join(rootDir, 'src/utils/compositionLoader.ts'), name: 'CompositionLoader' },
  { path: path.join(rootDir, 'src/utils/compositionData.ts'), name: 'CompositionData' },
  { path: path.join(rootDir, 'src/pages/CompositionsPage.tsx'), name: 'CompositionsPage' },
  { path: path.join(rootDir, 'src/pages/SectionPage.tsx'), name: 'SectionPage' }
];

console.log('\nChecking key files:');
keyFiles.forEach(file => {
  try {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
      console.log(`✅ ${file.name} exists (${sizeKB} KB, modified: ${stats.mtime})`);
    } else {
      console.log(`❌ ${file.name} does not exist`);
    }
  } catch (error) {
    console.error(`❌ Error checking ${file.name}:`, error.message);
  }
});

// Check content files
const contentTypes = ['manuscript', 'data'];
console.log('\nChecking content files:');

contentTypes.forEach(type => {
  const dir = path.join(rootDir, 'content', type);
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
      console.log(`Found ${files.length} JSON files in ${type}:`);

      files.forEach(file => {
        try {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);

          const hasSections = Array.isArray(data.sections);
          const sectionCount = hasSections ? data.sections.length : 0;

          console.log(`  - ${file}: title="${data.title}", has sections: ${hasSections}, sections count: ${sectionCount}`);
        } catch (error) {
          console.error(`    ❌ Error parsing ${file}:`, error.message);
        }
      });
    } else {
      console.log(`❌ ${type} directory does not exist`);
    }
  } catch (error) {
    console.error(`❌ Error checking ${type} directory:`, error.message);
  }
});

// Check proxy server
console.log('\nChecking Netlify CMS proxy server:');
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

// Check Vite server
const checkViteServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', {
      timeout: 2000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.substring(0, 100)
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

// Main async function to run all tests
const runTests = async () => {
  // Test proxy server
  try {
    const result = await checkProxy();
    console.log('✅ Proxy server is running!');
    console.log('  Status code:', result.status);
    console.log('  Response:', result.data.substring(0, 100) + (result.data.length > 100 ? '...' : ''));
  } catch (error) {
    console.error('❌ Error connecting to proxy server:', error.message);
    console.log('  The Netlify CMS proxy server might not be running.');
    console.log('  To start it, run: npx netlify-cms-proxy-server');
  }

  // Test Vite server
  try {
    const result = await checkViteServer();
    console.log('✅ Vite server is running!');
    console.log('  Status code:', result.status);
  } catch (error) {
    console.error('❌ Error connecting to Vite server:', error.message);
    console.log('  The Vite development server might not be running.');
    console.log('  To start it, run: npm run dev');
  }

  console.log('\nSystem check complete.');
  console.log('If you encountered any issues, please use the following steps:');
  console.log('1. Make sure your admin files are correctly configured');
  console.log('2. Run the content conversion script: node scripts/convert-content.js');
  console.log('3. Restart your Vite server: npm run dev');
  console.log('4. For CMS functionality, start the proxy server: npx netlify-cms-proxy-server');
};

// Run all checks
runTests().catch(error => {
  console.error('Error running tests:', error);
});