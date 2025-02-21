// src/utils/compositionData.ts

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
  collection_type: 'manuscript' | 'data' | 'map';
  section: number;
  section_title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  sections: Section[];
}

interface CompositionStore {
  manuscript: Composition[];
  data: Composition[];
  map: Composition[];
  initialized: boolean;
  setCompositions: (compositions: Composition[]) => void;
  refreshCompositions: () => Promise<void>;
}

export const useCompositionStore = create<CompositionStore>((set) => ({
  manuscript: [],
  data: [],
  map: [],
  initialized: false,
  setCompositions: (compositions) => {
    console.log('Setting compositions:', compositions);
    const manuscript = compositions.filter(comp => comp.collection_type === 'manuscript');
    const data = compositions.filter(comp => comp.collection_type === 'data');
    const map = compositions.filter(comp => comp.collection_type === 'map');
    set({ manuscript, data, map, initialized: true });
  },
  refreshCompositions: async () => {
    console.log('Refreshing compositions...');
    try {
      const { loadCompositions } = await import('./compositionLoader');
      const compositions = await loadCompositions();
      console.log('Loaded compositions:', compositions);
      set(state => ({
        ...state,
        manuscript: compositions.filter(comp => comp.collection_type === 'manuscript'),
        data: compositions.filter(comp => comp.collection_type === 'data'),
        map: compositions.filter(comp => comp.collection_type === 'map'),
        initialized: true
      }));
    } catch (error) {
      console.error('Failed to refresh compositions:', error);
      throw error;
    }
  }
}));