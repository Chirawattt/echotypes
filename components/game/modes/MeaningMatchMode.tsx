"use client";

import { motion } from 'framer-motion';
import { FaLightbulb } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

interface MeaningMatchModeProps {
    currentWordMeaning: string;
    currentWordIndex: number;
    gameStyle?: 'practice' | 'challenge';
    onTimeUp?: () => void;
    onTimeLeftChange?: (timeLeft: number) => void;
}

export default function MeaningMatchMode({ 
    currentWordMeaning, 
    currentWordIndex,
    gameStyle = 'practice',
    onTimeUp,
    onTimeLeftChange
}: MeaningMatchModeProps) {
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start timer when component mounts (for challenge mode)
    useEffect(() => {
        if (gameStyle === 'challenge') {
            setTimeLeft(5.0);
            setIsTimerActive(true);
        }
    }, [gameStyle, currentWordIndex]);

    // Timer countdown logic
    useEffect(() => {
        if (isTimerActive && gameStyle === 'challenge') {
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
    }, [isTimerActive, gameStyle, onTimeUp, onTimeLeftChange]);

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
                <p
                    className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                >
                    💡 What does this mean?
                </p>
                <p
                    className="text-amber-200 text-base sm:text-lg lg:text-xl leading-relaxed font-medium"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    &ldquo;{currentWordMeaning}&rdquo;
                </p>
            </div>
            <p
                className="text-neutral-400 text-xs sm:text-sm lg:text-base"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
                Type the English word for this meaning ✨
            </p>

            {/* Challenge Mode Timer */}
            {gameStyle === 'challenge' && isTimerActive && (
                <motion.div
                    className="mt-4 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Timer Display */}
                    <div className={`text-2xl font-bold mb-2 ${timeLeft <= 2 ? 'text-red-400' : 'text-amber-300'}`}>
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
                                stroke="rgba(251, 191, 36, 0.2)"
                                strokeWidth="2"
                            />
                            <motion.circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke={timeLeft <= 2 ? '#f87171' : '#fbbf24'}
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
    );
}
