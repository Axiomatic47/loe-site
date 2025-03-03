// total-reset.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

console.log('===== TOTAL RESET STARTED =====');

// Kill any running servers
try {
  console.log('Stopping any running services...');
  execSync('kill -9 $(lsof -ti:8081,8082) || true', { stdio: 'inherit' });
} catch (error) {
  console.log('No services to stop or unable to stop them');
}

// Step 1: Remove ALL admin directories
const dirsToRemove = [
  path.join(rootDir, 'public', 'admin'),
  path.join(rootDir, 'public', 'minimal-admin'),
  path.join(rootDir, 'backup', 'admin')
];

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Removing directory: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// Step 2: Create new admin directory
const adminDir = path.join(rootDir, 'public', 'admin');
console.log(`Creating fresh admin directory: ${adminDir}`);
fs.mkdirSync(adminDir, { recursive: true });

// Step 3: Create a streamlined config.yml (the only configuration source)
const configYml = `backend:
  name: test-repo

# Explicitly enable the local backend
local_backend: true

# Media configuration
media_folder: "public/uploads"
public_folder: "/uploads"

# Collections
collections:
  # We'll only have a single collection to avoid any duplication
  - name: "content"
    label: "Content"
    folder: "content/compositions"
    create: true
    format: "json"
    identifier_field: "title"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Content Type", name: "content_type", widget: "select", options: ["manuscript", "data"]}
      - label: "Sections"
        name: "sections"
        widget: "list"
        fields:
          - {label: "Title", name: "title", widget: "string"}
          - {label: "Featured", name: "featured", widget: "boolean", default: false}
          - {label: "Basic Content (Level 1)", name: "content_level_1", widget: "markdown", required: false}
          - {label: "Intermediate Content (Level 3)", name: "content_level_3", widget: "markdown", required: true}
          - {label: "Advanced Content (Level 5)", name: "content_level_5", widget: "markdown", required: false}
`;

console.log('Creating config.yml...');
fs.writeFileSync(path.join(adminDir, 'config.yml'), configYml);

// Step 4: Create an absolute minimum index.html with NO JavaScript configuration
const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager (Reset)</title>
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>
  <body>
    <!-- Status indicator to confirm we're using the clean version -->
    <div style="position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; z-index: 1000;">
      Clean Admin v1
    </div>

    <!-- Only load the CMS library with no configuration -->
    <script src="https://unpkg.com/netlify-cms@^2.10.192/dist/netlify-cms.js"></script>
    <script>
      console.log('Loading clean admin with timestamp: ${new Date().toISOString()}');
    </script>
  </body>
</html>`;

console.log('Creating minimal index.html...');
fs.writeFileSync(path.join(adminDir, 'index.html'), indexHtml);

// Step 5: Ensure content directories exist
const contentDirs = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content', 'compositions'),
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

// Step 6: Update compositionLoader.ts to look in the right directory
const compositionLoader = `// src/utils/compositionLoader.ts

import { Composition } from './compositionData';

export const loadCompositions = async (): Promise<Composition[]> => {
  try {
    const compositions: Composition[] = [];

    // Import all JSON files from the compositions directory
    const modules = import.meta.glob('/content/compositions/*.json', {
      eager: true,
      import: 'default'
    });

    for (const path in modules) {
      const data = modules[path] as any;
      console.log('Loading composition data:', data);

      // Use first section for the main preview
      const firstSection = data.sections?.[0] || {};

      // Map content_type to collection_type for backward compatibility
      const collectionType = data.content_type || data.collection_type || 'manuscript';

      const composition = {
        id: compositions.length + 1,
        title: data.title,
        collection_type: collectionType,
        section: 1,
        section_title: firstSection.title || '',
        featured: firstSection.featured || false,
        content_level_1: firstSection.content_level_1 || '',
        content_level_3: firstSection.content_level_3 || '',
        content_level_5: firstSection.content_level_5 || '',
        sections: data.sections || []
      };

      compositions.push(composition);
    }

    console.log('Final compositions array:', compositions);
    return compositions;
  } catch (error) {
    console.error('Error loading compositions:', error);
    throw error;
  }
};`;

// Check if we can write to the compositionLoader file
const compositionLoaderPath = path.join(rootDir, 'src', 'utils', 'compositionLoader.ts');
if (fs.existsSync(compositionLoaderPath)) {
  console.log('Updating compositionLoader.ts...');
  fs.writeFileSync(compositionLoaderPath, compositionLoader);
} else {
  console.warn(`Could not find ${compositionLoaderPath}`);
}

// Step 7: Update package.json to ensure we're using the right commands
const packageJsonPath = path.join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['cms'] = 'netlify-cms-proxy-server';
  packageJson.scripts['killports'] = 'kill -9 $(lsof -ti:8081,8082) || true';
  packageJson.scripts['dev:all'] = 'npm run killports && concurrently "npm run dev" "npm run cms"';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json scripts');
} catch (error) {
  console.error('Error updating package.json:', error);
}

// Step 8: Migrate existing content to the new structure
console.log('Migrating existing content...');

// Create compositions directory if it doesn't exist
const compositionsDir = path.join(rootDir, 'content', 'compositions');
if (!fs.existsSync(compositionsDir)) {
  fs.mkdirSync(compositionsDir, { recursive: true });
}

// Function to process content from a directory
const migrateContent = (sourceDir, contentType) => {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

  files.forEach(file => {
    try {
      const filePath = path.join(sourceDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Set content_type field
      data.content_type = contentType;

      // Generate a new filename
      const newFileName = `${contentType}-${file}`;
      const newFilePath = path.join(compositionsDir, newFileName);

      fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
      console.log(`Migrated ${file} to ${newFileName}`);
    } catch (error) {
      console.error(`Error migrating ${file}:`, error.message);
    }
  });
};

// Migrate manuscript and data content
migrateContent(path.join(rootDir, 'content', 'manuscript'), 'manuscript');
migrateContent(path.join(rootDir, 'content', 'data'), 'data');

console.log('===== TOTAL RESET COMPLETE =====');
console.log('NEXT STEPS:');
console.log('1. Clear your browser cache or open a new incognito window');
console.log('2. Start the development server: npm run dev:all');
console.log('3. Open http://localhost:3000/admin/ in your browser');
console.log('===================================');