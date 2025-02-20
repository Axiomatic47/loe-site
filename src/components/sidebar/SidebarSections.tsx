interface SidebarSectionsProps {
  sections: Array<{ id: number; title: string }>;
  currentSectionId: string;
  compositionId: string;
  onSectionClick: (sectionId: number) => void;
}

export const SidebarSections = ({ 
  sections, 
  currentSectionId, 
  onSectionClick 
}: SidebarSectionsProps) => {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={`w-full text-left py-2 px-4 rounded transition-colors ${
            Number(currentSectionId) === section.id
              ? "bg-white text-sidebar-accent font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          Section {section.id}
        </button>
      ))}
    </div>
  );
};