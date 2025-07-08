"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/stores/gameStore';
import { FaFire, FaStar, FaTrophy } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface StreakCelebrationProps {
    className?: string;
}

export default function StreakCelebration({ className = '' }: StreakCelebrationProps) {
    const { streakCount } = useGameStore();
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationType, setCelebrationType] = useState<'small' | 'medium' | 'large'>('small');

    useEffect(() => {
        // Hide celebration immediately if streak is reset to 0
        if (streakCount === 0) {
            setShowCelebration(false);
            return;
        }

        // Trigger celebration for milestone streaks
        if (streakCount === 2 || streakCount === 5 || streakCount === 10 || (streakCount > 10 && streakCount % 5 === 0)) {
            if (streakCount >= 10) {
                setCelebrationType('large');
            } else if (streakCount >= 5) {
                setCelebrationType('medium');
            } else {
                setCelebrationType('small');
            }

            setShowCelebration(true);

            // Auto-hide after animation
            const timer = setTimeout(() => {
                setShowCelebration(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [streakCount]);

    const getCelebrationConfig = () => {
        switch (celebrationType) {
            case 'large':
                return {
                    title: '🏆 LEGENDARY! 🏆',
                    subtitle: `${streakCount} streak!`,
                    icon: FaTrophy,
                    textColor: 'text-orange-300',
                    iconColor: 'text-orange-400',
                    particles: 8
                };
            case 'medium':
                return {
                    title: '🔥 HOT STREAK! 🔥',
                    subtitle: `${streakCount} in a row!`,
                    icon: FaFire,
                    textColor: 'text-red-300',
                    iconColor: 'text-red-400',
                    particles: 6
                };
            default:
                return {
                    title: '⚡ STREAK! ⚡',
                    subtitle: `${streakCount} correct!`,
                    icon: FaStar,
                    textColor: 'text-yellow-300',
                    iconColor: 'text-yellow-400',
                    particles: 4
                };
        }
    };

    if (!showCelebration) return null;

    const config = getCelebrationConfig();
    const IconComponent = config.icon;

    return (
        <div className={`absolute -top-5 left-0 z-50 pointer-events-none ${className}`}>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: -50 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        rotate: [0, 5, -5, 0]
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.5,
                        x: -50,
                        transition: { duration: 1 }
                    }}
                    transition={{
                        duration: 1,
                        rotate: {
                            duration: 0.4,
                            repeat: 1,
                            ease: "easeInOut"
                        }
                    }}
                    className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20"
                >
                    {/* Icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 15, -15, 0]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: 1,
                            ease: "easeInOut"
                        }}
                        className="text-center mb-2"
                    >
                        <IconComponent className={`text-3xl ${config.iconColor} mx-auto`} />
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                        className="text-center mb-1"
                    >
                        <h1 className={`text-lg font-bold ${config.textColor}`} style={{ fontFamily: "'Caveat Brush', cursive" }}>
                            {config.title}
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <div className="text-center">
                        <p className="text-white/80 text-sm font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {config.subtitle}
                        </p>
                    </div>

                    {/* Mini Particles */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                        {[...Array(config.particles)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * 100,
                                    y: 100,
                                    opacity: 0,
                                    scale: 0
                                }}
                                animate={{
                                    y: [100, -50],
                                    x: [
                                        Math.random() * 100,
                                        Math.random() * 100 + (Math.random() - 0.5) * 50
                                    ],
                                    opacity: [0, 0.8, 0],
                                    scale: [0, 0.8, 0],
                                    rotate: [0, 180]
                                }}
                                transition={{
                                    duration: Math.random() * 1.5 + 1,
                                    delay: Math.random() * 0.5,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                            >
                                {i % 2 === 0 ? (
                                    <div className={`w-1.5 h-1.5 ${config.iconColor.replace('text-', 'bg-')} rounded-full`} />
                                ) : (
                                    <div className="text-xs">✨</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
