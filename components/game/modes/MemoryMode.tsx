"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';

interface MemoryModeProps {
    currentWord: string;
    currentWordIndex: number;
    isWordVisible: boolean;
    promptText: string;
}

export default function MemoryMode({ currentWord, currentWordIndex, isWordVisible, promptText }: MemoryModeProps) {
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
