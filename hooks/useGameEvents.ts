import { useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { getGameSessionWords } from '@/lib/words-new';
import { getDdaGameSessionWords } from '@/lib/ddaWords';

interface UseGameEventsProps {
    modeId: string;
    difficultyId: string;
    gameStyle: 'practice' | 'challenge';
    currentDifficultyLevel: number;
    playSound: (audioRef: React.RefObject<HTMLAudioElement | null>, volume?: number) => void;
    correctAudioRef: React.RefObject<HTMLAudioElement | null>;
    incorrectAudioRef: React.RefObject<HTMLAudioElement | null>;
    completedAudioRef: React.RefObject<HTMLAudioElement | null>;
    keypressAudioRef: React.RefObject<HTMLAudioElement | null>;
    handleDdaUpdate: (isCorrect: boolean, onComplete?: () => void) => { levelChanged: boolean; newDifficultyLevel: number };
    calculateAndAddScore: (isCorrect: boolean, echoTimeLeft: number, memoryTimeLeft: number, meaningMatchTimeLeft: number) => void;
    stopEchoTimer: () => void;
}

export function useGameEvents({
    modeId,
    difficultyId,
    gameStyle,
    currentDifficultyLevel,
    playSound,
    correctAudioRef,
    incorrectAudioRef,
    completedAudioRef,
    keypressAudioRef,
    handleDdaUpdate,
    calculateAndAddScore,
    stopEchoTimer,
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
        playSound(keypressAudioRef, 0.4);
        setUserInput(e.target.value);
        if (isWrong) setIsWrong(false);
        if (isCorrect) setIsCorrect(false);
    }, [playSound, keypressAudioRef, setUserInput, isWrong, isCorrect, setIsWrong, setIsCorrect]);

    // Handle form submit
    const handleFormSubmit = useCallback((
        e: React.FormEvent,
        echoTimeLeft: number,
        memoryTimeLeft: number,
        meaningMatchTimeLeft: number
    ) => {
        e.preventDefault();
        
        // Block submission during any type of transition
        if (!userInput.trim() || isTransitioning) return;

        // Stop Echo timer immediately when answer is submitted
        stopEchoTimer();

        const isAnswerCorrect = userInput.trim().toLowerCase() === words[currentWordIndex]?.word.toLowerCase();

        // Update DDA Performance (except for meaning-match mode)
        // This might trigger DDA transition which will block further actions
        const ddaResult = handleDdaUpdate(isAnswerCorrect);

        // Calculate challenge mode score if in challenge mode and answered correctly
        calculateAndAddScore(isAnswerCorrect, echoTimeLeft, memoryTimeLeft, meaningMatchTimeLeft);

        // For typing mode, check if DDA level changed
        if (modeId === 'typing') {
            // For typing mode, check if DDA level changed
            if (currentWordIndex === words.length - 1 && difficultyId !== 'endless' && difficultyId !== 'dda') {
                setStatus('gameOver');
                return;
            }
            
            if (isAnswerCorrect) {
                playSound(correctAudioRef);
                setScore((prev) => prev + 1);
                setIsCorrect(true);
                incrementStreak();
            } else {
                playSound(incorrectAudioRef);
                setIsWrong(true);
                setScore((prev) => Math.max(prev - 1, 0));
                addIncorrectWord({ correct: words[currentWordIndex]?.word || '', incorrect: userInput.trim() });
                resetStreak();
            }

            // Check if DDA level changed - if so, don't handle word progression here
            // DDA system will handle word replacement and index reset automatically
            if (ddaResult.levelChanged && difficultyId === 'dda' && gameStyle === 'challenge') {
                // DDA transition is happening - set transition state and let DDA handle the rest
                setIsTransitioning(true);
                
                // Clear input immediately but let DDA handle word/index changes
                setUserInput('');
                return;
            }

            // Normal word progression (no DDA level change)
            if ((difficultyId === 'endless' || difficultyId === 'dda') && currentWordIndex === words.length - 1) {
                let reshuffledWords;
                if (difficultyId === 'dda' && gameStyle === 'challenge' && (modeId as string) !== 'meaning-match') {
                    reshuffledWords = getDdaGameSessionWords(currentDifficultyLevel);
                } else {
                    reshuffledWords = getGameSessionWords(difficultyId);
                }
                setWords(reshuffledWords);
                setCurrentWordIndex(0);
            } else {
                incrementWordIndex();
            }
            setUserInput('');
            return;
        }

        // For non-typing modes (echo, memory, meaning-match), use transition pattern
        setIsTransitioning(true);
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

            if (newLives <= 0 || (isLastWord && difficultyId !== 'endless' && difficultyId !== 'dda')) {
                playSound(completedAudioRef, 0.5);
                setStatus('gameOver');
                return;
            }
            
        
            if ((difficultyId === 'endless' || difficultyId === 'dda') && isLastWord) {
                let reshuffledWords;
                if (difficultyId === 'dda' && gameStyle === 'challenge' && (modeId as string) !== 'meaning-match') {

                    reshuffledWords = getDdaGameSessionWords(currentDifficultyLevel);
                } else {
                    reshuffledWords = getGameSessionWords(difficultyId);
                }
                setWords(reshuffledWords);
                setCurrentWordIndex(0);
            } else {
                incrementWordIndex();
            }
            setUserInput('');
            setIsWrong(false);
            setIsCorrect(false);
            setIsTransitioning(false);
        }, 1200);
    }, [
        userInput, isTransitioning, modeId, gameStyle, words, currentWordIndex, 
        difficultyId, lives, currentDifficultyLevel, playSound, correctAudioRef, 
        incorrectAudioRef, completedAudioRef, setStatus, setScore, setIsCorrect, 
        incrementStreak, setIsWrong, addIncorrectWord, resetStreak, setWords, 
        setCurrentWordIndex, incrementWordIndex, setUserInput, setLives, 
        setIsTransitioning, handleDdaUpdate, calculateAndAddScore, stopEchoTimer
    ]);

    return {
        handleUserInputChange,
        handleFormSubmit
    };
}
