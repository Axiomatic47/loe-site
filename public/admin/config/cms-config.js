// public/admin/config.js

window.CMS_MANUAL_INIT = true;

window.addEventListener('load', () => {
  console.log('Initializing CMS with config...');
  window.CMS.init({
    config: {
      load_config_file: false,
      local_backend: {
        url: 'http://localhost:8082/api/v1',  // Changed to go through the proxy server
      },
      backend: {
        name: "git-gateway",
        branch: "main",
        local_backend: window.location.hostname === "localhost"
      },
      media_folder: "public/uploads",
      public_folder: "/uploads",
      collections: [
        {
          name: "compositions",
          label: "Compositions",
          folder: "content/compositions",
          create: true,
          extension: "json",
          format: "json",
          slug: "{{collection_type}}-{{slug}}",
          preview_path: "composition/{{collection_type}}/section/1",
          fields: [
            {
              label: "Title",
              name: "title",
              widget: "string"
            },
            {
              label: "Type",
              name: "collection_type",
              widget: "select",
              options: [
                { label: "Memorandum & White Papers", value: "memorandum" },
                { label: "Data & Evidence", value: "corrective" }
              ]
            },
            {
              label: "Sections",
              name: "sections",
              widget: "list",
              allow_add: true,
              fields: [
                {
                  label: "Title",
                  name: "title",
                  widget: "string"
                },
                {
                  label: "Featured",
                  name: "featured",
                  widget: "boolean",
                  default: false
                },
                {
                  label: "Basic Content (Level 1)",
                  name: "content_level_1",
                  widget: "markdown",
                  required: false
                },
                {
                  label: "Intermediate Content (Level 3)",
                  name: "content_level_3",
                  widget: "markdown"
                },
                {
                  label: "Advanced Content (Level 5)",
                  name: "content_level_5",
                  widget: "markdown",
                  required: false
                }
              ]
            }
          ]
        }
      ]
    }
  }).then(() => {
    console.log('CMS initialized successfully');
  }).catch(error => {
    console.error('CMS initialization failed:', error);
  });
});