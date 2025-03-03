import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

// These would be fetched from your API
const mockCountryData = [
  {
    code: "US",
    name: "United States",
    srsD: 4.2,
    srsI: 6.7,
    gscs: 5.2,
    sti: 45,
    category: "Soft Supremacism",
    description: "Historical inequalities persist in institutional structures despite formal legal equality."
  },
  {
    code: "CN",
    name: "China",
    srsD: 7.1,
    srsI: 6.8,
    gscs: 7.0,
    sti: 75,
    category: "Structural Supremacism",
    description: "Codified legal inequalities for certain groups and expansionist foreign policy."
  },
  {
    code: "SE",
    name: "Sweden",
    srsD: 1.8,
    srsI: 1.6,
    gscs: 1.7,
    sti: 15,
    category: "Non-Supremacist Governance",
    description: "Strong egalitarian institutions with protections for minority rights."
  },
  // Add more countries as needed
];

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
          <span className="text-gray-300">Structural Supremacism (4.1-6)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 mr-2 rounded"></div>
          <span className="text-gray-300">Overt Supremacism (6.1-8)</span>
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
        <li>• Freedom House Democracy Index</li>
        <li>• UN Human Rights Reports</li>
        <li>• World Bank Economic Indicators</li>
        <li>• SIPRI Military Expenditure Database</li>
        <li>• Amnesty International Reports</li>
        <li>• WTO Trade Policy Reviews</li>
      </ul>
    </div>
  </div>
);

const CountryList = ({ countries, onSelect }) => (
  <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
    <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
      <input
        type="text"
        placeholder="Search countries..."
        className="w-full bg-black/50 text-white border border-white/20 rounded p-2"
      />
    </div>
    <div className="grid grid-cols-1 gap-2">
      {countries.map(country => (
        <div
          key={country.code}
          onClick={() => onSelect(country)}
          className="p-2 rounded bg-black/40 hover:bg-black/60 cursor-pointer border border-white/10 transition-colors"
        >
          <div className="flex justify-between">
            <span className="text-white">{country.name}</span>
            <span className={`${getColorClass(country.gscs)} px-2 rounded text-sm`}>
              {country.gscs.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-gray-400">{country.category}</div>
        </div>
      ))}
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

const CountryDetail = ({ country }) => {
  if (!country) return null;

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
      <h3 className="text-2xl font-medium text-white mb-4">{country.name}</h3>

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

        <div>
          <h4 className="text-lg text-white mb-2">Analysis</h4>
          <p className="text-gray-300">{country.description}</p>
        </div>
      </div>
    </div>
  );
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

const WorldMapVisualization = () => {
  // This would be replaced with an actual map visualization library
  return (
    <div className="bg-black/30 h-96 rounded-lg border border-white/10 mt-4 flex items-center justify-center flex-col">
      <div className="text-gray-400 mb-4">Interactive world map visualization</div>
      <Button variant="outline" className="bg-black/50 text-white border-white/20">
        View Full Screen Map
      </Button>
    </div>
  );
};

const WorldMap = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setDataLoaded(true);
      toast({
        title: "Data Loaded",
        description: "Supremacism data has been successfully loaded",
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
              <Button variant="outline" className="bg-black/50 text-white border-white/20">
                Download Data
              </Button>
              <Button variant="outline" className="bg-black/50 text-white border-white/20">
                Methodology
              </Button>
            </div>
          </div>

          {!dataLoaded ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading supremacism data from global sources...</p>
            </div>
          ) : (
            <>
              <Alert className="bg-black/40 border-white/20 mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-white">Data Updated</AlertTitle>
                <AlertDescription className="text-gray-300">
                  Supremacist governance data was last refreshed on March 1, 2025, incorporating the latest reports from international monitoring agencies.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="map" className="w-full">
                <TabsList className="w-full bg-black/40 border border-white/10 mb-6">
                  <TabsTrigger value="map" className="flex-1">World Map</TabsTrigger>
                  <TabsTrigger value="countries" className="flex-1">Country Analysis</TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1">Global Trends</TabsTrigger>
                  <TabsTrigger value="research" className="flex-1">Research Data</TabsTrigger>
                </TabsList>

                <TabsContent value="map">
                  <WorldMapVisualization />
                  <SupremacismLegend />
                </TabsContent>

                <TabsContent value="countries">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h2 className="text-xl text-white mb-2">Countries</h2>
                      <CountryList
                        countries={mockCountryData}
                        onSelect={setSelectedCountry}
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
                        <span className="text-gray-400">Trend chart visualization</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                        <h3 className="text-xl text-white mb-3">Regional Comparison</h3>
                        <div className="h-48 bg-black/40 rounded border border-white/10 flex items-center justify-center">
                          <span className="text-gray-400">Regional comparison chart</span>
                        </div>
                      </div>

                      <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                        <h3 className="text-xl text-white mb-3">Transition Analysis</h3>
                        <div className="h-48 bg-black/40 rounded border border-white/10 flex items-center justify-center">
                          <span className="text-gray-400">Transition analysis chart</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="research">
                  <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Research Methodology</h2>
                      <p className="text-gray-300">
                        The Supremacist Governance Methodology (SGM) is a comprehensive framework that quantifies, tracks, and predicts supremacist or egalitarian governance dynamics. It integrates six core components: The Supremacism Spectrum, Dual Supremacist Risk Scores, Governance Supremacism Correlation Score, Stability and Transition Index, Early Warning Indicators, and Ethical Safeguards.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" className="bg-black/50 text-white border-white/20">
                          Download Full Methodology
                        </Button>
                      </div>
                    </div>

                    <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                      <h2 className="text-2xl text-white mb-4">Data Sources & APIs</h2>
                      <p className="text-gray-300 mb-4">
                        The supremacism data is compiled from multiple international sources and updated quarterly. Researchers can access the raw data through our API.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="bg-black/50 text-white border-white/20">
                          API Documentation
                        </Button>
                        <Button variant="outline" className="bg-black/50 text-white border-white/20">
                          Download Dataset
                        </Button>
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