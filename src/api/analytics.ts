// src/api/analytics.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  envVars: import.meta.env
});

const supabase = createClient(supabaseUrl, supabaseKey);

export const GET = async (request) => {
  try {
    console.log('Starting analytics GET request');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Configuration error: Missing Supabase credentials');
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log('Querying Supabase...');
    const { data, error } = await supabase
      .from('page_views')
      .select('viewed_at');

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Got Supabase response:', { dataLength: data?.length });

    const views = {
      total: data?.length || 0,
      today: data?.filter(view => new Date(view.viewed_at) >= startOfDay).length || 0,
      thisWeek: data?.filter(view => new Date(view.viewed_at) >= startOfWeek).length || 0,
      thisMonth: data?.filter(view => new Date(view.viewed_at) >= startOfMonth).length || 0
    };

    console.log('Processed view counts:', views);

    return new Response(JSON.stringify(views), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Detailed error in analytics GET:', {
      error,
      message: error.message,
      stack: error.stack
    });

    return new Response(JSON.stringify({
      error: 'Failed to fetch analytics data',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};