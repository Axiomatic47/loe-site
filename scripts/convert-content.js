// scripts/convert-content.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('Converting content files to the correct format...');

// Content directories
const contentDirs = [
  path.join(rootDir, 'content/manuscript'),
  path.join(rootDir, 'content/data')
];

// Ensure directories exist
contentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Process each directory
contentDirs.forEach(dir => {
  const dirName = path.basename(dir);
  console.log(`Processing ${dirName} directory...`);

  // Read all JSON files
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
  console.log(`Found ${files.length} JSON files in ${dirName}`);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    console.log(`Processing ${file}...`);

    try {
      // Read and parse the file
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Skip if already has sections array
      if (Array.isArray(data.sections)) {
        console.log(`${file} already has sections array, skipping`);
        return;
      }

      // Create a new structure
      const newData = {
        title: data.title || path.basename(file, '.json'),
        collection_type: data.collection_type || dirName,
        sections: []
      };

      // If the file has direct content fields, convert them to a section
      if (data.content_level_1 || data.content_level_3 || data.content_level_5) {
        newData.sections.push({
          title: data.section_title || data.title || "Section 1",
          featured: data.featured || false,
          content_level_1: data.content_level_1 || "",
          content_level_3: data.content_level_3 || "",
          content_level_5: data.content_level_5 || ""
        });
      } else {
        // Create a default section
        newData.sections.push({
          title: "Section 1",
          featured: false,
          content_level_1: "Basic content",
          content_level_3: "# Default content\n\nThis section was created during content conversion.",
          content_level_5: "Advanced content"
        });
      }

      // Create a backup
      const backupPath = path.join(dir, `${path.basename(file, '.json')}.backup.json`);
      fs.writeFileSync(backupPath, content);
      console.log(`Created backup at ${backupPath}`);

      // Write the new structure
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      console.log(`Updated ${file} to new format`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
});

// Create a sample file if no files exist
contentDirs.forEach(dir => {
  const dirName = path.basename(dir);
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log(`No files found in ${dirName}, creating a sample file...`);

    const sampleContent = {
      title: `Sample ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}`,
      collection_type: dirName,
      sections: [
        {
          title: "Introduction",
          featured: true,
          content_level_1: "This is basic content for the introduction.",
          content_level_3: "# Introduction\n\nThis is intermediate content for the introduction.",
          content_level_5: "# Advanced Introduction\n\nThis is advanced content for the introduction."
        },
        {
          title: "Main Content",
          featured: false,
          content_level_1: "This is basic content for the main section.",
          content_level_3: "# Main Content\n\nThis is intermediate content for the main section.",
          content_level_5: "# Advanced Main Content\n\nThis is advanced content for the main section."
        }
      ]
    };

    const samplePath = path.join(dir, `sample-${dirName}.json`);
    fs.writeFileSync(samplePath, JSON.stringify(sampleContent, null, 2));
    console.log(`Created sample file at ${samplePath}`);
  }
});

console.log('Content conversion complete!');