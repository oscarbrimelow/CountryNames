import React from 'react';
import { X, Info, Globe, ShieldAlert } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-emerald-400" />
            About GeoMaster
        </h2>

        <div className="space-y-6 text-slate-300">
            {/* Purpose */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Why this was created
                </h3>
                <p className="text-sm leading-relaxed">
                    This project was built out of a passion for geography and learning. The goal is to provide a fun, interactive way for people to test their knowledge of the world map and learn about different countries, flags, and facts.
                </p>
            </div>

            {/* Political Neutrality - Highlighted */}
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-24 h-24 text-amber-500" />
                </div>
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2 relative z-10">
                    <ShieldAlert className="w-4 h-4" />
                    Geographical Inclusion & Neutrality
                </h3>
                <p className="text-sm leading-relaxed relative z-10 text-slate-200">
                    This website aims to be a comprehensive geographical resource. We have chosen to include <strong>both Israel and Palestine</strong> to ensure maximum geographical coverage and educational value. 
                    <br/><br/>
                    <span className="text-amber-200 font-medium">
                        This decision reflects a commitment to geographical neutrality and does not represent a political endorsement of any specific claim or border.
                    </span>
                </p>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full py-3 mt-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  );
};

window.AboutModal = AboutModal;
