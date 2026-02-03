import React, { memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapBoard = ({ 
  foundCountries, 
  missedCountries, 
  onCountryClick, 
  zoom, 
  setZoom, 
  center, 
  setCenter,
  filterContinent
}) => {
  
  return (
    <div className="w-full h-full bg-zinc-950 rounded-none overflow-hidden relative">
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
                        fill: isFound ? "#10b981" : (isMissed ? "#ef4444" : "#27272a"), // Emerald-500 : Red-500 : Zinc-800
                        outline: "none",
                        stroke: isFound ? "#34d399" : "#3f3f46", // Emerald-400 : Zinc-700
                        strokeWidth: 0.5,
                        transition: "all 0.5s ease",
                        filter: isFound ? "drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))" : "none"
                      },
                      hover: {
                        fill: isFound ? "#059669" : (isMissed ? "#dc2626" : "#3f3f46"), // Emerald-600 : Red-600 : Zinc-700
                        outline: "none",
                        stroke: "#71717a", // Zinc-500
                        strokeWidth: 1,
                        cursor: "pointer",
                        filter: isFound ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.7))" : "none"
                      },
                      pressed: {
                        fill: "#047857", // Emerald-700
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
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
