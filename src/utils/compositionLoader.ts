// src/utils/compositionLoader.ts

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
        id: 1,
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
};