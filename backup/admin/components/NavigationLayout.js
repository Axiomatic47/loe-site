// /public/admin/components/NavigationLayout.js

const NavigationLayout = {
  id: "navigation-layout",
  label: "Navigation",
  pattern: /.*/,

  init: function(opts) {
    const { collection, actions } = opts;

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-navigation';
    sidebar.style.cssText = `
      position: fixed;
      left: 0;
      top: 48px;
      bottom: 0;
      width: 250px;
      background: #f5f5f5;
      border-right: 1px solid #ddd;
      padding: 20px;
      overflow-y: auto;
    `;

    // Create analytics container
    const analyticsContainer = document.createElement('div');
    analyticsContainer.id = 'analytics-container';
    analyticsContainer.style.cssText = `
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;

    // Initialize view counter
    const initializeViewCounter = async () => {
      try {
        const response = await fetch('/api/analytics/views');
        const data = await response.json();

        analyticsContainer.innerHTML = `
          <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">Site Analytics</h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
            <div>
              <div style="color: #666; font-size: 12px;">Total Views</div>
              <div style="font-size: 18px; font-weight: 600;">${data.total}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px;">Today</div>
              <div style="font-size: 18px; font-weight: 600;">${data.today}</div>
            </div>
          </div>
        `;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        analyticsContainer.innerHTML = '<p style="color: #666;">Unable to load analytics</p>';
      }
    };

    // Add sections list
    const refreshSections = async () => {
      // Get entries from the store
      const entries = await opts.api.listEntries({
        collection: collection.get('name')
      });

      // Sort entries by section number
      const sortedEntries = entries.entries.sort((a, b) =>
        (a.data.section || 0) - (b.data.section || 0)
      );

      // Create sections HTML
      const sectionsHtml = sortedEntries.map(entry => `
        <div class="section-item" data-id="${entry.slug}" draggable="true">
          <span style="margin-right: 8px;">≡</span>
          ${entry.data.title}
        </div>
      `).join('');

      const sectionsContainer = document.createElement('div');
      sectionsContainer.innerHTML = `
        <h2 style="margin: 16px 0; font-size: 18px;">Sections</h2>
        <button style="width: 100%; padding: 8px; margin-bottom: 16px; background: #2196f3; color: white; border: none; border-radius: 4px;">
          Add Section
        </button>
        <div id="sections-list" style="space-y-2">
          ${sectionsHtml}
        </div>
      `;

      // Clear existing content and add new content
      sidebar.innerHTML = '';
      sidebar.appendChild(analyticsContainer);
      sidebar.appendChild(sectionsContainer);

      // Add click handlers
      const sectionItems = sidebar.querySelectorAll('.section-item');
      sectionItems.forEach(item => {
        item.addEventListener('click', () => {
          const entry = sortedEntries.find(e => e.slug === item.dataset.id);
          if (entry) {
            actions.navigateToEntry(entry.collection, entry.slug);
          }
        });

        // Style section items
        item.style.cssText = `
          padding: 8px;
          margin-bottom: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        `;

        // Add hover effect
        item.addEventListener('mouseover', () => {
          item.style.backgroundColor = '#f5f5f5';
        });
        item.addEventListener('mouseout', () => {
          item.style.backgroundColor = 'white';
        });
      });
    };

    // Initial render
    initializeViewCounter();
    refreshSections();

    // Update analytics every minute
    setInterval(initializeViewCounter, 60000);

    // Subscribe to changes for sections
    opts.store.subscribe(refreshSections);

    // Add to document
    document.body.appendChild(sidebar);

    // Adjust main content
    const mainContent = document.querySelector('[class*="AppMainContainer"]');
    if (mainContent) {
      mainContent.style.marginLeft = '250px';
      mainContent.style.width = 'calc(100% - 250px)';
    }

    return `
      <div>
        ${opts.children}
      </div>
    `;
  }
};

CMS.registerLayout(NavigationLayout);