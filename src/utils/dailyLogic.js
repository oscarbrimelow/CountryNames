
// Simple seeded random number generator
// We use a simple hash of the date string to seed the RNG
export const getDailySeed = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }
    return { seed: Math.abs(hash), date: today };
};

export const getDailyCountry = (countries, dateString) => {
    if (!countries || countries.length === 0) return null;
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash |= 0;
    }
    
    // Use the hash to pick a random index
    // We use a Linear Congruential Generator (LCG) concept for stability
    const m = countries.length;
    const a = 1664525;
    const c = 1013904223;
    let seed = Math.abs(hash);
    
    seed = (a * seed + c) % 4294967296; // 2^32
    const index = Math.floor((seed / 4294967296) * m);
    
    return countries[index];
};

export const getDailyStatus = (dateString) => {
    const key = `daily_status_${dateString}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
};

export const saveDailyStatus = (dateString, status) => {
    const key = `daily_status_${dateString}`;
    localStorage.setItem(key, JSON.stringify(status));
};

// Attach to window for global access
window.dailyLogic = {
    getDailySeed,
    getDailyCountry,
    getDailyStatus,
    saveDailyStatus
};
