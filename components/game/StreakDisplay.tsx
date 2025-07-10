"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/stores/gameStore';
import { FaFire } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface StreakDisplayProps {
    className?: string;
}

const getStreakLevel = (streak: number) => {
    if (streak >= 20) return 4; // 20+ streak - Unstoppable!
    if (streak >= 10) return 3; // 10-19 streak - In The Zone!
    if (streak >= 5) return 2;  // 5-9 streak - On a Roll!
    if (streak >= 2) return 1;  // 2-4 streak - Warming Up!
    return 0; // 0-1 streak
};

const getStreakConfig = (level: number) => {
    switch (level) {
        case 4: // 20+ streak - Unstoppable!
            return {
                textColor: 'text-white',
                fireColor: 'text-yellow-300',
                fireCount: 5,
                glow: 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]',
                label: '** UNSTOPPABLE! **',
                bgEffect: 'bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20',
                borderGlow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
                isLegendary: true
            };
        case 3: // 10-19 streak - In The Zone!
            return {
                textColor: 'text-orange-300',
                fireColor: 'text-orange-400',
                fireCount: 4,
                glow: 'drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]',
                label: 'IN THE ZONE!',
                bgEffect: 'bg-gradient-to-r from-orange-500/15 to-yellow-400/15',
                borderGlow: ' shadow-[0_0_20px_rgba(251,146,60,0.4)]  ',
                isLegendary: true
            };
        case 2: // 5-9 streak - On a Roll!
            return {
                textColor: 'text-red-400',
                fireColor: 'text-red-400',
                fireCount: 3,
                glow: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]',
                label: 'ON A ROLL!',
                bgEffect: '',
                borderGlow: '',
                isLegendary: false
            };
        case 1: // 2-4 streak - Warming Up!
            return {
                textColor: 'text-yellow-400',
                fireColor: 'text-yellow-400',
                fireCount: 2,
                glow: 'drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]',
                label: 'WARMING UP!',
                bgEffect: '',
                borderGlow: '',
                isLegendary: false
            };
        default:
            return {
                textColor: 'text-gray-400',
                fireColor: 'text-gray-400',
                fireCount: 0,
                glow: '',
                label: '',
                bgEffect: '',
                borderGlow: '',
                isLegendary: false
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
            }, 800);
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
            }, 800);
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
        <div className={`flex flex-col items-center justify-center ${className} mt-1`}>
            <AnimatePresence mode="wait">
                {(isVisible || shouldDisappear) && (
                    <motion.div
                        key="streak-display"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: shouldDisappear ? [1, 0.6, 0] : 1,
                            scale: shouldShake ? [1, 1.3, 1] : shouldDisappear ? [1, 0.98, 0.9] : 1,
                            rotate: shouldShake ? [0, -5, 5, -5, 0] : 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        transition={{
                            duration: shouldShake ? 0.6 : shouldDisappear ? 0.5 : 0.3,
                            ease: shouldDisappear ? "easeOut" : "easeInOut"
                        }}
                        className={`flex items-center relative px-4 py-2 rounded-xl min-w-0 ${config.bgEffect} ${config.borderGlow} ${config.isLegendary ? 'backdrop-blur-sm' : ''}`}
                       
                    >
                        {/* Legendary Background Effects for Tier 3+ */}
                        {config.isLegendary && !shouldDisappear && (
                            <>
                                {/* Animated Background Particles */}
                                <div className="absolute inset-0 overflow-hidden rounded-xl">
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={`bg-particle-${i}`}
                                            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
                                            animate={{
                                                x: [
                                                    Math.random() * 200 - 100,
                                                    Math.random() * 200 - 100,
                                                    Math.random() * 200 - 100
                                                ],
                                                y: [
                                                    Math.random() * 100 - 50,
                                                    Math.random() * 100 - 50,
                                                    Math.random() * 100 - 50
                                                ],
                                                opacity: [0, 1, 0],
                                                scale: [0, 1, 0]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "linear"
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                {/* Pulsing Border Effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-xl border "
                                    animate={{
                                        borderColor: [
                                            'rgba(251, 191, 36, 0.3)',
                                            'rgba(251, 191, 36, 0.8)',
                                            'rgba(251, 191, 36, 0.3)'
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </>
                        )}

                        {/* Fire Icons */}
                        <div className="flex space-x-1 relative z-10">
                            {[...Array(config.fireCount)].map((_, i) => (
                                <motion.div
                                    key={i}                                        animate={{
                                            scale: shouldShake 
                                                ? [1, 1.8, 1] 
                                                : shouldDisappear 
                                                    ? [1, 0.9, 0.7] 
                                                    : config.isLegendary
                                                        ? [1, 1.4, 1.2, 1.6, 1]
                                                        : [1, 1.1, 1],
                                            rotate: shouldShake 
                                                ? [0, 25, -25, 0] 
                                                : shouldDisappear 
                                                    ? [0, -2, 2] 
                                                    : config.isLegendary
                                                        ? [0, 10, -10, 15, -15, 0]
                                                        : [0, 5, -5, 0],
                                            opacity: shouldDisappear ? [1, 0.7, 0] : 1,
                                        }}
                                        transition={{
                                            duration: shouldShake 
                                                ? 0.5 
                                                : shouldDisappear 
                                                    ? 0.4 
                                                    : config.isLegendary 
                                                        ? 1.5 
                                                        : 2,
                                            repeat: shouldShake || shouldDisappear ? 0 : Infinity,
                                            delay: i * 0.1,
                                            ease: shouldDisappear ? "easeOut" : "easeInOut"
                                        }}
                                    className={`${shouldDisappear ? 'text-red-400' : config.fireColor} relative`}
                                >
                                    <FaFire className={`${config.isLegendary ? 'text-2xl' : 'text-lg'}`} />
                                    {/* Fire Glow Effect for Legendary */}
                                    {config.isLegendary && !shouldDisappear && (
                                        <motion.div
                                            className="absolute inset-0 text-yellow-300"
                                            animate={{
                                                opacity: [0, 0.5, 0]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        >
                                            <FaFire className={`${config.isLegendary ? 'text-2xl' : 'text-lg'}`} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Streak Count */}
                        <motion.div
                            animate={{
                                scale: shouldShake 
                                    ? [1, 1.6, 1] 
                                    : shouldDisappear 
                                        ? [1, 0.95, 0.8] 
                                        : config.isLegendary 
                                            ? [1, 1.1, 1.05, 1.15, 1]
                                            : 1,
                                opacity: shouldDisappear ? [1, 0.7, 0] : 1,
                            }}
                            transition={{
                                duration: shouldShake 
                                    ? 0.6 
                                    : shouldDisappear 
                                        ? 0.5 
                                        : config.isLegendary 
                                            ? 2 
                                            : 0.3,
                                repeat: config.isLegendary && !shouldShake && !shouldDisappear ? Infinity : 0,
                                ease: shouldDisappear ? "easeOut" : "easeInOut"
                            }}
                            className={`relative z-10 ${config.isLegendary ? 'text-3xl' : 'text-2xl'} font-bold ${shouldDisappear ? 'text-red-400' : config.textColor} ${shouldDisappear ? '' : config.glow}`}
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                        >
                            x{streakCount >= 2 ? streakCount : prevStreakCount}
                            
                            {/* Legendary Number Glow */}
                            {config.isLegendary && !shouldDisappear && (
                                <motion.div
                                    className="absolute inset-0 text-yellow-200"
                                    animate={{
                                        opacity: [0, 0.3, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                                >
                                    x{streakCount >= 2 ? streakCount : prevStreakCount}
                                </motion.div>
                            )}
                        </motion.div>

                       

                        {/* Special Effects for Tier 4 (Unstoppable) */}
                        {streakLevel >= 4 && !shouldDisappear && (
                            <>
                                {/* Lightning Bolts */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={`lightning-${i}`}
                                            className="absolute text-yellow-300 text-2xl"
                                            style={{
                                                top: `${Math.random() * 100}%`,
                                                left: `${Math.random() * 100}%`,
                                            }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0.5, 1.5, 0.5],
                                                rotate: [0, 180, 360]
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: Infinity,
                                                delay: i * 0.8,
                                                repeatDelay: 2
                                            }}
                                        >
                                            ⚡
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* Crown Effect */}
                                <motion.div
                                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-3xl"
                                    animate={{
                                        y: [0, -5, 0],
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    👑
                                </motion.div>
                            </>
                        )}

                        {/* Special Effects for Tier 3+ */}
                        {streakLevel >= 3 && !shouldDisappear && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                {/* Floating Stars */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={`star-${i}`}
                                        className="absolute text-yellow-200 text-lg"
                                        style={{
                                            top: `${Math.random() * 100}%`,
                                            left: `${Math.random() * 100}%`,
                                        }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0],
                                            y: [-20, -40, -60]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: i * 0.5,
                                            ease: "easeOut"
                                        }}
                                    >
                                        ✨
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Screen Edge Glow Effect for Tier 3+ */}
                        {streakLevel >= 3 && !shouldDisappear && (
                            <>
                                {/* Top Edge Glow */}
                                <motion.div
                                    className="fixed top-0 left-0 right-0 h-1 pointer-events-none z-50"
                                    style={{
                                        background: streakLevel >= 4 
                                            ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.8), rgba(255,215,0,1), rgba(251,191,36,0.8), transparent)'
                                            : 'linear-gradient(90deg, transparent, rgba(251,146,60,0.6), rgba(251,146,60,0.8), rgba(251,146,60,0.6), transparent)'
                                    }}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scaleX: [0.8, 1.2, 0.8]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                
                                {/* Bottom Edge Glow */}
                                <motion.div
                                    className="fixed bottom-0 left-0 right-0 h-1 pointer-events-none z-50"
                                    style={{
                                        background: streakLevel >= 4 
                                            ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.8), rgba(255,215,0,1), rgba(251,191,36,0.8), transparent)'
                                            : 'linear-gradient(90deg, transparent, rgba(251,146,60,0.6), rgba(251,146,60,0.8), rgba(251,146,60,0.6), transparent)'
                                    }}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scaleX: [0.8, 1.2, 0.8]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                />
                                
                                {/* Left Edge Glow */}
                                <motion.div
                                    className="fixed top-0 bottom-0 left-0 w-1 pointer-events-none z-50"
                                    style={{
                                        background: streakLevel >= 4 
                                            ? 'linear-gradient(180deg, transparent, rgba(251,191,36,0.8), rgba(255,215,0,1), rgba(251,191,36,0.8), transparent)'
                                            : 'linear-gradient(180deg, transparent, rgba(251,146,60,0.6), rgba(251,146,60,0.8), rgba(251,146,60,0.6), transparent)'
                                    }}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scaleY: [0.8, 1.2, 0.8]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }}
                                />
                                
                                {/* Right Edge Glow */}
                                <motion.div
                                    className="fixed top-0 bottom-0 right-0 w-1 pointer-events-none z-50"
                                    style={{
                                        background: streakLevel >= 4 
                                            ? 'linear-gradient(180deg, transparent, rgba(251,191,36,0.8), rgba(255,215,0,1), rgba(251,191,36,0.8), transparent)'
                                            : 'linear-gradient(180deg, transparent, rgba(251,146,60,0.6), rgba(251,146,60,0.8), rgba(251,146,60,0.6), transparent)'
                                    }}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scaleY: [0.8, 1.2, 0.8]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1.5
                                    }}
                                />

                                {/* Corner Glow Effects for Tier 4 */}
                                {streakLevel >= 4 && (
                                    <>
                                        {/* Top-Left Corner */}
                                        <motion.div
                                            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)'
                                            }}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.5, 0.8]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        
                                        {/* Top-Right Corner */}
                                        <motion.div
                                            className="fixed top-0 right-0 w-8 h-8 pointer-events-none z-50"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)'
                                            }}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.5, 0.8]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.3
                                            }}
                                        />
                                        
                                        {/* Bottom-Left Corner */}
                                        <motion.div
                                            className="fixed bottom-0 left-0 w-8 h-8 pointer-events-none z-50"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)'
                                            }}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.5, 0.8]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.6
                                            }}
                                        />
                                        
                                        {/* Bottom-Right Corner */}
                                        <motion.div
                                            className="fixed bottom-0 right-0 w-8 h-8 pointer-events-none z-50"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)'
                                            }}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.5, 0.8]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.9
                                            }}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {/* Modern Minimal Disappear Effect */}
                        {shouldDisappear && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: [0, 0.1, 0],
                                }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 bg-gray-400/10 rounded-xl"
                            />
                        )}

                        {/* Streak Label */}
                        <motion.div
                            animate={{
                                scale: shouldShake 
                                    ? [1, 1.3, 1] 
                                    : shouldDisappear 
                                        ? [1, 0.9, 0.7] 
                                        : config.isLegendary 
                                            ? [1, 1.05, 1]
                                            : 1,
                                opacity: shouldDisappear ? [1, 0.6, 0] : 0.9,
                            }}
                            transition={{
                                duration: shouldShake 
                                    ? 0.6 
                                    : shouldDisappear 
                                        ? 0.5 
                                        : config.isLegendary 
                                            ? 1.8 
                                            : 0.3,
                                repeat: config.isLegendary && !shouldShake && !shouldDisappear ? Infinity : 0,
                                ease: shouldDisappear ? "easeOut" : "easeInOut"
                            }}
                            className={`relative z-10 ${config.isLegendary ? 'text-base' : 'text-sm'} font-bold ${shouldDisappear ? 'text-red-400' : config.textColor}`}
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                        >
                            {config.label}
                            
                            {/* Legendary Label Glow */}
                            {config.isLegendary && !shouldDisappear && (
                                <motion.div
                                    className="absolute inset-0 text-yellow-200"
                                    animate={{
                                        opacity: [0, 0.4, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {config.label}
                                </motion.div>
                            )}
                        </motion.div>

                        
                    </motion.div>
                    
                )}
            </AnimatePresence>
        </div>
    );
}
