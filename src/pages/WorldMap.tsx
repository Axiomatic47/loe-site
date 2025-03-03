import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Info, Download, FileText, Loader2 } from "lucide-react";
import LeafletWorldMap from "@/components/LeafletWorldMap";

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

const SupremacismLegend = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
      <h3 className="text-lg font-medium mb-2 text-white">Supremacism Spectrum</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
          <span className="text-gray-300">Non-Supremacist (0-2)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2 rounded"></div>
          <span className="text-gray-300">Mixed Governance (2.1-4)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 mr-2 rounded"></div>
          <span className="text-gray-300">Soft Supremacism (4.1-6)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 mr-2 rounded"></div>
          <span className="text-gray-300">Structural Supremacism (6.1-8)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2 rounded"></div>
          <span className="text-gray-300">Extreme Supremacism (8.1-10)</span>
        </div>
      </div>
    </div>

    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
      <h3 className="text-lg font-medium mb-2 text-white">Data Sources</h3>
      <ul className="text-gray-300 text-sm space-y-1">
        <li>• GDELT Conflict Events</li>
        <li>• Freedom House Democracy Index</li>
        <li>• UN Human Rights Reports</li>
        <li>• World Bank Economic Indicators</li>
        <li>• SIPRI Military Expenditure Database</li>
        <li>• Amnesty International Reports</li>
      </ul>
    </div>
  </div>
);

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

