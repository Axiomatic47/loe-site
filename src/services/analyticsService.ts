// src/services/analyticsService.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ViewCount {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export const analyticsService = {
  async getViewCounts(): Promise<ViewCount> {
    try {
      const { data: allViews, error } = await supabase
        .from('page_views')
        .select('viewed_at');

      if (error) throw error;

      if (!allViews) return { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };

      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        total: allViews.length,
        today: allViews.filter(view => new Date(view.viewed_at) >= today).length,
        thisWeek: allViews.filter(view => new Date(view.viewed_at) >= thisWeek).length,
        thisMonth: allViews.filter(view => new Date(view.viewed_at) >= thisMonth).length,
      };
    } catch (error) {
      console.error('Error getting view counts:', error);
      return { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };
    }
  },

  async recordPageView(path: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_views')
        .insert([{
          path,
          viewed_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }
};