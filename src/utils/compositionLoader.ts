// src/utils/compositionLoader.ts

import { Composition } from './compositionData';

export const loadCompositions = async (): Promise<Composition[]> => {
  try {
    console.log('Starting composition loading...');
    const compositions: Composition[] = [];

    // Import all JSON files from each content directory
    const manuscriptModules = import.meta.glob('../content/manuscript/*.json', {
      eager: true,
      import: 'default'
    });

    const dataModules = import.meta.glob('../content/data/*.json', {
      eager: true,
      import: 'default'
    });

    // Process test-repo data in development
    if (import.meta.env.DEV) {
      try {
        const testRepoData = localStorage.getItem('netlify-cms-test-repo');
        if (testRepoData) {
          const parsedData = JSON.parse(testRepoData);
          console.log('Found test-repo data:', parsedData);

          // Process test repo entries
          Object.entries(parsedData.collections || {}).forEach(([collectionName, entries]: [string, any]) => {
            entries.forEach((entry: any) => {
              if (entry.data) {
                compositions.push({
                  id: compositions.length + 1,
                  title: entry.data.title || '',
                  collection_type: entry.data.collection_type || collectionName,
                  section: 1,
                  section_title: entry.data.sections?.[0]?.title || '',
                  featured: entry.data.sections?.[0]?.featured || false,
                  content_level_1: entry.data.sections?.[0]?.content_level_1 || '',
                  content_level_3: entry.data.sections?.[0]?.content_level_3 || '',
                  content_level_5: entry.data.sections?.[0]?.content_level_5 || '',
                  sections: entry.data.sections || []
                });
              }
            });
          });
        }
      } catch (error) {
        console.error('Error loading test-repo data:', error);
      }
    }

    // Process file system modules
    const processModules = (modules: Record<string, any>, type: 'manuscript' | 'data') => {
      Object.entries(modules).forEach(([path, module]) => {
        if (module) {
          console.log(`Loading ${type} file:`, path, module);
          compositions.push({
            id: compositions.length + 1,
            title: module.title || '',
            collection_type: type,
            section: 1,
            section_title: module.sections?.[0]?.title || '',
            featured: module.sections?.[0]?.featured || false,
            content_level_1: module.sections?.[0]?.content_level_1 || '',
            content_level_3: module.sections?.[0]?.content_level_3 || '',
            content_level_5: module.sections?.[0]?.content_level_5 || '',
            sections: module.sections || []
          });
        }
      });
    };

    processModules(manuscriptModules, 'manuscript');
    processModules(dataModules, 'data');

    console.log('Final compositions:', compositions);
    return compositions;
  } catch (error) {
    console.error('Error loading compositions:', error);
    throw error;
  }
};