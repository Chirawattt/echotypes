import { useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { getGameSessionWords } from '@/lib/words-new';
import { getDdaGameSessionWords } from '@/lib/ddaWords';
import { ddaConfig } from '@/lib/ddaConfig';

// Import our custom hooks
import { useAudio } from './useAudio';
import { useSpeech } from './useSpeech';
import { useDDA } from './useDDA';
import { useGameTimers } from './useGameTimers';
import { useGameScore } from './useGameScore';
import { useGameModes } from './useGameModes';
import { useGameEvents } from './useGameEvents';

interface UseGameLogicProps {
    modeId: string;
    difficultyId: string;
    gameStyle: 'practice' | 'challenge';
}

export function useGameLogic({ modeId, difficultyId, gameStyle }: UseGameLogicProps) {
    const {
        // State
        status, words, currentWordIndex, userInput, score: gameScore, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText, streakCount,
        totalChallengeScore, lastScoreCalculation,

        // Actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak, addChallengeScore, resetChallengeScore
    } = useGameStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const isInitializedRef = useRef(false); // Flag to prevent re-initialization

    // Initialize custom hooks
    const audio = useAudio();
    const speech = useSpeech();
    const dda = useDDA({ gameStyle, modeId });
    const timers = useGameTimers({ modeId, gameStyle });
    const scoreUtils = useGameScore({ gameStyle, difficultyId, modeId });

    // Game modes hook
    useGameModes({
        modeId,
        status,
        currentWordIndex,
        words,
        speak: speech.speak,
        inputRef,
    });

    // Game events hook
    const events = useGameEvents({
        modeId,
        difficultyId,
        gameStyle,
        currentDifficultyLevel: dda.currentDifficultyLevel,
        playSound: audio.playSound,
        correctAudioRef: audio.correctAudioRef,
        incorrectAudioRef: audio.incorrectAudioRef,
        completedAudioRef: audio.completedAudioRef,
        keypressAudioRef: audio.keypressAudioRef,
        handleDdaUpdate: dda.handleDdaUpdate,
        calculateAndAddScore: scoreUtils.calculateAndAddScore,
        stopEchoTimer: timers.stopEchoTimer,
    });

    // Common time up logic for all modes
    const handleTimeUpCommon = useCallback(() => {
        setIsTransitioning(true);
        setIsWrong(true);
        addIncorrectWord({ correct: words[currentWordIndex].word, incorrect: '(Time up)' });
        resetStreak();
        audio.playSound(audio.incorrectAudioRef, 0.8);

        // Update DDA Performance for incorrect answer (except meaning-match mode)
        dda.handleDdaUpdate(false);

        setTimeout(() => {
            const newLives = lives - 1;
            const isLastWord = currentWordIndex === words.length - 1;

            if (newLives <= 0 || (isLastWord && difficultyId !== 'endless' && difficultyId !== 'dda')) {
                audio.playSound(audio.completedAudioRef, 0.5);
                setStatus('gameOver');
                return;
            }

            // Handle endless mode and DDA mode - reshuffle words when reaching the end
            if ((difficultyId === 'endless' || difficultyId === 'dda') && isLastWord) {
                // Use DDA for challenge mode, regular difficulty for practice mode
                let reshuffledWords;
                if (difficultyId === 'dda' && gameStyle === 'challenge' && modeId !== 'meaning-match') {
                    reshuffledWords = getDdaGameSessionWords(dda.currentDifficultyLevel);
                } else {
                    reshuffledWords = getGameSessionWords(difficultyId);
                }
                setWords(reshuffledWords);
                setCurrentWordIndex(0);
            } else {
                incrementWordIndex();
            }

            setLives(newLives);
            setUserInput('');
            setIsWrong(false);
            setIsCorrect(false);
            setIsTransitioning(false);
        }, 1200);
    }, [lives, currentWordIndex, words, difficultyId, gameStyle, modeId, dda, audio, setStatus, setIsTransitioning, setIsWrong, addIncorrectWord, resetStreak, setWords, setCurrentWordIndex, incrementWordIndex, setLives, setUserInput, setIsCorrect]);

    // Handle time up for Echo mode challenge
    const handleEchoTimeUp = useCallback(() => {
        if (modeId === 'echo' && gameStyle === 'challenge') {
            scoreUtils.calculateScoreForTimeUp();
            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, scoreUtils, handleTimeUpCommon]);

    // Handle time up for Memory mode challenge
    const handleMemoryTimeUp = useCallback(() => {
        if (modeId === 'memory' && gameStyle === 'challenge') {
            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, handleTimeUpCommon]);

    // Handle time up for Meaning Match mode challenge
    const handleMeaningMatchTimeUp = useCallback(() => {
        if (modeId === 'meaning-match' && gameStyle === 'challenge') {
            scoreUtils.calculateScoreForTimeUp();
            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, scoreUtils, handleTimeUpCommon]);

    // Handle restart game
    const handleRestartGame = useCallback(() => {
        // Use DDA system for challenge mode, regular difficulty selection for practice mode
        let sessionWords;
        if (gameStyle === 'challenge' && modeId !== 'meaning-match') {
            // Reset DDA state first, then get words from initial level
            dda.resetDdaState();
            sessionWords = getDdaGameSessionWords(ddaConfig.INITIAL_DIFFICULTY_LEVEL); // Always start from A1
        } else {
            sessionWords = getGameSessionWords(difficultyId);
        }
        
        resetGame();
        setWords(sessionWords);
        if (gameStyle === 'challenge') {
            scoreUtils.resetChallengeScore();
        }
    }, [difficultyId, gameStyle, modeId, resetGame, setWords, dda, scoreUtils]);

    // Form submit wrapper
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        events.handleFormSubmit(
            e,
            timers.echoTimeLeft,
            timers.memoryTimeLeft,
            timers.meaningMatchTimeLeft
        );
    }, [events, timers]);

    // Initialize game
    useEffect(() => {
        // Prevent re-initialization if already done
        if (isInitializedRef.current) {
            return;
        }
        
        isInitializedRef.current = true;
        
        // Clear any pending speech synthesis
        speech.cancelSpeech();


        // Initialize game with appropriate words based on mode and game style
        let sessionWords;
        if (gameStyle === 'challenge' && modeId !== 'meaning-match') {
            sessionWords = getDdaGameSessionWords(ddaConfig.INITIAL_DIFFICULTY_LEVEL);
        } else {
            sessionWords = getGameSessionWords(difficultyId);
        }
        
        initializeGame(sessionWords);
        if (gameStyle === 'challenge') {
            scoreUtils.resetChallengeScore();
            if (modeId !== 'meaning-match') {
                dda.resetDdaState();
                dda.initDifficultyLevelRef.current = ddaConfig.INITIAL_DIFFICULTY_LEVEL;
            }
        }
        inputRef.current?.focus();

        return () => {
            isInitializedRef.current = false;
            scoreUtils.cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficultyId, gameStyle, modeId]); // เจตนาไม่ใส่ hooks objects เพื่อป้องกัน infinite loop

    // Countdown logic
    useEffect(() => {
        if (status === 'countdown') {
            // Clear any pending speech synthesis before countdown starts
            speech.cancelSpeech();

            setCountdown(3);
            audio.playSound(audio.countdownAudioRef, 0.5);
            let countdownRef = 3;
            const interval = setInterval(() => {
                countdownRef -= 1;
                setCountdown(countdownRef);
                if (countdownRef <= 0) {
                    clearInterval(interval);
                    setTimeout(() => setStatus('playing'), 1000);
                }
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        }
        inputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]); // Remove store functions to prevent infinite loop

    // High score loading
    useEffect(() => {
        const storedData = localStorage.getItem(`highScoreData_${modeId}_${difficultyId}`);
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setHighScore(data.score || 0);
            } catch (e) {
                console.error("Failed to parse high score data", e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeId, difficultyId]); // Remove store functions to prevent infinite loop

    // Game over logic
    useEffect(() => {
        if (status === 'gameOver' && startTime) {
            const TYPING_MODE_DURATION = 60;
            const finalTime = modeId === 'typing'
                ? { minutes: Math.floor(TYPING_MODE_DURATION / 60), seconds: TYPING_MODE_DURATION % 60 }
                : { minutes: Math.floor(((new Date().getTime() - startTime.getTime()) / 1000) / 60), seconds: Math.floor(((new Date().getTime() - startTime.getTime()) / 1000) % 60) };

            setTimeSpent(finalTime);

            if (modeId === 'typing') {
                const timeInMinutes = TYPING_MODE_DURATION / 60;
                const wordsPerMinute = Math.round(gameScore / timeInMinutes);
                setWpm(wordsPerMinute);
            }

            if (gameScore > highScore) {
                setHighScore(gameScore);
                localStorage.setItem(`highScoreData_${modeId}_${difficultyId}`, JSON.stringify({ score: gameScore, time: finalTime }));
            }

            if (gameStyle === 'challenge') {
                const challengeHighScoreKey = `challengeHighScore_${modeId}_${difficultyId}`;
                const currentChallengeHighScore = parseInt(localStorage.getItem(challengeHighScoreKey) || '0');
                if (totalChallengeScore > currentChallengeHighScore) {
                    localStorage.setItem(challengeHighScoreKey, totalChallengeScore.toString());
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, startTime, gameScore, highScore, modeId, difficultyId, gameStyle, totalChallengeScore]); // Remove store functions to prevent infinite loop

    // Focus input when Echo countdown starts (challenge mode)
    useEffect(() => {
        if (modeId === 'echo' && gameStyle === 'challenge' && timers.isEchoCountingDown && status === 'playing') {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [modeId, gameStyle, timers.isEchoCountingDown, status]);

    return {
        // State
        status, words, currentWordIndex, userInput, score: gameScore, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText, streakCount,
        totalChallengeScore, lastScoreCalculation,
        
        // Timer state
        isEchoCountingDown: timers.isEchoCountingDown,
        echoTimeLeft: timers.echoTimeLeft,
        memoryTimeLeft: timers.memoryTimeLeft,
        meaningMatchTimeLeft: timers.meaningMatchTimeLeft,
        
        // Score state
        showScoreBreakdown: scoreUtils.showScoreBreakdown,
        
        // DDA State
        currentDifficultyLevel: dda.currentDifficultyLevel,
        performanceScore: dda.performanceScore,

        // Refs
        inputRef,
        currentUtteranceRef: speech.currentUtteranceRef,
        echoStopTimerRef: timers.echoStopTimerRef,
        scoreBreakdownTimerRef: scoreUtils.scoreBreakdownTimerRef,
        keypressAudioRef: audio.keypressAudioRef,
        correctAudioRef: audio.correctAudioRef,
        incorrectAudioRef: audio.incorrectAudioRef,
        completedAudioRef: audio.completedAudioRef,
        countdownAudioRef: audio.countdownAudioRef,

        // Functions
        speak: speech.speak,
        playSound: audio.playSound,
        handleUserInputChange: events.handleUserInputChange,
        handleFormSubmit,
        handleRestartGame,
        
        // Timer functions
        setIsEchoCountingDown: timers.setIsEchoCountingDown,
        setEchoTimeLeft: timers.setEchoTimeLeft,
        setMemoryTimeLeft: timers.setMemoryTimeLeft,
        setMeaningMatchTimeLeft: timers.setMeaningMatchTimeLeft,
        handleEchoTimeUp,
        handleMemoryTimeUp,
        handleMeaningMatchTimeUp,
        handleEchoTimerReady: timers.handleEchoTimerReady,
        handleEchoTimeLeftChange: timers.handleEchoTimeLeftChange,
        handleMemoryTimeLeftChange: timers.handleMemoryTimeLeftChange,
        handleMeaningMatchTimeLeftChange: timers.handleMeaningMatchTimeLeftChange,

        // Store actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak, addChallengeScore, resetChallengeScore,
        
        // DDA Actions
        updatePerformance: dda.handleDdaUpdate,
        resetDdaState: dda.resetDdaState,
        setCurrentDifficultyLevel: dda.setDifficultyLevel,
        setPerformanceScore: dda.setPerformanceScoreManually
    };
}
