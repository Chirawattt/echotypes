import { useState, useEffect, useCallback } from 'react';

export interface HeatLevel {
    level: number;
    name: string;
    minCorrectWords: number;
    maxCorrectWords: number;
    energyDecayInterval: number; // milliseconds between each -1 point decay
    color: string;
    bgColor: string;
    effects: {
        hasParticles: boolean;
        hasShake: boolean;
        hasPulse: boolean;
    };
}

export const HEAT_LEVELS: HeatLevel[] = [
    {
        level: 1,
        name: "Normal",
        minCorrectWords: 0,
        maxCorrectWords: 5,
        energyDecayInterval: 1000, // -1 point every 1.0 second
        color: "text-blue-400",
        bgColor: "from-blue-500 via-blue-400 to-blue-500",
        effects: { hasParticles: false, hasShake: false, hasPulse: false }
    },
    {
        level: 2,
        name: "Heating Up",
        minCorrectWords: 6,
        maxCorrectWords: 12,
        energyDecayInterval: 800, // -1 point every 0.8 seconds
        color: "text-orange-400",
        bgColor: "from-orange-500 via-orange-400 to-orange-500",
        effects: { hasParticles: false, hasShake: false, hasPulse: true }
    },
    {
        level: 3,
        name: "Danger Zone",
        minCorrectWords: 13,
        maxCorrectWords: 25,
        energyDecayInterval: 650, // -1 point every 0.65 seconds
        color: "text-red-400",
        bgColor: "from-red-500 via-red-400 to-red-500",
        effects: { hasParticles: true, hasShake: false, hasPulse: true }
    },
    {
        level: 4,
        name: "OVERDRIVE!",
        minCorrectWords: 26,
        maxCorrectWords: Infinity,
        energyDecayInterval: 600, // -1 point every 0.6 seconds
        color: "text-red-500",
        bgColor: "from-red-600 via-yellow-500 to-red-600",
        effects: { hasParticles: true, hasShake: true, hasPulse: true }
    }
];

interface UseOverdriveSystemProps {
    isTypingMode: boolean;
    isGameActive: boolean;
    correctWordsCount: number;
    onHeatLevelChange?: (newLevel: HeatLevel, prevLevel: HeatLevel) => void;
}

export function useOverdriveSystem({ 
    isTypingMode, 
    isGameActive, 
    correctWordsCount,
    onHeatLevelChange 
}: UseOverdriveSystemProps) {
    const [currentHeatLevel, setCurrentHeatLevel] = useState<HeatLevel>(HEAT_LEVELS[0]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Calculate heat level based on correct words count
    const calculateHeatLevel = useCallback((wordsCount: number): HeatLevel => {
        return HEAT_LEVELS.find(level => 
            wordsCount >= level.minCorrectWords && wordsCount <= level.maxCorrectWords
        ) || HEAT_LEVELS[0];
    }, []);

    // Update heat level when correct words count changes
    useEffect(() => {
        if (!isTypingMode || !isGameActive) return;

        const newHeatLevel = calculateHeatLevel(correctWordsCount);
        
        if (newHeatLevel.level !== currentHeatLevel.level) {
            const prevLevel = currentHeatLevel;
            setIsTransitioning(true);
            
            // Trigger heat level change callback
            onHeatLevelChange?.(newHeatLevel, prevLevel);
            
            // Update heat level with a small delay for animation
            setTimeout(() => {
                setCurrentHeatLevel(newHeatLevel);
                setIsTransitioning(false);
            }, 150);
        }
    }, [correctWordsCount, isTypingMode, isGameActive, currentHeatLevel, calculateHeatLevel, onHeatLevelChange]);

    // Reset to normal when game is not active
    useEffect(() => {
        if (!isGameActive) {
            setCurrentHeatLevel(HEAT_LEVELS[0]);
            setIsTransitioning(false);
        }
    }, [isGameActive]);

    return {
        currentHeatLevel,
        isTransitioning,
        heatLevels: HEAT_LEVELS,
        getHeatLevelByWordsCount: calculateHeatLevel
    };
}
