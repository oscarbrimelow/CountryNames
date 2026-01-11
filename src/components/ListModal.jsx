import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ListModal = ({ onClose, countries, foundCountries, revealMissed }) => {
  const CountryList = window.CountryList;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-2xl font-bold text-slate-100">Country List</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
           {CountryList ? (
             <CountryList countries={countries} foundCountries={foundCountries} revealMissed={revealMissed} />
           ) : (
             <div className="text-center p-10 text-slate-500">Loading list...</div>
           )}
        </div>
      </motion.div>
    </div>
  );
};

window.ListModal = ListModal;
export default ListModal;
