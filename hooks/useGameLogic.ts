import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { calculateEchoModeScore, calculateTotalScore } from '@/lib/scoring';
import { getGameSessionWords } from '@/lib/words-new';
import { registerAudioRef, unregisterAudioRef } from '@/lib/cleanup';

interface UseGameLogicProps {
    modeId: string;
    difficultyId: string;
    gameStyle: 'practice' | 'challenge';
}

export function useGameLogic({ modeId, difficultyId, gameStyle }: UseGameLogicProps) {
    const {
        // State
        status, words, currentWordIndex, userInput, score, lives,
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
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const echoStopTimerRef = useRef<(() => void) | null>(null);
    const scoreBreakdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio refs
    const keypressAudioRef = useRef<HTMLAudioElement | null>(null);
    const correctAudioRef = useRef<HTMLAudioElement | null>(null);
    const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
    const completedAudioRef = useRef<HTMLAudioElement | null>(null);
    const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

    // State
    const [isEchoCountingDown, setIsEchoCountingDown] = useState(false);
    const [echoTimeLeft, setEchoTimeLeft] = useState(5.0);
    const [memoryTimeLeft, setMemoryTimeLeft] = useState(5.0);
    const [meaningMatchTimeLeft, setMeaningMatchTimeLeft] = useState(5.0);
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

    // Audio functions
    const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>, volume = 0.7) => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error(`Error playing sound: ${e}`));
        }
    }, []);

    // Speech function
    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.6;

            currentUtteranceRef.current = utterance;

            utterance.onend = () => {
                if (onEnd) {
                    onEnd();
                }
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            };

            window.speechSynthesis.speak(utterance);
            return utterance;
        } else {
            inputRef.current?.focus();
            return null;
        }
    }, []);

    // Event handlers
    const handleUserInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        playSound(keypressAudioRef, 0.4);
        setUserInput(e.target.value);
        if (isWrong) setIsWrong(false);
        if (isCorrect) setIsCorrect(false);
    }, [playSound, setUserInput, isWrong, isCorrect, setIsWrong, setIsCorrect]);

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTransitioning) return;

        // Stop Echo timer immediately when answer is submitted
        if (modeId === 'echo' && gameStyle === 'challenge' && echoStopTimerRef.current) {
            echoStopTimerRef.current();
        }

        const isAnswerCorrect = userInput.trim().toLowerCase() === words[currentWordIndex]?.word.toLowerCase();

        // Calculate challenge mode score if in challenge mode and answered correctly
        if (gameStyle === 'challenge' && isAnswerCorrect) {
            let scoreCalculation;

            if (modeId === 'echo') {
                scoreCalculation = calculateEchoModeScore(echoTimeLeft, difficultyId, streakCount, true);
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
        }

        if (modeId === 'typing') {
            if (currentWordIndex === words.length - 1 && difficultyId !== 'endless') {
                setStatus('gameOver');
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

            if (difficultyId === 'endless' && currentWordIndex === words.length - 1) {
                const reshuffledWords = getGameSessionWords(difficultyId);
                setWords(reshuffledWords);
                setCurrentWordIndex(0);
            } else {
                incrementWordIndex();
            }
            setUserInput('');
            return;
        }

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

            if (newLives <= 0 || (isLastWord && difficultyId !== 'endless')) {
                playSound(completedAudioRef, 0.5);
                setStatus('gameOver');
                return;
            }

            if (difficultyId === 'endless' && isLastWord) {
                const reshuffledWords = getGameSessionWords(difficultyId);
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
    }, [userInput, isTransitioning, modeId, gameStyle, words, currentWordIndex, echoTimeLeft, memoryTimeLeft, meaningMatchTimeLeft, difficultyId, streakCount, lives, playSound, setStatus, setScore, setIsCorrect, incrementStreak, setIsWrong, addIncorrectWord, resetStreak, setWords, setCurrentWordIndex, incrementWordIndex, setUserInput, setLives, setIsTransitioning, addChallengeScore]);

    const handleRestartGame = useCallback(() => {
        const sessionWords = getGameSessionWords(difficultyId);
        resetGame();
        setWords(sessionWords);
        if (gameStyle === 'challenge') {
            resetChallengeScore();
        }
    }, [difficultyId, resetGame, setWords, gameStyle, resetChallengeScore]);

    // Common time up logic for all modes
    const handleTimeUpCommon = useCallback(() => {
        setIsTransitioning(true);
        setIsWrong(true);
        addIncorrectWord({ correct: words[currentWordIndex].word, incorrect: '(Time up)' });
        resetStreak();
        playSound(incorrectAudioRef, 0.8);

        setTimeout(() => {
            const newLives = lives - 1;
            const isLastWord = currentWordIndex === words.length - 1;

            if (newLives <= 0 || (isLastWord && difficultyId !== 'endless')) {
                playSound(completedAudioRef, 0.5);
                setStatus('gameOver');
                return;
            }

            // Handle endless mode - reshuffle words when reaching the end
            if (difficultyId === 'endless' && isLastWord) {
                const reshuffledWords = getGameSessionWords(difficultyId);
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
    }, [lives, currentWordIndex, words, difficultyId, playSound, setStatus, setIsTransitioning, setIsWrong, addIncorrectWord, resetStreak, setWords, setCurrentWordIndex, incrementWordIndex, setLives, setUserInput, setIsCorrect]);

    // Handle time up for Echo mode challenge
    const handleEchoTimeUp = useCallback(() => {
        if (modeId === 'echo' && gameStyle === 'challenge') {
            // Calculate score for wrong answer (time up)
            const scoreCalculation = calculateEchoModeScore(0, difficultyId, streakCount, false);
            console.log(`Time up! No score added. Calculation: ${scoreCalculation.finalScore}`);

            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, difficultyId, streakCount, handleTimeUpCommon]);

    // Handle time up for Memory mode challenge
    const handleMemoryTimeUp = useCallback(() => {
        if (modeId === 'memory' && gameStyle === 'challenge') {
            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, handleTimeUpCommon]);

    // Handle time up for Meaning Match mode challenge
    const handleMeaningMatchTimeUp = useCallback(() => {
        if (modeId === 'meaning-match' && gameStyle === 'challenge') {
            const scoreCalculation = calculateTotalScore(5.0, difficultyId, streakCount, false);
            console.log(`Meaning Match time up! No score added. Calculation: ${scoreCalculation.finalScore}`);

            handleTimeUpCommon();
        }
    }, [modeId, gameStyle, difficultyId, streakCount, handleTimeUpCommon]);

    // Function to handle timer ready from EchoMode
    const handleEchoTimerReady = useCallback((stopTimer: () => void) => {
        echoStopTimerRef.current = stopTimer;
    }, []);

    // Function to handle time left change from EchoMode
    const handleEchoTimeLeftChange = useCallback((timeLeft: number) => {
        setEchoTimeLeft(timeLeft);
    }, []);

    // Function to handle time left change from MemoryMode
    const handleMemoryTimeLeftChange = useCallback((timeLeft: number) => {
        setMemoryTimeLeft(timeLeft);
    }, []);

    // Function to handle time left change from MeaningMatchMode
    const handleMeaningMatchTimeLeftChange = useCallback((timeLeft: number) => {
        setMeaningMatchTimeLeft(timeLeft);
    }, []);

    // Initialize audio
    useEffect(() => {
        keypressAudioRef.current = new Audio('/sounds/keypress.mp3');
        correctAudioRef.current = new Audio('/sounds/correct.mp3');
        incorrectAudioRef.current = new Audio('/sounds/incorrect.mp3');
        completedAudioRef.current = new Audio('/sounds/completed.wav');
        countdownAudioRef.current = new Audio('/sounds/countdown.mp3');

        // Register audio refs for cleanup
        registerAudioRef(keypressAudioRef);
        registerAudioRef(correctAudioRef);
        registerAudioRef(incorrectAudioRef);
        registerAudioRef(completedAudioRef);
        registerAudioRef(countdownAudioRef);

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const sessionWords = getGameSessionWords(difficultyId);
        initializeGame(sessionWords);
        if (gameStyle === 'challenge') {
            resetChallengeScore();
        }
        inputRef.current?.focus();

        return () => {
            unregisterAudioRef(keypressAudioRef);
            unregisterAudioRef(correctAudioRef);
            unregisterAudioRef(incorrectAudioRef);
            unregisterAudioRef(completedAudioRef);
            unregisterAudioRef(countdownAudioRef);
            
            if (scoreBreakdownTimerRef.current) {
                clearTimeout(scoreBreakdownTimerRef.current);
            }
        };
    }, [difficultyId, initializeGame, gameStyle, resetChallengeScore]);

    // Countdown logic
    useEffect(() => {
        if (status === 'countdown') {
            // Clear any pending speech synthesis before countdown starts
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }

            setCountdown(3);
            playSound(countdownAudioRef, 0.5);
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
    }, [status, playSound, setCountdown, setStatus]);

    // Speak word in Echo mode
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'echo') {
            // Clear any pending speech synthesis before speaking new word
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }

            speak(words[currentWordIndex].word);
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, words, speak, modeId]);

    // Logic for Memory Mode word flashing
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'memory') {
            setIsWordVisible(true);
            setPromptText('Memorize...');
            if (inputRef.current) inputRef.current.disabled = true;

            const timer = setTimeout(() => {
                setIsWordVisible(false);
                setPromptText('Now type!');
                if (inputRef.current) {
                    inputRef.current.disabled = false;
                    inputRef.current.focus();
                }
            }, 2000); // MEMORY_MODE_FLASH_DURATION

            return () => clearTimeout(timer);
        }
    }, [status, currentWordIndex, words, modeId, setIsWordVisible, setPromptText]);

    // Refocus logic for typing and meaning-match modes
    useEffect(() => {
        if (status === 'playing' && (modeId === 'typing' || modeId === 'meaning-match')) {
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, modeId]);

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
    }, [modeId, difficultyId, setHighScore]);

    // Start timer
    useEffect(() => {
        if (status === 'playing' && !startTime) {
            setStartTime(new Date());
        }
    }, [status, startTime, setStartTime]);

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
                const wordsPerMinute = Math.round(score / timeInMinutes);
                setWpm(wordsPerMinute);
            }

            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem(`highScoreData_${modeId}_${difficultyId}`, JSON.stringify({ score: score, time: finalTime }));
            }

            if (gameStyle === 'challenge') {
                const challengeHighScoreKey = `challengeHighScore_${modeId}_${difficultyId}`;
                const currentChallengeHighScore = parseInt(localStorage.getItem(challengeHighScoreKey) || '0');
                if (totalChallengeScore > currentChallengeHighScore) {
                    localStorage.setItem(challengeHighScoreKey, totalChallengeScore.toString());
                }
            }
        }
    }, [status, startTime, score, highScore, modeId, difficultyId, setTimeSpent, setWpm, setHighScore, gameStyle, totalChallengeScore]);

    // Count-up timer for non-typing modes
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        if (status === 'playing' && startTime && modeId !== 'typing') {
            timerInterval = setInterval(() => {
                const now = new Date();
                const timeDiff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setCurrentTime({ minutes: Math.floor(timeDiff / 60), seconds: timeDiff % 60 });
            }, 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [status, startTime, modeId, setCurrentTime]);

    // Countdown timer for Typing Mode
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        if (status === 'playing' && modeId === 'typing') {
            timerInterval = setInterval(() => {
                const newTimeLeft = decrementTimeLeft();
                if (newTimeLeft <= 0) {
                    clearInterval(timerInterval);
                    setStatus('gameOver');
                    playSound(completedAudioRef, 0.5);
                }
            }, 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [status, modeId, playSound, decrementTimeLeft, setStatus]);

    // Focus input when Echo countdown starts (challenge mode)
    useEffect(() => {
        if (modeId === 'echo' && gameStyle === 'challenge' && isEchoCountingDown && status === 'playing') {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [modeId, gameStyle, isEchoCountingDown, status]);

    return {
        // State
        status, words, currentWordIndex, userInput, score, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText, streakCount,
        totalChallengeScore, lastScoreCalculation,
        isEchoCountingDown, echoTimeLeft, memoryTimeLeft, meaningMatchTimeLeft, showScoreBreakdown,

        // Refs
        inputRef, currentUtteranceRef, echoStopTimerRef, scoreBreakdownTimerRef,
        keypressAudioRef, correctAudioRef, incorrectAudioRef, completedAudioRef, countdownAudioRef,

        // Functions
        speak, playSound, handleUserInputChange, handleFormSubmit, handleRestartGame,
        setIsEchoCountingDown, setEchoTimeLeft, setMemoryTimeLeft, setMeaningMatchTimeLeft,
        handleEchoTimeUp, handleMemoryTimeUp, handleMeaningMatchTimeUp,
        handleEchoTimerReady, handleEchoTimeLeftChange, handleMemoryTimeLeftChange, handleMeaningMatchTimeLeftChange,

        // Store actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak, addChallengeScore, resetChallengeScore
    };
}
