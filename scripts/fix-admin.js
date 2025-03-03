// scripts/fix-admin.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('Setting up proper admin files...');

// Define paths
const adminDir = path.join(rootDir, 'public', 'admin');
const adminHtmlPath = path.join(adminDir, 'index.html');

// Ensure admin directory exists
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

// Create a correct admin index.html file
const newAdminHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
    <!-- Force no caching -->
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>
  <body>
    <!-- We're including a note to verify that this is the correct version -->
    <div id="admin-version" style="display:none;">Fixed version (${new Date().toISOString()})</div>

    <script src="https://unpkg.com/netlify-cms@^2.10.192/dist/netlify-cms.js"></script>
    <script>
      console.log("Admin interface loading with timestamp: ${new Date().toISOString()}");

      // Configure CMS - Using port 8082 instead of 8081
      const config = {
        backend: {
          name: "test-repo"
        },
        local_backend: {
          url: window.location.protocol + "//" + window.location.hostname + ":8082/api/v1"
        },
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
            // Show a notification
            const notification = document.createElement('div');
            notification.style.cssText = \`
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 15px 20px;
              border-radius: 4px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              z-index: 1000;
            \`;
            notification.innerText = 'Content saved successfully!';
            document.body.appendChild(notification);

            setTimeout(() => {
              document.body.removeChild(notification);
            }, 3000);
          },
        });

        console.log('CMS initialized successfully');
      } catch (error) {
        console.error('Error initializing CMS:', error);
      }
    </script>
  </body>
</html>`;

// Write the new index.html
console.log(`Creating admin index.html at: ${adminHtmlPath}`);
fs.writeFileSync(adminHtmlPath, newAdminHtml);

// Ensure content directories exist with proper permissions
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

// Create a test file to verify permissions
const testFilePath = path.join(rootDir, 'content', 'test-permissions.json');
try {
  fs.writeFileSync(testFilePath, JSON.stringify({
    test: true,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`Created test file: ${testFilePath}`);
} catch (error) {
  console.error('Error creating test file:', error.message);
}

// Create a modified package.json script for starting the CMS on a different port
// First, read the current package.json
const packageJsonPath = path.join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Modify the cms script to use port 8082
  if (packageJson.scripts && packageJson.scripts.cms) {
    packageJson.scripts.cms = "npx netlify-cms-proxy-server -p 8082";

    // Add a new script for cleaning up ports
    packageJson.scripts.killports = "kill -9 $(lsof -ti:8081,8082) || true";

    // Write back the modified package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json to use port 8082 for CMS proxy');
  }
} catch (error) {
  console.error('Error updating package.json:', error.message);
}

console.log('Admin setup complete. Please run these commands:');
console.log('1. kill -9 $(lsof -ti:8081,8082) || true');
console.log('2. npm run dev:all');