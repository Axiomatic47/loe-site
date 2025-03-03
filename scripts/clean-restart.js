// scripts/clean-restart.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('===== STARTING CLEAN RESTART =====');

// Try to kill any running processes on the CMS ports
try {
  console.log('Attempting to kill processes on ports 8081 and 8082...');
  try {
    execSync('kill -9 $(lsof -ti:8081,8082) || true', { stdio: 'inherit' });
  } catch (e) {
    // Ignore errors, as the process might not exist
    console.log('No processes found or unable to kill');
  }
} catch (error) {
  console.warn('Could not kill processes:', error.message);
}

// STEP 1: Create minimal admin directory
const minimalAdminDir = path.join(rootDir, 'public', 'minimal-admin');
if (!fs.existsSync(minimalAdminDir)) {
  console.log('Creating minimal admin directory...');
  fs.mkdirSync(minimalAdminDir, { recursive: true });
}

// STEP 2: Copy the minimal admin index.html (the content would be from the minimal-admin artifact)
// For brevity, I'm assuming you've already created that file using the previous snippet
console.log('Minimal admin directory has been set up at ' + minimalAdminDir);
console.log('Please make sure to create the index.html file in that directory using the provided code');

// STEP 3: Ensure content directories exist with proper permissions
const contentDirs = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content', 'manuscript'),
  path.join(rootDir, 'content', 'data'),
  path.join(rootDir, 'public', 'uploads')
];

contentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.chmodSync(dir, 0o777); // Set full permissions
    console.log(`Set permissions for ${dir}`);
  } catch (error) {
    console.warn(`Could not set permissions for ${dir}:`, error.message);
  }
});

// STEP 4: Create an updated package.json script to start the CMS on port 8082
const packageJsonPath = path.join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update scripts
  if (packageJson.scripts) {
    packageJson.scripts.cms = "npx netlify-cms-proxy-server -p 8082";
    packageJson.scripts.killports = "kill -9 $(lsof -ti:8081,8082) || true";
    packageJson.scripts.clean_restart = "node scripts/clean-restart.js && npm run dev:all";

    // Write back the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json scripts');
  }
} catch (error) {
  console.error('Error updating package.json:', error.message);
}

// STEP 5: Create a test content file to verify the content directory is working
const testFilePath = path.join(rootDir, 'content', 'test-file.json');
try {
  fs.writeFileSync(testFilePath, JSON.stringify({
    test: true,
    timestamp: new Date().toISOString(),
    message: "This is a test file created by the clean restart script"
  }, null, 2));
  console.log(`Created test file at ${testFilePath}`);
} catch (error) {
  console.error('Error creating test file:', error.message);
}

console.log('===== CLEAN RESTART COMPLETED =====');
console.log('NEXT STEPS:');
console.log('1. Start your development server: npm run dev:all');
console.log('2. Open http://localhost:3000/minimal-admin/ in a new incognito/private window');
console.log('===================================');