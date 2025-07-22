import { useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { getDdaGameSessionWords } from '@/lib/ddaWords';
import { ddaConfig } from '@/lib/ddaConfig';

export function useDDA({ modeId }: { modeId: string }) {
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

                // 2. Reset to first word of new level
                // Reset index to -1 because it will be incremented to 0 on next render
                if (modeId === 'echo' || modeId === 'memory') setCurrentWordIndex(-1);
                else if (modeId === 'typing') setCurrentWordIndex(0);
                else setCurrentWordIndex(0); // Default for other modes

                // 3. End DDA transition
                setIsTransitioning(false);

            }, 100); // Minimal delay for batched updates
        }

        return result;
    }, [modeId, updatePerformance, setWords, setCurrentWordIndex, setIsTransitioning]);

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
