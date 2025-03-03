// scripts/migrate-to-decap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('===== MIGRATING TO DECAP CMS =====');

// Kill any running proxy servers
try {
  console.log('Stopping running services...');
  execSync('kill -9 $(lsof -ti:8081,8082) || true', { stdio: 'inherit' });
} catch (error) {
  console.log('No services to stop or unable to stop them');
}

// Ensure directories exist
const directories = [
  path.join(rootDir, 'content'),
  path.join(rootDir, 'content', 'compositions'),
  path.join(rootDir, 'public', 'admin'),
  path.join(rootDir, 'public', 'uploads')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 1. Create the config.yml file with the corporateveil configuration
const configYml = `backend:
  name: test-repo

local_backend: true

media_folder: "public/uploads"
public_folder: "/uploads"
format: "json"

editor:
  preview: false

collections:
  - name: "compositions"
    label: "Compositions"
    folder: "content/compositions"
    create: true
    extension: "json"
    slug: "{{collection_type}}-{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Type", name: "collection_type", widget: "select", options: ["memorandum", "corrective"]}
      - label: "Sections"
        name: "sections"
        widget: "list"
        allow_add: true
        label_singular: "Section"
        summary: "{{fields.title}}"
        fields:
          - {label: "Title", name: "title", widget: "string"}
          - {label: "Featured on Homepage", name: "featured", widget: "boolean", default: false, required: false}
          - label: "Basic Content (Level 1)"
            name: "content_level_1"
            widget: "markdown"
            required: false
            hint: "Optional - will default to intermediate content if left blank"
          - label: "Intermediate Content (Level 3)"
            name: "content_level_3"
            widget: "markdown"
            required: true
          - label: "Advanced Content (Level 5)"
            name: "content_level_5"
            widget: "markdown"
            required: false
            hint: "Optional - will default to intermediate content if left blank"
`;

console.log('Creating config.yml...');
fs.writeFileSync(path.join(rootDir, 'public', 'admin', 'config.yml'), configYml);

// 2. Create the admin/index.html file with decap-cms
const adminHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.5.0/dist/decap-cms.js"></script>
    <script>
      console.log('Initializing Decap CMS...');
    </script>
  </body>
</html>`;

console.log('Creating admin/index.html...');
fs.writeFileSync(path.join(rootDir, 'public', 'admin', 'index.html'), adminHtml);

// 3. Update compositionLoader.ts
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
      const composition = {
        id: compositions.length + 1,
        title: data.title,
        collection_type: data.collection_type,
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

// 4. Update compositionData.ts
const compositionData = `// src/utils/compositionData.ts

import { create } from 'zustand';

export interface Section {
  title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
}

export interface Composition {
  id: number;
  title: string;
  collection_type: 'memorandum' | 'corrective';
  section: number;
  section_title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  sections: Section[];
}

interface CompositionStore {
  memorandum: Composition[];
  corrective: Composition[];
  initialized: boolean;
  setCompositions: (compositions: Composition[]) => void;
  refreshCompositions: () => Promise<void>;
}

export const useCompositionStore = create<CompositionStore>((set) => ({
  memorandum: [],
  corrective: [],
  initialized: false,
  setCompositions: (compositions) => {
    const memorandum = compositions.filter(comp => comp.collection_type === 'memorandum');
    const corrective = compositions.filter(comp => comp.collection_type === 'corrective');
    set({ memorandum, corrective, initialized: true });
  },
  refreshCompositions: async () => {
    const { loadCompositions } = await import('./compositionLoader');
    try {
      const compositions = await loadCompositions();
      set(state => ({
        ...state,
        memorandum: compositions.filter(comp => comp.collection_type === 'memorandum'),
        corrective: compositions.filter(comp => comp.collection_type === 'corrective'),
        initialized: true
      }));
    } catch (error) {
      console.error('Failed to refresh compositions:', error);
      throw error;
    }
  }
}));`;

// Check if we can write to the compositionData file
const compositionDataPath = path.join(rootDir, 'src', 'utils', 'compositionData.ts');
if (fs.existsSync(compositionDataPath)) {
  console.log('Updating compositionData.ts...');
  fs.writeFileSync(compositionDataPath, compositionData);
} else {
  console.warn(`Could not find ${compositionDataPath}`);
}

// 5. Migrate any existing content from manuscript/data to compositions
console.log('Migrating existing content...');
const manuscriptDir = path.join(rootDir, 'content', 'manuscript');
const dataDir = path.join(rootDir, 'content', 'data');
const compositionsDir = path.join(rootDir, 'content', 'compositions');

// Process manuscript files
if (fs.existsSync(manuscriptDir)) {
  const manuscriptFiles = fs.readdirSync(manuscriptDir).filter(file => file.endsWith('.json'));

  manuscriptFiles.forEach(file => {
    try {
      const filePath = path.join(manuscriptDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      // Add collection_type if not present
      if (!data.collection_type) {
        data.collection_type = 'memorandum';
      }

      // Generate new filename
      const slug = file.replace('.json', '');
      const newFilename = `memorandum-${slug}.json`;
      const newFilePath = path.join(compositionsDir, newFilename);

      fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
      console.log(`Migrated ${file} to ${newFilename}`);
    } catch (error) {
      console.error(`Error migrating ${file}:`, error);
    }
  });
}

// Process data files
if (fs.existsSync(dataDir)) {
  const dataFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

  dataFiles.forEach(file => {
    try {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      // Convert data to corrective type
      data.collection_type = 'corrective';

      // Generate new filename
      const slug = file.replace('.json', '');
      const newFilename = `corrective-${slug}.json`;
      const newFilePath = path.join(compositionsDir, newFilename);

      fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
      console.log(`Migrated ${file} to ${newFilename}`);
    } catch (error) {
      console.error(`Error migrating ${file}:`, error);
    }
  });
}

// 6. Update package.json to add decap-cms dependencies
console.log('Updating package.json...');
const packageJsonPath = path.join(rootDir, 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add decap-cms dependency
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['decap-cms-app'] = '^3.5.0';

  // Update scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['cms'] = 'decap-cms-proxy-server';
  packageJson.scripts['dev:all'] = 'concurrently "npm run dev" "npm run cms"';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Install the new dependency
  console.log('Installing decap-cms-app...');
  try {
    execSync('npm install --save decap-cms-app@^3.5.0', { stdio: 'inherit' });
    console.log('Dependency installed successfully.');
  } catch (error) {
    console.error('Failed to install dependency:', error);
    console.log('Please run "npm install --save decap-cms-app@^3.5.0" manually');
  }
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('===== MIGRATION COMPLETE =====');
console.log('NEXT STEPS:');
console.log('1. Install dependencies: npm install');
console.log('2. Start the development server: npm run dev:all');
console.log('3. Access the admin at: http://localhost:3000/admin/');
console.log('===================================');