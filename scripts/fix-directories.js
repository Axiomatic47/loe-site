// scripts/fix-directories.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Content directories to check/create
const contentDirs = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content/manuscript'),
  path.join(rootDir, 'content/data'),
  path.join(rootDir, 'public/uploads')
];

console.log('Checking and creating content directories...');

// Ensure directories exist with proper permissions
contentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }

  // Set permissions to 777 for development
  fs.chmodSync(dir, 0o777);
  console.log(`Set permissions for ${dir}`);
});

// Create a test file to verify write access
const testFile = path.join(rootDir, 'content', 'test-permissions.json');
fs.writeFileSync(testFile, JSON.stringify({ test: 'permissions check', timestamp: new Date().toISOString() }));
console.log(`Created test file: ${testFile}`);

console.log('Content directories setup complete.');