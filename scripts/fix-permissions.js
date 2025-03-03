// scripts/fix-permissions.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('Checking and fixing content directory permissions...');
console.log('Root directory:', rootDir);

// Content directories
const contentDirs = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content/manuscript'),
  path.join(rootDir, 'content/data'),
  path.join(rootDir, 'public/uploads')
];

// Ensure directories exist
contentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Check and fix permissions
console.log('Current directory permissions:');
contentDirs.forEach(dir => {
  try {
    const stats = fs.statSync(dir);
    // Convert to octal permission string
    const mode = stats.mode.toString(8).slice(-3);
    console.log(`${dir}: ${mode}`);

    // Set permissions to 777 (read, write, execute for all)
    console.log(`Setting permissions for ${dir}`);
    fs.chmodSync(dir, 0o777);

    // Verify new permissions
    const newStats = fs.statSync(dir);
    const newMode = newStats.mode.toString(8).slice(-3);
    console.log(`${dir}: ${newMode} (after update)`);

    // List contents of directory
    const files = fs.readdirSync(dir);
    console.log(`Contents of ${dir}:`, files);
  } catch (err) {
    console.error(`Error with directory ${dir}:`, err);
  }
});

// Create a test file to verify permissions
try {
  const testFile = path.join(rootDir, 'content', 'test-permissions.json');
  fs.writeFileSync(testFile, JSON.stringify({ test: 'permissions', timestamp: new Date().toISOString() }, null, 2));
  console.log(`Created test file: ${testFile}`);

  // Check if file was created
  if (fs.existsSync(testFile)) {
    console.log(`Test file exists and is readable`);

    // Check if file is writable
    fs.appendFileSync(testFile, '\n');
    console.log(`Test file is writable`);
  }
} catch (err) {
  console.error('Error creating test file:', err);
}

console.log('Permissions check and fix completed.');