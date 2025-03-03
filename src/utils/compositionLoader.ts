// src/utils/compositionLoader.ts
import { Composition } from './compositionData';

export const loadCompositions = async (): Promise<Composition[]> => {
  try {
    console.log('Starting composition loading with timestamp:', new Date().toISOString());
    const compositions: Composition[] = [];

    // Check if we're in a development environment
    const isDev = import.meta.env.DEV;
    console.log('Running in development mode:', isDev);

    // When in dev mode, we'll directly fetch the files rather than using import.meta.glob
    // This ensures we always get the latest content
    if (isDev) {
      try {
        // Fetch manuscript files
        console.log('Fetching manuscript files via fetch API');
        const manuscriptResponse = await fetch('/content/manuscript/?timestamp=' + Date.now());
        if (manuscriptResponse.ok) {
          const manuscriptFiles = await manuscriptResponse.json();
          console.log('Manuscript files:', manuscriptFiles);

          for (const file of manuscriptFiles) {
            if (file.endsWith('.json')) {
              const fileResponse = await fetch(`/content/manuscript/${file}?timestamp=${Date.now()}`);
              if (fileResponse.ok) {
                const data = await fileResponse.json();
                console.log('Loaded manuscript data:', data);

                if (data && data.title) {
                  compositions.push({
                    id: compositions.length + 1,
                    title: data.title || '',
                    collection_type: 'manuscript',
                    section: 1,
                    section_title: data.sections?.[0]?.title || '',
                    featured: data.sections?.[0]?.featured || false,
                    content_level_1: data.sections?.[0]?.content_level_1 || '',
                    content_level_3: data.sections?.[0]?.content_level_3 || '',
                    content_level_5: data.sections?.[0]?.content_level_5 || '',
                    sections: Array.isArray(data.sections) ? data.sections : []
                  });
                }
              }
            }
          }
        } else {
          console.warn('Failed to fetch manuscript directory');
        }

        // Fetch data files
        console.log('Fetching data files via fetch API');
        const dataResponse = await fetch('/content/data/?timestamp=' + Date.now());
        if (dataResponse.ok) {
          const dataFiles = await dataResponse.json();
          console.log('Data files:', dataFiles);

          for (const file of dataFiles) {
            if (file.endsWith('.json')) {
              const fileResponse = await fetch(`/content/data/${file}?timestamp=${Date.now()}`);
              if (fileResponse.ok) {
                const data = await fileResponse.json();
                console.log('Loaded data collection:', data);

                if (data && data.title) {
                  compositions.push({
                    id: compositions.length + 1,
                    title: data.title || '',
                    collection_type: 'data',
                    section: 1,
                    section_title: data.sections?.[0]?.title || '',
                    featured: data.sections?.[0]?.featured || false,
                    content_level_1: data.sections?.[0]?.content_level_1 || '',
                    content_level_3: data.sections?.[0]?.content_level_3 || '',
                    content_level_5: data.sections?.[0]?.content_level_5 || '',
                    sections: Array.isArray(data.sections) ? data.sections : []
                  });
                }
              }
            }
          }
        } else {
          console.warn('Failed to fetch data directory');
        }
      } catch (error) {
        console.error('Error fetching content files:', error);
        // Fall back to import.meta.glob if fetch fails
      }
    }

    // If no compositions were loaded via fetch or we're not in dev mode, try import.meta.glob
    if (compositions.length === 0) {
      console.log('No compositions loaded yet, trying import.meta.glob');

      // Import manuscript files directly using Vite's import.meta.glob
      const manuscriptModules = import.meta.glob('/content/manuscript/*.json', {
        eager: true,
        import: 'default'
      });

      // Import data files directly
      const dataModules = import.meta.glob('/content/data/*.json', {
        eager: true,
        import: 'default'
      });

      console.log('Manuscript modules found:', Object.keys(manuscriptModules).length);
      console.log('Data modules found:', Object.keys(dataModules).length);

      // Process manuscript files
      for (const path in manuscriptModules) {
        const data = manuscriptModules[path] as any;
        console.log('Loading manuscript data via import.meta.glob:', data);

        if (data && data.title) {
          compositions.push({
            id: compositions.length + 1,
            title: data.title || '',
            collection_type: 'manuscript',
            section: 1,
            section_title: data.sections?.[0]?.title || '',
            featured: data.sections?.[0]?.featured || false,
            content_level_1: data.sections?.[0]?.content_level_1 || '',
            content_level_3: data.sections?.[0]?.content_level_3 || '',
            content_level_5: data.sections?.[0]?.content_level_5 || '',
            sections: Array.isArray(data.sections) ? data.sections : []
          });
        }
      }

      // Process data files
      for (const path in dataModules) {
        const data = dataModules[path] as any;
        console.log('Loading data collection via import.meta.glob:', data);

        if (data && data.title) {
          compositions.push({
            id: compositions.length + 1,
            title: data.title || '',
            collection_type: 'data',
            section: 1,
            section_title: data.sections?.[0]?.title || '',
            featured: data.sections?.[0]?.featured || false,
            content_level_1: data.sections?.[0]?.content_level_1 || '',
            content_level_3: data.sections?.[0]?.content_level_3 || '',
            content_level_5: data.sections?.[0]?.content_level_5 || '',
            sections: Array.isArray(data.sections) ? data.sections : []
          });
        }
      }
    }

    console.log('Final loaded compositions:', compositions);
    return compositions;
  } catch (error) {
    console.error('Error loading compositions:', error);
    throw error;
  }
};