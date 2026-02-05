
import { Trophy, Globe, Flag, MapPin, Zap, Star, Award, Crown } from 'lucide-react';

export const ACHIEVEMENTS = [
    { 
        id: 'novice_explorer', 
        title: 'Novice Explorer', 
        description: 'Find 10 countries in Classic Mode', 
        icon: Globe,
        color: 'text-blue-400',
        condition: (stats) => stats.classicFound >= 10 
    },
    { 
        id: 'world_traveler', 
        title: 'World Traveler', 
        description: 'Find 50 countries in Classic Mode', 
        icon: Globe,
        color: 'text-emerald-400',
        condition: (stats) => stats.classicFound >= 50 
    },
    { 
        id: 'master_geographer', 
        title: 'Master Geographer', 
        description: 'Find 100 countries in Classic Mode', 
        icon: Crown,
        color: 'text-amber-400',
        condition: (stats) => stats.classicFound >= 100 
    },
    { 
        id: 'flag_cadet', 
        title: 'Flag Cadet', 
        description: 'Identify 10 flags correctly', 
        icon: Flag,
        color: 'text-blue-400',
        condition: (stats) => stats.flagsFound >= 10 
    },
    { 
        id: 'vexillologist', 
        title: 'Vexillologist', 
        description: 'Identify 50 flags correctly', 
        icon: Flag,
        color: 'text-emerald-400',
        condition: (stats) => stats.flagsFound >= 50 
    },
    { 
        id: 'capital_student', 
        title: 'Capital Student', 
        description: 'Identify 10 capital cities', 
        icon: MapPin,
        color: 'text-blue-400',
        condition: (stats) => stats.capitalsFound >= 10 
    },
    { 
        id: 'capital_master', 
        title: 'Capital Master', 
        description: 'Identify 50 capital cities', 
        icon: MapPin,
        color: 'text-amber-400',
        condition: (stats) => stats.capitalsFound >= 50 
    },
    { 
        id: 'dedicated_learner', 
        title: 'Dedicated Learner', 
        description: 'Play 10 complete games', 
        icon: Star,
        color: 'text-purple-400',
        condition: (stats) => stats.gamesPlayed >= 10 
    },
    { 
        id: 'speed_demon', 
        title: 'Speed Demon', 
        description: 'Finish a game with > 50% time remaining', 
        icon: Zap,
        color: 'text-yellow-400',
        condition: (stats) => stats.fastestWin 
    }
];
