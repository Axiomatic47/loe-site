import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Helper functions for color coding
const getColor = (score) => {
  if (score <= 2) return '#3b82f6'; // blue
  if (score <= 4) return '#22c55e'; // green
  if (score <= 6) return '#eab308'; // yellow
  if (score <= 8) return '#f97316'; // orange
  return '#ef4444'; // red
};

const getCategory = (score) => {
  if (score <= 2) return "Non-Supremacist Governance";
  if (score <= 4) return "Mixed Governance";
  if (score <= 6) return "Soft Supremacism";
  if (score <= 8) return "Structural Supremacism";
  return "Extreme Supremacism";
};

// Country coordinates mapping for placing markers
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
  NO: { lat: 60.4720, lng: 8.4689 }, // Norway

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

// Country code to name mapping
const countryCodeToName = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  RU: "Russia",
  SE: "Sweden",
  NO: "Norway",
  CN: "China",
  JP: "Japan",
  IN: "India",
  KR: "South Korea",
  ZA: "South Africa",
  NG: "Nigeria",
  EG: "Egypt",
  BR: "Brazil",
  AR: "Argentina",
  AU: "Australia",
  NZ: "New Zealand",
};

const LeafletWorldMap = ({ countries = [], onSelectCountry, isLoading = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [styleAdded, setStyleAdded] = useState(false);
  const leafletLoadedRef = useRef(false);

  // Load Leaflet scripts and CSS just once
  useEffect(() => {
    // Skip if already loaded
    if (document.getElementById('leaflet-css') || leafletLoadedRef.current) {
      return;
    }

    leafletLoadedRef.current = true;

    // Create and load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkEl.id = 'leaflet-css';
    document.head.appendChild(linkEl);

    // Create and load Leaflet JS
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.id = 'leaflet-js';
    scriptEl.onload = () => {
      setScriptLoaded(true);
    };
    document.head.appendChild(scriptEl);

    // Clean up on unmount - this should only happen once
    return () => {
      const css = document.getElementById('leaflet-css');
      const js = document.getElementById('leaflet-js');
      if (css) css.remove();
      if (js) js.remove();
      leafletLoadedRef.current = false;

      // Also clean up map instance if it exists
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Empty dependency array - run once only

  // Initialize the map when scripts are loaded and the div is mounted
  useEffect(() => {
    // Skip if any condition is not met
    if (!scriptLoaded || !mapRef.current || mapInitialized) {
      return;
    }

    try {
      // Get the Leaflet library from window
      const L = window.L;
      if (!L) return;

      // Create the map instance
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      // Save map instance for later use
      mapInstance.current = map;

      // Add a dark tile layer for the theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Add attribution in a more subtle way
      L.control.attribution({
        position: 'bottomright',
        prefix: ''
      }).addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>'
      ).addTo(map);

      // Custom zoom controls
      const zoomControl = L.control({position: 'topright'});

      zoomControl.onAdd = function() {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar bg-black/50 backdrop-blur-sm rounded shadow-lg p-1 border border-white/10');

        // Zoom in button
        const zoomInButton = L.DomUtil.create('button', 'mb-1 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded', container);
        zoomInButton.innerHTML = '+';
        L.DomEvent.on(zoomInButton, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          map.setZoom(map.getZoom() + 1);
        });

        // Zoom out button
        const zoomOutButton = L.DomUtil.create('button', 'bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded', container);
        zoomOutButton.innerHTML = '−';
        L.DomEvent.on(zoomOutButton, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          map.setZoom(map.getZoom() - 1);
        });

        return container;
      };

      zoomControl.addTo(map);

      // Finally set initialization flag
      setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [scriptLoaded]); // Only depend on scriptLoaded

  // Add custom popup styles once
  useEffect(() => {
    if (!mapInitialized || styleAdded) return;

    try {
      // Add custom popup styles
      const style = document.createElement('style');
      style.innerHTML = `
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 6px;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: rgba(0, 0, 0, 0.8);
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
      `;
      document.head.appendChild(style);
      setStyleAdded(true);
    } catch (error) {
      console.error("Error adding styles:", error);
    }
  }, [mapInitialized, styleAdded]);

  // Add or update country markers when countries data changes
  useEffect(() => {
    if (!mapInitialized || !mapInstance.current || !countries.length) return;

    try {
      const L = window.L;
      if (!L) return;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (mapInstance.current) {
          marker.remove();
        }
      });
      markersRef.current = [];

      // Add markers for countries with data
      const newMarkers = [];
      countries.forEach(country => {
        const code = country.code;
        const coords = countryCoordinates[code];
        if (!coords) return; // Skip if no coordinates

        // Create a circle marker with color based on GSCS score
        const marker = L.circle([coords.lat, coords.lng], {
          color: getColor(country.gscs),
          fillColor: getColor(country.gscs),
          fillOpacity: 0.7,
          weight: 1,
          radius: 200000, // Size in meters
        }).addTo(mapInstance.current);

        // Add a popup with country information
        marker.bindPopup(`
          <div style="min-width: 180px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${country.country || countryCodeToName[country.code] || country.code}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>GSCS Score:</span>
              <span style="font-weight: bold;">${country.gscs.toFixed(1)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Category:</span>
              <span>${getCategory(country.gscs)}</span>
            </div>
            <div style="font-size: 12px; color: #aaa; margin-top: 2px;">Click for details</div>
          </div>
        `, {
          className: 'custom-popup',
        });

        // Handle click event
        marker.on('click', () => {
          if (onSelectCountry) {
            onSelectCountry(country);
          }
        });

        // Store marker reference for cleanup
        newMarkers.push(marker);
      });

      // Update markers ref with new array
      markersRef.current = newMarkers;

    } catch (error) {
      console.error("Error adding markers:", error);
    }
  }, [countries, mapInitialized]);

  // Handle zoom reset (fit all markers in view)
  const handleResetView = () => {
    if (!mapInstance.current || markersRef.current.length === 0) return;

    try {
      const L = window.L;
      if (!L) return;

      // Create a bounds object that includes all markers
      const bounds = L.latLngBounds(markersRef.current.map(marker => marker.getLatLng()));

      // Fit the map to these bounds with some padding
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    } catch (error) {
      console.error("Error resetting view:", error);
    }
  };

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Supremacism Map</h3>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20"
            onClick={handleResetView}
            disabled={!mapInitialized}
          >
            Reset View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20"
            onClick={() => {
              if (mapInstance.current) {
                // Open a new window with just the map
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(`
                    <html>
                      <head>
                        <title>Supremacism World Map</title>
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          body { margin: 0; padding: 0; }
                          #map { width: 100vw; height: 100vh; }
                          .map-title {
                            position: absolute;
                            top: 20px;
                            left: 20px;
                            z-index: 1000;
                            background: rgba(0,0,0,0.7);
                            color: white;
                            padding: 10px 20px;
                            border-radius: 4px;
                            font-family: Arial, sans-serif;
                          }
                          .custom-popup .leaflet-popup-content-wrapper {
                            background-color: rgba(0, 0, 0, 0.8);
                            color: white;
                            border-radius: 6px;
                          }
                          .custom-popup .leaflet-popup-tip {
                            background-color: rgba(0, 0, 0, 0.8);
                          }
                        </style>
                      </head>
                      <body>
                        <div class="map-title">
                          <h2>Global Supremacism Map</h2>
                        </div>
                        <div id="map"></div>
                        <script>
                          const map = L.map('map').setView([20, 0], 2);

                          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                            subdomains: 'abcd',
                            maxZoom: 20,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>'
                          }).addTo(map);
                        </script>
                      </body>
                    </html>
                  `);
                }
              }
            }}
            disabled={!mapInitialized}
          >
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-96">
        <div
          ref={mapRef}
          className="h-96 bg-black/40 rounded-lg border border-white/10 relative w-full"
        />

        {(!scriptLoaded || !mapInitialized || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <p className="text-white">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map legend */}
      <div className="mt-2 p-2 bg-black/50 rounded border border-white/10 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span className="text-xs text-gray-400">0-2</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span className="text-xs text-gray-400">2-4</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
            <span className="text-xs text-gray-400">4-6</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
            <span className="text-xs text-gray-400">6-8</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span className="text-xs text-gray-400">8-10</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Supremacism Global Metric (SGM)
        </div>
      </div>
    </div>
  );
};

export default LeafletWorldMap;