import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { calculateEchoModeScore, calculateTotalScore, calculateTypingModeScore } from '@/lib/scoring';

interface UseGameScoreProps {
    gameStyle: 'practice' | 'challenge';
    difficultyId: string;
    modeId: string;
    usedSpeakAgain?: boolean; // เพิ่ม prop สำหรับ Echo mode
}

export function useGameScore({ gameStyle, difficultyId, modeId, usedSpeakAgain = false }: UseGameScoreProps) {
    const {
        streakCount,
        totalChallengeScore,
        lastScoreCalculation,
        addChallengeScore,
        resetChallengeScore
    } = useGameStore();

    // Score-related state
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
    
    // Score-related refs
    const scoreBreakdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate and add challenge score
    const calculateAndAddScore = useCallback((
        isCorrect: boolean,
        echoTimeLeft: number,
        memoryTimeLeft: number,
        meaningMatchTimeLeft: number,
        currentWord?: string
    ) => {
        if (gameStyle !== 'challenge' || !isCorrect) {
            return;
        }

        let scoreCalculation;

        if (modeId === 'echo') {
            scoreCalculation = calculateEchoModeScore(echoTimeLeft, difficultyId, streakCount, true, usedSpeakAgain);
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
            scoreCalculation = calculateTotalScore(timeUsed, difficultyId, streakCount, true);
        } else if (modeId === 'meaning-match') {
            const timeUsed = 5.0 - meaningMatchTimeLeft;
            scoreCalculation = calculateTotalScore(timeUsed, difficultyId, streakCount, true);
        } else {
            const timeUsed = 5.0;
            scoreCalculation = calculateTotalScore(timeUsed, difficultyId, streakCount, true);
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
    }, [gameStyle, difficultyId, modeId, streakCount, usedSpeakAgain, addChallengeScore]);

    // Calculate score for time up scenarios
    const calculateScoreForTimeUp = useCallback(() => {
        if (gameStyle !== 'challenge') {
            return;
        }

        if (modeId === 'echo') {
            const scoreCalculation = calculateEchoModeScore(0, difficultyId, streakCount, false, usedSpeakAgain);
            console.log(`Time up! No score added. Calculation: ${scoreCalculation.finalScore}`);
        } else if (modeId === 'meaning-match') {
            const scoreCalculation = calculateTotalScore(5.0, difficultyId, streakCount, false);
            console.log(`Meaning Match time up! No score added. Calculation: ${scoreCalculation.finalScore}`);
        }
    }, [gameStyle, modeId, difficultyId, streakCount, usedSpeakAgain]);

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
        
        // Refs
        scoreBreakdownTimerRef,
        
        // Functions
        calculateAndAddScore,
        calculateScoreForTimeUp,
        resetChallengeScore,
        cleanup
    };
}
