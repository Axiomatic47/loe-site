// src/components/worldmap/GlobalTrendsTab.tsx
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Helper function for styling
const getColorClass = (score) => {
  if (score <= 2) return "bg-blue-500";
  if (score <= 4) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  if (score <= 8) return "bg-orange-500";
  return "bg-red-500";
};

// Helper functions to calculate stats from data
const getSampleRegionalData = () => ([
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
]);

// Helper function to calculate category distributions
const getCategoryDistribution = (countries) => {
  // Count countries by category
  const categoryCounts = countries.reduce((acc, country) => {
    const category = country.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentages
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + Number(count), 0);

  // Map categories to format needed for display
  return Object.entries(categoryCounts).map(([category, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const colorClass =
      category.includes("Non-Supremacist") ? "bg-blue-500" :
      category.includes("Mixed") ? "bg-green-500" :
      category.includes("Soft") ? "bg-yellow-500" :
      category.includes("Structural") ? "bg-orange-500" :
      "bg-red-500";

    return {
      category,
      count,
      percentage,
      colorClass
    };
  });
};

// Helper function to get event type distributions
const getEventTypeDistribution = (events) => {
  // Get event types counts
  const typeCounts = events.reduce((acc, event) => {
    const type = event.event_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Calculate total
  const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);

  // Convert to array and sort by count
  const typeArray = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // Limit to top 5 types for display
  return typeArray.slice(0, 5);
};

interface GlobalTrendsTabProps {
  countries: any[];
  events: any[];
  regionalData: any[];
  isLoading: boolean;
}

const GlobalTrendsTab: React.FC<GlobalTrendsTabProps> = ({
  countries,
  events,
  regionalData,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Global thermodynamic analysis section */}
      <div className="bg-black/30 p-6 rounded-lg border border-white/10">
        <h2 className="text-2xl text-white mb-4">Global Thermodynamic Analysis</h2>
        <p className="text-gray-300 mb-4">
          Track worldwide thermodynamic-like patterns in the flow between supremacism and egalitarianism
          according to the Supremacist-Egalitarianism Methodology.
        </p>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 bg-black/40 rounded border border-white/10 flex items-center justify-center">
            <span className="text-gray-400">Thermodynamic trend chart visualization coming soon</span>
          </div>
        )}
      </div>

      {/* Regional charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regional comparison chart */}
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-full">
          <h3 className="text-lg font-medium mb-3 text-white">Regional Comparison</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="h-64 bg-black/40 rounded border border-white/10 p-4">
              <div className="space-y-4">
                {(regionalData.length > 0 ? regionalData : getSampleRegionalData()).map(region => (
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
          )}
        </div>

        {/* Category distribution chart */}
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-full">
          <h3 className="text-lg font-medium mb-3 text-white">Global Category Distribution</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getCategoryDistribution(countries).map(({ category, count, percentage, colorClass }) => (
                <div key={category}>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{category}</span>
                    <span>{count} countries ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event statistics section */}
      <div className="bg-black/30 p-6 rounded-lg border border-white/10">
        <h2 className="text-2xl text-white mb-4">Conflict Event Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event sources chart */}
          <div className="bg-black/40 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-3 text-white">Event Sources</h3>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
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
            )}
          </div>

          {/* Event type distribution */}
          <div className="bg-black/40 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-3 text-white">Event Type Distribution</h3>

            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 bg-black/50 rounded border border-white/10 p-4 flex flex-col justify-center">
                {getEventTypeDistribution(events).map(({ type, count, percentage }) => (
                  <div key={type} className="mb-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{type}</span>
                      <span>{count} events ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTrendsTab;