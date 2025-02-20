import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useCompositionStore } from "@/utils/compositionData";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";

const CompositionsPage = () => {
  const { compositionId } = useParams();
  const navigate = useNavigate();
  const { memorandum, corrective, refreshCompositions } = useCompositionStore();

  useEffect(() => {
    refreshCompositions();
  }, [refreshCompositions]);

  const compositions = compositionId === "memorandum" ? memorandum : corrective;
  const collectionTitle = compositionId === "memorandum"
    ? "Memorandum and Manifestation"
    : "Corrective Measures";

  const getPreviewContent = (composition) => {
    if (composition.sections && composition.sections.length > 0) {
      return composition.sections[0].content_level_3;
    }
    return "";
  };

  // Function to handle composition selection
  const handleCompositionClick = (index: number) => {
    navigate(`/composition/${compositionId}/composition/${index + 1}/section/1`);
  };

  const BlurPanel = ({
    children,
    className,
    darkened = false
  }: {
    children: React.ReactNode;
    className?: string;
    darkened?: boolean;
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

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12">
        <BlurPanel className="p-8 sm:p-12 mb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6 text-white drop-shadow-lg">{collectionTitle}</h1>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {compositions.map((composition, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-black/80 rounded-lg p-8 border border-white/10 cursor-pointer transition-all hover:bg-black/90"
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
                    {getPreviewContent(composition)}
                  </ReactMarkdown>
                  <div className="mt-6">
                    <button className="text-blue-400 hover:text-blue-300 group inline-flex items-center">
                      Read More
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BlurPanel>
      </main>
    </PageLayout>
  );
};

export default CompositionsPage;