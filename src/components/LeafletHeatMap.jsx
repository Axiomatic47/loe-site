import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
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

/**
 * LeafletHeatMap Component
 * @param {Object} props - Component props
 * @param {Array} [props.countries] - Array of country data objects
 * @param {Array} [props.events] - Array of conflict event objects
 * @param {Function} [props.onSelectCountry] - Callback when country is selected
 * @param {Function} [props.onSelectEvent] - Callback when event is selected
 * @param {boolean} [props.isLoading] - Whether data is loading
 * @param {boolean} [props.showGDELT] - Whether to show GDELT data
 * @param {boolean} [props.showACLED] - Whether to show ACLED data
 * @param {boolean} [props.showCountries] - Whether to show country data
 */
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
  const countryHeatLayerRef = useRef(null);
  const acledHeatLayerRef = useRef(null);
  const gdeltHeatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const leafletLoadedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [dataOption, setDataOption] = useState('all'); // 'all', 'countries', or 'events'

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

      // Create map with dark theme and restricted bounds
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

      // Create a layer for markers
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

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
          .event-title {
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
          .source-label {
            font-size: 11px;
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.5);
            text-align: right;
          }

          /* Fix for canvas elements to add willReadFrequently */
          canvas.leaflet-heatmap-layer {
            will-change: contents;
          }

          /* Custom marker styles */
          .gdelt-marker {
            border: 2px solid rgba(255, 165, 0, 0.7);
            background-color: rgba(255, 165, 0, 0.5);
          }
          .acled-marker {
            border: 2px solid rgba(255, 0, 0, 0.7);
            background-color: rgba(255, 0, 0, 0.5);
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error adding styles:", error);
    }
  }, [scriptLoaded]);

  // Update the heatmap layers based on countries and events data
  useEffect(() => {
    if (!scriptLoaded || !window.L || !mapInstanceRef.current) return;

    const L = window.L;

    try {
      // Clear existing markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }

      // Create or update heat layers and add country/event markers
      updateHeatmapLayers();

    } catch (error) {
      console.error('Error updating map layers:', error);
    }
  }, [countries, events, scriptLoaded, showGDELT, showACLED, showCountries, dataOption]);

  // Function to update heatmap layers based on current data and options
  const updateHeatmapLayers = () => {
    if (!window.L || !mapInstanceRef.current) return;
    const L = window.L;

    // Remove existing heat layers
    if (countryHeatLayerRef.current) {
      mapInstanceRef.current.removeLayer(countryHeatLayerRef.current);
      countryHeatLayerRef.current = null;
    }
    if (gdeltHeatLayerRef.current) {
      mapInstanceRef.current.removeLayer(gdeltHeatLayerRef.current);
      gdeltHeatLayerRef.current = null;
    }
    if (acledHeatLayerRef.current) {
      mapInstanceRef.current.removeLayer(acledHeatLayerRef.current);
      acledHeatLayerRef.current = null;
    }

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Only create heatmap and markers if we have data and should show it
    if (showCountries && countries.length > 0 && (dataOption === 'all' || dataOption === 'countries')) {
      // Prepare heat data points for countries
      const countryHeatData = countries.map(country => {
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

      // Create heat layer for countries with custom gradient
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

      countryHeatLayerRef.current = L.heatLayer(countryHeatData, heatOptions).addTo(mapInstanceRef.current);

      // Add clickable markers for countries
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
        }).addTo(markersLayerRef.current);

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
    }

    // Process GDELT events if they should be shown
    if (showGDELT && events.length > 0 && (dataOption === 'all' || dataOption === 'events')) {
      // Filter GDELT events
      const gdeltEvents = events.filter(event => event.data_source === 'GDELT');

      if (gdeltEvents.length > 0) {
        // Prepare heat data for GDELT events
        const gdeltHeatData = gdeltEvents.map(event => {
          const lat = event.latitude || 0;
          const lng = event.longitude || 0;
          const intensity = event.intensity || 5;

          // Return [lat, lng, intensity] format
          return [lat, lng, intensity];
        }).filter(point => point[0] !== 0 && point[1] !== 0);

        // Create heat layer for GDELT events - using orange to yellow gradient
        const gdeltHeatOptions = {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          minOpacity: 0.3,
          gradient: {
            0.4: '#ffff00', // Yellow for lower intensity
            0.65: '#ffa500', // Orange for medium
            0.9: '#ff4500'   // Red-orange for higher intensity
          }
        };

        gdeltHeatLayerRef.current = L.heatLayer(gdeltHeatData, gdeltHeatOptions).addTo(mapInstanceRef.current);

        // Add individual event markers
        gdeltEvents.forEach(event => {
          const lat = event.latitude || 0;
          const lng = event.longitude || 0;

          if (lat === 0 || lng === 0) return; // Skip if no coordinates

          // Create a visible marker for GDELT events
          const marker = L.circleMarker([lat, lng], {
            radius: 4,
            fillColor: '#ffa500', // Orange for GDELT
            color: '#ffffff',
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.5,
            className: 'gdelt-marker'
          }).addTo(markersLayerRef.current);

          // Add popup with event information
          marker.bindPopup(`
            <div>
              <div class="event-title">${event.event_type || 'Event'}</div>
              <div class="score-row">
                <span class="score-label">Date:</span>
                <span class="score-value">${new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div class="score-row">
                <span class="score-label">Location:</span>
                <span class="score-value">${event.location || event.country || 'Unknown'}</span>
              </div>
              ${event.actor1 ? `
              <div class="score-row">
                <span class="score-label">Primary Actor:</span>
                <span class="score-value">${event.actor1}</span>
              </div>
              ` : ''}
              ${event.actor2 ? `
              <div class="score-row">
                <span class="score-label">Secondary Actor:</span>
                <span class="score-value">${event.actor2}</span>
              </div>
              ` : ''}
              ${event.description ? `
              <div class="mt-2 text-sm text-gray-300">${event.description}</div>
              ` : ''}
              <div class="source-label">Source: GDELT</div>
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
        });
      }
    }

    // Process ACLED events if they should be shown
    if (showACLED && events.length > 0 && (dataOption === 'all' || dataOption === 'events')) {
      // Filter ACLED events
      const acledEvents = events.filter(event => event.data_source === 'ACLED');

      if (acledEvents.length > 0) {
        // Prepare heat data for ACLED events
        const acledHeatData = acledEvents.map(event => {
          const lat = event.latitude || 0;
          const lng = event.longitude || 0;
          const intensity = event.intensity || 5;

          // Return [lat, lng, intensity] format
          return [lat, lng, intensity];
        }).filter(point => point[0] !== 0 && point[1] !== 0);

        // Create heat layer for ACLED events - using red gradient
        const acledHeatOptions = {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          minOpacity: 0.3,
          gradient: {
            0.4: '#ff9999', // Light red for lower intensity
            0.65: '#ff3333', // Medium red
            0.9: '#cc0000'   // Dark red for higher intensity
          }
        };

        acledHeatLayerRef.current = L.heatLayer(acledHeatData, acledHeatOptions).addTo(mapInstanceRef.current);

        // Add individual event markers
        acledEvents.forEach(event => {
          const lat = event.latitude || 0;
          const lng = event.longitude || 0;

          if (lat === 0 || lng === 0) return; // Skip if no coordinates

          // Create a visible marker for ACLED events
          const marker = L.circleMarker([lat, lng], {
            radius: 4,
            fillColor: '#ff0000', // Red for ACLED
            color: '#ffffff',
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.5,
            className: 'acled-marker'
          }).addTo(markersLayerRef.current);

          // Add popup with event information
          marker.bindPopup(`
            <div>
              <div class="event-title">${event.event_type || 'Event'}</div>
              <div class="score-row">
                <span class="score-label">Date:</span>
                <span class="score-value">${new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div class="score-row">
                <span class="score-label">Location:</span>
                <span class="score-value">${event.location || event.country || 'Unknown'}</span>
              </div>
              ${event.fatalities ? `
              <div class="score-row">
                <span class="score-label">Fatalities:</span>
                <span class="score-value">${event.fatalities}</span>
              </div>
              ` : ''}
              ${event.actor1 ? `
              <div class="score-row">
                <span class="score-label">Primary Actor:</span>
                <span class="score-value">${event.actor1}</span>
              </div>
              ` : ''}
              ${event.actor2 ? `
              <div class="score-row">
                <span class="score-label">Secondary Actor:</span>
                <span class="score-value">${event.actor2}</span>
              </div>
              ` : ''}
              ${event.description ? `
              <div class="mt-2 text-sm text-gray-300">${event.description}</div>
              ` : ''}
              <div class="source-label">Source: ACLED</div>
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
        });
      }
    }
  };

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
          const L = window.L;
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
      if (countryHeatLayerRef.current) {
        countryHeatLayerRef.current = null;
      }
      if (gdeltHeatLayerRef.current) {
        gdeltHeatLayerRef.current = null;
      }
      if (acledHeatLayerRef.current) {
        acledHeatLayerRef.current = null;
      }
      if (markersLayerRef.current) {
        markersLayerRef.current = null;
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
        <h3 className="text-lg font-medium text-white">Global Conflict & Supremacism Map</h3>

        <div className="flex space-x-2">
          {/* Data filter buttons */}
          <div className="hidden md:flex items-center space-x-2 mr-4">
            <div className="text-xs text-gray-400 mr-1">Show:</div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "px-2 py-1 text-xs",
                dataOption === 'all'
                  ? "bg-blue-900/50 text-white border-blue-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setDataOption('all')}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "px-2 py-1 text-xs",
                dataOption === 'countries'
                  ? "bg-blue-900/50 text-white border-blue-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setDataOption('countries')}
            >
              Countries
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "px-2 py-1 text-xs",
                dataOption === 'events'
                  ? "bg-blue-900/50 text-white border-blue-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setDataOption('events')}
            >
              Events
            </Button>
          </div>

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

      {/* Mobile data filter buttons */}
      <div className="md:hidden flex items-center justify-center mb-4 space-x-2">
        <div className="text-xs text-gray-400 mr-1">Show:</div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "px-3 py-1 text-xs",
            dataOption === 'all'
              ? "bg-blue-900/50 text-white border-blue-500/50"
              : "bg-black/50 text-white border-white/20"
          )}
          onClick={() => setDataOption('all')}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "px-3 py-1 text-xs",
            dataOption === 'countries'
              ? "bg-blue-900/50 text-white border-blue-500/50"
              : "bg-black/50 text-white border-white/20"
          )}
          onClick={() => setDataOption('countries')}
        >
          Countries
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "px-3 py-1 text-xs",
            dataOption === 'events'
              ? "bg-blue-900/50 text-white border-blue-500/50"
              : "bg-black/50 text-white border-white/20"
          )}
          onClick={() => setDataOption('events')}
        >
          Events
        </Button>
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

      {/* Enhanced map legend with data source indicators */}
      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Country SGM legend */}
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">Egalitarianism</span>
              <span className="text-xs text-gray-400">Supremacism</span>
            </div>
            <div className="h-3 w-full rounded-full" style={{background: 'linear-gradient(to right, #0000ff, #2a7fff, #ffffff, #ffaa00, #ff5500, #ff0000)'}}></div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-300">0</span>
              <span className="text-xs text-gray-300">5</span>
              <span className="text-xs text-gray-300">10</span>
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Country Supremacism-Egalitarianism Global Metric (SGM)
            </div>
          </div>

          {/* Event sources legend */}
          <div className="flex-1 flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-xs text-gray-300">GDELT Events</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-xs text-gray-300">ACLED Events</span>
            </div>
          </div>
        </div>

        {/* Event counts or stats (optional) */}
        {events.length > 0 && (
          <div className="flex justify-center mt-2 text-xs text-gray-400">
            Showing data from {countries.length} countries and {events.length} conflict events
          </div>
        )}
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

// PropTypes validation
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