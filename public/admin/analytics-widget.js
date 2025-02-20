// public/admin/analytics-widget.js

(function() {
  // Get Supabase credentials from environment
  const supabaseUrl = window.localStorage.getItem('VITE_SUPABASE_URL');
  const supabaseKey = window.localStorage.getItem('VITE_SUPABASE_ANON_KEY');

  async function updateAnalytics() {
    try {
      const response = await fetch('/api/analytics/views');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();

      // Update the UI
      updateUI(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

  function updateUI(data) {
    // Find or create analytics container
    let container = document.getElementById('analytics-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'analytics-container';
      container.className = 'analytics-widget';

      // Add it to the top bar
      const topBar = document.querySelector('.css-12h6ic1-TopBar');
      if (topBar) {
        topBar.parentNode.insertBefore(container, topBar.nextSibling);
      }
    }

    // Update container content
    container.innerHTML = `
      <div style="background: white; padding: 15px; margin: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 10px; font-size: 16px;">Site Analytics</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
          <div>
            <div style="color: #666; font-size: 12px;">Total Views</div>
            <div style="font-size: 18px; font-weight: bold;">${data.total}</div>
          </div>
          <div>
            <div style="color: #666; font-size: 12px;">Today</div>
            <div style="font-size: 18px; font-weight: bold;">${data.today}</div>
          </div>
          <div>
            <div style="color: #666; font-size: 12px;">This Week</div>
            <div style="font-size: 18px; font-weight: bold;">${data.thisWeek}</div>
          </div>
          <div>
            <div style="color: #666; font-size: 12px;">This Month</div>
            <div style="font-size: 18px; font-weight: bold;">${data.thisMonth}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Register the widget with CMS
  if (window.CMS) {
    CMS.registerEventListener({
      name: 'preSave',
      handler: () => {
        // Initialize analytics when CMS is loaded
        updateAnalytics();
        // Update every minute
        setInterval(updateAnalytics, 60000);
      },
    });
  }
})();