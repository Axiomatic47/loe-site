import React from "react";
import { Button } from "@/components/ui/button";
import InteractiveWorldMap from "@/components/InteractiveWorldMap";

const WorldMapVisualization = ({ countries, onSelectCountry }) => {
  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Supremacism Map</h3>
        <Button
          variant="outline"
          className="bg-black/50 text-white border-white/20"
        >
          View Full Screen
        </Button>
      </div>

      {/* Interactive map component */}
      <InteractiveWorldMap
        countries={countries}
        onSelectCountry={onSelectCountry}
      />

      {/* Fallback for when no countries are available */}
      {(!countries || countries.length === 0) && (
        <div className="h-96 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center flex-col">
          <div className="text-gray-400">
            No country data available
          </div>
          <div className="text-sm mt-1 text-gray-500">
            Please refresh or check your data source
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMapVisualization;