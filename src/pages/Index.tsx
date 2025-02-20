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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 tracking-tight leading-tight text-white drop-shadow-lg">
              A Constitutional Analysis
              <br />
              of Corporate Personhood
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 max-w-2xl mx-auto mb-16 leading-relaxed drop-shadow">
              Explore the legal framework and implications of corporate personhood in constitutional law.
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