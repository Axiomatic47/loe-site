// src/pages/SectionPage.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useCompositionStore } from "@/utils/compositionData";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import MobileNavigation, { useMobileNavigation } from "@/components/MobileNavigation";
import EnhancedMarkdownRenderer from "@/components/EnhancedMarkdownRenderer";

const SectionPage = () => {
  const { compositionId = "", compositionIndex = "1", sectionId = "1" } = useParams();
  const [literacyLevel, setLiteracyLevel] = useState(3);
  const { toast } = useToast();
  const navigate = useNavigate();
  const store = useCompositionStore();
  const { isSidebarOpen, setIsSidebarOpen, isMobile } = useMobileNavigation();

  useEffect(() => {
    if (!store.loading) {
      store.refreshCompositions();
    }
  }, [store]);

  useEffect(() => {
    // Scroll the main content area to the top when section changes
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
      mainContentArea.scrollTop = 0;
    }
  }, [sectionId]);

  // Get compositions based on the ID
  const getCompositions = () => {
    switch (compositionId) {
      case "manuscript":
        return store.manuscript;
      case "data":
        return store.data;
      case "map":
        return store.map;
      default:
        return [];
    }
  };

  const getCollectionTitle = (collectionType: string) => {
    switch (collectionType) {
      case "manuscript":
        return "Manuscript & White Papers";
      case "data":
        return "Data & Evidence";
      case "map":
        return "World Map";
      default:
        return "Content";
    }
  };

  const compositions = getCompositions();
  const currentComposition = compositions[parseInt(compositionIndex) - 1];
  const currentSection = currentComposition?.sections?.[parseInt(sectionId) - 1];

  const handleSectionChange = (newSectionId: number) => {
    // Scroll the main content area to the top
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
      mainContentArea.scrollTop = 0;
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }

    setTimeout(() => {
      navigate(`/composition/${compositionId}/composition/${compositionIndex}/section/${newSectionId}`);
    }, 100);
  };

  const handleLiteracyChange = (value: number[]) => {
    const requestedLevel = value[0];
    const section = currentSection;

    if (section) {
      const hasContent = requestedLevel === 1 ? section.content_level_1 :
                        requestedLevel === 5 ? section.content_level_5 : true;

      const newLevel = hasContent ? requestedLevel : 3;

      setLiteracyLevel(newLevel);

      if (!hasContent) {
        toast({
          title: "Reading Level Adjusted",
          description: "Content not available at requested level, showing intermediate level instead.",
        });
      } else {
        toast({
          title: "Reading Level Updated",
          description: `Reading level set to ${newLevel}`,
        });
      }
    }
  };

  const getContentForLevel = () => {
    if (!currentSection) return "";

    switch (literacyLevel) {
      case 1:
        return currentSection.content_level_1 || currentSection.content_level_3;
      case 5:
        return currentSection.content_level_5 || currentSection.content_level_3;
      default:
        return currentSection.content_level_3;
    }
  };

  if (!currentSection || !currentComposition) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="backdrop-blur-md bg-black/40 rounded-lg p-8 border border-white/10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl mb-4 text-white drop-shadow-lg">Section Not Found</h1>
              <button
                onClick={() => navigate(`/composition/${compositionId}`)}
                className="text-blue-400 hover:text-blue-300"
              >
                Return to Composition List
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <MobileNavigation
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        >
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-serif text-white drop-shadow-lg mb-1">
                {getCollectionTitle(compositionId)}
              </h2>
              <h3 className="text-sm text-gray-200">{currentComposition.title}</h3>
            </div>

            <nav className="space-y-2 pb-16">
              {currentComposition.sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => handleSectionChange(index + 1)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    index + 1 === parseInt(sectionId)
                      ? "bg-white/20 text-white font-medium backdrop-blur-md"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </MobileNavigation>

        {/* Main Content with independent scrolling */}
        <main
          className={cn(
            "main-content-area flex-1 overflow-y-auto",
            !isMobile ? "ml-64" : "" // Add margin to make space for fixed sidebar on desktop
          )}
        >
          <div className="p-8">
            <div className="max-w-3xl mx-auto backdrop-blur-md bg-black/80 p-8 rounded-lg border border-white/10">
              <div className="mb-8">
                <h1 className="text-3xl font-serif mb-4 text-white drop-shadow-lg leading-snug text-center">
                  {currentSection.title}
                </h1>

                <div className="flex items-center space-x-4 mb-8 bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-200">Reading Level:</span>
                  <Slider
                    value={[literacyLevel]}
                    max={5}
                    min={1}
                    step={2}
                    onValueChange={handleLiteracyChange}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-200">{literacyLevel}</span>
                </div>
              </div>

              <div className="prose prose-invert prose-lg max-w-none">
                <EnhancedMarkdownRenderer
                  content={getContentForLevel()}
                  className="prose prose-invert prose-lg max-w-none"
                />

                {/* Section Navigation */}
                <div className="mt-12 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleSectionChange(parseInt(sectionId) - 1)}
                      className={cn(
                        "px-4 py-2 flex items-center space-x-2 rounded-lg",
                        "backdrop-blur-md bg-black/40 border border-white/10",
                        "transition-all duration-200",
                        "text-gray-200 hover:bg-black/60",
                        parseInt(sectionId) <= 1 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      )}
                      disabled={parseInt(sectionId) <= 1}
                    >
                      <span>←</span>
                      <span>Previous Section</span>
                    </button>

                    <div className="text-gray-200">
                      Section {sectionId} of {currentComposition.sections.length}
                    </div>

                    <button
                      onClick={() => handleSectionChange(parseInt(sectionId) + 1)}
                      className={cn(
                        "px-4 py-2 flex items-center space-x-2 rounded-lg",
                        "backdrop-blur-md bg-black/40 border border-white/10",
                        "transition-all duration-200",
                        "text-gray-200 hover:bg-black/60",
                        parseInt(sectionId) >= currentComposition.sections.length ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      )}
                      disabled={parseInt(sectionId) >= currentComposition.sections.length}
                    >
                      <span>Next Section</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};

export default SectionPage;