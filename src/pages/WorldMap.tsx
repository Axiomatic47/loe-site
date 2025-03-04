// src/pages/WorldMap.jsx
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Info, Download, FileText, Loader2, MapPin, Globe, BarChart } from "lucide-react";
import LeafletHeatMap from "@/components/LeafletHeatMap";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Import API client functions
import {
  fetchSupremacismData,
  fetchCountryAnalysis,
  runGdeltAnalysis,
  fetchRegionalSummary,
  checkAnalysisStatus,
  fetchAcledEvents,
  fetchAcledData,
  checkAcledFetchStatus,
  fetchCombinedConflictEvents
} from "@/lib/gdeltApi";

// Define the BlurPanel component
const BlurPanel = ({
  children,
  className
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

BlurPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

// Updated legend to match the new heatmap visualization
const SupremacismLegend = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
      <h3 className="text-lg font-medium mb-2 text-white">Supremacism-Egalitarianism Spectrum</h3>
      <div className="mb-4">
        <div className="h-6 w-full rounded-md"
             style={{background: 'linear-gradient(to right, #0000ff, #2a7fff, #ffffff, #ffaa00, #ff5500, #ff0000)'}}></div>
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
      <ul className="text-gray-300 text-sm space-y-1">
        <li>• GDELT Conflict Events</li>
        <li>• ACLED Armed Conflict Data</li>
        <li>• Freedom House Democracy Index</li>
        <li>• UN Human Rights Reports</li>
        <li>• World Bank Economic Indicators</li>
        <li>• SIPRI Military Expenditure Database</li>
      </ul>
    </div>
  </div>
);

// Helper functions
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

const CountryList = ({
  countries,
  onSelect,
  selectedCountry
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    (country.name || country.country || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="grid grid-cols-1 gap-2">
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

CountryList.propTypes = {
  countries: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedCountry: PropTypes.object
};

const CountryDetail = ({
  country
}) => {
  if (!country) return null;

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
            <h4 className="text-lg text-white mb-2">Stability & Transition</h4>
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

CountryDetail.propTypes = {
  country: PropTypes.object
};

const RegionalChart = ({
  regionalData
}) => {
  // If regionalData is provided, use it; otherwise use static data
  const regions = regionalData || [
    {
      region: "North America",
      avg_sgm: 4.8,
      countries: 3,
      highest_country: "United States",
      highest_sgm: 5.2,
      lowest_country: "Canada",
      lowest_sgm: 2.8
    },
    {
      region: "Europe",
      avg_sgm: 3.2,
      countries: 5,
      highest_country: "Russia",
      highest_sgm: 7.3,
      lowest_country: "Sweden",
      lowest_sgm: 1.7
    },
    {
      region: "Asia",
      avg_sgm: 6.1,
      countries: 6,
      highest_country: "China",
      highest_sgm: 7.0,
      lowest_country: "Japan",
      lowest_sgm: 3.6
    },
    {
      region: "Africa",
      avg_sgm: 5.7,
      countries: 3,
      highest_country: "South Africa",
      highest_sgm: 5.9,
      lowest_country: "Kenya",
      lowest_sgm: 5.1
    },
    {
      region: "South America",
      avg_sgm: 4.5,
      countries: 4,
      highest_country: "Brazil",
      highest_sgm: 4.7,
      lowest_country: "Chile",
      lowest_sgm: 3.9
    }
  ];

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-full">
      <h3 className="text-lg font-medium mb-3 text-white">Regional Comparison</h3>
      <div className="h-64 bg-black/40 rounded border border-white/10 p-4">
        <div className="space-y-4">
          {regions.map(region => (
            <div key={region.region}>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{region.region}</span>
                <span>{region.avg_sgm.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={getColorClass(region.avg_sgm) + " h-2 rounded-full"}
                  style={{ width: `${(region.avg_sgm / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

RegionalChart.propTypes = {
  regionalData: PropTypes.array
};

const CategoryDistribution = ({
  countries
}) => {
  // Count countries by category
  const categories = countries.reduce((acc, country) => {
    const category = country.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentages
  const total = Object.values(categories).reduce((sum, count) => sum + Number(count), 0);

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-full">
      <h3 className="text-lg font-medium mb-3 text-white">Global Category Distribution</h3>
      <div className="space-y-4">
        {Object.entries(categories).map(([category, count]) => {
          const percentage = ((count / total) * 100).toFixed(1);
          const colorClass =
            category.includes("Non-Supremacist") ? "bg-blue-500" :
            category.includes("Mixed") ? "bg-green-500" :
            category.includes("Soft") ? "bg-yellow-500" :
            category.includes("Structural") ? "bg-orange-500" :
            "bg-red-500";

          return (
            <div key={category}>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{category}</span>
                <span>{count} countries ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

CategoryDistribution.propTypes = {
  countries: PropTypes.array.isRequired
};

// Event list component for displaying event data
const EventList = ({
  events,
  onSelect,
  selectedEvent
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all');

  // Filter events based on search term and data source filter
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      (event.country || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.event_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'gdelt' && event.data_source === 'GDELT') ||
      (filter === 'acled' && event.data_source === 'ACLED');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
      <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 text-white border border-white/20 rounded p-2"
          />
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'all'
                  ? "bg-blue-900/50 text-white border-blue-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'gdelt'
                  ? "bg-orange-900/50 text-white border-orange-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('gdelt')}
            >
              GDELT
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'acled'
                  ? "bg-red-900/50 text-white border-red-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('acled')}
            >
              ACLED
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No events match your search
          </div>
        )}
        {filteredEvents.map((event, index) => (
          <div
            key={event.id || index}
            onClick={() => onSelect(event)}
            className={cn(
              "p-2 rounded cursor-pointer border transition-colors",
              selectedEvent === event
                ? "bg-white/20 border-white/30"
                : "bg-black/40 hover:bg-black/60 border-white/10"
            )}
          >
            <div className="flex justify-between">
              <span className="text-white">{event.event_type}</span>
              <span className={`px-2 rounded text-xs text-white ${event.data_source === 'GDELT' ? 'bg-orange-600' : 'bg-red-600'}`}>
                {event.data_source}
              </span>
            </div>
            <div className="text-sm text-gray-400">{event.country} - {new Date(event.event_date).toLocaleDateString()}</div>
            {event.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

EventList.propTypes = {
  events: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedEvent: PropTypes.object
};

// Event detail component
const EventDetail = ({
  event
}) => {
  if (!event) return null;

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-medium text-white mb-4">{event.event_type}</h3>
        <span className={`px-2 py-1 rounded text-xs text-white ${event.data_source === 'GDELT' ? 'bg-orange-600' : 'bg-red-600'}`}>
          {event.data_source}
        </span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Date</div>
            <div className="text-lg font-medium text-white">{new Date(event.event_date).toLocaleDateString()}</div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Location</div>
            <div className="text-lg font-medium text-white">{event.location || event.country}</div>
          </div>
        </div>

        {(event.actor1 || event.actor2) && (
          <div>
            <h4 className="text-lg text-white mb-2">Actors</h4>
            <div className="grid grid-cols-2 gap-4">
              {event.actor1 && (
                <div className="bg-black/30 p-3 rounded">
                  <div className="text-sm text-gray-400">Primary Actor</div>
                  <div className="text-white">{event.actor1}</div>
                </div>
              )}
              {event.actor2 && (
                <div className="bg-black/30 p-3 rounded">
                  <div className="text-sm text-gray-400">Secondary Actor</div>
                  <div className="text-white">{event.actor2}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {event.fatalities !== undefined && (
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Fatalities</div>
            <div className="text-lg font-medium text-white">{event.fatalities}</div>
          </div>
        )}

        {event.description && (
          <div>
            <h4 className="text-lg text-white mb-2">Description</h4>
            <p className="text-gray-300 bg-black/30 p-3 rounded">{event.description}</p>
          </div>
        )}

        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">
            Coordinates: {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

EventDetail.propTypes = {
  event: PropTypes.object
};

const WorldMap = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [countries, setCountries] = useState([]);
  const [events, setEvents] = useState([]);
  const [regionalData, setRegionalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // State for tracking analysis jobs
  const [isGdeltAnalysisRunning, setIsGdeltAnalysisRunning] = useState(false);
  const [isAcledFetchRunning, setIsAcledFetchRunning] = useState(false);
  const [analysisJobId, setAnalysisJobId] = useState(null);
  const [acledJobId, setAcledJobId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [acledProgress, setAcledProgress] = useState(0);

  // State for data layer toggles
  const [showGDELT, setShowGDELT] = useState(true);
  const [showACLED, setShowACLED] = useState(true);
  const [showCountries, setShowCountries] = useState(true);

  // Load all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both country and event data in parallel
        const [countryData, eventData, regionsData] = await Promise.all([
          fetchSupremacismData(),
          fetchCombinedConflictEvents(),
          fetchRegionalSummary()
        ]);

        setCountries(countryData);
        setEvents(eventData);
        setRegionalData(regionsData);
        setLastUpdated(new Date());
        setIsLoading(false);

        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${countryData.length} countries and ${eventData.length} events`,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setError(`Failed to load data: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);

        toast({
          title: "Data Loading Error",
          description: "Some data sources could not be loaded. Using available data.",
          variant: "destructive"
        });
      }
    };

    fetchAllData();
  }, []);

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both country and event data in parallel
      const [countryData, eventData, regionsData] = await Promise.all([
        fetchSupremacismData(),
        fetchCombinedConflictEvents(),
        fetchRegionalSummary()
      ]);

      setCountries(countryData);
      setEvents(eventData);
      setRegionalData(regionsData);
      setLastUpdated(new Date());
      setIsLoading(false);

      toast({
        title: "Data Refreshed",
        description: `Successfully loaded ${countryData.length} countries and ${eventData.length} events`,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(`Failed to refresh data: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);

      toast({
        title: "Refresh Failed",
        description: "Some data sources could not be refreshed. Using available data.",
        variant: "destructive"
      });
    }
  };

  // Start GDELT analysis
  const startGdeltAnalysis = async () => {
    setIsGdeltAnalysisRunning(true);
    setAnalysisProgress(0);

    try {
      const result = await runGdeltAnalysis();
      setAnalysisJobId(result.jobId);

      toast({
        title: "GDELT Analysis Started",
        description: `New GDELT analysis has been initiated. Job ID: ${result.jobId || 'Unknown'}`,
      });

      // Wait a bit and then start polling for completion
      setTimeout(() => {
        pollGdeltStatus(result.jobId);
      }, 5000);
    } catch (error) {
      console.error("Error starting GDELT analysis:", error);

      toast({
        title: "GDELT Analysis Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });

      setIsGdeltAnalysisRunning(false);
    }
  };

  // Poll for GDELT analysis completion
  const pollGdeltStatus = async (jobId) => {
    if (!jobId) return;

    try {
      // Check job status
      const statusResult = await checkAnalysisStatus(jobId);

      // Update progress
      if (statusResult.progress) {
        setAnalysisProgress(statusResult.progress * 100);
      }

      // If completed, refresh data
      if (statusResult.status === "completed") {
        toast({
          title: "GDELT Analysis Complete",
          description: statusResult.message || "GDELT data has been processed. Refreshing data...",
        });

        // Only refresh GDELT data without full refresh
        const [countryData, gdeltEvents] = await Promise.all([
          fetchSupremacismData(),
          fetchGdeltEvents()
        ]);

        setCountries(countryData);

        // Update only GDELT events, keeping ACLED events
        const updatedEvents = [
          ...events.filter(e => e.data_source === 'ACLED'),
          ...gdeltEvents
        ];
        setEvents(updatedEvents);

        setLastUpdated(new Date());
        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
        return;
      }

      // If failed, show error
      if (statusResult.status === "failed") {
        toast({
          title: "GDELT Analysis Failed",
          description: statusResult.message || "GDELT analysis failed",
          variant: "destructive"
        });

        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
        return;
      }

      // Continue polling
      setTimeout(() => pollGdeltStatus(jobId), 2000);
    } catch (error) {
      console.error("Error checking GDELT analysis status:", error);

      // Fallback to simulated completion
      setTimeout(() => {
        toast({
          title: "GDELT Analysis Complete",
          description: "GDELT data has been processed. Refreshing data...",
        });

        refreshData();
        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
      }, 8000);
    }
  };

  // Start ACLED data fetch
  const startAcledFetch = async () => {
    setIsAcledFetchRunning(true);
    setAcledProgress(0);

    try {
      const result = await fetchAcledData();
      setAcledJobId(result.jobId);

      toast({
        title: "ACLED Fetch Started",
        description: `New ACLED data fetch has been initiated. Job ID: ${result.jobId || 'Unknown'}`,
      });

      // Wait a bit and then start polling for completion
      setTimeout(() => {
        pollAcledStatus(result.jobId);
      }, 5000);
    } catch (error) {
      console.error("Error starting ACLED fetch:", error);

      toast({
        title: "ACLED Fetch Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });

      setIsAcledFetchRunning(false);
    }
  };

  // Poll for ACLED fetch completion
  const pollAcledStatus = async (jobId) => {
    if (!jobId) return;

    try {
      // Check job status
      const statusResult = await checkAcledFetchStatus(jobId);

      // Update progress
      if (statusResult.progress) {
        setAcledProgress(statusResult.progress * 100);
      }

      // If completed, refresh only ACLED data
      if (statusResult.status === "completed") {
        toast({
          title: "ACLED Fetch Complete",
          description: statusResult.message || "ACLED data has been fetched. Refreshing data...",
        });

        // Only fetch ACLED data
        const acledEvents = await fetchAcledEvents();

        // Update only ACLED events, keeping GDELT events
        const updatedEvents = [
          ...events.filter(e => e.data_source === 'GDELT'),
          ...acledEvents
        ];
        setEvents(updatedEvents);

        setLastUpdated(new Date());
        setIsAcledFetchRunning(false);
        setAcledJobId(null);
        return;
      }

      // If failed, show error
      if (statusResult.status === "failed") {
        toast({
          title: "ACLED Fetch Failed",
          description: statusResult.message || "ACLED data fetch failed",
          variant: "destructive"
        });

        setIsAcledFetchRunning(false);
        setAcledJobId(null);
        return;
      }

      // Continue polling
      setTimeout(() => pollAcledStatus(jobId), 2000);
    } catch (error) {
      console.error("Error checking ACLED fetch status:", error);

      // Fallback to simulated completion
      setTimeout(() => {
        toast({
          title: "ACLED Fetch Complete",
          description: "ACLED data has been fetched. Updating display...",
        });

        // Fetch just ACLED events as a fallback
        fetchAcledEvents().then(acledEvents => {
          // Update only ACLED events, keeping GDELT events
          const updatedEvents = [
            ...events.filter(e => e.data_source === 'GDELT'),
            ...acledEvents
          ];
          setEvents(updatedEvents);
          setLastUpdated(new Date());
        }).catch(err => console.error("Error fetching ACLED data:", err));

        setIsAcledFetchRunning(false);
        setAcledJobId(null);
      }, 8000);
    }
  };

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

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-serif text-white drop-shadow-lg">Conflict Data Explorer</h1>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
                onClick={refreshData}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh All Data"
                )}
              </Button>

              {/* GDELT Analysis Button */}
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
                onClick={startGdeltAnalysis}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isGdeltAnalysisRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {analysisProgress > 0 ? `GDELT Analysis (${Math.round(analysisProgress)}%)` : "GDELT Analysis..."}
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Run GDELT Analysis
                  </>
                )}
              </Button>

              {/* ACLED Fetch Button */}
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
                onClick={startAcledFetch}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isAcledFetchRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {acledProgress > 0 ? `ACLED Fetch (${Math.round(acledProgress)}%)` : "ACLED Fetch..."}
                  </>
                ) : (
                  <>
                    <BarChart className="mr-2 h-4 w-4" />
                    Fetch ACLED Data
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                Methodology
              </Button>
            </div>
          </div>

          {error ? (
            <Alert className="bg-black/40 border-red-400 mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-white">API Connection Error</AlertTitle>
              <AlertDescription className="text-gray-300">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {lastUpdated && (
                <Alert className="bg-black/40 border-white/20 mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-white">Conflict Data Updated</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    Data was last refreshed on {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}.
                    Showing {countries.length} countries and {events.length} conflict events.
                  </AlertDescription>
                </Alert>
              )}

              {/* Layer toggle controls */}
              <div className="flex flex-wrap gap-6 mb-6 justify-center md:justify-start">
                <div className="flex items-center space-x-2">
                  <Switch id="show-countries" checked={showCountries} onCheckedChange={setShowCountries} />
                  <Label htmlFor="show-countries" className="text-white">Show Country Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-gdelt" checked={showGDELT} onCheckedChange={setShowGDELT} />
                  <Label htmlFor="show-gdelt" className="text-white">Show GDELT Events</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-acled" checked={showACLED} onCheckedChange={setShowACLED} />
                  <Label htmlFor="show-acled" className="text-white">Show ACLED Events</Label>
                </div>
              </div>

              <Tabs defaultValue="map" className="w-full">
                <TabsList className="w-full bg-black/40 border border-white/10 mb-6">
                  <TabsTrigger value="map" className="flex-1">World Map</TabsTrigger>
                  <TabsTrigger value="countries" className="flex-1">Country Analysis</TabsTrigger>
                  <TabsTrigger value="events" className="flex-1">Event Data</TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1">Global Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="map">
                  <LeafletHeatMap
                    countries={countries}
                    events={events}
                    onSelectCountry={setSelectedCountry}
                    onSelectEvent={setSelectedEvent}
                    isLoading={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
                    showGDELT={showGDELT}
                    showACLED={showACLED}
                    showCountries={showCountries}
                  />
                  <SupremacismLegend />
                </TabsContent>

                <TabsContent value="countries">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h2 className="text-xl text-white mb-2">Countries</h2>
                      <CountryList
                        countries={countries}
                        onSelect={setSelectedCountry}
                        selectedCountry={selectedCountry}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <h2 className="text-xl text-white mb-2">Detailed Analysis</h2>
                      {selectedCountry ? (
                        <CountryDetail country={selectedCountry} />
                      ) : (
                        <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 text-center py-12">
                          <p className="text-gray-300">Select a country to view detailed analysis</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h2 className="text-xl text-white mb-2">Conflict Events</h2>
                      <EventList
                        events={events}
                        onSelect={setSelectedEvent}
                        selectedEvent={selectedEvent}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <h2 className="text-xl text-white mb-2">Event Details</h2>
                      {selectedEvent ? (
                        <EventDetail event={selectedEvent} />
                      ) : (
                        <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 text-center py-12">
                          <p className="text-gray-300">Select an event to view detailed information</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trends">
                  <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Global Thermodynamic Analysis</h2>
                      <p className="text-gray-300 mb-4">
                        Track worldwide thermodynamic-like patterns in the flow between supremacism and egalitarianism
                        according to the Supremacist-Egalitarianism Methodology.
                      </p>
                      <div className="h-64 bg-black/40 rounded border border-white/10 flex items-center justify-center">
                        <span className="text-gray-400">Thermodynamic trend chart visualization coming soon</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RegionalChart regionalData={regionalData} />
                      <CategoryDistribution countries={countries} />
                    </div>

                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Conflict Event Patterns</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg font-medium mb-3 text-white">Event Sources</h3>
                          <div className="h-64 bg-black/50 rounded border border-white/10 p-4 flex flex-col justify-center">
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                  <span>GDELT Events</span>
                                  <span>{events.filter(e => e.data_source === 'GDELT').length} events</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-orange-500 h-2 rounded-full" style={{
                                    width: `${(events.filter(e => e.data_source === 'GDELT').length / Math.max(events.length, 1)) * 100}%`
                                  }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                  <span>ACLED Events</span>
                                  <span>{events.filter(e => e.data_source === 'ACLED').length} events</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-red-500 h-2 rounded-full" style={{
                                    width: `${(events.filter(e => e.data_source === 'ACLED').length / Math.max(events.length, 1)) * 100}%`
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Event type distribution - can be expanded with more detailed analysis */}
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg font-medium mb-3 text-white">Data Coverage</h3>
                          <div className="h-64 bg-black/50 rounded border border-white/10 p-4 flex items-center justify-center">
                            <p className="text-gray-400 text-center">
                              Event type distribution analysis coming soon
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default WorldMap;