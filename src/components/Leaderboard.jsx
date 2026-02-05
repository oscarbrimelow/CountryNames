import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Globe, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = ({ onClose, initialFilter = 'All', onUserClick }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter); // 'All', 'Europe', etc.
  const [gameMode, setGameMode] = useState('classic'); // 'classic' or 'flags'
  const [difficulty, setDifficulty] = useState('All'); // 'All', '25', '50'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { getFlagUrl } = window.gameHelpers || {};

  // Update filter if prop changes (handles cases where component doesn't unmount)
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!window.db) {
        console.error("Database not initialized");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching scores for mode: ${gameMode}, diff: ${difficulty}, region: ${filter}`);
        let query = window.db.collection('scores');

        // Apply filters
        // Note: We use client-side sorting to avoid needing complex composite indexes for every combination
        query = query.where('mode', '==', gameMode);

        if (gameMode === 'flags') {
             // For flags, we strictly respect the difficulty filter
             query = query.where('difficulty', '==', difficulty);
        }

        if (filter !== 'All') {
            query = query.where('region', '==', filter);
        }

        // Limit to 500 to fetch a good chunk, then sort client-side
        query = query.limit(500);

        const snapshot = await query.get();
        console.log(`Fetched ${snapshot.size} scores`);
        
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Client-side sort for filtered results
        data.sort((a, b) => b.score - a.score);
        
        // Limit to 50 after sorting
        if (data.length > 50) {
            data = data.slice(0, 50);
        }

        setScores(data);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [filter, gameMode, difficulty, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="h-full flex flex-col">
       {/* Filters Container */}
       <div className="flex flex-col gap-3 mb-4 px-1">
         
         {/* Row 1: Game Mode & Refresh */}
         <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                <button 
                    onClick={() => setGameMode('classic')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        gameMode === 'classic' 
                        ? 'bg-emerald-500 text-zinc-900 shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Classic
                </button>
                <button 
                    onClick={() => setGameMode('flags')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        gameMode === 'flags' 
                        ? 'bg-emerald-500 text-zinc-900 shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Flag Quiz
                </button>
            </div>

            <button 
                onClick={refresh}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Refresh Leaderboard"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
         </div>

         {/* Row 2: Difficulty (Flag Mode Only) */}
         {gameMode === 'flags' && (
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['All', '25', '50'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                      difficulty === diff
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {diff === 'All' ? 'All Difficulties' : `Top ${diff}`}
                  </button>
                ))}
             </div>
         )}

         {/* Row 3: Region Filters */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'].map(region => (
              <button
                key={region}
                onClick={() => setFilter(region)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  filter === region 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {region}
              </button>
            ))}
         </div>
       </div>

       {/* List */}
       <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pr-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No scores yet for this region.</p>
            </div>
          ) : (
            scores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onUserClick && onUserClick({ uid: score.userId, displayName: score.userName, photoURL: score.photoURL })}
                className="bg-white/5 border border-white/5 rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full font-bold text-xs md:text-sm ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-slate-400/20 text-slate-400' :
                  index === 2 ? 'bg-amber-600/20 text-amber-600' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {score.photoURL ? (
                        <img src={score.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                        <User className="w-3 h-3 text-slate-500" />
                    )}
                    
                    {score.countryCode && getFlagUrl && (
                        <img 
                            src={getFlagUrl(score.countryCode)} 
                            alt="Flag" 
                            className="w-4 h-3 object-cover rounded-[2px] opacity-80"
                            title="Player Country"
                        />
                    )}

                    <span className="font-medium text-slate-200 truncate text-xs md:text-sm group-hover:text-emerald-400 transition-colors">
                      {score.userName || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {score.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {score.duration ? `${Math.floor(score.duration/60)}m` : '∞'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(score.date)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-emerald-400 font-mono">
                    {score.score}
                  </div>
                  {score.points > 0 && (
                      <div className="text-[8px] md:text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                          {score.points} pts
                      </div>
                  )}
                  <div className="text-[10px] md:text-xs text-slate-500 font-mono">
                    / {score.total}
                  </div>
                </div>
              </motion.div>
            ))
          )}
       </div>
    </div>
  );
};

window.Leaderboard = Leaderboard;
// export default Leaderboard;
