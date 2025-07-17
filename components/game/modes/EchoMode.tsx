"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaClock } from 'react-icons/fa';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cancelSpeechSynthesis } from '@/lib/cleanup';
import { useGameStore } from '@/lib/stores/gameStore';

interface EchoModeProps {
    currentWord: string;
    isTransitioning: boolean;
    usedSpeakAgain?: boolean; // Default to false if not provided
    onSpeak: (text: string) => void;
    gameStyle?: 'practice' | 'challenge';
    currentWordIndex: number;
    onTimeUp?: () => void;
    speechUtterance?: SpeechSynthesisUtterance | null; // Add this to get onend event
    onCountdownChange?: (isCountingDown: boolean) => void; // Add this to communicate countdown state
    onTimerReady?: (stopTimer: () => void) => void; // Add this to pass stop timer function to parent
    onTimeLeftChange?: (timeLeft: number) => void; // Add this to send current time left to parent
    setSpeakAgainUsed: (used: boolean) => void; // Function to set speak again status in parent
}

export default function EchoMode({
    currentWord,
    isTransitioning,
    usedSpeakAgain = false, // Default to false if not provided
    onSpeak,
    gameStyle = 'practice',
    currentWordIndex,
    onTimeUp,
    speechUtterance,
    onCountdownChange,
    onTimerReady,
    onTimeLeftChange,
    setSpeakAgainUsed
}: EchoModeProps) {
    const [listenCount, setListenCount] = useState(0); // เพิ่ม listenCount state ที่หายไป
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const { totalChallengeScore, streakCount } = useGameStore();


    // Function to get score color based on streak level
    const getScoreColorByStreak = (streak: number) => {
        if (streak >= 20) return 'text-yellow-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]'; // Unstoppable!
        if (streak >= 10) return 'text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]'; // In The Zone!
        if (streak >= 5) return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]'; // On a Roll!
        if (streak >= 2) return 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'; // Warming Up!
        return 'text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]'; // Default
    };

    // Use refs to avoid stale closure issues
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Update refs when props change
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Function to stop the timer (when answer is submitted)
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsCountingDown(false);
        console.log('Timer stopped - answer submitted');
    }, []);

    // Listen for answer submission to stop timer
    useEffect(() => {
        if (onTimerReady) {
            // Pass the stop timer function to parent so it can call it when answer is submitted
            onTimerReady(stopTimer);
        }
    }, [onTimerReady, stopTimer]);

    // Notify parent when countdown state changes
    useEffect(() => {
        if (onCountdownChange) {
            onCountdownChange(isCountingDown);
        }

        // Focus input when countdown starts (challenge mode)
        if (gameStyle === 'challenge' && isCountingDown) {
            setTimeout(() => {
                const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (inputElement && !inputElement.disabled) {
                    inputElement.focus();
                }
            }, 100);
        }
    }, [isCountingDown, onCountdownChange, gameStyle]);

    // Simple timer function with decimal precision
    const startTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setTimeLeft(5.0);

        const startTime = Date.now();
        const duration = 5000; // 5 seconds in milliseconds

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, (duration - elapsed) / 1000);

            if (remaining > 0 && !isTransitioning) {
                const roundedRemaining = Math.round(remaining * 10) / 10; // Round to 1 decimal place
                setTimeLeft(roundedRemaining);

                // Send current time left to parent for scoring
                if (onTimeLeftChange) {
                    onTimeLeftChange(roundedRemaining);
                }

                timerRef.current = setTimeout(tick, 100); // Update every 100ms for smooth countdown
            } else {
                console.log('Time up!');
                setTimeLeft(0);
                setIsCountingDown(false);

                // Send final time to parent
                if (onTimeLeftChange) {
                    onTimeLeftChange(0);
                }

                onTimeUpRef.current?.();
            }
        };

        timerRef.current = setTimeout(tick, 100); // Start first tick after 100ms
    }, [isTransitioning, onTimeLeftChange]);

    // Reset when word changes
    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setListenCount(0);
        setTimeLeft(5.0);
        setIsCountingDown(false);
        setSpeakAgainUsed(false); // รีเซ็ต speak again status
        console.log('Echo Mode - Word changed, resetting state');

        // แจ้งให้ parent รู้ว่า reset แล้ว
        if (usedSpeakAgain) {
            setSpeakAgainUsed(false);
        }
    }, [currentWordIndex, setSpeakAgainUsed, usedSpeakAgain]);

    // Handle speech end event for challenge mode
    useEffect(() => {
        if (gameStyle === 'challenge' && speechUtterance) {
            const handleSpeechEnd = () => {
                console.log('Speech ended, starting timer...');
                setIsCountingDown(true);
                startTimer();

                // Focus input after countdown starts
                setTimeout(() => {
                    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (inputElement) {
                        inputElement.focus();
                    }
                }, 150);
            };

            speechUtterance.addEventListener('end', handleSpeechEnd);

            return () => {
                speechUtterance.removeEventListener('end', handleSpeechEnd);
            };
        }
    }, [gameStyle, speechUtterance, startTimer]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            // Cancel any ongoing speech synthesis
            cancelSpeechSynthesis();
        };
    }, []);

    const handleSpeak = useCallback(() => {
        if (gameStyle === 'challenge' && listenCount >= 1) {
            return; // Prevent speaking more than once in challenge mode
        }

        if (gameStyle === 'challenge') {
            setListenCount(prev => prev + 1);

            // เมื่อกดปุ่ม speak ครั้งแรก = ใช้ speak again (ไม่ได้โบนัส first listen)
            setSpeakAgainUsed(true);

            stopTimer(); // Stop timer immediately when speaking
        }

        onSpeak(currentWord);
    }, [gameStyle, listenCount, setSpeakAgainUsed, stopTimer, onSpeak, currentWord]);

    const isDisabled = isTransitioning || (gameStyle === 'challenge' && listenCount >= 1);

    // Keyboard event listener for Shift key to trigger speak
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only trigger if Shift is pressed and input is focused
            if (event.key === 'Shift') {
                const activeElement = document.activeElement;
                const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;

                // Check if input is focused and speak button is not disabled
                if (activeElement === inputElement && !isDisabled) {
                    event.preventDefault(); // Prevent default Shift behavior
                    handleSpeak();
                }
            }
        };

        // Add event listener to document
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDisabled, handleSpeak]); // Add dependencies

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md sm:max-w-lg lg:max-w-2xl px-2 sm:px-4">
            {/* Timer for Challenge Mode - Horizontal Progress Bar Style */}
            {gameStyle === 'challenge' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 sm:mb-3 w-full space-y-2"
                >

                    {/* Points Display - for Challenge Mode */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="p-1 sm:p-2 text-center"
                    >
                        <motion.p
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColorByStreak(streakCount)}`}
                            animate={streakCount >= 5 ? {
                                scale: [1, 1.05, 1],
                                textShadow: [
                                    '0 0 10px rgba(250,204,21,0.5)',
                                    '0 0 20px rgba(250,204,21,0.8)',
                                    '0 0 10px rgba(250,204,21,0.5)'
                                ]
                            } : {}}
                            transition={{
                                duration: 2,
                                repeat: streakCount >= 5 ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                        >
                            {totalChallengeScore} pts.
                        </motion.p>
                    </motion.div>

                    <div className=''>
                        {/* Timer Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                            <motion.div
                                className="flex items-center space-x-1 sm:space-x-2"
                                animate={{ scale: timeLeft <= 2.0 ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: timeLeft <= 2.0 ? Infinity : 0 }}
                            >
                                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${timeLeft <= 2.0 ? 'bg-red-400' : 'bg-orange-400'
                                    } animate-pulse`}></div>
                                <span
                                    className={`text-xl sm:text-2xl lg:text-3xl font-bold ${timeLeft <= 2.0 ? 'text-red-400' : 'text-orange-400'
                                        }`}
                                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                                >
                                    {timeLeft.toFixed(1)}s
                                </span>
                            </motion.div>
                            <span
                                className={`text-sm sm:text-lg font-medium ${timeLeft <= 2.0 ? 'text-red-300' : 'text-orange-300'
                                    } text-center sm:text-right`}
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                {isCountingDown ? '⏰ Time to answer!' : '🎯 Get ready!'}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative">
                            {/* Background Bar */}
                            <div className="w-full h-2 sm:h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/30">
                                {/* Animated Progress Bar */}
                                <motion.div
                                    className={`h-full rounded-full transition-all duration-100 ease-linear ${timeLeft <= 2.0
                                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                                        : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                                        }`}
                                    style={{
                                        width: `${(timeLeft / 5.0) * 100}%`,
                                        boxShadow: timeLeft <= 2.0
                                            ? '0 0 15px rgba(239, 68, 68, 0.4)'
                                            : '0 0 15px rgba(249, 115, 22, 0.3)'
                                    }}
                                    animate={{
                                        opacity: timeLeft <= 2.0 ? [1, 0.7, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: timeLeft <= 2.0 ? Infinity : 0
                                    }}
                                />
                            </div>

                            {/* Progress Bar Glow Effect */}
                            <div className={`absolute inset-0 rounded-full opacity-30 ${timeLeft <= 2.0 ? 'bg-red-400/20' : 'bg-orange-400/20'
                                } blur-sm`}></div>

                            {/* Time Markers - More detailed for decimal time */}
                            <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                                {[1.0, 2.0, 3.0, 4.0, 5.0].map((mark) => (
                                    <div
                                        key={mark}
                                        className={`w-0.5 h-1 sm:h-2 rounded-full transition-all duration-100 ${timeLeft >= mark
                                            ? 'bg-white/60'
                                            : 'bg-gray-600/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timer Status Text */}
                        <div className="mt-1 sm:mt-2 text-center">
                            <motion.p
                                className={`text-sm sm:text-md font-medium ${timeLeft <= 2.0 ? 'text-red-300/80' : 'text-orange-300/80'
                                    }`}
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                animate={{ opacity: timeLeft <= 2.0 ? [1, 0.6, 1] : 1 }}
                                transition={{ duration: 0.8, repeat: timeLeft <= 2.0 ? Infinity : 0 }}
                            >
                                {timeLeft <= 2.0 ? '🚨 Hurry up!' : '💭 Think carefully...'}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Speaker Button */}
            <motion.button
                onClick={handleSpeak}
                className="flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-2 sm:mb-3"
                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                disabled={isDisabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={`p-3 sm:p-4 lg:p-5 rounded-full transition-all duration-300 ${isDisabled
                    ? 'bg-gray-500/10 group-hover:bg-gray-500/10'
                    : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                    }`}>
                    <FaVolumeUp className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl transition-colors ${isDisabled ? 'text-gray-500' : 'text-blue-400'
                        }`} />
                </div>

                {/* Dynamic button text based on mode and state */}
                <span
                    className={`transition-colors mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base font-medium text-center px-2 ${isDisabled
                        ? 'text-gray-500'
                        : 'text-blue-300 group-hover:text-blue-200'
                        }`}
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    {gameStyle === 'challenge' ? (
                        listenCount === 0 ? '🔊 Click to hear word' : '🚫 No more listens'
                    ) : (
                        '🔊 Click to hear again'
                    )}
                </span>

                {/* Keyboard shortcut hint */}
                {!isDisabled && (
                    <span
                        className="transition-colors mt-0.5 sm:mt-1 text-xs text-blue-300/70 group-hover:text-blue-200/70 flex items-center gap-1 px-2 text-center"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        ⌨️ or press <kbd className="px-1 py-0.5 bg-blue-800/30 rounded text-xs border border-blue-600/30">Shift</kbd>
                    </span>
                )}

                {/* Listen count indicator for challenge mode */}
                {gameStyle === 'challenge' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center mt-0.5 sm:mt-1 text-xs text-blue-300/80"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        <FaClock className="mr-1" />
                        <span>Listens: {listenCount}/1</span>
                    </motion.div>
                )}
            </motion.button>

            {/* Status messages for challenge mode */}
            <AnimatePresence>
                {gameStyle === 'challenge' && isCountingDown && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-blue-300 text-sm sm:text-base lg:text-lg text-center max-w-xs sm:max-w-sm lg:max-w-md px-2"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        ✨ Type your answer now!
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
