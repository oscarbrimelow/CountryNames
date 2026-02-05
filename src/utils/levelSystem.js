
// XP Values for different actions
export const XP_VALUES = {
    CLASSIC_FOUND: 10,
    FLAG_FOUND: 15,
    CAPITAL_FOUND: 20,
    DAILY_WIN: 100,
    ACHIEVEMENT_UNLOCK: 200,
    GAME_COMPLETE_BONUS: 500
};

// Calculate Level from Total XP
// Formula: Level = Floor(Sqrt(XP / 100)) + 1
// XP for Level L = 100 * (L-1)^2
export const calculateLevel = (xp) => {
    if (!xp || xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Calculate XP required for next level
export const xpForNextLevel = (currentLevel) => {
    return 100 * Math.pow(currentLevel, 2);
};

// Calculate progress percentage to next level
export const getLevelProgress = (xp) => {
    const currentLevel = calculateLevel(xp);
    const nextLevelXP = xpForNextLevel(currentLevel);
    const currentLevelXP = 100 * Math.pow(currentLevel - 1, 2);
    
    const xpInLevel = xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)));
};

// Get Title based on Level
export const getRankTitle = (level) => {
    if (level >= 50) return "Master Cartographer";
    if (level >= 40) return "Global Legend";
    if (level >= 30) return "World Expert";
    if (level >= 20) return "Seasoned Traveler";
    if (level >= 10) return "Explorer";
    if (level >= 5) return "Adventurer";
    return "Novice";
};

if (typeof window !== 'undefined') {
    window.levelSystem = {
        XP_VALUES,
        calculateLevel,
        xpForNextLevel,
        getLevelProgress,
        getRankTitle
    };
}
