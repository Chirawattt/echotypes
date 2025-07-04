"use client";

import { motion } from 'framer-motion';
import { FaLightbulb } from 'react-icons/fa';

interface MeaningMatchModeProps {
    currentWordMeaning: string;
    currentWordIndex: number;
}

export default function MeaningMatchMode({ currentWordMeaning, currentWordIndex }: MeaningMatchModeProps) {
    return (
        <motion.div
            key={`${currentWordIndex}-meaning`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center text-center mb-3 max-w-4xl"
        >
            <div className="mb-3">
                <FaLightbulb className="text-3xl sm:text-4xl lg:text-5xl text-amber-400 mx-auto mb-2" />
            </div>
            <div className="mb-3">
                <p
                    className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                >
                    💡 What does this mean?
                </p>
                <p
                    className="text-amber-200 text-base sm:text-lg lg:text-xl leading-relaxed font-medium"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    &ldquo;{currentWordMeaning}&rdquo;
                </p>
            </div>
            <p
                className="text-neutral-400 text-xs sm:text-sm lg:text-base"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
                Type the English word for this meaning ✨
            </p>
        </motion.div>
    );
}
