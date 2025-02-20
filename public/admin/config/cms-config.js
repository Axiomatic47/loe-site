(() => {
  const isLocalhost = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

  const cmsConfig = {
    config: {
      local_backend: isLocalhost,
      backend: {
        name: 'git-gateway',
        branch: 'main',
        local_backend: isLocalhost
      },
      media_folder: 'public/uploads',
      public_folder: '/uploads',
      publish_mode: 'simple',
      editor: {
        preview: false
      },
      collections: [
        {
          name: 'compositions',
          label: 'Compositions',
          folder: 'content/compositions',
          create: true,
          sortable_fields: ['section'],
          sort: 'section',
          fields: [
            {
              label: 'Collection Type',
              name: 'collection_type',
              widget: 'select',
              options: [
                { label: 'Memorandum', value: 'memorandum' },
                { label: 'Corrective', value: 'corrective' }
              ],
              required: true
            },
            {
              label: 'Section',
              name: 'section',
              widget: 'hidden',
              default: 1
            },
            {
              label: 'Title',
              name: 'title',
              widget: 'string',
              required: true
            },
            {
              label: 'Description',
              name: 'description',
              widget: 'text',
              required: true
            },
            {
              label: 'Content (Level 1)',
              name: 'content_level_1',
              widget: 'markdown',
              required: true
            },
            {
              label: 'Content (Level 3)',
              name: 'content_level_3',
              widget: 'markdown',
              required: true
            },
            {
              label: 'Content (Level 5)',
              name: 'content_level_5',
              widget: 'markdown',
              required: true
            }
          ]
        }
      ]
    }
  };

  window.CMS.init(cmsConfig);
})();