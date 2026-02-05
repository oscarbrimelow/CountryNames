import React, { memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapBoard = ({ 
  foundCountries, 
  missedCountries, 
  onCountryClick, 
  zoom, 
  setZoom, 
  center, 
  setCenter,
  filterContinent,
  mapMode = 'game', // 'game' or 'explore'
  highlightCountry, // ID of country to highlight (Flag Quiz)
  flagLocation, // [lon, lat] for the flag marker
  flagUrl // URL for the flag image
}) => {
  
  // Color Palettes
  const colors = {
    game: {
      bg: "bg-zinc-950",
      default: "#27272a", // Zinc-800
      found: "#10b981",   // Emerald-500
      missed: "#ef4444",  // Red-500
      stroke: "#3f3f46",  // Zinc-700
      foundStroke: "#34d399", // Emerald-400
      hover: "#3f3f46",    // Zinc-700 (subtle)
      highlight: "#f59e0b" // Amber-500 (Flag Quiz Target)
    },
    explore: {
      bg: "bg-sky-950",   // Deep Ocean
      default: "#d4d4d8", // Zinc-300 (Land)
      found: "#d4d4d8",   // No "found" state in explore
      missed: "#d4d4d8",
      stroke: "#a1a1aa",  // Zinc-400
      foundStroke: "#a1a1aa",
      hover: "#fbbf24",   // Amber-400 (Highlight)
      pressed: "#f59e0b"  // Amber-500
    }
  };

  const theme = colors[mapMode] || colors.game;

  return (
    <div className={`w-full h-full ${theme.bg} rounded-none overflow-hidden relative transition-colors duration-1000`}>
      <ComposableMap projection="geoMercator" className="w-full h-full">
        <ZoomableGroup 
          zoom={zoom} 
          center={center} 
          onMoveEnd={({ zoom, coordinates }) => {
            setZoom(zoom);
            setCenter(coordinates);
          }}
          maxZoom={10}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Handle Somaliland (often -99 or has NAME 'Somaliland') -> Merge into Somalia (706)
                let effectiveId = String(geo.id);
                if (geo.properties.NAME === "Somaliland" || String(geo.id) === "-99") {
                  effectiveId = "706";
                }

                // Handle Greenland (304) -> Highlight with Denmark (208)
                if (String(geo.id) === "304" || geo.properties.NAME === "Greenland") {
                  effectiveId = "208"; 
                }

                const isFound = foundCountries.includes(effectiveId) || foundCountries.includes(geo.properties.ISO_A3);
                const isMissed = missedCountries && missedCountries.includes(effectiveId);
                const isHighlight = highlightCountry === effectiveId || highlightCountry === geo.properties.ISO_A3;

                // Use the effective ID for the click handler too, or handle it in the handler
                const handleGeoClick = () => {
                   if (onCountryClick) {
                      // Pass a modified geo object or just let the handler deal with the original
                      // Better to let the handler know the effective ID
                      onCountryClick({ ...geo, id: effectiveId });
                   }
                };

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={handleGeoClick}
                    style={{
                      default: {
                        fill: mapMode === 'game' 
                              ? (isHighlight ? theme.highlight : (isFound ? theme.found : (isMissed ? theme.missed : theme.default)))
                              : theme.default,
                        outline: "none",
                        stroke: mapMode === 'game' 
                                ? (isFound ? theme.foundStroke : theme.stroke)
                                : theme.stroke,
                        strokeWidth: isHighlight ? 2 : 0.5,
                        stroke: isHighlight ? "#fff" : (mapMode === 'game' ? (isFound ? theme.foundStroke : theme.stroke) : theme.stroke),
                        transition: "all 0.3s ease",
                        filter: mapMode === 'game' && (isFound || isHighlight) ? `drop-shadow(0 0 ${isHighlight ? '10px' : '6px'} ${isHighlight ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.5)'})` : "none"
                      },
                      hover: {
                        fill: mapMode === 'game'
                              ? (isHighlight ? theme.highlight : (isFound ? "#059669" : (isMissed ? "#dc2626" : "#3f3f46")))
                              : theme.hover,
                        outline: "none",
                        stroke: mapMode === 'game' ? "#71717a" : "#ffffff",
                        strokeWidth: 1,
                        cursor: "pointer",
                        filter: mapMode === 'game' && (isFound || isHighlight) ? `drop-shadow(0 0 ${isHighlight ? '12px' : '8px'} ${isHighlight ? 'rgba(245, 158, 11, 0.8)' : 'rgba(16, 185, 129, 0.7)'})` : "drop-shadow(0 0 8px rgba(0,0,0,0.2))"
                      },
                      pressed: {
                        fill: mapMode === 'game' ? "#047857" : theme.pressed,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
          {highlightCountry && flagLocation && flagUrl && (
            <Marker coordinates={flagLocation}>
               {/* Pin Point */}
               <circle r="3" fill="#ef4444" stroke="#fff" strokeWidth="1" />
               
               {/* Flag - Using standard SVG image for better mobile compatibility */}
               <g className="animate-float">
                   {/* Flag Border/Bg */}
                   <rect x="-16" y="-50" width="32" height="24" fill="#18181b" rx="2" stroke="white" strokeWidth="1" />
                   {/* Flag Image */}
                   <image 
                        href={flagUrl} 
                        x="-16" 
                        y="-50" 
                        width="32" 
                        height="24" 
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="inset(0px round 2px)"
                   />
               </g>
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Zoom Controls - Glassmorphism */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <button 
          className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={() => setZoom(z => Math.min(z * 1.5, 10))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button 
          className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={() => setZoom(z => Math.max(z / 1.5, 1))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
      </div>
    </div>
  );
};

window.MapBoard = MapBoard;
// export default MapBoard;
