"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getGameSessionWords } from '@/lib/words-new';
import { useGameStore } from '@/lib/stores/gameStore';
import { globalCleanup, stopCountdownAudio, registerAudioRef, unregisterAudioRef } from '@/lib/cleanup';
import { FaHeart, FaRegHeart, FaArrowLeft } from 'react-icons/fa';
import StreakDisplay from '@/components/game/StreakDisplay';
import StreakCelebration from '@/components/game/StreakCelebration';
import CountdownToGame from '@/components/game/CountdownToGame';
import GameOver from '@/components/game/GameOver';
import EchoMode from '@/components/game/modes/EchoMode';
import TypingMode from '@/components/game/modes/TypingMode';
import MeaningMatchMode from '@/components/game/modes/MeaningMatchMode';
import MemoryMode from '@/components/game/modes/MemoryMode';
import GameInput from '@/components/game/GameInput';
import GameEffects from '@/components/game/GameEffects';

// Configs
const TYPING_MODE_DURATION = 60; // 60 seconds
const MEMORY_MODE_FLASH_DURATION = 2000; // 2 seconds

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const { modeId, difficultyId } = params as { modeId: string, difficultyId: string };
    
    // Get game style from URL search params
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const gameStyle = searchParams.get('style') as 'practice' | 'challenge' || 'practice';

    // Zustand store
    const {
        // State
        status, words, currentWordIndex, userInput, score, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime,
        currentTime, highScore, isWordVisible, promptText,

        // Actions
        setStatus, setCountdown, setWords, setCurrentWordIndex, setUserInput,
        setScore, setLives, setIsWrong, setIsCorrect, setIsTransitioning,
        setStartTime, setTimeSpent, setCurrentTime, setHighScore,
        setWpm, setIsWordVisible, setPromptText,
        incrementWordIndex, decrementTimeLeft, addIncorrectWord, resetGame, initializeGame,
        incrementStreak, resetStreak
    } = useGameStore();

    const inputRef = useRef<HTMLInputElement>(null);


    // Audio refs
    const keypressAudioRef = useRef<HTMLAudioElement | null>(null);
    const correctAudioRef = useRef<HTMLAudioElement | null>(null);
    const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
    const completedAudioRef = useRef<HTMLAudioElement | null>(null);
    const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

    // Speech utterance ref for Echo mode
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    
    // Add state to track Echo mode countdown (to disable input during speech)
    const [isEchoCountingDown, setIsEchoCountingDown] = useState(false);
    
    // Add ref to store the stop timer function from EchoMode
    const echoStopTimerRef = useRef<(() => void) | null>(null);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // Cancel any ongoing speech before starting new one
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.6;

            // Store current utterance reference
            currentUtteranceRef.current = utterance;

            // เมื่อเสียงพูดจบ ให้เรียก onEnd (ถ้ามี)
            utterance.onend = () => {
                if (onEnd) {
                    onEnd();
                }
                // Focus ที่ input หลังจาก countdown เริ่ม (delay สั้นๆ)
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            };

            window.speechSynthesis.speak(utterance);
            return utterance;
        } else {
           // ถ้า browser ไม่รองรับ ให้ focus ทันที
           inputRef.current?.focus();
           return null;
        }
  }, []);

    const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>, volume = 0.7) => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error(`Error playing sound: ${e}`));
        }
    }, []);

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

        // Clear any pending speech synthesis when component initializes
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const sessionWords = getGameSessionWords(difficultyId);
        initializeGame(sessionWords);
        inputRef.current?.focus();

        // Cleanup function to unregister audio refs
        return () => {
            unregisterAudioRef(keypressAudioRef);
            unregisterAudioRef(correctAudioRef);
            unregisterAudioRef(incorrectAudioRef);
            unregisterAudioRef(completedAudioRef);
            unregisterAudioRef(countdownAudioRef);
        };
    }, [difficultyId, initializeGame]);

    useEffect(() => {
        if (status === 'countdown') {
            // Clear any pending speech synthesis before countdown starts
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            
            // Stop any existing countdown audio
            stopCountdownAudio();
            
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
                // Stop countdown audio when leaving countdown state
                stopCountdownAudio();
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

    // --- NEW: Logic for Memory Mode word flashing ---
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
            }, MEMORY_MODE_FLASH_DURATION);

            return () => clearTimeout(timer);
        }
    }, [status, currentWordIndex, words, modeId, setIsWordVisible, setPromptText]);


    // --- NEW: Refocus logic for typing and meaning-match modes ---
    useEffect(() => {
        if (status === 'playing' && (modeId === 'typing' || modeId === 'meaning-match')) {
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, modeId]); // Refocus when word changes


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

    useEffect(() => {
        if (status === 'playing' && !startTime) {
            setStartTime(new Date());
        }
    }, [status, startTime, setStartTime]);

    useEffect(() => {
        if (status === 'gameOver' && startTime) {
            const finalTime = modeId === 'typing'
                ? { minutes: Math.floor(TYPING_MODE_DURATION / 60), seconds: TYPING_MODE_DURATION % 60 }
                : { minutes: Math.floor(((new Date().getTime() - startTime.getTime()) / 1000) / 60), seconds: Math.floor(((new Date().getTime() - startTime.getTime()) / 1000) % 60) };

            setTimeSpent(finalTime);

            // Calculate WPM for typing mode
            if (modeId === 'typing') {
                const timeInMinutes = TYPING_MODE_DURATION / 60; // 1 minute for 60 seconds
                const wordsPerMinute = Math.round(score / timeInMinutes);
                setWpm(wordsPerMinute);
            }

            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem(`highScoreData_${modeId}_${difficultyId}`, JSON.stringify({ score: score, time: finalTime }));
            }
        }
    }, [status, startTime, score, highScore, modeId, difficultyId, setTimeSpent, setWpm, setHighScore]);

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

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        playSound(keypressAudioRef, 0.4);
        setUserInput(e.target.value);
        if (isWrong) setIsWrong(false);
        if (isCorrect) setIsCorrect(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTransitioning) return;

        // Stop Echo timer immediately when answer is submitted
        if (modeId === 'echo' && gameStyle === 'challenge' && echoStopTimerRef.current) {
            echoStopTimerRef.current();
        }

        const isCorrect = userInput.trim().toLowerCase() === words[currentWordIndex].word.toLowerCase();

        if (modeId === 'typing') {
            if (currentWordIndex === words.length - 1 && difficultyId !== 'endless') {
                setStatus('gameOver');
            }
            if (isCorrect) {
                playSound(correctAudioRef);
                setScore((prev) => prev + 1);
                setIsCorrect(true);
                incrementStreak(); // Add streak increment for correct answer
            } else {
                playSound(incorrectAudioRef);
                setIsWrong(true);
                setScore((prev) => Math.max(prev - 1, 0)); // Ensure score doesn't go below 0
                addIncorrectWord({ correct: words[currentWordIndex].word, incorrect: userInput.trim() });
                resetStreak(); // Reset streak for incorrect answer
            }

            // Handle endless mode - reshuffle words when reaching the end
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
        if (isCorrect) {
            playSound(correctAudioRef);
            setScore((prev) => prev + 1);
            setIsCorrect(true);
            incrementStreak(); // Add streak increment for correct answer
        } else {
            playSound(incorrectAudioRef);
            setLives((prev) => prev - 1);
            setIsWrong(true);
            addIncorrectWord({ correct: words[currentWordIndex].word, incorrect: userInput.trim() });
            resetStreak(); // Reset streak for incorrect answer
        }

        setTimeout(() => {
            const newLives = isCorrect ? lives : lives - 1;
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
            setUserInput('');
            setIsWrong(false);
            setIsCorrect(false);
            setIsTransitioning(false);
        }, 1200);
    };

    const handleRestartGame = () => {
        const sessionWords = getGameSessionWords(difficultyId);
        resetGame();
        setWords(sessionWords);
    };

    const handleGoBack = () => {
        // Clean up everything before going back
        globalCleanup();
        resetGame();
        setWords([]);
        router.back();
    };

    // Handle time up for Echo mode challenge
    const handleEchoTimeUp = () => {
        if (modeId === 'echo' && gameStyle === 'challenge') {
            // Treat as wrong answer when time runs out
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
        }
    };

    // Focus input when Echo countdown starts (challenge mode)
    useEffect(() => {
        if (modeId === 'echo' && gameStyle === 'challenge' && isEchoCountingDown && status === 'playing') {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [modeId, gameStyle, isEchoCountingDown, status]);

    // Function to handle timer ready from EchoMode
    const handleEchoTimerReady = useCallback((stopTimer: () => void) => {
        echoStopTimerRef.current = stopTimer;
    }, []);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            // Clean up everything when component unmounts
            globalCleanup();
        };
    }, []);

    const renderLives = () => (
        <div className="flex items-center space-x-1 text-xl sm:text-2xl">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 1 }}
                    animate={{
                        scale: i < lives ? 1 : 0.8,
                        opacity: i < lives ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.2 }}
                >
                    {i < lives ? (
                        <FaHeart className="text-red-500 drop-shadow-lg" />
                    ) : (
                        <FaRegHeart className="text-red-500/50" />
                    )}
                </motion.div>
            ))}
        </div>
    );

    if (status === 'countdown' || status === 'gameOver' || !words || words.length === 0) {
        // Keep the existing render logic for these states
        if (status === 'countdown') {
            return (
                <CountdownToGame />
            );
        }
        if (status === 'gameOver') {
            return (
                <GameOver
                    modeId={modeId}
                    words={words}
                    difficultyId={difficultyId}
                    handleRestartGame={handleRestartGame}
                />
            );
        }
        return <main className="flex items-center justify-center min-h-screen bg-[#101010] text-white">Loading...</main>;
    }

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-10 px-4 overflow-hidden relative">

            {/* Header Container */}
            <div className="flex flex-col items-center w-full shrink-0 relative z-10">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-xl lg:max-w-7xl px-4 mt-6 relative z-10"
                >
                    <motion.button
                        onClick={handleGoBack}
                        className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 group py-3 px-4 -mx-4 rounded-lg hover:bg-white/5"
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaArrowLeft className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                        <span
                            className="text-lg font-medium group-hover:text-red-400 transition-colors duration-300"
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                        >
                            Back
                        </span>
                    </motion.button>
                </motion.div>

                {/* Game Info Section - Hearts and Word Count */}
                <section className="w-full flex justify-between items-center pt-6 px-6 sm:px-8 max-w-6xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-left"
                    >
                        <p className="text-sm sm:text-base lg:text-lg font-bold">Word: {currentWordIndex + 1} </p>
                        <p className="text-xs sm:text-sm uppercase text-blue-300 font-medium">{difficultyId}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-right"
                    >
                        {modeId !== 'typing' ? (
                            <motion.div
                                animate={{ scale: lives <= 1 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: lives <= 1 ? Infinity : 0 }}
                            >
                                {renderLives()}
                            </motion.div>
                        ) : (
                            <motion.div
                                className={`text-2xl sm:text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`}
                                animate={{ scale: timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                            >
                                {timeLeft}s
                            </motion.div>
                        )}
                        <p className="text-xl mt-1 font-medium">{score} Score</p>
                    </motion.div>
                </section>
            </div>

            {/* Ultra Compact Timer Display for Non-Typing Modes */}
            {modeId !== 'typing' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center items-center py-1 relative z-10 shrink-0"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300 text-center"
                    >
                        {String(currentTime.minutes).padStart(2, '0')}:{String(currentTime.seconds).padStart(2, '0')}
                    </motion.div>
                </motion.div>
            )}

            {/* Streak Display - Center with more spacing */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center items-center py-6 relative z-10 shrink-0"
            >
                <StreakDisplay />
            </motion.div>

            <section className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-3 py-2 min-h-0 overflow-hidden md:w-3/4 lg:w-2/3 xl:w-1/2">
                {/* Mode-Specific Content Components */}
                {modeId === 'echo' && (
                    <EchoMode
                        currentWord={words[currentWordIndex].word}
                        isTransitioning={isTransitioning}
                        onSpeak={speak}
                        gameStyle={gameStyle}
                        currentWordIndex={currentWordIndex}
                        onTimeUp={handleEchoTimeUp}
                        speechUtterance={currentUtteranceRef.current}
                        onCountdownChange={setIsEchoCountingDown}
                        onTimerReady={handleEchoTimerReady}
                    />
                )}

                {modeId === 'typing' && (
                    <TypingMode
                        currentWord={words[currentWordIndex].word}
                        currentWordIndex={currentWordIndex}
                    />
                )}

                {modeId === 'meaning-match' && (
                    <MeaningMatchMode
                        currentWordMeaning={words[currentWordIndex].meaning}
                        currentWordIndex={currentWordIndex}
                    />
                )}

                {modeId === 'memory' && (
                    <MemoryMode
                        currentWord={words[currentWordIndex].word}
                        currentWordIndex={currentWordIndex}
                        isWordVisible={isWordVisible}
                        promptText={promptText}
                    />
                )}

                {/* Game Input Component */}
                <GameInput
                    ref={inputRef}
                    userInput={userInput}
                    onInputChange={handleUserInputChange}
                    onSubmit={handleFormSubmit}
                    isWrong={isWrong}
                    isCorrect={isCorrect}
                    isTransitioning={isTransitioning}
                    isDisabled={(isTransitioning || (modeId === 'memory' && isWordVisible) || (modeId === 'echo' && gameStyle === 'challenge' && !isEchoCountingDown)) && modeId !== 'typing'}
                    currentWordIndex={currentWordIndex}
                />

                {/* Game Effects Component */}
                <GameEffects
                    isCorrect={isCorrect}
                    isWrong={isWrong}
                    score={score}
                />
            </section>

            {/* Streak Celebration - Fixed overlay */}
            <StreakCelebration />
        </main>
    );
}