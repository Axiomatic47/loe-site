// src/pages/Index.tsx

import { HeroButtons } from "@/components/hero/HeroButtons";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";

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

const Index = () => {
  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="text-center mb-24">
          <BlurPanel className="p-8 sm:p-12 mb-16 max-w-5xl mx-auto">
            <div className="text-white">
              <div style={{
                fontSize: '56px',
                fontFamily: 'serif',
                lineHeight: '1.1',
                marginBottom: '8px',
                letterSpacing: '-0.02em'
              }}>
                The Fundamental Laws of Supremacism and
              </div>
              <div style={{
                fontSize: '56px',
                fontFamily: 'serif',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                Egalitarianism
              </div>
              <div style={{
                fontSize: '24px',
                fontFamily: 'serif',
                color: '#f0f0f0',
                maxWidth: '800px',
                margin: '0 auto',
                marginBottom: '24px',
                letterSpacing: '0.01em'
              }}>
                Establishing the First Universal Laws of Conflict and Peace in Social Science
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8">
                <HeroButtons />
              </div>
            </div>
          </BlurPanel>
        </div>

        <FeaturedWorkSection />
      </main>
    </PageLayout>
  );
};

export default Index;