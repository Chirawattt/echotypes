"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { IoReturnDownBack } from "react-icons/io5";
import { forwardRef } from 'react';

interface GameInputProps {
    userInput: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isWrong: boolean;
    isCorrect: boolean;
    isTransitioning: boolean;
    isDisabled: boolean;
    currentWordIndex: number;
}

const GameInput = forwardRef<HTMLInputElement, GameInputProps>(({
    userInput,
    onInputChange,
    onSubmit,
    isWrong,
    isCorrect,
    isTransitioning,
    isDisabled,
    currentWordIndex
}, ref) => {
    return (
        <form onSubmit={onSubmit} className="w-full max-w-6xl flex flex-col mt-4 items-center">
            <motion.div
                key={currentWordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full relative"
            >
                {/* Input Field */}
                <div className="relative">
                    <input
                        ref={ref}
                        type="text"
                        value={userInput}
                        onChange={onInputChange}
                        placeholder="Type your answer here..."
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        disabled={isDisabled}
                        className={`w-full bg-transparent text-center text-3xl sm:text-4xl lg:text-5xl p-5 focus:outline-none transition-all duration-300 font-bold placeholder:text-white/30 border-b-3 ${isWrong ? 'text-red-400 border-red-500' :
                            isCorrect ? 'text-green-400 border-green-500' :
                                'text-white border-white/30 focus:border-blue-400'
                            } ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                    />

                    {/* Visual Feedback Indicators */}
                    <AnimatePresence>
                        {isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                className="absolute -top-2 right-4 text-green-400 text-2xl sm:text-3xl"
                            >
                                ✓
                            </motion.div>
                        )}
                        {isWrong && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                className="absolute -top-2 right-4 text-red-400 text-2xl sm:text-3xl"
                            >
                                ✗
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                className="mt-6 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                whileTap={{ scale: isTransitioning ? 1 : 0.9 }}
                disabled={isDisabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="bg-green-400 hover:bg-green-300 text-black p-4 sm:p-6 rounded-full shadow-2xl transition-all duration-300">
                    <IoReturnDownBack className="text-3xl sm:text-4xl" />
                </div>

                {/* Button Label */}
                <span
                    className="absolute -bottom-1/2 left-1/2 transform -translate-x-1/2 text-green-300 text-sm sm:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    Submit Answer
                </span>
            </motion.button>
        </form>
    );
});

GameInput.displayName = 'GameInput';

export default GameInput;
