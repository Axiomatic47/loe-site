// src/components/LeafletHeatMap.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, ZoomIn, ZoomOut, RefreshCw, Maximize } from "lucide-react";

// This patches Leaflet.heat to fix the canvas warning
const patchLeafletHeat = () => {
  if (!window.L || !window.L.heatLayer) return;

  // Store the original draw method
  const originalDraw = window.L.HeatLayer.prototype._draw;

  // Replace with patched version that sets willReadFrequently
  window.L.HeatLayer.prototype._draw = function() {
    // Ensure canvas context has willReadFrequently set
    if (this._canvas && this._canvas.getContext) {
      const existingContext = this._canvas.getContext('2d');

      // Only recreate context if the attribute isn't already set
      if (!existingContext.willReadFrequently) {
        // Force recreation of context with willReadFrequently
        const canvas = this._canvas;
        const width = canvas.width;
        const height = canvas.height;

        // Create new canvas and copy content
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });

        // Copy attributes from old canvas
        newCanvas.style.cssText = canvas.style.cssText;
        newCanvas.className = canvas.className;

        // Replace old canvas with new one
        if (canvas.parentNode) {
          canvas.parentNode.replaceChild(newCanvas, canvas);
          this._canvas = newCanvas;
        }
      }
    }

    // Call original draw method
    return originalDraw.apply(this, arguments);
  };
};

