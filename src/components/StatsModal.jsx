import React, { useEffect, useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatsModal = ({ onClose }) => {
  const [stats, setStats] = useState([]);

  // Use window.countries
  const countries = window.countries;

  useEffect(() => {
    const bank = JSON.parse(localStorage.getItem('learning_bank') || '{}');
    const statsArray = Object.entries(bank)
      .map(([id, count]) => {
        const country = countries.find(c => c.id === id);
        return {
          ...country,
          count
        };
      })
      .filter(item => item.name) 
      .sort((a, b) => b.count - a.count);
    
    setStats(statsArray);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your learning bank history?")) {
      localStorage.removeItem('learning_bank');
      setStats([]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Frequently Missed
            </h2>
            <div className="flex items-center gap-2">
              {stats.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded transition-colors"
                >
                  Clear History
                </button>
              )}
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto">
            {stats.length === 0 ? (
              <p className="text-center text-slate-500">No data yet. Play a game!</p>
            ) : (
              <div className="space-y-3">
                {stats.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400 w-6">{index + 1}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded">
                      Missed {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

window.StatsModal = StatsModal;
// export default StatsModal;
