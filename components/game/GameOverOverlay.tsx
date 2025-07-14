"use client";

import { motion} from 'framer-motion';
import { useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

interface GameOverOverlayProps {
    gameStyle?: 'practice' | 'challenge';
    onAnimationComplete: () => void;
    isExiting?: boolean;
}

export default function GameOverOverlay({ onAnimationComplete, isExiting = false }: GameOverOverlayProps) {
    const { completedAudioRef, playSound } = useAudio();

    // Play completed sound when overlay mounts (only once)
    useEffect(() => {
        if (!isExiting) {
            playSound(completedAudioRef, 0.6);
        }
    }, [playSound, completedAudioRef, isExiting]);

    // Auto transition after 2.5 seconds
    useEffect(() => {
        if (!isExiting) {
            const timer = setTimeout(() => {
                onAnimationComplete();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [onAnimationComplete, isExiting]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isExiting ? 0.8 : 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ 
                background: `linear-gradient(135deg, 
                    rgba(0, 0, 0, 0.9) 0%, 
                    rgba(16, 16, 16, 0.95) 25%,
                    rgba(32, 32, 32, 0.9) 50%,
                    rgba(16, 16, 16, 0.95) 75%,
                    rgba(0, 0, 0, 0.9) 100%)`
            }}
        >
            {/* Game Over Text */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2
                }}
                className="text-center"
            >
                {/* Main Game Over Text */}
                <motion.h1
                    className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4"
                    style={{ 
                        fontFamily: "'Caveat Brush', cursive",
                        textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    GAME OVER
                </motion.h1>

                {/* Subtitle based on game style */}
                <motion.p
                    className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-6"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {`🎯 Game Over! Let\'s see how you did!`}
                </motion.p>

                {/* Animated dots to show loading */}
                <motion.div
                    className="flex justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 bg-white rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>

                {/* Continue indicator */}
                <motion.p
                    className="text-sm sm:text-base text-gray-400 mt-6"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ 
                        delay: 1.8, 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5
                    }}
                >
                    Calculating your results...
                </motion.p>
            </motion.div>

            {/* Background glow effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                style={{
                    background: `radial-gradient(circle at center, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.05) 30%, 
                        transparent 70%)`
                }}
            />
        </motion.div>
    );
}
