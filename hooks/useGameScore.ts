import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { calculateEchoModeScore, calculateTotalScore, calculateTypingModeScore } from '@/lib/scoring';

interface UseGameScoreProps {
    gameStyle: 'practice' | 'challenge';
    modeId: string;
    usedSpeakAgain?: boolean; // เพิ่ม prop สำหรับ Echo mode
}

export function useGameScore({ gameStyle, modeId, usedSpeakAgain = false }: UseGameScoreProps) {
    const {
        streakCount,
        totalChallengeScore,
        lastScoreCalculation,
        lastScoreChange,
        addChallengeScore,
        resetChallengeScore,
        setLastScoreChange,
        words,
        currentWordIndex
    } = useGameStore();

    // Score-related state
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
    
    // Score-related refs
    const scoreBreakdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Helper function to get current word's difficulty level
    const getCurrentWordLevel = useCallback((): string => {
        const currentWord = words[currentWordIndex];
        return currentWord?.level?.toUpperCase() || 'A1'; // Default to A1 if no level found
    }, [words, currentWordIndex]);

    // Calculate and add challenge score
    const calculateAndAddScore = useCallback((
        isCorrect: boolean,
        echoTimeLeft: number,
        memoryTimeLeft: number,
        currentWord?: string
    ) => {
        if (gameStyle !== 'challenge' || !isCorrect) {
            return;
        }

        let scoreCalculation;
        const currentWordLevel = getCurrentWordLevel();

        if (modeId === 'echo') {
            scoreCalculation = calculateEchoModeScore(echoTimeLeft, currentWordLevel, streakCount, true, usedSpeakAgain);
        } else if (modeId === 'typing' && currentWord) {
            // Use new Typing Challenge scoring system with combo multiplier
            const typingScore = calculateTypingModeScore(currentWord, streakCount, true);
            // Convert TypingScoreCalculation to ScoreCalculation format
            scoreCalculation = {
                baseScore: typingScore.baseScore,
                firstListenBonus: 0,
                timeBonus: 0,
                timeBonusDetails: {
                    maxTime: 0,
                    timeUsed: 0,
                    timeMultiplier: 0
                },
                difficultyMultiplier: typingScore.comboMultiplier,
                streakBonus: 0,
                finalScore: typingScore.finalScore,
                usedSpeakAgain: false
            };
        } else if (modeId === 'memory') {
            const timeUsed = 5.0 - memoryTimeLeft;
            scoreCalculation = calculateTotalScore(timeUsed, currentWordLevel, streakCount, true);
        } else {
            const timeUsed = 5.0;
            scoreCalculation = calculateTotalScore(timeUsed, currentWordLevel, streakCount, true);
        }

        addChallengeScore(scoreCalculation);

        // Show score breakdown toast
        setShowScoreBreakdown(true);
        
        // Clear existing timer
        if (scoreBreakdownTimerRef.current) {
            clearTimeout(scoreBreakdownTimerRef.current);
        }
        
        // Hide toast after 1.5 seconds for faster gameplay
        scoreBreakdownTimerRef.current = setTimeout(() => {
            setShowScoreBreakdown(false);
        }, 1500);
    }, [gameStyle, modeId, streakCount, usedSpeakAgain, addChallengeScore, getCurrentWordLevel]);

    // Calculate score for time up scenarios
    const calculateScoreForTimeUp = useCallback(() => {
        if (gameStyle !== 'challenge') {
            return;
        }

        if (modeId === 'echo') {
            const currentWordLevel = getCurrentWordLevel();
            calculateEchoModeScore(0, currentWordLevel, streakCount, false, usedSpeakAgain);
        }
    }, [gameStyle, modeId, streakCount, usedSpeakAgain, getCurrentWordLevel]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (scoreBreakdownTimerRef.current) {
            clearTimeout(scoreBreakdownTimerRef.current);
        }
    }, []);

    return {
        // State
        showScoreBreakdown,
        totalChallengeScore,
        lastScoreCalculation,
        lastScoreChange,
        
        // Refs
        scoreBreakdownTimerRef,
        
        // Functions
        calculateAndAddScore,
        calculateScoreForTimeUp,
        resetChallengeScore,
        setLastScoreChange,
        cleanup
    };
}
