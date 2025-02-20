// src/components/sections/FeaturedWorkSection.tsx

import React, { useEffect } from 'react';
import { useCompositionStore } from "@/utils/compositionData";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";

const BlurPanel = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg p-8 sm:p-12",
        "backdrop-blur-md bg-black/80", // Increased background opacity
        "border border-white/10",
        "shadow-xl", // Added shadow for depth
        className
      )}
    >
      {children}
    </div>
  );
};

export const FeaturedWorkSection = () => {
  const navigate = useNavigate();
  const { memorandum, corrective, refreshCompositions } = useCompositionStore();

  useEffect(() => {
    refreshCompositions();
  }, [refreshCompositions]);

  const getFeaturedSections = () => {
    const featured = [];

    memorandum.forEach((comp, compIndex) => {
      comp.sections.forEach((section, sectionIndex) => {
        if (section.featured) {
          featured.push({
            ...section,
            collection: 'memorandum',
            compositionIndex: compIndex + 1,
            sectionIndex: sectionIndex + 1,
            compositionTitle: comp.title
          });
        }
      });
    });

    corrective.forEach((comp, compIndex) => {
      comp.sections.forEach((section, sectionIndex) => {
        if (section.featured) {
          featured.push({
            ...section,
            collection: 'corrective',
            compositionIndex: compIndex + 1,
            sectionIndex: sectionIndex + 1,
            compositionTitle: comp.title
          });
        }
      });
    });

    return featured;
  };

  const featuredSections = getFeaturedSections();

  const handleReadMore = (section) => {
    navigate(`/composition/${section.collection}/composition/${section.compositionIndex}/section/${section.sectionIndex}`);
  };

  return (
    <div className="space-y-32">
      {featuredSections.map((section, index) => (
        <section key={index} className="max-w-4xl mx-auto">
          <BlurPanel>
            <h2 className="text-4xl font-serif mb-8 text-white drop-shadow-lg text-center">
              {section.title}
            </h2>

            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-serif mb-6 text-white drop-shadow-lg" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-serif mb-4 text-white drop-shadow-lg" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-serif mb-3 text-white drop-shadow-lg" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-100 drop-shadow" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-gray-100" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-100" {...props} />,
                  li: ({node, ...props}) => <li className="mb-2 text-gray-100" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300" {...props} />
                  ),
                  a: ({node, ...props}) => (
                    <a className="text-blue-300 hover:text-blue-200 underline drop-shadow" {...props} />
                  ),
                }}
              >
                {section.content_level_3}
              </ReactMarkdown>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => handleReadMore(section)}
                className="text-blue-300 hover:text-blue-200 underline drop-shadow"
              >
                Read more in {section.collection === 'memorandum' ? 'Memorandum' : 'Corrective Measures'}
              </button>
            </div>
          </BlurPanel>

          {index < featuredSections.length - 1 && (
            <hr className="border-t border-white/10 my-16" />
          )}
        </section>
      ))}
    </div>
  );
};