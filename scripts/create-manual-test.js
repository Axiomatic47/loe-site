// scripts/create-manual-test.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('Creating manual test content...');

// Ensure content directories exist
const contentDir = path.join(rootDir, 'content');
const manuscriptDir = path.join(contentDir, 'manuscript');
const dataDir = path.join(contentDir, 'data');

[contentDir, manuscriptDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create a manual test manuscript file
const manuscriptContent = {
  title: "Manual Test Manuscript",
  collection_type: "manuscript",
  sections: [
    {
      title: "Manual Test Section",
      featured: true,
      content_level_1: "This is basic content created manually.",
      content_level_3: "# Manual Test\n\nThis content was created directly via script, not through the admin interface.",
      content_level_5: "# Detailed Manual Test\n\nThis detailed content was created directly to test content loading."
    }
  ]
};

const manuscriptPath = path.join(manuscriptDir, 'manual-test.json');
fs.writeFileSync(manuscriptPath, JSON.stringify(manuscriptContent, null, 2));
console.log(`Created manuscript file at: ${manuscriptPath}`);

// Create a manual test data file
const dataContent = {
  title: "Manual Test Data",
  collection_type: "data",
  sections: [
    {
      title: "Manual Data Test",
      featured: true,
      content_level_1: "This is basic data content created manually.",
      content_level_3: "# Manual Data Test\n\nThis data content was created directly via script.",
      content_level_5: "# Detailed Manual Data Test\n\nThis detailed data content was created directly to test loading."
    }
  ]
};

const dataPath = path.join(dataDir, 'manual-test-data.json');
fs.writeFileSync(dataPath, JSON.stringify(dataContent, null, 2));
console.log(`Created data file at: ${dataPath}`);

console.log('Manual test content created successfully!');
console.log('Please refresh your browser and check if this content appears.');