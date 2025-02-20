const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const analyticsService = {
  async getViewCounts() {
    try {
      // Get all views
      const { data: allViews, error } = await supabase
        .from('page_views')
        .select('viewed_at')
        .order('viewed_at', { ascending: false });

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

  async recordPageView(path) {
    try {
      console.log('Recording page view for path:', path);
      const { error } = await supabase
        .from('page_views')
        .insert([{
          path,
          viewed_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording page view:', error);
      return false;
    }
  }
};

module.exports = analyticsService;