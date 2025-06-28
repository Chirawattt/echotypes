"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameSessionWords } from '@/lib/words-new';
import { Word } from '@/lib/words/types'
import { FaVolumeUp, FaHeart, FaRegHeart, FaClock, FaUndo, FaHome, FaLightbulb, FaBrain, FaKeyboard, FaTrophy } from 'react-icons/fa';
import { IoReturnDownBack } from "react-icons/io5";
import { Button } from '@/components/ui/button';

type GameStatus = 'countdown' | 'playing' | 'gameOver';

interface IncorrectWord {
    correct: string;
    incorrect: string;
}

// Configs
const TYPING_MODE_DURATION = 60; // 60 seconds
const MEMORY_MODE_FLASH_DURATION = 2000; // 2 seconds

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const { modeId, difficultyId } = params as { modeId: string, difficultyId: string };

    const [status, setStatus] = useState<GameStatus>('countdown');
    const [countdown, setCountdown] = useState(0);
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isWrong, setIsWrong] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // State for Typing Mode Timer
    const [timeLeft, setTimeLeft] = useState(TYPING_MODE_DURATION);

    // --- NEW: State for Memory Mode ---
    const [isWordVisible, setIsWordVisible] = useState(false);
    const [promptText, setPromptText] = useState('');


    // Audio refs
    const keypressAudioRef = useRef<HTMLAudioElement | null>(null);
    const correctAudioRef = useRef<HTMLAudioElement | null>(null);
    const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
    const completedAudioRef = useRef<HTMLAudioElement | null>(null);
    const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

    const [incorrectWords, setIncorrectWords] = useState<IncorrectWord[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeSpent, setTimeSpent] = useState<{ minutes: number, seconds: number }>({ minutes: 0, seconds: 0 });
    const [highScore, setHighScore] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<{ minutes: number, seconds: number }>({ minutes: 0, seconds: 0 });
    const [wpm, setWpm] = useState<number>(0);

    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
            window.speechSynthesis.speak(utterance);
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

        const sessionWords = getGameSessionWords(difficultyId);
        setWords(sessionWords);
        inputRef.current?.focus();
    }, [difficultyId]);

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
    }, [status, playSound]);

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
    }, [status, currentWordIndex, words, modeId]);


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
    }, [modeId, difficultyId]);

    useEffect(() => {
        if (status === 'playing' && !startTime) {
            setStartTime(new Date());
        }
    }, [status, startTime]);

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
    }, [status, startTime, score, highScore, modeId, difficultyId]);

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
    }, [status, startTime, modeId]);

    // Countdown timer for Typing Mode
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        if (status === 'playing' && modeId === 'typing') {
            timerInterval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval);
                        setStatus('gameOver');
                        playSound(completedAudioRef, 0.5);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [status, modeId, playSound]);

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
                setScore(prev => prev + 1);
                setIsCorrect(true);
            } else {
                playSound(incorrectAudioRef);
                setIsWrong(true);
                setScore(prev => Math.max(prev - 1, 0)); // Ensure score doesn't go below 0
                setIncorrectWords(prev => [...prev, { correct: words[currentWordIndex].word, incorrect: userInput.trim() }]);
            }

            // Handle endless mode - reshuffle words when reaching the end
            if (difficultyId === 'endless' && currentWordIndex === words.length - 1) {
                const reshuffledWords = getGameSessionWords(difficultyId);
                setWords(reshuffledWords);
                setCurrentWordIndex(0);
            } else {
                setCurrentWordIndex(prev => prev + 1);
            }
            setUserInput('');
            return;
        }

        setIsTransitioning(true);
        if (isCorrect) {
            playSound(correctAudioRef);
            setScore(prev => prev + 1);
            setIsCorrect(true);
        } else {
            playSound(incorrectAudioRef);
            setLives(prev => prev - 1);
            setIsWrong(true);
            setIncorrectWords(prev => [...prev, { correct: words[currentWordIndex].word, incorrect: userInput.trim() }]);
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
                setCurrentWordIndex(prev => prev + 1);
            }
            setUserInput('');
            setIsWrong(false);
            setIsCorrect(false);
            setIsTransitioning(false);
        }, 1200);
    };

    const handleRestartGame = () => {
        const sessionWords = getGameSessionWords(difficultyId);
        setWords(sessionWords);
        setStatus('countdown');
        setCountdown(3);
        setCurrentWordIndex(0);
        setUserInput('');
        setScore(0);
        setLives(3);
        setIsWrong(false);
        setIsCorrect(false);
        setIncorrectWords([]);
        setIsTransitioning(false);
        setStartTime(null);
        setTimeSpent({ minutes: 0, seconds: 0 });
        setCurrentTime({ minutes: 0, seconds: 0 });
        setTimeLeft(TYPING_MODE_DURATION);
        setWpm(0);
    };

    const renderLives = () => (
        <div className="flex items-center space-x-1 text-2xl text-right">
            {[...Array(3)].map((_, i) => (
                i < lives ? <FaHeart key={i} className="text-red-500" /> : <FaRegHeart key={i} className="text-red-500/50" />
            ))}
        </div>
    );

    if (status === 'countdown' || status === 'gameOver' || !words || words.length === 0) {
        // Keep the existing render logic for these states
        if (status === 'countdown') {
            return (
                <main className="flex flex-col items-center justify-center min-h-screen bg-[#101010] text-white p-4" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                    <div className="relative flex items-center justify-center" style={{ height: '280px' }}> <AnimatePresence> <motion.div key={countdown} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, position: 'absolute' }} transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute text-[250px] font-bold text-neutral-300" > {countdown} </motion.div> </AnimatePresence> </div>
                    <div className="text-5xl text-red-500 mt-8">Game Start</div>
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
        <main className="flex flex-col min-h-screen bg-[#101010] text-white p-8 pt-28">
            <section className="w-full flex justify-between items-center mt-6 text-neutral-300 px-10 max-w-7xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <div>
                    <p className="text-2xl">Word: {currentWordIndex + 1} / {words.length}</p>
                    <p className="text-xl uppercase text-neutral-400">{difficultyId}</p>
                </div>
                <div className="text-right">
                    {modeId !== 'typing' ? renderLives() : (<div className="text-3xl text-amber-400 font-bold"> {timeLeft}s </div>)}
                    <p className="text-xl mt-1">{score} Score</p>
                </div>
            </section>

            {modeId !== 'typing' && (
                <div className="flex justify-center items-center mt-2 flex-col" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl" >
                        {String(currentTime.minutes).padStart(2, '0')}:{String(currentTime.seconds).padStart(2, '0')}
                    </motion.div>
                    <p className="text-md mt-1 text-neutral-400">(minutes:seconds)</p>
                </div>
            )}

            <section className="flex flex-grow flex-col items-center justify-center text-center">
                {/* --- Main conditional prompt area --- */}
                {modeId === 'echo' && (<motion.button onClick={() => speak(words[currentWordIndex].word)} className="flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" whileHover={{ scale: isTransitioning ? 1 : 1.1 }} whileTap={{ scale: isTransitioning ? 1 : 0.95 }} disabled={isTransitioning} > <div className="bg-neutral-700 p-5 rounded-full shadow-lg"> <FaVolumeUp className="text-3xl text-[#d9d9d9]" /> </div> <span className="text-neutral-400 group-hover:text-white transition-colors" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>(Speak again)</span> </motion.button>)}
                {modeId === 'meaning-match' && (<motion.div key={`${currentWordIndex}-meaning`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col items-center text-center mb-8" > <div className="bg-neutral-800 p-4 rounded-full shadow-lg mb-4"> <FaLightbulb className="text-4xl text-amber-300" /> </div> <p className="text-neutral-300 text-2xl w-full max-w-4xl min-h-[50px]" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }} > {words[currentWordIndex].meaning} </p> <p className="text-neutral-500 mt-2 text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}> (Type the vocabulary word for this meaning) </p> </motion.div>)}
                {modeId === 'typing' && (<motion.div key={`${currentWordIndex}-typing`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-8" > <p className="text-neutral-300 text-7xl w-full max-w-4xl min-h-[50px]" style={{ fontFamily: "'Caveat Brush', cursive" }} > {words[currentWordIndex].word} </p> <p className="text-neutral-500 mt-2 text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}> (Type the word above as fast as you can!) </p> </motion.div>)}
                {/* --- NEW: Memory Mode Prompt --- */}
                {modeId === 'memory' && (<motion.div key={`${currentWordIndex}-memory`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center mb-8" > <div className="bg-neutral-800 p-4 rounded-full shadow-lg mb-4"> <FaBrain className="text-4xl text-purple-300" /> </div> <AnimatePresence> {isWordVisible && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-neutral-300 text-7xl w-full max-w-4xl min-h-[50px]" style={{ fontFamily: "'Caveat Brush', cursive" }} > {words[currentWordIndex].word} </motion.p>)} </AnimatePresence> <p className="text-neutral-400 mt-2 text-2xl" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}> {promptText} </p> </motion.div>)}

                <form onSubmit={handleFormSubmit} className="w-full max-w-3xl flex flex-col mt-5 items-center ">
                    <motion.div key={currentWordIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full" >
                        <input ref={inputRef} type="text" value={userInput} onChange={handleUserInputChange} placeholder="Type here..." autoComplete="off" autoCapitalize="off" autoCorrect="off" disabled={(isTransitioning || (modeId === 'memory' && isWordVisible)) && modeId !== 'typing'} className={`w-full bg-transparent border-b-[1px] text-center text-8xl p-2 focus:outline-none transition-all duration-300 ${isWrong ? 'border-red-500 text-red-400' : isCorrect ? 'border-green-500 text-green-400' : 'border-neutral-500 focus:border-white'} ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`} style={{ fontFamily: "'Caveat Brush', cursive" }} />
                    </motion.div>
                    <motion.button type="submit" className="mt-10 disabled:opacity-50 disabled:cursor-not-allowed" whileHover={{ scale: isTransitioning ? 1 : 1.15 }} whileTap={{ scale: isTransitioning ? 1 : 0.9 }} disabled={(isTransitioning || (modeId === 'memory' && isWordVisible)) && modeId !== 'typing'} >
                        <div className="bg-green-400 text-black p-4 rounded-full shadow-lg shadow-green-400/20">
                            <IoReturnDownBack className="text-5xl" />
                        </div>
                    </motion.button>
                </form>
            </section>
        </main>
    );
}