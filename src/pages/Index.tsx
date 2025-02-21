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
            <h1 className="site-title text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-lg">
              <span className="site-title-main">The Fundamental Laws of Supremacism and</span>
              <span className="site-title-secondary">Egalitarianism</span>
            </h1>
            <p className="site-subtitle text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto mt-6 mb-16 leading-relaxed drop-shadow">
              Establishing the First Universal Laws of Conflict and Peace in Social Science
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <HeroButtons />
            </div>
          </BlurPanel>
        </div>

        <FeaturedWorkSection />
      </main>
    </PageLayout>
  );
};

export default Index;