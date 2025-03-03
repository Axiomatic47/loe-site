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
  loading: boolean; // Add loading state to prevent multiple simultaneous calls
  setCompositions: (compositions: Composition[]) => void;
  refreshCompositions: () => Promise<void>;
}

export const useCompositionStore = create<CompositionStore>((set, get) => ({
  manuscript: [],
  data: [],
  map: [],
  initialized: false,
  loading: false,
  setCompositions: (compositions) => {
    console.log('Setting compositions:', compositions);
    const manuscript = compositions.filter(comp => comp.collection_type === 'manuscript');
    const data = compositions.filter(comp => comp.collection_type === 'data');
    const map = compositions.filter(comp => comp.collection_type === 'map');
    set({ manuscript, data, map, initialized: true });
  },
  refreshCompositions: async () => {
    // Skip if already loading or initialized and has compositions
    const state = get();
    if (state.loading) {
      console.log('Already loading compositions, skipping redundant call');
      return;
    }

    // If we already have compositions and are initialized, avoid unnecessary reloading
    if (state.initialized &&
        (state.manuscript.length > 0 || state.data.length > 0 || state.map.length > 0)) {
      console.log('Already have compositions, skipping redundant load');
      return;
    }

    console.log('Refreshing compositions...');
    set({ loading: true });

    try {
      const { loadCompositions } = await import('./compositionLoader');
      const compositions = await loadCompositions();
      console.log('Loaded compositions:', compositions);

      set({
        manuscript: compositions.filter(comp => comp.collection_type === 'manuscript'),
        data: compositions.filter(comp => comp.collection_type === 'data'),
        map: compositions.filter(comp => comp.collection_type === 'map'),
        initialized: true,
        loading: false
      });
    } catch (error) {
      console.error('Failed to refresh compositions:', error);
      set({ loading: false });
      throw error;
    }
  }
}));