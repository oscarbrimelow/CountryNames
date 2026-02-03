import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyModal = ({ country, onClose }) => {
  if (!country) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{country.name}</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Capital</span>
                <p className="text-lg font-medium">{country.capital || "N/A"}</p>
              </div>

              <div className="bg-purple-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Continent</span>
                <p className="text-lg font-medium">{country.continent}</p>
              </div>

              <div className="bg-amber-50 dark:bg-slate-700/50 p-4 rounded-lg flex gap-3">
                <BookOpen className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Did you know?</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
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
