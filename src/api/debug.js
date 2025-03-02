// src/api/debug.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const router = express.Router();

// Debug API endpoint to check content files
router.get('/debug/content', (req, res) => {
  try {
    const contentDir = path.join(rootDir, 'content');

    // Get all content directories
    const dirs = fs.readdirSync(contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Collect information about each directory
    const contentInfo = {};

    for (const dir of dirs) {
      const dirPath = path.join(contentDir, dir);

      // Get all files in the directory
      const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.json'));

      // Collect basic info about each file
      const fileInfo = files.map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        let fileContent = null;
        try {
          const rawContent = fs.readFileSync(filePath, 'utf8');
          fileContent = JSON.parse(rawContent);
        } catch (error) {
          fileContent = { error: `Failed to parse file: ${error.message}` };
        }

        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          content: fileContent
        };
      });

      contentInfo[dir] = {
        path: dirPath,
        fileCount: files.length,
        files: fileInfo
      };
    }

    res.json({
      success: true,
      contentRoot: contentDir,
      directories: dirs,
      contentInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Create test content endpoint
router.post('/debug/create-test-content', (req, res) => {
  try {
    // Import the setup script and run it
    import('../../scripts/setup-content.js')
      .then(() => {
        res.json({
          success: true,
          message: 'Test content created successfully'
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          error: error.message,
          stack: error.stack
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;