import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map as MapIcon, Moon, Sun, ArrowLeft } from 'lucide-react';

// Access Globals inside component to avoid race conditions
// const MapBoard = window.MapBoard;
// const GameUI = window.GameUI;
// const StudyModal = window.StudyModal;
// const StatsModal = window.StatsModal;
// const countries = window.countries;
// const normalize = window.normalize;

function App() {
  const MapBoard = window.MapBoard;
  const GameUI = window.GameUI;
  const StudyModal = window.StudyModal;
  const StatsModal = window.StatsModal;
  const CountryList = window.CountryList;
  const ListModal = window.ListModal;
  const AuthModal = window.AuthModal;
  const AboutModal = window.AboutModal;
  const DailyGame = window.DailyGame;
  const countries = window.countries || [];
  const normalize = window.normalize;
  const geoData = window.geoData || {};
  const { levenshteinDistance } = window.gameHelpers || {};
  const { getDailyCountry, getDailySeed, getDailyStatus, saveDailyStatus } = window.dailyLogic || {};
  const ACHIEVEMENTS = window.ACHIEVEMENTS || [];

  // Auth State
  const [user, setUser] = useState(null);
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  // Game State
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'ended'
  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'flags'
  const [foundCountries, setFoundCountries] = useState([]);
  const [timeLimit, setTimeLimit] = useState(900); // Default 15 minutes
  const [timeLeft, setTimeLeft] = useState(900);
  const [continentFilter, setContinentFilter] = useState("All");
  const [viewingMap, setViewingMap] = useState(false);
  
  // Flag Quiz State
  const [flagQuizTarget, setFlagQuizTarget] = useState(null);
  const [flagQuizQueue, setFlagQuizQueue] = useState([]);
  const [flagQuizSettings, setFlagQuizSettings] = useState(null);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizCountries, setQuizCountries] = useState([]); // Store the actual pool of countries for the quiz

  // Capitals Quiz State
  const [capitalsQuizTarget, setCapitalsQuizTarget] = useState(null);
  const [capitalsQuizQueue, setCapitalsQuizQueue] = useState([]);
  const [capitalsQuizSettings, setCapitalsQuizSettings] = useState(null);

  // Daily Game State
  const [dailyTarget, setDailyTarget] = useState(null);
  const [dailyStatusState, setDailyStatusState] = useState(null);

  // Map State
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 20]);
  
  // Modal State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showList, setShowList] = useState(false);

  // Flag Streak Bonus State
  const [streakCount, setStreakCount] = useState(0);
  const [bonusFlagCountry, setBonusFlagCountry] = useState(null);
  const [bonusMessage, setBonusMessage] = useState(null);
  const [flagBonusCount, setFlagBonusCount] = useState(0); // Track total bonus flags collected

  // Score Publishing State
  const [showPublish, setShowPublish] = useState(false);
  const [pendingScore, setPendingScore] = useState(null);

  // User Stats & Achievements
  const [userStats, setUserStats] = useState({
      gamesPlayed: 0,
      classicFound: 0,
      flagsFound: 0,
      capitalsFound: 0,
      fastestWin: false
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null); // For notification

  // Derived State
  const activeCountries = useMemo(() => {
    if (continentFilter === "All") return countries;
    return countries.filter(c => {
      if (Array.isArray(c.continent)) {
        return c.continent.includes(continentFilter);
      }
      return c.continent === continentFilter;
    });
  }, [continentFilter]);

  const recentFound = useMemo(() => {
    return foundCountries
      .slice(-5) // Take last 5
      .reverse() // Newest first
      .map(id => countries.find(c => c.id === id))
      .filter(Boolean);
  }, [foundCountries, countries]);

  const missedCountries = useMemo(() => {
    if (gameStatus !== 'ended') return [];
    
    const targetList = gameMode === 'flags' ? quizCountries : activeCountries;
    
    return targetList
      .filter(c => !foundCountries.includes(c.id))
      .map(c => c.id);
  }, [gameStatus, activeCountries, foundCountries, gameMode, quizCountries]);

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    if (window.auth) {
      const unsubscribe = window.auth.onAuthStateChanged((user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, []);

  // Firestore User Listener
  useEffect(() => {
    if (user && window.db) {
        const unsubscribe = window.db.collection('users').doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                setFirestoreUser(doc.data());
                // Merge stats if present in firestore
                const data = doc.data();
                if (data.stats) {
                    setUserStats(prev => ({ ...prev, ...data.stats }));
                }
                if (data.achievements) {
                    setUnlockedAchievements(data.achievements);
                }
            }
        }, err => console.error("Firestore user sync error:", err));
        return () => unsubscribe();
    } else {
        setFirestoreUser(null);
    }
  }, [user]);

  // Local Storage Stats Listener (for guest/initial load)
  useEffect(() => {
      const storedStats = localStorage.getItem('user_stats');
      if (storedStats) {
          setUserStats(JSON.parse(storedStats));
      }
      const storedAchievements = localStorage.getItem('user_achievements');
      if (storedAchievements) {
          setUnlockedAchievements(JSON.parse(storedAchievements));
      }
  }, []);

  const displayUser = useMemo(() => {
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: firestoreUser?.displayName || user.displayName,
        photoURL: firestoreUser?.photoURL || user.photoURL,
        ...firestoreUser
    };
  }, [user, firestoreUser]);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);

  const startCapitalsQuiz = (settings) => {
      setCapitalsQuizSettings(settings);
      const data = window.geoData || geoData;
      
      let pool = countries;
      if (settings.filter === '25' || settings.filter === '50') {
          const limit = parseInt(settings.filter);
          pool = countries
              .filter(c => data[c.alpha3]) 
              .sort((a, b) => (data[b.alpha3]?.pop || 0) - (data[a.alpha3]?.pop || 0))
              .slice(0, limit);
      } else if (settings.filter === 'continent') {
            if (continentFilter !== "All") {
                pool = countries.filter(c => c.continent === continentFilter);
            }
      }
      
      // Filter out countries without capitals
      pool = pool.filter(c => c.capital && c.capital.length > 0);

      if (pool.length === 0) {
          alert("No valid countries found for this selection.");
          endGame();
          return;
      }
      
      // Shuffle
      const queue = pool.map(c => c.id).sort(() => Math.random() - 0.5);
      setCapitalsQuizQueue(queue);
      setQuizTotal(queue.length);
      setQuizCountries(pool);
      
      // Pick first
      nextCapitalTarget(queue);
  };

  // Removed duplicate daily game logic

  const nextCapitalTarget = (queue) => {
      if (!queue || queue.length === 0) {
          endGame();
          return;
      }
      const nextId = queue[0];
      const target = countries.find(c => c.id === nextId);
      const data = window.geoData || geoData;
      const geo = data?.[target.alpha3];
      
      setCapitalsQuizTarget({ ...target, coords: geo?.coords });
      
      // Zoom logic - Zoom to country
      if (geo?.coords) {
          setZoom(4); 
          setCenter(geo.coords);
      } else {
          // Default view if no coords (shouldn't happen often)
          setZoom(1);
          setCenter([0, 20]);
      }
  };

  const startFlagQuiz = (settings) => {
      setFlagQuizSettings(settings);
      // geoData is now imported or available via window.geoData (which we set)
      const data = window.geoData || geoData;
      
      let pool = countries;
      if (settings.filter === '25' || settings.filter === '50') {
          const limit = parseInt(settings.filter);
          pool = countries
              .filter(c => data[c.alpha3]) 
              .sort((a, b) => (data[b.alpha3]?.pop || 0) - (data[a.alpha3]?.pop || 0))
              .slice(0, limit);
      } else if (settings.filter === 'continent') {
            // Continent filter is already handled by activeCountries logic in App, but here we want strict pool
            // Actually activeCountries depends on continentFilter state.
            // If settings.filter is continent, we expect continentFilter state to be set.
            if (continentFilter !== "All") {
                pool = countries.filter(c => c.continent === continentFilter);
            }
      }
      
      // CRITICAL FIX: Ensure all countries in pool have geoData coordinates
      // This prevents "missing flag" bug where a country without coords stops the game
      pool = pool.filter(c => data[c.alpha3]?.coords);

      if (pool.length === 0) {
          alert("No valid countries found for this selection.");
          endGame();
          return;
      }
      
      // Shuffle
      const queue = pool.map(c => c.id).sort(() => Math.random() - 0.5);
      setFlagQuizQueue(queue);
      setQuizTotal(queue.length);
      setQuizCountries(pool);
      
      // Pick first
      nextFlagTarget(queue);
  };

  const nextFlagTarget = (queue) => {
      if (!queue || queue.length === 0) {
          endGame();
          return;
      }
      const nextId = queue[0];
      const target = countries.find(c => c.id === nextId);
      const data = window.geoData || geoData;
      const geo = data?.[target.alpha3];
      
      // Safety net: If somehow a country without coords got in
      if (!geo?.coords) {
          console.warn(`Skipping ${target.name} due to missing coordinates`);
          // Skip to next immediately
          nextFlagTarget(queue.slice(1));
          return;
      }
      
      setFlagQuizTarget({ ...target, coords: geo?.coords });
      
      // Zoom logic
      if (geo?.coords) {
          setZoom(4); 
          setCenter(geo.coords);
      }
  };

  const startDailyGame = () => {
    if (!getDailySeed || !getDailyCountry) return;
    
    const { date } = getDailySeed();
    const target = getDailyCountry(countries, date);
    
    // Check saved status
    const saved = getDailyStatus ? getDailyStatus(date) : null;
    
    setDailyTarget(target);
    setDailyStatusState(saved || { solved: false, guesses: [], cluesRevealed: 1 });
    
    if (saved && saved.solved) {
        setGameStatus('won');
    } else {
        setGameStatus('playing');
    }
  };

  const closeDailyGame = () => {
      setGameMode('classic');
      setGameStatus('idle');
      setDailyTarget(null);
  };

  const handleDailyGuess = (isCorrect, cluesCount, guesses) => {
      if (!dailyTarget) return;
      
      const { date } = getDailySeed();
      
      // Update local state
      const newStatus = {
          solved: isCorrect,
          guesses: guesses,
          cluesRevealed: cluesCount
      };
      
      setDailyStatusState(newStatus);
      if (saveDailyStatus) saveDailyStatus(date, newStatus);
      
      if (isCorrect) {
          setGameStatus('won');
          
          // Update Stats
          const newStats = { ...userStats };
          newStats.dailyWins = (newStats.dailyWins || 0) + 1;
          setUserStats(newStats);
          localStorage.setItem('user_stats', JSON.stringify(newStats));
          
          // Check Daily Detective Achievement
          if (!unlockedAchievements.includes('daily_detective')) {
              const newUnlocked = [...unlockedAchievements, 'daily_detective'];
              setUnlockedAchievements(newUnlocked);
              localStorage.setItem('user_achievements', JSON.stringify(newUnlocked));
              
              // Notify
              const ach = ACHIEVEMENTS.find(a => a.id === 'daily_detective');
              setNewAchievement(ach);
              setTimeout(() => setNewAchievement(null), 5000);
          }
      }
  };

  const startGame = (options = {}) => {
    const mode = options.mode || 'classic';
    const settings = options.settings || {};
    
    setGameMode(mode);
    setFoundCountries([]);
    setTimeLeft(timeLimit);
    setGameStatus('playing');
    setStreakCount(0);
    setBonusFlagCountry(null);
    setBonusMessage(null);
    setFlagBonusCount(0);
    setShowPublish(false);
    setPendingScore(null);
    setZoom(1);
    setCenter([0, 20]);
    setQuizTotal(0); // Reset quiz total
    setQuizCountries([]);
    
    if (mode === 'flags') {
        startFlagQuiz(settings);
    } else if (mode === 'capitals') {
        startCapitalsQuiz(settings);
    } else if (mode === 'daily') {
        startDailyGame();
    } else {
        // Focus map based on continent? (Optional polish)
        if (continentFilter === 'Europe') { setZoom(3); setCenter([10, 50]); }
        if (continentFilter === 'Asia') { setZoom(2); setCenter([90, 40]); }
        if (continentFilter === 'Africa') { setZoom(2); setCenter([20, 0]); }
        if (continentFilter === 'North America') { setZoom(2); setCenter([-100, 40]); }
        if (continentFilter === 'South America') { setZoom(2); setCenter([-60, -20]); }
        if (continentFilter === 'Oceania') { setZoom(3); setCenter([140, -30]); }
    }
  };

  const skipFlag = () => {
    if (gameMode !== 'flags') return;
    
    // Move to next without adding to found
    const newQueue = flagQuizQueue.slice(1);
    setFlagQuizQueue(newQueue);
    nextFlagTarget(newQueue);
  };

  const skipCapital = () => {
      const newQueue = capitalsQuizQueue.slice(1);
      setCapitalsQuizQueue(newQueue);
      nextCapitalTarget(newQueue);
  };

  const endGame = useCallback((overrideFoundCountries) => {
    setGameStatus('ended');
    setShowList(true);
    setBonusFlagCountry(null);
    setBonusMessage(null);
    
    const effectiveFound = Array.isArray(overrideFoundCountries) ? overrideFoundCountries : foundCountries;
    const targetList = gameMode === 'flags' ? quizCountries : activeCountries;
    
    // Save to Learning Bank
    const currentMissed = targetList.filter(c => !effectiveFound.includes(c.id));
    const bank = JSON.parse(localStorage.getItem('learning_bank') || '{}');
    currentMissed.forEach(c => {
      bank[c.id] = (bank[c.id] || 0) + 1;
    });
    localStorage.setItem('learning_bank', JSON.stringify(bank));

    // Calculate Points
    // Base: 10 pts per country
    const basePoints = effectiveFound.length * 10;
    // Flag Bonus: 50 pts per flag
    const flagPoints = flagBonusCount * 50;
    // Time Bonus: 2 pts per second remaining (ONLY if all found)
    let timePoints = 0;
    if (effectiveFound.length === targetList.length) {
        timePoints = timeLeft * 2;
    }
    const totalPoints = basePoints + flagPoints + timePoints;

    // --- UPDATE STATS & CHECK ACHIEVEMENTS ---
    const newStats = { ...userStats };
    newStats.gamesPlayed = (newStats.gamesPlayed || 0) + 1;

    if (gameMode === 'classic') {
        newStats.classicFound = (newStats.classicFound || 0) + effectiveFound.length;
    } else if (gameMode === 'flags') {
        newStats.flagsFound = (newStats.flagsFound || 0) + effectiveFound.length;
    } else if (gameMode === 'capitals') {
        newStats.capitalsFound = (newStats.capitalsFound || 0) + effectiveFound.length;
    }

    // Check fastest win
    if (effectiveFound.length === targetList.length && timeLeft > timeLimit / 2) {
        newStats.fastestWin = true;
    }

    setUserStats(newStats);
    localStorage.setItem('user_stats', JSON.stringify(newStats));

    // Check Achievements
    const newUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!unlockedAchievements.includes(ach.id) && ach.condition(newStats)) {
            newUnlocked.push(ach.id);
        }
    });

    if (newUnlocked.length > 0) {
        const updatedAchievements = [...unlockedAchievements, ...newUnlocked];
        setUnlockedAchievements(updatedAchievements);
        localStorage.setItem('user_achievements', JSON.stringify(updatedAchievements));
        
        // Notify
        const firstAch = ACHIEVEMENTS.find(a => a.id === newUnlocked[0]);
        setNewAchievement(firstAch);
        setTimeout(() => setNewAchievement(null), 5000);
        
        // Update Firestore
        if (user && window.db) {
            window.db.collection('users').doc(user.uid).set({
                stats: newStats,
                achievements: updatedAchievements
            }, { merge: true });
        }
    } else if (user && window.db) {
        window.db.collection('users').doc(user.uid).set({
            stats: newStats
        }, { merge: true });
    }

    // Prepare Score Data
    const scoreData = {
      userId: displayUser ? displayUser.uid : null,
      userName: displayUser ? (displayUser.displayName || 'Anonymous') : 'Guest',
      photoURL: displayUser ? displayUser.photoURL : null,
      countryCode: displayUser ? (displayUser.countryCode || null) : null,
      score: effectiveFound.length,
      total: targetList.length,
      region: (gameMode === 'flags' && (flagQuizSettings?.filter === '25' || flagQuizSettings?.filter === '50')) ? 'All' : continentFilter,
      difficulty: flagQuizSettings?.filter || 'All',
      duration: timeLimit,
      points: totalPoints,
      date: window.firebase.firestore.FieldValue.serverTimestamp(),
      mode: gameMode // Add mode to score data
    };

    setPendingScore(scoreData);
    setShowPublish(true);
    
    if (!displayUser) {
        setBonusMessage(`Game Over! ${totalPoints} pts.`);
        setTimeout(() => setBonusMessage(null), 5000);
    }
  }, [activeCountries, foundCountries, displayUser, continentFilter, timeLimit, flagBonusCount, timeLeft, gameMode, quizCountries, flagQuizSettings]);

  const confirmPublish = () => {
    if (!pendingScore) return;
    
    if (!displayUser) {
        setShowAuth(true);
        setShowPublish(false); // Close publish modal to show auth
        // Keep pendingScore so we can publish after login? 
        // Logic for post-login publish would need more state, for now just let them login and they can try again via Previous Run button
        return;
    }

    if (!window.db) return;
    
    // Update userId if it was null when created
    const finalScore = {
        ...pendingScore,
        userId: displayUser.uid,
        userName: displayUser.displayName || 'Anonymous',
        photoURL: displayUser.photoURL,
        countryCode: displayUser.countryCode || null
    };

    window.db.collection('scores').add(finalScore)
      .then((docRef) => {
        console.log("Score saved successfully with ID:", docRef.id);
        setBonusMessage("Score Published!");
        setTimeout(() => setBonusMessage(null), 3000);
        setShowPublish(false);
        setPendingScore(null);
      })
      .catch(err => {
        console.error("Error saving score:", err);
        setBonusMessage("Error publishing score!");
        setTimeout(() => setBonusMessage(null), 3000);
      });
  };

  const cancelPublish = () => {
    setShowPublish(false);
    setPendingScore(null);
  };

  const handleInput = (input) => {
    const normalizedInput = normalize(input);
    
    // Debug
    console.log(`Checking input: ${input} (${normalizedInput}) vs Target: ${flagQuizTarget?.name}`);

    // Capitals Mode Logic
    if (gameMode === 'capitals') {
        if (!capitalsQuizTarget) return { status: 'error' };

        const targetCapital = normalize(capitalsQuizTarget.capital);
        
        if (normalizedInput === targetCapital) {
             // Success
             const newFound = [...foundCountries, capitalsQuizTarget.id];
             setFoundCountries(newFound);
             
             // Next
             const newQueue = capitalsQuizQueue.slice(1);
             setCapitalsQuizQueue(newQueue);
             setTimeout(() => nextCapitalTarget(newQueue), 500); // Slight delay for visual feedback
             
             return { status: 'success' };
        }
        
        // Check fuzzy
        const dist = levenshteinDistance ? levenshteinDistance(normalizedInput, targetCapital) : 100;
        if (dist <= 2 && targetCapital.length > 4) { // Allow small typos for long names
             // Success
             const newFound = [...foundCountries, capitalsQuizTarget.id];
             setFoundCountries(newFound);
             
             // Next
             const newQueue = capitalsQuizQueue.slice(1);
             setCapitalsQuizQueue(newQueue);
             setTimeout(() => nextCapitalTarget(newQueue), 500); 
             
             return { status: 'success' };
        }
        
        return { status: 'error' };
    }

    // Determine search pool: use all countries for Flag Quiz to avoid filter issues, 
    // otherwise use filtered activeCountries for Classic Mode
    const searchPool = gameMode === 'flags' ? countries : activeCountries;
    
    // 1. Check Exact Match
    const match = searchPool.find(country => {
      if (foundCountries.includes(country.id)) return false;
      const nameMatch = normalize(country.name) === normalizedInput;
      const aliasMatch = country.aliases && country.aliases.some(alias => normalize(alias) === normalizedInput);
      return nameMatch || aliasMatch;
    });

    if (match) {
      // Correct Answer Logic
      if (gameMode === 'flags') {
          if (match.id === flagQuizTarget.id) {
              setFoundCountries(prev => [...prev, match.id]);
              setBonusMessage("Correct!");
              setTimeout(() => setBonusMessage(null), 1500);
              
              const newQueue = flagQuizQueue.slice(1);
              setFlagQuizQueue(newQueue);
              nextFlagTarget(newQueue);
              return { status: 'success' };
          } else {
               // Wrong guess for flag quiz
               // Maybe shake?
               return { status: 'close' }; // Using 'close' to trigger shake
          }
      }

      // Classic Mode Logic
      setFoundCountries(prev => [...prev, match.id]);
      
      // Bonus Check
      if (bonusFlagCountry && match.id === bonusFlagCountry.id) {
         setTimeLeft(prev => prev + 15);
         setBonusMessage("Flag Bonus! +15s");
         setTimeout(() => setBonusMessage(null), 3000);
         setBonusFlagCountry(null);
         setFlagBonusCount(prev => prev + 1);
      }
      
      // Streak Logic
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      
      // Trigger Bonus every 5
      if (newStreak % 5 === 0) {
         // Pick a random unfound country for bonus
         const unfound = activeCountries.filter(c => !foundCountries.includes(c.id) && c.id !== match.id);
         if (unfound.length > 0) {
             const random = unfound[Math.floor(Math.random() * unfound.length)];
             setBonusFlagCountry(random);
         }
      }

      // Check win condition
      if (foundCountries.length + 1 === activeCountries.length) {
        endGame([...foundCountries, match.id]);
      }
      return { status: 'success' };
    }

    // 2. Fuzzy Match (Almost There)
    if (input.length > 3) {
        const closeMatch = searchPool.find(country => {
            if (foundCountries.includes(country.id)) return false;
            // Check name dist
            const nameDist = levenshteinDistance(normalizedInput, normalize(country.name));
            if (nameDist <= 2) return true;
            
            // Check aliases
            if (country.aliases) {
                return country.aliases.some(alias => levenshteinDistance(normalizedInput, normalize(alias)) <= 2);
            }
            return false;
        });
        
        if (closeMatch) {
            return { status: 'close' };
        }
    }

    return { status: 'fail' };
  };

  const handleCountryClick = (geo) => {
    // Only in study mode or explore mode
    if (gameStatus !== 'ended' && !viewingMap) return;

    // Check if clicked country is in our data
    // Geo ID is usually string, our ID is string.
    // Ensure loose comparison or string conversion
    let country = countries.find(c => c.id === String(geo.id));
    
    if (!country && geo.properties) {
        country = countries.find(c => c.alpha3 === geo.properties.ISO_A3 || c.name === geo.properties.NAME);
    }
    
    if (country) {
      setSelectedCountry(country);
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-slate-100 overflow-hidden relative font-sans selection:bg-emerald-500/30">
      
      {/* Game UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {gameMode === 'daily' && dailyTarget ? (
            <div className="absolute inset-0 z-50 bg-zinc-950 pointer-events-auto flex flex-col animate-in fade-in duration-500">
                {/* Daily Game Header */}
                <div className="p-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between shadow-lg z-10">
                    <button 
                        onClick={closeDailyGame}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        DAILY DOSSIER
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                     {DailyGame && (
                         <DailyGame 
                            targetCountry={dailyTarget}
                            geoData={window.geoData || geoData}
                            onGuess={handleDailyGuess}
                            onGiveUp={closeDailyGame}
                            gameStatus={gameStatus}
                            countries={countries}
                            dailyStatus={dailyStatusState}
                         />
                     )}
                </div>
            </div>
        ) : (
        <GameUI 
          gameStatus={gameStatus}
          score={foundCountries.length}
          totalCountries={
            gameMode === 'flags' ? quizTotal : 
            gameMode === 'capitals' ? quizTotal :
            activeCountries.length
          }
          timeLeft={timeLeft}
          onInputChange={handleInput}
          onGiveUp={() => endGame()}
          onStart={startGame}
          foundCount={foundCountries.length}
          recentFound={recentFound}
          continentFilter={continentFilter}
          setContinentFilter={setContinentFilter}
          onShowStats={() => setShowStats(true)}
          onShowList={() => setShowList(true)}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
          bonusFlagCountry={bonusFlagCountry}
          bonusMessage={bonusMessage}
          countries={countries}
          activeCountries={activeCountries}
          foundCountries={foundCountries}
          user={displayUser}
          onShowAuth={() => setShowAuth(true)}
          onShowProfile={() => setShowProfile(true)}
          onShowAbout={() => setShowAbout(true)}
          onUserClick={(u) => {
              setViewingProfile(u);
              setShowProfile(true);
          }}
          viewingMap={viewingMap}
          setViewingMap={setViewingMap}
          onSkip={
            gameMode === 'flags' ? skipFlag : 
            gameMode === 'capitals' ? skipCapital :
            null
          }
          showPublish={showPublish}
          pendingScore={pendingScore}
          confirmPublish={confirmPublish}
          cancelPublish={cancelPublish}
          capitalsTarget={capitalsQuizTarget}
          userStats={userStats}
          achievements={ACHIEVEMENTS}
          unlockedAchievements={unlockedAchievements}
          newAchievement={newAchievement}
        />
        )}
      </div>

      {/* Map Layer - Always Rendered but controlled */}
      <div className={`absolute inset-0 transition-all duration-700 ${viewingMap ? 'z-40' : 'z-0'}`}>
          <MapBoard 
            foundCountries={foundCountries} 
            missedCountries={missedCountries}
            onCountryClick={handleCountryClick}
            zoom={zoom}
            setZoom={setZoom}
            center={center}
            setCenter={setCenter}
            filterContinent={continentFilter}
            mapMode={viewingMap ? 'explore' : 'game'}
            highlightCountry={
                gameMode === 'flags' && gameStatus === 'playing' ? flagQuizTarget?.id : 
                gameMode === 'capitals' && gameStatus === 'playing' ? capitalsQuizTarget?.id :
                null
            }
            flagLocation={gameMode === 'flags' && gameStatus === 'playing' && flagQuizTarget ? flagQuizTarget.coords : null}
            flagUrl={gameMode === 'flags' && gameStatus === 'playing' && flagQuizTarget ? window.gameHelpers?.getFlagUrl(flagQuizTarget.alpha3) : null}
          />
      </div>

      <StudyModal 
        country={selectedCountry} 
        onClose={() => setSelectedCountry(null)} 
      />
      
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}

      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          user={user} 
        />
      )}

      {showProfile && (
        <ProfileModal 
            isOpen={showProfile}
            onClose={() => { setShowProfile(false); setViewingProfile(null); }}
            currentUser={user}
            targetUser={viewingProfile || displayUser}
            stats={userStats}
            achievements={ACHIEVEMENTS}
            unlocked={unlockedAchievements}
        />
      )}

      {showAbout && (
        <AboutModal 
            isOpen={showAbout}
            onClose={() => setShowAbout(false)}
        />
      )}

      {/* Modal Layers */}
      <div className="z-50 relative">
        {showList && (
          <ListModal 
            onClose={() => setShowList(false)}
            countries={gameMode === 'flags' ? quizCountries : activeCountries}
            foundCountries={foundCountries}
            revealMissed={gameStatus === 'ended'}
          />
        )}
      </div>

      {/* Score Publish Modal */}
      {showPublish && pendingScore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100">
                <h2 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    RUN COMPLETE!
                </h2>
                <div className="text-center text-slate-400 mb-8 font-light tracking-wide">
                    Great job, {pendingScore.userName}!
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Score</span>
                        <span className="text-2xl font-mono font-bold text-white">{pendingScore.score}/{pendingScore.total}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center border border-amber-500/20">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Points</span>
                        <span className="text-2xl font-mono font-bold text-amber-400">{pendingScore.points}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={cancelPublish}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Skip
                    </button>
                    <button 
                        onClick={confirmPublish}
                        className={`flex-1 py-4 rounded-xl font-bold text-zinc-900 transition-all shadow-lg ${
                            displayUser 
                                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 hover:scale-105' 
                                : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 hover:scale-105'
                        }`}
                    >
                        {displayUser ? 'Publish Score' : 'Sign In to Publish'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

window.App = App;
// export default App;
