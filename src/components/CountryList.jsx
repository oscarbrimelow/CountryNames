import React, { useMemo } from 'react';
import { Check } from 'lucide-react';

const CountryList = ({ countries, foundCountries, revealMissed }) => {
  // Group by continent and sort
  const groupedCountries = useMemo(() => {
    if (!countries) return {};

    const groups = {
      "Africa": [],
      "Asia": [],
      "Europe": [],
      "North America": [],
      "South America": [],
      "Oceania": []
    };

    countries.forEach(country => {
      const continents = Array.isArray(country.continent) ? country.continent : [country.continent];
      
      continents.forEach(cont => {
        if (groups[cont]) {
          groups[cont].push(country);
        } else {
          // Fallback for any data inconsistencies
          if (!groups["Other"]) groups["Other"] = [];
          // Avoid duplicates in Other if multiple invalid continents
          if (!groups["Other"].includes(country)) {
            groups["Other"].push(country);
          }
        }
      });
    });

    // Sort each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [countries]);

  // If no countries (e.g. loading), return null
  if (!countries || countries.length === 0) return null;

  return (
    <div className="w-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groupedCountries).map(([continent, list]) => {
        if (list.length === 0) return null;
        
        return (
          <div key={continent} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
              {continent} ({list.filter(c => foundCountries.includes(c.id)).length}/{list.length})
            </h3>
            <ul className="space-y-1">
              {list.map(country => {
                const isFound = foundCountries.includes(country.id);
                return (
                  <li key={country.id} className="flex items-center gap-2 text-sm">
                    {isFound ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{country.name}</span>
                      </>
                    ) : revealMissed ? (
                      <>
                        <span className="w-4 h-4 inline-block"></span>
                        <span className="text-red-500 font-medium">{country.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 inline-block"></span>
                        <span className="text-slate-300 dark:text-slate-600 font-mono">
                          {'-'.repeat(Math.min(country.name.length, 15))}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

window.CountryList = CountryList;
export default CountryList;
