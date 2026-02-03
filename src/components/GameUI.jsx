import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Activity, Play, SkipForward, BarChart2, List, X, Share2, Flag, User, Globe, Map, Navigation, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GameUI = ({ 
  gameStatus, // 'idle', 'playing', 'ended'
  score, 
  totalCountries, 
  timeLeft, 
  onInputChange, 
  onGiveUp, 
  onStart,
  foundCount,
  recentFound,
  continentFilter,
  setContinentFilter,
  onShowStats,
  onShowList,
  timeLimit,
  setTimeLimit,
  bonusFlagCountry,
  bonusMessage,
  countries,
  activeCountries,
  foundCountries,
  user,
  onShowAuth,
  onShowProfile,
  onShowAbout,
  onUserClick
}) => {
  const { getFlagUrl, generateShareText } = window.gameHelpers || {};
  const Leaderboard = window.Leaderboard;
  
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [inputStyle, setInputStyle] = useState("normal"); // normal, close
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'leaderboard'
  const [selectedMode, setSelectedMode] = useState('classic'); // 'classic', 'flags', 'capitals', 'states'
  const inputRef = useRef(null);

  // Auto-focus logic
  useEffect(() => {
    if (gameStatus === 'playing') {
      // Focus after a short delay to ensure transition is done
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  // Keep focus
  useEffect(() => {
    const handleBlur = () => {
        if (gameStatus === 'playing' && document.activeElement !== inputRef.current) {
            // Optional: aggressive refocus? Maybe annoying.
            // inputRef.current?.focus();
        }
    };
    // window.addEventListener('click', handleBlur);
    // return () => window.removeEventListener('click', handleBlur);
  }, [gameStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setInputStyle("normal"); // Reset style on type
    
    const result = onInputChange(val);
    
    if (result.status === 'success') {
      setInput("");
      setShake(false);
    } else if (result.status === 'close') {
      setShake(true);
      setInputStyle("close");
      setTimeout(() => setShake(false), 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = foundCount > 0 ? Math.round((foundCount / (foundCount + 0)) * 100) : 100; // Simplified for now
  const progress = totalCountries > 0 ? Math.round((foundCount / totalCountries) * 100) : 0;

  const gameModes = [
    { id: 'classic', name: 'Name Countries', icon: Globe, description: 'Identify countries on the map', status: 'active' },
    { id: 'flags', name: 'Flag Quiz', icon: Flag, description: 'Match flags to countries', status: 'coming_soon' },
    { id: 'capitals', name: 'Capital Cities', icon: Navigation, description: 'Name the capital cities', status: 'coming_soon' },
    { id: 'states', name: 'State Challenge', icon: Map, description: 'Identify states and provinces', status: 'coming_soon' },
  ];

  return (
    <div className="w-full h-full relative pointer-events-none">
      
      {/* Auth Button - Always Visible */}
      <div className="absolute top-6 right-6 pointer-events-auto z-50">
        <button 
          onClick={user ? onShowProfile : onShowAuth}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border shadow-xl transition-all ${
            user 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
              : 'bg-zinc-900/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {user ? (
            <>
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xs overflow-hidden">
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                    user.email ? user.email[0].toUpperCase() : 'U'
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user.displayName || user.email?.split('@')[0]}</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </>
          )}
        </button>
      </div>

      {/* Top Floating Stats Bar - Only when playing or ended */}
      {(gameStatus === 'playing' || gameStatus === 'ended') && (
        <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 flex items-center gap-4"
        >
            <div className="flex items-center gap-6 px-6 py-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl text-slate-100">
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold tracking-widest text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono font-bold text-lg">{score}/{totalCountries}</span>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-lg">{progress}%</span>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <button onClick={onShowList} className="flex items-center gap-2 hover:text-white transition-colors" title="View List">
                    <List className="w-4 h-4 text-purple-400" />
                </button>
            </div>
            
            {gameStatus === 'playing' && (
              <button 
                onClick={onGiveUp}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-full backdrop-blur-md transition-all font-medium text-sm shadow-xl"
                title="Give Up Game"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Give Up</span>
              </button>
            )}
        </motion.div>
      )}

      {/* Right Sidebar Log - Only when playing or ended */}
      {(gameStatus === 'playing' || gameStatus === 'ended') && (
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-24 bottom-36 right-6 w-64 pointer-events-auto flex flex-col gap-2 overflow-hidden"
        >
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 h-full overflow-y-auto scrollbar-hide">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Recent Finds</h3>
                <div className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                        {recentFound.map((country, i) => (
                            <motion.div 
                                key={country.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                            >
                                <span className="text-sm font-medium text-slate-200">{country.name}</span>
                                <span className="text-xs text-emerald-400 font-mono">#{score - i}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {recentFound.length === 0 && (
                        <p className="text-center text-slate-600 text-xs italic mt-4">Start guessing...</p>
                    )}
                </div>
            </div>
        </motion.div>
      )}

      {/* Bonus Message Toast */}
      <AnimatePresence>
        {bonusMessage && (
           <motion.div
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0 }}
             className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
           >
             <div className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
               <Flag className="w-5 h-5" />
               {bonusMessage}
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Flag Bonus Display */}
      <AnimatePresence>
        {gameStatus === 'playing' && bonusFlagCountry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-24 left-6 z-40 pointer-events-auto"
          >
            <div className="bg-zinc-900/60 backdrop-blur-md border border-amber-500/50 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 max-w-[150px]">
               <div className="text-xs font-bold text-amber-400 uppercase tracking-widest text-center">Flag Bonus</div>
               <div className="relative w-24 h-16 rounded overflow-hidden shadow-md">
                 <img 
                   src={getFlagUrl(bonusFlagCountry.alpha3)} 
                   alt="Flag" 
                   className="w-full h-full object-cover"
                   onError={(e) => e.target.style.display = 'none'} 
                 />
               </div>
               <div className="text-[10px] text-slate-400 text-center leading-tight">
                 Identify this country for +15s!
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Input Field - Only when playing */}
      {gameStatus === 'playing' && (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-auto z-50"
        >
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    placeholder="Type a country name..."
                    className="w-full bg-zinc-900/60 backdrop-blur-xl text-slate-100 placeholder:text-slate-500 text-center text-xl font-light tracking-wide py-4 px-6 rounded-2xl border border-white/10 shadow-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                />
                <button 
                    type="button"
                    onClick={onGiveUp}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-red-400 transition-colors"
                    title="Give Up"
                >
                    <SkipForward className="w-5 h-5" />
                </button>
            </form>
        </motion.div>
      )}

      {/* Start / Menu Screen - Overlay */}
      {gameStatus !== 'playing' && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-5xl w-full text-center flex flex-col h-[80vh] md:h-auto md:min-h-[600px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent tracking-tighter mb-2">
                        GEOMASTER
                    </h1>
                    <p className="text-slate-400 font-light tracking-widest uppercase text-sm">The Ultimate Geography Challenge</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-8 max-w-md mx-auto w-full">
                  <button 
                    onClick={() => setActiveTab('home')} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'home' ? 'bg-zinc-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Play
                  </button>
                  <button 
                    onClick={() => setActiveTab('leaderboard')} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-zinc-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Leaderboard
                  </button>
                </div>

                {activeTab === 'home' ? (
                  <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
                    {/* Left Column: Game Modes */}
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="grid grid-cols-1 gap-4">
                            {gameModes.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => mode.status === 'active' && setSelectedMode(mode.id)}
                                    className={`relative group p-6 rounded-2xl border text-left transition-all ${
                                        selectedMode === mode.id 
                                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    } ${mode.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`p-3 rounded-xl ${selectedMode === mode.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-slate-400'}`}>
                                            <mode.icon className="w-6 h-6" />
                                        </div>
                                        {mode.status !== 'active' && (
                                            <div className="px-2 py-1 bg-zinc-900 rounded-md border border-white/10 flex items-center gap-1">
                                                <Lock className="w-3 h-3 text-slate-500" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Coming Soon</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={`text-lg font-bold mb-1 ${selectedMode === mode.id ? 'text-white' : 'text-slate-300'}`}>{mode.name}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{mode.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Settings & Actions */}
                    <div className="flex-1 flex flex-col bg-white/5 rounded-2xl p-6 border border-white/5">
                        {gameStatus === 'ended' && (
                            <div className="mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <p className="text-emerald-400 text-xs uppercase tracking-widest mb-1 font-bold">Previous Run</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-mono font-bold text-white">{score}</span>
                                    <span className="text-sm text-slate-400">/ {totalCountries}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const text = generateShareText(score, totalCountries, foundCountries, countries, continentFilter);
                                    navigator.clipboard.writeText(text);
                                    alert("Result copied to clipboard!");
                                  }}
                                  className="mt-3 text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wide transition-colors"
                                >
                                  <Share2 className="w-3 h-3" />
                                  Share Result
                                </button>
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-emerald-500" />
                                Game Settings
                            </h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Region</label>
                                    <select 
                                        value={continentFilter} 
                                        onChange={(e) => setContinentFilter(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 text-slate-200 text-sm rounded-xl p-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    >
                                        <option value="All">Global - All Countries</option>
                                        <option value="Europe">Europe</option>
                                        <option value="Asia">Asia</option>
                                        <option value="Africa">Africa</option>
                                        <option value="North America">North America</option>
                                        <option value="South America">South America</option>
                                        <option value="Oceania">Oceania</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Duration</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[300, 600, 900, 1200, 1800, 3600].map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setTimeLimit(time)}
                                                className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                                    timeLimit === time 
                                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                                        : 'bg-zinc-900 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-300'
                                                }`}
                                            >
                                                {time / 60} Min
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button 
                                onClick={onStart}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 group"
                            >
                                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                {gameStatus === 'ended' ? 'Play Again' : 'Start Game'}
                            </button>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={onShowStats}
                                    className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-white font-medium rounded-xl text-xs transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <BarChart2 className="w-4 h-4" />
                                    <span>Stats</span>
                                </button>
                                <button 
                                    onClick={onShowList}
                                    className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-white font-medium rounded-xl text-xs transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <List className="w-4 h-4" />
                                    <span>List</span>
                                </button>
                                <button 
                                    onClick={onShowAbout}
                                    className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-white font-medium rounded-xl text-xs transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <Info className="w-4 h-4" />
                                    <span>About</span>
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-hidden min-h-[400px]">
                    <Leaderboard initialFilter={continentFilter} onUserClick={onUserClick} />
                  </div>
                )}
            </motion.div>
        </div>
      )}
    </div>
  );
};

window.GameUI = GameUI;
// export default GameUI;
