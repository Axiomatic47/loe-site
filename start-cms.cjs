const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 8083;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8082'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Basic file operations
app.get('/collections/:collection', async (req, res) => {
  try {
    const collection = req.params.collection;
    const contentDir = path.join(process.cwd(), 'content', collection);

    try {
      await fs.access(contentDir);
    } catch {
      await fs.mkdir(contentDir, { recursive: true });
      return res.json([]);
    }

    const files = await fs.readdir(contentDir);
    const contents = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
          try {
            return JSON.parse(content);
          } catch (e) {
            console.error(`Error parsing ${file}:`, e);
            return null;
          }
        })
    );
    res.json(contents.filter(Boolean));
  } catch (error) {
    console.error('Error reading collection:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/collections/:collection', async (req, res) => {
  try {
    const collection = req.params.collection;
    const contentDir = path.join(process.cwd(), 'content', collection);
    const timestamp = Date.now();
    const filename = `${req.body.title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`;

    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(
      path.join(contentDir, filename),
      JSON.stringify(req.body, null, 2)
    );

    res.status(201).json(req.body);
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Media handling
app.post('/media', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const mediaDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(mediaDir, { recursive: true });

    const filename = `${Date.now()}-${req.query.name || 'upload'}`;
    const filepath = path.join(mediaDir, filename);

    await fs.writeFile(filepath, req.body);
    res.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Error handling media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.listen(PORT, () => {
  console.log(`CMS backend server running on http://localhost:${PORT}`);
});