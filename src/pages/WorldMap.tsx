// src/pages/WorldMap.tsx
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

const WorldMap = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-white mb-8 hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          <h1 className="text-4xl font-serif mb-8 text-white drop-shadow-lg">World Map</h1>

          <div className="max-w-5xl mx-auto">
            <div className="bg-black/50 p-6 rounded-lg border border-white/20">
              <p className="text-gray-300 mb-4">
                Interactive world map content will be displayed here. This page is under development.
              </p>

              {/* Placeholder for map */}
              <div className="w-full h-96 bg-black/30 rounded-lg border border-white/10 flex items-center justify-center">
                <span className="text-gray-400">Map Coming Soon</span>
              </div>
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default WorldMap;