const LeafletHeatMap = ({
  countries = [],
  events = [],
  onSelectCountry,
  onSelectEvent,
  isLoading = false,
  showGDELT = true,
  showACLED = true,
  showCountries = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const countryMarkersRef = useRef([]);
  const eventMarkersRef = useRef([]);
  const leafletLoadedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Stats for display
  const [stats, setStats] = useState({
    visibleCountries: 0,
    visibleEvents: 0,
    gdeltCount: 0,
    acledCount: 0
  });

  // Load Leaflet and HeatMap plugin scripts dynamically
  useEffect(() => {
    if (leafletLoadedRef.current) return;
    leafletLoadedRef.current = true;

    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkElement);

        // Load Leaflet JS
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.async = true;

        // Load Leaflet heat plugin after Leaflet loads
        leafletScript.onload = () => {
          const heatScript = document.createElement('script');
          heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          heatScript.async = true;
          heatScript.onload = () => {
            // Patch Leaflet.heat before setting scriptLoaded
            patchLeafletHeat();
            setScriptLoaded(true);
            console.log("Leaflet and Leaflet.heat loaded successfully");
          };
          document.body.appendChild(heatScript);
        };

        document.body.appendChild(leafletScript);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();

    return () => {
      // Cleanup is handled in another useEffect
    };
  }, []);

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.L) return;

    if (!mapInstanceRef.current && mapRef.current) {
      const L = window.L;
      console.log("Initializing Leaflet map");

      // Create map with dark theme and restricted bounds
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [10, 0], // Adjust center for better world fit
        zoom: 1.75, // Lower initial zoom to fit the world
        minZoom: 1.5, // Allow zooming out for smaller screens
        maxZoom: 8,
        maxBounds: [[-90, -195], [90, 195]], // Wider bounds
        maxBoundsViscosity: 1.0, // Prevent dragging outside bounds
        worldCopyJump: false, // Disable world copying
        zoomControl: false, // We'll add custom controls
        attributionControl: false, // We'll add our own attribution
        scrollWheelZoom: 'center', // Zoom to cursor position
        zoomDelta: 0.5, // Smoother zoom steps
        zoomSnap: 0.25, // Finer zoom level snapping
        inertia: true, // Enable inertia for smoother panning
      });

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      // Add attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: ''
      }).addTo(mapInstanceRef.current);

      // Add custom styles for popups
      addCustomStyles();

      // Fit world bounds
      setTimeout(() => {
        if (mapInstanceRef.current) {
          const worldBounds = L.latLngBounds(
            L.latLng(-60, -170), // Southwest corner (excluding Antarctica)
            L.latLng(75, 170)    // Northeast corner
          );

          mapInstanceRef.current.fitBounds(worldBounds, {
            animate: false,
            padding: [10, 10]
          });
        }
      }, 100);
    }

    // Handle window resize
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scriptLoaded]);

  // Add custom popup styles
  const addCustomStyles = () => {
    try {
      if (!document.getElementById('custom-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-popup-styles';
        style.innerHTML = `
          .custom-popup .leaflet-popup-content-wrapper {
            background-color: rgba(15, 23, 42, 0.95);
            color: white;
            border-radius: 6px;
            padding: 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .custom-popup .leaflet-popup-tip {
            background-color: rgba(15, 23, 42, 0.95);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          .custom-popup .leaflet-popup-content {
            margin: 14px;
            line-height: 1.5;
          }
          .country-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .score-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .score-label {
            color: rgba(255, 255, 255, 0.7);
          }
          .score-value {
            font-weight: 600;
          }
          .category-label {
            font-size: 12px;
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
          }
          .event-marker {
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            text-align: center;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .event-gdelt {
            background-color: rgba(234, 88, 12, 0.8);
            color: white;
          }
          .event-acled {
            background-color: rgba(220, 38, 38, 0.8);
            color: white;
          }

          /* Fix for canvas elements */
          canvas.leaflet-heatmap-layer {
            will-change: contents;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error adding styles:", error);
    }
  };

  // Create and update map layers when data or visibility settings change
  useEffect(() => {
    if (!scriptLoaded || !window.L || !mapInstanceRef.current) return;

    const L = window.L;
    console.log("Updating map layers with data:", {
      countries: countries.length,
      events: events.length,
      showCountries,
      showGDELT,
      showACLED
    });

    try {
      // Clear existing layers
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // Clear country markers
      countryMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          marker.remove();
        }
      });
      countryMarkersRef.current = [];

      // Clear event markers
      eventMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          marker.remove();
        }
      });
      eventMarkersRef.current = [];

      // Filter the events based on visibility settings
      const visibleEvents = events.filter(event => {
        if (event.data_source === 'GDELT' && !showGDELT) return false;
        if (event.data_source === 'ACLED' && !showACLED) return false;
        return true;
      });

      // Count by source for stats
      const gdeltCount = events.filter(e => e.data_source === 'GDELT').length;
      const acledCount = events.filter(e => e.data_source === 'ACLED').length;

      // Update stats
      setStats({
        visibleCountries: showCountries ? countries.length : 0,
        visibleEvents: visibleEvents.length,
        gdeltCount,
        acledCount
      });

      // Add country heatmap if countries should be displayed
      if (showCountries && countries.length > 0) {
        addCountryHeatmap(countries);
      }

      // Add event markers if events should be displayed
      if (visibleEvents.length > 0) {
        addEventMarkers(visibleEvents);
      }

    } catch (error) {
      console.error('Error updating map layers:', error);
    }
  }, [countries, events, scriptLoaded, showCountries, showGDELT, showACLED]);

  // Add country heatmap layer
  const addCountryHeatmap = (countries) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    try {
      // Prepare heat data points
      const heatData = countries.map(country => {
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        // Skip countries without coordinates
        if (lat === 0 || lng === 0) return null;

        // Get the intensity value
        const rawIntensity = country.sgm || country.gscs || 0;

        // Scale intensity based on value:
        // - For egalitarianism (0-5), scale higher for blue side
        // - For supremacism (5-10), scale higher for red side
        let intensity = rawIntensity <= 5
          ? (5 - rawIntensity) * 1.4  // Blue scale (egalitarianism)
          : (rawIntensity - 5) * 1.4 + 7; // Red scale (supremacism)

        // Return [lat, lng, intensity]
        return [lat, lng, intensity];
      }).filter(Boolean); // Remove null entries

      // Create heat layer with custom gradient
      const heatOptions = {
        radius: 40, // Larger radius for better visibility
        blur: 30, // More blur for smoother gradients
        maxZoom: 10,
        max: 10,
        minOpacity: 0.5,
        gradient: {
          0.0: '#0000ff', // Deep blue - egalitarianism
          0.2: '#2a7fff', // Light blue - moderate egalitarianism
          0.4: '#ffffff', // White - neutral
          0.6: '#ffaa00', // Orange - moderate supremacism
          0.8: '#ff5500', // Orange-red - strong supremacism
          1.0: '#ff0000'  // Deep red - extreme supremacism
        }
      };

      heatLayerRef.current = L.heatLayer(heatData, heatOptions).addTo(mapInstanceRef.current);

      // Add clickable markers on top of the heatmap
      countries.forEach(country => {
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        if (lat === 0 || lng === 0) return;

        // Create a transparent marker for clicking
        const marker = L.circleMarker([lat, lng], {
          radius: 12,
          fillOpacity: 0,
          opacity: 0,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Get country name
        const countryName = country.country || country.name || country.code;

        // Get category based on SGM score
        const getCategory = (score) => {
          if (score <= 2) return "Strong Egalitarianism";
          if (score <= 4) return "Mixed Governance";
          if (score <= 6) return "Soft Supremacism";
          if (score <= 8) return "Structural Supremacism";
          return "Extreme Supremacism";
        };

        // Add popup with country info
        marker.bindPopup(`
          <div>
            <div class="country-name">${countryName}</div>
            <div class="score-row">
              <span class="score-label">SGM Score:</span>
              <span class="score-value">${(country.sgm || country.gscs).toFixed(1)}</span>
            </div>
            ${country.srsD ? `
            <div class="score-row">
              <span class="score-label">Domestic:</span>
              <span class="score-value">${country.srsD.toFixed(1)}</span>
            </div>
            ` : ''}
            ${country.srsI ? `
            <div class="score-row">
              <span class="score-label">International:</span>
              <span class="score-value">${country.srsI.toFixed(1)}</span>
            </div>
            ` : ''}
            <div class="category-label">${getCategory(country.sgm || country.gscs)}</div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 220
        });

        // Handle click event
        marker.on('click', () => {
          if (onSelectCountry) {
            onSelectCountry(country);
          }
        });

        countryMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error creating country heatmap:', error);
    }
  };

  // Add event markers
  const addEventMarkers = (events) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    try {
      events.forEach(event => {
        const lat = event.latitude || 0;
        const lng = event.longitude || 0;

        if (lat === 0 || lng === 0) return;

        // Create a custom icon based on the data source
        const icon = L.divIcon({
          className: `event-marker event-${event.data_source?.toLowerCase() || 'gdelt'}`,
          iconSize: [16, 16],
          html: ''
        });

        const marker = L.marker([lat, lng], {
          icon: icon,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Prepare event info for popup
        const eventType = event.event_type || 'Conflict Event';
        const location = event.location || event.country || 'Unknown';
        const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Unknown date';
        const description = event.description || 'No description available';

        // Add popup with event info
        marker.bindPopup(`
          <div>
            <div class="country-name">${eventType}</div>
            <div class="score-row">
              <span class="score-label">Location:</span>
              <span class="score-value">${location}</span>
            </div>
            <div class="score-row">
              <span class="score-label">Date:</span>
              <span class="score-value">${date}</span>
            </div>
            <div class="score-row">
              <span class="score-label">Details:</span>
            </div>
            <div style="font-size: 12px; margin-top: 4px; color: rgba(255,255,255,0.8);">
              ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}
            </div>
            <div class="category-label">${event.data_source || 'GDELT'} Event</div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 250
        });

        // Handle click event
        marker.on('click', () => {
          if (onSelectEvent) {
            onSelectEvent(event);
          }
        });

        eventMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error adding event markers:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (heatLayerRef.current) {
        heatLayerRef.current = null;
      }

      countryMarkersRef.current = [];
      eventMarkersRef.current = [];
    };
  }, []);

  // Reset view function
  const handleResetView = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      const L = window.L;
      const worldBounds = L.latLngBounds(
        L.latLng(-60, -170), // Southwest corner (excluding Antarctica)
        L.latLng(75, 170)    // Northeast corner (excluding northernmost areas)
      );

      mapInstanceRef.current.fitBounds(worldBounds, {
        animate: true,
        duration: 0.75,
        padding: [10, 10]
      });
    } catch (error) {
      console.error("Error resetting view:", error);
    }
  }, []);

  // Handle zoom in function
  const handleZoomIn = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + 0.5, { animate: true });
  }, []);

  // Handle zoom out function
  const handleZoomOut = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom - 0.5, { animate: true });
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = useCallback(() => {
    try {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      if (!document.fullscreenElement) {
        if (mapContainer.requestFullscreen) {
          mapContainer.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
        } else if (mapContainer.webkitRequestFullscreen) {
          mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
          mapContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen toggle error:", error);
    }
  }, []);

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Conflict & Supremacism Map</h3>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleZoomIn}
            disabled={!scriptLoaded}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleZoomOut}
            disabled={!scriptLoaded}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleResetView}
            disabled={!scriptLoaded}
            title="Reset View"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={toggleFullscreen}
            disabled={!scriptLoaded}
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-96 md:h-[450px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <div
          ref={mapRef}
          className="h-full w-full bg-gray-900 relative"
          id="map-container"
          style={{ willChange: 'transform', willReadFrequently: true }}
        />

        {(isLoading || !scriptLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm pointer-events-none z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <p className="text-white">Loading map data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map stats and legend */}
      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SGM Color Scale */}
          <div className="col-span-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">Egalitarianism</span>
              <span className="text-xs text-gray-400">Supremacism</span>
            </div>
            <div className="h-3 w-full rounded-full" style={{background: 'linear-gradient(to right, #0000ff, #2a7fff, #ffffff, #ffaa00, #ff5500, #ff0000)'}}></div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-300">0</span>
              <span className="text-xs text-gray-300">2</span>
              <span className="text-xs text-gray-300">4</span>
              <span className="text-xs text-gray-300">6</span>
              <span className="text-xs text-gray-300">8</span>
              <span className="text-xs text-gray-300">10</span>
            </div>
          </div>

          {/* Event sources legend */}
          <div className="flex flex-col justify-center md:justify-start items-center md:items-start">
            <div className="text-xs text-gray-400 mb-2">Event Sources:</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full mr-1"></div>
                <span className="text-xs text-gray-300">GDELT ({stats.gdeltCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                <span className="text-xs text-gray-300">ACLED ({stats.acledCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data stats */}
        <div className="text-xs text-gray-400 text-center mt-2">
          {stats.visibleCountries > 0 && stats.visibleEvents > 0 && (
            <>
              Showing data from {stats.visibleCountries} countries and {stats.visibleEvents} events
              {showGDELT && !showACLED && " (GDELT only)"}
              {!showGDELT && showACLED && " (ACLED only)"}
            </>
          )}
          {stats.visibleCountries > 0 && stats.visibleEvents === 0 && (
            <>Showing data from {stats.visibleCountries} countries</>
          )}
          {stats.visibleCountries === 0 && stats.visibleEvents > 0 && (
            <>Showing {stats.visibleEvents} conflict events</>
          )}
          {stats.visibleCountries === 0 && stats.visibleEvents === 0 && (
            <>No data to display</>
          )}
        </div>
      </div>
    </div>
  );
};

LeafletHeatMap.propTypes = {
  countries: PropTypes.array,
  events: PropTypes.array,
  onSelectCountry: PropTypes.func,
  onSelectEvent: PropTypes.func,
  isLoading: PropTypes.bool,
  showGDELT: PropTypes.bool,
  showACLED: PropTypes.bool,
  showCountries: PropTypes.bool
};

export default LeafletHeatMap;