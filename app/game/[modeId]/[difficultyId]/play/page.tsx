"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameSessionWords } from '@/lib/words-new';
import { useGameStore } from '@/lib/stores/gameStore';
import { FaVolumeUp, FaHeart, FaRegHeart, FaClock, FaUndo, FaHome, FaLightbulb, FaBrain, FaKeyboard, FaTrophy } from 'react-icons/fa';
import { IoReturnDownBack } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import StreakDisplay from '@/components/game/StreakDisplay';
import StreakCelebration from '@/components/game/StreakCelebration';

// Configs
const TYPING_MODE_DURATION = 60; // 60 seconds
const MEMORY_MODE_FLASH_DURATION = 2000; // 2 seconds

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const { modeId, difficultyId } = params as { modeId: string, difficultyId: string };

    // Zustand store
    const {
        // State
        status, countdown, words, currentWordIndex, userInput, score, lives,
        isWrong, isCorrect, isTransitioning, timeLeft, startTime, timeSpent,
        currentTime, highScore, wpm, isWordVisible, promptText, incorrectWords,

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

    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
            window.speechSynthesis.speak(utterance);
        }
        inputRef.current?.focus();
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

        const sessionWords = getGameSessionWords(difficultyId);
        initializeGame(sessionWords);
        inputRef.current?.focus();
    }, [difficultyId, initializeGame]);

    useEffect(() => {
        if (status === 'countdown') {
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
            return () => clearInterval(interval);
        }
        inputRef.current?.focus();
    }, [status, playSound, setCountdown, setStatus]);

    // Speak word in Echo mode
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'echo') {
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
                <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white p-4 overflow-hidden relative" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                    {/* Animated Background for Countdown */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
                        />
                        <motion.div
                            animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-xl"
                        />
                    </div>

                    {/* Compact Countdown Display */}
                    <div className="relative flex items-center justify-center mb-6" style={{ height: '200px' }}>
                        <AnimatePresence>
                            <motion.div
                                key={countdown}
                                initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotateY: -90, position: 'absolute' }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="absolute text-[120px] sm:text-[150px] lg:text-[180px] font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl"
                            >
                                {countdown}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pulsing Ring Effect */}
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute w-64 h-64 border-4 border-white/20 rounded-full"
                        />
                    </div>

                    {/* Compact Game Start Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center"
                    >
                        <div className="text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent font-bold mb-3">
                            Get Ready! 🚀
                        </div>
                        <div className="text-lg sm:text-xl text-blue-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            The game is starting soon...
                        </div>
                    </motion.div>
                </main>
            );
        }
        if (status === 'gameOver') {
            return (
                <main className="flex flex-col items-center min-h-screen bg-[#101010] text-white p-4 pt-28" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="w-full max-w-xl lg:max-w-7xl px-4 mt-5 mb-8" > <h2 className="text-5xl text-center opacity-80">Result</h2> </motion.div >

                    {/* Conditional Grid Layout for Typing vs Other Modes */}
                    {modeId === 'typing' ? (
                        // Typing Mode: Clean 3-column layout (Time, WPM, High Score)
                        <div className="grid grid-cols-3 w-full max-w-5xl mb-15 mt-10 px-4 text-center place-items-center gap-12">
                            <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
                                <FaClock className="text-5xl text-blue-400 mb-3" />
                                <span className="text-blue-300 text-lg tracking-wider mb-2">TIME SPENT</span>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                        <div className="text-sm text-blue-300/70">min</div>
                                    </div>
                                    <div className="text-3xl text-blue-400 font-bold">:</div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                        <div className="text-sm text-blue-300/70">sec</div>
                                    </div>
                                </div>
                            </div>

                            {/* Main WPM Display - Larger and More Prominent */}
                            <div className="flex flex-col items-center bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl p-8 border border-green-500/30">
                                <FaKeyboard className="text-6xl text-green-400 mb-3" />
                                <div className="text-8xl mb-2 text-green-400 font-bold drop-shadow-lg">{wpm}</div>
                                <span className="text-green-300 text-xl tracking-wider">WORDS PER MINUTE</span>
                                <div className="text-sm text-neutral-500 mt-2">
                                    {score} words typed correctly
                                </div>
                            </div>

                            <div className="flex items-start justify-center gap-4">
                                <div className="flex flex-col items-center text-neutral-300 mr-2">
                                    <FaTrophy className="text-6xl text-amber-400" />
                                    <span className="text-lg text-neutral-400">best speed</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-5xl mb-1 text-amber-400 font-bold">{highScore}</div>
                                    <span className="text-neutral-400 text-lg">WPM</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Other Modes: 4-column layout with improved time display
                        <div className="grid grid-cols-4 gap-6 w-full max-w-5xl mb-15 mt-10 px-4 text-center place-items-center">
                            {/* Time Spent - Beautiful Card Design */}
                            <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30 min-w-[200px]">
                                <FaClock className="text-5xl text-blue-400 mb-3" />
                                <span className="text-blue-300 text-lg tracking-wider mb-3">TIME SPENT</span>
                                <div className="flex items-center gap-2">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                        <div className="text-sm text-blue-300/70">min</div>
                                    </div>
                                    <div className="text-3xl text-blue-400 font-bold">:</div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                        <div className="text-sm text-blue-300/70">sec</div>
                                    </div>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-6 border border-neutral-500/30 min-w-[150px]">
                                <div className="text-6xl mb-2 text-white font-bold">{score}</div>
                                <span className="text-neutral-400 text-lg tracking-wider">SCORE</span>
                            </div>

                            {/* Total Words */}
                            <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-6 border border-neutral-500/30 min-w-[150px]">
                                <div className="text-6xl mb-2 text-white font-bold">{difficultyId === 'endless' ? score : words.length}</div>
                                <span className="text-neutral-400 text-lg tracking-wider text-center">{difficultyId === 'endless' ? 'WORDS COMPLETED' : 'TOTAL WORDS'}</span>
                            </div>

                            {/* High Score */}
                            <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-2xl p-6 border border-amber-500/30 min-w-[150px]">
                                <FaTrophy className="text-4xl text-amber-400 mb-2" />
                                <div className="text-6xl mb-2 text-amber-400 font-bold">{highScore}</div>
                                <span className="text-amber-300 text-lg tracking-wider">HIGH SCORE</span>
                            </div>
                        </div>
                    )}
                    {incorrectWords.length > 0 && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="w-full max-w-4xl mb-8"
                            >
                                <h2 className="text-4xl mb-8 text-center text-red-400 flex items-center justify-center gap-3">
                                    <span className="text-red-500">❌</span>
                                    Incorrect Words
                                    <span className="text-red-500">❌</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                                    {incorrectWords.map((word, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-2xl p-6 shadow-2xl border border-neutral-700/50 backdrop-blur-sm hover:shadow-red-500/10 transition-all duration-300"
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                        >
                                            {/* Correct Answer */}
                                            <div className="mb-4">
                                                <div className="text-sm text-green-400/80 mb-1 flex items-center gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    Correct Answer
                                                </div>
                                                <div className="text-3xl text-green-400 font-bold bg-green-400/10 rounded-lg py-2 px-4 border border-green-400/30">
                                                    {word.correct}
                                                </div>
                                            </div>

                                            {/* Your Answer */}
                                            <div>
                                                <div className="text-sm text-red-400/80 mb-1 flex items-center gap-2">
                                                    <span className="text-red-500">✗</span>
                                                    Your Answer
                                                </div>
                                                <div className="text-2xl text-red-400 font-medium bg-red-400/10 rounded-lg py-2 px-4 border border-red-400/30">
                                                    {word.incorrect}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                    <div className="flex space-x-8 mb-8" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}> <Button onClick={handleRestartGame} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-6 px-12 rounded-md text-xl flex items-center gap-2 text-center cursor-pointer"> <FaUndo /> <span>เริ่มใหม่</span> </Button> <Button onClick={() => router.push('/')} className="bg-[#86D95C] hover:bg-[#78C351] text-black font-bold py-6 px-12 rounded-md text-xl flex items-center gap-2 text-center cursor-pointer"> <FaHome /> <span>หน้าแรก</span> </Button> </div>
                </main>
            );
        }
        return <main className="flex items-center justify-center min-h-screen bg-[#101010] text-white">Loading...</main>;
    }

    return (
        <main className="flex flex-col h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-2xl"
                />
            </div>

            {/* Header Container */}
            <div className="w-full shrink-0 relative z-10">

                {/* Game Info Section - Hearts and Word Count */}
                <section className="w-full flex justify-between items-center py-2 px-6 sm:px-8 max-w-6xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-left"
                    >
                        <p className="text-sm sm:text-base lg:text-lg font-bold">Word: {currentWordIndex + 1} / {words.length}</p>
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

            <section className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-3 py-2 min-h-0 overflow-hidden">
                {/* Compact Mode-Specific Content */}
                {modeId === 'echo' && (
                    <motion.button
                        onClick={() => speak(words[currentWordIndex].word)}
                        className="flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-3"
                        whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                        whileTap={{ scale: isTransitioning ? 1 : 0.95 }}
                        disabled={isTransitioning}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="p-4 sm:p-5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                            <FaVolumeUp className="text-3xl sm:text-4xl lg:text-5xl text-blue-400" />
                        </div>
                        <span className="text-blue-300 group-hover:text-blue-200 transition-colors mt-2 text-sm sm:text-base font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            🔊 Click to hear again
                        </span>
                    </motion.button>
                )}

                {modeId === 'meaning-match' && (
                    <motion.div
                        key={`${currentWordIndex}-meaning`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-col items-center text-center mb-3 max-w-4xl"
                    >
                        <div className="mb-3">
                            <FaLightbulb className="text-3xl sm:text-4xl lg:text-5xl text-amber-400 mx-auto mb-2" />
                        </div>
                        <div className="mb-3">
                            <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                💡 What does this mean?
                            </p>
                            <p className="text-amber-200 text-base sm:text-lg lg:text-xl leading-relaxed font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                &ldquo;{words[currentWordIndex].meaning}&rdquo;
                            </p>
                        </div>
                        <p className="text-neutral-400 text-xs sm:text-sm lg:text-base" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            Type the English word for this meaning ✨
                        </p>
                    </motion.div>
                )}

                {modeId === 'typing' && (
                    <motion.div
                        key={`${currentWordIndex}-typing`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center mb-3 max-w-4xl"
                    >
                        <div className="mb-3">
                            <FaKeyboard className="text-3xl sm:text-4xl lg:text-5xl text-green-400 mx-auto mb-2" />
                        </div>
                        <div className="mb-3">
                            <p className="text-green-300 text-sm sm:text-base lg:text-lg mb-2 font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                ⚡ Type as fast as you can!
                            </p>
                            <p className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                {words[currentWordIndex].word}
                            </p>
                        </div>
                        <p className="text-neutral-400 text-xs sm:text-sm lg:text-base" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            Speed and accuracy matter! 🏃‍♂️💨
                        </p>
                    </motion.div>
                )}

                {modeId === 'memory' && (
                    <motion.div
                        key={`${currentWordIndex}-memory`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center mb-3 max-w-5xl"
                    >
                        <div className="mb-3">
                            <FaBrain className="text-3xl sm:text-4xl lg:text-5xl text-purple-400 mx-auto mb-2" />
                        </div>
                        <div className="min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {isWordVisible ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        key="word-visible"
                                        className="text-center"
                                    >
                                        <p className="text-purple-300 text-lg sm:text-xl mb-3 font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                            🧠 Memorize this word
                                        </p>
                                        <p className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                            {words[currentWordIndex].word}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key="word-hidden"
                                        className="text-center"
                                    >
                                        <p className="text-purple-300 text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                            ✨ Now type what you remember!
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.p
                            className="text-purple-400 text-sm sm:text-base font-medium"
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {promptText} 💭
                        </motion.p>
                    </motion.div>
                )}

                {/* Compact Input Form */}
                <form onSubmit={handleFormSubmit} className="w-full max-w-4xl flex flex-col mt-4 items-center">
                    <motion.div
                        key={currentWordIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full relative"
                    >
                        {/* Compact Input */}
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={handleUserInputChange}
                                placeholder="Type your answer here..."
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                disabled={(isTransitioning || (modeId === 'memory' && isWordVisible)) && modeId !== 'typing'}
                                className={`w-full bg-transparent text-center text-3xl sm:text-4xl lg:text-5xl py-4 px-4 focus:outline-none transition-all duration-300 font-bold placeholder:text-white/30 border-b-4 ${isWrong ? 'text-red-400 border-red-500' :
                                    isCorrect ? 'text-green-400 border-green-500' :
                                        'text-white border-white/30 focus:border-blue-400'
                                    } ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            />

                            {/* Visual Feedback Indicators */}
                            <AnimatePresence>
                                {isCorrect && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                        className="absolute -top-2 right-4 text-green-400 text-2xl sm:text-3xl"
                                    >
                                        ✓
                                    </motion.div>
                                )}
                                {isWrong && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                        className="absolute -top-2 right-4 text-red-400 text-2xl sm:text-3xl"
                                    >
                                        ✗
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Compact Submit Button */}
                    <motion.button
                        type="submit"
                        className="mt-6 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                        whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                        whileTap={{ scale: isTransitioning ? 1 : 0.9 }}
                        disabled={(isTransitioning || (modeId === 'memory' && isWordVisible)) && modeId !== 'typing'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="bg-green-400 hover:bg-green-300 text-black p-4 sm:p-6 rounded-full shadow-2xl transition-all duration-300">
                            <IoReturnDownBack className="text-3xl sm:text-4xl" />
                        </div>

                        {/* Button Label */}
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-green-300 text-sm sm:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            Submit Answer
                        </span>
                    </motion.button>
                </form>

                {/* Floating Success/Error Particles */}
                <AnimatePresence>
                    {isCorrect && (
                        <>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={`success-${i}`}
                                    initial={{
                                        opacity: 1,
                                        scale: 0,
                                        x: Math.random() * window.innerWidth,
                                        y: window.innerHeight
                                    }}
                                    animate={{
                                        opacity: 0,
                                        scale: 1.5,
                                        y: -100,
                                        rotate: 360
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, delay: i * 0.1 }}
                                    className="absolute pointer-events-none text-4xl z-50"
                                >
                                    ✨
                                </motion.div>
                            ))}
                        </>
                    )}
                    {isWrong && (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={`error-${i}`}
                                    initial={{
                                        opacity: 1,
                                        scale: 0,
                                        x: Math.random() * window.innerWidth,
                                        y: window.innerHeight / 2
                                    }}
                                    animate={{
                                        opacity: 0,
                                        scale: 1.2,
                                        y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                                        x: Math.random() * window.innerWidth,
                                        rotate: (Math.random() - 0.5) * 180
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, delay: i * 0.1 }}
                                    className="absolute pointer-events-none text-3xl z-50"
                                >
                                    💫
                                </motion.div>
                            ))}
                        </>
                    )}
                </AnimatePresence>

                {/* Subtle Floating Words for Motivation */}
                <AnimatePresence>
                    {score > 0 && score % 5 === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 0.3, y: -50, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                        >
                            <div className="text-2xl sm:text-3xl font-medium bg-gradient-to-r from-yellow-400/60 to-orange-500/60 bg-clip-text text-transparent" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                Awesome! 🎉
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Streak Celebration - Fixed overlay */}
            <StreakCelebration />
        </main>
    );
}