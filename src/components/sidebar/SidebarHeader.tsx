interface SidebarHeaderProps {
  collectionName: string;
  compositionTitle: string;
}

export const SidebarHeader = ({ collectionName, compositionTitle }: SidebarHeaderProps) => {
  return (
    <>
      <h2 className="text-xl font-serif text-sidebar-foreground">{collectionName}</h2>
      <h3 className="text-lg font-serif text-sidebar-foreground/70">{compositionTitle}</h3>
    </>
  );
};