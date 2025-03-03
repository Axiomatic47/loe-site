// scripts/content-debug.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Get current timestamps
const now = new Date().toISOString();

console.log('--- Content Files Debug Tool ---');
console.log('Current time:', now);

// Check content directories
const contentDir = path.join(rootDir, 'content');
console.log('\nChecking content directory:', contentDir);
console.log('Content directory exists:', fs.existsSync(contentDir));

// Check manuscript directory
const manuscriptDir = path.join(contentDir, 'manuscript');
console.log('\nChecking manuscript directory:', manuscriptDir);
console.log('Manuscript directory exists:', fs.existsSync(manuscriptDir));

if (fs.existsSync(manuscriptDir)) {
  const manuscriptFiles = fs.readdirSync(manuscriptDir);
  console.log('Manuscript files:', manuscriptFiles);

  // Check each manuscript file
  manuscriptFiles.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(manuscriptDir, file);
      const stats = fs.statSync(filePath);
      console.log(`\nFile: ${file}`);
      console.log('  Size:', stats.size, 'bytes');
      console.log('  Modified:', stats.mtime);

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        console.log('  Content valid JSON:', true);
        console.log('  Title:', data.title);
        console.log('  Sections:', data.sections?.length || 0);
      } catch (error) {
        console.log('  Content valid JSON:', false);
        console.log('  Error:', error.message);
      }
    }
  });
}

// Check data directory
const dataDir = path.join(contentDir, 'data');
console.log('\nChecking data directory:', dataDir);
console.log('Data directory exists:', fs.existsSync(dataDir));

if (fs.existsSync(dataDir)) {
  const dataFiles = fs.readdirSync(dataDir);
  console.log('Data files:', dataFiles);

  // Check each data file
  dataFiles.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dataDir, file);
      const stats = fs.statSync(filePath);
      console.log(`\nFile: ${file}`);
      console.log('  Size:', stats.size, 'bytes');
      console.log('  Modified:', stats.mtime);

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        console.log('  Content valid JSON:', true);
        console.log('  Title:', data.title);
        console.log('  Sections:', data.sections?.length || 0);
      } catch (error) {
        console.log('  Content valid JSON:', false);
        console.log('  Error:', error.message);
      }
    }
  });
}

// Create test content if needed
if (process.argv.includes('--create-test')) {
  console.log('\nCreating test content files...');

  // Ensure directories exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  if (!fs.existsSync(manuscriptDir)) {
    fs.mkdirSync(manuscriptDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create test manuscript
  const testManuscript = {
    title: "Test Manuscript",
    collection_type: "manuscript",
    sections: [
      {
        title: "Test Section",
        featured: true,
        content_level_1: "Basic content",
        content_level_3: "# Intermediate Content\n\nThis is a test section.",
        content_level_5: "# Advanced Content\n\nThis is detailed test content."
      }
    ]
  };

  fs.writeFileSync(
    path.join(manuscriptDir, 'test-manuscript.json'),
    JSON.stringify(testManuscript, null, 2)
  );

  // Create test data
  const testData = {
    title: "Test Data",
    collection_type: "data",
    sections: [
      {
        title: "Test Data Section",
        featured: true,
        content_level_1: "Basic data",
        content_level_3: "# Intermediate Data\n\nThis is test data.",
        content_level_5: "# Advanced Data\n\nThis is detailed test data."
      }
    ]
  };

  fs.writeFileSync(
    path.join(dataDir, 'test-data.json'),
    JSON.stringify(testData, null, 2)
  );

  console.log('Test content created successfully.');
}

console.log('\nContent debug completed.');