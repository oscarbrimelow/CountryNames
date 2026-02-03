import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Globe, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = ({ onClose, initialFilter = 'All', onUserClick }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter); // 'All', 'Europe', etc.
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
        console.log(`Fetching scores for region: ${filter}`);
        let query = window.db.collection('scores');

        if (filter === 'All') {
          // For 'All', we can sort by score directly as it uses a single-field index
          query = query.orderBy('score', 'desc').limit(50);
        } else {
          // For specific regions, filtering by region AND sorting by score requires a Composite Index.
          // To avoid forcing the user to create an index, we fetch by region (limit 500) 
          // and sort on the client side. 
          query = query.where('region', '==', filter).limit(500);
        }

        const snapshot = await query.get();
        console.log(`Fetched ${snapshot.size} scores for ${filter}`);
        
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Client-side sort for filtered results (or re-sort for safety)
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
  }, [filter, refreshTrigger]);

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
       {/* Filters */}
       <div className="flex justify-between items-center mb-4 px-1">
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {['All', 'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'].map(region => (
              <button
                key={region}
                onClick={() => setFilter(region)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === region 
                    ? 'bg-emerald-500 text-zinc-900' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {region}
              </button>
            ))}
         </div>
         <button 
            onClick={refresh}
            className="p-2 ml-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh Leaderboard"
         >
            <Clock className="w-4 h-4" />
         </button>
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
                className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
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

                    <span className="font-medium text-slate-200 truncate text-sm group-hover:text-emerald-400 transition-colors">
                      {score.userName || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
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
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {score.score}
                  </div>
                  {score.points > 0 && (
                      <div className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                          {score.points} pts
                      </div>
                  )}
                  <div className="text-xs text-slate-500 font-mono">
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
