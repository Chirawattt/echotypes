"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GameEffectsProps {
    isCorrect: boolean;
    isWrong: boolean;
    score: number;
}

export default function GameEffects({ isCorrect, isWrong, score }: GameEffectsProps) {
    const [showAwesome, setShowAwesome] = useState(false);

    useEffect(() => {
        if (score > 0 && score % 5 === 0) {
            setShowAwesome(true);
            const timer = setTimeout(() => {
                setShowAwesome(false);
            }, 3000); // แสดงเป็นเวลา 3 วินาที

            return () => clearTimeout(timer);
        }
    }, [score]);

    return (
        <>
            {/* Floating Success/Error Particles */}
            <AnimatePresence>
                {isCorrect && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`success-${i}`}
                                initial={{
                                    opacity: 1,
                                    scale: 0,
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                                    y: typeof window !== 'undefined' ? window.innerHeight : 600
                                }}
                                animate={{
                                    opacity: 0,
                                    scale: 1.5,
                                    y: -100,
                                    rotate: 360
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2, delay: i * 0.1 }}
                                className="absolute pointer-events-none text-4xl z-50"
                            >
                                ✨
                            </motion.div>
                        ))}
                    </>
                )}
                {isWrong && (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`error-${i}`}
                                initial={{
                                    opacity: 1,
                                    scale: 0,
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                                    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300
                                }}
                                animate={{
                                    opacity: 0,
                                    scale: 1.2,
                                    y: (typeof window !== 'undefined' ? window.innerHeight / 2 : 300) + (Math.random() - 0.5) * 200,
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                                    rotate: (Math.random() - 0.5) * 180
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                className="absolute pointer-events-none text-3xl z-50"
                            >
                                💫
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Subtle Floating Words for Motivation */}
            <AnimatePresence>
                {showAwesome && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 0.1, y: -50, scale: 4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                    >
                        <div
                            className="text-3xl sm:text-4xl font-medium bg-gradient-to-r from-yellow-400/80 to-orange-500/80 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                        >
                            Awesome! 🎉
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
