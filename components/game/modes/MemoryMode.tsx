"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

interface MemoryModeProps {
    currentWord: string;
    currentWordIndex: number;
    isWordVisible: boolean;
    promptText: string;
    gameStyle?: 'practice' | 'challenge';
    onTimeUp?: () => void;
    onTimeLeftChange?: (timeLeft: number) => void;
}

export default function MemoryMode({ 
    currentWord, 
    currentWordIndex, 
    isWordVisible, 
    promptText,
    gameStyle = 'practice',
    onTimeUp,
    onTimeLeftChange
}: MemoryModeProps) {
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when word changes or when word becomes invisible (typing phase starts)
    useEffect(() => {
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
                    
                    // Report time left to parent
                    if (onTimeLeftChange) {
                        onTimeLeftChange(newTime);
                    }
                    
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
    }, [isTimerActive, gameStyle, isWordVisible, onTimeUp, onTimeLeftChange]);

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
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key="word-hidden"
                            className="text-center"
                        >
                            <p
                                className="text-purple-300 text-xl sm:text-2xl font-bold"
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            >
                                ✨ Now type what you remember!
                            </p>
                            
                            {/* Challenge Mode Timer */}
                            {gameStyle === 'challenge' && isTimerActive && (
                                <motion.div
                                    className="mt-4 relative"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    {/* Timer Display */}
                                    <div className={`text-2xl font-bold mb-2 ${timeLeft <= 2 ? 'text-red-400' : 'text-purple-300'}`}>
                                        {timeLeft.toFixed(1)}s
                                    </div>
                                    
                                    {/* Progress Ring */}
                                    <div className="relative w-24 h-24 mx-auto">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                fill="none"
                                                stroke="rgba(168, 85, 247, 0.2)"
                                                strokeWidth="2"
                                            />
                                            <motion.circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                fill="none"
                                                stroke={timeLeft <= 2 ? '#f87171' : '#c4b5fd'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeDasharray="62.83"
                                                strokeDashoffset="62.83"
                                                animate={{
                                                    strokeDashoffset: 62.83 - (62.83 * (timeLeft / 5.0)),
                                                    scale: timeLeft <= 2 ? [1, 1.05, 1] : 1
                                                }}
                                                transition={{
                                                    strokeDashoffset: { duration: 0.1, ease: "linear" },
                                                    scale: { duration: 0.5, repeat: timeLeft <= 2 ? Infinity : 0 }
                                                }}
                                            />
                                        </svg>
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
    );
}
