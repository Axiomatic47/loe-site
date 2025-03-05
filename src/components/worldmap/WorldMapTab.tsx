// src/components/worldmap/WorldMapTab.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import LeafletHeatMap from "@/components/LeafletHeatMap";

interface WorldMapTabProps {
  countries: any[];
  events: any[];
  onSelectCountry: (country: any) => void;
  onSelectEvent: (event: any) => void;
  isLoading: boolean;
  isGdeltAnalysisRunning: boolean;
  isAcledFetchRunning: boolean;
  showGDELT: boolean;
  showACLED: boolean;
  showCountries: boolean;
}

const WorldMapTab: React.FC<WorldMapTabProps> = ({
  countries,
  events,
  onSelectCountry,
  onSelectEvent,
  isLoading,
  isGdeltAnalysisRunning,
  isAcledFetchRunning,
  showGDELT,
  showACLED,
  showCountries
}) => {
  return (
    <>
      <LeafletHeatMap
        countries={countries}
        events={events}
        onSelectCountry={onSelectCountry}
        onSelectEvent={onSelectEvent}
        isLoading={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
        showGDELT={showGDELT}
        showACLED={showACLED}
        showCountries={showCountries}
      />

      {/* Legend and explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-white">Supremacism-Egalitarianism Spectrum</h3>
          <div className="mb-4">
            <div className="h-6 w-full rounded-md"
                  style={{background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'}}></div>
            <div className="flex justify-between mt-1 text-xs text-gray-300">
              <span>0 (Strong Egalitarianism)</span>
              <span>5 (Neutral)</span>
              <span>10 (Strong Supremacism)</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            This visualization demonstrates how supremacist and egalitarian forces behave analogously to
            thermodynamic principles, with surges and flows between regions.
          </p>
        </div>

        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-white">Data Sources</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Countries</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Freedom House Democracy Index</li>
                <li>• UN Human Rights Reports</li>
                <li>• World Bank Economic Indicators</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Events</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• GDELT Conflict Events (orange)</li>
                <li>• ACLED Armed Conflict Data (red)</li>
                <li>• Media Reporting Analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorldMapTab;