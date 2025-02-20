import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compositionData } from "@/utils/compositionData";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarSections } from "./sidebar/SidebarSections";
import { useToast } from "./ui/use-toast";

interface SidebarProps {
  sections: Array<{ id: number; title: string }>;
  collectionName: string;
  compositionId: string;
  currentSectionId: string;
}

export const Sidebar = ({ sections, collectionName, compositionId, currentSectionId }: SidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get the composition title based on the compositionId only
  const getCompositionTitle = () => {
    const collection = compositionId === "memorandum" ? compositionData.memorandum : compositionData.corrective;
    // Always use the first composition as the main title for the collection
    return collection[0]?.title || "";
  };

  const handleNewSection = async () => {
    try {
      // Get the highest section number
      const maxSection = Math.max(...sections.map(s => s.id), 0);
      const newSectionId = maxSection + 1;
      
      // Navigate to the new section
      navigate(`/composition/${compositionId}/section/${newSectionId}`);
      
      toast({
        title: "New Section Created",
        description: `Section ${newSectionId} has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new section",
        variant: "destructive",
      });
    }
  };

  const compositionTitle = getCompositionTitle();

  return (
    <div className="w-64 min-h-[calc(100vh-4rem)] bg-sidebar text-sidebar-foreground p-6">
      <div className="space-y-4">
        <SidebarHeader 
          collectionName={collectionName} 
          compositionTitle={compositionTitle} 
        />
        <Button 
          onClick={handleNewSection}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Section
        </Button>
        <SidebarSections 
          sections={sections}
          currentSectionId={currentSectionId}
          compositionId={compositionId}
          onSectionClick={(sectionId) => 
            navigate(`/composition/${compositionId}/section/${sectionId}`)
          }
        />
      </div>
    </div>
  );
};