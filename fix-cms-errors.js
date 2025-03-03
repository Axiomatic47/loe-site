// fix-cms-errors.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===== STARTING CMS ERROR FIX =====');

// Define admin directory path
const adminDir = path.join(__dirname, 'public', 'admin');
const adminHtmlPath = path.join(adminDir, 'index.html');
const configYmlPath = path.join(adminDir, 'config.yml');

// Create new clean admin directory if it doesn't exist
if (!fs.existsSync(adminDir)) {
  console.log('Creating admin directory...');
  fs.mkdirSync(adminDir, { recursive: true });
}

// Remove any existing config files to prevent conflicts
const filesToRemove = [configYmlPath];
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Removing existing file: ${file}`);
    fs.unlinkSync(file);
  }
});

// Create a correct admin index.html file
const newAdminHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/netlify-cms@^2.10.192/dist/netlify-cms.js"></script>
    <script>
      // Configure CMS
      const config = {
        backend: {
          name: "test-repo"
        },
        local_backend: true,
        publish_mode: "simple",
        media_folder: "public/uploads",
        public_folder: "/uploads",
        collections: [
          {
            name: "manuscript",
            label: "Manuscript & White Papers",
            folder: "content/manuscript",
            create: true,
            format: "json",
            identifier_field: "title",
            fields: [
              {
                label: "Title",
                name: "title",
                widget: "string",
                required: true
              },
              {
                label: "Collection Type",
                name: "collection_type",
                widget: "hidden",
                default: "manuscript"
              },
              {
                label: "Sections",
                name: "sections",
                widget: "list",
                allow_add: true,
                fields: [
                  {
                    label: "Title",
                    name: "title",
                    widget: "string",
                    required: true
                  },
                  {
                    label: "Featured",
                    name: "featured",
                    widget: "boolean",
                    default: false
                  },
                  {
                    label: "Basic Content (Level 1)",
                    name: "content_level_1",
                    widget: "markdown",
                    required: false
                  },
                  {
                    label: "Intermediate Content (Level 3)",
                    name: "content_level_3",
                    widget: "markdown",
                    required: true
                  },
                  {
                    label: "Advanced Content (Level 5)",
                    name: "content_level_5",
                    widget: "markdown",
                    required: false
                  }
                ]
              }
            ]
          },
          {
            name: "data",
            label: "Data & Evidence",
            folder: "content/data",
            create: true,
            format: "json",
            identifier_field: "title",
            fields: [
              {
                label: "Title",
                name: "title",
                widget: "string",
                required: true
              },
              {
                label: "Collection Type",
                name: "collection_type",
                widget: "hidden",
                default: "data"
              },
              {
                label: "Sections",
                name: "sections",
                widget: "list",
                allow_add: true,
                fields: [
                  {
                    label: "Title",
                    name: "title",
                    widget: "string",
                    required: true
                  },
                  {
                    label: "Featured",
                    name: "featured",
                    widget: "boolean",
                    default: false
                  },
                  {
                    label: "Basic Content (Level 1)",
                    name: "content_level_1",
                    widget: "markdown",
                    required: false
                  },
                  {
                    label: "Intermediate Content (Level 3)",
                    name: "content_level_3",
                    widget: "markdown",
                    required: true
                  },
                  {
                    label: "Advanced Content (Level 5)",
                    name: "content_level_5",
                    widget: "markdown",
                    required: false
                  }
                ]
              }
            ]
          }
        ]
      };

      // Initialize the CMS with added error handling
      try {
        console.log('Initializing CMS with config:', config);
        CMS.init({ config });

        // Register valid event listeners
        CMS.registerEventListener({
          name: 'preSave',
          handler: ({ entry }) => {
            console.log('CMS preSave event - entry about to be saved:', entry.toJS());
            return entry;
          },
        });

        CMS.registerEventListener({
          name: 'postSave',
          handler: ({ entry }) => {
            console.log('CMS postSave event - entry saved:', entry.toJS());
            alert('Content saved successfully!');
          },
        });

        console.log('CMS initialized successfully');
      } catch (error) {
        console.error('Error initializing CMS:', error);
        alert('Error initializing CMS: ' + error.message);
      }
    </script>
  </body>
</html>`;

// Write the new index.html
console.log(`Writing new admin index.html to: ${adminHtmlPath}`);
fs.writeFileSync(adminHtmlPath, newAdminHtml);

// Ensure content directories exist with proper permissions
const contentDirs = [
  path.join(__dirname, 'content'),
  path.join(__dirname, 'content', 'manuscript'),
  path.join(__dirname, 'content', 'data'),
  path.join(__dirname, 'public', 'uploads')
];

contentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.chmodSync(dir, 0o777); // Set full permissions
    console.log(`Set permissions for: ${dir}`);
  } catch (error) {
    console.warn(`Could not set permissions for ${dir}:`, error.message);
  }
});

console.log('===== CMS ERROR FIX COMPLETED =====');
console.log('NEXT STEPS:');
console.log('1. Stop your development server (ctrl+c)');
console.log('2. Clear your browser cache or open a new incognito window');
console.log('3. Restart your server with: npm run dev:all');
console.log('===================================');