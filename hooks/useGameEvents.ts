import { useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';

import { getDdaGameSessionWords } from '@/lib/ddaWords';

interface UseGameEventsProps {
    modeId: string;
    currentDifficultyLevel: number;
    playSound: (audioRef: React.RefObject<HTMLAudioElement | null>, volume?: number) => void;
    correctAudioRef: React.RefObject<HTMLAudioElement | null>;
    incorrectAudioRef: React.RefObject<HTMLAudioElement | null>;
    completedAudioRef: React.RefObject<HTMLAudioElement | null>;
    handleDdaUpdate: (isCorrect: boolean, onComplete?: () => void) => { levelChanged: boolean; newDifficultyLevel: number };
    calculateAndAddScore: (isCorrect: boolean, echoTimeLeft: number, memoryTimeLeft: number, currentWord?: string) => void;
    stopEchoTimer: () => void;
    stopMemoryTimer: () => void;
    // Nitro energy functions
    addEnergy?: (wordLength: number) => void;
    removeEnergy?: () => void;
}

export function useGameEvents({
    modeId,
    currentDifficultyLevel,
    playSound,
    correctAudioRef,
    incorrectAudioRef,
    completedAudioRef,
    handleDdaUpdate,
    calculateAndAddScore,
    stopEchoTimer,
    stopMemoryTimer,
    addEnergy,
    removeEnergy,
}: UseGameEventsProps) {
    const {
        userInput,
        words,
        currentWordIndex,
        lives,
        isTransitioning,
        isWrong,
        isCorrect,
        setUserInput,
        setScore,
        setLives,
        setIsWrong,
        setIsCorrect,
        setIsTransitioning,
        setStatus,
        setWords,
        setCurrentWordIndex,
        incrementWordIndex,
        addIncorrectWord,
        incrementStreak,
        resetStreak
    } = useGameStore();

    // Handle user input change
    const handleUserInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
        if (isWrong) setIsWrong(false);
        if (isCorrect) setIsCorrect(false);
    }, [setUserInput, isWrong, isCorrect, setIsWrong, setIsCorrect]);

    // Handle form submit
    const handleFormSubmit = useCallback((
        e: React.FormEvent,
        echoTimeLeft: number,
        memoryTimeLeft: number
    ) => {
        e.preventDefault();
        
        // Block submission during any type of transition
        if (!userInput.trim() || isTransitioning) return;

        // Immediately set transitioning to prevent spam submissions
        setIsTransitioning(true);

        // Stop Echo timer immediately when answer is submitted
        stopEchoTimer();
        
        // Stop Memory timer immediately when answer is submitted  
        stopMemoryTimer();

        const isAnswerCorrect = userInput.trim().toLowerCase() === words[currentWordIndex]?.word.toLowerCase();

        // Update DDA Performance
        // This might trigger DDA transition which will block further actions
        const ddaResult = handleDdaUpdate(isAnswerCorrect);

        // Calculate challenge mode score if in challenge mode and answered correctly
        calculateAndAddScore(isAnswerCorrect, echoTimeLeft, memoryTimeLeft, words[currentWordIndex]?.word);


        // For typing mode, handle word progression with DDA
        if (modeId === 'typing') {
            
            if (isAnswerCorrect) {
                playSound(correctAudioRef);
                setScore((prev) => prev + 1);
                setIsCorrect(true);
                incrementStreak();
                
                // Add energy for correct answer in Typing Challenge
                if (addEnergy) {
                    addEnergy(words[currentWordIndex]?.word.length || 0);
                }
            } else {
                playSound(incorrectAudioRef);
                setIsWrong(true);
                setScore((prev) => Math.max(prev - 1, 0));
                addIncorrectWord({ correct: words[currentWordIndex]?.word || '', incorrect: userInput.trim() });
                resetStreak();
                
                // Remove energy for wrong answer in Typing Challenge
                if (removeEnergy) {
                    removeEnergy();
                }
            }

            // Handle DDA word progression 
            if (ddaResult.levelChanged) {
                // DDA level changed - let the DDA system handle transitions
                // Don't interfere with the natural DDA flow
                // The useDDA hook will handle setIsTransitioning(false)
            } else {
                // No level change - handle normal word progression
                if (currentWordIndex === words.length - 1) {
                    // Use DDA words for both challenge and practice modes
                    try {
                        const reshuffledWords = getDdaGameSessionWords(currentDifficultyLevel);
                        if (reshuffledWords && reshuffledWords.length > 0) {
                            setWords(reshuffledWords);
                            setCurrentWordIndex(0);
                        } else {
                            console.error('❌ No words available for typing mode reshuffle, ending game');
                            setStatus('gameOver');
                            setIsTransitioning(false);
                            setUserInput('');
                            return;
                        }
                    } catch (error) {
                        console.error('❌ Error reshuffling words in typing mode:', error);
                        setStatus('gameOver');
                        setIsTransitioning(false);
                        setUserInput('');
                        return;
                    }
                } else {
                    // Normal word progression - increment to next word
                    incrementWordIndex();
                }
                // Always reset transition for typing mode when no DDA level change
                setIsTransitioning(false);
            }
            
            setUserInput('');
            return;
        }

        // For non-typing modes (echo, memory), use transition pattern

        if (isAnswerCorrect) {
            playSound(correctAudioRef);
            setScore((prev) => prev + 1);
            setIsCorrect(true);
            incrementStreak();
        } else {
            playSound(incorrectAudioRef);
            setLives((prev) => prev - 1);
            setIsWrong(true);
            addIncorrectWord({ correct: words[currentWordIndex]?.word || '', incorrect: userInput.trim() });
            resetStreak();
        }

        setTimeout(() => {
            const newLives = isAnswerCorrect ? lives : lives - 1;
            const isLastWord = currentWordIndex === words.length - 1;

            if (newLives <= 0) {
                // Only play completed sound for typing mode
                // Echo and Memory modes will play sound in GameOverOverlay
                if (modeId === 'typing') {
                    playSound(completedAudioRef, 0.5);
                }
                setStatus('gameOver');
                setIsTransitioning(false); // Ensure we exit transition state
                return;
            }
            
            // Handle word progression for Echo and Memory modes
            if (isLastWord) {
                // Use DDA words for both challenge and practice modes
                try {
                    const reshuffledWords = getDdaGameSessionWords(currentDifficultyLevel);
                    if (reshuffledWords && reshuffledWords.length > 0) {
                        setWords(reshuffledWords);
                        setCurrentWordIndex(0);
                    } else {
                        console.error('❌ No words available for reshuffle, ending game');
                        setStatus('gameOver');
                        setIsTransitioning(false);
                        return;
                    }
                } catch (error) {
                    console.error('❌ Error reshuffling words:', error);
                    setStatus('gameOver');
                    setIsTransitioning(false);
                    return;
                }
            } else {
                incrementWordIndex();
            }
            
            setUserInput('');
            setIsWrong(false);
            setIsCorrect(false);
            setIsTransitioning(false);
        }, 1200);
    }, [
        userInput, isTransitioning, modeId, words, currentWordIndex, 
        lives, currentDifficultyLevel, playSound, correctAudioRef, 
        incorrectAudioRef, completedAudioRef, setStatus, setScore, setIsCorrect, 
        incrementStreak, setIsWrong, addIncorrectWord, resetStreak, setWords, 
        setCurrentWordIndex, incrementWordIndex, setUserInput, setLives, 
        setIsTransitioning, handleDdaUpdate, calculateAndAddScore, stopEchoTimer, stopMemoryTimer,
        addEnergy, removeEnergy
    ]);

    return {
        handleUserInputChange,
        handleFormSubmit
    };
}
