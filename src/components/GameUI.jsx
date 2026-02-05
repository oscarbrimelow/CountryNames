import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Activity, Play, SkipForward, BarChart2, List, X, Share2, Flag, User, Globe, Map, Navigation, Lock, Info, ShieldAlert, LogOut, BookOpen, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GameUI = ({ 
  gameStatus, 
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
  onShowProfile, // Still used for "View Profile" of others if needed, but mostly replaced by tabs
  onShowAbout,   // Replaced by tab
  onUserClick,    // Passed to Leaderboard
  viewingMap,
  setViewingMap,
  onSkip, // New prop for skipping current flag
  showPublish,
  pendingScore,
  confirmPublish,
  cancelPublish,
  capitalsTarget, // Target for capitals mode
  userStats,
  achievements,
  unlockedAchievements,
  newAchievement
}) => {
  const { getFlagUrl, generateShareText } = window.gameHelpers || {};
  const Leaderboard = window.Leaderboard;
  const UserProfile = window.UserProfile;
  
  const [input, setInput] = useState("");
  // const [shake, setShake] = useState(false); // Removed shake state
  const [inputStyle, setInputStyle] = useState("normal");
  const [activeTab, setActiveTab] = useState('play'); // 'play', 'leaderboard', 'account', 'about'
  
  // Play Tab Sub-Views
  const [playView, setPlayView] = useState('menu'); // 'menu', 'quizzes', 'learn'

  const [selectedMode, setSelectedMode] = useState('classic');
  const [flagSettings, setFlagSettings] = useState({
      filter: '25', // '25', '50', 'continent'
  });
  // Capitals settings are same structure for now
  const [capitalsSettings, setCapitalsSettings] = useState({
      filter: '25',
  });
  // const [viewingMap, setViewingMap] = useState(false); // Lifted to App.jsx
  const inputRef = useRef(null);

  // Auto-focus logic
  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim().length > 0) {
        // setShake(true); // Removed shake
        setInputStyle("error");
        setTimeout(() => {
            // setShake(false); // Removed shake
            setInputStyle("normal");
        }, 500);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setInputStyle("normal");
    
    const result = onInputChange(val);
    
    if (result.status === 'success') {
      setInput("");
      // setShake(false); // Removed shake
    } else if (result.status === 'close') {
      // setShake(true); // Removed shake
      setInputStyle("close");
      setTimeout(() => {
          // setShake(false); // Removed shake
          setInputStyle("normal"); // Reset style after shake
      }, 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = foundCount > 0 ? Math.round((foundCount / (foundCount + 0)) * 100) : 100;
  const progress = totalCountries > 0 ? Math.round((foundCount / totalCountries) * 100) : 0;

  const gameModes = [
    { id: 'classic', name: 'Name Countries', icon: Globe, description: 'Identify countries on the map', status: 'active' },
    { id: 'flags', name: 'Flag Quiz', icon: Flag, description: 'Match flags to countries', status: 'active' },
    { id: 'capitals', name: 'Capital Cities', icon: Navigation, description: 'Name the capital cities', status: 'active' },
    { id: 'states', name: 'State Challenge', icon: Map, description: 'Identify states and provinces', status: 'coming_soon' },
  ];

  const handleSignOut = () => {
    if (window.auth) {
        window.auth.signOut().then(() => {
            setActiveTab('play');
        });
    }
  };

  return (
    <div className="w-full h-full relative pointer-events-none">
      
      {/* Auth Button / Profile Shortcut - Always Visible */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 pointer-events-auto z-50">
        <button 
          onClick={() => user ? setActiveTab('account') : onShowAuth()}
          className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full backdrop-blur-md border shadow-xl transition-all ${
            user 
              ? activeTab === 'account' 
                  ? 'bg-emerald-500 text-zinc-900 border-emerald-400 font-bold'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
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

      {/* Back to Menu Button - Only when viewing map */}
      {viewingMap && gameStatus !== 'playing' && (
        <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-auto z-50">
            <button 
                onClick={() => setViewingMap(false)}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl text-white hover:bg-zinc-800 transition-all font-bold group text-sm md:text-base"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>
        </div>
      )}

      {/* Top Floating Stats Bar - Only when playing or ended */}
      {(gameStatus === 'playing' || gameStatus === 'ended') && (
        <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-16 md:top-6 inset-x-0 pointer-events-auto z-50 flex items-center justify-center px-4"
        >
            <div className="flex items-center gap-3 md:gap-6 px-4 py-2 md:px-6 md:py-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl text-slate-100 max-w-full overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Timer className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold tracking-widest text-sm md:text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="w-px h-4 bg-white/10 shrink-0"></div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono font-bold text-sm md:text-lg">{score}/{totalCountries}</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block shrink-0"></div>
                <div className="flex items-center gap-2 hidden sm:flex whitespace-nowrap">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-lg">{progress}%</span>
                </div>
                <div className="w-px h-4 bg-white/10 shrink-0"></div>
                <button onClick={onShowList} className="flex items-center gap-2 hover:text-white transition-colors shrink-0" title="View List">
                    <List className="w-4 h-4 text-purple-400" />
                </button>
            </div>
            
            {gameStatus === 'playing' && (
              <button 
                onClick={onGiveUp}
                className="ml-2 flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-full backdrop-blur-md transition-all font-medium text-xs md:text-sm shadow-xl shrink-0"
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
            className="absolute top-24 bottom-36 right-6 w-64 pointer-events-auto hidden md:flex flex-col gap-2 overflow-hidden"
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

      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
           <motion.div
             initial={{ opacity: 0, y: -50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -50 }}
             className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
           >
             <div className="bg-zinc-900 border border-yellow-500/50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4">
                <div className="p-2 bg-yellow-500/10 rounded-full">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Achievement Unlocked!</div>
                  <div className="text-white font-bold text-sm">{newAchievement.title}</div>
                </div>
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

      {/* Capitals Mode Target Display */}
      <AnimatePresence>
        {gameStatus === 'playing' && capitalsTarget && (
           <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
           >
               <div className="bg-zinc-900/80 backdrop-blur-xl border border-blue-500/30 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-1">
                   <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">What is the capital of</div>
                   <div className="text-xl md:text-3xl font-black text-white text-center">
                       {capitalsTarget.name}
                   </div>
                   {capitalsTarget.continent && (
                       <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                           <Globe className="w-3 h-3" />
                           {capitalsTarget.continent}
                       </div>
                   )}
               </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Input Field - Only when playing */}
      {gameStatus === 'playing' && (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 md:bottom-12 inset-x-0 mx-auto w-[95%] md:w-full max-w-lg px-2 md:px-4 pointer-events-auto z-50 flex justify-center"
        >
            <motion.form 
                onSubmit={handleSubmit} 
                className="relative group w-full"
                // animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} // Removed shake animation
                transition={{ duration: 0.4 }}
            >
                {/* Skip Button - Left side */}
                {onSkip && (
                    <button 
                        type="button"
                        onClick={onSkip}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-amber-400 transition-colors z-20"
                        title="Skip"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    placeholder={
                        capitalsTarget ? "Type the capital city..." : 
                        "Type a country name..."
                    }
                    className={`w-full bg-zinc-900/60 backdrop-blur-xl text-slate-100 placeholder:text-slate-500 text-center text-lg md:text-xl font-light tracking-wide py-3 md:py-4 px-6 rounded-2xl border shadow-2xl focus:outline-none transition-all duration-300 ${
                        inputStyle === 'error' || inputStyle === 'close'
                            ? 'border-red-500 shadow-red-500/20'
                            : 'border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                    }`}
                />
                <button 
                    type="button"
                    onClick={onGiveUp}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-red-400 transition-colors"
                    title="Give Up"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.form>
        </motion.div>
      )}

      {/* Start / Menu Screen - Overlay */}
      {gameStatus !== 'playing' && !viewingMap && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto p-2 md:p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-3xl shadow-2xl max-w-5xl w-full text-center flex flex-col h-full md:h-[800px] md:max-h-[90vh] overflow-hidden"
            >
                <div className="flex flex-col items-center mb-4 md:mb-6 mt-4 md:mt-0">
                    <h1 className="text-3xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent tracking-tighter mb-2">
                        GEOMASTER
                    </h1>
                    <p className="text-slate-400 font-light tracking-widest uppercase text-[10px] md:text-sm">The Ultimate Geography Challenge</p>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-6 max-w-2xl mx-auto w-full">
                  {[
                    { id: 'play', label: 'Play' },
                    { id: 'leaderboard', label: 'Leaderboard' },
                    { id: 'account', label: 'Account' },
                    { id: 'about', label: 'About' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id 
                          ? 'bg-zinc-800 text-white shadow-lg' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    
                    {/* PLAY TAB */}
                    {activeTab === 'play' && (
                      <div className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        
                        {/* Play Menu (Main View) */}
                        {playView === 'menu' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-2">
                                {/* Quizzes Button */}
                                <button 
                                    onClick={() => setPlayView('quizzes')}
                                    className="bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 group transition-all h-full shadow-xl"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <Activity className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Quizzes</h3>
                                        <p className="text-sm text-slate-400">Test your knowledge with various game modes</p>
                                    </div>
                                </button>

                                {/* Learn Button */}
                                <button 
                                    onClick={() => setPlayView('learn')}
                                    className="bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 group transition-all h-full shadow-xl"
                                >
                                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Learn</h3>
                                        <p className="text-sm text-slate-400">Study countries and facts</p>
                                    </div>
                                </button>

                                {/* See Map Button */}
                                <button 
                                    onClick={() => setViewingMap(true)}
                                    className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 group transition-all h-full shadow-xl"
                                >
                                    <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                        <Map className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">See Map</h3>
                                        <p className="text-sm text-slate-400">Explore the world map freely</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Quizzes Sub-View */}
                        {playView === 'quizzes' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-2">
                                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                                <div className="flex items-center gap-4 mb-6 shrink-0">
                                    <button 
                                        onClick={() => setPlayView('menu')}
                                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <Play className="w-6 h-6 text-emerald-400" />
                                        Game Setup
                                    </h2>
                                </div>

                                <div className="space-y-6 pb-20">
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
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${selectedMode === mode.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-slate-400'}`}>
                                                        <mode.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className={`text-lg font-bold ${selectedMode === mode.id ? 'text-white' : 'text-slate-300'}`}>{mode.name}</h3>
                                                            {mode.status !== 'active' && (
                                                                <Lock className="w-4 h-4 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{mode.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Settings (Reused) */}
                                <div className="flex-1 flex flex-col bg-white/5 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar">
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
                                            
                                            {pendingScore && (
                                                <button
                                                    onClick={confirmPublish}
                                                    className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-lg transition-colors uppercase tracking-wide text-xs shadow-lg"
                                                >
                                                    Publish Score
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-emerald-500" />
                                            Game Settings
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            {selectedMode === 'flags' ? (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Difficulty</label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <button
                                                                onClick={() => setFlagSettings(s => ({ ...s, filter: '25' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    flagSettings.filter === '25' 
                                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                Top 25 Most Popular
                                                            </button>
                                                            <button
                                                                onClick={() => setFlagSettings(s => ({ ...s, filter: '50' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    flagSettings.filter === '50' 
                                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                Top 50 Most Popular
                                                            </button>
                                                            <button
                                                                onClick={() => setFlagSettings(s => ({ ...s, filter: 'continent' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    flagSettings.filter === 'continent' 
                                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                By Continent
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {flagSettings.filter === 'continent' && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Select Continent</label>
                                                            <select 
                                                                value={continentFilter} 
                                                                onChange={(e) => setContinentFilter(e.target.value)}
                                                                className="w-full bg-zinc-900 border border-white/10 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500/50 transition-colors"
                                                            >
                                                                <option value="All">All Continents</option>
                                                                <option value="Europe">Europe</option>
                                                                <option value="Asia">Asia</option>
                                                                <option value="Africa">Africa</option>
                                                                <option value="North America">North America</option>
                                                                <option value="South America">South America</option>
                                                                <option value="Oceania">Oceania</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </>
                                            ) : selectedMode === 'capitals' ? (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Difficulty</label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <button
                                                                onClick={() => setCapitalsSettings(s => ({ ...s, filter: '25' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    capitalsSettings.filter === '25' 
                                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                Top 25 Most Popular
                                                            </button>
                                                            <button
                                                                onClick={() => setCapitalsSettings(s => ({ ...s, filter: '50' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    capitalsSettings.filter === '50' 
                                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                Top 50 Most Popular
                                                            </button>
                                                            <button
                                                                onClick={() => setCapitalsSettings(s => ({ ...s, filter: 'continent' }))}
                                                                className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                                                                    capitalsSettings.filter === 'continent' 
                                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                                                        : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                                }`}
                                                            >
                                                                By Continent
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {capitalsSettings.filter === 'continent' && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Select Continent</label>
                                                            <select 
                                                                value={continentFilter} 
                                                                onChange={(e) => setContinentFilter(e.target.value)}
                                                                className="w-full bg-zinc-900 border border-white/10 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                            >
                                                                <option value="All">All Continents</option>
                                                                <option value="Europe">Europe</option>
                                                                <option value="Asia">Asia</option>
                                                                <option value="Africa">Africa</option>
                                                                <option value="North America">North America</option>
                                                                <option value="South America">South America</option>
                                                                <option value="Oceania">Oceania</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Region</label>
                                                    <select 
                                                        value={continentFilter} 
                                                        onChange={(e) => setContinentFilter(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-white/10 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
                                            )}
                                            
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Duration</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[300, 600, 900, 1200, 1800, 3600].map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setTimeLimit(time)}
                                                            className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                                                timeLimit === time 
                                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                                                    : 'bg-zinc-900 border-white/10 text-slate-400 hover:border-white/20'
                                                            }`}
                                                        >
                                                            {time / 60}m
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <h3 className="text-sm font-bold text-amber-500 mb-3 flex items-center gap-2">
                                                <Trophy className="w-4 h-4" />
                                                Scoring System
                                            </h3>
                                            <div className="space-y-2 text-xs text-slate-400">
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                                    <span>Base Score</span>
                                                    <span className="font-mono text-white font-bold">+10 pts / country</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                                    <span>Flag Bonus</span>
                                                    <span className="font-mono text-amber-400 font-bold">+50 pts / flag</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                                    <span>Speed Run Bonus</span>
                                                    <span className="font-mono text-emerald-400 font-bold">+2 pts / sec left</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 italic mt-1 text-center">
                                                    *Speed bonus only applies if ALL countries are found!
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => onStart({ 
                                            mode: selectedMode, 
                                            settings: selectedMode === 'flags' ? flagSettings : 
                                                      selectedMode === 'capitals' ? capitalsSettings : 
                                                      { filter: 'continent' }
                                        })}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-black text-lg uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] mt-6"
                                    >
                                        {gameStatus === 'ended' ? 'Play Again' : 'Start Game'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Learn Sub-View */}
                        {playView === 'learn' && (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <button 
                                        onClick={() => setPlayView('menu')}
                                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-blue-400" />
                                        Learn
                                    </h2>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="p-8 bg-zinc-900/50 rounded-3xl text-center border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Interactive Lessons</h3>
                                            <p className="text-slate-400 text-sm mb-4">Master geography with detailed facts and visual guides.</p>
                                            <span className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                      </div>
                    )}

                    {/* LEADERBOARD TAB */}
                    {activeTab === 'leaderboard' && (
                        <div className="h-full bg-white/5 rounded-2xl p-4 border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto custom-scrollbar">
                             {Leaderboard ? (
                                <Leaderboard onUserClick={onUserClick} />
                             ) : (
                                <p className="text-center text-slate-500 mt-10">Leaderboard loading...</p>
                             )}
                        </div>
                    )}

                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <div className="h-full bg-white/5 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {user ? (
                                <div className="max-w-xl mx-auto">
                                    {UserProfile ? (
                                        <UserProfile 
                                            user={user} 
                                            isEditable={true} 
                                            stats={userStats}
                                            achievements={achievements}
                                            unlocked={unlockedAchievements}
                                        />
                                    ) : (
                                        <p>Loading Profile Component...</p>
                                    )}
                                    
                                    <div className="mt-8 border-t border-white/5 pt-6 flex justify-center">
                                        <button 
                                            onClick={handleSignOut}
                                            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-bold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <User className="w-16 h-16 text-slate-600 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Sign In Required</h3>
                                    <p className="text-slate-400 mb-6 max-w-xs">Please sign in to view your profile, save your scores, and customize your account.</p>
                                    <button 
                                        onClick={onShowAuth}
                                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-xl transition-colors"
                                    >
                                        Sign In / Register
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <div className="h-full bg-white/5 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="max-w-2xl mx-auto space-y-6 text-slate-300">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-4">
                                        <Info className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">About GeoMaster</h2>
                                    <p className="text-slate-400 mt-2">Version 7.0.0</p>
                                </div>

                                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                                    <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Why this was created
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-4">
                                        This project was built out of a passion for geography and learning. The goal is to provide a fun, interactive way for people to test their knowledge of the world map and learn about different countries, flags, and facts.
                                    </p>
                                    <div className="bg-black/20 rounded-lg p-3 text-xs border border-white/5">
                                        <strong className="text-emerald-400 block mb-1 uppercase tracking-wider">Game Rules</strong>
                                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                                            <li>Use the common, English name for countries.</li>
                                            <li>Must be a sovereign nation (e.g., Scotland and England are part of the UK).</li>
                                            <li>Territories and dependencies are generally not included unless specified.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <ShieldAlert className="w-32 h-32 text-amber-500" />
                                    </div>
                                    <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2 relative z-10">
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
                                
                                <div className="text-center pt-8 text-xs text-slate-600">
                                    <p>&copy; {new Date().getFullYear()} GeoMaster. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

window.GameUI = GameUI;
