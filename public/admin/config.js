// public/admin/config.js

window.config = {
  backend: {
    name: "test-repo"
  },
  local_backend: {
    url: "http://localhost:8083"
  },
  publish_mode: "simple",
  media_folder: "public/uploads",
  public_folder: "/uploads",
  collections: [
    {
      name: "manuscript",
      label: "Manuscript & White Papers",
      folder: "content/manuscript",
      create: true,
      format: "json",
      identifier_field: "title",
      fields: [
        {
          label: "Title",
          name: "title",
          widget: "string"
        },
        {
          label: "Type",
          name: "collection_type",
          widget: "hidden",
          default: "manuscript"
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
    },
    {
      name: "data",
      label: "Data & Evidence",
      folder: "content/data",
      create: true,
      format: "json",
      identifier_field: "title",
      fields: [
        {
          label: "Title",
          name: "title",
          widget: "string"
        },
        {
          label: "Type",
          name: "collection_type",
          widget: "hidden",
          default: "data"
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
};