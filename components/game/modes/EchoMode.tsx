"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaClock } from 'react-icons/fa';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cancelSpeechSynthesis } from '@/lib/cleanup';
import { useGameStore } from '@/lib/stores/gameStore';

interface EchoModeProps {
    currentWord: string;
    isTransitioning: boolean;
    onSpeak: (text: string) => void;
    gameStyle?: 'practice' | 'challenge';
    currentWordIndex: number;
    onTimeUp?: () => void;
    speechUtterance?: SpeechSynthesisUtterance | null; // Add this to get onend event
    onCountdownChange?: (isCountingDown: boolean) => void; // Add this to communicate countdown state
    onTimerReady?: (stopTimer: () => void) => void; // Add this to pass stop timer function to parent
    onTimeLeftChange?: (timeLeft: number) => void; // Add this to send current time left to parent
}

export default function EchoMode({
    currentWord,
    isTransitioning,
    onSpeak,
    gameStyle = 'practice',
    currentWordIndex,
    onTimeUp,
    speechUtterance,
    onCountdownChange,
    onTimerReady,
    onTimeLeftChange
}: EchoModeProps) {
    const [listenCount, setListenCount] = useState(0);
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
    }, [currentWordIndex]);

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

    const handleSpeak = () => {
        if (gameStyle === 'challenge' && listenCount >= 1) {
            return; // Prevent speaking more than once in challenge mode
        }

        onSpeak(currentWord);

        if (gameStyle === 'challenge') {
            setListenCount(prev => prev + 1);
        }
    };

    const isDisabled = isTransitioning || (gameStyle === 'challenge' && listenCount >= 1);

    return (
        <div className="flex flex-col items-center justify-center  w-full sm:max-w-lg lg:max-w-2xl max-w-md">
            {/* Timer for Challenge Mode - Horizontal Progress Bar Style */}
            {gameStyle === 'challenge' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 w-full max-w-xl space-y-2"
                >

                    {/* Points Display - for Challenge Mode */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="rounded-lg p-2 mb-4 text-center"
                    >
                        <motion.p 
                            className={`text-3xl font-bold ${getScoreColorByStreak(streakCount)}`}
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
                        <div className="flex items-center justify-between mb-3">
                            <motion.div
                                className="flex items-center space-x-2"
                                animate={{ scale: timeLeft <= 2.0 ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: timeLeft <= 2.0 ? Infinity : 0 }}
                            >
                                <div className={`w-3 h-3 rounded-full ${timeLeft <= 2.0 ? 'bg-red-400' : 'bg-orange-400'
                                    } animate-pulse`}></div>
                                <span
                                    className={`text-2xl font-bold ${timeLeft <= 2.0 ? 'text-red-400' : 'text-orange-400'
                                        }`}
                                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                                >
                                    {timeLeft.toFixed(1)}s
                                </span>
                            </motion.div>
                            <span
                                className={`text-lg font-medium ${timeLeft <= 2.0 ? 'text-red-300' : 'text-orange-300'
                                    }`}
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                {isCountingDown ? '⏰ Time to answer!' : '🎯 Get ready!'}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative">
                            {/* Background Bar */}
                            <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/30">
                                {/* Animated Progress Bar */}
                                <motion.div
                                    className={`h-full rounded-full transition-all duration-100 ease-linear ${timeLeft <= 2.0
                                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                                            : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                                        }`}
                                    style={{
                                        width: `${(timeLeft / 5.0) * 100}%`,
                                        boxShadow: timeLeft <= 2.0
                                            ? '0 0 20px rgba(239, 68, 68, 0.5)'
                                            : '0 0 20px rgba(249, 115, 22, 0.3)'
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
                                        className={`w-0.5 h-2 rounded-full transition-all duration-100 ${timeLeft >= mark
                                                ? 'bg-white/60'
                                                : 'bg-gray-600/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timer Status Text */}
                        <div className="mt-2 text-center">
                            <motion.p
                                className={`text-md font-medium ${timeLeft <= 2.0 ? 'text-red-300/80' : 'text-orange-300/80'
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
                className="flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-3"
                whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                disabled={isDisabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={`p-4 sm:p-5 rounded-full transition-all duration-300 ${isDisabled
                        ? 'bg-gray-500/10 group-hover:bg-gray-500/10'
                        : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                    }`}>
                    <FaVolumeUp className={`text-3xl sm:text-4xl lg:text-5xl transition-colors ${isDisabled ? 'text-gray-500' : 'text-blue-400'
                        }`} />
                </div>

                {/* Dynamic button text based on mode and state */}
                <span
                    className={`transition-colors mt-2 text-sm sm:text-base font-medium ${isDisabled
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

                {/* Listen count indicator for challenge mode */}
                {gameStyle === 'challenge' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center mt-1 text-xs text-blue-300/80"
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
                        className="text-blue-300 text-sm text-center max-w-xs"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        ✨ Type your answer now!
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
