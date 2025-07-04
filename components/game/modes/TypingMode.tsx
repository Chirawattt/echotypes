"use client";

import { motion } from 'framer-motion';
import { FaKeyboard } from 'react-icons/fa';

interface TypingModeProps {
    currentWord: string;
    currentWordIndex: number;
}

export default function TypingMode({ currentWord, currentWordIndex }: TypingModeProps) {
    return (
        <motion.div
            key={`${currentWordIndex}-typing`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-3 max-w-4xl"
        >
            <div className="mb-3">
                <FaKeyboard className="text-3xl sm:text-4xl lg:text-5xl text-green-400 mx-auto mb-2" />
            </div>
            <div className="mb-3">
                <p
                    className="text-green-300 text-sm sm:text-base lg:text-lg mb-2 font-medium"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    ⚡ Type as fast as you can!
                </p>
                <p
                    className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                >
                    {currentWord}
                </p>
            </div>
            <p
                className="text-neutral-400 text-xs sm:text-sm lg:text-base"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
                Speed and accuracy matter! 🏃‍♂️💨
            </p>
        </motion.div>
    );
}
