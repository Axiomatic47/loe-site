// public/admin/widgets/featured-sections.js

const h = window.React.createElement;

const FeaturedSectionsWidget = createClass({
  render: function() {
    const collections = this.props.collections;
    const compositions = collections.get('compositions');
    let featuredSections = [];

    if (compositions) {
      const entries = compositions.get('entries');
      entries.forEach(entry => {
        const data = entry.get('data');
        const sections = data.get('sections');
        const collectionType = data.get('collection_type');

        sections.forEach((section, index) => {
          if (section.get('featured')) {
            featuredSections.push({
              title: section.get('title'),
              collection: collectionType,
              entryPath: `compositions/${entry.get('slug')}`,
              sectionIndex: index
            });
          }
        });
      });
    }

    return h('div', {className: 'featured-sections-widget'},
      h('h2', {className: 'featured-widget-title'}, 'Featured Sections'),
      featuredSections.length === 0
        ? h('p', {className: 'no-featured'}, 'No sections are currently featured')
        : h('div', {className: 'featured-list'},
            featuredSections.map(section =>
              h('div', {className: 'featured-item', key: section.entryPath + section.sectionIndex},
                h('div', {className: 'featured-item-header'},
                  h('span', {className: 'featured-item-title'}, section.title),
                  h('span', {className: 'featured-item-collection'},
                    section.collection.charAt(0).toUpperCase() + section.collection.slice(1)
                  )
                ),
                h('a', {
                  className: 'featured-item-edit',
                  href: `#/collections/compositions/entries/${section.entryPath}`,
                  onClick: (e) => {
                    e.preventDefault();
                    this.props.navigateToEntry('compositions', section.entryPath);
                  }
                }, 'Edit Section')
              )
            )
          )
    );
  }
});

if (window.CMS) {
  try {
    window.CMS.registerWidget('featuredSections', FeaturedSectionsWidget);
    console.log('Featured Sections widget registered successfully');
  } catch (err) {
    console.error('Failed to register Featured Sections widget:', err);
  }
}