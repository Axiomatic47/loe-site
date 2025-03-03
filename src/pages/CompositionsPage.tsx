// src/pages/CompositionsPage.tsx - Fixed loading logic
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useCompositionStore } from "@/utils/compositionData";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface BlurPanelProps {
  children: React.ReactNode;
  className?: string;
  darkened?: boolean;
}

const BlurPanel: React.FC<BlurPanelProps> = ({
  children,
  className,
  darkened = false
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg",
        "backdrop-blur-md",
        darkened ? "bg-black/40" : "bg-white/10",
        "border border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
};

const getCollectionTitle = (compositionId: string | undefined) => {
  switch (compositionId) {
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

const CompositionsPage: React.FC = () => {
  const { compositionId } = useParams<{ compositionId: string }>();
  const navigate = useNavigate();
  const store = useCompositionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAttempted, setLoadingAttempted] = useState(false);

  useEffect(() => {
    if (compositionId === "memorandum") {
      navigate("/composition/manuscript", { replace: true });
      return;
    }

    const loadData = async () => {
      // Don't attempt loading again if we already tried
      if (loadingAttempted) return;

      try {
        setIsLoading(true);

        // Only load if not already initialized or compositions are empty
        if (!store.initialized || store.manuscript.length === 0) {
          await store.refreshCompositions();
        }

        setLoadingAttempted(true);
      } catch (error) {
        console.error('Error loading compositions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [compositionId, navigate, store, loadingAttempted]);

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

  const compositions = getCompositions();
  const collectionTitle = getCollectionTitle(compositionId);

  // Safari detection for navigation
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Handle clicking on a composition
  const handleCompositionClick = (index: number) => {
    // For Safari, use direct navigation to prevent freezing
    if (isSafari) {
      document.documentElement.classList.add('navigating');
      setTimeout(() => {
        window.location.href = `/composition/${compositionId}/composition/${index + 1}/section/1`;
      }, 50);
    } else {
      navigate(`/composition/${compositionId}/composition/${index + 1}/section/1`);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    // For Safari, use direct navigation to prevent freezing
    if (isSafari) {
      document.documentElement.classList.add('navigating');
      setTimeout(() => {
        window.location.href = '/';
      }, 50);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <main className="container mx-auto px-4 py-12">
          <BlurPanel className="p-8 sm:p-12 mb-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-serif mb-6 text-white drop-shadow-lg">Loading...</h1>
            </div>
          </BlurPanel>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="navigation-indicator"></div>
      <main className="container mx-auto px-4 py-12">
        <BlurPanel className="p-8 sm:p-12 mb-16">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-8 text-white hover:bg-white/10"
          >
            ← Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6 text-white drop-shadow-lg">{collectionTitle}</h1>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {compositions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white text-xl">No compositions found.</p>
                <p className="text-gray-400 mt-2">
                  Visit the admin panel to create your first composition.
                </p>
              </div>
            ) : (
              compositions.map((composition, index) => (
                <div
                  key={index}
                  className="backdrop-blur-md bg-black/80 rounded-lg p-8 border border-white/10
                           cursor-pointer transition-all hover:bg-black/90 hover:scale-[1.01]"
                  onClick={() => handleCompositionClick(index)}
                >
                  <h2 className="text-3xl font-serif mb-6 text-white drop-shadow-lg">{composition.title}</h2>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="line-clamp-4"
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-200" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-200" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                      }}
                    >
                      {composition.sections?.[0]?.content_level_3 || ''}
                    </ReactMarkdown>
                    <div className="mt-6">
                      <button className="text-blue-400 hover:text-blue-300 group inline-flex items-center">
                        Read More
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </BlurPanel>
      </main>
    </PageLayout>
  );
};

export default CompositionsPage;