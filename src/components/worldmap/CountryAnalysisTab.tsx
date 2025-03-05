// src/components/worldmap/CountryAnalysisTab.tsx
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Helper functions for styling and data processing
const getColorClass = (score) => {
  if (score <= 2) return "bg-blue-500";
  if (score <= 4) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  if (score <= 8) return "bg-orange-500";
  return "bg-red-500";
};

const getTextColor = (score) => {
  if (score <= 2) return "text-blue-400";
  if (score <= 4) return "text-green-400";
  if (score <= 6) return "text-yellow-400";
  if (score <= 8) return "text-orange-400";
  return "text-red-400";
};

// Helper functions for STI (Stability & Transition Index)
const getSTILabel = (score) => {
  if (score <= 20) return "Rapid Transition";
  if (score <= 40) return "Moderate Transition";
  if (score <= 60) return "Partial Transition";
  if (score <= 80) return "Enduring Supremacism";
  return "Supremacist Persistence";
};

const getSTIColorClass = (score) => {
  if (score <= 20) return "bg-blue-500";
  if (score <= 40) return "bg-green-500";
  if (score <= 60) return "bg-yellow-500";
  if (score <= 80) return "bg-orange-500";
  return "bg-red-500";
};

// Country list component for the sidebar
const CountryList = ({
  countries,
  onSelect,
  selectedCountry,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    (country.name || country.country || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
        <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
      <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/50 text-white border border-white/20 rounded p-2"
        />
      </div>
      <div className="space-y-2">
        {filteredCountries.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No countries match your search
          </div>
        )}
        {filteredCountries.map(country => (
          <div
            key={country.code}
            onClick={() => onSelect(country)}
            className={cn(
              "p-2 rounded cursor-pointer border transition-colors",
              selectedCountry?.code === country.code
                ? "bg-white/20 border-white/30"
                : "bg-black/40 hover:bg-black/60 border-white/10"
            )}
          >
            <div className="flex justify-between">
              <span className="text-white">{country.name || country.country}</span>
              <span className={`${getColorClass(country.gscs || country.sgm)} px-2 rounded text-sm text-white`}>
                {(country.gscs || country.sgm).toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-gray-400">{country.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Country detail component
const CountryDetail = ({
  country,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-16" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!country) return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 text-center py-12">
      <p className="text-gray-300">Select a country to view detailed analysis</p>
    </div>
  );

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
      <h3 className="text-2xl font-medium text-white mb-4">{country.name || country.country}</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg text-white mb-2">Supremacist Risk Scores</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Domestic (SRS-D)</div>
              <div className={`text-xl font-medium ${getTextColor(country.srsD || 0)}`}>{country.srsD?.toFixed(1) || "N/A"}</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">International (SRS-I)</div>
              <div className={`text-xl font-medium ${getTextColor(country.srsI || 0)}`}>{country.srsI?.toFixed(1) || "N/A"}</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">GSCS/SGM</div>
              <div className={`text-xl font-medium ${getTextColor(country.gscs || country.sgm)}`}>{(country.gscs || country.sgm).toFixed(1)}</div>
            </div>
          </div>
        </div>

        {country.sti !== undefined && (
          <div>
            <h4 className="text-lg text-white mb-2">Stability & Transition Index</h4>
            <div className="bg-black/30 p-3 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">STI Score: {country.sti}</span>
                <span className="text-sm text-gray-400">{getSTILabel(country.sti)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`${getSTIColorClass(country.sti)} h-2 rounded-full`}
                  style={{ width: `${country.sti}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {country.event_count && (
          <div>
            <h4 className="text-lg text-white mb-2">GDELT Data</h4>
            <div className="bg-black/30 p-3 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Conflict Events</div>
                  <div className="text-lg font-medium">{country.event_count}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Avg. Tone</div>
                  <div className="text-lg font-medium">{country.avg_tone?.toFixed(2) || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-lg text-white mb-2">Analysis</h4>
          <p className="text-gray-300">{country.description}</p>
        </div>

        {country.updated_at && (
          <div className="text-xs text-gray-400 mt-4">
            Last updated: {new Date(country.updated_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

interface CountryAnalysisTabProps {
  countries: any[];
  selectedCountry: any;
  setSelectedCountry: (country: any) => void;
  isLoading: boolean;
}

const CountryAnalysisTab: React.FC<CountryAnalysisTabProps> = ({
  countries,
  selectedCountry,
  setSelectedCountry,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h2 className="text-xl text-white mb-2">Countries</h2>
        <CountryList
          countries={countries}
          onSelect={setSelectedCountry}
          selectedCountry={selectedCountry}
          isLoading={isLoading}
        />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl text-white mb-2">Detailed Analysis</h2>
        <CountryDetail
          country={selectedCountry}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CountryAnalysisTab;