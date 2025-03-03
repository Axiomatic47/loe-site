// CustomSidebar.js

(() => {
  const setupSidebar = () => {
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #custom-sidebar {
        position: fixed;
        left: 0;
        top: 48px;
        bottom: 0;
        width: 250px;
        background: #1A1F2C;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        overflow-y: auto;
        z-index: 100;
        color: white;
      }

      #custom-sidebar h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: white;
      }

      #add-section {
        width: 100%;
        padding: 8px;
        background: #2196f3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 16px;
        transition: background-color 0.2s;
      }

      #add-section:hover {
        background: #1976d2;
      }

      .section-item {
        padding: 12px;
        margin-bottom: 8px;
        background: #252A37;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        cursor: pointer;
        color: white;
        transition: all 0.2s;
      }

      .section-item:hover {
        background: #2F3545;
      }

      .section-item.active {
        background: #3A4055;
        border-color: #2196f3;
      }
    `;
    document.head.appendChild(styles);

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar';
    sidebar.innerHTML = `
      <h2>Sections</h2>
      <button id="add-section">Add Section</button>
      <div id="sections-list"></div>
    `;

    // Find appropriate container and insert sidebar
    const container = document.querySelector('.css-1gj57a0-AppMainContainer, .css-43ldtu-Collection');
    if (container) {
      container.parentNode.insertBefore(sidebar, container);
      container.style.marginLeft = '250px';
      container.style.width = 'calc(100% - 250px)';
    }

    // Add section functionality
    const addButton = sidebar.querySelector('#add-section');
    const addSection = async () => {
      try {
        const collections = CMS.getState().collections;
        const entries = collections.get('compositions')?.entries?.toJS() || [];
        const nextSection = entries.length > 0 ?
          Math.max(...entries.map(e => e.data.section || 0)) + 1 : 1;

        await CMS.store.dispatch({
          type: 'DRAFT_CREATE_NEW_ENTRY',
          payload: {
            collectionName: 'compositions',
            data: {
              collection_type: 'memorandum',
              section: nextSection,
              title: `New Section ${nextSection}`,
              description: '',
              content_level_1: '',
              content_level_3: '',
              content_level_5: ''
            }
          }
        });
      } catch (error) {
        console.error('Error creating section:', error);
      }
    };
    addButton.addEventListener('click', addSection);

    // Update sections list
    const updateSections = () => {
      try {
        const collections = CMS.getState().collections;
        const entries = collections.get('compositions')?.entries?.toJS() || [];
        const sortedEntries = entries.sort((a, b) =>
          (a.data.section || 0) - (b.data.section || 0)
        );

        const sectionsList = sidebar.querySelector('#sections-list');
        sectionsList.innerHTML = sortedEntries.map(entry => `
          <div class="section-item" data-slug="${entry.slug}">
            ${entry.data.title || 'Untitled Section'}
          </div>
        `).join('');

        // Add click handlers
        sectionsList.querySelectorAll('.section-item').forEach(item => {
          item.addEventListener('click', async () => {
            try {
              const entry = sortedEntries.find(e => e.slug === item.dataset.slug);
              if (entry) {
                // Save current entry if needed
                const currentEntry = CMS.getState().entryDraft;
                if (currentEntry && currentEntry.get('hasChanged')) {
                  await CMS.store.dispatch({
                    type: 'ENTRY_PERSIST',
                    payload: {
                      collectionName: 'compositions',
                      entryDraft: currentEntry.toJS(),
                      options: { raw: true }
                    }
                  });
                }

                // Load selected entry
                await CMS.store.dispatch({
                  type: 'DRAFT_CREATE_FROM_ENTRY',
                  payload: {
                    collectionName: 'compositions',
                    entry: entry
                  }
                });

                // Update active state
                document.querySelectorAll('.section-item').forEach(s =>
                  s.classList.toggle('active', s.dataset.slug === entry.slug)
                );
              }
            } catch (error) {
              console.error('Error switching sections:', error);
            }
          });
        });
      } catch (error) {
        console.error('Error updating sections:', error);
      }
    };

    // Set up store subscription
    if (CMS.store) {
      CMS.store.subscribe(updateSections);
      updateSections(); // Initial update
    }
  };

  // Initialize when CMS is ready
  const waitForCMS = () => {
    const checkCMS = () => {
      if (window.CMS) {
        // Wait a bit for CMS to fully initialize
        setTimeout(setupSidebar, 1000);
      } else {
        setTimeout(checkCMS, 100);
      }
    };
    checkCMS();
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', waitForCMS);
  } else {
    waitForCMS();
  }
})();