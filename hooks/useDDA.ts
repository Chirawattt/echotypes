import { useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { getDdaGameSessionWords } from '@/lib/ddaWords';
import { ddaConfig } from '@/lib/ddaConfig';

interface UseDDAProps {
    gameStyle: 'practice' | 'challenge';
    modeId: string;
}

export function useDDA({ gameStyle, modeId }: UseDDAProps) {
    const {
        currentDifficultyLevel,
        performanceScore,
        updatePerformance,
        resetDdaState,
        setWords,
        setCurrentWordIndex,
        setIsTransitioning // Add this to control main transition state
    } = useGameStore();

    const initDifficultyLevelRef = useRef(ddaConfig.INITIAL_DIFFICULTY_LEVEL);

    // Handle DDA performance update with clean transition
    const handleDdaUpdate = useCallback((isCorrect: boolean) => {
        if (gameStyle !== 'challenge' || modeId === 'meaning-match') {
            return { levelChanged: false, newDifficultyLevel: currentDifficultyLevel };
        }

        const result = updatePerformance(isCorrect);

        if (result.levelChanged) {
            // Start transition - block all speech during this period
            setIsTransitioning(true);

            // Clean transition - complete word replacement
            setTimeout(() => {
                // Get fresh words for the new difficulty level
                const newLevelWords = getDdaGameSessionWords(result.newDifficultyLevel);

                // Batch all state updates together to prevent multiple re-renders
                // 1. Replace all words with new level words
                setWords(newLevelWords);
                console.log("DDA new words is ", newLevelWords.slice(0, 5));

                // 2. Reset to first word of new level
                // Reset index to -1 because it will be incremented to 0 on next render
                setCurrentWordIndex(-1);

            }, 100); // Minimal delay for batched updates
        }

        return result;
    }, [gameStyle, modeId, currentDifficultyLevel, updatePerformance, setWords, setCurrentWordIndex, setIsTransitioning]);

    // Set difficulty level manually (for external control)
    const setDifficultyLevel = useCallback(() => {
        // This will be handled by the store action, not direct mutation
    }, []);

    // Set performance score manually (for external control)
    const setPerformanceScoreManually = useCallback(() => {
        // This will be handled by the store action, not direct mutation
    }, []);

    return {
        // State
        currentDifficultyLevel,
        performanceScore,

        // Refs
        initDifficultyLevelRef,

        // Functions
        handleDdaUpdate,
        resetDdaState,
        setDifficultyLevel,
        setPerformanceScoreManually
    };
}
