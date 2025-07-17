"use client";

import { motion, AnimatePresence } from 'framer-motion';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';

interface MemoryModeProps {
    currentWord: string;
    currentWordIndex: number;
    isWordVisible: boolean;
    promptText: string;
    gameStyle?: 'practice' | 'challenge';
    onTimeUp?: () => void;
    onTimeLeftChange?: (timeLeft: number) => void;
    onTimerReady?: (stopTimer: () => void) => void; // Add this to pass stop timer function to parent
    // Debug props
    ddaLevel?: number;
    viewingTime?: number;
    streakCount?: number;
    totalScore?: number;
}

export default function MemoryMode({ 
    currentWord, 
    currentWordIndex, 
    isWordVisible, 
    promptText,
    gameStyle = 'practice',
    onTimeUp,
    onTimeLeftChange,
    onTimerReady,
    streakCount,
    totalScore
}: MemoryModeProps) {
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get feedback states from game store
    const { isCorrect, isWrong, status, totalChallengeScore } = useGameStore();

    // Function to get score color based on streak level
    const getScoreColorByStreak = (streak: number) => {
        if (streak >= 20) return 'text-yellow-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]'; // Unstoppable!
        if (streak >= 10) return 'text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]'; // In The Zone!
        if (streak >= 5) return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]'; // On a Roll!
        if (streak >= 2) return 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'; // Warming Up!
        return 'text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]'; // Default
    };

    // Function to stop the timer (when answer is submitted)
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsTimerActive(false);
        console.log('Memory Timer stopped - answer submitted');
    }, []);

    // Listen for answer submission to stop timer
    useEffect(() => {
        if (onTimerReady) {
            // Pass the stop timer function to parent so it can call it when answer is submitted
            onTimerReady(stopTimer);
        }
    }, [onTimerReady, stopTimer]);

    // Stop timer when game is over
    useEffect(() => {
        if (status === 'gameOver') {
            setIsTimerActive(false);
            setTimeLeft(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [status]);


    
    // Reset timer when word changes or when word becomes invisible (typing phase starts)
    useLayoutEffect(() => {
        if (!isWordVisible && gameStyle === 'challenge') {
            // Start timer when typing phase begins
            setTimeLeft(5.0);
            setIsTimerActive(true);
        } else {
            // Stop timer when memorizing
            setIsTimerActive(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isWordVisible, gameStyle, currentWordIndex]);

    // Timer countdown logic
    useEffect(() => {
        if (isTimerActive && gameStyle === 'challenge' && !isWordVisible) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = Math.max(0, prev - 0.1);
                    
                    // Check if time is up
                    if (newTime <= 0) {
                        if (onTimeUp) {
                            onTimeUp();
                        }
                        setIsTimerActive(false);
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                    }
                    
                    return newTime;
                });
            }, 100);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };
        }
    }, [isTimerActive, gameStyle, isWordVisible, onTimeUp]);

    // Separate useEffect for reporting time left to prevent setState during render
    useEffect(() => {
        if (onTimeLeftChange) {
            // Use requestAnimationFrame to defer the callback to prevent setState during render
            requestAnimationFrame(() => {
                onTimeLeftChange(timeLeft);
            });
        }
    }, [timeLeft, onTimeLeftChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);
    return (
        <>
            {/* Points Display - for Challenge Mode - Outside container to prevent re-render */}
            {gameStyle === 'challenge' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="rounded-lg p-1 sm:p-2 mb-2 sm:mb-4 text-center"
                >
                    <motion.p
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColorByStreak(streakCount || 0)}`}
                        animate={streakCount && streakCount >= 5 ? {
                            scale: [1, 1.05, 1],
                            textShadow: [
                                '0 0 10px rgba(250,204,21,0.5)',
                                '0 0 20px rgba(250,204,21,0.8)',
                                '0 0 10px rgba(250,204,21,0.5)'
                            ]
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: streakCount && streakCount >= 5 ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    >
                        {totalScore || totalChallengeScore} pts.
                    </motion.p>
                </motion.div>
            )}

            <motion.div
                key={`${currentWordIndex}-memory`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center mb-3 max-w-5xl"
            >
                

 

            <div className="min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {isWordVisible ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            key={`word-visible-${currentWordIndex}-${currentWord}`}
                            className="text-center"
                        >
                            <p
                                className="text-purple-300 text-lg sm:text-xl mb-3 font-medium"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                🧠 Memorize this word
                            </p>
                            <p
                                className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold"
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            >
                                {currentWord}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            key={`word-hidden-${currentWordIndex}-${isCorrect}-${isWrong}`}
                            className="text-center"
                        >
                            <p
                                className={`text-xl sm:text-2xl font-bold ${
                                    isCorrect ? 'text-green-400' : 
                                    isWrong ? 'text-red-400' : 
                                    'text-purple-300'
                                }`}
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            >
                                {isCorrect ? '✅ Correct! Well done!' : 
                                 isWrong ? '❌ Incorrect! Try again!' : 
                                 '✨ Now type what you remember!'}
                            </p>
                            
                            {/* Challenge Mode Timer - Horizontal Progress Bar Style (same as Echo Mode) */}
                            {gameStyle === 'challenge' && isTimerActive && (
                                <motion.div
                                    className="mt-4 w-full max-w-md space-y-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={`timer-${currentWordIndex}`}
                                >
                                    {/* Timer Header */}
                                    <div className="flex justify-between items-center">
                                        {/* Timer Display */}
                                        <motion.div
                                            className="flex items-center gap-2"
                                            animate={{
                                                scale: timeLeft <= 2.0 ? [1, 1.1, 1] : 1,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: timeLeft <= 2.0 ? Infinity : 0
                                            }}
                                        >
                                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${timeLeft <= 2.0 ? 'bg-red-400' : 'bg-purple-400'
                                                } animate-pulse`}></div>
                                            <span
                                                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${timeLeft <= 2.0 ? 'text-red-400' : 'text-purple-400'
                                                    }`}
                                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                                            >
                                                {timeLeft.toFixed(1)}s
                                            </span>
                                        </motion.div>
                                        <span
                                            className={`text-sm sm:text-lg font-medium ${timeLeft <= 2.0 ? 'text-red-300' : 'text-purple-300'
                                                } text-center sm:text-right`}
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                        >
                                            {isTimerActive ? '⏰ Time to answer!' : '🎯 Get ready!'}
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
                                                    : 'bg-gradient-to-r from-purple-500 to-purple-400'
                                                    }`}
                                                style={{
                                                    width: `${(timeLeft / 5.0) * 100}%`,
                                                }}
                                                animate={{
                                                    boxShadow: timeLeft <= 2.0
                                                        ? '0 0 15px rgba(239, 68, 68, 0.4)'
                                                        : '0 0 15px rgba(168, 85, 247, 0.3)',
                                                    opacity: timeLeft <= 2.0 ? [1, 0.7, 1] : 1,
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: timeLeft <= 2.0 ? Infinity : 0
                                                }}
                                            />
                                        </div>

                                        {/* Progress Bar Glow Effect */}
                                        <div className={`absolute inset-0 rounded-full opacity-30 ${timeLeft <= 2.0 ? 'bg-red-400/20' : 'bg-purple-400/20'
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
                                            className={`text-sm sm:text-md font-medium ${timeLeft <= 2.0 ? 'text-red-300/80' : 'text-purple-300/80'
                                                }`}
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                            animate={{
                                                opacity: timeLeft <= 2.0 ? [1, 0.7, 1] : 1
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: timeLeft <= 2.0 ? Infinity : 0
                                            }}
                                        >
                                            {timeLeft <= 2.0 ? '🚨 Hurry up!' : '💭 Remember what you saw!'}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            )}
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
        </>
    );
}
