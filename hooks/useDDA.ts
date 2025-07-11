import { useRef, useState, useCallback } from 'react';
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
        setCurrentWordIndex
    } = useGameStore();

    // DDA-related refs
    const lastSpokenWordRef = useRef<string>('');
    const ddaLevelChangeRef = useRef<boolean>(false);
    const lastSpeechTimeRef = useRef<number>(0);
    const ddaLevelChangeTimeRef = useRef<number>(0);
    const initDifficultyLevelRef = useRef(ddaConfig.INITIAL_DIFFICULTY_LEVEL);
    const isResettingRef = useRef<boolean>(false);

    // Simplified DDA state - single flag for all transitions
    const [isDdaTransitioning, setIsDdaTransitioning] = useState(false);

    // Handle DDA performance update with clean transition
    const handleDdaUpdate = useCallback((isCorrect: boolean, onComplete?: () => void) => {
        if (gameStyle !== 'challenge' || modeId === 'meaning-match') {
            return { levelChanged: false, newDifficultyLevel: currentDifficultyLevel };
        }

        const result = updatePerformance(isCorrect);
        
        if (result.levelChanged) {
            // Start transition - block all speech during this period
            setIsDdaTransitioning(true);
            ddaLevelChangeRef.current = true;
            ddaLevelChangeTimeRef.current = Date.now() + 500; // Reduced to 500ms for faster response
            
            // Clean transition - complete word replacement
            setTimeout(() => {
                // Get fresh words for the new difficulty level
                const newLevelWords = getDdaGameSessionWords(result.newDifficultyLevel);
                
                // Batch all state updates together to prevent multiple re-renders
                // 1. Replace all words with new level words
                setWords(newLevelWords);
                
                // 2. Reset to first word of new level
                setCurrentWordIndex(0);
                
                // 3. Clear speech tracking for fresh start
                lastSpokenWordRef.current = '';
                lastSpeechTimeRef.current = 0;
                
                // End transition period
                setTimeout(() => {
                    setIsDdaTransitioning(false);
                    ddaLevelChangeRef.current = false;
                    
                    if (onComplete) {
                        onComplete();
                    }
                }, 300); // Short delay to ensure smooth transition
                
            }, 100); // Minimal delay for batched updates
        }

        return result;
    }, [gameStyle, modeId, currentDifficultyLevel, updatePerformance, setWords, setCurrentWordIndex]);

    // Check if DDA is blocked - simplified version
    const isDdaBlocked = useCallback(() => {
        const now = Date.now();
        const isTimeBlocked = now < ddaLevelChangeTimeRef.current;
        const isTransitionBlocked = isDdaTransitioning;
        
        return {
            isBlocked: isTimeBlocked || isTransitionBlocked,
            isTimeBlocked,
            isTransitionBlocked,
            blockTimeRemaining: Math.max(0, ddaLevelChangeTimeRef.current - now)
        };
    }, [isDdaTransitioning]);

    // Reset DDA tracking
    const resetDdaTracking = useCallback(() => {
        if (isResettingRef.current) {
            return;
        }
        
        isResettingRef.current = true;
        
        lastSpokenWordRef.current = '';
        lastSpeechTimeRef.current = 0;
        ddaLevelChangeRef.current = false;
        ddaLevelChangeTimeRef.current = 0;
        
        setTimeout(() => {
            setIsDdaTransitioning(false);
            isResettingRef.current = false;
        }, 0);
    }, []);

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
        isDdaUpdating: isDdaTransitioning, // For backward compatibility
        ddaLevelJustChanged: isDdaTransitioning, // For backward compatibility
        isDdaTransitioning,
        
        // Refs
        lastSpokenWordRef,
        ddaLevelChangeRef,
        lastSpeechTimeRef,
        ddaLevelChangeTimeRef,
        initDifficultyLevelRef,
        
        // Functions
        handleDdaUpdate,
        isDdaBlocked,
        resetDdaTracking,
        resetDdaState,
        setDifficultyLevel,
        setPerformanceScoreManually
    };
}
