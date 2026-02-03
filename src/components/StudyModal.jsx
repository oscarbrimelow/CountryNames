import React, { useState, useEffect } from 'react';
import { X, BookOpen, Globe, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyModal = ({ country, onClose }) => {
  const [wikiData, setWikiData] = useState(null);
  const [currencyData, setCurrencyData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const geoData = window.geoData || {};
  const countryGeo = country ? geoData[country.alpha3] : null;

  useEffect(() => {
    if (country) {
      setLoading(true);
      setWikiData(null);
      setCurrencyData(null);
      
      const fetchData = async () => {
        try {
          // Parallel fetch for Wiki and REST Countries
          const [wikiRes, restRes] = await Promise.allSettled([
            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name)}`),
            fetch(`https://restcountries.com/v3.1/alpha/${country.alpha3}`)
          ]);

          // Handle Wiki Response
          if (wikiRes.status === 'fulfilled' && wikiRes.value.ok) {
            const data = await wikiRes.value.json();
            setWikiData({
              extract: data.extract,
              thumbnail: data.thumbnail?.source,
              url: data.content_urls?.desktop?.page
            });
          }

          // Handle REST Countries Response (for Currency)
          if (restRes.status === 'fulfilled' && restRes.value.ok) {
            const data = await restRes.value.json();
            if (data && data[0] && data[0].currencies) {
                const currencies = Object.values(data[0].currencies)
                    .map(c => `${c.name} (${c.symbol})`)
                    .join(', ');
                setCurrencyData(currencies);
            }
          }

        } catch (e) {
          console.error("Data fetch error", e);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [country]);

  if (!country) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-48 sm:h-64 bg-zinc-800 overflow-hidden shrink-0">
            {wikiData?.thumbnail ? (
                <img 
                    src={wikiData.thumbnail} 
                    alt={country.name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-slate-600">
                    <Globe className="w-16 h-16 opacity-20" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
                <h2 className="text-4xl font-black text-white tracking-tight mb-1 drop-shadow-lg">{country.name}</h2>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-300 drop-shadow-md">
                    <span>{country.continent}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    <span>Capital: {country.capital || "N/A"}</span>
                </div>
            </div>

            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                
                {/* Wiki Extract */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading details...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                {wikiData?.extract || "No description available."}
                            </p>
                            {wikiData?.url && (
                                <a 
                                    href={wikiData.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-bold uppercase tracking-wide transition-colors"
                                >
                                    Read more on Wikipedia
                                    <BookOpen className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Facts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1">Population</span>
                        <p className="text-lg font-mono text-white">
                            {countryGeo?.pop ? countryGeo.pop.toLocaleString() : "N/A"}
                        </p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-1">Currency</span>
                        <p className="text-lg font-mono text-white">
                            {currencyData || (loading ? "Loading..." : "N/A")}
                        </p>
                    </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg h-fit">
                        <BookOpen className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">Did you know?</span>
                        <p className="text-slate-300 text-sm italic">
                            {country.fact || "No specific fact available for this country."}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

window.StudyModal = StudyModal;
// export default StudyModal;
