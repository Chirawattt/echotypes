import { useRef, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { getGameSessionWords } from '@/lib/words-new';
import { getDdaGameSessionWords, preloadDdaWords } from '@/lib/ddaWords';
import { ddaConfig } from '@/lib/ddaConfig';
import { mapLevelToFileName } from '@/lib/difficultyHelpers';
import { submitGameScore, checkMilestones, type GameScoreData } from '@/lib/database';
import { useSession } from 'next-auth/react';

// Import our custom hooks
import { useAudio } from './useAudio';
import { useSpeech } from './useSpeech';
import { useDDA } from './useDDA';
import { useGameTimers } from './useGameTimers';
import { useGameScore } from './useGameScore';
import { useGameModes } from './useGameModes';
import { useGameEvents } from './useGameEvents';
import { useNitroEnergy } from './useNitroEnergy';
import { useOverdriveSystem } from './useOverdriveSystem';

interface UseGameLogicProps {
    modeId: string;
    difficultyId: string;
    gameStyle: 'practice' | 'challenge';
    selectedTime?: number | null;
}

export function useGameLogic({ modeId, difficultyId, gameStyle, selectedTime }: UseGameLogicProps) {
    const { data: session } = useSession();
    

    
    const {
        // State
        status, words, currentWordIndex, userInput, score: wordsTypedCount, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText, streakCount, bestStreak,
        totalChallengeScore, lastScoreCalculation, incorrectWords, timeSpent,

        // Actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText, setTimeLeft,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak, addChallengeScore, resetChallengeScore,
        updateModeStats, getModeStats, globalCleanup
    } = useGameStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const isInitializedRef = useRef(false); // Flag to prevent re-initialization
    const currentGameRef = useRef<string>(''); // Track current game mode/style combination
    const isLoadingWordsRef = useRef(false); // Flag to prevent multiple word loading
    
    // เพิ่ม state สำหรับติดตาม speak again
    const [usedSpeakAgain, setUsedSpeakAgain] = useState(false);
    
    // เพิ่ม state สำหรับติดตาม total words played
    const [totalWordsPlayed, setTotalWordsPlayed] = useState(0);
    
    // Add state for database-fetched best streak (mode+style specific)
    const [databaseBestStreak, setDatabaseBestStreak] = useState(0);
    
    // Add state for best WPM across all styles for typing mode
    const [bestWpmAllStyles, setBestWpmAllStyles] = useState(0);
    
    // Add state for best streak across all styles for all modes
    const [bestStreakAllStyles, setBestStreakAllStyles] = useState(0);

    // Initialize custom hooks
    const audio = useAudio();
    const speech = useSpeech();
    const dda = useDDA({ modeId });
    const timers = useGameTimers({ modeId, gameStyle });
    const scoreUtils = useGameScore({ gameStyle, difficultyId, modeId, usedSpeakAgain });
    
    // Overdrive system for Typing Challenge Mode
    const overdriveSystem = useOverdriveSystem({
        isTypingMode: modeId === 'typing' && gameStyle === 'challenge',
        isGameActive: status === 'playing',
        correctWordsCount: streakCount, // Use streak count as correct words count
    });

    // Nitro energy for Typing Challenge Mode
    const nitroEnergy = useNitroEnergy({
        isTypingMode: modeId === 'typing' && gameStyle === 'challenge',
        isGameActive: status === 'playing',
        energyDecayInterval: overdriveSystem.currentHeatLevel.energyDecayInterval,
        onEnergyDepleted: () => {
            setStatus('gameOver');
        }
    });

    // Game modes hook
    useGameModes({
        modeId,
        status,
        currentWordIndex,
        words,
        speak: speech.speak,
        inputRef,
        gameStyle,
        ddaLevel: dda.currentDifficultyLevel,
    });

    // Game events hook
    const events = useGameEvents({
        modeId,
        difficultyId,
        currentDifficultyLevel: dda.currentDifficultyLevel,
        playSound: audio.playSound,
        correctAudioRef: audio.correctAudioRef,
        incorrectAudioRef: audio.incorrectAudioRef,
        completedAudioRef: audio.completedAudioRef,
        handleDdaUpdate: dda.handleDdaUpdate,
        calculateAndAddScore: scoreUtils.calculateAndAddScore,
        stopEchoTimer: timers.stopEchoTimer,
        stopMemoryTimer: timers.stopMemoryTimer,
        addEnergy: nitroEnergy.addEnergy,
        removeEnergy: nitroEnergy.removeEnergy,
    });

    // Common time up logic for all modes
    const handleTimeUpCommon = useCallback(() => {
        setIsTransitioning(true);
        setIsWrong(true);
        addIncorrectWord({ correct: words[currentWordIndex].word, incorrect: '(Time up)' });
        resetStreak();
        audio.playSound(audio.incorrectAudioRef, 0.8);

        // Update DDA Performance for incorrect answer
        dda.handleDdaUpdate(false);

        setTimeout(() => {
            const newLives = lives - 1;
            const isLastWord = currentWordIndex === words.length - 1;

            if (newLives <= 0 || (isLastWord && difficultyId !== 'dda')) {
                // Only play completed sound for non-echo modes
                // Echo mode will play sound in GameOverOverlay
                if (modeId !== 'echo') {
                    audio.playSound(audio.completedAudioRef, 0.5);
                }
                setStatus('gameOver');
                return;
            }

            // Handle DDA mode - reshuffle words when reaching the end
            if (difficultyId === 'dda' && isLastWord) {
                // Use DDA for both challenge and practice modes when difficultyId is 'dda'
                const reshuffledWords = getDdaGameSessionWords(dda.currentDifficultyLevel);
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
    }, [lives, currentWordIndex, words, difficultyId, modeId, dda, audio, setStatus, setIsTransitioning, setIsWrong, addIncorrectWord, resetStreak, setWords, setCurrentWordIndex, incrementWordIndex, setLives, setUserInput, setIsCorrect]);

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

    // Handle restart game
    const handleRestartGame = useCallback(() => {
        // Reset score submission tracking for new game
        scoreSubmittedRef.current = false;
        
        // Clear stored timeSpent from previous games
        if (typeof window !== 'undefined') {
            const gameKey = `${modeId}-${gameStyle}-timeSpent`;
            localStorage.removeItem(gameKey);
        }
        
        // Use DDA system for DDA difficulty mode, regular difficulty selection otherwise
        const restartWithWords = async () => {
            resetGame(); // This sets status to 'loading'
            
            // Additional explicit resets to ensure clean state
            setScore(0);
            resetStreak();
            resetChallengeScore();
            
            let sessionWords;
            if (difficultyId === 'dda') {
                // Reset DDA state first, then get words from cache
                dda.resetDdaState();
                sessionWords = getDdaGameSessionWords(ddaConfig.INITIAL_DIFFICULTY_LEVEL);
            } else {
                // Fetch words from database
                sessionWords = await getGameSessionWords(difficultyId, 20);
            }
            
            if (sessionWords.length === 0) {
                console.error(`❌ No words available for restart with ${difficultyId}`);
                return;
            }
            
            // Add loading delay for restart too
            setTimeout(() => {
                setWords(sessionWords);
                setStatus('countdown'); // Manually set to countdown since we already called resetGame
            }, 600); // Shorter delay for restart
        };
        
        restartWithWords();
        
        // Set custom time for typing practice mode
        if (modeId === 'typing' && gameStyle === 'practice' && selectedTime !== undefined) {
            // selectedTime === null means unlimited time, set to very high number
            const timeToSet = selectedTime === null ? 999999 : selectedTime;
            setTimeLeft(timeToSet);
        }
        
        if (gameStyle === 'challenge') {
            scoreUtils.resetChallengeScore();
        }
        // Reset Nitro Energy for Typing Challenge Mode
        if (modeId === 'typing' && gameStyle === 'challenge') {
            nitroEnergy.resetEnergy();
        }
    }, [difficultyId, gameStyle, modeId, selectedTime, resetGame, setWords, setTimeLeft, dda, scoreUtils, nitroEnergy]);

    // Form submit wrapper
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        events.handleFormSubmit(
            e,
            timers.echoTimeLeft,
            timers.memoryTimeLeft,
        );
    }, [events, timers]);

    // Global cleanup for home navigation
    const handleHomeNavigation = useCallback(() => {
        console.log('🏠 HOME NAVIGATION: Performing global cleanup');
        
        // Clear all localStorage game data
        if (typeof window !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('-timeSpent')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Cancel any pending speech
        speech.cancelSpeech();
        
        // Reset all game state
        globalCleanup();
        
        // Reset all refs to initial state
        isInitializedRef.current = false;
        currentGameRef.current = '';
        scoreSubmittedRef.current = false;
    }, [globalCleanup, speech]);

    // Initialize game
    useEffect(() => {
        // Always allow re-initialization when mode or style changes
        // Only prevent within the same mode/style combination
        const currentGameKey = `${modeId}-${gameStyle}`;
        if (isInitializedRef.current && currentGameRef.current === currentGameKey) {
            return;
        }
        
        isInitializedRef.current = true;
        currentGameRef.current = currentGameKey;
        
        console.log(`🎯 INITIALIZING NEW GAME: ${currentGameKey}`);
        
        // Clear any pending speech synthesis
        speech.cancelSpeech();

        
        // Reset score submission tracking
        scoreSubmittedRef.current = false;
        
        // Clear stored timeSpent from previous games
        if (typeof window !== 'undefined') {
            const gameKey = `${modeId}-${gameStyle}-timeSpent`;
            localStorage.removeItem(gameKey);
        }
        
        // Force reset critical game state values to prevent contamination
        console.log('🔄 BEFORE RESET:', {
            status,
            score: wordsTypedCount,
            streakCount,
            bestStreak,
            totalChallengeScore
        });
        
        resetGame(); // This sets status to 'loading' and timeLeft to 60
        
        // Additional explicit resets to ensure clean state
        setScore(0);
        resetStreak();
        resetChallengeScore();
        
        console.log('✅ AFTER RESET - State should be clean now');
        
        // Set custom time immediately after reset for typing practice mode
        if (modeId === 'typing' && gameStyle === 'practice' && selectedTime !== undefined) {
            // selectedTime === null means unlimited time, set to very high number
            const timeToSet = selectedTime === null ? 999999 : selectedTime;
            setTimeLeft(timeToSet);
        }
        
        // Initialize game with appropriate words based on difficulty and mode
        const initializeGameWithWords = async () => {
            if (isLoadingWordsRef.current) {
                return;
            }
            
            isLoadingWordsRef.current = true;
            
            try {
                let sessionWords;
                if (difficultyId === 'dda') {
                    // DDA mode: Get initial words from database directly, preload cache in background
                    const ddaLevel = ddaConfig.INITIAL_DIFFICULTY_LEVEL;
                    const mappedLevel = mapLevelToFileName(ddaLevel);
                    sessionWords = await getGameSessionWords(mappedLevel, 20);
                    
                    // Preload cache in background (non-blocking)
                    setTimeout(() => {
                        preloadDdaWords().then(() => {
                        }).catch(error => {
                            console.warn('⚠️ DDA cache preload failed:', error);
                        });
                    }, 2000); // Delay to ensure game has started
                } else {
                    // Regular mode: Fetch words from database
                    sessionWords = await getGameSessionWords(difficultyId, 20);
                }
                
                if (sessionWords.length === 0) {
                    console.error(`❌ No words available for ${difficultyId}`);
                    isLoadingWordsRef.current = false;
                    return;
                }
                
                // Add a small delay to show loading state to user
                setTimeout(() => {
                    initializeGame(sessionWords); // This will set status to 'countdown' and reset timeLeft to 60!
                    
                    // Set custom time AFTER initializeGame for typing practice mode
                    if (modeId === 'typing' && gameStyle === 'practice' && selectedTime !== undefined) {
                        // selectedTime === null means unlimited time, set to very high number
                        const timeToSet = selectedTime === null ? 999999 : selectedTime;
                        setTimeLeft(timeToSet);
                    }
                    
                    isLoadingWordsRef.current = false;
                }, 800); // Show loading for at least 800ms
                
            } catch (error) {
                console.error('❌ Error loading words:', error);
                isLoadingWordsRef.current = false;
            }
        };
        
        initializeGameWithWords();
        
        // Set custom time for typing practice mode
        if (modeId === 'typing' && gameStyle === 'practice' && selectedTime !== undefined) {
            // selectedTime === null means unlimited time, set to very high number
            const timeToSet = selectedTime === null ? 999999 : selectedTime;
            console.log(`⏱️ SETTING CUSTOM TIME: ${selectedTime === null ? 'UNLIMITED' : selectedTime + 's'} (timeLeft set to ${timeToSet})`);
            setTimeLeft(timeToSet);
        }
        
        if (gameStyle === 'challenge') {
            scoreUtils.resetChallengeScore();
        }
        
        // Reset Nitro Energy for Typing Challenge Mode
        if (modeId === 'typing' && gameStyle === 'challenge') {
            nitroEnergy.resetEnergy();
        }
        
        // Initialize DDA system for DDA difficulty mode regardless of game style
        if (difficultyId === 'dda') {
            dda.resetDdaState();
            dda.initDifficultyLevelRef.current = ddaConfig.INITIAL_DIFFICULTY_LEVEL;
        }
        inputRef.current?.focus();

        return () => {
            isInitializedRef.current = false;
            currentGameRef.current = ''; // Reset game tracking
            isLoadingWordsRef.current = false; // Reset loading flag
            scoreSubmittedRef.current = false; // Reset score submission flag
            scoreUtils.cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficultyId, gameStyle, modeId, selectedTime]); // เจตนาไม่ใส่ hooks objects เพื่อป้องกัน infinite loop



    // Simple countdown logic (back to original)
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
    }, [status]); // Only watch status, no complex logic needed

    // High score loading from database (user-specific)
    useEffect(() => {
        const fetchPersonalBest = async () => {


            if (session?.user?.id) {
                try {
                    const apiUrl = `/api/scores?gameMode=${modeId}&gameStyle=${gameStyle}`;
                    
                    const response = await fetch(apiUrl);
                    
                    if (response.ok) {
                        const result = await response.json();
                        const scores = result.scores || [];
                        
                        if (scores.length > 0) {
                            // Get the highest score for this mode/style combination
                            const personalBest = Math.max(...scores.map((score: any) => score.score));
                            setHighScore(personalBest);
                            
                            // Get the best streak for this mode/style combination
                            const bestStreakForModeStyle = Math.max(...scores.map((score: any) => score.highest_streak || 0));
                            setDatabaseBestStreak(bestStreakForModeStyle);
                        } else {
                            // No scores found, start with 0
                            setHighScore(0);
                            setDatabaseBestStreak(0);
                        }
                    } else {
                        console.error('❌ Failed to fetch personal best scores, status:', response.status);
                        setHighScore(0);
                        setDatabaseBestStreak(0);
                    }
                } catch (error) {
                    console.error('❌ Error fetching personal best:', error);
                    setHighScore(0);
                    setDatabaseBestStreak(0);
                }
            } else {
                // Not authenticated, reset to 0
                setHighScore(0);
                setDatabaseBestStreak(0);
            }
        };

        // Clear any localStorage high scores on component mount
        if (typeof window !== 'undefined') {
            // Clear old localStorage entries that might still exist
            Object.keys(localStorage).forEach(key => {
                if (key.includes('highScore') || key.includes('challengeHighScore')) {
                    localStorage.removeItem(key);
                }
            });
        }

        fetchPersonalBest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeId, gameStyle, session?.user?.id]); // Fetch when mode, style, or user changes

    // Fetch best WPM across all styles for typing mode
    useEffect(() => {
        const fetchBestWpmAllStyles = async () => {
            if (modeId === 'typing' && session?.user?.id) {
                try {
                    // Fetch all typing scores (both practice and challenge)
                    const response = await fetch(`/api/scores?gameMode=typing`);
                    if (response.ok) {
                        const result = await response.json();
                        const allTypingScores = result.scores || [];
                        
                        if (allTypingScores.length > 0) {
                            // Get the highest WPM across all typing styles
                            const bestWpm = Math.max(...allTypingScores.map((score: any) => score.wpm || 0));
                            setBestWpmAllStyles(bestWpm);
                        } else {
                            setBestWpmAllStyles(0);
                        }
                    } else {
                        setBestWpmAllStyles(0);
                    }
                } catch (error) {
                    console.error('❌ Error fetching best WPM across all styles:', error);
                    setBestWpmAllStyles(0);
                }
            } else {
                setBestWpmAllStyles(0);
            }
        };

        fetchBestWpmAllStyles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeId, session?.user?.id]); // Only depends on modeId and user, not gameStyle

    // Fetch best streak across all styles for all modes
    useEffect(() => {
        const fetchBestStreakAllStyles = async () => {
            if (session?.user?.id) {
                try {
                    // Fetch all scores for the current mode (both practice and challenge)
                    const response = await fetch(`/api/scores?gameMode=${modeId}`);
                    if (response.ok) {
                        const result = await response.json();
                        const allModeScores = result.scores || [];
                        
                        if (allModeScores.length > 0) {
                            // Get the highest streak across all styles for this mode
                            const bestStreak = Math.max(...allModeScores.map((score: any) => score.highest_streak || 0));
                            setBestStreakAllStyles(bestStreak);
                        } else {
                            setBestStreakAllStyles(0);
                        }
                    } else {
                        setBestStreakAllStyles(0);
                    }
                } catch (error) {
                    console.error(`❌ Error fetching best streak across all ${modeId} styles:`, error);
                    setBestStreakAllStyles(0);
                }
            } else {
                setBestStreakAllStyles(0);
            }
        };

        fetchBestStreakAllStyles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeId, session?.user?.id]); // Only depends on modeId and user, not gameStyle

    // Track if score has been submitted for this game session
    const scoreSubmittedRef = useRef(false);

    // Game over logic with database submission
    useEffect(() => {
        
        // Only log when actually submitting to reduce noise
        if (status === 'gameOver' && startTime && !scoreSubmittedRef.current && words.length > 0) {
            console.log('⚡ GAME OVER - Will submit score');
        }
        
        if (status === 'gameOver' && startTime && !scoreSubmittedRef.current && words.length > 0) {
            scoreSubmittedRef.current = true; // Mark as submitted to prevent duplicates
            
            // Capture state values IMMEDIATELY to prevent race condition with resets
            const capturedState = {
                finalWordsTypedCount: wordsTypedCount,
                finalStreakCount: streakCount,
                finalBestStreak: bestStreak,
                finalTotalChallengeScore: totalChallengeScore,
                finalIncorrectWords: [...incorrectWords],
                finalStartTime: startTime
            };
            
            console.log('💾 SUBMITTING SCORE - Captured state:', {
                modeId,
                gameStyle,
                ...capturedState
            });
            
            // Calculate actual elapsed time for all modes (including typing challenge)
            const elapsedTimeMs = new Date().getTime() - capturedState.finalStartTime.getTime();
            const elapsedTimeSeconds = Math.floor(elapsedTimeMs / 1000);
            const finalTime = {
                minutes: Math.floor(elapsedTimeSeconds / 60),
                seconds: elapsedTimeSeconds % 60
            };

            setTimeSpent(finalTime);
            
            // Store timeSpent in localStorage to persist across mode switches
            if (typeof window !== 'undefined') {
                const gameKey = `${modeId}-${gameStyle}-timeSpent`;
                localStorage.setItem(gameKey, JSON.stringify(finalTime));
            }

            const timeSpentSeconds = finalTime.minutes * 60 + finalTime.seconds;
            let currentWPM = 0;

            if (modeId === 'typing' && timeSpentSeconds > 0) {
                const timeInMinutes = timeSpentSeconds / 60;
                currentWPM = Math.round(capturedState.finalWordsTypedCount / timeInMinutes);
                setWpm(currentWPM);
            }

            // Update in-memory high score for immediate UI feedback
            const currentScore = gameStyle === 'challenge' ? capturedState.finalTotalChallengeScore : capturedState.finalWordsTypedCount;
            if (currentScore > highScore) {
                setHighScore(currentScore);
            }

            // Update mode-specific statistics first
            const currentModeStats = getModeStats(modeId as 'echo' | 'memory' | 'typing');
            const newStats: Partial<import('@/lib/stores/gameStore').ModeStats> = {
                totalGamesPlayed: currentModeStats.totalGamesPlayed + 1,
                totalWordsCorrect: currentModeStats.totalWordsCorrect + capturedState.finalWordsTypedCount,
                totalWordsMissed: currentModeStats.totalWordsMissed + capturedState.finalIncorrectWords.length,
            };

            // Use the session's best streak (already tracked during gameplay)
            
            // Update mode stats with session best streak if it's better
            if (capturedState.finalBestStreak > currentModeStats.bestStreak) {
                newStats.bestStreak = capturedState.finalBestStreak;
            }

            // Submit score to database if user is authenticated
            if (session?.user) {
                const scoreData: GameScoreData = {
                    gameMode: modeId as 'echo' | 'memory' | 'typing',
                    gameStyle: gameStyle,
                    score: gameStyle === 'challenge' ? capturedState.finalTotalChallengeScore : capturedState.finalWordsTypedCount,
                    highestStreak: capturedState.finalBestStreak,
                    wordsCorrect: capturedState.finalWordsTypedCount,
                    wordsIncorrect: capturedState.finalIncorrectWords.length,
                    timeSpentSeconds: timeSpentSeconds,
                    ...(modeId === 'typing' && { wpm: currentWPM }),
                    ...(gameStyle === 'challenge' && { challengeTotalScore: capturedState.finalTotalChallengeScore }),
                };
                
                console.log('📤 FINAL SCORE DATA TO SUBMIT (using captured state):', scoreData);


                // Submit score asynchronously
                submitGameScore(scoreData).then(async (result) => {
                    if (result.success) {
                        
                        // Refresh personal best from database if new high score
                        if (result.isNewHighScore) {
                            try {
                                const response = await fetch(`/api/scores?gameMode=${modeId}&gameStyle=${gameStyle}`);
                                if (response.ok) {
                                    const refreshResult = await response.json();
                                    const scores = refreshResult.scores || [];
                                    if (scores.length > 0) {
                                        const newPersonalBest = Math.max(...scores.map((score: any) => score.score));
                                        setHighScore(newPersonalBest);
                                    }
                                }
                            } catch (error) {
                                console.error('Error refreshing personal best:', error);
                            }
                        }
                        
                        // Check for new milestones
                        const milestones = await checkMilestones(scoreData);
                        if (milestones.newMilestones.length > 0) {
                            // You can show milestone notifications here
                        }
                    } else {
                        console.error('Failed to submit score:', result.message);
                    }
                }).catch((error) => {
                    console.error('Error submitting score:', error);
                });
            }

            // Update mode-specific high scores
            if (modeId === 'typing') {
                if (currentWPM > (currentModeStats.bestWPM || 0)) {
                    newStats.bestWPM = currentWPM;
                }
            } else {
                // For non-typing modes, update high score and best time
                if (capturedState.finalWordsTypedCount > currentModeStats.highScore) {
                    newStats.highScore = capturedState.finalWordsTypedCount;
                    newStats.bestTime = finalTime;
                } else if (capturedState.finalWordsTypedCount === currentModeStats.highScore) {
                    // Same score but better time
                    const currentBestTimeInSeconds = currentModeStats.bestTime ? 
                        (currentModeStats.bestTime.minutes * 60 + currentModeStats.bestTime.seconds) : Infinity;
                    const newTimeInSeconds = finalTime.minutes * 60 + finalTime.seconds;
                    if (newTimeInSeconds < currentBestTimeInSeconds) {
                        newStats.bestTime = finalTime;
                    }
                }
            }

            // Apply the updates
            updateModeStats(modeId as 'echo' | 'memory' | 'typing', newStats);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, startTime, wordsTypedCount, highScore, modeId, difficultyId, gameStyle, totalChallengeScore, session]); // Remove store functions to prevent infinite loop


    // Focus input when Echo countdown starts (challenge mode)
    useEffect(() => {
        if (modeId === 'echo' && gameStyle === 'challenge' && timers.isEchoCountingDown && status === 'playing') {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [modeId, gameStyle, timers.isEchoCountingDown, status]);

    // รีเซ็ต speak again state เมื่อเปลี่ยนคำ
    useEffect(() => {
        setUsedSpeakAgain(false);
    }, [currentWordIndex, setUsedSpeakAgain]);

    // อัปเดต total words played เมื่อมีการเปลี่ยนคำ (ไม่นับครั้งแรกที่เกมเริ่ม)
    useEffect(() => {
        // ถ้าหากในระหว่างเล่นมีการเปลี่ยนarray เป็นคำศัพท์ใหม่ให้เพิ่ม total words played +1 เหมือนกัน
        // เพื่อให้แน่ใจว่า total words played จะถูกนับอย่างถูกต้อง
        if (words.length > 0 && words[currentWordIndex]?.word) {
            setTotalWordsPlayed(prev => prev + 1);
        }

    }, [currentWordIndex, setTotalWordsPlayed, words]);

    // รีเซ็ต total words played เมื่อเริ่มเกมใหม่หรือ restart
    useEffect(() => {
        if (status === 'countdown') {
            setTotalWordsPlayed(0);
        }
    }, [status]);

    const returnObject = {
        // State
        status, words, currentWordIndex, userInput, 
        score: wordsTypedCount, // For backward compatibility - this is actually words typed count for WPM calculation
        wordsTypedCount, // Clear name for what this actually represents
        lives, isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText, streakCount, bestStreak,
        totalChallengeScore, lastScoreCalculation, usedSpeakAgain, totalWordsPlayed,
        timeSpent, // Add timeSpent to return object
        databaseBestStreak, // Mode+style specific best streak from database
        bestWpmAllStyles, // Best WPM across all styles for typing mode
        bestStreakAllStyles, // Best streak across all styles for current mode
        
        // Timer state
        isEchoCountingDown: timers.isEchoCountingDown,
        echoTimeLeft: timers.echoTimeLeft,
        memoryTimeLeft: timers.memoryTimeLeft,
        
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
        handleHomeNavigation,
        
        // Timer functions
        setIsEchoCountingDown: timers.setIsEchoCountingDown,
        setEchoTimeLeft: timers.setEchoTimeLeft,
        setMemoryTimeLeft: timers.setMemoryTimeLeft,
        handleEchoTimeUp,
        handleMemoryTimeUp,
        handleEchoTimerReady: timers.handleEchoTimerReady,
        handleMemoryTimerReady: timers.handleMemoryTimerReady,
        handleEchoTimeLeftChange: timers.handleEchoTimeLeftChange,
        handleMemoryTimeLeftChange: timers.handleMemoryTimeLeftChange,

        // Store actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak, addChallengeScore, resetChallengeScore, globalCleanup,
        
        // DDA Actions
        updatePerformance: dda.handleDdaUpdate,
        resetDdaState: dda.resetDdaState,
        setCurrentDifficultyLevel: dda.setDifficultyLevel,
        setPerformanceScore: dda.setPerformanceScoreManually,

        // Echo mode state และ functions
        handleSpeakAgainUsed: useCallback((used: boolean) => {
            setUsedSpeakAgain(used);
        }, [setUsedSpeakAgain]),
        
        // Nitro Energy for Typing Challenge
        energy: nitroEnergy.energy,
        maxEnergy: nitroEnergy.maxEnergy,
        isLowEnergy: nitroEnergy.isLowEnergy,
        addEnergy: nitroEnergy.addEnergy,
        removeEnergy: nitroEnergy.removeEnergy,
        resetEnergy: nitroEnergy.resetEnergy,
        
        // Overdrive System for Typing Challenge
        heatLevel: overdriveSystem.currentHeatLevel,
        correctWordsCount: streakCount,
        isOverdriveTransitioning: overdriveSystem.isTransitioning,
    };

    return returnObject;
}
