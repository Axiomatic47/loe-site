import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// This component uses Leaflet instead of react-simple-maps for better React 18 compatibility
const InteractiveWorldMap = ({ countries = [], onSelectCountry }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Create a map of country codes to data for easy lookup
  const countryDataMap = countries.reduce((acc, country) => {
    if (country.code) {
      acc[country.code] = country;
    }
    return acc;
  }, {});

  // Define country coordinates mapping for placing markers
  const countryCoordinates = {
    // North America
    US: { lat: 39.8283, lng: -98.5795 }, // United States
    CA: { lat: 56.1304, lng: -106.3468 }, // Canada
    MX: { lat: 23.6345, lng: -102.5528 }, // Mexico

    // Europe
    GB: { lat: 55.3781, lng: -3.4360 }, // United Kingdom
    DE: { lat: 51.1657, lng: 10.4515 }, // Germany
    FR: { lat: 46.2276, lng: 2.2137 }, // France
    IT: { lat: 41.8719, lng: 12.5674 }, // Italy
    ES: { lat: 40.4637, lng: -3.7492 }, // Spain
    RU: { lat: 61.5240, lng: 105.3188 }, // Russia
    SE: { lat: 60.1282, lng: 18.6435 }, // Sweden

    // Asia
    CN: { lat: 35.8617, lng: 104.1954 }, // China
    JP: { lat: 36.2048, lng: 138.2529 }, // Japan
    IN: { lat: 20.5937, lng: 78.9629 }, // India
    KR: { lat: 35.9078, lng: 127.7669 }, // South Korea

    // Africa
    ZA: { lat: -30.5595, lng: 22.9375 }, // South Africa
    NG: { lat: 9.0820, lng: 8.6753 }, // Nigeria
    EG: { lat: 26.8206, lng: 30.8025 }, // Egypt

    // South America
    BR: { lat: -14.2350, lng: -51.9253 }, // Brazil
    AR: { lat: -38.4161, lng: -63.6167 }, // Argentina

    // Oceania
    AU: { lat: -25.2744, lng: 133.7751 }, // Australia
    NZ: { lat: -40.9006, lng: 174.8860 }, // New Zealand
  };

  const getColorForScore = (score) => {
    if (score <= 2) return "#3b82f6"; // blue
    if (score <= 4) return "#22c55e"; // green
    if (score <= 6) return "#eab308"; // yellow
    if (score <= 8) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getColorClass = (score) => {
    if (score <= 2) return "bg-blue-500";
    if (score <= 4) return "bg-green-500";
    if (score <= 6) return "bg-yellow-500";
    if (score <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  // Initialize map on component mount
  useEffect(() => {
    // Skip if we've already initialized or if the ref isn't ready
    if (leafletMap.current || !mapRef.current) return;

    // Dynamically import Leaflet only when we need it
    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = await import('leaflet');

        // Import Leaflet CSS
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkEl);

        // Wait for CSS to load
        setTimeout(() => {
          // Create map
          const map = L.map(mapRef.current, {
            center: [20, 0],
            zoom: 2,
            minZoom: 1.5,
            maxZoom: 7,
            zoomControl: false,
            attributionControl: false
          });

          // Add dark style tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Store the map reference
          leafletMap.current = map;
          setIsMapReady(true);
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);

        // Fallback to simple visualization
        setIsMapReady(false);
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      setIsMapReady(false);
    };
  }, [mapRef]);

  // Update markers when countries or map changes
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    // Clean up old markers
    markersRef.current.forEach(marker => {
      if (leafletMap.current) {
        marker.remove();
      }
    });
    markersRef.current = [];

    // Dynamically import Leaflet
    const addMarkers = async () => {
      const L = await import('leaflet');

      // Add markers for each country with data
      countries.forEach(country => {
        const code = country.code;
        const coords = countryCoordinates[code];
        if (!coords) return; // Skip if no coordinates

        // Create circle marker
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          fillColor: getColorForScore(country.gscs),
          color: "#fff",
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8
        }).addTo(leafletMap.current);

        // Add hover tooltip
        marker.bindTooltip(`${country.country || country.name}: ${country.gscs.toFixed(1)}`, {
          direction: 'top',
          className: 'leaflet-tooltip-custom'
        });

        // Add click handler
        marker.on('click', () => {
          if (onSelectCountry) {
            onSelectCountry(country);
          }
        });

        // Store marker reference for cleanup
        markersRef.current.push(marker);
      });
    };

    addMarkers();
  }, [countries, isMapReady, onSelectCountry]);

  // Handle zoom buttons
  const handleZoomIn = async () => {
    if (!leafletMap.current) return;
    leafletMap.current.setZoom(leafletMap.current.getZoom() + 1);
  };

  const handleZoomOut = async () => {
    if (!leafletMap.current) return;
    leafletMap.current.setZoom(leafletMap.current.getZoom() - 1);
  };

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Supremacism Map</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20"
            onClick={handleZoomIn}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20"
            onClick={handleZoomOut}
          >
            −
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-96">
        <div
          ref={mapRef}
          className="h-96 bg-black/40 rounded border border-white/10 leaflet-container"
          style={{ width: '100%', height: '100%' }}
        />

        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded border border-white/10">
            <p className="text-gray-300">Loading map...</p>
          </div>
        )}

        {/* Add a legend inside the map */}
        <div className="absolute bottom-4 left-4 bg-black/80 p-2 rounded-md border border-white/20 z-[1000]">
          <div className="text-xs text-white mb-1">Supremacism Level</div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Custom tooltip styles */}
      <style jsx global>{`
        .leaflet-tooltip-custom {
          background-color: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 4px;
          font-size: 12px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .leaflet-tooltip-top.leaflet-tooltip-custom::before {
          border-top-color: rgba(0, 0, 0, 0.8);
        }
        .leaflet-container {
          background-color: #1a202c; /* Match your theme */
        }
      `}</style>
    </div>
  );
};

export default InteractiveWorldMap;