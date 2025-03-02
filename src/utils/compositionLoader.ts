// src/utils/compositionLoader.ts
import { Composition } from './compositionData';

export const loadCompositions = async (): Promise<Composition[]> => {
  try {
    console.log('Starting composition loading...');
    const compositions: Composition[] = [];

    // Helper function to handle fetch errors
    const fetchWithRetry = async (url: string, retries = 3, delay = 500) => {
      let lastError;

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.warn(`Fetch attempt ${i + 1} failed:`, error);
          lastError = error;
          await new Promise(r => setTimeout(r, delay));
          delay *= 1.5; // Exponential backoff
        }
      }

      console.error(`Failed to fetch after ${retries} attempts:`, lastError);
      return [];
    };

    // Load manuscript compositions
    console.log('Fetching manuscript data...');
    const manuscriptData = await fetchWithRetry('/api/collections/manuscript');
    console.log('Manuscript data:', manuscriptData);

    if (Array.isArray(manuscriptData) && manuscriptData.length > 0) {
      manuscriptData.forEach((entry: any, index: number) => {
        if (entry && entry.title) {
          compositions.push({
            id: compositions.length + 1,
            title: entry.title || '',
            collection_type: 'manuscript',
            section: index + 1,
            section_title: entry.sections?.[0]?.title || '',
            featured: entry.sections?.[0]?.featured || false,
            content_level_1: entry.sections?.[0]?.content_level_1 || '',
            content_level_3: entry.sections?.[0]?.content_level_3 || '',
            content_level_5: entry.sections?.[0]?.content_level_5 || '',
            sections: Array.isArray(entry.sections) ? entry.sections : []
          });
        }
      });
    } else {
      console.log('No manuscript data found or invalid format');
    }

    // Load data compositions
    console.log('Fetching data collection...');
    const dataData = await fetchWithRetry('/api/collections/data');
    console.log('Data collection:', dataData);

    if (Array.isArray(dataData) && dataData.length > 0) {
      dataData.forEach((entry: any, index: number) => {
        if (entry && entry.title) {
          compositions.push({
            id: compositions.length + 1,
            title: entry.title || '',
            collection_type: 'data',
            section: index + 1,
            section_title: entry.sections?.[0]?.title || '',
            featured: entry.sections?.[0]?.featured || false,
            content_level_1: entry.sections?.[0]?.content_level_1 || '',
            content_level_3: entry.sections?.[0]?.content_level_3 || '',
            content_level_5: entry.sections?.[0]?.content_level_5 || '',
            sections: Array.isArray(entry.sections) ? entry.sections : []
          });
        }
      });
    } else {
      console.log('No data collection found or invalid format');
    }

    console.log('Loaded compositions:', compositions);
    return compositions;
  } catch (error) {
    console.error('Error loading compositions:', error);
    throw error;
  }
};