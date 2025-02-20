// src/pages/Partners.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
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
        "backdrop-blur-md bg-black/80",
        "border border-white/10",
        "shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

const PartnerSection = ({ title, description }: { title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-black/50 border border-white/20 h-full">
    <h2 className="text-2xl mb-4 text-white drop-shadow">{title}</h2>
    <p className="text-gray-300">
      {description}
    </p>
  </div>
);

const Partners = () => {
  const navigate = useNavigate();

  return (
    <PageLayout maxPullDistance={0}>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-white mb-8 hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          <h1 className="text-4xl font-serif mb-8 text-white drop-shadow-lg">Our Partners</h1>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <PartnerSection
                title="Partner Name One"
                description="Partner One Description"
              />

              <PartnerSection
                title="Partner Name Two"
                description="Partner Two Description"
              />

              <PartnerSection
                title="Partner Name Three"
                description="Partner Three Description"
              />

              <PartnerSection
                title="Partner Name Four"
                description="Partner Four Description"
              />
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Partners;