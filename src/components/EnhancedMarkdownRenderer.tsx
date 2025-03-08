// src/components/EnhancedMarkdownRenderer.tsx
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// For MathJax approach
declare global {
  interface Window {
    MathJax: any;
  }
}

interface EnhancedMarkdownProps {
  content: string;
  className?: string;
}

const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownProps> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Process MathJax after render
  useEffect(() => {
    if (window.MathJax && containerRef.current) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err: any) =>
        console.error('MathJax error:', err)
      );
    }
  }, [content]);

  return (
    <div ref={containerRef} className={`formal-logic-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Handle formal logic spans and divs with special styling
          span: ({node, className, children, ...props}) => {
            if (className?.includes('logic-expression')) {
              return <span className={className} {...props}>{children}</span>;
            }
            return <span className={className} {...props}>{children}</span>;
          },
          div: ({node, className, children, ...props}) => {
            if (className?.includes('logic-expression') || className?.includes('logic-block')) {
              return <div className={className} {...props}>{children}</div>;
            }
            return <div className={className} {...props}>{children}</div>;
          },
          // Standard components with existing styling
          h1: ({node, ...props}) => <h1 className="text-3xl font-serif mb-6 text-white drop-shadow-lg" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-serif mb-4 text-white drop-shadow-lg" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-serif mb-3 text-white drop-shadow-lg" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-200 drop-shadow" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-gray-200" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-200" {...props} />,
          li: ({node, ...props}) => <li className="mb-2 text-gray-200" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-white/20 pl-4 italic my-4 text-gray-200 backdrop-blur-sm bg-black/40 p-4 rounded-r-lg" {...props} />
          ),
          a: ({node, ...props}) => (
            <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
          ),
          em: ({node, ...props}) => <em className="italic text-gray-200" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-white drop-shadow" {...props} />,
          code: ({node, inline, className, ...props}) => {
            // Special handling for code blocks marked as "logic"
            const match = /language-(\w+)/.exec(className || '');
            const isLogic = match && match[1] === 'logic';

            if (isLogic) {
              return (
                <div className="logic-block">
                  <code {...props} />
                </div>
              );
            }

            return inline ? (
              <code className="bg-black/50 px-1 rounded text-sm backdrop-blur-sm" {...props} />
            ) : (
              <code className="block bg-black/50 p-4 rounded text-sm overflow-x-auto backdrop-blur-sm" {...props} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdownRenderer;