"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/stores/gameStore';
import { FaFire } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface StreakDisplayProps {
    className?: string;
}

const getStreakLevel = (streak: number) => {
    if (streak >= 10) return 3; // 10+ streak
    if (streak >= 5) return 2;  // 5-9 streak
    if (streak >= 2) return 1;  // 2-4 streak
    return 0; // 0-1 streak
};

const getStreakConfig = (level: number) => {
    switch (level) {
        case 3: // 10+ streak - Legendary
            return {
                textColor: 'text-orange-400',
                fireColor: 'text-orange-400',
                fireCount: 3,
                glow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
            };
        case 2: // 5-9 streak - Hot
            return {
                textColor: 'text-red-400',
                fireColor: 'text-red-400',
                fireCount: 2,
                glow: 'drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]'
            };
        case 1: // 2-4 streak - Warming up
            return {
                textColor: 'text-yellow-400',
                fireColor: 'text-yellow-400',
                fireCount: 1,
                glow: 'drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
            };
        default:
            return {
                textColor: 'text-gray-400',
                fireColor: 'text-gray-400',
                fireCount: 0,
                glow: ''
            };
    }
};

export default function StreakDisplay({ className = '' }: StreakDisplayProps) {
    const { streakCount } = useGameStore();
    const [prevStreakCount, setPrevStreakCount] = useState(streakCount);
    const [shouldShake, setShouldShake] = useState(false);
    const [shouldDisappear, setShouldDisappear] = useState(false);
    const [isVisible, setIsVisible] = useState(streakCount >= 2);

    const streakLevel = getStreakLevel(streakCount >= 2 ? streakCount : prevStreakCount);
    const config = getStreakConfig(streakLevel);

    // Trigger animations based on streak changes
    useEffect(() => {

        // Only proceed if streak actually changed
        if (streakCount === prevStreakCount) {
            return;
        }

        let cleanup: (() => void) | undefined;

        if (streakCount > prevStreakCount && streakCount >= 2) {
            // Streak increased - show shake animation
            setShouldShake(true);
            setIsVisible(true);
            setShouldDisappear(false);
            // Update prevStreakCount immediately after handling increase
            setPrevStreakCount(streakCount);
            const timer = setTimeout(() => setShouldShake(false), 600);
            cleanup = () => clearTimeout(timer);
        }
        else if (prevStreakCount >= 2 && streakCount === 0) {
            // Streak reset to 0 - show disappear animation
            setShouldDisappear(true);
            setShouldShake(false);
            const timer = setTimeout(() => {
                setShouldDisappear(false);
                setIsVisible(false);
                setPrevStreakCount(streakCount);
            }, 1500);
            cleanup = () => clearTimeout(timer);
        }
        else if (prevStreakCount >= 2 && streakCount < 2) {
            // Streak decreased below 2 - show disappear animation
            setShouldDisappear(true);
            setShouldShake(false);
            const timer = setTimeout(() => {
                setShouldDisappear(false);
                setIsVisible(false);
                setPrevStreakCount(streakCount);
            }, 1500);
            cleanup = () => clearTimeout(timer);
        }
        else if (streakCount >= 2 && !isVisible) {
            // Show streak display if it should be visible
            setIsVisible(true);
            setShouldDisappear(false);
            setPrevStreakCount(streakCount);
        }
        else {
            // For all other cases, just update prevStreakCount
            setPrevStreakCount(streakCount);
        }

        return cleanup;
    }, [streakCount, prevStreakCount, isVisible, shouldDisappear]);

    // Don't render if not visible and not disappearing
    if (!isVisible && !shouldDisappear) {
        return null;
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                {(isVisible || shouldDisappear) && (
                    <motion.div
                        key="streak-display"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: shouldDisappear ? [1, 1, 0.8, 0.5, 0] : 1,
                            scale: shouldShake ? [1, 1.3, 1] : shouldDisappear ? [1, 1.2, 0.8, 0.3, 0] : 1,
                            rotate: shouldShake ? [0, -5, 5, -5, 0] : shouldDisappear ? [0, -15, 15, -30, 30, -15, 0] : 0,
                            y: shouldDisappear ? [0, -15, 15, -10, 10, 0] : 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                            rotate: 15,
                            y: -20,
                            transition: { duration: 0.3, ease: "easeInOut" }
                        }}
                        transition={{
                            duration: shouldShake ? 0.6 : shouldDisappear ? 1.5 : 0.3,
                            ease: "easeInOut"
                        }}
                        className="flex items-center space-x-2 relative"
                    >
                        {/* Fire Icons */}
                        <div className="flex space-x-1">
                            {[...Array(config.fireCount)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: shouldShake ? [1, 1.5, 1] : shouldDisappear ? [1, 1.2, 0.8, 0.3, 0] : [1, 1.1, 1],
                                        rotate: shouldShake ? [0, 25, -25, 0] : shouldDisappear ? [0, 60, -60, 120, -120, 180] : [0, 5, -5, 0],
                                        opacity: shouldDisappear ? [1, 1, 0.6, 0.2, 0] : 1,
                                    }}
                                    transition={{
                                        duration: shouldShake ? 0.5 : shouldDisappear ? 1.2 : 2,
                                        repeat: shouldShake || shouldDisappear ? 0 : Infinity,
                                        delay: i * 0.1,
                                        ease: "easeInOut"
                                    }}
                                    className={shouldDisappear ? 'text-red-400' : config.fireColor}
                                >
                                    <FaFire className="text-lg" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Streak Count */}
                        <motion.div
                            animate={{
                                scale: shouldShake ? [1, 1.4, 1] : shouldDisappear ? [1, 1.1, 0.7, 0] : 1,
                                opacity: shouldDisappear ? [1, 0.8, 0.3, 0] : 1,
                            }}
                            transition={{
                                duration: shouldShake ? 0.6 : shouldDisappear ? 1.0 : 0.3,
                                ease: "easeInOut"
                            }}
                            className={`text-2xl font-bold ${shouldDisappear ? 'text-red-400' : config.textColor} ${shouldDisappear ? '' : config.glow}`}
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                        >
                            {streakCount >= 2 ? streakCount : prevStreakCount}
                        </motion.div>

                        {/* Streak Label */}
                        <motion.div
                            animate={{
                                scale: shouldShake ? [1, 1.2, 1] : shouldDisappear ? [1, 1.0, 0.8, 0] : 1,
                                opacity: shouldDisappear ? [1, 0.8, 0.3, 0] : 0.8,
                            }}
                            transition={{
                                duration: shouldShake ? 0.6 : shouldDisappear ? 1.0 : 0.3,
                                ease: "easeInOut"
                            }}
                            className={`text-sm font-medium ${shouldDisappear ? 'text-red-400' : config.textColor}`}
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                        >
                            STREAK
                        </motion.div>

                        {/* Disappear Effect Particles */}
                        {shouldDisappear && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={`disappear-${i}`}
                                        initial={{
                                            x: 0,
                                            y: 0,
                                            opacity: 1,
                                            scale: 1
                                        }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 120,
                                            y: (Math.random() - 0.5) * 120,
                                            opacity: 0,
                                            scale: [1, 1.5, 0],
                                            rotate: 360
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            delay: i * 0.1,
                                            ease: "easeOut"
                                        }}
                                        className="absolute text-red-400 text-lg"
                                    >
                                        {i % 3 === 0 ? '💔' : i % 3 === 1 ? '😢' : '✨'}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Extra dramatic effect for disappearing */}
                        {shouldDisappear && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: [0, 0.8, 0],
                                    scale: [0.5, 2, 3],
                                }}
                                transition={{
                                    duration: 1.0,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="text-3xl">💥</div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
