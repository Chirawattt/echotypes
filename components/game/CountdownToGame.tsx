"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/stores/gameStore';

interface CountdownToGameProps {
    className?: string;
}

export default function CountdownToGame({ className = '' }: CountdownToGameProps) {

    const { countdown } = useGameStore();

    return (
        <main className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white p-4 overflow-hidden relative ${className}`} style={{ fontFamily: "'Caveat Brush', cursive" }}>
            {/* Animated Background for Countdown */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-xl"
                />
            </div>

            {/* Compact Countdown Display */}
            <div className="relative flex items-center justify-center mb-6" style={{ height: '200px' }}>
                <AnimatePresence>
                    <motion.div
                        key={countdown}
                        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotateY: -90, position: 'absolute' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute text-[120px] sm:text-[150px] lg:text-[180px] font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl"
                    >
                        {countdown}
                    </motion.div>
                </AnimatePresence>

                {/* Pulsing Ring Effect */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute w-64 h-64 border-4 border-white/20 rounded-full"
                />
            </div>

            {/* Compact Game Start Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
            >
                <div className="text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent font-bold mb-3">
                    Get Ready! 🚀
                </div>
                <div className="text-lg sm:text-xl text-blue-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    The game is starting soon...
                </div>
            </motion.div>
        </main>
    )
}

