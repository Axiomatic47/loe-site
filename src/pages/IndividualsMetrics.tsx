import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Info, Download, FileText, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the types for individual metrics
interface IndividualMetrics {
  id: string;
  name: string;
  position: string;
  country: string;
  category: 'political' | 'business' | 'media' | 'other';
  ips: number; // Individual Prominence Score
  srs: number; // Supremacist Rhetoric Score
  pas: number; // Policy Action Score
  isc: number; // Individual Supremacism Composite
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
  description?: string;
  keyIndicators?: string[];
}

// Sample data for demonstration
const sampleIndividuals: IndividualMetrics[] = [
  {
    id: '1',
    name: 'John Smith',
    position: 'President',
    country: 'United States',
    category: 'political',
    ips: 9.2,
    srs: 6.7,
    pas: 5.9,
    isc: 6.8,
    trend: 'decreasing',
    lastUpdated: '2025-02-15',
    description: 'Demonstrates moderate supremacist rhetoric with declining trend in policy implementation. Recent speeches show mixed messaging on equality issues.',
    keyIndicators: [
      'Exclusionary immigration policies',
      'Nationalist rhetoric in public speeches',
      'Support for economic protectionism'
    ]
  },
  {
    id: '2',
    name: 'Mary Johnson',
    position: 'CEO, Global Tech Corp',
    country: 'United States',
    category: 'business',
    ips: 7.8,
    srs: 3.2,
    pas: 4.5,
    isc: 4.7,
    trend: 'stable',
    lastUpdated: '2025-02-10',
    description: 'Maintains lower supremacist rhetoric but company policies show some structural biases in hiring and global operations.',
    keyIndicators: [
      'Wage disparities between headquarters and global offices',
      'Limited diversity in executive positions',
      'Privacy policies that differ by region'
    ]
  },
  {
    id: '3',
    name: 'Zhang Wei',
    position: 'Premier',
    country: 'China',
    category: 'political',
    ips: 8.9,
    srs: 7.8,
    pas: 8.2,
    isc: 8.0,
    trend: 'increasing',
    lastUpdated: '2025-02-18',
    description: 'Consistently demonstrates strong supremacist tendencies in both rhetoric and policy implementation. Recent territorial claims show increased assertion of dominance.',
    keyIndicators: [
      'Expansionist territorial claims',
      'Suppression of ethnic minorities',
      'Aggressive foreign policy toward neighboring states'
    ]
  },
  {
    id: '4',
    name: 'Elena Sokolov',
    position: 'Media Conglomerate Owner',
    country: 'Russia',
    category: 'media',
    ips: 7.5,
    srs: 6.9,
    pas: 6.7,
    isc: 7.0,
    trend: 'stable',
    lastUpdated: '2025-02-05',
    description: 'Uses media influence to promote nationalist narratives and marginalize opposing viewpoints.',
    keyIndicators: [
      'Concentrated media ownership',
      'Promotion of ethnic superiority narratives',
      'Suppression of diverse voices in coverage'
    ]
  },
  {
    id: '5',
    name: 'Abdul Rahman',
    position: 'Finance Minister',
    country: 'United Arab Emirates',
    category: 'political',
    ips: 6.5,
    srs: 5.2,
    pas: 6.8,
    isc: 6.0,
    trend: 'decreasing',
    lastUpdated: '2025-02-12',
    description: 'Moderate supremacist rhetoric with policy decisions that show improving trends toward labor equality.',
    keyIndicators: [
      'Economic policies favoring citizens over migrant workers',
      'Recent labor reforms improving migrant rights',
      'Selective economic partnerships based on political alignment'
    ]
  },
  {
    id: '6',
    name: 'Sarah Okonjo',
    position: 'Human Rights Commissioner',
    country: 'Kenya',
    category: 'political',
    ips: 7.2,
    srs: 2.1,
    pas: 2.5,
    isc: 3.1,
    trend: 'stable',
    lastUpdated: '2025-02-20',
    description: 'Consistently low supremacist metrics with strong advocacy for equal rights across ethnic and tribal lines.',
    keyIndicators: [
      'Promotion of cross-tribal unity policies',
      'Advocacy for equal regional development',
      'Support for inclusive electoral reforms'
    ]
  },
  {
    id: '7',
    name: 'Carlos Mendez',
    position: 'Oil Company Executive',
    country: 'Brazil',
    category: 'business',
    ips: 6.8,
    srs: 5.7,
    pas: 7.2,
    isc: 6.5,
    trend: 'increasing',
    lastUpdated: '2025-02-08',
    description: 'Moderate public rhetoric but company policies show increasing disregard for indigenous land rights and environmental protections.',
    keyIndicators: [
      'Exploitation of indigenous territories',
      'Environmental policy violations',
      'Preferential hiring practices'
    ]
  },
  {
    id: '8',
    name: 'Angela Weber',
    position: 'Chancellor',
    country: 'Germany',
    category: 'political',
    ips: 8.8,
    srs: 2.8,
    pas: 3.2,
    isc: 3.9,
    trend: 'stable',
    lastUpdated: '2025-02-14',
    description: 'Maintains consistently low supremacist rhetoric and policy implementation, with strong emphasis on European cooperation and refugee integration.',
    keyIndicators: [
      'Support for multilateral cooperation',
      'Inclusive refugee policies',
      'Promotion of pan-European identity'
    ]
  }
];

