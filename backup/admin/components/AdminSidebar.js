const AdminSidebar = ({ sections, currentSection, onSectionSelect }) => {
  const e = React.createElement;

  // Group sections by collection type
  const groupedSections = sections.reduce((acc, section) => {
    const type = section.collection_type || 'memorandum';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(section);
    return acc;
  }, {});

  // Helper to get the formatted title for each collection type
  const getCollectionTitle = (type) => {
    switch (type) {
      case 'memorandum':
        return 'Memorandum and Manifestation';
      case 'corrective':
        return 'Corrective Measures';
      default:
        return 'Documents';
    }
  };

  return e('div', {
    className: "w-64 min-h-screen bg-[#1A1F2C] text-white"
  }, [
    // Collection title
    e('div', {
      key: 'header',
      className: "p-6 space-y-6"
    }, [
      e('div', {}, [
        e('h2', {
          className: "text-lg font-medium text-white mb-1"
        }, getCollectionTitle(currentSection?.collection_type)),
        e('p', {
          className: "text-sm text-white/60"
        }, "Understanding Corporate Personhood")
      ]),
      // Navigation section
      e('nav', {
        className: "space-y-2"
      },
        sections.map(section =>
          e('button', {
            key: section.title,
            onClick: () => onSectionSelect(section),
            className: `w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentSection?.title === section.title
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`
          }, section.title)
        )
      )
    ])
  ]);
};

export default AdminSidebar;