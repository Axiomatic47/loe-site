import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Country code to name mapping for popups
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

// Category function based on score
const getCategory = (score) => {
  if (score <= 2) return "Strong Egalitarianism";
  if (score <= 4) return "Mixed Governance";
  if (score <= 6) return "Neutral Balance";
  if (score <= 8) return "Soft Supremacism";
  return "Strong Supremacism";
};

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

const LeafletHeatMap = ({ countries, onSelectCountry, isLoading = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const leafletLoadedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

      // Create map with light theme and restricted bounds
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [10, 0], // Adjust center to be slightly lower for better world fit
        zoom: 1.75, // Lower initial zoom to fit the entire world
        minZoom: 1.5, // Allow slightly more zoom out for smaller screens
        maxZoom: 6,
        maxBounds: [[-90, -195], [90, 195]], // Slightly wider bounds for better view
        maxBoundsViscosity: 1.0, // Prevent dragging outside bounds
        worldCopyJump: true, // Enable world copying when panning
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: true, // We'll add attribution
        scrollWheelZoom: 'center', // Zoom to cursor position
        zoomDelta: 0.5, // Smoother zoom steps
        zoomSnap: 0.25, // Finer zoom level snapping
        inertia: true, // Enable inertia for smoother panning
        inertiaDeceleration: 3000, // Slow down inertia for smoother stops
        easeLinearity: 0.1 // Make zooming feel more natural
      });

      // Add map tiles with a dark theme for better contrast with the heatmap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      // Custom zoom controls
      const zoomControl = L.control({position: 'topright'});

      zoomControl.onAdd = function() {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar bg-black/50 backdrop-blur-sm rounded shadow-lg p-1 border border-white/10');

        // Zoom in button with improved styling
        const zoomInButton = L.DomUtil.create('button', 'mb-1 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded transition-colors', container);
        zoomInButton.innerHTML = '+';
        zoomInButton.setAttribute('aria-label', 'Zoom in');
        zoomInButton.style.fontSize = '18px';
        L.DomEvent.on(zoomInButton, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 0.5, {
            animate: true
          });
        });

        // Zoom out button with improved styling
        const zoomOutButton = L.DomUtil.create('button', 'bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded transition-colors', container);
        zoomOutButton.innerHTML = '−';
        zoomOutButton.setAttribute('aria-label', 'Zoom out');
        zoomOutButton.style.fontSize = '18px';
        L.DomEvent.on(zoomOutButton, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 0.5, {
            animate: true
          });
        });

        return container;
      };

      zoomControl.addTo(mapInstanceRef.current);

      // Add helpful touch instructions for mobile users
      if ('ontouchstart' in window) {
        const touchInstructions = L.control({position: 'bottomleft'});
        touchInstructions.onAdd = function() {
          const container = L.DomUtil.create('div', 'bg-black/60 text-white text-xs p-2 rounded');
          container.innerHTML = 'Use two fingers to zoom and pan the map';
          setTimeout(() => {
            container.style.display = 'none';
          }, 5000); // Hide after 5 seconds
          return container;
        };
        touchInstructions.addTo(mapInstanceRef.current);
      }

      // Fit world bounds properly after map is created
      setTimeout(() => {
        if (mapInstanceRef.current) {
          // Set world bounds that will show the entire world
          const worldBounds = L.latLngBounds(
            L.latLng(-60, -170), // Southwest corner - excluding Antarctica for better fit
            L.latLng(75, 170)    // Northeast corner - excluding northernmost areas
          );

          mapInstanceRef.current.fitBounds(worldBounds, {
            animate: false,
            padding: [10, 10] // Add a bit of padding
          });
        }
      }, 100);
    }

    // Resize handler on initial load
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
  useEffect(() => {
    if (!scriptLoaded) return;

    try {
      // Add custom popup styles if not already added
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

          /* Fix for canvas elements to add willReadFrequently */
          canvas.leaflet-heatmap-layer {
            will-change: contents;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error adding styles:", error);
    }
  }, [scriptLoaded]);

  // Update heatmap when countries data changes
  useEffect(() => {
    if (!scriptLoaded || !window.L || !mapInstanceRef.current || !countries || countries.length === 0) return;

    const L = window.L;

    try {
      // Remove existing heat layer if it exists
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
      }

      // Prepare heat data points with enhanced intensity
      const heatData = countries.map(country => {
        // Extract coordinates and intensity from country data
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        // Get the intensity value (SGM or GSCS) and scale it
        // The multiplication factor makes the heatmap more visible
        const rawIntensity = country.sgm || country.gscs || 0;

        // Intensify the effect by scaling values away from the middle (5)
        // This makes both extremes (egalitarianism and supremacism) more visible
        let intensity;
        if (rawIntensity <= 5) {
          // For egalitarianism (0-5), scale 0-5 to 0-7
          intensity = (5 - rawIntensity) * 1.4;
        } else {
          // For supremacism (5-10), scale 5-10 to 7-14
          intensity = (rawIntensity - 5) * 1.4 + 7;
        }

        // Return [lat, lng, intensity] format required by Leaflet.heat
        return [lat, lng, intensity];
      }).filter(point => point[0] !== 0 && point[1] !== 0); // Filter out points with zero coordinates

      // Create heat layer with custom gradient - with enhanced visibility
      const heatOptions = {
        radius: 40, // Increased size for better visibility
        blur: 30, // Increased blur for smoother gradient
        maxZoom: 10, // Max zoom level for heat points
        max: 14, // Max intensity value (matching our scaled intensity)
        minOpacity: 0.5, // Minimum opacity to ensure visibility
        // Custom gradient - blue (egalitarianism) to red (supremacism)
        gradient: {
          0.0: '#0000ff', // Deep blue - strongest egalitarianism
          0.2: '#2a7fff', // Light blue - moderate egalitarianism
          0.4: '#ffffff', // White - neutral/balanced
          0.6: '#ffaa00', // Orange - moderate supremacism
          0.8: '#ff5500', // Orange-red - strong supremacism
          1.0: '#ff0000'  // Deep red - strongest supremacism
        }
      };

      heatLayerRef.current = L.heatLayer(heatData, heatOptions).addTo(mapInstanceRef.current);

      // Add clickable markers on top of the heatmap for country selection
      countries.forEach(country => {
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        if (lat === 0 || lng === 0) return; // Skip if no coordinates

        // Create a small transparent circle marker for clicking
        const marker = L.circleMarker([lat, lng], {
          radius: 12,
          fillOpacity: 0,
          opacity: 0,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Add popup with country information
        marker.bindPopup(`
          <div>
            <div class="country-name">${country.country || country.name || countryCodeToName[country.code] || country.code}</div>
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
      });

    } catch (error) {
      console.error('Error creating heatmap:', error);
    }
  }, [countries, scriptLoaded, onSelectCountry]);

  // Adapt the map to container size changes
  useEffect(() => {
    if (!mapInstanceRef.current || !scriptLoaded) return;

    const handleResize = () => {
      if (!mapInstanceRef.current) return;

      mapInstanceRef.current.invalidateSize();

      // Check if the map container aspect ratio has changed significantly
      const container = mapRef.current;
      if (container) {
        const aspectRatio = container.clientWidth / container.clientHeight;

        // If the aspect ratio is very wide or very tall, adjust the view
        if (aspectRatio > 2.5 || aspectRatio < 1) {
          // Set world bounds that will show the entire world
          const worldBounds = L.latLngBounds(
            L.latLng(-60, -170),
            L.latLng(75, 170)
          );

          mapInstanceRef.current.fitBounds(worldBounds, {
            animate: false,
            padding: [10, 10]
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial size adjustment
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scriptLoaded]);

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
    };
  }, []);

  // Fullscreen change handler with better error handling
  useEffect(() => {
    if (!scriptLoaded) return;

    const handleFullscreenChange = () => {
      try {
        if (mapInstanceRef.current) {
          // Need to wait a moment for the browser to adjust the size
          setTimeout(() => {
            mapInstanceRef.current.invalidateSize();
          }, 200);
        }
      } catch (error) {
        console.error("Error handling fullscreen change:", error);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [scriptLoaded]);

  // Define handleResetView as a useCallback to avoid recreation on each render
  const handleResetView = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // Use world bounds that will show the entire world
      const L = window.L;
      const worldBounds = L.latLngBounds(
        L.latLng(-60, -170), // Southwest corner - excluding Antarctica for better fit
        L.latLng(75, 170)    // Northeast corner - excluding northernmost areas
      );

      mapInstanceRef.current.fitBounds(worldBounds, {
        animate: true,
        duration: 0.75,
        easeLinearity: 0.25,
        padding: [10, 10] // Add a bit of padding
      });
    } catch (error) {
      console.error("Error in handleResetView:", error);
    }
  }, []);

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Supremacism-Egalitarianism Map</h3>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleResetView}
            disabled={!scriptLoaded}
          >
            Reset View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={() => {
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
            }}
            disabled={!scriptLoaded}
          >
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Map container with improved styling */}
      <div className="relative h-96 md:h-[450px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <div
          ref={mapRef}
          className="h-full w-full bg-gray-900 relative"
          id="map-container" // Added ID for easier selection
          style={{ willReadFrequently: true }} // Fix for Canvas2D readback warning
        />

        {(isLoading || !scriptLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm pointer-events-none z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <p className="text-white">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map legend with improved styling */}
      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-800 flex justify-between items-center">
        <div className="w-full">
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
          <div className="text-xs text-gray-400 text-center mt-2">
            Supremacism-Egalitarianism Global Metric (SGM)
          </div>
        </div>
      </div>

      {/* Inject required CSS for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LeafletHeatMap;