const CountryList = ({ countries, onSelect, selectedCountry }) => {
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
              <span className={`${getColorClass(country.gscs)} px-2 rounded text-sm text-white`}>
                {country.gscs.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-gray-400">{country.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CountryDetail = ({ country }) => {
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
              <div className={`text-xl font-medium ${getTextColor(country.srsD)}`}>{country.srsD.toFixed(1)}</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">International (SRS-I)</div>
              <div className={`text-xl font-medium ${getTextColor(country.srsI)}`}>{country.srsI.toFixed(1)}</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">GSCS</div>
              <div className={`text-xl font-medium ${getTextColor(country.gscs)}`}>{country.gscs.toFixed(1)}</div>
            </div>
          </div>
        </div>

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

const RegionalChart = () => (
  <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-full">
    <h3 className="text-lg font-medium mb-3 text-white">Regional Comparison</h3>
    <div className="h-64 bg-black/40 rounded border border-white/10 p-4">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>North America</span>
            <span>4.8</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '48%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Europe</span>
            <span>3.2</span>
            </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Asia</span>
            <span>6.1</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '61%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Africa</span>
            <span>5.7</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '57%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>South America</span>
            <span>4.5</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CategoryDistribution = ({ countries }) => {
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

const WorldMap = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(undefined);
  const [sgmData, setSgmData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch SGM data - using mock data since your API isn't working
  useEffect(() => {
    const fetchSGMData = async () => {
      setIsLoading(true);
      setError(null);

      // Simulating API call with timeout
      setTimeout(() => {
        try {
          // Mock data since the API isn't working
          const mockData = [
            {
              code: "US",
              country: "United States",
              srsD: 4.2,
              srsI: 6.7,
              gscs: 5.2,
              sti: 45,
              category: "Soft Supremacism",
              description: "The United States exhibits soft supremacism patterns with institutional inequalities despite formal legal equality. Historical patterns persist in economic and social structures.",
              event_count: 42,
              avg_tone: -2.7,
            },
            {
              code: "CN",
              country: "China",
              srsD: 7.1,
              srsI: 6.8,
              gscs: 7.0,
              sti: 75,
              category: "Structural Supremacism",
              description: "China demonstrates structural supremacism with notable inequalities at societal and governmental levels. Minority populations face systemic discrimination and there are expansionist tendencies in foreign policy.",
              event_count: 37,
              avg_tone: -3.5,
            },
            {
              code: "RU",
              country: "Russia",
              srsD: 6.9,
              srsI: 7.8,
              gscs: 7.3,
              sti: 80,
              category: "Structural Supremacism",
              description: "Russia shows strong structural supremacism internally and aggressive patterns internationally. Power concentration creates significant disparities for non-dominant groups.",
              event_count: 53,
              avg_tone: -5.2,
            },
            {
              code: "SE",
              country: "Sweden",
              srsD: 1.8,
              srsI: 1.6,
              gscs: 1.7,
              sti: 15,
              category: "Non-Supremacist Governance",
              description: "Sweden demonstrates strong egalitarian governance with robust institutions protecting equality. Social welfare systems minimize power disparities between groups.",
              event_count: 8,
              avg_tone: 3.1,
            },
            {
              code: "DE",
              country: "Germany",
              srsD: 2.9,
              srsI: 2.1,
              gscs: 2.5,
              sti: 25,
              category: "Mixed Governance",
              description: "Germany shows mixed governance with strong democratic institutions and acknowledgment of historical supremacist patterns. Legal frameworks promote equality though challenges persist.",
              event_count: 15,
              avg_tone: 1.8,
            },
            {
              code: "IN",
              country: "India",
              srsD: 5.8,
              srsI: 4.2,
              gscs: 5.0,
              sti: 60,
              category: "Soft Supremacism",
              description: "India exhibits soft supremacism with increasing tensions between religious and caste groups. Constitutional protections coexist with supremacist social structures.",
              event_count: 31,
              avg_tone: -1.9,
            },
            {
              code: "BR",
              country: "Brazil",
              srsD: 5.6,
              srsI: 3.8,
              gscs: 4.7,
              sti: 55,
              category: "Soft Supremacism",
              description: "Brazil demonstrates soft supremacism with persistent racial and economic inequalities despite formal legal equality. Social mobility remains limited for marginalized groups.",
              event_count: 23,
              avg_tone: -1.6,
            },
            {
              code: "FR",
              country: "France",
              srsD: 3.7,
              srsI: 3.9,
              gscs: 3.8,
              sti: 40,
              category: "Mixed Governance",
              description: "France shows mixed governance with strong republican values alongside challenges integrating minority communities. Colonial legacy impacts domestic and international relations.",
              event_count: 19,
              avg_tone: -0.8,
            },
            {
              code: "JP",
              country: "Japan",
              srsD: 4.2,
              srsI: 3.1,
              gscs: 3.6,
              sti: 65,
              category: "Mixed Governance",
              description: "Japan demonstrates mixed governance with strong cohesion for dominant ethnic groups but challenges with minority integration and gender equality.",
              event_count: 12,
              avg_tone: 0.3,
            },
            {
              code: "ZA",
              country: "South Africa",
              srsD: 5.1,
              srsI: 3.2,
              gscs: 4.1,
              sti: 48,
              category: "Soft Supremacism",
              description: "South Africa shows signs of soft supremacism despite strong constitutional protections. Post-apartheid transition continues with economic disparities along historical lines.",
              event_count: 28,
              avg_tone: -1.2,
            },
            {
              code: "AU",
              country: "Australia",
              srsD: 3.6,
              srsI: 3.1,
              gscs: 3.3,
              sti: 35,
              category: "Mixed Governance",
              description: "Australia exhibits mixed governance with ongoing reconciliation efforts for indigenous peoples alongside strong democratic institutions.",
              event_count: 11,
              avg_tone: 0.7,
            },
            {
              code: "CA",
              country: "Canada",
              srsD: 3.2,
              srsI: 2.4,
              gscs: 2.8,
              sti: 30,
              category: "Mixed Governance",
              description: "Canada shows mixed governance with multicultural frameworks and reconciliation efforts for indigenous communities. Strong legal protections with ongoing social challenges.",
              event_count: 14,
              avg_tone: 1.3,
            },
            {
              code: "GB",
              country: "United Kingdom",
              srsD: 3.9,
              srsI: 4.1,
              gscs: 4.0,
              sti: 45,
              category: "Mixed Governance",
              description: "The United Kingdom demonstrates mixed governance with strong democratic institutions alongside challenges with post-colonial relationships and integration of minority communities.",
              event_count: 26,
              avg_tone: -0.6,
            },
            {
              code: "MX",
              country: "Mexico",
              srsD: 5.3,
              srsI: 3.1,
              gscs: 4.2,
              sti: 52,
              category: "Soft Supremacism",
              description: "Mexico exhibits soft supremacism with persistent inequalities along ethnic and economic lines. Indigenous communities face systemic challenges despite constitutional protections.",
              event_count: 32,
              avg_tone: -2.1,
            },
            {
              code: "ES",
              country: "Spain",
              srsD: 3.8,
              srsI: 3.3,
              gscs: 3.5,
              sti: 38,
              category: "Mixed Governance",
              description: "Spain shows mixed governance with regional autonomy structures alongside ongoing tensions related to regional identities and migrant communities.",
              event_count: 17,
              avg_tone: -0.4,
            }
          ];

          setSgmData(mockData);
          setLastUpdated(new Date());
          setIsLoading(false);

          toast({
            title: "Data Loaded",
            description: "Supremacism data has been successfully loaded",
          });
        } catch (error) {
          console.error("Error loading data:", error);
          setError(`Failed to load data: ${error.message}`);
          setIsLoading(false);
        }
      }, 1500); // Simulate loading delay
    };

    fetchSGMData();
  }, []);

  // Trigger a manual refresh of the data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Just reset the lastUpdated timestamp to simulate fresh data
        setLastUpdated(new Date());
        setIsLoading(false);

        toast({
          title: "Data Refreshed",
          description: "Supremacism data has been updated",
        });
      } catch (error) {
        console.error("Error refreshing data:", error);
        setError(`Failed to refresh data: ${error.message}`);
        setIsLoading(false);

        toast({
          title: "Refresh Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }, 2000); // Simulate refresh delay
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

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-serif text-white drop-shadow-lg">Supremacist World Map</h1>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
                onClick={refreshData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh Data"
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
              <AlertTitle className="text-white">Error Loading Data</AlertTitle>
              <AlertDescription className="text-gray-300">
                {error}. Using mock data instead.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {lastUpdated && (
                <Alert className="bg-black/40 border-white/20 mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-white">Data Updated</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    Supremacist governance data was last refreshed on {lastUpdated.toLocaleDateString()}, incorporating the latest reports from international monitoring agencies.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="map" className="w-full">
                <TabsList className="w-full bg-black/40 border border-white/10 mb-6">
                  <TabsTrigger value="map" className="flex-1">World Map</TabsTrigger>
                  <TabsTrigger value="countries" className="flex-1">Country Analysis</TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1">Global Trends</TabsTrigger>
                  <TabsTrigger value="research" className="flex-1">Research Data</TabsTrigger>
                </TabsList>

                <TabsContent value="map">
                  <LeafletWorldMap
                    countries={sgmData}
                    onSelectCountry={setSelectedCountry}
                    isLoading={isLoading}
                  />
                  <SupremacismLegend />
                </TabsContent>

                <TabsContent value="countries">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h2 className="text-xl text-white mb-2">Countries</h2>
                      <CountryList
                        countries={sgmData}
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
                          <p className="text-gray-300">Select a country to view detailed supremacism analysis</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trends">
                  <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Global Supremacism Trend Analysis</h2>
                      <p className="text-gray-300 mb-4">
                        Track worldwide changes in governance models according to the Supremacist Governance Methodology (SGM).
                      </p>
                      <div className="h-64 bg-black/40 rounded border border-white/10 flex items-center justify-center">
                        <span className="text-gray-400">Trend chart visualization coming soon</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RegionalChart />
                      <CategoryDistribution countries={sgmData} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="research">
                  <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Supremacist Governance Methodology (SGM)</h2>
                      <p className="text-gray-300">
                        The SGM is a comprehensive framework that quantifies, tracks, and predicts supremacist or egalitarian governance dynamics.
                        It integrates several core components to provide a holistic assessment of governance patterns.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg text-white mb-2">Core Components</h3>
                          <ul className="space-y-2 text-gray-300">
                            <li>• <span className="text-white">Supremacism Spectrum:</span> 0-10 scale measuring governance models</li>
                            <li>• <span className="text-white">Dual Supremacist Risk Scores:</span> Separate metrics for domestic (SRS-D) and international (SRS-I)</li>
                            <li>• <span className="text-white">GSCS:</span> Combined score representing overall supremacism level</li>
                            <li>• <span className="text-white">Stability and Transition Index:</span> Measures governance stability</li>
                          </ul>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg text-white mb-2">Current Implementation</h3>
                          <p className="text-gray-300 text-sm">
                            This implementation of SGM relies primarily on GDELT conflict data and calculates scores based on:
                          </p>
                          <ul className="space-y-1 text-gray-300 text-sm mt-2">
                            <li>• Conflict event frequency</li>
                            <li>• Event tone analysis</li>
                            <li>• Goldstein scale measurements</li>
                            <li>• Geopolitical patterns</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="bg-black/50 text-white border-white/20"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Full Methodology
                        </Button>
                      </div>
                    </div>

                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Data Sources & API</h2>
                      <p className="text-gray-300 mb-4">
                        The supremacism data is compiled primarily from GDELT and updated by the SGM service. Researchers can access the raw data through our API.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg text-white mb-2">API Endpoints</h3>
                          <ul className="space-y-1 text-gray-300 text-sm">
                            <li>• <code className="bg-black/50 px-1 rounded">GET /sgm/countries</code> - Get all country scores</li>
                            <li>• <code className="bg-black/50 px-1 rounded">GET /sgm/countries/{'{country_code}'}</code> - Get specific country</li>
                            <li>• <code className="bg-black/50 px-1 rounded">GET /sgm/run-analysis</code> - Trigger new analysis</li>
                          </ul>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h3 className="text-lg text-white mb-2">Download Data</h3>
                          <p className="text-gray-300 text-sm mb-4">
                            You can download the SGM data in different formats for research purposes.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full bg-black/50 text-white border-white/20"
                            onClick={() => {
                              // Create JSON file for download
                              const dataStr = JSON.stringify(sgmData, null, 2);
                              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                              // Create download link
                              const exportFileDefaultName = 'sgm_data.json';
                              const linkElement = document.createElement('a');
                              linkElement.setAttribute('href', dataUri);
                              linkElement.setAttribute('download', exportFileDefaultName);
                              linkElement.click();
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Dataset (JSON)
                          </Button>
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