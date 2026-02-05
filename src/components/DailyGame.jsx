
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Globe, MapPin, Users, FileText, Flag, HelpCircle, CheckCircle, XCircle, Search, ArrowRight } from 'lucide-react';

const DailyGame = ({ 
    targetCountry, 
    geoData, 
    onGuess, 
    onGiveUp, 
    gameStatus, 
    countries,
    dailyStatus // { solved: bool, guesses: [], cluesRevealed: int }
}) => {
    const [input, setInput] = useState('');
    const [cluesRevealed, setCluesRevealed] = useState(dailyStatus?.cluesRevealed || 1);
    const [guesses, setGuesses] = useState(dailyStatus?.guesses || []);
    const [shake, setShake] = useState(false);
    
    // Normalize helper
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    useEffect(() => {
        if (dailyStatus) {
            setCluesRevealed(dailyStatus.cluesRevealed);
            setGuesses(dailyStatus.guesses);
        }
    }, [dailyStatus]);

    const handleReveal = () => {
        if (cluesRevealed < 5) {
            const next = cluesRevealed + 1;
            setCluesRevealed(next);
            // Callback to save progress?
            onGuess(null, next); // Pass null as guess, next as clue count
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || gameStatus !== 'playing') return;

        // Check if valid country
        const guessNorm = normalize(input);
        const match = countries.find(c => normalize(c.name) === guessNorm || (c.aliases && c.aliases.some(a => normalize(a) === guessNorm)));

        if (!match) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        // Add to guesses
        const newGuesses = [...guesses, match.name];
        setGuesses(newGuesses);
        setInput('');

        // Check win
        if (match.id === targetCountry.id) {
            onGuess(true, cluesRevealed, newGuesses);
        } else {
            onGuess(false, cluesRevealed, newGuesses);
        }
    };

    const clues = useMemo(() => {
        if (!targetCountry) return [];
        const geo = geoData?.[targetCountry.alpha3];
        const pop = geo?.pop ? (geo.pop / 1000000).toFixed(1) + 'M' : 'Unknown';
        const coords = geo?.coords || [0, 0];
        const hemisphere = coords[1] >= 0 ? 'Northern' : 'Southern';
        const capital = targetCountry.capital || 'Unknown';
        const capitalHint = capital !== 'Unknown' ? `${capital[0]}...${capital[capital.length-1]}` : '???';

        return [
            {
                id: 1,
                icon: Globe,
                title: "Location",
                content: `Located in the ${hemisphere} Hemisphere, within ${targetCountry.continent}.`,
                score: 1000
            },
            {
                id: 2,
                icon: Users,
                title: "Demographics",
                content: `Population is approximately ${pop}.`,
                score: 800
            },
            {
                id: 3,
                icon: MapPin,
                title: "Capital",
                content: `Capital City: ${capitalHint}`,
                score: 600
            },
            {
                id: 4,
                icon: FileText,
                title: "Intel",
                content: targetCountry.fact || "No intelligence available.",
                score: 400
            },
            {
                id: 5,
                icon: Flag,
                title: "Flag",
                content: (
                    <div className="w-full h-24 flex items-center justify-center bg-zinc-800 rounded-lg overflow-hidden">
                        <img 
                            src={`https://flagcdn.com/${targetCountry.alpha3.toLowerCase().slice(0, 2)}.svg`}
                            alt="Flag" 
                            className="h-full object-cover"
                        />
                    </div>
                ),
                score: 200
            }
        ];
    }, [targetCountry, geoData]);

    // Render Clue Card
    const ClueCard = ({ clue, index }) => {
        const isRevealed = index < cluesRevealed;
        const isCurrent = index === cluesRevealed - 1;
        
        return (
            <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
                isRevealed 
                    ? 'bg-zinc-900 border-emerald-500/30' 
                    : 'bg-zinc-900/50 border-white/5'
            }`}>
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isRevealed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-600'}`}>
                        {isRevealed ? <clue.icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isRevealed ? 'text-white' : 'text-slate-600'}`}>
                                Clue #{index + 1}
                            </h3>
                            {isRevealed && (
                                <span className="text-xs font-mono text-emerald-500 font-bold">{clue.score} PTS</span>
                            )}
                        </div>
                        
                        {isRevealed ? (
                            <div className="text-slate-300 text-sm font-medium animate-in fade-in duration-500">
                                {clue.content}
                            </div>
                        ) : (
                            <div className="h-5 bg-white/5 rounded w-3/4 animate-pulse"></div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-xl mx-auto w-full h-full flex flex-col p-4 relative z-20">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full mb-3 ring-1 ring-amber-500/50">
                    <FileText className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Daily Dossier</h1>
                <p className="text-slate-400 text-sm">Identify the mystery country. Reveal fewer clues for more points.</p>
            </div>

            {/* Clues List */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pb-24">
                {clues.map((clue, index) => (
                    <ClueCard key={clue.id} clue={clue} index={index} />
                ))}

                {/* Reveal Button */}
                {gameStatus === 'playing' && cluesRevealed < 5 && (
                    <button 
                        onClick={handleReveal}
                        className="w-full py-3 mt-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all"
                    >
                        <Unlock className="w-4 h-4" />
                        Reveal Next Clue (-200 PTS)
                    </button>
                )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-zinc-950/80 backdrop-blur-md border-t border-white/10">
                {gameStatus === 'playing' ? (
                    <form onSubmit={handleSubmit} className="relative">
                        <div className={`relative transition-transform ${shake ? 'animate-shake' : ''}`}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter country name..."
                                className="w-full bg-zinc-900 border border-white/20 text-white placeholder-slate-500 px-4 py-3 pl-12 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {guesses.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-center">
                                {guesses.map((g, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md line-through decoration-red-400/50">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className={`p-4 rounded-xl border ${gameStatus === 'won' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                            <h2 className={`text-xl font-bold ${gameStatus === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {gameStatus === 'won' ? 'Mission Accomplished!' : 'Mission Failed'}
                            </h2>
                            <p className="text-white mt-1">
                                The country was <span className="font-black text-amber-400 text-lg">{targetCountry.name}</span>
                            </p>
                        </div>
                        <button 
                            onClick={onGiveUp} // Actually "Back to Menu"
                            className="w-full py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Back to Menu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.DailyGame = DailyGame;
