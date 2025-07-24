"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

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
    const { isMobile } = useDeviceDetection();

    return (
        <form onSubmit={onSubmit} className="w-full max-w-6xl flex flex-col mt-2 items-center mb-5">
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
                        readOnly={isMobile} // Prevent native keyboard on mobile
                        className={`w-full bg-transparent text-center text-3xl sm:text-4xl lg:text-5xl p-5 focus:outline-none transition-all duration-300 font-bold placeholder:text-white/30 border-b-3 mb-10 ${isWrong ? 'text-red-400 border-red-500' :
                            isCorrect ? 'text-green-400 border-green-500' :
                                'text-white border-white/30 focus:border-blue-400'
                            } ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
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

            {/* Desktop Hint - Only show on Desktop */}
            {!isMobile && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-4 text-center"
                >
                    <p
                        className="text-white/60 text-sm sm:text-base font-medium"
                                            >
                        💡 Press <kbd className="px-2 py-1 bg-white/10 rounded-md text-white/80 font-mono text-sm">Enter</kbd> to submit your answer
                    </p>
                </motion.div>
            )}
        </form>
    );
});

GameInput.displayName = 'GameInput';

export default GameInput;
