"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/gameStore';

export default function AnimatedBackground() {
    const { streakCount } = useGameStore();

    // Define background styles based on streak levels
    const getBackgroundStyle = (streak: number) => {
        if (streak >= 20) {
            // Unstoppable! - Golden/Yellow theme
            return {
                primaryColor: 'rgba(251, 191, 36, 0.08)', // yellow-300
                secondaryColor: 'rgba(245, 158, 11, 0.06)', // yellow-500
                accentColor: 'rgba(217, 119, 6, 0.04)', // yellow-600
                particleColor: 'rgba(251, 191, 36, 0.3)',
                gradientFrom: 'from-yellow-500/5',
                gradientTo: 'to-amber-600/3'
            };
        } else if (streak >= 10) {
            // In The Zone! - Orange theme
            return {
                primaryColor: 'rgba(251, 146, 60, 0.07)', // orange-400
                secondaryColor: 'rgba(249, 115, 22, 0.05)', // orange-500
                accentColor: 'rgba(234, 88, 12, 0.03)', // orange-600
                particleColor: 'rgba(251, 146, 60, 0.25)',
                gradientFrom: 'from-orange-500/4',
                gradientTo: 'to-red-500/3'
            };
        } else if (streak >= 5) {
            // On a Roll! - Red theme
            return {
                primaryColor: 'rgba(248, 113, 113, 0.06)', // red-400
                secondaryColor: 'rgba(239, 68, 68, 0.04)', // red-500
                accentColor: 'rgba(220, 38, 38, 0.03)', // red-600
                particleColor: 'rgba(248, 113, 113, 0.2)',
                gradientFrom: 'from-red-500/4',
                gradientTo: 'to-pink-500/2'
            };
        } else if (streak >= 2) {
            // Warming Up! - Purple theme
            return {
                primaryColor: 'rgba(168, 85, 247, 0.05)', // purple-500
                secondaryColor: 'rgba(147, 51, 234, 0.04)', // purple-600
                accentColor: 'rgba(126, 34, 206, 0.02)', // purple-700
                particleColor: 'rgba(168, 85, 247, 0.15)',
                gradientFrom: 'from-purple-500/3',
                gradientTo: 'to-indigo-500/2'
            };
        } else {
            // Default - Blue/Green theme
            return {
                primaryColor: 'rgba(59, 130, 246, 0.04)', // blue-500
                secondaryColor: 'rgba(34, 197, 94, 0.03)', // green-500
                accentColor: 'rgba(16, 185, 129, 0.02)', // emerald-500
                particleColor: 'rgba(59, 130, 246, 0.1)',
                gradientFrom: 'from-blue-500/2',
                gradientTo: 'to-green-500/2'
            };
        }
    };

    const style = getBackgroundStyle(streakCount);

    // Generate floating particles
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 10,
        duration: Math.random() * 20 + 15,
        x: Math.random() * 100,
        y: Math.random() * 100,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Base gradient background */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${style.gradientFrom} ${style.gradientTo} opacity-50`}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Animated geometric shapes */}
            <div className="absolute inset-0">
                {/* Large floating circles */}
                <motion.div
                    className="absolute rounded-full blur-xl"
                    style={{
                        background: `radial-gradient(circle, ${style.primaryColor} 0%, transparent 70%)`,
                        width: '300px',
                        height: '300px',
                        top: '10%',
                        left: '10%',
                    }}
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -30, 20, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute rounded-full blur-xl"
                    style={{
                        background: `radial-gradient(circle, ${style.secondaryColor} 0%, transparent 70%)`,
                        width: '250px',
                        height: '250px',
                        top: '60%',
                        right: '15%',
                    }}
                    animate={{
                        x: [0, -40, 30, 0],
                        y: [0, 40, -20, 0],
                        scale: [0.8, 1.3, 0.9, 0.8],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                />

                <motion.div
                    className="absolute rounded-full blur-2xl"
                    style={{
                        background: `radial-gradient(circle, ${style.accentColor} 0%, transparent 70%)`,
                        width: '400px',
                        height: '400px',
                        top: '30%',
                        right: '30%',
                    }}
                    animate={{
                        x: [0, 30, -50, 0],
                        y: [0, -50, 30, 0],
                        scale: [1, 0.7, 1.4, 1],
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 10
                    }}
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full blur-sm"
                        style={{
                            background: style.particleColor,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.sin(particle.id) * 20, 0],
                            opacity: [0, 0.6, 0],
                            scale: [0.5, 1.2, 0.5],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Subtle grid pattern overlay for higher streaks */}
            {streakCount >= 5 && (
                <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, ${style.particleColor} 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            )}

            {/* Special effects for very high streaks */}
            {streakCount >= 15 && (
                <div className="absolute inset-0">
                    {/* Pulsing ring effects */}
                    <motion.div
                        className="absolute rounded-full border-2 border-opacity-20"
                        style={{
                            borderColor: style.particleColor,
                            width: '200px',
                            height: '200px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                            scale: [1, 3, 1],
                            opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                    
                    <motion.div
                        className="absolute rounded-full border-2 border-opacity-15"
                        style={{
                            borderColor: style.particleColor,
                            width: '200px',
                            height: '200px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                            scale: [1, 4, 1],
                            opacity: [0.2, 0, 0.2],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 1
                        }}
                    />
                </div>
            )}

            {/* Ultra special effects for legendary streaks */}
            {streakCount >= 25 && (
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at center, ${style.primaryColor} 0%, transparent 70%)`,
                    }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </div>
    );
}
