"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameSessionWords, Word } from '@/lib/words';
import { FaVolumeUp, FaHeart, FaRegHeart, FaClock, FaUndo, FaHome } from 'react-icons/fa';
import { IoReturnDownBack } from "react-icons/io5";
import { Button } from '@/components/ui/button';

type GameStatus = 'countdown' | 'playing' | 'gameOver';

interface IncorrectWord {
    correct: string;
    incorrect: string;
}

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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Text-to-speech function
    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4; // Speed of speech by default is 1.0
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

    // Preload audio and focus input on mount
    useEffect(() => {
        // Preload audio files
        keypressAudioRef.current = new Audio('/sounds/keypress.mp3');
        correctAudioRef.current = new Audio('/sounds/correct.mp3');
        incorrectAudioRef.current = new Audio('/sounds/incorrect.mp3');
        completedAudioRef.current = new Audio('/sounds/completed.wav');
        countdownAudioRef.current = new Audio('/sounds/countdown.mp3');
        
        const sessionWords = getGameSessionWords(difficultyId);
        setWords(sessionWords);
        inputRef.current?.focus();
    }, [difficultyId]);

    // Countdown logic
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
                    // Delay before starting the game
                    setTimeout(() => setStatus('playing'), 1000);
                }
            }, 1000);

            // Cleanup function to clear interval if the component unmounts or status changes
            return () => clearInterval(interval);
        }
    }, [status, playSound]);

    // Speak the word when the game starts or word changes
    useEffect(() => {
        if (status === 'playing' && words.length > 0) {
            speak(words[currentWordIndex].word);
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, words, speak]);

    // Add function to load high score
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

    // Start timer when game starts
    useEffect(() => {
        if (status === 'playing' && !startTime) {
            setStartTime(new Date());
        }
    }, [status, startTime]);

    // Calculate time spent when game ends
    useEffect(() => {
        if (status === 'gameOver' && startTime) {
            const endTime = new Date();
            const timeDiff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
            const minutes = Math.floor(timeDiff / 60);
            const seconds = timeDiff % 60;
            const finalTime = { minutes, seconds };
            setTimeSpent(finalTime);

            // Update high score if necessary
            if (score > highScore) {
                setHighScore(score);
                const newHighScoreData = {
                    score: score,
                    time: finalTime
                };
                localStorage.setItem(`highScoreData_${modeId}_${difficultyId}`, JSON.stringify(newHighScoreData));
            }
        }
    }, [status, startTime, score, highScore, modeId, difficultyId]);

    // Add timer update effect
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;

        if (status === 'playing' && startTime) {
            timerInterval = setInterval(() => {
                const now = new Date();
                const timeDiff = Math.floor((now.getTime() - startTime.getTime()) / 1000); // in seconds
                const minutes = Math.floor(timeDiff / 60);
                const seconds = timeDiff % 60;
                setCurrentTime({ minutes, seconds });
            }, 1000);
        }

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [status, startTime]);

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        playSound(keypressAudioRef, 0.4);
        setUserInput(e.target.value);
        if (isWrong) setIsWrong(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTransitioning) return;

        setIsTransitioning(true);

        const isCorrect = userInput.trim().toLowerCase() === words[currentWordIndex].word.toLowerCase();

        if (isCorrect) {
            playSound(correctAudioRef);
            setScore(prev => prev + 1);
        } else {
            playSound(incorrectAudioRef);
            setLives(prev => prev - 1);
            setIsWrong(true);
            setIncorrectWords(prev => [...prev, {
                correct: words[currentWordIndex].word,
                incorrect: userInput.trim()
            }]);
        }

        setTimeout(() => {
            const newLives = isCorrect ? lives : lives - 1;
            const isLastWord = currentWordIndex === words.length - 1;

            if (newLives <= 0 || isLastWord) {
                playSound(completedAudioRef, 0.5);
                setStatus('gameOver');
                return;
            }

            setCurrentWordIndex(prev => prev + 1);
            setUserInput('');
            setIsWrong(false);
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
        setIncorrectWords([]);
        setIsTransitioning(false);
        setStartTime(null);
        setTimeSpent({ minutes: 0, seconds: 0 });
        setCurrentTime({ minutes: 0, seconds: 0 });
    };

    const renderLives = () => {
        return (
            <div className="flex items-center space-x-1 text-2xl text-right">
                {[...Array(3)].map((_, i) => (
                    i < lives ? <FaHeart key={i} className="text-red-500" /> : <FaRegHeart key={i} className="text-red-500/50" />
                ))}
            </div>
        );
    };


    // --- RENDER FUNCTIONS --- //

    if (status === 'countdown') {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen bg-[#101010] text-white p-4" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                <div className="relative flex items-center justify-center" style={{ height: '280px' }}>
                    <AnimatePresence>
                        <motion.div
                            key={countdown}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, position: 'absolute' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute text-[250px] font-bold text-neutral-300"
                        >
                            {countdown}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="text-5xl text-red-500 mt-8">Game Start</div>
            </main>
        );
    }
    
    if (status === 'gameOver') {
        return (
            <main className="flex flex-col items-center min-h-screen bg-[#101010] text-white p-4 pt-28" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                {/* Result Title */}
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-5 mb-8" 
                >
                    <h2 className="text-5xl text-center opacity-80" style={{ fontFamily: "'Caveat Brush', cursive" }}>Result</h2>
                </motion.div >

                {/* Stats Grid */}
                <div className="grid grid-cols-4 w-full max-w-3xl mb-15 mt-10 px-4 text-center place-items-center">
                    {/* Time Spent */}
                    <div className="flex items-start justify-center gap-3 ">
                        <div className="flex flex-col items-center text-neutral-300 mr-2">
                            <FaClock className="text-7xl" />
                            <span className=" text-lg text-neutral-400">time spent</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-6xl" >
                                {timeSpent.minutes}<span className="text-xl text-neutral-400 ml-1">min.</span>
                            </p>
                            <p className="text-5xl" >
                                {timeSpent.seconds}<span className="text-xl text-neutral-400 ml-1">sec.</span>
                            </p>
                            
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                        <div className="text-7xl mb-1" >{score}</div>
                        <span className="text-neutral-400 text-2xl mt-[-15px]">score</span>
                    </div>

                    {/* Total Words */}
                    <div className="flex flex-col items-center">
                        <div className="text-7xl mb-1" >{words.length}</div>
                        <span className="text-neutral-400 text-2xl mt-[-15px]">total words</span>
                    </div>

                    {/* High Score */}
                    <div className="flex flex-col items-center">
                        <div className="text-7xl mb-1" >{highScore}</div>
                        <span className="text-neutral-400 text-2xl mt-[-15px]">high score</span>
                    </div>
                </div>

                {/* Incorrect Words Section */}
                {incorrectWords.length > 0 && (
                    <>
                        <h2 className="text-4xl mb-6" >incorrect words</h2>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-12 px-4">
                            {incorrectWords.map((word, index) => (
                                <div key={index} className="bg-[#202020] rounded-lg p-5 shadow-lg text-center font-semibold" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    <div className="text-3xl text-[#00DD28]" >{word.correct}</div>
                                    <div className="text-xl text-[#FF0000]" >{word.incorrect}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-8 mb-8" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    <Button
                        onClick={handleRestartGame}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-6 px-12 rounded-full text-xl flex items-center gap-2 text-center cursor-pointer"
                    >
                        <FaUndo />
                        <span>เริ่มใหม่</span>
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-[#86D95C] hover:bg-[#78C351] text-black font-bold py-6 px-12 rounded-full text-xl flex items-center gap-2 text-center cursor-pointer"
                    >
                        <FaHome />
                        <span>หน้าแรก</span>
                    </Button>
                </div>
            </main>
        );
    }

    if (!words || words.length === 0) {
        return <main className="flex items-center justify-center min-h-screen bg-[#101010] text-white">Loading words...</main>;
    }

    return (
        <main className="flex flex-col min-h-screen bg-[#101010] text-white p-8 pt-28">
            {/* Game Info */}
            <section className="w-full flex justify-between items-center mt-6 text-neutral-300 px-10 max-w-7xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <div>
                    <p className="text-2xl">Word: {currentWordIndex + 1} / {words.length}</p>
                    <p className="text-xl capitalize text-neutral-400">{difficultyId}</p>
                </div>
                <div className="text-right">
                    {renderLives()}
                    <p className="text-xl mt-1">{score} Score</p>
                </div>
            </section>

            {/* Timer Display */}
            <div className="flex justify-center items-center mt-4 flex-col" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl"
                >
                    {String(currentTime.minutes).padStart(2, '0')}:{String(currentTime.seconds).padStart(2, '0')}
                </motion.div>
                <p className="text-lg mt-1 text-neutral-400">(minutes:seconds)</p>
            </div>

            {/* Main Game Area */}
            <section className="flex-grow flex flex-col items-center justify-center text-center">
                {/* Speak Button */}
                <motion.button
                    onClick={() => speak(words[currentWordIndex].word)}
                    className="flex flex-col items-center group  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                    whileTap={{ scale: isTransitioning ? 1 : 0.95 }}
                    disabled={isTransitioning}
                >
                    <div className="bg-neutral-700 p-5 rounded-full shadow-lg">
                        <FaVolumeUp className="text-5xl text-[#d9d9d9]" />
                    </div>
                    <span className="mt-2 text-neutral-400 group-hover:text-white transition-colors" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>(Speak again)</span>
                </motion.button>
                
                {/* Input Form */}
                <form onSubmit={handleFormSubmit} className="w-full max-w-3xl flex flex-col mt-5 items-center ">
                    <motion.div
                        key={currentWordIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                         <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleUserInputChange}
                            placeholder="Type here..."
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                            disabled={isTransitioning}
                            className={`w-full bg-transparent border-b-[1px] text-center text-8xl p-2 focus:outline-none transition-all duration-300 ${isWrong ? 'border-red-500 text-red-400' : 'border-neutral-500 focus:border-white'} ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                        />
                    </motion.div>

                    {/* Meaning */}
                    <motion.p 
                        key={`${currentWordIndex}-meaning`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-neutral-400 mt-6 text-lg min-h-[50px]" 
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        {words[currentWordIndex].meaning}
                    </motion.p>
                    
                    {/* Submit Button */}
                    <motion.button 
                        type="submit" 
                        className="mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isTransitioning ? 1 : 1.15 }}
                        whileTap={{ scale: isTransitioning ? 1 : 0.9 }}
                        disabled={isTransitioning}
                    >
                        <div className="bg-green-400 text-black p-4 rounded-full shadow-lg shadow-green-400/20">
                           <IoReturnDownBack className="text-5xl" />
                        </div>
                    </motion.button>
                </form>
            </section>
        </main>
    );
} 