// Color utility function based on score
const getColorForScore = (score: number) => {
  if (score <= 2) return "text-blue-500";
  if (score <= 4) return "text-green-500";
  if (score <= 6) return "text-yellow-500";
  if (score <= 8) return "text-orange-500";
  return "text-red-500";
};

// Background color utility function based on score
const getBgColorForScore = (score: number) => {
  if (score <= 2) return "bg-blue-500";
  if (score <= 4) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  if (score <= 8) return "bg-orange-500";
  return "bg-red-500";
};

// Trend icon utility
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') return <ChevronUp className="h-4 w-4 text-red-500" />;
  if (trend === 'decreasing') return <ChevronDown className="h-4 w-4 text-green-500" />;
  return <div className="h-4 w-4 border-t border-gray-400 mx-auto" />;
};

const IndividualsMetrics = () => {
  const [individuals, setIndividuals] = useState<IndividualMetrics[]>(sampleIndividuals);
  const [filteredIndividuals, setFilteredIndividuals] = useState<IndividualMetrics[]>(sampleIndividuals);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof IndividualMetrics>("isc");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIndividual, setSelectedIndividual] = useState<IndividualMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort individuals whenever relevant state changes
  useEffect(() => {
    let results = [...individuals];

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        ind =>
          ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ind.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ind.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter(ind => ind.category === selectedCategory);
    }

    // Apply sorting
    results.sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

    setFilteredIndividuals(results);
  }, [individuals, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: keyof IndividualMetrics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new sort field
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      // In a real application, this would be an API call
      toast({
        title: "Data Refreshed",
        description: "Individual metrics have been updated with the latest data.",
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-grow">
      <div className="relative rounded-lg p-8 sm:p-12 backdrop-blur-md bg-black/80 border border-white/10 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-white drop-shadow-lg">Individual Supremacism Metrics</h1>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-black/50 text-white border-white/20"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full"></div>
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

        <Alert className="bg-black/40 border-white/20 mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-white">Individual Supremacism Analysis</AlertTitle>
          <AlertDescription className="text-gray-300">
            This dashboard measures prominent individuals using the Supremacist Governance Methodology (SGM) applied to personal rhetoric, policy influence, and actions. Scores range from 0 (strong egalitarianism) to 10 (extreme supremacism).
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="w-full bg-black/40 border border-white/10 mb-6">
            <TabsTrigger value="table" className="flex-1">Metrics Table</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Category Analysis</TabsTrigger>
            <TabsTrigger value="methodology" className="flex-1">Scoring System</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, position, or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-black/50 text-white border-white/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-black/50 text-white border border-white/20 rounded p-2"
                    >
                      <option value="all">All Categories</option>
                      <option value="political">Political Leaders</option>
                      <option value="business">Business Executives</option>
                      <option value="media">Media Figures</option>
                      <option value="other">Other Influencers</option>
                    </select>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg border border-white/10 overflow-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            <span>Name/Position</span>
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('country')}
                        >
                          <div className="flex items-center">
                            <span>Country</span>
                            {sortField === 'country' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('ips')}
                        >
                          <div className="flex items-center justify-center">
                            <span>IPS</span>
                            <div className="ml-1 group relative">
                              <Info className="h-3 w-3 text-gray-400" />
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-black/80 text-white text-xs p-2 rounded transition-opacity duration-200 pointer-events-none">
                                Individual Prominence Score - Measures the person's reach and influence
                              </div>
                            </div>
                            {sortField === 'ips' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('srs')}
                        >
                          <div className="flex items-center justify-center">
                            <span>SRS</span>
                            <div className="ml-1 group relative">
                              <Info className="h-3 w-3 text-gray-400" />
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-black/80 text-white text-xs p-2 rounded transition-opacity duration-200 pointer-events-none">
                                Supremacist Rhetoric Score - Measures supremacist language and messaging
                              </div>
                            </div>
                            {sortField === 'srs' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('pas')}
                        >
                          <div className="flex items-center justify-center">
                            <span>PAS</span>
                            <div className="ml-1 group relative">
                              <Info className="h-3 w-3 text-gray-400" />
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-black/80 text-white text-xs p-2 rounded transition-opacity duration-200 pointer-events-none">
                                Policy Action Score - Measures implemented policies or actions
                              </div>
                            </div>
                            {sortField === 'pas' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('isc')}
                        >
                          <div className="flex items-center justify-center">
                            <span>ISC</span>
                            <div className="ml-1 group relative">
                              <Info className="h-3 w-3 text-gray-400" />
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-black/80 text-white text-xs p-2 rounded transition-opacity duration-200 pointer-events-none">
                                Individual Supremacism Composite - Overall supremacism score
                              </div>
                            </div>
                            {sortField === 'isc' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('trend')}
                        >
                          <div className="flex items-center justify-center">
                            <span>Trend</span>
                            {sortField === 'trend' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {filteredIndividuals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No individuals match your search criteria
                          </td>
                        </tr>
                      ) : (
                        filteredIndividuals.map(ind => (
                          <tr
                            key={ind.id}
                            className="hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => setSelectedIndividual(ind)}
                          >
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">{ind.name}</div>
                              <div className="text-gray-400 text-sm">{ind.position}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {ind.country}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-gray-300">{ind.ips.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={getColorForScore(ind.srs)}>{ind.srs.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={getColorForScore(ind.pas)}>{ind.pas.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `rgba(${ind.isc <= 2 ? '59, 130, 246' :
                                                            ind.isc <= 4 ? '34, 197, 94' :
                                                            ind.isc <= 6 ? '234, 179, 8' :
                                                            ind.isc <= 8 ? '249, 115, 22' :
                                                            '239, 68, 68'}, 0.2)`,
                                  color: ind.isc <= 2 ? '#3b82f6' :
                                         ind.isc <= 4 ? '#22c55e' :
                                         ind.isc <= 6 ? '#eab308' :
                                         ind.isc <= 8 ? '#f97316' :
                                         '#ef4444'
                                }}
                              >
                                {ind.isc.toFixed(1)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center">
                                <TrendIcon trend={ind.trend} />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selectedIndividual && (
              <div className="mt-8 bg-black/40 rounded-lg border border-white/10 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl text-white font-medium">{selectedIndividual.name}</h2>
                    <p className="text-gray-400">{selectedIndividual.position} • {selectedIndividual.country}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 text-white border-white/20"
                    onClick={() => setSelectedIndividual(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-300">Individual Prominence Score</h3>
                      <span className="text-lg font-medium text-white">{selectedIndividual.ips.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedIndividual.ips * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Measures global influence and reach</p>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-300">Supremacist Rhetoric Score</h3>
                      <span className={`text-lg font-medium ${getColorForScore(selectedIndividual.srs)}`}>
                        {selectedIndividual.srs.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={getBgColorForScore(selectedIndividual.srs) + " h-2 rounded-full"}
                        style={{ width: `${selectedIndividual.srs * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Measures supremacist language and messaging</p>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-300">Policy Action Score</h3>
                      <span className={`text-lg font-medium ${getColorForScore(selectedIndividual.pas)}`}>
                        {selectedIndividual.pas.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={getBgColorForScore(selectedIndividual.pas) + " h-2 rounded-full"}
                        style={{ width: `${selectedIndividual.pas * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Measures implemented policies or actions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white mb-3">Individual Supremacism Composite</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold" style={{
                        color: selectedIndividual.isc <= 2 ? '#3b82f6' :
                               selectedIndividual.isc <= 4 ? '#22c55e' :
                               selectedIndividual.isc <= 6 ? '#eab308' :
                               selectedIndividual.isc <= 8 ? '#f97316' :
                               '#ef4444'
                      }}>
                        {selectedIndividual.isc.toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        <span className="text-gray-300 mr-2">Trend:</span>
                        <TrendIcon trend={selectedIndividual.trend} />
                        <span className="ml-1 text-sm" style={{
                          color: selectedIndividual.trend === 'increasing' ? '#ef4444' :
                                 selectedIndividual.trend === 'decreasing' ? '#22c55e' :
                                 '#9ca3af'
                        }}>
                          {selectedIndividual.trend === 'increasing' ? 'Increasing' :
                           selectedIndividual.trend === 'decreasing' ? 'Decreasing' :
                           'Stable'}
                        </span>
                      </div>
                    </div>
                    <div className="h-4 w-full rounded-lg overflow-hidden" style={{
                      background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                    }}>
                      <div className="relative h-full w-full">
                        <div
                          className="absolute top-0 h-full w-px bg-white"
                          style={{ left: `${selectedIndividual.isc * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 - Egalitarian</span>
                      <span>5 - Neutral</span>
                      <span>10 - Supremacist</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-300 text-sm">{selectedIndividual.description}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white mb-3">Key Indicators</h3>
                    <ul className="space-y-2">
                      {selectedIndividual.keyIndicators?.map((indicator, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mt-1 mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                          <span className="text-gray-300">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 text-right text-xs text-gray-400">
                      Last updated: {selectedIndividual.lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                <h2 className="text-xl text-white mb-4">Supremacism by Category</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Political Leaders</span>
                      <span>Average ISC: 5.8</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Business Executives</span>
                      <span>Average ISC: 5.6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '56%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Media Figures</span>
                      <span>Average ISC: 6.3</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '63%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Religious Leaders</span>
                      <span>Average ISC: 4.9</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '49%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                <h2 className="text-xl text-white mb-4">Regional Comparisons</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>North America</span>
                      <span>Average ISC: 5.7</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Europe</span>
                      <span>Average ISC: 3.9</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '39%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Asia</span>
                      <span>Average ISC: 6.8</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Africa</span>
                      <span>Average ISC: 5.4</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '54%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-black/30 p-6 rounded-lg border border-white/10">
                <h2 className="text-xl text-white mb-4">Top 5 Most Influential Individuals by ISC Score</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {sampleIndividuals
                    .sort((a, b) => b.isc - a.isc)
                    .slice(0, 5)
                    .map(ind => (
                      <div key={ind.id} className="bg-black/40 p-4 rounded-lg border border-white/10">
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${getBgColorForScore(ind.isc)} bg-opacity-20`}>
                            <span className={getColorForScore(ind.isc)}>{ind.isc.toFixed(1)}</span>
                          </div>
                          <h3 className="text-white font-medium">{ind.name}</h3>
                          <p className="text-gray-400 text-sm">{ind.position}</p>
                          <p className="text-gray-500 text-xs">{ind.country}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methodology">
            <div className="bg-black/30 p-6 rounded-lg border border-white/10">
              <h2 className="text-2xl text-white mb-4">Individual Supremacism Scoring Methodology</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg text-white mb-3">Scoring Components</h3>
                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="text-blue-400 font-medium mb-2">Individual Prominence Score (IPS)</h4>
                      <p className="text-gray-300 text-sm">Measures the individual's reach and influence based on:</p>
                      <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4">
                        <li>• Global recognition and visibility</li>
                        <li>• Institutional power and authority</li>
                        <li>• Media presence and platform reach</li>
                        <li>• Policy and decision-making capacity</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="text-blue-400 font-medium mb-2">Supremacist Rhetoric Score (SRS)</h4>
                      <p className="text-gray-300 text-sm">Evaluates language, messaging, and stated beliefs:</p>
                      <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4">
                        <li>• Explicit or implicit superiority claims</li>
                        <li>• Dehumanizing language toward outgroups</li>
                        <li>• Nationalist or ethnocentric messaging</li>
                        <li>• Reinforcement of harmful stereotypes</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="text-blue-400 font-medium mb-2">Policy Action Score (PAS)</h4>
                      <p className="text-gray-300 text-sm">Measures concrete actions and implemented policies:</p>
                      <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4">
                        <li>• Discriminatory policies implemented or supported</li>
                        <li>• Unequal resource distribution controlled</li>
                        <li>• Enforcement of hierarchical structures</li>
                        <li>• Decisions that systematically favor certain groups</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-white mb-3">Scoring Scale & Application</h3>

                  <div className="bg-black/40 p-4 rounded-lg border border-white/10 mb-4">
                    <h4 className="text-blue-400 font-medium mb-2">Individual Supremacism Composite (ISC)</h4>
                    <p className="text-gray-300 text-sm">The ISC is calculated using a weighted formula:</p>
                    <div className="bg-black/60 p-2 rounded my-2 text-white text-center">
                      ISC = (0.3 × SRS) + (0.5 × PAS) + (0.2 × adjusted IPS)
                    </div>
                    <p className="text-gray-400 text-sm">This formula weights actions higher than rhetoric, while accounting for the amplifying effect of prominence.</p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                    <h4 className="text-blue-400 font-medium mb-2">Score Interpretation</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-white text-sm">0-2: Strong Egalitarianism</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-white text-sm">2.1-4: Mixed or Mild Egalitarianism</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-white text-sm">4.1-6: Soft Supremacism</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-white text-sm">6.1-8: Structural Supremacism</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-white text-sm">8.1-10: Extreme Supremacism</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border border-white/10 mt-4">
                    <h4 className="text-blue-400 font-medium mb-2">Data Collection Methods</h4>
                    <ul className="text-gray-400 text-sm space-y-1 ml-4">
                      <li>• Public statements and media analysis</li>
                      <li>• Policy implementation records</li>
                      <li>• Independent research reports</li>
                      <li>• Peer-reviewed scoring by multiple analysts</li>
                      <li>• AI-assisted pattern recognition in discourse</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Full Methodology Paper
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IndividualsMetrics;